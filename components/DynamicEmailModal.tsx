"use client";

import { useEffect, useState, useCallback } from "react";
import "@/app/email-modal.css";
import Lines from "@/components/HeadingLines";

export interface EmailModalPayload {
  email: string;
  subject?: string;
  body?: string;
  label?: string;
}

/** Global helper to trigger the Dynamic Email modal from any component */
export function openDynamicEmailModal(payload: EmailModalPayload) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("quickupp:open-email-modal", { detail: payload })
    );
  }
}

function parseMailto(href: string): { to: string; subject: string; body: string } {
  try {
    const raw = href.replace(/^mailto:/i, "");
    const [toPart, queryPart] = raw.split("?");
    const to = decodeURIComponent(toPart || "").trim();
    const params = new URLSearchParams(queryPart || "");
    return {
      to,
      subject: params.get("subject") || "",
      body: params.get("body") || "",
    };
  } catch {
    return { to: href.replace(/^mailto:/i, "").trim(), subject: "", body: "" };
  }
}

export default function DynamicEmailModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<EmailModalPayload>({
    email: "info@quickuppsoftech.us",
    subject: "",
    body: "",
    label: "",
  });
  const [copied, setCopied] = useState(false);

  const handleOpen = useCallback((payload: EmailModalPayload) => {
    setData({
      email: payload.email || "info@quickuppsoftech.us",
      subject: payload.subject || "",
      body: payload.body || "",
      label: payload.label || "",
    });
    setCopied(false);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Listen for custom trigger and globally intercept mailto: clicks
  useEffect(() => {
    const onCustomEvent = (e: Event) => {
      const ce = e as CustomEvent<EmailModalPayload>;
      if (ce.detail) {
        handleOpen(ce.detail);
      }
    };

    const onDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a[href^="mailto:"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      
      // Allow modifier clicks (Ctrl/Cmd/Shift/Alt) to perform browser defaults
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      
      e.preventDefault();
      const href = anchor.getAttribute("href") || "";
      const parsed = parseMailto(href);
      const label =
        anchor.getAttribute("data-email-label") ||
        anchor.getAttribute("title") ||
        anchor.getAttribute("aria-label") ||
        "";

      handleOpen({
        email: parsed.to,
        subject: parsed.subject,
        body: parsed.body,
        label,
      });
    };

    window.addEventListener("quickupp:open-email-modal", onCustomEvent);
    document.addEventListener("click", onDocumentClick, true);

    return () => {
      window.removeEventListener("quickupp:open-email-modal", onCustomEvent);
      document.removeEventListener("click", onDocumentClick, true);
    };
  }, [handleOpen]);

  // Handle escape key and lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const { email, subject, body, label } = data;

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    email
  )}${subject ? `&su=${encodeURIComponent(subject)}` : ""}${
    body ? `&body=${encodeURIComponent(body)}` : ""
  }`;

  const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(
    email
  )}${subject ? `&subject=${encodeURIComponent(subject)}` : ""}${
    body ? `&body=${encodeURIComponent(body)}` : ""
  }`;

  const yahooUrl = `https://compose.mail.yahoo.com/?to=${encodeURIComponent(
    email
  )}${subject ? `&subject=${encodeURIComponent(subject)}` : ""}${
    body ? `&body=${encodeURIComponent(body)}` : ""
  }`;

  const defaultMailto = `mailto:${email}${
    subject || body
      ? `?${new URLSearchParams({
          ...(subject ? { subject } : {}),
          ...(body ? { body } : {}),
        }).toString()}`
      : ""
  }`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = email;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenClient = (url: string, isDefault = false) => {
    if (isDefault) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    handleClose();
  };

  return (
    <div
      className="em-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="em-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="em-modal">
        {/* Header */}
        <div className="em-header">
          <div className="em-header-main">
            <div className="em-icon-badge" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div className="em-title-wrap">
              <h2 id="em-modal-title" className="em-title"><Lines>
                Send an Email
              </Lines></h2>
              <p className="em-subtitle">Quickupp Softech Client Support &amp; Inquiries</p>
            </div>
          </div>
          <button
            type="button"
            className="em-close-btn"
            onClick={handleClose}
            aria-label="Close email options"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="em-body">
          {/* Target Recipient Card */}
          <div className="em-target-box">
            <div className="em-target-meta">
              <span className="em-target-tag">{label || "Direct Recipient"}</span>
              <span className="em-target-email" title={email}>{email}</span>
            </div>
            <button
              type="button"
              className={`em-copy-btn${copied ? " is-copied" : ""}`}
              onClick={handleCopy}
              aria-label="Copy email address"
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="em-section-label">Choose how to compose</div>

          {/* Options */}
          <div className="em-options">
            {/* 1. Gmail */}
            <button
              type="button"
              className="em-option-btn"
              onClick={() => handleOpenClient(gmailUrl)}
            >
              <div className="em-option-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2l10 7 10-7z"/>
                  <path fill="#34A853" d="M2 6v12c0 1.1.9 2 2 2h4V10.5L2 6z"/>
                  <path fill="#FBBC05" d="M16 20h4c1.1 0 2-.9 2-2V6l-6 4.5V20z"/>
                  <path fill="#EA4335" d="M4 4h16c1.1 0 2 .9 2 2v.5L12 13 2 6.5V6c0-1.1.9-2 2-2z"/>
                </svg>
              </div>
              <div className="em-option-info">
                <div className="em-option-top">
                  <span className="em-option-name">Gmail (Web)</span>
                  <span className="em-badge-rec">Recommended</span>
                </div>
                <span className="em-option-desc">Open compose in a new browser tab</span>
              </div>
              <svg className="em-option-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7M8 7h9v9" />
              </svg>
            </button>

            {/* 2. Microsoft Outlook */}
            <button
              type="button"
              className="em-option-btn"
              onClick={() => handleOpenClient(outlookUrl)}
            >
              <div className="em-option-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="2" fill="#0078D4"/>
                  <path d="M12 13.5L3.5 7.5h17L12 13.5z" fill="#ffffff" opacity="0.9"/>
                  <circle cx="12" cy="12" r="4.5" fill="#005A9E"/>
                  <text x="12" y="15" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">O</text>
                </svg>
              </div>
              <div className="em-option-info">
                <div className="em-option-top">
                  <span className="em-option-name">Outlook / Hotmail</span>
                </div>
                <span className="em-option-desc">Microsoft 365 or Outlook.com</span>
              </div>
              <svg className="em-option-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7M8 7h9v9" />
              </svg>
            </button>

            {/* 3. Yahoo Mail */}
            <button
              type="button"
              className="em-option-btn"
              onClick={() => handleOpenClient(yahooUrl)}
            >
              <div className="em-option-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="3" fill="#6001D2"/>
                  <text x="12" y="16" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">Y!</text>
                </svg>
              </div>
              <div className="em-option-info">
                <div className="em-option-top">
                  <span className="em-option-name">Yahoo Mail</span>
                </div>
                <span className="em-option-desc">Open compose in Yahoo Webmail</span>
              </div>
              <svg className="em-option-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7M8 7h9v9" />
              </svg>
            </button>

            {/* 4. Default System Mail Client */}
            <button
              type="button"
              className="em-option-btn"
              onClick={() => handleOpenClient(defaultMailto, true)}
            >
              <div className="em-option-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <div className="em-option-info">
                <div className="em-option-top">
                  <span className="em-option-name">Default Email App</span>
                </div>
                <span className="em-option-desc">Apple Mail, Windows Mail, Thunderbird, etc.</span>
              </div>
              <svg className="em-option-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <p className="em-footer-note">
            Pre-fills recipient, subject, and opens in a new browser tab or mail application.
          </p>
        </div>
      </div>
    </div>
  );
}

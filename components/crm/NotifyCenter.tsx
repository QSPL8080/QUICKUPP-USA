"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { NotifyItem, Notifications } from "@/lib/crm/notifications";
import { useFeedback } from "@/components/crm/Feedback";

/* Format date matching Image 2: "16 Oct 2026, 02:43 pm" */
const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).toLowerCase();
  return `${day} ${month} ${year}, ${time}`;
};

/* Play native Web Audio chime alert */
function playChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.1); // A5
    gain2.gain.setValueAtTime(0.16, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.55);
  } catch {
    // Autoplay policy or audio context disabled
  }
}

const sendApi = (body: object) =>
  fetch("/api/crm/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);

export default function NotifyCenter({
  data,
  user,
}: {
  data: Notifications;
  user?: { name: string; email: string; role?: string };
}) {
  const router = useRouter();
  const { confirm, toast } = useFeedback();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotifyItem[]>(data.items);
  const [unreadCount, setUnreadCount] = useState<number>(data.unread);
  const [asOf, setAsOf] = useState<string>(data.asOf);

  // Auto-refresh countdown (5 seconds)
  const [countdown, setCountdown] = useState<number>(5);
  const [syncing, setSyncing] = useState<boolean>(false);

  // Sound toggle (stored in localStorage)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Bottom-right floating toasts (Image 1)
  const [toasts, setToasts] = useState<NotifyItem[]>([]);

  // Track known notification keys so we only chime and toast on NEW arrivals
  const knownKeysRef = useRef<Set<string>>(new Set(data.items.map((i) => i.key)));
  const initialMountRef = useRef<boolean>(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load sound setting from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("qs_crm_sound_enabled");
      if (stored !== null) setSoundEnabled(stored === "1");
    } catch {}
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("qs_crm_sound_enabled", next ? "1" : "0");
      } catch {}
      toast(next ? "Notification sound enabled" : "Notification sound muted");
      if (next) playChime();
      return next;
    });
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  // Dismiss toast
  const dismissToast = useCallback((key: string) => {
    setToasts((prev) => prev.filter((t) => t.key !== key));
  }, []);

  // Sync / refresh logic
  const syncNow = useCallback(async () => {
    setSyncing(true);
    setCountdown(5);

    try {
      const res = await fetch("/api/crm/notifications", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.ok && Array.isArray(json.items)) {
          const freshItems: NotifyItem[] = json.items;
          const freshUnread: number = Number(json.unread || 0);

          setAsOf(json.asOf || "");
          setItems(freshItems);
          setUnreadCount(freshUnread);

          // Detect brand new notifications not previously in knownKeysRef
          const newArrivals = freshItems.filter((it) => it.unread && !knownKeysRef.current.has(it.key));

          if (newArrivals.length > 0 && !initialMountRef.current) {
            // Trigger audio alert if sound is enabled
            if (soundEnabled) {
              playChime();
            }

            // Push newest arrivals into the bottom-right toast queue (Image 1)
            setToasts((prev) => {
              const existingKeys = new Set(prev.map((p) => p.key));
              const additions = newArrivals.filter((a) => !existingKeys.has(a.key));
              return [...additions, ...prev].slice(0, 3); // Max 3 toasts at once
            });

            // Auto dismiss toast after 8 seconds
            newArrivals.forEach((arr) => {
              setTimeout(() => {
                dismissToast(arr.key);
              }, 8000);
            });
          }

          // Update knownKeys
          freshItems.forEach((it) => knownKeysRef.current.add(it.key));
        }
      }
    } catch {
      // Ignore network hiccup
    } finally {
      // Auto refresh the page router so enquiries list / payments / tables stay updated
      // Only refresh if user is not actively typing in an input/textarea or has an edit modal open
      const isTyping =
        typeof document !== "undefined" &&
        document.activeElement &&
        ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
      const isModalOpen =
        typeof document !== "undefined" &&
        Boolean(document.querySelector(".crm-modal-wrap, .crm-form-modal"));

      if (!isTyping && !isModalOpen) {
        router.refresh();
      }

      setSyncing(false);
      initialMountRef.current = false;
    }
  }, [dismissToast, router, soundEnabled]);

  // 5-second countdown timer for auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          syncNow();
          return 5;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [syncNow]);

  // Sync on tab focus / visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncNow();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [syncNow]);

  // Mark all read
  const readAll = () => {
    if (!items.some((i) => i.unread)) return;
    setItems((list) => list.map((i) => ({ ...i, unread: false })));
    setUnreadCount(0);
    setToasts([]);
    void sendApi({ action: "read-all", asOf });
  };

  // Mark one read
  const readOne = (key: string) => {
    setItems((list) => list.map((i) => (i.key === key ? { ...i, unread: false } : i)));
    setUnreadCount((c) => Math.max(0, c - 1));
    dismissToast(key);
    void sendApi({ action: "read", key });
  };

  // Clear all
  const clear = async () => {
    if (!items.length) return;
    const ok = await confirm({
      title: "Clear all notifications?",
      message: "The list will be emptied. Only new leads, payments and job applications that arrive after this will show up.",
      confirmLabel: "Clear all",
      tone: "default",
    });
    if (!ok) return;
    setItems([]);
    setUnreadCount(0);
    setToasts([]);
    await sendApi({ action: "clear", asOf });
    toast("Notifications cleared");
  };

  // Click on a notification or toast
  const go = (it: NotifyItem) => {
    if (it.unread) readOne(it.key);
    dismissToast(it.key);
    setOpen(false);
    router.push(it.href);
  };

  const initial = user?.name ? user.name.slice(0, 1).toUpperCase() : "S";

  return (
    <>
      {/* Top action cluster matching Image 2 */}
      <div className="crm-top-actions" ref={dropdownRef}>
        {/* Live sync pill with countdown */}
        <button
          type="button"
          className="crm-live-pill"
          onClick={syncNow}
          title="Click to sync immediately with server"
          aria-label="Live sync indicator"
        >
          <span className="crm-live-dot" aria-hidden="true" />
          <span>{syncing ? "Live • syncing..." : `Live • sync in ${countdown}s`}</span>
        </button>

        {/* Manual Refresh button */}
        <button
          type="button"
          className={`crm-circle-btn${syncing ? " is-spinning" : ""}`}
          onClick={syncNow}
          title="Refresh CRM now"
          aria-label="Refresh CRM now"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
          </svg>
        </button>

        {/* Sound toggle button */}
        <button
          type="button"
          className="crm-circle-btn"
          onClick={toggleSound}
          title={soundEnabled ? "Mute alert sounds" : "Enable alert sounds"}
          aria-label="Alert sounds"
        >
          {soundEnabled ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>

        {/* Notification Bell Button */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className={`crm-circle-btn crm-bell-btn${unreadCount ? " has-new" : ""}`}
            onClick={() => setOpen((o) => !o)}
            aria-label={unreadCount ? `${unreadCount} unread notifications` : "Notifications"}
            aria-expanded={open}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && <span className="crm-bell-count">{unreadCount > 99 ? "99+" : unreadCount}</span>}
          </button>

          {/* Notifications Dropdown matching Image 2 */}
          {open && (
            <div className="crm-notify-dropdown" role="dialog" aria-label="Notifications">
              <div className="crm-notify-dropdown-head">
                <div>
                  <h3 className="crm-notify-title">Notifications</h3>
                  <span className="crm-notify-sub">
                    {unreadCount ? `${unreadCount} unread` : items.length ? "All caught up" : "Nothing new"}
                  </span>
                </div>
                <div className="crm-notify-actions">
                  {unreadCount > 0 && (
                    <button type="button" className="crm-notify-tool-btn" onClick={readAll}>
                      Mark all as read
                    </button>
                  )}
                  {items.length > 0 && (
                    <button type="button" className="crm-notify-tool-btn is-danger" onClick={clear}>
                      Clear all
                    </button>
                  )}
                  <button type="button" className="crm-notify-close-btn" onClick={() => setOpen(false)} aria-label="Close notifications">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="crm-notify-dropdown-body">
                {items.length > 0 ? (
                  items.map((it) => (
                    <div
                      key={it.key}
                      className={`crm-notify-card${it.unread ? " is-unread" : ""}`}
                      onClick={() => go(it)}
                      role="button"
                      tabIndex={0}
                    >
                      {/* Left icon squircle in soft purple */}
                      <div className="crm-notify-card-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {it.kind === "payment" ? (
                            <>
                              <rect x="2" y="5" width="20" height="14" rx="2" />
                              <line x1="2" y1="10" x2="22" y2="10" />
                            </>
                          ) : it.kind === "application" ? (
                            <>
                              <rect x="2" y="7" width="20" height="14" rx="2" />
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </>
                          ) : (
                            <>
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </>
                          )}
                        </svg>
                      </div>

                      {/* Content */}
                      <div className="crm-notify-card-text">
                        <div className="crm-notify-card-title">{it.title}</div>
                        <div className="crm-notify-card-sub">{it.sub}</div>
                        <div className="crm-notify-card-date">{formatDate(it.at)}</div>
                      </div>

                      {/* Right unread dot */}
                      {it.unread && <span className="crm-notify-unread-dot" aria-label="Unread" />}
                    </div>
                  ))
                ) : (
                  <div className="crm-notify-dropdown-empty">
                    <p className="crm-strong" style={{ margin: 0, fontSize: "14px" }}>No notifications</p>
                    <p className="crm-muted" style={{ margin: "4px 0 0", fontSize: "12.5px" }}>
                      New leads, payments and job applications will show up here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile avatar circle matching Image 2 */}
        <Link href="/crm/profile" className="crm-top-avatar" title={`Signed in as ${user?.name || "Admin"}`}>
          {initial}
        </Link>
      </div>

      {/* Floating Bottom-Right Toast Stack matching Image 1 */}
      {toasts.length > 0 && (
        <div className="crm-toast-stack" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.key} className="crm-toast-card" role="alert">
              {/* Left purple circular icon badge */}
              <div className="crm-toast-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>

              {/* Toast info */}
              <div className="crm-toast-content">
                <span className="crm-toast-tag">
                  {t.categoryLabel || (t.kind === "lead" ? "NEW WEBSITE ORDER" : t.kind === "payment" ? "PAYMENT RECEIVED" : "NEW APPLICATION")}
                </span>
                <strong className="crm-toast-title">{t.title}</strong>
                <p className="crm-toast-sub">{t.sub}</p>
                <button type="button" className="crm-toast-link" onClick={() => go(t)}>
                  View details &rarr;
                </button>
              </div>

              {/* Top-right close 'x' */}
              <button
                type="button"
                className="crm-toast-close"
                onClick={() => dismissToast(t.key)}
                aria-label="Dismiss notification"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

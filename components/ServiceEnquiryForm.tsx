"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BUDGETS, INDUSTRIES, SERVICE_FORMS, type ServiceFormKey } from "@/lib/formOptions";

/*
 * Enquiry form shown on every subpage of a service. Same fields and look as
 * the Contact page form. "Service" is fixed to the service this page belongs
 * to; "Category" lists that service's subpages (the current one is
 * pre-selected). For another service, visitors use that service's pages.
 * Submissions go to /api/service-enquiry and are saved in the service's own
 * table (the category goes in service_interest).
 */

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  industry: "",
  otherIndustry: "",
  serviceInterest: "",
  budget: "",
  message: "",
  agreed: false,
};

export default function ServiceEnquiryForm({ service, current }: { service: ServiceFormKey; current?: string }) {
  const form = SERVICE_FORMS[service];
  const options: readonly string[] = form.options;
  const preset = current && options.includes(current) ? current : "";
  const idp = `sef-${service}`;

  const [formData, setFormData] = useState({ ...EMPTY, serviceInterest: preset });
  const [website, setWebsite] = useState(""); // hidden spam trap
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [agreedError, setAgreedError] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = (patch: Partial<typeof EMPTY>) => setFormData((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreed) {
      setAgreedError(true);
      return;
    }
    setAgreedError(false);
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/service-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          service,
          sourcePage: current || null,
          website,
          pageUrl: window.location.href,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        const firstError = json.errors ? Object.values(json.errors)[0] : json.error;
        setSubmitError(String(firstError || "We couldn't send your inquiry right now. Please try again."));
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError("We couldn't send your inquiry right now. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="sef-section" id="enquiry">
      <div className="sef-container">
        <h2 className="sef-heading">
          Talk to Us About <span className="qs-gradient-text">{current || form.label}</span>
        </h2>
        <div className="su-contact-form-container">
          {submitted ? (
            <div className="su-success-box">
              <div className="su-success-icon">✓</div>
              <h3 className="sef-success-title">Thank You! Your Inquiry Has Been Received.</h3>
              <p className="sef-success-text">
                We appreciate you reaching out, <strong>{formData.fullName || "friend"}</strong>. Our strategy team will review
                your project details and get back to you at <strong>{formData.email}</strong> within 24 hours.
              </p>
              <button
                type="button"
                className="su-submit-btn"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ ...EMPTY, serviceInterest: preset });
                }}
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="su-contact-form" noValidate={false}>
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="sef-trap"
              />

              <div className="su-form-top">
                <h2 className="su-inquiry-title">Send Your Inquiry!</h2>
                <p className="su-inquiry-para">Share your project details, and we’ll get back to you within 24 hours.</p>
              </div>

              <div className="sef-row">
                <div className="su-field-group">
                  <label htmlFor={`${idp}-name`} className="su-field-label">
                    Full name
                  </label>
                  <input
                    id={`${idp}-name`}
                    type="text"
                    required
                    placeholder="Full Name"
                    className="su-text-input"
                    value={formData.fullName}
                    onChange={(e) => set({ fullName: e.target.value })}
                  />
                </div>
                <div className="su-field-group">
                  <label htmlFor={`${idp}-email`} className="su-field-label">
                    Email address
                  </label>
                  <input
                    id={`${idp}-email`}
                    type="email"
                    required
                    placeholder="Email Address"
                    className="su-text-input"
                    value={formData.email}
                    onChange={(e) => set({ email: e.target.value })}
                  />
                </div>
                <div className="su-field-group">
                  <label htmlFor={`${idp}-phone`} className="su-field-label">
                    Phone number
                  </label>
                  <input
                    id={`${idp}-phone`}
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="su-text-input"
                    value={formData.phone}
                    onChange={(e) => set({ phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="sef-row">
                <div className="su-field-group">
                  <label htmlFor={`${idp}-company`} className="su-field-label">
                    Company name
                  </label>
                  <input
                    id={`${idp}-company`}
                    type="text"
                    placeholder="Company / Organization"
                    className="su-text-input"
                    value={formData.companyName}
                    onChange={(e) => set({ companyName: e.target.value })}
                  />
                </div>
                <div className="su-field-group">
                  <label htmlFor={`${idp}-service`} className="su-field-label">
                    Service
                  </label>
                  <div className="sef-locked-wrap" title="Fixed on this service's pages">
                    <input
                      id={`${idp}-service`}
                      type="text"
                      readOnly
                      tabIndex={-1}
                      aria-readonly="true"
                      className="su-text-input sef-locked"
                      value={form.label}
                    />
                    <svg className="sef-lock" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
                <div className="su-field-group">
                  <label htmlFor={`${idp}-category`} className="su-field-label">
                    Category
                  </label>
                  <select
                    id={`${idp}-category`}
                    required
                    className="su-select-input"
                    value={formData.serviceInterest}
                    onChange={(e) => set({ serviceInterest: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sef-row">
                <div className="su-field-group">
                  <label htmlFor={`${idp}-industry`} className="su-field-label">
                    Industry
                  </label>
                  <select
                    id={`${idp}-industry`}
                    required
                    className="su-select-input"
                    value={formData.industry}
                    onChange={(e) => {
                      const val = e.target.value;
                      set({ industry: val, otherIndustry: val === "Other" ? formData.otherIndustry : "" });
                    }}
                  >
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.industry === "Other" && (
                  <div className="su-field-group">
                    <label htmlFor={`${idp}-other`} className="su-field-label">
                      Other industry
                    </label>
                    <input
                      id={`${idp}-other`}
                      type="text"
                      required
                      placeholder="Please specify your industry..."
                      className="su-text-input"
                      value={formData.otherIndustry}
                      onChange={(e) => set({ otherIndustry: e.target.value })}
                    />
                  </div>
                )}
                <div className={`su-field-group${formData.industry === "Other" ? "" : " sef-span-2"}`}>
                  <label htmlFor={`${idp}-budget`} className="su-field-label">
                    Estimated Budget
                  </label>
                  <select
                    id={`${idp}-budget`}
                    className="su-select-input"
                    value={formData.budget}
                    onChange={(e) => set({ budget: e.target.value })}
                  >
                    <option value="">Select Budget Range</option>
                    {BUDGETS.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="su-field-group">
                <label htmlFor={`${idp}-message`} className="su-field-label">
                  Message / Project Details
                </label>
                <textarea
                  id={`${idp}-message`}
                  rows={4}
                  required
                  placeholder="Tell us about your project, goals, and timeline..."
                  className="su-textarea-input"
                  value={formData.message}
                  onChange={(e) => set({ message: e.target.value })}
                />
              </div>

              <label className={`su-checkbox-wrap${agreedError ? " is-error" : ""}`}>
                <input
                  type="checkbox"
                  checked={formData.agreed}
                  onChange={(e) => {
                    set({ agreed: e.target.checked });
                    setAgreedError(!e.target.checked);
                  }}
                  className="su-checkbox-input"
                />
                <span className="su-checkbox-label">
                  By submitting this form, you agree to our <Link href="/privacy-policy">Privacy Policy</Link> and{" "}
                  <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
                </span>
              </label>
              {agreedError && (
                <p className="sef-agree-error" role="alert">
                  Please accept the Privacy Policy and Terms &amp; Conditions before submitting your message.
                </p>
              )}

              {submitError && (
                <p className="su-form-error" role="alert">
                  {submitError}
                </p>
              )}

              <button type="submit" disabled={submitting} className="su-submit-btn">
                <span>{submitting ? "Sending..." : "Send Message"}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 18" fill="none" className="su-submit-arrow">
                  <path
                    d="M3.75 9L14.25 9M14.25 9L9 3.75M14.25 9L9 14.25"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

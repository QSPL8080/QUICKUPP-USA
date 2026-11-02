"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CONTACT_BUDGETS, CONTACT_TIMELINES, INDUSTRIES, SERVICE_FORMS, type ServiceFormKey } from "@/lib/formOptions";

/*
 * Enquiry form shown on every subpage of a service.
 * "Service" is fixed to the service this page belongs to;
 * "Category" lists that service's subpages (the current one is pre-selected).
 * Submissions go to /api/service-enquiry and are saved in the service's own table.
 */

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  companyWebsite: "",
  country: "",
  industry: "",
  otherIndustry: "",
  serviceInterest: "",
  budget: "",
  timeline: "",
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
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          companyName: formData.companyName,
          companyWebsite: formData.companyWebsite,
          country: formData.country,
          industry: formData.industry,
          otherIndustry: formData.otherIndustry,
          category: formData.serviceInterest,
          budget: formData.budget,
          timeline: formData.timeline,
          message: formData.message,
          agreed: formData.agreed,
          service,
          website,
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
                Our team will review your details and contact you to discuss your requirements.
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
                <p className="su-inquiry-para">Our team will review your details and contact you to discuss your requirements.</p>
              </div>

              {/* Row 1: Full name, Business email, Phone number */}
              <div className="sef-row">
                <div className="su-field-group">
                  <label htmlFor={`${idp}-name`} className="su-field-label">
                    Full Name*
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
                    Business Email*
                  </label>
                  <input
                    id={`${idp}-email`}
                    type="email"
                    required
                    placeholder="Business Email"
                    className="su-text-input"
                    value={formData.email}
                    onChange={(e) => set({ email: e.target.value })}
                  />
                </div>
                <div className="su-field-group">
                  <label htmlFor={`${idp}-phone`} className="su-field-label">
                    Phone Number*
                  </label>
                  <input
                    id={`${idp}-phone`}
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    className="su-text-input"
                    value={formData.phone}
                    onChange={(e) => set({ phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 2: Company name, Company website, Country */}
              <div className="sef-row">
                <div className="su-field-group">
                  <label htmlFor={`${idp}-company`} className="su-field-label">
                    Company Name
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
                  <label htmlFor={`${idp}-website`} className="su-field-label">
                    Company Website
                  </label>
                  <input
                    id={`${idp}-website`}
                    type="url"
                    placeholder="https://example.com"
                    className="su-text-input"
                    value={formData.companyWebsite}
                    onChange={(e) => set({ companyWebsite: e.target.value })}
                  />
                </div>
                <div className="su-field-group">
                  <label htmlFor={`${idp}-country`} className="su-field-label">
                    Country*
                  </label>
                  <input
                    id={`${idp}-country`}
                    type="text"
                    required
                    placeholder="United States"
                    className="su-text-input"
                    value={formData.country}
                    onChange={(e) => set({ country: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 3: Service (fixed), Category, Industry */}
              <div className="sef-row">
                <div className="su-field-group">
                  <label htmlFor={`${idp}-service`} className="su-field-label">
                    Service Interested In*
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
                    Category*
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
                <div className="su-field-group">
                  <label htmlFor={`${idp}-industry`} className="su-field-label">
                    Industry*
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
              </div>

              {/* Row 4: (Other Industry if selected) + Estimated Budget + Project Timeline */}
              {formData.industry === "Other" ? (
                <div className="sef-row">
                  <div className="su-field-group">
                    <label htmlFor={`${idp}-other`} className="su-field-label">
                      Please specify your industry*
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
                  <div className="su-field-group">
                    <label htmlFor={`${idp}-budget`} className="su-field-label">
                      Estimated Project Budget*
                    </label>
                    <select
                      id={`${idp}-budget`}
                      required
                      className="su-select-input"
                      value={formData.budget}
                      onChange={(e) => set({ budget: e.target.value })}
                    >
                      <option value="">Select Budget Range</option>
                      {CONTACT_BUDGETS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="su-field-group">
                    <label htmlFor={`${idp}-timeline`} className="su-field-label">
                      Project Timeline*
                    </label>
                    <select
                      id={`${idp}-timeline`}
                      required
                      className="su-select-input"
                      value={formData.timeline}
                      onChange={(e) => set({ timeline: e.target.value })}
                    >
                      <option value="">Select Timeline</option>
                      {CONTACT_TIMELINES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="sef-row sef-row-2">
                  <div className="su-field-group">
                    <label htmlFor={`${idp}-budget`} className="su-field-label">
                      Estimated Project Budget*
                    </label>
                    <select
                      id={`${idp}-budget`}
                      required
                      className="su-select-input"
                      value={formData.budget}
                      onChange={(e) => set({ budget: e.target.value })}
                    >
                      <option value="">Select Budget Range</option>
                      {CONTACT_BUDGETS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="su-field-group">
                    <label htmlFor={`${idp}-timeline`} className="su-field-label">
                      Project Timeline*
                    </label>
                    <select
                      id={`${idp}-timeline`}
                      required
                      className="su-select-input"
                      value={formData.timeline}
                      onChange={(e) => set({ timeline: e.target.value })}
                    >
                      <option value="">Select Timeline</option>
                      {CONTACT_TIMELINES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Message / Project Details */}
              <div className="su-field-group">
                <label htmlFor={`${idp}-message`} className="su-field-label">
                  Tell Us About Your Project / Requirements
                </label>
                <textarea
                  id={`${idp}-message`}
                  rows={4}
                  placeholder="Tell us about your project, goals, and requirements..."
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
                <span>{submitting ? "Submitting..." : "Submit Your Inquiry"}</span>
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

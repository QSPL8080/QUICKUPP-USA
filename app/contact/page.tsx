"use client";

import React, { useRef, useState } from "react";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompanyMotion from "@/components/CompanyMotion";
import Link from "next/link";
import { CONTACT_SUBJECTS } from "@/lib/formOptions";

/* Calendly booking page shown beside the form (event: Free 30-Minute Strategy Call) */
const CALENDLY_URL =
  "https://calendly.com/quickuppsoftechmeet/strategy-call?hide_gdpr_banner=1&hide_event_type_details=1&hide_landing_page_details=1&background_color=ffffff&text_color=0b0f17&primary_color=6366f1";

type CalendlyApi = { initInlineWidget: (o: { url: string; parentElement: HTMLElement }) => void };

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    industry: "",
    otherIndustry: "",
    projectType: "",
    budget: "",
    message: "",
    agreed: false,
  });

  const calendlyRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [agreedError, setAgreedError] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [website, setWebsite] = useState(""); // hidden spam trap

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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, website, pageUrl: window.location.href }),
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
    <div className="su-contact-page">
      <Header />

      {/* =========================================================================
          1. HERO & INQUIRY FORM SECTION (SaleUnion Reference Layout)
          ========================================================================= */}
      <section className="su-contact-hero-section">
        <div className="w-layout-blockcontainer container w-container">
          {/* Breadcrumb Navigation */}
          <div className="asx-breadcrumb" style={{ justifyContent: "center", marginBottom: "20px" }}>
            <Link href="/">Home</Link>
            <span>/</span>
            <span className="asx-breadcrumb-current">Contact</span>
          </div>

          {/* Top Hero Typography */}
          <div className="su-contact-hero-wrap" style={{ maxWidth: "1040px", margin: "0 auto 36px", textAlign: "center", width: "100%" }}>
            <div className="su-subtitle-badge">
              <span className="su-badge-dot" />
              <span>Digital Marketing, SEO &amp; AI Solutions</span>
            </div>
            <h1 className="su-hero-title" style={{ textAlign: "center", width: "100%", margin: "0 auto 12px" }}>
              Get In Touch For Any <span className="qs-gradient-text">Questions Or Ideas</span>
            </h1>
            <p className="su-hero-desc">
              Where smart strategy, data, and execution come together to deliver measurable business success.
            </p>
          </div>

          {/* Inquiry form + Calendly booking side by side */}
          <div className="su-contact-split">
          <div className="su-contact-form-container">
            {submitted ? (
              <div className="su-success-box">
                <div className="su-success-icon">✓</div>
                <h3 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
                  Thank You! Your Inquiry Has Been Received.
                </h3>
                <p style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.6, maxWidth: "460px", margin: "0 auto 24px" }}>
                  We appreciate you reaching out, <strong>{formData.fullName || "friend"}</strong>. Our strategy team will review your project details and get back to you at <strong>{formData.email}</strong> within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      fullName: "",
                      email: "",
                      phone: "",
                      companyName: "",
                      industry: "",
                      otherIndustry: "",
                      projectType: "",
                      budget: "",
                      message: "",
                      agreed: false,
                    });
                  }}
                  className="su-submit-btn"
                  style={{ maxWidth: "260px", margin: "0 auto" }}
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="su-contact-form">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
                />
                <div className="su-form-top">
                  <h2 className="su-inquiry-title">Send Your Inquiry!</h2>
                  <p className="su-inquiry-para">
                    Share your project details, and we’ll get back to you within 24 hours.
                  </p>
                </div>

                {/* Row 1: Full Name & Email Address */}
                <div className="su-form-fields-grid">
                  <div className="su-field-group">
                    <label htmlFor="Full-Name" className="su-field-label">
                      Full name
                    </label>
                    <input
                      id="Full-Name"
                      type="text"
                      required
                      placeholder="Full Name"
                      className="su-text-input"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>

                  <div className="su-field-group">
                    <label htmlFor="Email" className="su-field-label">
                      Email address
                    </label>
                    <input
                      id="Email"
                      type="email"
                      required
                      placeholder="Email Address"
                      className="su-text-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                {/* Row 2: Phone Number & Company Name */}
                <div className="su-form-fields-grid">
                  <div className="su-field-group">
                    <label htmlFor="Phone-Number" className="su-field-label">
                      Phone number
                    </label>
                    <input
                      id="Phone-Number"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="su-text-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="su-field-group">
                    <label htmlFor="Company-name" className="su-field-label">
                      Company name
                    </label>
                    <input
                      id="Company-name"
                      type="text"
                      placeholder="Company / Organization"
                      className="su-text-input"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                </div>

                {/* Row 3: Industry & Subject / Service */}
                <div className="su-form-fields-grid">
                  <div className="su-field-group">
                    <label htmlFor="Industry" className="su-field-label">
                      Industry
                    </label>
                    <select
                      id="Industry"
                      required
                      className="su-select-input"
                      value={formData.industry}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          industry: val,
                          otherIndustry: val === "Other" ? formData.otherIndustry : "",
                        });
                      }}
                    >
                      <option value="">Select Industry</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Home Services">Home Services</option>
                      <option value="Professional Services">Professional Services</option>
                      <option value="Education">Education</option>
                      <option value="IT & SaaS">IT &amp; SaaS</option>
                      <option value="eCommerce">eCommerce</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Interior Design">Interior Design</option>
                      <option value="Travel & Hospitality">Travel &amp; Hospitality</option>
                      <option value="Other">Other</option>
                    </select>

                    {formData.industry === "Other" && (
                      <div style={{ marginTop: "10px" }}>
                        <input
                          id="Other-Industry"
                          type="text"
                          required
                          placeholder="Please specify your industry..."
                          className="su-text-input"
                          value={formData.otherIndustry}
                          onChange={(e) => setFormData({ ...formData, otherIndustry: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  <div className="su-field-group">
                    <label htmlFor="Type-of-Project" className="su-field-label">
                      Subject / Service
                    </label>
                    <select
                      id="Type-of-Project"
                      required
                      className="su-select-input"
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    >
                      <option value="">Select Service</option>
                      {CONTACT_SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 4: Estimated Budget */}
                <div className="su-field-group">
                  <label htmlFor="Budget-Range" className="su-field-label">
                    Estimated Budget
                  </label>
                  <select
                    id="Budget-Range"
                    className="su-select-input"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  >
                    <option value="">Select Budget Range</option>
                    <option value="Under $5,000">Under $5,000</option>
                    <option value="$5,000 - $15,000">$5,000 – $15,000</option>
                    <option value="$15,000 - $50,000">$15,000 – $50,000</option>
                    <option value="$50,000+">$50,000+</option>
                    <option value="Not Specified / Flexible">Flexible / Not Sure</option>
                  </select>
                </div>

                {/* Row 4: Message */}
                <div className="su-field-group">
                  <label htmlFor="Message" className="su-field-label">
                    Message / Project Details
                  </label>
                  <textarea
                    id="Message"
                    rows={4}
                    required
                    placeholder="Tell us about your project, goals, and timeline..."
                    className="su-textarea-input"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                {/* Checkbox: Privacy Policy and Terms & Conditions (Default Unchecked) */}
                <label className="su-checkbox-wrap" style={{ cursor: "pointer", userSelect: "none" }}>
                  <input
                    type="checkbox"
                    checked={formData.agreed}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setFormData({ ...formData, agreed: isChecked });
                      setAgreedError(!isChecked);
                    }}
                    className="su-checkbox-input"
                    style={{
                      accentColor: agreedError ? "#ef4444" : "#0f172a",
                      borderColor: agreedError ? "#ef4444" : "#dfdfdf",
                      boxShadow: agreedError ? "0 0 0 2px rgba(239, 68, 68, 0.2)" : "none",
                    }}
                  />
                  <span
                    className="su-checkbox-label"
                    style={{
                      color: agreedError ? "#dc2626" : "#555151",
                      fontWeight: agreedError ? 600 : 500,
                      transition: "color 0.2s ease",
                    }}
                  >
                    By submitting this form, you agree to our{" "}
                    <Link href="/privacy-policy" style={{ color: "inherit", textDecoration: "underline" }}>
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/terms-and-conditions" style={{ color: "inherit", textDecoration: "underline" }}>
                      Terms &amp; Conditions
                    </Link>
                  </span>
                </label>

                {/* Red Warning text below checkbox when unticked */}
                {agreedError && (
                  <p
                    style={{
                      color: "#dc2626",
                      fontSize: "13px",
                      fontWeight: 600,
                      margin: "-12px 0 20px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      lineHeight: 1.4,
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Please accept the Privacy Policy and Terms &amp; Conditions before submitting your message.
                  </p>
                )}

                {submitError && (
                  <p className="su-form-error" role="alert">
                    {submitError}
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="su-submit-btn"
                >
                  <span>{submitting ? "Sending..." : "Send Message"}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 18" fill="none" className="su-submit-arrow">
                    <path d="M3.75 9L14.25 9M14.25 9L9 3.75M14.25 9L9 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </form>
            )}
          </div>

          {/* Calendly booking */}
          <div className="su-calendly-card">
            <div className="su-form-top">
              <h2 className="su-inquiry-title">Book a Free Strategy Call</h2>
              <p className="su-inquiry-para">Pick a time that suits you for a 30-minute call on Google Meet.</p>
            </div>
            <div className="su-calendly-frame" ref={calendlyRef} />
            <Script
              src="https://assets.calendly.com/assets/external/widget.js"
              strategy="lazyOnload"
              onReady={() => {
                const el = calendlyRef.current;
                const api = (window as unknown as { Calendly?: CalendlyApi }).Calendly;
                if (el && api && !el.hasChildNodes()) api.initInlineWidget({ url: CALENDLY_URL, parentElement: el });
              }}
            />
          </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. CINEMATIC CONSULTATION CTA TRANSITION SECTION (SaleUnion Parallax Curtain Reveal)
          ========================================================================= */}
      <section className="su-cinematic-cta-section su-cta-contact">
        <div className="su-cinematic-bg-media" />
        <div className="su-cinematic-dark-overlay" />
        <div className="w-layout-blockcontainer container w-container">
          <div className="su-cinematic-content">
            <p className="su-cinematic-sub">
              <span className="su-cinematic-sub-dot" /> Quickupp Softech® • USA &amp; Global Delivery
            </p>
            <h2 className="su-cinematic-heading">
              Ready to take a <span className="su-cinematic-heading-accent">consultancy with us?</span>
            </h2>
            <div className="su-cinematic-action-wrap">
              <a href="mailto:hello@quickuppsoftech.com" className="su-flip-button">
                <div className="su-flip-button-texts">
                  <div className="su-flip-button-text _01">Start a Free Meeting</div>
                  <div className="su-flip-button-text _02">Start a Free Meeting</div>
                </div>
                <div className="su-flip-arrow-box">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" className="su-flip-arrow _01">
                    <path d="M3.75 9L14.25 9M14.25 9L9 3.75M14.25 9L9 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" className="su-flip-arrow _02">
                    <path d="M3.75 9L14.25 9M14.25 9L9 3.75M14.25 9L9 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <CompanyMotion seed={0} />
      <Footer hideCta={true} />
    </div>
  );
}

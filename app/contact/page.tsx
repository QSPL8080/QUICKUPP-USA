"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    projectType: "",
    budget: "",
    message: "",
    agreed: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [agreedError, setAgreedError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreed) {
      setAgreedError(true);
      return;
    }
    setAgreedError(false);
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 500);
  };

  return (
    <div className="su-contact-page">
      <Header />

      {/* =========================================================================
          1. HERO & INQUIRY FORM SECTION (SaleUnion Reference Layout)
          ========================================================================= */}
      <section className="su-contact-hero-section">
        <div className="w-layout-blockcontainer container w-container">
          {/* Top Hero Typography */}
          <div className="su-contact-hero-wrap">
            <div className="su-subtitle-badge">
              <span className="su-badge-dot" />
              <span>Digital Marketing, SEO &amp; AI Solutions</span>
            </div>
            <h1 className="su-hero-title">
              Get In Touch For Any <span className="qs-gradient-text">Questions Or Ideas</span>
            </h1>
            <p className="su-hero-desc">
              Where smart strategy, data, and execution come together to deliver measurable business success.
            </p>
          </div>

          {/* Main Inquiry Form Section (No heavy card border/shadow) */}
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

                {/* Row 3: Subject / Project Type & Estimated Budget */}
                <div className="su-form-fields-grid">
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
                      <option value="Digital Marketing & SEO">Digital Marketing &amp; SEO</option>
                      <option value="AI Agents & Automation">AI Agents &amp; Automation</option>
                      <option value="Web & Mobile App Development">Web &amp; Mobile App Development</option>
                      <option value="Paid Media & Ads">Paid Media &amp; Ads</option>
                      <option value="Staff Augmentation">Staff Augmentation</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>

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

                {/* Checkbox: Privacy Policy (Default Ticked) */}
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
                    Please accept the Privacy Policy before submitting your message.
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
        </div>
      </section>

      {/* =========================================================================
          2. CINEMATIC CONSULTATION CTA TRANSITION SECTION (SaleUnion Parallax Curtain Reveal)
          ========================================================================= */}
      <section className="su-cinematic-cta-section">
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

      <Footer hideCta={true} />
    </div>
  );
}

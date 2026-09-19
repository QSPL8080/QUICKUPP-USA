"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [selectedServices, setSelectedServices] = useState<string[]>([
    "Digital Marketing & SEO",
  ]);
  const [selectedBudget, setSelectedBudget] = useState<string>("$2.5k - $5k / mo");
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const availableServices = [
    "Digital Marketing & SEO",
    "Google & Meta Ads",
    "AI Automation & Workflows",
    "AI Video Production & Avatars",
    "Web & App Development",
    "Staff Augmentation",
  ];

  const budgetTiers = [
    "<$2.5k / mo",
    "$2.5k - $5k / mo",
    "$5k - $15k / mo",
    "$15k+ Enterprise",
  ];

  const toggleService = (srv: string) => {
    if (selectedServices.includes(srv)) {
      setSelectedServices(selectedServices.filter((s) => s !== srv));
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="qs-contact-page">
      <Header />

      {/* 1. TOP INTRO & HEADLINE WITH GENEROUS TOP SPACING */}
      <section className="qs-contact-top-wrap">
        <div className="w-layout-blockcontainer container w-container">
          <div className="qs-contact-badge">
            <span className="qs-contact-dot" />
            Direct Access • Strategy Consultation
          </div>
          <h1 className="qs-contact-main-title">
            Let&apos;s Build Something{" "}
            <span className="qs-contact-gradient-text">Extraordinary Together</span>
          </h1>
          <p className="qs-contact-lead">
            Have a project in mind, need an AI automation roadmap, or want to scale qualified customer acquisition? Reach out directly to our team.
          </p>
        </div>
      </section>

      {/* 2. DIRECT ACCESS 3-CARD HUB & MAIN FORM */}
      <section style={{ paddingBottom: "96px" }}>
        <div className="w-layout-blockcontainer container w-container">
          {/* 3 Direct Hub Cards */}
          <div className="qs-direct-hub-grid">
            <div className="qs-direct-card">
              <div>
                <div className="qs-direct-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <h3 className="qs-direct-title">Direct Email</h3>
                <p className="qs-direct-desc">
                  Send RFPs, project scopes, or direct questions to our solutions team for a rapid quote.
                </p>
              </div>
              <a href="mailto:hello@quickuppsoftech.com" className="qs-direct-link">
                hello@quickuppsoftech.com →
              </a>
            </div>

            <div className="qs-direct-card">
              <div>
                <div className="qs-direct-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <h3 className="qs-direct-title">1-on-1 Strategy Call</h3>
                <p className="qs-direct-desc">
                  Schedule a focused discovery consultation with our senior marketing &amp; AI architects.
                </p>
              </div>
              <a href="mailto:hello@quickuppsoftech.com?subject=Schedule%20Growth%20Consultation" className="qs-direct-link">
                Request Strategy Call →
              </a>
            </div>

            <div className="qs-direct-card">
              <div>
                <div className="qs-direct-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <h3 className="qs-direct-title">Global 24/7 Delivery</h3>
                <p className="qs-direct-desc">
                  United States headquarters with continuous round-the-clock delivery and support teams.
                </p>
              </div>
              <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#10b981" }}>
                ● Active Now (2-Hr Turnaround)
              </span>
            </div>
          </div>

          {/* Main 2-Column Split */}
          <div className="qs-contact-split" style={{ marginBottom: "0" }}>
            {/* Left Trust Column */}
            <div className="qs-trust-pane">
              <div className="qs-contact-badge">
                <span className="qs-contact-dot" />
                Tailored Engagement
              </div>
              <h2 className="qs-trust-heading">
                Clarity, Precision &amp; Measurable ROI
              </h2>
              <p className="qs-trust-lead">
                We don&apos;t do generic sales pitches. Every conversation begins with an objective assessment of your market position, conversion leaks, and growth potential.
              </p>

              {/* Guarantees */}
              <div className="qs-guarantee-list">
                <div className="qs-guarantee-item">
                  <div className="qs-guarantee-check">✓</div>
                  <span>Actionable 90-Day Multi-Channel Growth Blueprint</span>
                </div>
                <div className="qs-guarantee-item">
                  <div className="qs-guarantee-check">✓</div>
                  <span>Full Tech Stack, SEO &amp; Funnel Conversion Audit</span>
                </div>
                <div className="qs-guarantee-item">
                  <div className="qs-guarantee-check">✓</div>
                  <span>Zero High-Pressure Sales • 100% Transparent Advice</span>
                </div>
              </div>

              {/* Verified Client Review */}
              <div className="qs-client-review-card">
                <div className="qs-stars-row">★★★★★</div>
                <p className="qs-review-quote">
                  &ldquo;Quickupp transformed our inbound patient pipeline and automated our enquiry handling within 30 days. Their speed and technical execution are second to none.&rdquo;
                </p>
                <div className="qs-reviewer-row">
                  <div className="qs-reviewer-avatar">EM</div>
                  <div>
                    <div className="qs-reviewer-name">Erick Miller</div>
                    <div className="qs-reviewer-title">VP of Growth &amp; Technology</div>
                  </div>
                </div>
              </div>

              {/* Mini Stats Strip */}
              <div className="qs-trust-stats-row">
                <div className="qs-mini-stat-card">
                  <div className="qs-mini-stat-num">500+</div>
                  <div className="qs-mini-stat-lbl">Projects Scaled</div>
                </div>
                <div className="qs-mini-stat-card">
                  <div className="qs-mini-stat-num">3.8x</div>
                  <div className="qs-mini-stat-lbl">Average ROI</div>
                </div>
                <div className="qs-mini-stat-card">
                  <div className="qs-mini-stat-num">98%</div>
                  <div className="qs-mini-stat-lbl">Client Retention</div>
                </div>
              </div>
            </div>

            {/* Right Form Box */}
            <div className="qs-form-container">
              {submitted ? (
                <div style={{ textAlign: "center", padding: "36px 0" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", fontSize: "28px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontWeight: 800 }}>
                    ✓
                  </div>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "10px" }}>
                    Strategy Request Received!
                  </h3>
                  <p style={{ fontSize: "14.5px", color: "#64748b", lineHeight: 1.6, maxWidth: "420px", margin: "0 auto 20px" }}>
                    Thank you, {formData.name || "friend"}. Our growth architects will review your details and connect with a tailored roadmap within 2 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    style={{ padding: "10px 22px", borderRadius: "100px", background: "#f1f5f9", border: "1px solid #cbd5e1", fontWeight: 700, cursor: "pointer", fontSize: "13.5px" }}
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 className="qs-form-header-title">Request Free Strategy Plan</h3>
                  <p className="qs-form-header-desc">
                    Tell us what you&apos;re looking to scale and we&apos;ll prepare your plan.
                  </p>

                  <div className="qs-input-group">
                    <label className="qs-input-label">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      className="qs-input-ctrl"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="qs-input-row-2">
                    <div className="qs-input-group">
                      <label className="qs-input-label">Work Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="alex@company.com"
                        className="qs-input-ctrl"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="qs-input-group">
                      <label className="qs-input-label">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="qs-input-ctrl"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="qs-input-group">
                    <label className="qs-input-label">Services You Are Interested In</label>
                    <div className="qs-pills-selector">
                      {availableServices.map((srv) => (
                        <button
                          key={srv}
                          type="button"
                          className={"qs-pill-toggle " + (selectedServices.includes(srv) ? "is-active" : "")}
                          onClick={() => toggleService(srv)}
                        >
                          {selectedServices.includes(srv) ? "✓ " : "+ "}
                          {srv}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="qs-input-group">
                    <label className="qs-input-label">Estimated Monthly Budget</label>
                    <div className="qs-pills-selector">
                      {budgetTiers.map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          className={"qs-pill-toggle " + (selectedBudget === tier ? "is-active" : "")}
                          onClick={() => setSelectedBudget(tier)}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="qs-input-group">
                    <label className="qs-input-label">Project Details &amp; Targets *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Share your goals, current bottlenecks, or specific timeline..."
                      className="qs-textarea-ctrl"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="qs-btn-submit-action">
                    <span>Send Strategy Request</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

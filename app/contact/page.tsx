"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ServiceItem {
  id: string;
  name: string;
  track: "marketing" | "ai" | "engineering" | "staffing";
}

const ALL_SERVICES: ServiceItem[] = [
  { id: "seo", name: "SEO & AI Search Visibility", track: "marketing" },
  { id: "paid-ads", name: "Paid Ads (Google, Meta & LinkedIn)", track: "marketing" },
  { id: "social", name: "Social Media & Viral Content", track: "marketing" },
  { id: "ai-agents", name: "Custom AI Agents & Bots", track: "ai" },
  { id: "ai-video", name: "AI Video Production & Avatars", track: "ai" },
  { id: "ai-workflows", name: "Enterprise Workflow Automation", track: "ai" },
  { id: "web-dev", name: "Next.js Web & Portal Development", track: "engineering" },
  { id: "mobile-app", name: "iOS & Android Mobile Apps", track: "engineering" },
  { id: "staff-aug", name: "Dedicated Engineers & Marketers", track: "staffing" },
];

const TRACK_TABS = [
  { id: "all", label: "All Solutions" },
  { id: "marketing", label: "Digital Marketing & SEO" },
  { id: "ai", label: "AI & Automation" },
  { id: "engineering", label: "Web & App Dev" },
  { id: "staffing", label: "Staff Augmentation" },
];

const BUDGET_TIERS = [
  "<$3,000 / mo",
  "$3k - $8,000 / mo",
  "$8k - $20,000 / mo",
  "$20,000+ Enterprise",
];

const TIMELINE_OPTIONS = [
  "Urgent (< 1 Week)",
  "Within 1 Month",
  "1-3 Months",
  "Exploring Options",
];

const FAQS = [
  {
    q: "How fast can we kick off after our initial strategy call?",
    a: "Following our initial 30-minute discovery consultation, our team provides an actionable scope and growth blueprint within 24 to 48 hours. Most projects and team augmentations can begin execution within 3 to 5 business days.",
  },
  {
    q: "Do you sign Mutual Non-Disclosure Agreements (NDAs)?",
    a: "Absolutely. We treat all proprietary IP, customer data, and project roadmaps with the highest level of confidentiality. We execute bilateral NDAs before any sensitive data or architecture review takes place.",
  },
  {
    q: "How are your pricing models structured?",
    a: "We offer flexible engagement models based on your needs: Dedicated Monthly Retainers (for ongoing marketing, SEO, and AI operations), Milestone-Based Fixed Scopes (for web/app development and agent builds), and Staff Augmentation (hourly or monthly dedicated talent).",
  },
  {
    q: "Do you work with startups, or only enterprise companies?",
    a: "We partner with high-growth venture-backed startups, mid-market leaders, and global enterprises. Our tiered delivery models scale flexibly whether you're launching an MVP or automating a multi-brand corporate workflow.",
  },
  {
    q: "How will we communicate and track sprint progress?",
    a: "You receive a dedicated project manager, shared Slack/Teams channel, real-time Jira/Linear dashboard access, and weekly video strategy reviews to ensure total transparency and measurable ROI at every milestone.",
  },
];

export default function ContactPage() {
  const [activeTrack, setActiveTrack] = useState<string>("all");
  const [selectedServices, setSelectedServices] = useState<string[]>([
    "SEO & AI Search Visibility",
    "Custom AI Agents & Bots",
  ]);
  const [selectedBudget, setSelectedBudget] = useState<string>("$3k - $8,000 / mo");
  const [selectedTimeline, setSelectedTimeline] = useState<string>("Within 1 Month");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    website: "",
    projectScope: "",
  });

  const toggleService = (srvName: string) => {
    if (selectedServices.includes(srvName)) {
      setSelectedServices(selectedServices.filter((s) => s !== srvName));
    } else {
      setSelectedServices([...selectedServices, srvName]);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => {
      setCopiedField(null);
    }, 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const filteredServices =
    activeTrack === "all"
      ? ALL_SERVICES
      : ALL_SERVICES.filter((s) => s.track === activeTrack);

  return (
    <div className="qs-contact-lux-page">
      <Header />

      {/* 1. HERO HEADER WITH FLOATING CLEARANCE */}
      <section className="qs-contact-lux-top">
        <div className="w-layout-blockcontainer container w-container">
          <div className="qs-contact-live-badge">
            <span className="qs-live-pulse-dot" />
            24/7 Global Delivery &bull; Strategy Consultation
          </div>
          <h1 className="qs-contact-hero-h1">
            Let&apos;s Architect Your Next{" "}
            <span className="qs-contact-gradient-glow">Growth Milestone</span>
          </h1>
          <p className="qs-contact-hero-sub">
            From high-converting multi-channel digital marketing and SEO to custom AI agents and full-stack software development — speak directly with our senior solution strategists.
          </p>
        </div>
      </section>

      {/* 2. DIRECT ACCESS 3-CARD GLASS GRID */}
      <section style={{ paddingBottom: "32px", position: "relative", zIndex: 2 }}>
        <div className="w-layout-blockcontainer container w-container">
          <div className="qs-contact-cards-grid">
            {/* Card 1: Direct Email */}
            <div className="qs-contact-glass-card">
              <div>
                <div className="qs-glass-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <h3 className="qs-glass-card-title">Direct Inquiries &amp; RFPs</h3>
                <p className="qs-glass-card-desc">
                  Send project briefs, requirements, or architecture blueprints directly to our solutions desk.
                </p>
              </div>
              <div className="qs-glass-action-row">
                <a
                  href="mailto:hello@quickuppsoftech.com"
                  className="qs-glass-action-link"
                >
                  hello@quickuppsoftech.com &rarr;
                </a>
                <button
                  type="button"
                  className="qs-glass-copy-btn"
                  onClick={() => handleCopy("hello@quickuppsoftech.com", "email")}
                >
                  {copiedField === "email" ? "Copied! ✓" : "Copy"}
                </button>
              </div>
            </div>

            {/* Card 2: Strategy Session */}
            <div className="qs-contact-glass-card">
              <div>
                <div className="qs-glass-icon-box" style={{ borderColor: "rgba(168, 85, 247, 0.4)", color: "#c084fc" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <h3 className="qs-glass-card-title">Priority Strategy Call</h3>
                <p className="qs-glass-card-desc">
                  Schedule a focused 30-minute discovery consultation with our senior growth &amp; AI architects.
                </p>
              </div>
              <div className="qs-glass-action-row">
                <a
                  href="mailto:hello@quickuppsoftech.com?subject=Priority%20Strategy%20Consultation%20Request"
                  className="qs-glass-action-link"
                >
                  Book 1-on-1 Discovery &rarr;
                </a>
                <span style={{ fontSize: "12px", color: "#38bdf8", fontWeight: 700 }}>
                  Free Scope
                </span>
              </div>
            </div>

            {/* Card 3: US Operations & Global Team */}
            <div className="qs-contact-glass-card">
              <div>
                <div className="qs-glass-icon-box" style={{ borderColor: "rgba(34, 197, 94, 0.4)", color: "#4ade80" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <h3 className="qs-glass-card-title">Global 24/7 Operations</h3>
                <p className="qs-glass-card-desc">
                  United States headquarters with continuous delivery coverage across North America, EMEA &amp; APAC.
                </p>
              </div>
              <div className="qs-glass-action-row">
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span className="qs-live-pulse-dot" style={{ width: "6px", height: "6px" }} />
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#22c55e" }}>
                    Avg Response: &lt; 2 Hrs
                  </span>
                </div>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Delaware, USA
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN INTERACTIVE FORM & STRATEGY VALUE SPLIT */}
      <section style={{ paddingBottom: "70px", position: "relative", zIndex: 2 }}>
        <div className="w-layout-blockcontainer container w-container">
          <div className="qs-lux-split-layout">
            {/* Left: Interactive Form Box */}
            <div className="qs-lux-form-box">
              {submitted ? (
                <div className="qs-lux-success-card">
                  <div className="qs-success-glow-icon">✓</div>
                  <h3 style={{ fontSize: "26px", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
                    Strategy Request Received!
                  </h3>
                  <p style={{ fontSize: "15px", color: "#94a3b8", lineHeight: 1.6, maxWidth: "440px", margin: "0 auto 24px" }}>
                    Thank you, <strong style={{ color: "#ffffff" }}>{formData.fullName || "friend"}</strong>. Our technical architects and marketing strategists are reviewing your scope and will contact you at <strong style={{ color: "#38bdf8" }}>{formData.email}</strong> within 2 hours.
                  </p>

                  <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "16px", maxWidth: "420px", margin: "0 auto 24px", textAlign: "left" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", marginBottom: "6px" }}>
                      Selected Scope Summary:
                    </div>
                    <div style={{ fontSize: "13.5px", color: "#e2e8f0", lineHeight: 1.5 }}>
                      &bull; <strong>Services:</strong> {selectedServices.join(", ") || "General Consultation"} <br />
                      &bull; <strong>Target Budget:</strong> {selectedBudget} <br />
                      &bull; <strong>Timeline:</strong> {selectedTimeline}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ fullName: "", email: "", phone: "", company: "", website: "", projectScope: "" });
                    }}
                    style={{
                      padding: "12px 28px",
                      borderRadius: "100px",
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "#ffffff",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="qs-form-header-badge">Step-by-Step Project Configurator</div>
                  <h2 className="qs-form-lux-title">Tailor Your Growth Plan</h2>
                  <p className="qs-form-lux-desc">
                    Select your focus areas below for an immediate, custom project assessment.
                  </p>

                  {/* Step 1: Track Filter & Capability Chips */}
                  <div className="qs-form-step-title">
                    <span className="qs-step-num-pill">1</span>
                    Choose Focus Track &amp; Required Capabilities
                  </div>

                  {/* Track Pills */}
                  <div className="qs-track-pills-row">
                    {TRACK_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        className={`qs-track-pill ${activeTrack === tab.id ? "is-active" : ""}`}
                        onClick={() => setActiveTrack(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Capability Chips */}
                  <div className="qs-service-chips-wrap">
                    {filteredServices.map((srv) => {
                      const isSelected = selectedServices.includes(srv.name);
                      return (
                        <button
                          key={srv.id}
                          type="button"
                          className={`qs-service-chip ${isSelected ? "is-selected" : ""}`}
                          onClick={() => toggleService(srv.name)}
                        >
                          <span>{isSelected ? "✓" : "+"}</span>
                          {srv.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Step 2: Budget Tier */}
                  <div className="qs-form-step-title">
                    <span className="qs-step-num-pill">2</span>
                    Anticipated Monthly Investment
                  </div>
                  <div className="qs-budget-tier-grid">
                    {BUDGET_TIERS.map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        className={`qs-budget-box ${selectedBudget === tier ? "is-selected" : ""}`}
                        onClick={() => setSelectedBudget(tier)}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>

                  {/* Step 3: Target Timeline */}
                  <div className="qs-form-step-title">
                    <span className="qs-step-num-pill">3</span>
                    Desired Launch Timeline
                  </div>
                  <div className="qs-budget-tier-grid">
                    {TIMELINE_OPTIONS.map((time) => (
                      <button
                        key={time}
                        type="button"
                        className={`qs-budget-box ${selectedTimeline === time ? "is-selected" : ""}`}
                        onClick={() => setSelectedTimeline(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>

                  {/* Step 4: Contact & Project Details */}
                  <div className="qs-form-step-title" style={{ marginTop: "18px" }}>
                    <span className="qs-step-num-pill">4</span>
                    Contact &amp; Project Scope
                  </div>

                  <div className="qs-input-lux-grid">
                    <div className="qs-lux-input-group" style={{ marginBottom: 0 }}>
                      <label className="qs-lux-label">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Morgan"
                        className="qs-lux-input"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    <div className="qs-lux-input-group" style={{ marginBottom: 0 }}>
                      <label className="qs-lux-label">Work Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="alex@company.com"
                        className="qs-lux-input"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="qs-input-lux-grid">
                    <div className="qs-lux-input-group" style={{ marginBottom: 0 }}>
                      <label className="qs-lux-label">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="qs-lux-input"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="qs-lux-input-group" style={{ marginBottom: 0 }}>
                      <label className="qs-lux-label">Company / Brand Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Health Corp"
                        className="qs-lux-input"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="qs-lux-input-group">
                    <label className="qs-lux-label">Project Objectives &amp; Current Bottlenecks *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Briefly describe what you want to achieve, current conversion bottlenecks, or specific tech requirements..."
                      className="qs-lux-textarea"
                      value={formData.projectScope}
                      onChange={(e) => setFormData({ ...formData, projectScope: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="qs-lux-submit-btn"
                  >
                    {submitting ? (
                      <span>Preparing Your Plan...</span>
                    ) : (
                      <>
                        <span>Submit Strategy Request &rarr;</span>
                      </>
                    )}
                  </button>

                  <div className="qs-nda-reassurance">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>100% Confidential &bull; Bilateral NDA Protected &bull; No Spam Ever</span>
                  </div>
                </form>
              )}
            </div>

            {/* Right: Value, Assurance, Testimonial & Metric Cards */}
            <div className="qs-lux-assurance-col">
              {/* Card 1: What Happens Next Pipeline */}
              <div className="qs-lux-info-card">
                <div className="qs-info-card-header">
                  <span style={{ color: "#38bdf8" }}>⚡</span>
                  <span>What Happens After You Submit?</span>
                </div>

                <div className="qs-timeline-step-row">
                  <div className="qs-timeline-dot-box">1</div>
                  <div className="qs-timeline-content">
                    <div className="qs-timeline-title">Audit &amp; Solution Match (&lt; 2 Hrs)</div>
                    <div className="qs-timeline-desc">
                      Our lead digital strategist and AI engineers review your current domain, tech stack, and objectives.
                    </div>
                  </div>
                </div>

                <div className="qs-timeline-step-row">
                  <div className="qs-timeline-dot-box">2</div>
                  <div className="qs-timeline-content">
                    <div className="qs-timeline-title">30-Min High-Value Discovery Call</div>
                    <div className="qs-timeline-desc">
                      We present a concrete 90-day growth roadmap, milestone estimates, and transparent pricing models.
                    </div>
                  </div>
                </div>

                <div className="qs-timeline-step-row">
                  <div className="qs-timeline-dot-box">3</div>
                  <div className="qs-timeline-content">
                    <div className="qs-timeline-title">Sprint Kickoff &amp; Dedicated Pod</div>
                    <div className="qs-timeline-desc">
                      Immediate onboarding with dedicated engineers, marketers, shared Slack channels, and live tracking.
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Live Impact Metrics Trio */}
              <div className="qs-lux-metrics-trio">
                <div className="qs-metric-item-box">
                  <div className="qs-metric-num">$45M+</div>
                  <div className="qs-metric-lbl">Revenue Scaled</div>
                </div>
                <div className="qs-metric-item-box">
                  <div className="qs-metric-num">99.4%</div>
                  <div className="qs-metric-lbl">On-Time SLA</div>
                </div>
                <div className="qs-metric-item-box">
                  <div className="qs-metric-num">120+</div>
                  <div className="qs-metric-lbl">Active Clients</div>
                </div>
              </div>

              {/* Card 3: Verified Client Review */}
              <div className="qs-lux-info-card" style={{ borderLeft: "3px solid #7c3aed" }}>
                <div style={{ color: "#f59e0b", fontSize: "14px", marginBottom: "8px", letterSpacing: "2px" }}>
                  ★★★★★
                </div>
                <p style={{ fontSize: "13.5px", color: "#cbd5e1", lineHeight: 1.6, fontStyle: "italic", marginBottom: "14px" }}>
                  &ldquo;Quickupp overhauled our entire acquisition funnel and automated patient qualification. Their technical precision and speed gave us an unfair competitive advantage in under 60 days.&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #00d2ff, #7c3aed)", color: "#ffffff", fontWeight: 800, fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    EM
                  </div>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#ffffff" }}>Erick Miller</div>
                    <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>VP of Technology &amp; Growth</div>
                  </div>
                </div>
              </div>

              {/* Card 4: Delaware HQ & Global Footprint */}
              <div className="qs-lux-info-card" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      US Corporate Office
                    </div>
                    <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 700, marginTop: "2px" }}>
                      Delaware, United States
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Direct Hotline
                    </div>
                    <a href="tel:+18005550199" style={{ fontSize: "13.5px", color: "#38bdf8", fontWeight: 700, textDecoration: "none" }}>
                      +1 (800) QUICKUPP
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. PRE-CONSULTATION FAQ ACCORDION */}
          <div className="qs-contact-faq-section">
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div className="qs-form-header-badge" style={{ display: "inline-block" }}>
                Common Questions
              </div>
              <h3 style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
                Frequently Asked Before Getting Started
              </h3>
            </div>

            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className={`qs-contact-faq-item ${isOpen ? "is-open" : ""}`}>
                  <button
                    type="button"
                    className="qs-contact-faq-trigger"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <span style={{ fontSize: "20px", color: isOpen ? "#38bdf8" : "#64748b", transform: isOpen ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div className="qs-contact-faq-body">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


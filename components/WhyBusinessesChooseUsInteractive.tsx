"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function WhyBusinessesChooseUsInteractive() {
  const [filterCategory, setFilterCategory] = useState<"all" | "strategy" | "execution" | "scale">("all");
  const [activeDiffIdx, setActiveDiffIdx] = useState<number>(0);
  const [activeWorkStep, setActiveWorkStep] = useState<number>(0);

  const whatSetsApart = [
    {
      num: "01",
      category: "strategy",
      title: "One Partner. Multiple Capabilities.",
      desc: "Marketing, creative, technology and AI often require multiple vendors. Quickupp brings these capabilities together, making it easier to manage projects, align strategies and execute connected solutions.",
      subtext: "Marketing. AI. Technology. Built for Growth.",
      tag: "Unified Capabilities",
      ctaText: "Explore Our Capabilities",
      ctaHref: "/services",
    },
    {
      num: "02",
      category: "strategy",
      title: "Business-First Thinking",
      desc: "We take the time to understand what actually matters to your business before recommending a solution. Whether the objective is customer acquisition, digital transformation, automation or market expansion, our work starts with the business problem—not the service.",
      tag: "Strategic Problem Solving",
      subtext: null,
      ctaText: null,
      ctaHref: null,
    },
    {
      num: "03",
      category: "strategy",
      title: "Solutions Built Around Your Requirements",
      desc: "No two businesses operate the same way. We adapt our approach to your industry, audience, processes, objectives and stage of growth rather than forcing you into a standard package.",
      tag: "Tailored Delivery",
      subtext: null,
      ctaText: null,
      ctaHref: null,
    },
    {
      num: "04",
      category: "execution",
      title: "Strong Execution",
      desc: "Ideas only create value when they are executed well. Our teams bring together strategy, creative, marketing and technology expertise to move projects from planning to implementation, measurement and refinement.",
      tag: "End-to-End Delivery",
      subtext: null,
      ctaText: "Discuss Your Project",
      ctaHref: "/contact",
    },
    {
      num: "05",
      category: "execution",
      title: "Practical AI Adoption",
      desc: "We focus on where AI can create real business value. From AI chatbots and agents to lead qualification, workflow automation, CRM processes and customer support, we identify practical use cases that can improve efficiency and customer experiences.",
      tag: "Applied Intelligence",
      subtext: null,
      ctaText: "Explore AI Solutions",
      ctaHref: "/services",
    },
    {
      num: "06",
      category: "execution",
      title: "Outcome-Oriented Approach",
      desc: "We look beyond completed tasks. Depending on the engagement, our work can support objectives such as:",
      tag: "Measurable Business Value",
      outcomes: [
        "Generating qualified opportunities",
        "Improving conversion",
        "Increasing online visibility",
        "Reducing manual processes",
        "Improving customer response",
        "Strengthening digital experiences",
        "Creating scalable systems",
      ],
      subtext: "The objective is to create measurable business value.",
      ctaText: null,
      ctaHref: null,
    },
    {
      num: "07",
      category: "scale",
      title: "Industry-Aware Expertise",
      desc: "Our experience spans Healthcare, Home Services, Professional Services, Education, IT & SaaS, eCommerce, Real Estate, Interior Design, Travel & Hospitality and Automotive. This allows us to understand different customer journeys, buying decisions and business requirements while developing solutions specific to each market.",
      tag: "Multi-Vertical Experience",
      industryChips: [
        "Healthcare",
        "Home Services",
        "Professional Services",
        "Education",
        "IT & SaaS",
        "eCommerce",
        "Real Estate",
        "Interior Design",
        "Travel & Hospitality",
        "Automotive",
      ],
      subtext: null,
      ctaText: "Explore Our Industries",
      ctaHref: "/industries",
    },
    {
      num: "08",
      category: "scale",
      title: "Built With Scalability in Mind",
      desc: "Your requirements today may not be the same six months from now. We consider future needs when developing marketing systems, websites, applications, automation and technology solutions—so what we build can evolve with your business.",
      tag: "Future-Proof Architecture",
      subtext: null,
      ctaText: null,
      ctaHref: null,
    },
    {
      num: "09",
      category: "scale",
      title: "Clear Communication",
      desc: "Good work requires good communication. We maintain clear expectations around scope, timelines, priorities, progress and performance, giving you visibility throughout the engagement.",
      tag: "Transparent Collaboration",
      subtext: null,
      ctaText: null,
      ctaHref: null,
    },
    {
      num: "10",
      category: "scale",
      title: "Global Perspective",
      desc: "Businesses today can reach customers far beyond their local market. Our experience across India and international markets helps us approach digital growth with a broader understanding of audiences, competition and market expansion.",
      tag: "International Reach",
      subtext: null,
      ctaText: null,
      ctaHref: null,
    },
  ];

  const filteredDistinctions = whatSetsApart.filter(
    (item) => filterCategory === "all" || item.category === filterCategory
  );

  const differenceItems = [
    {
      step: "01 • DEMAND",
      title: "Demand Generation",
      desc: "A marketing campaign can generate demand.",
      tag: "Acquisition Engine",
      insight: "Targeted campaigns and performance marketing create continuous inbound interest.",
    },
    {
      step: "02 • CONVERSION",
      title: "Conversion Engine",
      desc: "A website can convert it.",
      tag: "Experience & UI/UX",
      insight: "Fast, frictionless digital experiences turn qualified traffic into paying customers.",
    },
    {
      step: "03 • AUTOMATION",
      title: "AI Automation",
      desc: "AI can automate what happens next.",
      tag: "Intelligent Workflows",
      insight: "Automated qualification, routing, CRM sync, and response loops work 24/7.",
    },
    {
      step: "04 • SCALE",
      title: "Scalable Technology",
      desc: "Technology can help the entire system scale.",
      tag: "Robust Architecture",
      insight: "Enterprise-grade software and cloud infrastructure support compound growth without bottlenecks.",
    },
  ];

  const howWeWorkPhases = [
    {
      step: "01",
      title: "Understand",
      desc: "We identify your objectives, challenges and opportunities.",
      category: "Discovery & Alignment",
      deliverable: "Discovery Blueprint & Strategic Matrix",
      bullets: [
        "Comprehensive stakeholder alignment & business goal definition",
        "Target audience, competitive landscape & market opportunity audit",
        "Technical architecture & legacy workflow bottleneck assessment",
      ],
      telemetry: {
        timeline: "Phase 01 • Discovery",
        lead: "Strategic Growth Lead",
        goal: "Zero Assumptions & Total Alignment",
      },
    },
    {
      step: "02",
      title: "Plan",
      desc: "We define the right approach, priorities and deliverables.",
      category: "Architecture & Roadmap",
      deliverable: "Technical Architecture & Execution Roadmap",
      bullets: [
        "End-to-end technical, marketing & AI system architecture",
        "Prioritized sprint backlog with clear milestone deliverables",
        "KPI benchmarks, ROI targets & measurement framework",
      ],
      telemetry: {
        timeline: "Phase 02 • Planning",
        lead: "Lead Solutions Architect",
        goal: "Clear Roadmaps & Defined Timelines",
      },
    },
    {
      step: "03",
      title: "Execute",
      desc: "Our specialists turn the strategy into action.",
      category: "Agile Production & Engineering",
      deliverable: "Production Sprints & Live Deployments",
      bullets: [
        "High-velocity full-stack engineering & conversion-focused UI",
        "AI model integration, automated workflows & CRM connections",
        "Rigorous cross-browser QA testing & performance benchmarking",
      ],
      telemetry: {
        timeline: "Phase 03 • Implementation",
        lead: "Engineering & Marketing Squad",
        goal: "Velocity with Production Excellence",
      },
    },
    {
      step: "04",
      title: "Measure",
      desc: "We track performance and identify areas for improvement.",
      category: "Analytics & Telemetry",
      deliverable: "Real-Time Telemetry & KPI Dashboard",
      bullets: [
        "Real-time conversion tracking & acquisition ROI analytics",
        "AI workflow accuracy & operational efficiency monitoring",
        "Data-driven bottleneck detection & user behavioral insights",
      ],
      telemetry: {
        timeline: "Phase 04 • Performance",
        lead: "Data & Performance Specialist",
        goal: "Measurable Business Outcomes",
      },
    },
    {
      step: "05",
      title: "Improve",
      desc: "We continuously refine the solution as your business evolves.",
      category: "Iterative Scale & Growth",
      deliverable: "Continuous Optimization & Scaling Engine",
      bullets: [
        "Multivariate A/B testing on high-impact conversion funnels",
        "System scaling & infrastructure capability expansions",
        "Ongoing feature development aligned with market growth",
      ],
      telemetry: {
        timeline: "Phase 05 • Optimization",
        lead: "Dedicated Growth Partner Team",
        goal: "Long-Term Compounding Advantage",
      },
    },
  ];

  const scrollToPillars = (cat: "all" | "strategy" | "execution" | "scale") => {
    setFilterCategory(cat);
    if (cat === "all") {
      document.getElementById("pillars-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (cat === "strategy") {
      document.getElementById("pillar-01")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (cat === "execution") {
      document.getElementById("pillar-04")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (cat === "scale") {
      document.getElementById("pillar-07")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="mx-about-page">
      <Header />

      <main>
        {/* =========================================================================
            1. HERO SECTION (WHY BUSINESSES CHOOSE US)
            ========================================================================= */}
        <section className="mx-hero-section">
          <div className="mx-container">
            <div className="mx-hero-seamless">
              {/* Subtle Ambient Glow */}
              <div className="mx-hero-bg-waves" aria-hidden="true">
                <svg viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 300C300 100 600 500 900 300C1050 200 1150 250 1200 300V600H0V300Z" fill="rgba(124, 58, 237, 0.02)" />
                  <path d="M0 400C250 250 500 550 800 350C1000 220 1100 320 1200 380" stroke="rgba(0, 210, 255, 0.3)" strokeWidth="2" strokeDasharray="8 8" />
                  <path d="M0 200C350 450 700 150 1050 380C1120 420 1180 400 1200 390" stroke="rgba(124, 58, 237, 0.18)" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Top Center Subtitle Badge */}
              <div className="mx-subtitle-badge">
                <span className="mx-badge-dot" />
                <span>WHY BUSINESSES CHOOSE US</span>
              </div>

              {/* Hero Headline & Subtitle */}
              <h1 className="mx-hero-title">
                Built Around Your Business. <span className="mx-gradient-text">Focused on What Comes Next.</span>
              </h1>
              <p className="mx-hero-subtitle">
                Choosing a growth partner is about more than technical expertise. You need a team that understands your objectives, connects the right capabilities and takes responsibility for execution. Quickupp Softech combines Marketing, AI and Technology to help businesses solve challenges, create opportunities and build for the future.
              </p>

              {/* Hero Action Button */}
              <Link href="/contact" className="mx-btn-lime">
                <span>Talk to a Growth Expert</span>
                <div className="mx-btn-icon-circle">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. WHAT SETS QUICKUPP APART (Modern Sticky Split Editorial Showcase)
            ========================================================================= */}
        <section id="pillars-top" className="mx-tab-section" style={{ paddingTop: "50px", paddingBottom: "70px" }}>
          <div className="mx-container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.55fr",
                gap: "56px",
                alignItems: "flex-start",
              }}
              className="mx-split-section"
            >
              {/* Left Column: Sticky Editorial Header & Quick Nav */}
              <div className="mx-sticky-col">
                <span className="mx-sub-badge">WHAT SETS QUICKUPP APART</span>
                <h2 className="mx-section-heading" style={{ fontSize: "clamp(26px, 3vw, 38px)", marginBottom: "16px" }}>
                  10 Strategic Pillars <br />
                  <span className="mx-gradient-text">Built for Measurable Scale</span>
                </h2>
                <p className="mx-tab-paragraph" style={{ fontSize: "15px", lineHeight: "1.65", marginBottom: "28px" }}>
                  From business-first strategy to practical AI adoption and global delivery, explore the 10 distinct ways Quickupp Softech engineers lasting enterprise value.
                </p>

                {/* Pillar Switcher Navigation */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
                  <button
                    type="button"
                    onClick={() => scrollToPillars("all")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 18px",
                      borderRadius: "14px",
                      border: "1px solid",
                      borderColor: filterCategory === "all" ? "var(--mx-primary)" : "var(--mx-border)",
                      background: filterCategory === "all" ? "#0f172a" : "#ffffff",
                      color: filterCategory === "all" ? "#ffffff" : "var(--mx-text-heading)",
                      fontSize: "13.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      textAlign: "left",
                    }}
                  >
                    <span>All 10 Distinctions</span>
                    <span style={{ fontSize: "12px", opacity: 0.7 }}>10 Pillars</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToPillars("strategy")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 18px",
                      borderRadius: "14px",
                      border: "1px solid",
                      borderColor: filterCategory === "strategy" ? "var(--mx-primary)" : "var(--mx-border)",
                      background: filterCategory === "strategy" ? "#0f172a" : "#ffffff",
                      color: filterCategory === "strategy" ? "#ffffff" : "var(--mx-text-heading)",
                      fontSize: "13.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      textAlign: "left",
                    }}
                  >
                    <span>Strategy &amp; Solutions</span>
                    <span style={{ fontSize: "12px", opacity: 0.7 }}>01–03</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToPillars("execution")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 18px",
                      borderRadius: "14px",
                      border: "1px solid",
                      borderColor: filterCategory === "execution" ? "var(--mx-primary)" : "var(--mx-border)",
                      background: filterCategory === "execution" ? "#0f172a" : "#ffffff",
                      color: filterCategory === "execution" ? "#ffffff" : "var(--mx-text-heading)",
                      fontSize: "13.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      textAlign: "left",
                    }}
                  >
                    <span>Execution &amp; Practical AI</span>
                    <span style={{ fontSize: "12px", opacity: 0.7 }}>04–06</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToPillars("scale")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 18px",
                      borderRadius: "14px",
                      border: "1px solid",
                      borderColor: filterCategory === "scale" ? "var(--mx-primary)" : "var(--mx-border)",
                      background: filterCategory === "scale" ? "#0f172a" : "#ffffff",
                      color: filterCategory === "scale" ? "#ffffff" : "var(--mx-text-heading)",
                      fontSize: "13.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      textAlign: "left",
                    }}
                  >
                    <span>Industry &amp; Global Scale</span>
                    <span style={{ fontSize: "12px", opacity: 0.7 }}>07–10</span>
                  </button>
                </div>

                {/* Left Mini CTA Box */}
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(0, 210, 255, 0.05) 0%, rgba(124, 58, 237, 0.07) 100%)",
                    border: "1px solid var(--mx-border)",
                    borderRadius: "18px",
                    padding: "22px",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--mx-text-heading)", marginBottom: "6px" }}>
                    Ready to build for what comes next?
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--mx-text-body)", margin: "0 0 14px 0", lineHeight: 1.5 }}>
                    Connect with our strategy team for a personalized capabilities review.
                  </p>
                  <Link href="/contact" className="mx-btn-lime" style={{ width: "100%", justifyContent: "center", padding: "8px 16px", fontSize: "13.5px" }}>
                    <span>Talk to a Growth Expert</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Numbered Editorial Cards Stack */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {filteredDistinctions.map((item) => (
                  <div
                    key={item.num}
                    id={"pillar-" + item.num}
                    className="mx-distinction-card"
                  >
                    {/* Header Row: Number Badge, Title, and Tag */}
                    <div className="mx-distinction-header">
                      <div className="mx-distinction-left">
                        <div className="mx-distinction-num">
                          {item.num}
                        </div>
                        <h3 className="mx-distinction-title">
                          {item.title}
                        </h3>
                      </div>
                      {item.tag && (
                        <span className="mx-distinction-pill">
                          {item.tag}
                        </span>
                      )}
                    </div>

                    {/* Description Body */}
                    <p className="mx-distinction-desc">
                      {item.desc}
                    </p>

                    {/* Point 06 Outcome Checklist */}
                    {item.outcomes && (
                      <div className="mx-distinction-points">
                        {item.outcomes.map((pt, idx) => (
                          <div key={idx} className="mx-distinction-point-item">
                            <span className="mx-distinction-point-check">✓</span>
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Point 07 Industry Badges */}
                    {item.industryChips && (
                      <div className="mx-distinction-chips">
                        {item.industryChips.map((ind, idx) => (
                          <span key={idx} className="mx-distinction-chip">
                            {ind}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Subtext Highlight */}
                    {item.subtext && (
                      <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px dashed var(--mx-border)" }}>
                        <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: "var(--mx-primary)" }}>
                          {item.subtext}
                        </p>
                      </div>
                    )}

                    {/* CTA Link */}
                    {item.ctaText && item.ctaHref && (
                      <div style={{ marginTop: "4px" }}>
                        <Link href={item.ctaHref} className="mx-distinction-cta">
                          <span>{item.ctaText}</span>
                          <span style={{ fontSize: "16px" }}>→</span>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. THE QUICKUPP DIFFERENCE (We Connect the Pieces)
            ========================================================================= */}
        <section className="mx-partnership-section">
          <div className="mx-container">
            <div className="mx-partnership-box">
              <div className="mx-partnership-header">
                <span className="mx-partnership-sub">THE QUICKUPP DIFFERENCE</span>
                <h2 className="mx-partnership-title">
                  We Connect <span className="mx-gradient-text">the Pieces.</span>
                </h2>
                <div style={{ maxWidth: "780px", margin: "16px auto 0", textAlign: "center" }}>
                  <p style={{ fontSize: "15px", lineHeight: "1.7", color: "var(--mx-text-body)", margin: "0 0 8px 0" }}>
                    A marketing campaign can generate demand. A website can convert it. AI can automate what happens next. Technology can help the entire system scale.
                  </p>
                  <p style={{ fontSize: "15px", lineHeight: "1.7", color: "var(--mx-text-body)", margin: 0, fontWeight: 600 }}>
                    Our advantage is understanding how these pieces can work together. Instead of looking at isolated requirements, we look at the bigger business opportunity and connect the right capabilities around it.
                  </p>
                </div>
              </div>

              {/* Animated Interactive 4-Node Flow Pipeline */}
              <div className="mx-flow-pipeline-wrap">
                <div className="mx-flow-grid">
                  {differenceItems.map((item, idx) => {
                    const isActive = activeDiffIdx === idx;
                    return (
                      <div
                        key={item.step}
                        onClick={() => setActiveDiffIdx(idx)}
                        className={`mx-flow-node-card ${isActive ? "active" : ""}`}
                      >
                        <div>
                          <div className="mx-flow-node-top">
                            <span className="mx-flow-step-badge">
                              <span className="mx-flow-indicator-dot" />
                              {item.step}
                            </span>
                          </div>
                          <h4 className="mx-flow-node-title">{item.title}</h4>
                          <p className="mx-flow-node-desc">{item.desc}</p>
                        </div>
                        <div>
                          <span className="mx-flow-node-tag">{item.tag}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dynamic Connected Synergy Insight Panel */}
                <div className="mx-synergy-insight-box">
                  <div className="mx-synergy-left">
                    <div className="mx-synergy-label">
                      CONNECTED IMPACT • STAGE {differenceItems[activeDiffIdx].step}
                    </div>
                    <p className="mx-synergy-text">
                      {differenceItems[activeDiffIdx].insight}
                    </p>
                  </div>
                  <div className="mx-synergy-pills">
                    <span className="mx-synergy-pill">✓ Unified Pipeline</span>
                    <span className="mx-synergy-pill">✓ Zero Data Loss</span>
                    <span className="mx-synergy-pill">✓ Compounding ROI</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: "28px" }}>
                <Link href="/contact" className="mx-btn-lime">
                  <span>Build Your Growth Strategy</span>
                  <div className="mx-btn-icon-circle">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. HOW WE WORK (5-Phase Modern Delivery Framework)
            ========================================================================= */}
        <section className="mx-tab-section">
          <div className="mx-container">
            <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 36px" }}>
              <span className="mx-sub-badge">HOW WE WORK</span>
              <h2 className="mx-section-heading">
                Disciplined Delivery from <span className="mx-gradient-text">Concept to Optimization</span>
              </h2>
            </div>

            <div className="mx-process-wrapper">
              {/* Top Segmented Navigation Pills */}
              <div className="mx-process-nav">
                {howWeWorkPhases.map((phase, idx) => {
                  const isActive = activeWorkStep === idx;
                  return (
                    <button
                      key={phase.step}
                      type="button"
                      onClick={() => setActiveWorkStep(idx)}
                      className={`mx-process-tab-btn ${isActive ? "active" : ""}`}
                    >
                      <span className="mx-process-tab-num">{phase.step}</span>
                      <span>{phase.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Main Interactive Stage Showcase Card */}
              {(() => {
                const current = howWeWorkPhases[activeWorkStep];
                return (
                  <div className="mx-process-showcase-box">
                    {/* Left: Detailed Stage Breakdown */}
                    <div className="mx-process-left-content">
                      <div className="mx-process-stage-meta">
                        <span className="mx-process-stage-pill">PHASE {current.step} OF 05</span>
                        <span className="mx-process-stage-category">{current.category}</span>
                      </div>

                      <h3 className="mx-process-stage-title">
                        {current.step}. {current.title}
                      </h3>

                      <p className="mx-process-stage-desc">{current.desc}</p>

                      <div className="mx-process-bullets">
                        {current.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="mx-process-bullet-item">
                            <span className="mx-process-bullet-check">✓</span>
                            <span>{bullet}</span>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="mx-process-deliverable-tag">
                          <span>📦 Key Deliverable:</span>
                          <strong>{current.deliverable}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Right: Operational Telemetry & Next Phase Trigger */}
                    <div className="mx-process-right-card">
                      <div className="mx-process-telemetry-row">
                        <span className="mx-process-telemetry-label">Timeline</span>
                        <span className="mx-process-telemetry-val">{current.telemetry.timeline}</span>
                      </div>
                      <div className="mx-process-telemetry-row">
                        <span className="mx-process-telemetry-label">Lead Pod</span>
                        <span className="mx-process-telemetry-val">{current.telemetry.lead}</span>
                      </div>
                      <div className="mx-process-telemetry-row" style={{ borderBottom: "none", paddingBottom: 0 }}>
                        <span className="mx-process-telemetry-label">Primary Goal</span>
                        <span className="mx-process-telemetry-val" style={{ color: "var(--mx-primary)" }}>
                          {current.telemetry.goal}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveWorkStep((prev) => (prev + 1) % howWeWorkPhases.length)}
                        className="mx-process-next-btn"
                      >
                        <span>
                          {activeWorkStep < howWeWorkPhases.length - 1
                            ? `Next: Phase 0${activeWorkStep + 2} (${howWeWorkPhases[activeWorkStep + 1].title})`
                            : "Restart Framework (Phase 01)"}
                        </span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Bottom 5 Mini Scrubber Cards */}
              <div className="mx-process-mini-grid">
                {howWeWorkPhases.map((phase, idx) => {
                  const isActive = activeWorkStep === idx;
                  return (
                    <div
                      key={phase.step}
                      onClick={() => setActiveWorkStep(idx)}
                      className={`mx-process-mini-card ${isActive ? "active" : ""}`}
                    >
                      <div className="mx-process-mini-num">STEP {phase.step}</div>
                      <div className="mx-process-mini-title">{phase.title}</div>
                      <p style={{ fontSize: "12.5px", color: "var(--mx-text-body)", margin: "6px 0 0 0", lineHeight: "1.4" }}>
                        {phase.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. BUILT FOR BUSINESSES THAT WANT TO MOVE FORWARD (CTA Box)
            ========================================================================= */}
        <section className="mx-cta-section">
          <div className="mx-container">
            <div className="mx-cta-card">
              <div className="mx-cta-content">
                <span className="mx-sub-badge">BUILT FOR BUSINESSES THAT WANT TO MOVE FORWARD</span>
                <h2 className="mx-cta-title">
                  Ready to explore what we can build for your business?
                </h2>
                <p className="mx-cta-desc" style={{ marginBottom: "16px" }}>
                  From improving customer acquisition to modernizing operations, Quickupp helps businesses bring together the people, strategies and technology required for their next stage. One Partner for Marketing, AI &amp; Technology.
                </p>
                <p style={{ fontSize: "15px", color: "var(--mx-primary)", fontWeight: 700, margin: 0 }}>
                  Ready to explore what we can build for your business?
                </p>
              </div>

              <div className="mx-cta-actions">
                <Link href="/contact" className="mx-btn-lime">
                  <span>Talk to a Growth Expert</span>
                  <div className="mx-btn-icon-circle">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </Link>
                <Link href="/contact" className="mx-btn-outline-white">
                  <span>Start Your Project</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

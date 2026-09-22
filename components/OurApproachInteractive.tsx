"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function OurApproachInteractive() {
  const [clientsCount, setClientsCount] = useState<number>(0);
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [professionalsCount, setProfessionalsCount] = useState<number>(0);
  const [satisfactionCount, setSatisfactionCount] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Auto-rotate process categories every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 5);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          let c = 0;
          const cTimer = setInterval(() => {
            c += 4;
            if (c >= 120) {
              setClientsCount(120);
              clearInterval(cTimer);
            } else {
              setClientsCount(c);
            }
          }, 35);

          let p = 0;
          const pTimer = setInterval(() => {
            p += 6;
            if (p >= 200) {
              setProjectsCount(200);
              clearInterval(pTimer);
            } else {
              setProjectsCount(p);
            }
          }, 35);

          let prof = 0;
          const profTimer = setInterval(() => {
            prof += 1;
            if (prof >= 30) {
              setProfessionalsCount(30);
              clearInterval(profTimer);
            } else {
              setProfessionalsCount(prof);
            }
          }, 45);

          let s = 0;
          const sTimer = setInterval(() => {
            s += 3;
            if (s >= 98) {
              setSatisfactionCount(98);
              clearInterval(sTimer);
            } else {
              setSatisfactionCount(s);
            }
          }, 40);
        }
      },
      { threshold: 0.2 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  const workSteps = [
    {
      num: "01",
      stepName: "UNDERSTAND",
      title: "Start With the Business.",
      desc: "We understand your goals, customers, market, competition, challenges and current systems before recommending a solution.",
      quote: "First, we listen. Then, we solve.",
      tag: "Discovery & Analysis",
      deliverable: "Systems Audit & Opportunity Mapping",
      telemetry: {
        phase: "01 of 05",
        action: "Listen & Analyze",
        focus: "Business & Systems Audit",
      },
    },
    {
      num: "02",
      stepName: "STRATEGIZE",
      title: "Find What Will Move the Needle.",
      desc: "We turn insights into a focused roadmap with clear priorities, actions and measurable objectives. Instead of recommending services individually, we identify the combination of capabilities that can create the greatest impact.",
      quote: "The right strategy creates the right direction.",
      tag: "Unified Roadmap",
      deliverable: "Connected Growth Strategy & Milestones",
      telemetry: {
        phase: "02 of 05",
        action: "Connect & Plan",
        focus: "Impact Roadmap",
      },
    },
    {
      num: "03",
      stepName: "BUILD",
      title: "Bring the Strategy to Life.",
      desc: "Our teams execute across Marketing, AI and Technology—from performance marketing and SEO to AI automation, websites, applications and custom software.",
      quote: "One strategy. One connected execution.",
      tag: "End-to-End Execution",
      deliverable: "Full-Stack Implementation & Integration",
      telemetry: {
        phase: "03 of 05",
        action: "Execute & Launch",
        focus: "Connected Execution",
      },
    },
    {
      num: "04",
      stepName: "OPTIMIZE",
      title: "Measure. Learn. Improve.",
      desc: "We track performance, analyze results and continuously improve what we build.",
      quote: "Because launching is not the goal. Better performance is.",
      tag: "Performance Refinement",
      deliverable: "Continuous Optimization & CRO Experiments",
      telemetry: {
        phase: "04 of 05",
        action: "Measure & Refine",
        focus: "Continuous Improvement",
      },
    },
    {
      num: "05",
      stepName: "GROW",
      title: "Build for What's Next.",
      desc: "We scale what works, identify new opportunities and evolve your solutions as your business grows.",
      quote: "Today's solution becomes tomorrow's growth engine.",
      tag: "Sustainable Scale",
      deliverable: "Long-Term Capability Expansion",
      telemetry: {
        phase: "05 of 05",
        action: "Scale & Evolve",
        focus: "Growth Engine",
      },
    },
  ];

  const quickuppWayItems = [
    "Understand the business.",
    "Find the opportunity.",
    "Connect the capabilities.",
    "Build the solution.",
    "Measure the impact.",
    "Keep improving.",
  ];

  return (
    <>
      <Header />
      <main className="mx-about-page">
        {/* =========================================================================
            1. HERO SECTION
            ========================================================================= */}
        <section className="mx-hero-section">
          <div className="mx-container">
            <div className="mx-hero-card">
              {/* Ambient Wave Graphic */}
              <div className="mx-hero-bg-waves" aria-hidden="true">
                <svg viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 300C300 100 600 500 900 300C1050 200 1150 250 1200 300V600H0V300Z" fill="rgba(124, 58, 237, 0.02)" />
                  <path d="M0 400C250 250 500 550 800 350C1000 220 1100 320 1200 380" stroke="rgba(0, 210, 255, 0.3)" strokeWidth="2" strokeDasharray="8 8" />
                  <path d="M0 200C350 450 700 150 1050 380C1120 420 1180 400 1200 390" stroke="rgba(124, 58, 237, 0.18)" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Subtitle Badge */}
              <div className="mx-subtitle-badge">
                <span className="mx-badge-dot" />
                <span>OUR APPROACH</span>
              </div>

              {/* Hero Headline */}
              <h1 className="mx-hero-title">
                Understand. Strategize. Build. <span className="mx-gradient-text">Optimize. Grow.</span>
              </h1>

              {/* Hero Paragraphs */}
              <p className="mx-hero-subtitle" style={{ maxWidth: "880px", marginBottom: "8px" }}>
                At Quickupp Softech, we don&apos;t believe in one-size-fits-all solutions. We first understand your business, identify the right opportunities and bring together Marketing, AI and Technology to build solutions aligned with your goals.
              </p>
              <p className="mx-hero-subtitle" style={{ maxWidth: "880px", fontSize: "16px", fontWeight: "600", color: "var(--mx-primary)", marginBottom: "28px" }}>
                We don&apos;t start with what we can sell. We start with what your business needs.
              </p>

              {/* Hero Action Button */}
              <Link href="/contact" className="mx-btn-lime">
                <span>Discuss Your Business Goals</span>
                <div className="mx-btn-icon-circle">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </div>
              </Link>

              {/* Experience at a Glance Counter Strip */}
              <div ref={statsRef} className="mx-metrics-strip" style={{ width: "100%", marginTop: "44px" }}>
                <div className="mx-metric-card">
                  <div className="mx-metric-num-row">
                    <span className="mx-metric-big-num">{clientsCount}+</span>
                    <span className="mx-metric-sup">/ Global</span>
                  </div>
                  <div className="mx-metric-label">Global Clients</div>
                </div>

                <div className="mx-metric-card">
                  <div className="mx-metric-num-row">
                    <span className="mx-metric-big-num">{projectsCount}+</span>
                    <span className="mx-metric-sup">/ Shipped</span>
                  </div>
                  <div className="mx-metric-label">Projects</div>
                </div>

                <div className="mx-metric-card">
                  <div className="mx-metric-num-row">
                    <span className="mx-metric-big-num">{professionalsCount}+</span>
                    <span className="mx-metric-sup">/ Experts</span>
                  </div>
                  <div className="mx-metric-label">Professionals</div>
                </div>

                <div className="mx-metric-card">
                  <div className="mx-metric-num-row">
                    <span className="mx-metric-big-num">{satisfactionCount}%</span>
                    <span className="mx-metric-sup">/ Rating</span>
                  </div>
                  <div className="mx-metric-label">Client Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. HOW WE WORK (5 Steps Interactive Showcase)
            ========================================================================= */}
        <section className="mx-partnership-section">
          <div className="mx-container">
            <div className="mx-partnership-box">
              <div className="mx-partnership-header">
                <span className="mx-partnership-sub">HOW WE WORK</span>
                <h2 className="mx-partnership-title">
                  Understand. Strategize. Build. <span className="mx-gradient-text">Optimize. Grow.</span>
                </h2>
              </div>

              {/* Interactive Process Framework with 5-second Auto-Rotation */}
              <div
                className="mx-process-wrapper"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {/* 5-Step Segmented Navigation */}
                <div className="mx-process-nav">
                  {workSteps.map((step, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveStep(idx)}
                      className={`mx-process-tab-btn ${activeStep === idx ? "active" : ""}`}
                    >
                      <span className="mx-process-tab-num">{step.num}</span>
                      <span>{step.stepName}</span>
                    </button>
                  ))}
                </div>

                {/* Main Showcase Split Card */}
                <div className="mx-process-showcase-box">
                  <div className="mx-process-left-content">
                    <div className="mx-process-stage-meta">
                      <span className="mx-process-stage-pill">{workSteps[activeStep].num}. {workSteps[activeStep].stepName}</span>
                      <span className="mx-process-stage-category">{workSteps[activeStep].tag}</span>
                    </div>
                    <h3 className="mx-process-stage-title">{workSteps[activeStep].title}</h3>
                    <p className="mx-process-stage-desc">{workSteps[activeStep].desc}</p>
                    <div style={{
                      padding: "16px 20px",
                      borderRadius: "14px",
                      background: "rgba(124, 58, 237, 0.05)",
                      border: "1px solid rgba(124, 58, 237, 0.15)",
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "var(--mx-primary)",
                      marginTop: "4px"
                    }}>
                      &ldquo;{workSteps[activeStep].quote}&rdquo;
                    </div>
                    <div className="mx-process-deliverable-tag">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Focus: {workSteps[activeStep].deliverable}</span>
                    </div>
                  </div>

                  {/* Right Card / Telemetry */}
                  <div className="mx-process-right-card">
                    <div className="mx-process-telemetry-row">
                      <span className="mx-process-telemetry-label">Phase</span>
                      <span className="mx-process-telemetry-val">{workSteps[activeStep].telemetry.phase}</span>
                    </div>
                    <div className="mx-process-telemetry-row">
                      <span className="mx-process-telemetry-label">Action</span>
                      <span className="mx-process-telemetry-val">{workSteps[activeStep].telemetry.action}</span>
                    </div>
                    <div className="mx-process-telemetry-row" style={{ borderBottom: "none", paddingBottom: 0 }}>
                      <span className="mx-process-telemetry-label">Primary Focus</span>
                      <span className="mx-process-telemetry-val" style={{ color: "var(--mx-primary)" }}>
                        {workSteps[activeStep].telemetry.focus}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveStep((prev) => (prev + 1) % workSteps.length)}
                      className="mx-process-next-btn"
                    >
                      <span>
                        {activeStep < workSteps.length - 1
                          ? `Next: Phase 0${activeStep + 2} (${workSteps[activeStep + 1].stepName})`
                          : "Restart Framework (Phase 01)"}
                      </span>
                      <span>→</span>
                    </button>
                  </div>
                </div>

                {/* Bottom 5 Mini Cards */}
                <div className="mx-process-mini-grid">
                  {workSteps.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveStep(idx)}
                      className={`mx-process-mini-card ${activeStep === idx ? "active" : ""}`}
                    >
                      <div className="mx-process-mini-num">{s.num}. {s.stepName}</div>
                      <h4 className="mx-process-mini-title">{s.title}</h4>
                    </div>
                  ))}
                </div>

                {/* Section CTA */}
                <div style={{ textAlign: "center", marginTop: "16px" }}>
                  <Link href="/contact" className="mx-btn-lime">
                    <span>Build Your Growth Roadmap</span>
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
          </div>
        </section>

        {/* =========================================================================
            3. OUR DIFFERENCE
            ========================================================================= */}
        <section className="mx-tab-section" style={{ padding: "40px 0 60px" }}>
          <div className="mx-container">
            <div className="mx-tab-grid">
              {/* Left Column: Heading & Content */}
              <div>
                <span className="mx-sub-badge">OUR DIFFERENCE</span>
                <h2 className="mx-section-heading">
                  We Connect the Pieces <span className="mx-gradient-text">Others Keep Separate.</span>
                </h2>

                <p className="mx-tab-paragraph" style={{ marginBottom: "16px" }}>
                  Most businesses have to manage separate partners for marketing, AI and technology. One handles your advertising. Another builds your website. Someone else handles automation.
                </p>
                <p className="mx-tab-paragraph" style={{ marginBottom: "16px" }}>
                  The result can be disconnected strategies, duplicated effort and missed opportunities. Quickupp brings them together.
                </p>
                <div style={{
                  background: "#ffffff",
                  border: "1px solid var(--mx-border)",
                  borderRadius: "18px",
                  padding: "20px 24px",
                  marginBottom: "24px",
                  boxShadow: "0 4px 16px -2px rgba(15, 23, 42, 0.04)"
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14.5px", fontWeight: "600", color: "var(--mx-text-heading)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="mx-goal-check">✓</span>
                      <span>Your marketing can connect with your technology.</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="mx-goal-check">✓</span>
                      <span>Your technology can connect with AI.</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="mx-goal-check">✓</span>
                      <span>Your AI can improve your marketing and operations.</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="mx-goal-check">✓</span>
                      <span>And everything can work toward one business objective—growth.</span>
                    </div>
                  </div>
                </div>

                <p className="mx-tab-paragraph" style={{ fontWeight: "700", color: "var(--mx-text-heading)", marginBottom: "24px" }}>
                  We don&apos;t just deliver three services. We connect three capabilities into one growth system.
                </p>

                <Link href="/services" className="mx-btn-lime">
                  <span>Explore Our Capabilities</span>
                  <div className="mx-btn-icon-circle">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </Link>
              </div>

              {/* Right Column: Directional Stacked Dual Photography */}
              <div className="mx-photo-stack">
                <div className="mx-photo-img-wrap img-back">
                  <img
                    src="/images/home-two-about.jpg"
                    alt="Quickupp Unified Growth Pod"
                    className="mx-photo-img"
                  />
                </div>
                <div className="mx-photo-img-wrap img-front">
                  <img
                    src="/images/home1-about-01.jpg"
                    alt="Quickupp Connected Strategy"
                    className="mx-photo-img"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. ONE APPROACH. THREE CAPABILITIES.
            ========================================================================= */}
        <section className="mx-lime-section">
          <div className="mx-container">
            <div className="mx-lime-box">
              <div className="mx-lime-header">
                <span className="mx-lime-sub">CORE CAPABILITIES</span>
                <h2 className="mx-lime-title">
                  ONE APPROACH. THREE CAPABILITIES.
                </h2>
              </div>

              {/* Double Line Divider */}
              <div className="mx-lime-divider">
                <div className="mx-lime-divider-line"></div>
                <div className="mx-lime-divider-line"></div>
              </div>

              {/* 3-Column Feature Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "28px",
                position: "relative",
                zIndex: 2,
                marginBottom: "36px"
              }}>
                {/* Marketing */}
                <div className="mx-lime-col" style={{
                  background: "#ffffff",
                  border: "1px solid var(--mx-border)",
                  borderRadius: "20px",
                  padding: "32px 28px",
                  boxShadow: "0 4px 16px -2px rgba(15, 23, 42, 0.04)"
                }}>
                  <div className="mx-monochrome-icon-box">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                      <path d="M2 20h20" />
                    </svg>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--mx-primary)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>01. MARKETING</div>
                  <h3 className="mx-lime-col-title" style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "-0.02em" }}>Attract the right customers.</h3>
                  <p className="mx-lime-col-desc">
                    Build visibility, generate demand and turn attention into business opportunities.
                  </p>
                  <div className="mx-lime-col-bottom-line"></div>
                </div>

                {/* AI */}
                <div className="mx-lime-col" style={{
                  background: "#ffffff",
                  border: "1px solid var(--mx-border)",
                  borderRadius: "20px",
                  padding: "32px 28px",
                  boxShadow: "0 4px 16px -2px rgba(15, 23, 42, 0.04)"
                }}>
                  <div className="mx-monochrome-icon-box">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="10" rx="2" />
                      <circle cx="12" cy="5" r="2" />
                      <path d="M12 7v4" />
                      <line x1="8" y1="16" x2="8.01" y2="16" strokeWidth="2.5" />
                      <line x1="16" y1="16" x2="16.01" y2="16" strokeWidth="2.5" />
                    </svg>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--mx-primary)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>02. AI</div>
                  <h3 className="mx-lime-col-title" style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "-0.02em" }}>Work smarter and faster.</h3>
                  <p className="mx-lime-col-desc">
                    Automate processes, improve efficiency and create better customer experiences.
                  </p>
                  <div className="mx-lime-col-bottom-line"></div>
                </div>

                {/* Technology */}
                <div className="mx-lime-col" style={{
                  background: "#ffffff",
                  border: "1px solid var(--mx-border)",
                  borderRadius: "20px",
                  padding: "32px 28px",
                  boxShadow: "0 4px 16px -2px rgba(15, 23, 42, 0.04)"
                }}>
                  <div className="mx-monochrome-icon-box">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--mx-primary)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>03. TECHNOLOGY</div>
                  <h3 className="mx-lime-col-title" style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "-0.02em" }}>Build to scale.</h3>
                  <p className="mx-lime-col-desc">
                    Create the digital infrastructure, products and systems your business needs to grow.
                  </p>
                  <div className="mx-lime-col-bottom-line"></div>
                </div>
              </div>

              {/* Tagline & CTA Bar */}
              <div style={{
                background: "linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)",
                border: "1px solid var(--mx-border)",
                borderRadius: "18px",
                padding: "24px 32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
                flexWrap: "wrap",
                position: "relative",
                zIndex: 2
              }}>
                <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--mx-text-heading)" }}>
                  Marketing attracts. AI accelerates. Technology scales.
                </div>
                <Link href="/services" className="mx-btn-lime">
                  <span>Find the Right Solution</span>
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
            5. BUILT AROUND YOUR BUSINESS & THE QUICKUPP WAY
            ========================================================================= */}
        <section className="mx-tab-section" style={{ padding: "40px 0 60px" }}>
          <div className="mx-container">
            <div style={{
              background: "#ffffff",
              border: "1px solid var(--mx-border)",
              borderRadius: "32px",
              padding: "56px 48px",
              boxShadow: "0 16px 36px -8px rgba(15, 23, 42, 0.05)"
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "48px", alignItems: "center" }}>
                {/* Left: Built Around Your Business */}
                <div>
                  <span className="mx-sub-badge">BUILT AROUND YOUR BUSINESS</span>
                  <h2 className="mx-section-heading" style={{ margin: "8px 0 16px" }}>
                    No One-Size-Fits-All Solutions.
                  </h2>
                  <p className="mx-tab-paragraph" style={{ marginBottom: "14px" }}>
                    Every business has different goals, challenges and opportunities.
                  </p>
                  <p className="mx-tab-paragraph" style={{ marginBottom: "14px" }}>
                    That&apos;s why we adapt our approach to your business stage, priorities and objectives.
                  </p>
                  <div style={{
                    padding: "16px 20px",
                    borderRadius: "14px",
                    background: "rgba(124, 58, 237, 0.05)",
                    border: "1px solid rgba(124, 58, 237, 0.15)",
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "var(--mx-primary)",
                    marginTop: "8px"
                  }}>
                    You don&apos;t need everything we offer. You need the right solution at the right time.
                  </div>
                </div>

                {/* Right: The Quickupp Way */}
                <div style={{
                  background: "#f8fafc",
                  border: "1px solid var(--mx-border)",
                  borderRadius: "24px",
                  padding: "36px 32px"
                }}>
                  <div style={{
                    fontSize: "12px",
                    fontWeight: "800",
                    color: "var(--mx-primary)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "16px"
                  }}>
                    THE QUICKUPP WAY
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                    {quickuppWayItems.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          background: "#ffffff",
                          border: "1px solid var(--mx-border)",
                          borderRadius: "12px",
                          padding: "12px 14px",
                          fontSize: "13.5px",
                          fontWeight: "700",
                          color: "var(--mx-text-heading)",
                          boxShadow: "0 2px 6px rgba(15, 23, 42, 0.02)"
                        }}
                      >
                        <span className="mx-goal-check" style={{ width: "20px", height: "20px", fontSize: "11px" }}>{idx + 1}</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <p style={{
                    fontSize: "14px",
                    lineHeight: "1.6",
                    color: "var(--mx-text-body)",
                    margin: 0,
                    fontWeight: "600"
                  }}>
                    That&apos;s how we turn business challenges into practical solutions and sustainable growth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. READY TO BUILD WHAT'S NEXT? (CTA Section)
            ========================================================================= */}
        <section className="mx-cta-section">
          <div className="mx-container">
            <div className="mx-cta-card">
              <div className="mx-cta-content">
                <span className="mx-sub-badge">READY TO BUILD WHAT&apos;S NEXT?</span>
                <h2 className="mx-cta-title">
                  Let&apos;s Turn Your Goals Into Action.
                </h2>
                <p className="mx-cta-desc" style={{ marginBottom: "8px" }}>
                  Whether you have a specific challenge, a new idea or a growth opportunity, let&apos;s explore what&apos;s possible.
                </p>
                <p className="mx-cta-desc" style={{ fontWeight: "700", color: "var(--mx-primary)" }}>
                  Marketing. AI. Technology. One Connected Growth Partner. Let&apos;s Start the Conversation.
                </p>
              </div>
              <div className="mx-cta-actions">
                <Link href="/contact" className="mx-btn-lime">
                  <span>Talk to Our Experts</span>
                  <div className="mx-btn-icon-circle">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </Link>
                <Link href="/contact" className="mx-btn-outline-white">
                  Start Your Project
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

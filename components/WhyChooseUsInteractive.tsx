"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function WhyChooseUsInteractive() {
  const [prosCount, setProsCount] = useState<number>(0);
  const [yearsCount, setYearsCount] = useState<number>(0);
  const [satisfactionCount, setSatisfactionCount] = useState<number>(0);
  const [onTimeCount, setOnTimeCount] = useState<number>(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [photoVisible, setPhotoVisible] = useState(false);
  const [filterCategory, setFilterCategory] = useState<"all" | "strategy" | "execution" | "scale">("all");
  const statsRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === photoRef.current) {
              setPhotoVisible(true);
            }
            if (entry.target === statsRef.current && !hasAnimated) {
              setHasAnimated(true);

              let pr = 0;
              const prTimer = setInterval(() => {
                pr += 1;
                if (pr >= 30) {
                  setProsCount(30);
                  clearInterval(prTimer);
                } else {
                  setProsCount(pr);
                }
              }, 45);

              let y = 0;
              const yTimer = setInterval(() => {
                y += 1;
                if (y >= 5) {
                  setYearsCount(5);
                  clearInterval(yTimer);
                } else {
                  setYearsCount(y);
                }
              }, 120);

              let s = 60;
              const sTimer = setInterval(() => {
                s += 2;
                if (s >= 98) {
                  setSatisfactionCount(98);
                  clearInterval(sTimer);
                } else {
                  setSatisfactionCount(s);
                }
              }, 35);

              let o = 60;
              const oTimer = setInterval(() => {
                o += 2;
                if (o >= 95) {
                  setOnTimeCount(95);
                  clearInterval(oTimer);
                } else {
                  setOnTimeCount(o);
                }
              }, 35);
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    if (photoRef.current) observer.observe(photoRef.current);
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  const whyBusinessesChoose = [
    {
      num: "01",
      category: "strategy",
      title: "Marketing + AI + Technology Under One Roof",
      desc: "Most businesses work with different partners for marketing, technology and automation. Quickupp brings these capabilities together—from digital marketing and AI solutions to websites, applications, automation and custom software. Our integrated approach helps different parts of your business work toward the same growth objectives.",
      subtext: "One partner. Multiple capabilities. One connected growth strategy.",
      tag: "Unified Ecosystem",
    },
    {
      num: "02",
      category: "strategy",
      title: "Proven Experience Across Industries",
      desc: "Different industries require different growth strategies. Our experience spans healthcare, real estate, interiors, education, travel, professional services, D2C and technology. We've worked with businesses at different stages—from establishing their digital presence to scaling customer acquisition and technology infrastructure.",
      subtext: "We bring cross-industry experience while keeping every solution specific to your business.",
      tag: "Cross-Industry Scale",
    },
    {
      num: "03",
      category: "strategy",
      title: "Strategy Before Execution",
      desc: "We don't believe in starting with a service. We start by understanding your business, objectives, target audience, market, competition and challenges. Only then do we recommend the right strategy, technology or combination of solutions.",
      subtext: "Because the right solution isn't the one that sounds impressive. It's the one that solves the right problem.",
      tag: "Strategic Alignment",
    },
    {
      num: "04",
      category: "execution",
      title: "Focused on Business Outcomes",
      desc: "Clicks, impressions, followers and completed projects are only part of the picture. What matters is what those activities do for your business. Our approach focuses on:",
      outcomes: [
        "More qualified leads",
        "Better customer acquisition",
        "Stronger brand visibility",
        "Improved marketing performance",
        "Greater operational efficiency",
        "Reduced repetitive work",
        "Better customer experiences",
        "Scalable digital infrastructure",
        "New opportunities for growth",
      ],
      subtext: "We focus on creating business value—not simply delivering tasks.",
      tag: "Measurable Impact",
    },
    {
      num: "05",
      category: "execution",
      title: "AI-First Approach",
      desc: "AI is changing how businesses market, operate and serve customers. We help businesses identify where AI can create genuine value instead of adopting AI simply because it's trending. From AI automation and AI chatbots to AI agents, lead qualification, intelligent workflows and custom AI solutions, we help businesses integrate AI into practical operations.",
      subtext: "We turn AI from an idea into an advantage.",
      tag: "Applied Intelligence",
    },
    {
      num: "06",
      category: "execution",
      title: "Customized Solutions. Never One-Size-Fits-All.",
      desc: "Every business has different goals, customers, budgets, processes and challenges. That's why we don't believe in cookie-cutter solutions. Whether you need a focused marketing campaign, AI automation workflow, new website or complete digital platform, we build our approach around your specific requirements and growth stage.",
      subtext: "Your business is unique. Your solution should be too.",
      tag: "Tailored Architecture",
    },
    {
      num: "07",
      category: "scale",
      title: "One Team. One Point of Accountability.",
      desc: "Managing multiple vendors can create unnecessary complexity. Different teams. Different strategies. Different timelines. Different priorities. With Quickupp, you can bring multiple growth requirements under one partner. Our teams work collaboratively across marketing, AI and technology, helping create better alignment, communication and execution.",
      subtext: "Less coordination. More progress.",
      tag: "Seamless Coordination",
    },
    {
      num: "08",
      category: "scale",
      title: "Built for Growth & Scale",
      desc: "We don't just think about what your business needs today. We consider what you'll need tomorrow. Our solutions are designed with scalability in mind—from marketing systems and automation workflows to websites, applications, software and digital platforms. As your business grows, your systems should grow with it.",
      subtext: "We build with your next stage in mind.",
      tag: "Future-Ready Architecture",
    },
    {
      num: "09",
      category: "scale",
      title: "Global Growth Perspective",
      desc: "Growth today isn't limited by geography. Quickupp Softech works with businesses across India and international markets, bringing a global perspective to digital marketing, technology and AI solutions. Our experience across different markets helps us understand that successful growth requires more than replicating the same strategy everywhere.",
      subtext: "Different markets. Different audiences. Smarter strategies.",
      tag: "International Reach",
    },
    {
      num: "10",
      category: "scale",
      title: "Transparency & Clear Communication",
      desc: "Great partnerships are built on trust. We believe you should understand what we're doing, why we're doing it and how it contributes to your objectives. Through clear communication, regular updates and transparent reporting, we keep you informed throughout the engagement.",
      subtext: "No unnecessary complexity. No confusing jargon. Just clear communication and accountable execution.",
      tag: "Total Clarity",
    },
  ];

  const filteredDistinctions = whyBusinessesChoose.filter(
    (item) => filterCategory === "all" || item.category === filterCategory
  );

  const scrollToPillars = (cat: "all" | "strategy" | "execution" | "scale") => {
    setFilterCategory(cat);
    if (cat === "all") {
      document.getElementById("pillar-01")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (cat === "strategy") {
      document.getElementById("pillar-01")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (cat === "execution") {
      document.getElementById("pillar-04")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (cat === "scale") {
      document.getElementById("pillar-07")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const approachPhases = [
    {
      step: "01",
      title: "UNDERSTAND",
      desc: "We learn about your business, customers, market, competition and objectives.",
    },
    {
      step: "02",
      title: "STRATEGIZE",
      desc: "We identify opportunities and create a practical strategy aligned with your goals.",
    },
    {
      step: "03",
      title: "BUILD",
      desc: "We bring together the right marketing, AI and technology capabilities to execute the solution.",
    },
    {
      step: "04",
      title: "OPTIMIZE",
      desc: "We measure performance, learn from results and continuously improve.",
    },
    {
      step: "05",
      title: "GROW",
      desc: "We help build systems and strategies that support long-term, scalable growth.",
    },
  ];

  return (
    <>
      <Header />
      <main className="mx-about-page">
        {/* =========================================================================
            1. HERO SECTION (WHY CHOOSE US)
            ========================================================================= */}
        <section className="mx-hero-section">
          <div className="mx-container">
            <div className="mx-hero-card">
              {/* Background Wave Graphic */}
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
                <span>WHY CHOOSE US</span>
              </div>

              {/* Hero Headline & Subtitle */}
              <h1 className="mx-hero-title">
                More Than a Service Provider. <span className="mx-gradient-text">Your Growth Partner.</span>
              </h1>
              <p className="mx-hero-subtitle">
                Choosing the right partner for business growth is about more than finding someone who can deliver a service. You need a team that understands your business goals, customers, market and the challenges between where you are today and where you want to be. At Quickupp Softech, we bring Marketing, AI and Technology together to help businesses build, improve and scale. We don&apos;t believe in selling disconnected services. We believe in solving business problems and building solutions that create measurable impact.
              </p>

              {/* Hero Action Button */}
              <Link href="/contact" className="mx-btn-lime">
                <span>Talk to a Growth Strategist</span>
                <div className="mx-btn-icon-circle">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </div>
              </Link>

              {/* Responsive Bottom Hero Stats Strip */}
              <div className="mx-hero-stats-strip">
                <div className="mx-hero-stat-badge">
                  <div className="mx-hero-stat-badge-num">120+</div>
                  <div className="mx-hero-stat-badge-text">Global Clients Served</div>
                </div>
                <div className="mx-hero-stat-badge">
                  <div className="mx-hero-stat-badge-num">200+</div>
                  <div className="mx-hero-stat-badge-text">Projects Delivered</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. PROOF BEHIND THE PROMISE (Stacked Photography + 4 Metrics)
            ========================================================================= */}
        <section className="mx-tab-section">
          <div className="mx-container">
            <div className="mx-tab-grid">
              {/* Left Column: Heading & Content */}
              <div>
                <span className="mx-sub-badge">PROOF BEHIND THE PROMISE</span>
                <h2 className="mx-section-heading">
                  Experience That Goes <span className="mx-gradient-text">Beyond the Pitch.</span>
                </h2>
                <p className="mx-tab-paragraph" style={{ marginBottom: "20px" }}>
                  We believe trust should be earned through experience, execution and results. Over the years, Quickupp Softech has worked with businesses across industries, markets and growth stages—helping them strengthen their digital presence, generate opportunities and build better systems.
                </p>

                <div style={{ marginTop: "24px", padding: "16px 20px", background: "rgba(124, 58, 237, 0.06)", borderLeft: "3px solid var(--mx-primary)", borderRadius: "8px" }}>
                  <p style={{ margin: 0, fontSize: "14.5px", fontWeight: 600, color: "var(--mx-text-heading)" }}>
                    Our numbers are more than statistics. They represent the businesses, projects and partnerships we&apos;ve built along the way.
                  </p>
                </div>
              </div>

              {/* Right Column: Stacked Dual Overlapping Photography with Directional Entrance Animation */}
              <div ref={photoRef} className={`mx-photo-stack ${photoVisible ? "is-inview" : ""}`}>
                <div className="mx-photo-img-wrap img-back">
                  <img
                    src="/images/home-two-about.jpg"
                    alt="Quickupp Engineering Culture"
                    className="mx-photo-img"
                  />
                </div>
                <div className="mx-photo-img-wrap img-front">
                  <img
                    src="/images/home1-about-01.jpg"
                    alt="Quickupp Strategy Collaboration"
                    className="mx-photo-img"
                  />
                </div>
              </div>
            </div>

            {/* 4-Metric Counter Strip with Smaller, Clean Typography */}
            <div
              ref={statsRef}
              className="mx-metrics-strip"
              style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", paddingTop: "32px" }}
            >
              <div className="mx-metric-card">
                <div className="mx-metric-num-row" style={{ gap: "4px", marginBottom: "4px" }}>
                  <span className="mx-metric-big-num" style={{ fontSize: "clamp(26px, 2.2vw, 34px)" }}>{prosCount}+</span>
                  <span className="mx-metric-sup" style={{ fontSize: "12.5px" }}>/ Pros</span>
                </div>
                <div className="mx-metric-label" style={{ fontSize: "13px" }}>Growth &amp; Technology Professionals</div>
              </div>

              <div className="mx-metric-card">
                <div className="mx-metric-num-row" style={{ gap: "4px", marginBottom: "4px" }}>
                  <span className="mx-metric-big-num" style={{ fontSize: "clamp(26px, 2.2vw, 34px)" }}>{yearsCount}+</span>
                  <span className="mx-metric-sup" style={{ fontSize: "12.5px" }}>/ Years</span>
                </div>
                <div className="mx-metric-label" style={{ fontSize: "13px" }}>Industry Experience</div>
              </div>

              <div className="mx-metric-card">
                <div className="mx-metric-num-row" style={{ gap: "4px", marginBottom: "4px" }}>
                  <span className="mx-metric-big-num" style={{ fontSize: "clamp(26px, 2.2vw, 34px)" }}>{satisfactionCount}%</span>
                  <span className="mx-metric-sup" style={{ fontSize: "12.5px" }}>/ Score</span>
                </div>
                <div className="mx-metric-label" style={{ fontSize: "13px" }}>Client Satisfaction</div>
              </div>

              <div className="mx-metric-card">
                <div className="mx-metric-num-row" style={{ gap: "4px", marginBottom: "4px" }}>
                  <span className="mx-metric-big-num" style={{ fontSize: "clamp(26px, 2.2vw, 34px)" }}>{onTimeCount}%</span>
                  <span className="mx-metric-sup" style={{ fontSize: "12.5px" }}>/ On-Time</span>
                </div>
                <div className="mx-metric-label" style={{ fontSize: "13px" }}>Projects Delivered On Time</div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "36px" }}>
              <Link href="/case-studies" className="mx-btn-lime">
                <span>Explore Our Work</span>
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
            3. WHY BUSINESSES CHOOSE QUICKUPP (Modern Sticky Split Showcase with Filter Navigation)
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
                <span className="mx-sub-badge">WHY BUSINESSES CHOOSE QUICKUPP</span>
                <h2 className="mx-section-heading" style={{ fontSize: "clamp(26px, 3vw, 38px)", marginBottom: "16px" }}>
                  10 Pillars That Power Your <br />
                  <span className="mx-gradient-text">Business Scale</span>
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
                    <span>Strategy &amp; Foundation</span>
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
                    <span>Scalability &amp; Trust</span>
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

              {/* Right Column: Numbered Distinction Cards Stack */}
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

                    {/* Point 04 Outcome Checklist */}
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

                    {/* Subtext Highlight */}
                    <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px dashed var(--mx-border)" }}>
                      <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: "var(--mx-primary)" }}>
                        {item.subtext}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. THE QUICKUPP DIFFERENCE
            ========================================================================= */}
        <section className="mx-lime-section" style={{ paddingTop: "20px" }}>
          <div className="mx-container">
            <div className="mx-lime-box">
              <div className="mx-lime-header">
                <span className="mx-lime-sub">THE QUICKUPP DIFFERENCE</span>
                <h2 className="mx-lime-title">
                  We Don&apos;t Just Execute. <span className="mx-gradient-text">We Think Growth.</span>
                </h2>
              </div>

              {/* Double Line Divider */}
              <div className="mx-lime-divider">
                <div className="mx-lime-divider-line"></div>
                <div className="mx-lime-divider-line"></div>
              </div>

              <div style={{ maxWidth: "840px", margin: "0 auto", textAlign: "center" }}>
                <p className="mx-tab-paragraph" style={{ marginBottom: "16px", fontSize: "16.5px" }}>
                  You may come to us asking for a website. We may identify an opportunity to improve your lead generation.
                </p>
                <p className="mx-tab-paragraph" style={{ marginBottom: "16px", fontSize: "16.5px" }}>
                  You may ask for automation. We may discover a larger operational opportunity.
                </p>
                <p className="mx-tab-paragraph" style={{ marginBottom: "20px", fontSize: "16.5px", fontWeight: 600, color: "var(--mx-text-heading)" }}>
                  That&apos;s because we don&apos;t simply execute instructions. We think like growth partners.
                </p>
                <div style={{ padding: "18px 24px", background: "#ffffff", border: "1px solid var(--mx-border)", borderRadius: "16px", display: "inline-block" }}>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--mx-primary)" }}>
                    We look at the bigger picture, challenge assumptions when necessary and identify opportunities that can create greater impact for your business.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. OUR APPROACH (Understand. Strategize. Build. Grow.)
            ========================================================================= */}
        <section className="mx-tab-section">
          <div className="mx-container">
            <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 36px" }}>
              <span className="mx-sub-badge">OUR APPROACH</span>
              <h2 className="mx-section-heading" style={{ marginBottom: "12px" }}>
                Understand. Strategize. Build. <span className="mx-gradient-text">Grow.</span>
              </h2>
              <p className="mx-tab-paragraph">
                We believe sustainable growth comes from doing the right things in the right order.
              </p>
            </div>

            <div className="mx-process-wrapper">
              {/* 5-Phase Clean Grid Cards */}
              <div className="mx-process-mini-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginTop: "12px" }}>
                {approachPhases.map((phase) => (
                  <div
                    key={phase.step}
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--mx-border)",
                      borderRadius: "18px",
                      padding: "24px 20px",
                      boxShadow: "0 4px 16px -2px rgba(15, 23, 42, 0.04)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--mx-primary)", letterSpacing: "0.08em", marginBottom: "8px" }}>
                        STEP {phase.step}
                      </div>
                      <div style={{ fontSize: "17px", fontWeight: 800, color: "var(--mx-text-heading)", marginBottom: "10px" }}>
                        {phase.title}
                      </div>
                      <p style={{ fontSize: "13.5px", color: "var(--mx-text-body)", margin: 0, lineHeight: "1.55" }}>
                        {phase.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "center", marginTop: "36px" }}>
                <Link href="/contact" className="mx-btn-lime">
                  <span>Start With a Growth Consultation</span>
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
            6. TRUSTED BY BUSINESSES. BUILT FOR AMBITION.
            ========================================================================= */}
        <section className="mx-tab-section" style={{ paddingTop: "20px" }}>
          <div className="mx-container">
            <div style={{ background: "#ffffff", border: "1px solid var(--mx-border)", borderRadius: "28px", padding: "50px 40px", textAlign: "center", boxShadow: "0 10px 30px -8px rgba(15, 23, 42, 0.05)" }}>
              <span className="mx-sub-badge">TRUSTED BY BUSINESSES. BUILT FOR AMBITION.</span>
              <h2 className="mx-section-heading" style={{ marginBottom: "16px" }}>
                From Growing Businesses to <span className="mx-gradient-text">Ambitious Brands.</span>
              </h2>
              <p className="mx-tab-paragraph" style={{ maxWidth: "780px", margin: "0 auto 16px" }}>
                Our work is built around long-term partnerships, measurable objectives and continuous improvement. 200+ projects. 120+ global clients. One commitment—to help businesses grow smarter.
              </p>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--mx-primary)", margin: 0 }}>
                We measure our success not only by what we deliver, but by the value we create for the businesses we work with.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. READY TO GROW DIFFERENTLY? (Bottom CTA Banner)
            ========================================================================= */}
        <section className="mx-cta-section">
          <div className="mx-container">
            <div className="mx-cta-card">
              <div className="mx-cta-content">
                <span className="mx-sub-badge">
                  READY TO GROW DIFFERENTLY?
                </span>
                <h2 className="mx-cta-title">
                  Let&apos;s Build What&apos;s Next.
                </h2>
                <p className="mx-cta-desc" style={{ marginBottom: "16px" }}>
                  Your business doesn&apos;t need more disconnected solutions. It needs the right strategy, the right technology and the right partner to bring it all together. Let&apos;s understand where your business is today, identify where the biggest opportunities lie and create a clear path toward what&apos;s next.
                </p>
                <p style={{ fontSize: "14.5px", color: "var(--mx-primary)", fontWeight: 600, margin: "0 0 8px 0" }}>
                  Marketing. AI. Technology. • One Partner for Your Growth.
                </p>
                <p style={{ fontSize: "14.5px", color: "var(--mx-text-body)", margin: 0 }}>
                  <strong style={{ color: "var(--mx-text-heading)" }}>Let&apos;s Build Your Growth Story.</strong>
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

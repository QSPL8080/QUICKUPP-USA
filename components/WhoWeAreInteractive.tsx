"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function WhoWeAreInteractive() {
  const [activeTab, setActiveTab] = useState<"marketing" | "ai" | "technology">("marketing");
  const [clientsCount, setClientsCount] = useState<number>(0);
  const [expertsCount, setExpertsCount] = useState<number>(0);
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [retentionCount, setRetentionCount] = useState<number>(0);
  const [sliderIndex, setSliderIndex] = useState<number>(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

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

          let e = 0;
          const eTimer = setInterval(() => {
            e += 1;
            if (e >= 30) {
              setExpertsCount(30);
              clearInterval(eTimer);
            } else {
              setExpertsCount(e);
            }
          }, 45);

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

          let r = 0;
          const rTimer = setInterval(() => {
            r += 3;
            if (r >= 98) {
              setRetentionCount(98);
              clearInterval(rTimer);
            } else {
              setRetentionCount(r);
            }
          }, 40);
        }
      },
      { threshold: 0.2 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  const teamMembers = [
    {
      name: "Alex Rivera",
      role: "Lead Full-Stack Architect",
      desc: "Architects scalable Next.js systems, high-throughput microservices, and secure cloud pipelines for enterprise clients.",
      img: "/images/team-img-01.jpg",
      socials: { linkedin: "https://linkedin.com", twitter: "https://x.com", github: "https://github.com" },
    },
    {
      name: "Priya Sharma",
      role: "Senior AI Solutions Specialist",
      desc: "Designs intelligent multi-agent workflows, autonomous RAG pipelines, and conversational WhatsApp business engines.",
      img: "/images/team-img-02.jpg",
      socials: { linkedin: "https://linkedin.com", twitter: "https://x.com", github: "https://github.com" },
    },
    {
      name: "Marcus Chen",
      role: "Principal Product Designer",
      desc: "Crafts high-converting UX design systems, interactive component libraries, and award-winning digital experiences.",
      img: "/images/team-img-03.jpg",
      socials: { linkedin: "https://linkedin.com", twitter: "https://x.com", github: "https://github.com" },
    },
    {
      name: "David Vance",
      role: "Performance Marketing Lead",
      desc: "Manages data-driven acquisition across Google, Meta, and LinkedIn with strict CAC benchmarks and ROAS scaling.",
      img: "/images/team-img-04.jpg",
      socials: { linkedin: "https://linkedin.com", twitter: "https://x.com", github: "https://github.com" },
    },
  ];

  const totalSlides = Math.ceil(teamMembers.length / 2);

  const handlePrevSlide = () => {
    setSliderIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNextSlide = () => {
    setSliderIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  };

  const currentTeamPair = teamMembers.slice(sliderIndex * 2, sliderIndex * 2 + 2);

  return (
    <>
      <Header />
      <main className="mx-about-page">
        {/* =========================================================================
            1. HERO SECTION (WHO WE ARE)
            ========================================================================= */}
        <section className="mx-hero-section">
          <div className="mx-container">
            <div className="mx-hero-seamless">
              {/* Background Wave Graphic */}
              <div className="mx-hero-bg-waves" aria-hidden="true">
                <svg viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 300C300 100 600 500 900 300C1050 200 1150 250 1200 300V600H0V300Z" fill="rgba(124, 58, 237, 0.02)" />
                  <path d="M0 400C250 250 500 550 800 350C1000 220 1100 320 1200 380" stroke="rgba(0, 210, 255, 0.3)" strokeWidth="2" strokeDasharray="8 8" />
                  <path d="M0 200C350 450 700 150 1050 380C1120 420 1180 400 1200 390" stroke="rgba(124, 58, 237, 0.18)" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Top Center Subtitle Badge matching Contact page */}
              <div className="mx-subtitle-badge">
                <span className="mx-badge-dot" />
                <span>Marketing, AI &amp; Technology Agency</span>
              </div>

              {/* Hero Headline & Subtitle */}
              <h1 className="mx-hero-title">
                Marketing. AI. Technology. <span className="mx-gradient-text">Built for Growth.</span>
              </h1>
              <p className="mx-hero-subtitle">
                Quickupp Softech is a full-service Marketing, AI &amp; Technology company helping ambitious businesses grow, scale and stay ahead in an increasingly digital world. We bring together the power of digital marketing, artificial intelligence and technology to help businesses attract the right customers, build stronger brands, improve operations and create meaningful digital experiences.
              </p>

              {/* Hero Action Button */}
              <Link href="/services" className="mx-btn-lime">
                <span>Explore All Services</span>
                <div className="mx-btn-icon-circle">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </div>
              </Link>

              {/* Responsive Bottom Hero Stats Strip (No Overlaps) */}
              <div className="mx-hero-stats-strip">
                <div className="mx-hero-stat-badge">
                  <div className="mx-hero-stat-badge-num">99%</div>
                  <div className="mx-hero-stat-badge-text">Client retention &amp; high-ROI delivery</div>
                </div>
                <div className="mx-hero-stat-badge">
                  <div className="mx-hero-stat-badge-num">24/7</div>
                  <div className="mx-hero-stat-badge-text">Global engineering &amp; strategy support</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. MARKETING. AI. TECHNOLOGY. (Three Capabilities. One Growth Partner.)
            ========================================================================= */}
        <section className="mx-tab-section">
          <div className="mx-container">
            <div className="mx-tab-grid">
              {/* Left Column: Heading & Interactive Tabs */}
              <div>
                <span className="mx-sub-badge">MARKETING. AI. TECHNOLOGY.</span>
                <h2 className="mx-section-heading">
                  Three Capabilities. <span className="mx-gradient-text">One Growth Partner.</span>
                </h2>
                <p className="mx-tab-paragraph" style={{ marginBottom: "20px" }}>
                  The way businesses grow is changing faster than ever. Today, customers discover brands through search engines, social media, AI platforms and digital experiences. At the same time, businesses are adopting automation and intelligent technologies to work faster, operate more efficiently and deliver better customer experiences. We bring these capabilities together under one roof.
                </p>

                {/* Switchable Pill Tabs */}
                <div className="mx-tabs-bar">
                  <button
                    type="button"
                    onClick={() => setActiveTab("marketing")}
                    className={`mx-tab-btn ${activeTab === "marketing" ? "is-active" : ""}`}
                  >
                    MARKETING
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("ai")}
                    className={`mx-tab-btn ${activeTab === "ai" ? "is-active" : ""}`}
                  >
                    AI
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("technology")}
                    className={`mx-tab-btn ${activeTab === "technology" ? "is-active" : ""}`}
                  >
                    TECHNOLOGY
                  </button>
                </div>

                {/* Tab Dynamic Content */}
                <div className="mx-tab-content-box">
                  {activeTab === "marketing" && (
                    <p className="mx-tab-paragraph">
                      We help businesses get discovered, generate demand and convert attention into customers. From social media marketing and SEO to Google Ads, Meta Ads, content marketing and lead generation, we create growth strategies designed to improve visibility, attract the right audience and deliver measurable business outcomes.
                    </p>
                  )}
                  {activeTab === "ai" && (
                    <p className="mx-tab-paragraph">
                      We help businesses use artificial intelligence to work smarter, automate repetitive processes and create better customer experiences. From AI chatbots and AI agents to workflow automation, AI-powered lead qualification and custom AI solutions, we help turn AI opportunities into practical solutions that create real business value.
                    </p>
                  )}
                  {activeTab === "technology" && (
                    <p className="mx-tab-paragraph">
                      We help businesses build the digital infrastructure they need to operate, compete and scale. From websites and mobile applications to SaaS platforms, CRM and ERP systems, web applications and custom software, we transform ideas and business requirements into scalable digital solutions.
                    </p>
                  )}
                </div>

                <div style={{ marginTop: "24px", padding: "16px 20px", background: "rgba(124, 58, 237, 0.06)", borderLeft: "3px solid var(--mx-primary)", borderRadius: "8px" }}>
                  <p style={{ margin: 0, fontSize: "14.5px", fontWeight: 600, color: "var(--mx-text-heading)" }}>
                    Marketing attracts. AI accelerates. Technology scales. Together, they create a stronger foundation for sustainable business growth.
                  </p>
                </div>
              </div>

              {/* Right Column: Stacked Dual Overlapping Photography */}
              <div className="mx-photo-stack">
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

            {/* 4-Metric Counter Strip with Top Line */}
            <div ref={statsRef} className="mx-metrics-strip">
              <div className="mx-metric-card">
                <div className="mx-metric-num-row">
                  <span className="mx-metric-big-num">{clientsCount}+</span>
                  <span className="mx-metric-sup">/ Clients</span>
                </div>
                <div className="mx-metric-label">Businesses Scaled</div>
              </div>

              <div className="mx-metric-card">
                <div className="mx-metric-num-row">
                  <span className="mx-metric-big-num">{expertsCount}+</span>
                  <span className="mx-metric-sup">/ Experts</span>
                </div>
                <div className="mx-metric-label">AI &amp; Tech Team</div>
              </div>

              <div className="mx-metric-card">
                <div className="mx-metric-num-row">
                  <span className="mx-metric-big-num">{projectsCount}+</span>
                  <span className="mx-metric-sup">/ Projects</span>
                </div>
                <div className="mx-metric-label">Solutions Deployed</div>
              </div>

              <div className="mx-metric-card">
                <div className="mx-metric-num-row">
                  <span className="mx-metric-big-num">{retentionCount}%</span>
                  <span className="mx-metric-sup">/ Retention</span>
                </div>
                <div className="mx-metric-label">Long-Term Partnerships</div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. MORE THAN AN AGENCY (Your Business. Our Expertise. One Growth Journey.)
            ========================================================================= */}
        <section className="mx-partnership-section">
          <div className="mx-container">
            <div className="mx-partnership-box">
              <div className="mx-partnership-header">
                <span className="mx-partnership-sub">MORE THAN AN AGENCY</span>
                <h2 className="mx-partnership-title">
                  Your Business. Our Expertise. <span className="mx-gradient-text">One Growth Journey.</span>
                </h2>
                <p style={{ fontSize: "16px", lineHeight: "1.7", color: "var(--mx-text-body)", marginTop: "16px" }}>
                  We believe the best partnerships go beyond simply completing tasks. Businesses don&apos;t need another vendor that only manages campaigns, builds websites or delivers software. They need a growth partner who understands where they are today, where they want to go and what it will take to get there. That&apos;s why we work as an extension of your team.
                </p>
                <p style={{ fontSize: "15px", lineHeight: "1.65", color: "var(--mx-text-body)", marginTop: "12px" }}>
                  Before recommending a strategy, campaign or technology solution, we take the time to understand your business, market, customers, competition, challenges and growth objectives.
                </p>
              </div>

              {/* Double Line Divider */}
              <div className="mx-partnership-divider">
                <div className="mx-partnership-divider-line"></div>
                <div className="mx-partnership-divider-line"></div>
              </div>

              {/* Whether your goal is to: 10 Key Goals Grid */}
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mx-primary)" }}>
                  Whether your goal is to:
                </span>
              </div>

              <div className="mx-goals-grid">
                <div className="mx-goal-item">
                  <div className="mx-goal-check">✓</div>
                  <span>Generate more qualified leads</span>
                </div>
                <div className="mx-goal-item">
                  <div className="mx-goal-check">✓</div>
                  <span>Increase your online visibility</span>
                </div>
                <div className="mx-goal-item">
                  <div className="mx-goal-check">✓</div>
                  <span>Build a stronger and more recognizable brand</span>
                </div>
                <div className="mx-goal-item">
                  <div className="mx-goal-check">✓</div>
                  <span>Improve marketing performance and ROI</span>
                </div>
                <div className="mx-goal-item">
                  <div className="mx-goal-check">✓</div>
                  <span>Automate repetitive business processes</span>
                </div>
                <div className="mx-goal-item">
                  <div className="mx-goal-check">✓</div>
                  <span>Implement AI into your operations</span>
                </div>
                <div className="mx-goal-item">
                  <div className="mx-goal-check">✓</div>
                  <span>Build a high-performing website or digital product</span>
                </div>
                <div className="mx-goal-item">
                  <div className="mx-goal-check">✓</div>
                  <span>Develop custom software or business platforms</span>
                </div>
                <div className="mx-goal-item">
                  <div className="mx-goal-check">✓</div>
                  <span>Improve customer experiences through technology</span>
                </div>
                <div className="mx-goal-item">
                  <div className="mx-goal-check">✓</div>
                  <span>Expand and scale into new markets</span>
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--mx-text-heading)", margin: 0 }}>
                  We bring together the right people, strategies, technology and tools to help you move forward with clarity and confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. BUILT AROUND YOUR BUSINESS. FOCUSED ON YOUR GROWTH.
            ========================================================================= */}
        <section className="mx-tab-section" style={{ paddingTop: "20px" }}>
          <div className="mx-container">
            <div style={{ background: "#ffffff", border: "1px solid var(--mx-border)", borderRadius: "28px", padding: "54px 44px", boxShadow: "0 10px 30px -8px rgba(15, 23, 42, 0.06)" }}>
              <div style={{ maxWidth: "880px", margin: "0 auto", textAlign: "center" }}>
                <span className="mx-sub-badge">BUILT AROUND YOUR BUSINESS</span>
                <h2 className="mx-section-heading" style={{ marginBottom: "20px" }}>
                  Focused on Your Growth
                </h2>
                <p className="mx-tab-paragraph" style={{ marginBottom: "16px" }}>
                  Every business is different. That&apos;s why we don&apos;t believe in a one-size-fits-all approach. Your challenges, customers, goals and opportunities are unique. Our approach is built around understanding those factors and creating the right combination of Marketing, AI and Technology to support your next stage of growth.
                </p>
                <p className="mx-tab-paragraph" style={{ marginBottom: "16px" }}>
                  Whether you need a focused solution in one area or an integrated strategy across multiple capabilities, Quickupp Softech provides the expertise and execution to help turn opportunities into measurable progress.
                </p>
                <p className="mx-tab-paragraph" style={{ fontWeight: 600, color: "var(--mx-primary)" }}>
                  Your next stage of growth may start with a marketing campaign, a stronger digital presence, an AI solution, a website, an automation workflow or a new digital product. Wherever it starts, we&apos;re here to help you build what comes next.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. TEAM MEMBERS & CULTURE SLIDER
            ========================================================================= */}
        <section className="mx-team-section">
          <div className="mx-container">
            <div className="mx-team-header-row">
              <div className="mx-team-header-left">
                <span className="mx-sub-badge">OUR TEAM &amp; EXPERTISE</span>
                <h2 className="mx-section-heading" style={{ margin: "4px 0 0" }}>
                  Meet our growth strategists, engineers, and AI architects in practice
                </h2>
              </div>
              <Link href="/about/our-approach" className="mx-btn-lime">
                <span>Explore Our Approach</span>
                <div className="mx-btn-icon-circle">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </div>
              </Link>
            </div>

            {/* Slider Cards Container */}
            <div className="mx-slider-wrap">
              <div className="mx-team-grid">
                {currentTeamPair.map((member, idx) => (
                  <div key={idx} className="mx-team-card">
                    <div className="mx-team-img-wrap">
                      <img src={member.img} alt={member.name} className="mx-team-img" />
                    </div>
                    <div className="mx-team-info">
                      <h3 className="mx-team-name">{member.name}</h3>
                      <div className="mx-team-role">{member.role}</div>
                      <div className="mx-team-divider"></div>
                      <p className="mx-team-desc">{member.desc}</p>
                      <div className="mx-social-row">
                        <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="mx-social-btn" aria-label="LinkedIn">
                          in
                        </a>
                        <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" className="mx-social-btn" aria-label="Twitter / X">
                          𝕏
                        </a>
                        <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="mx-social-btn" aria-label="GitHub">
                          ⌥
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slider Controls (< and >) */}
              <div className="mx-slider-controls">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  disabled={sliderIndex === 0}
                  className="mx-nav-arrow-btn"
                  aria-label="Previous Team Slide"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  disabled={sliderIndex === totalSlides - 1}
                  className="mx-nav-arrow-btn"
                  aria-label="Next Team Slide"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. READY TO BUILD WHAT'S NEXT? (Bottom CTA Banner)
            ========================================================================= */}
        <section className="mx-cta-section">
          <div className="mx-container">
            <div className="mx-cta-card">
              <div className="mx-cta-content">
                <span className="mx-sub-badge">
                  ONE PARTNER. THREE CAPABILITIES. UNLIMITED POSSIBILITIES.
                </span>
                <h2 className="mx-cta-title">
                  Ready to Build What&apos;s Next?
                </h2>
                <p style={{ fontSize: "17px", fontWeight: 700, color: "var(--mx-text-heading)", margin: "0 0 10px 0" }}>
                  Let&apos;s Turn Your Growth Goals Into Action.
                </p>
                <p className="mx-cta-desc" style={{ marginBottom: "16px" }}>
                  Your next stage of growth shouldn&apos;t be limited by disconnected agencies, outdated processes or technology that doesn&apos;t keep up with your ambitions. Whether you need to generate more customers, strengthen your digital presence, automate your business with AI, or build technology that helps you scale, Quickupp Softech brings the strategy, expertise and execution to make it happen.
                </p>
                <p style={{ fontSize: "14.5px", color: "var(--mx-primary)", fontWeight: 600, margin: "0 0 8px 0" }}>
                  Marketing to attract. • AI to accelerate. • Technology to scale.
                </p>
                <p style={{ fontSize: "14.5px", color: "var(--mx-text-body)", margin: 0 }}>
                  Let&apos;s understand your business, identify the opportunities and build a growth strategy designed around your goals. Your growth starts with a conversation. <strong style={{ color: "var(--mx-text-heading)" }}>LET&apos;S BUILD YOUR GROWTH STORY.</strong>
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

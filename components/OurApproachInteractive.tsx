"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function OurApproachInteractive() {
  const [activeTab, setActiveTab] = useState<"discovery" | "build" | "scale">("discovery");
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [expertsCount, setExpertsCount] = useState<number>(0);
  const [retentionCount, setRetentionCount] = useState<number>(0);
  const [sliderIndex, setSliderIndex] = useState<number>(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
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
      desc: "Architects resilient cloud architectures, Next.js applications, and continuous deployment pipelines.",
      img: "/images/team-img-01.jpg",
      socials: { linkedin: "https://linkedin.com", twitter: "https://x.com", github: "https://github.com" },
    },
    {
      name: "Priya Sharma",
      role: "Senior AI Solutions Specialist",
      desc: "Directs autonomous RAG pipelines, LLM agent orchestration, and automated enterprise CRM workflows.",
      img: "/images/team-img-02.jpg",
      socials: { linkedin: "https://linkedin.com", twitter: "https://x.com", github: "https://github.com" },
    },
    {
      name: "Marcus Chen",
      role: "Principal Product Designer",
      desc: "Translates complex business workflows into intuitive, high-conversion UI/UX design systems.",
      img: "/images/team-img-03.jpg",
      socials: { linkedin: "https://linkedin.com", twitter: "https://x.com", github: "https://github.com" },
    },
    {
      name: "David Vance",
      role: "Performance Marketing Lead",
      desc: "Spearheads data-driven ad experimentation, CAC minimization, and cross-channel ROAS growth.",
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
            1. HERO SECTION (Mindix Deep Forest Teal Container with Floating Stats)
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

              {/* Top Center Subtitle Badge matching Contact page */}
              <div className="mx-subtitle-badge">
                <span className="mx-badge-dot" />
                <span>Our Methodology &amp; Approach</span>
              </div>

              {/* Hero Headline & Subtitle */}
              <h1 className="mx-hero-title">
                Understand. Strategize. Build. <span className="mx-gradient-text">Optimize. Grow.</span>
              </h1>
              <p className="mx-hero-subtitle">
                A disciplined, data-driven framework connecting marketing strategy, intelligent automation, and robust software engineering into one predictable roadmap.
              </p>

              {/* Hero Action Button */}
              <Link href="/services" className="mx-btn-lime">
                <span>Explore Our Methodology</span>
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
                  <div className="mx-hero-stat-badge-num">5-Phase</div>
                  <div className="mx-hero-stat-badge-text">Disciplined lifecycle framework</div>
                </div>
                <div className="mx-hero-stat-badge">
                  <div className="mx-hero-stat-badge-num">100%</div>
                  <div className="mx-hero-stat-badge-text">Milestone transparency &amp; SLAs</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. METHODOLOGY TABS & DUAL PHOTO GRID (Reference Screenshot 2)
            ========================================================================= */}
        <section className="mx-tab-section">
          <div className="mx-container">
            <div className="mx-tab-grid">
              {/* Left Column: Heading & Interactive Tabs */}
              <div>
                <span className="mx-sub-badge">OUR METHODOLOGY</span>
                <h2 className="mx-section-heading">
                  From initial discovery to continuous scaling with radical transparency
                </h2>

                {/* Switchable Pill Tabs */}
                <div className="mx-tabs-bar">
                  <button
                    type="button"
                    onClick={() => setActiveTab("discovery")}
                    className={`mx-tab-btn ${activeTab === "discovery" ? "is-active" : ""}`}
                  >
                    01. Understand &amp; Strategize
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("build")}
                    className={`mx-tab-btn ${activeTab === "build" ? "is-active" : ""}`}
                  >
                    02. Build &amp; Deploy
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("scale")}
                    className={`mx-tab-btn ${activeTab === "scale" ? "is-active" : ""}`}
                  >
                    03. Optimize &amp; Scale
                  </button>
                </div>

                {/* Tab Dynamic Content */}
                <div className="mx-tab-content-box">
                  {activeTab === "discovery" && (
                    <p className="mx-tab-paragraph">
                      We dive deep into your market dynamics, ICP conversion barriers, unit economics, and competitive gaps. We listen first, audit your existing funnel and tech stack, and craft a clear prioritized roadmap designed to move the commercial needle.
                    </p>
                  )}
                  {activeTab === "build" && (
                    <p className="mx-tab-paragraph">
                      Our multidisciplinary execution pod works in tight 2-week agile sprints—launching high-ROI ad funnels, building Next.js web applications, and deploying custom AI automation workflows with weekly demo reviews and zero vendor silos.
                    </p>
                  )}
                  {activeTab === "scale" && (
                    <p className="mx-tab-paragraph">
                      Launching is not the finish line. We rigorously test conversion funnels, benchmark model response latencies, run multivariate CRO experiments, and scale what works to ensure compounding revenue and efficiency over time.
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Stacked Dual Overlapping Photography */}
              <div className="mx-photo-stack">
                <div className="mx-photo-img-wrap img-back">
                  <img
                    src="/images/home-two-about.jpg"
                    alt="Quickupp Strategy Workshop"
                    className="mx-photo-img"
                  />
                </div>
                <div className="mx-photo-img-wrap img-front">
                  <img
                    src="/images/home1-about-01.jpg"
                    alt="Quickupp Sprint Review"
                    className="mx-photo-img"
                  />
                </div>
              </div>
            </div>

            {/* 4-Metric Counter Strip with Top Line */}
            <div ref={statsRef} className="mx-metrics-strip">
              <div className="mx-metric-card">
                <div className="mx-metric-num-row">
                  <span className="mx-metric-big-num">{projectsCount}+</span>
                  <span className="mx-metric-sup">/ Launches</span>
                </div>
                <div className="mx-metric-label">Solutions Shipped</div>
              </div>

              <div className="mx-metric-card">
                <div className="mx-metric-num-row">
                  <span className="mx-metric-big-num">{expertsCount}+</span>
                  <span className="mx-metric-sup">/ Pod Experts</span>
                </div>
                <div className="mx-metric-label">Senior Practitioners</div>
              </div>

              <div className="mx-metric-card">
                <div className="mx-metric-num-row">
                  <span className="mx-metric-big-num">{retentionCount}%</span>
                  <span className="mx-metric-sup">/ Retention</span>
                </div>
                <div className="mx-metric-label">Long-Term Partnerships</div>
              </div>

              <div className="mx-metric-card">
                <div className="mx-metric-num-row">
                  <span className="mx-metric-big-num">14-Day</span>
                  <span className="mx-metric-sup">/ Sprints</span>
                </div>
                <div className="mx-metric-label">Rapid Shipping Cycles</div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. VIBRANT LIME "WHAT WE DO" CAPABILITIES CONTAINER (Reference Screenshot 3)
            ========================================================================= */}
        <section className="mx-lime-section">
          <div className="mx-container">
            <div className="mx-lime-box">
              <div className="mx-lime-header">
                <span className="mx-lime-sub">CORE DELIVERY PILLARS</span>
                <h2 className="mx-lime-title">
                  How we ensure predictable execution across every engagement
                </h2>
              </div>

              {/* Double Line Divider */}
              <div className="mx-lime-divider">
                <div className="mx-lime-divider-line"></div>
                <div className="mx-lime-divider-line"></div>
              </div>

              {/* 4-Column Feature Grid */}
              <div className="mx-lime-grid-4">
                <div className="mx-lime-col">
                  <div className="mx-lime-col-icon-wrap">🔍</div>
                  <h3 className="mx-lime-col-title">Deep Discovery</h3>
                  <p className="mx-lime-col-desc">
                    Aligning technical requirements and commercial targets before writing code or running ads.
                  </p>
                  <div className="mx-lime-col-bottom-line"></div>
                </div>

                <div className="mx-lime-col">
                  <div className="mx-lime-col-icon-wrap">⚡</div>
                  <h3 className="mx-lime-col-title">Unified Pods</h3>
                  <p className="mx-lime-col-desc">
                    Engineers, AI architects, and growth marketers collaborating synchronously under one unified strategy.
                  </p>
                  <div className="mx-lime-col-bottom-line"></div>
                </div>

                <div className="mx-lime-col">
                  <div className="mx-lime-col-icon-wrap">🧪</div>
                  <h3 className="mx-lime-col-title">Rigorous QA &amp; Testing</h3>
                  <p className="mx-lime-col-desc">
                    Automated end-to-end testing, security audits, and latency benchmarking on all deliverables.
                  </p>
                  <div className="mx-lime-col-bottom-line"></div>
                </div>

                <div className="mx-lime-col">
                  <div className="mx-lime-col-icon-wrap">📈</div>
                  <h3 className="mx-lime-col-title">Continuous CRO</h3>
                  <p className="mx-lime-col-desc">
                    Data-driven multivariate testing and algorithmic campaign optimization to compound returns.
                  </p>
                  <div className="mx-lime-col-bottom-line"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. TEAM MEMBERS & CULTURE SLIDER (Reference Screenshot 4)
            ========================================================================= */}
        <section className="mx-team-section">
          <div className="mx-container">
            <div className="mx-team-header-row">
              <div className="mx-team-header-left">
                <span className="mx-sub-badge">METHODOLOGY ARCHITECTS</span>
                <h2 className="mx-section-heading" style={{ margin: "4px 0 0" }}>
                  The strategists and engineers steering your growth roadmap
                </h2>
              </div>
              <Link href="/contact" className="mx-btn-lime">
                <span>Start Your Growth Plan</span>
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
            5. MINDIX-INSPIRED BOTTOM CTA
            ========================================================================= */}
        <section className="mx-cta-section">
          <div className="mx-container">
            <div className="mx-cta-card">
              <div className="mx-cta-content">
                <span className="mx-sub-badge">START WITH DISCOVERY</span>
                <h2 className="mx-cta-title">
                  Ready for a Disciplined Approach to Growth?
                </h2>
                <p className="mx-cta-desc">
                  Schedule a complimentary 30-minute discovery call to see how our 5-phase framework can accelerate your marketing and streamline your operations.
                </p>
              </div>
              <div className="mx-cta-actions">
                <Link href="/contact" className="mx-btn-lime">
                  <span>Book Discovery Session</span>
                  <div className="mx-btn-icon-circle">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </Link>
                <Link href="/services" className="mx-btn-outline-white">
                  Explore All Services
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


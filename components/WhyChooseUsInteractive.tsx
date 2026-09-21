"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function WhyChooseUsInteractive() {
  const [activeTab, setActiveTab] = useState<"engine" | "revenue" | "ai">("engine");
  const [roasCount, setRoasCount] = useState<number>(0);
  const [speedCount, setSpeedCount] = useState<number>(0);
  const [uptimeCount, setUptimeCount] = useState<number>(0);
  const [sliderIndex, setSliderIndex] = useState<number>(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let r = 0;
          const rTimer = setInterval(() => {
            r += 1;
            if (r >= 4) {
              setRoasCount(4.8);
              clearInterval(rTimer);
            } else {
              setRoasCount(r);
            }
          }, 100);

          let s = 0;
          const sTimer = setInterval(() => {
            s += 1;
            if (s >= 10) {
              setSpeedCount(10);
              clearInterval(sTimer);
            } else {
              setSpeedCount(s);
            }
          }, 60);

          let u = 90;
          const uTimer = setInterval(() => {
            u += 1;
            if (u >= 99) {
              setUptimeCount(99.9);
              clearInterval(uTimer);
            } else {
              setUptimeCount(u);
            }
          }, 30);
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
      desc: "Enterprise Next.js architecture, high-throughput microservices, and sub-second web performance.",
      img: "/images/team-img-01.jpg",
      socials: { linkedin: "https://linkedin.com", twitter: "https://x.com", github: "https://github.com" },
    },
    {
      name: "Priya Sharma",
      role: "Senior AI Solutions Specialist",
      desc: "Autonomous LLM agents, RAG document search, and conversational lead qualification bots.",
      img: "/images/team-img-02.jpg",
      socials: { linkedin: "https://linkedin.com", twitter: "https://x.com", github: "https://github.com" },
    },
    {
      name: "Marcus Chen",
      role: "Principal Product Designer",
      desc: "High-converting UI systems, Figma auto-layouts, and user experience conversion optimization.",
      img: "/images/team-img-03.jpg",
      socials: { linkedin: "https://linkedin.com", twitter: "https://x.com", github: "https://github.com" },
    },
    {
      name: "David Vance",
      role: "Performance Marketing Lead",
      desc: "Multi-channel paid acquisition across Google & Meta with strict CAC thresholds and ROAS scaling.",
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
                <span>The Quickupp Advantage</span>
              </div>

              {/* Hero Headline & Subtitle */}
              <h1 className="mx-hero-title">
                Why Ambitious Businesses <span className="mx-gradient-text">Choose Quickupp</span>
              </h1>
              <p className="mx-hero-subtitle">
                We eliminate fragmented vendors, slow delivery, and vanity metrics with a high-velocity Marketing, AI, and Software Engineering engine built for measurable growth.
              </p>

              {/* Hero Action Button */}
              <Link href="/services" className="mx-btn-lime">
                <span>Explore Our Solutions</span>
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
                  <div className="mx-hero-stat-badge-num">4.8x</div>
                  <div className="mx-hero-stat-badge-text">Average ad ROAS &amp; revenue lift</div>
                </div>
                <div className="mx-hero-stat-badge">
                  <div className="mx-hero-stat-badge-num">99.9%</div>
                  <div className="mx-hero-stat-badge-text">Cloud uptime &amp; enterprise SLA reliability</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. ADVANTAGE TABS & DUAL PHOTO GRID (Reference Screenshot 2)
            ========================================================================= */}
        <section className="mx-tab-section">
          <div className="mx-container">
            <div className="mx-tab-grid">
              {/* Left Column: Heading & Interactive Tabs */}
              <div>
                <span className="mx-sub-badge">UNFAIR ADVANTAGE</span>
                <h2 className="mx-section-heading">
                  A unified growth framework designed for speed, ROI &amp; engineering excellence
                </h2>

                {/* Switchable Pill Tabs */}
                <div className="mx-tabs-bar">
                  <button
                    type="button"
                    onClick={() => setActiveTab("engine")}
                    className={`mx-tab-btn ${activeTab === "engine" ? "is-active" : ""}`}
                  >
                    3-in-1 Engine
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("revenue")}
                    className={`mx-tab-btn ${activeTab === "revenue" ? "is-active" : ""}`}
                  >
                    Revenue-First Focus
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("ai")}
                    className={`mx-tab-btn ${activeTab === "ai" ? "is-active" : ""}`}
                  >
                    AI-Native Tooling
                  </button>
                </div>

                {/* Tab Dynamic Content */}
                <div className="mx-tab-content-box">
                  {activeTab === "engine" && (
                    <p className="mx-tab-paragraph">
                      Most businesses manage 3-4 disconnected vendors: an SEO agency, a paid media contractor, an AI tool provider, and a web developer. Quickupp unifies all three disciplines under one roof with single-source accountability, faster turnaround, and zero vendor friction.
                    </p>
                  )}
                  {activeTab === "revenue" && (
                    <p className="mx-tab-paragraph">
                      We track and optimize for what actually moves the needle: customer acquisition cost (CAC), pipeline volume, conversion lift, and customer lifetime value (LTV)—not vanity impressions, likes, or empty traffic.
                    </p>
                  )}
                  {activeTab === "ai" && (
                    <p className="mx-tab-paragraph">
                      From autonomous multi-agent CRM qualification bots and generative AI video avatars to Generative Engine Optimization (GEO/AEO), we equip your brand with cutting-edge AI capabilities that 10x your operational leverage.
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Stacked Dual Overlapping Photography */}
              <div className="mx-photo-stack">
                <div className="mx-photo-img-wrap img-back">
                  <img
                    src="/images/home1-about-01.jpg"
                    alt="Quickupp Engineering Excellence"
                    className="mx-photo-img"
                  />
                </div>
                <div className="mx-photo-img-wrap img-front">
                  <img
                    src="/images/home-two-about.jpg"
                    alt="Quickupp Client Collaboration"
                    className="mx-photo-img"
                  />
                </div>
              </div>
            </div>

            {/* 4-Metric Counter Strip with Top Line */}
            <div ref={statsRef} className="mx-metrics-strip">
              <div className="mx-metric-card">
                <div className="mx-metric-num-row">
                  <span className="mx-metric-big-num">{roasCount}x</span>
                  <span className="mx-metric-sup">/ ROAS</span>
                </div>
                <div className="mx-metric-label">Average Ad Return</div>
              </div>

              <div className="mx-metric-card">
                <div className="mx-metric-num-row">
                  <span className="mx-metric-big-num">{speedCount}x</span>
                  <span className="mx-metric-sup">/ Speed</span>
                </div>
                <div className="mx-metric-label">Rapid Sprint Delivery</div>
              </div>

              <div className="mx-metric-card">
                <div className="mx-metric-num-row">
                  <span className="mx-metric-big-num">{uptimeCount}%</span>
                  <span className="mx-metric-sup">/ Uptime</span>
                </div>
                <div className="mx-metric-label">Enterprise Reliability</div>
              </div>

              <div className="mx-metric-card">
                <div className="mx-metric-num-row">
                  <span className="mx-metric-big-num">0</span>
                  <span className="mx-metric-sup">/ Silos</span>
                </div>
                <div className="mx-metric-label">Unified Execution Pods</div>
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
                <span className="mx-lime-sub">THE QUICKUPP PILLARS</span>
                <h2 className="mx-lime-title">
                  Engineered to outperform traditional marketing &amp; dev agencies
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
                  <div className="mx-lime-col-icon-wrap">🎯</div>
                  <h3 className="mx-lime-col-title">Dedicated Senior Pods</h3>
                  <p className="mx-lime-col-desc">
                    Direct collaboration with senior growth marketers and architects—zero junior hand-offs or confusing middle managers.
                  </p>
                  <div className="mx-lime-col-bottom-line"></div>
                </div>

                <div className="mx-lime-col">
                  <div className="mx-lime-col-icon-wrap">⚡</div>
                  <h3 className="mx-lime-col-title">2-Week Agile Sprints</h3>
                  <p className="mx-lime-col-desc">
                    Rapid iteration cycles with live demo walkthroughs, continuous feature shipping, and fast turnaround times.
                  </p>
                  <div className="mx-lime-col-bottom-line"></div>
                </div>

                <div className="mx-lime-col">
                  <div className="mx-lime-col-icon-wrap">💻</div>
                  <h3 className="mx-lime-col-title">Modern Cloud Stacks</h3>
                  <p className="mx-lime-col-desc">
                    Production builds using Next.js 15, TypeScript, Tailwind, GraphQL, AWS, and serverless Edge infrastructure.
                  </p>
                  <div className="mx-lime-col-bottom-line"></div>
                </div>

                <div className="mx-lime-col">
                  <div className="mx-lime-col-icon-wrap">📊</div>
                  <h3 className="mx-lime-col-title">Transparent Dashboards</h3>
                  <p className="mx-lime-col-desc">
                    24/7 access to live conversion dashboards, pipeline metrics, ad attribution, and transparent sprint boards.
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
                <span className="mx-sub-badge">POD LEADERSHIP</span>
                <h2 className="mx-section-heading" style={{ margin: "4px 0 0" }}>
                  Experienced practitioners committed to your business scale
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
            5. MINDIX-INSPIRED BOTTOM CTA
            ========================================================================= */}
        <section className="mx-cta-section">
          <div className="mx-container">
            <div className="mx-cta-card">
              <div className="mx-cta-content">
                <span className="mx-sub-badge">EVALUATE YOUR ADVANTAGE</span>
                <h2 className="mx-cta-title">
                  Ready to Experience the Quickupp Growth Model?
                </h2>
                <p className="mx-cta-desc">
                  Book a free 30-minute growth roadmap audit with our senior strategy and technology team today.
                </p>
              </div>
              <div className="mx-cta-actions">
                <Link href="/contact" className="mx-btn-lime">
                  <span>Schedule Strategy Call</span>
                  <div className="mx-btn-icon-circle">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </Link>
                <Link href="/case-studies" className="mx-btn-outline-white">
                  View Verified ROI
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


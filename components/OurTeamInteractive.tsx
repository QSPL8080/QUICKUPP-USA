"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function OurTeamInteractive() {
  const [activeTab, setActiveTab] = useState<"leadership" | "engineering" | "marketing">("leadership");
  const [teamCount, setTeamCount] = useState<number>(0);
  const [sprintCount, setSprintCount] = useState<number>(0);
  const [yearsCount, setYearsCount] = useState<number>(0);
  const [sliderIndex, setSliderIndex] = useState<number>(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let t = 0;
          const tTimer = setInterval(() => {
            t += 1;
            if (t >= 30) {
              setTeamCount(30);
              clearInterval(tTimer);
            } else {
              setTeamCount(t);
            }
          }, 45);

          let s = 80;
          const sTimer = setInterval(() => {
            s += 1;
            if (s >= 99) {
              setSprintCount(99.4);
              clearInterval(sTimer);
            } else {
              setSprintCount(s);
            }
          }, 35);

          let y = 0;
          const yTimer = setInterval(() => {
            y += 1;
            if (y >= 10) {
              setYearsCount(10);
              clearInterval(yTimer);
            } else {
              setYearsCount(y);
            }
          }, 100);
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
      desc: "Specializes in cloud microservices, modern Next.js/TypeScript architecture, complex API integrations, and enterprise software security.",
      img: "/images/team-img-01.jpg",
      socials: { linkedin: "https://linkedin.com", twitter: "https://x.com", github: "https://github.com" },
    },
    {
      name: "Priya Sharma",
      role: "Senior AI Solutions Specialist",
      desc: "Pioneering intelligent AI agents, automated WhatsApp lead routing engines, predictive customer analytics, and generative AI pipelines.",
      img: "/images/team-img-02.jpg",
      socials: { linkedin: "https://linkedin.com", twitter: "https://x.com", github: "https://github.com" },
    },
    {
      name: "Marcus Chen",
      role: "Principal Product Designer",
      desc: "Crafts high-converting UX design systems, interactive component libraries, and award-winning digital experiences in Figma.",
      img: "/images/team-img-03.jpg",
      socials: { linkedin: "https://linkedin.com", twitter: "https://x.com", github: "https://github.com" },
    },
    {
      name: "David Vance",
      role: "Director of Performance Marketing",
      desc: "Managed over $15M in multi-channel ad spend across Google, Meta, LinkedIn, and TikTok with continuous ROAS optimization.",
      img: "/images/team-img-04.jpg",
      socials: { linkedin: "https://linkedin.com", twitter: "https://x.com", github: "https://github.com" },
    },
    {
      name: "Elena Rostova",
      role: "Head of Client Growth & Delivery",
      desc: "Ensures transparent client communication, seamless agile sprint delivery, and outcome-driven campaign execution for global clients.",
      img: "/images/team-img-05.jpg",
      socials: { linkedin: "https://linkedin.com", twitter: "https://x.com", github: "https://github.com" },
    },
    {
      name: "Liam O'Connor",
      role: "AI UGC & Media Production Lead",
      desc: "Oversees AI avatar video production, high-impact brand storytelling, digital clones, and rapid creative video iterations.",
      img: "/images/team-img-06.jpg",
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
                  <path d="M0 300C300 100 600 500 900 300C1050 200 1150 250 1200 300V600H0V300Z" fill="rgba(255,255,255,0.03)" />
                  <path d="M0 400C250 250 500 550 800 350C1000 220 1100 320 1200 380" stroke="rgba(0,210,255,0.25)" strokeWidth="2" strokeDasharray="8 8" />
                  <path d="M0 200C350 450 700 150 1050 380C1120 420 1180 400 1200 390" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Left Floating Stat Card */}
              <div className="mx-hero-float-card left">
                <div className="mx-hero-float-num">30+</div>
                <div className="mx-hero-float-text">Vetted senior engineers &amp; leads</div>
              </div>

              {/* Top Center Rating Badge */}
              <div className="mx-rating-pill">
                <div className="mx-avatar-stack">
                  <img src="/images/team-img-01.jpg" alt="Team Lead 1" />
                  <img src="/images/team-img-02.jpg" alt="Team Lead 2" />
                  <img src="/images/team-img-03.jpg" alt="Team Lead 3" />
                </div>
                <div className="mx-rating-info">
                  <span className="mx-stars">★★★★★</span>
                  <span>4.9/5 Star — Team Expertise Rating</span>
                </div>
              </div>

              {/* Hero Headline & Subtitle */}
              <h1 className="mx-hero-title">
                Meet Our Marketers, <span className="mx-gradient-text">AI Architects &amp; Engineers</span>
              </h1>
              <p className="mx-hero-subtitle">
                A distributed team of high-performing practitioners dedicated to helping your business dominate its category with modern technology, AI, and growth marketing.
              </p>

              {/* Hero Action Button */}
              <Link href="/contact" className="mx-btn-lime">
                <span>Join Our Growth Pods</span>
                <div className="mx-btn-icon-circle">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </div>
              </Link>

              {/* Right Floating Stat Card */}
              <div className="mx-hero-float-card right">
                <div className="mx-hero-float-num">100%</div>
                <div className="mx-hero-float-text">Founder-led execution &amp; agility</div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. CULTURE & TALENT TABS & DUAL PHOTO GRID (Reference Screenshot 2)
            ========================================================================= */}
        <section className="mx-tab-section">
          <div className="mx-container">
            <div className="mx-tab-grid">
              {/* Left Column: Heading & Interactive Tabs */}
              <div>
                <span className="mx-sub-badge">OUR TALENT &amp; CULTURE</span>
                <h2 className="mx-section-heading">
                  World-class talent operating with genuine ownership and zero red tape
                </h2>

                {/* Switchable Pill Tabs */}
                <div className="mx-tabs-bar">
                  <button
                    type="button"
                    onClick={() => setActiveTab("leadership")}
                    className={`mx-tab-btn ${activeTab === "leadership" ? "is-active" : ""}`}
                  >
                    Executive Leadership
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("engineering")}
                    className={`mx-tab-btn ${activeTab === "engineering" ? "is-active" : ""}`}
                  >
                    Engineering &amp; AI
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("marketing")}
                    className={`mx-tab-btn ${activeTab === "marketing" ? "is-active" : ""}`}
                  >
                    Growth Marketing
                  </button>
                </div>

                {/* Tab Dynamic Content */}
                <div className="mx-tab-content-box">
                  {activeTab === "leadership" && (
                    <p className="mx-tab-paragraph">
                      Our leadership combines over a decade of enterprise digital experience, having scaled high-growth SaaS platforms, healthcare networks, and D2C brands across North America and global markets with hands-on executive accountability.
                    </p>
                  )}
                  {activeTab === "engineering" && (
                    <p className="mx-tab-paragraph">
                      Senior software engineers, AI architects, and full-stack developers specializing in Next.js 15, TypeScript, autonomous agent orchestration, RAG pipelines, and cloud Edge computing engineered for sub-second speed.
                    </p>
                  )}
                  {activeTab === "marketing" && (
                    <p className="mx-tab-paragraph">
                      Data-driven performance media buyers, technical SEO/GEO strategists, and creative AI video producers focused on lowering customer acquisition costs and driving compounding pipeline revenue.
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Stacked Dual Overlapping Photography */}
              <div className="mx-photo-stack">
                <div className="mx-photo-img-wrap img-back">
                  <img
                    src="/images/home1-about-01.jpg"
                    alt="Quickupp Leadership Pod"
                    className="mx-photo-img"
                  />
                </div>
                <div className="mx-photo-img-wrap img-front">
                  <img
                    src="/images/home-two-about.jpg"
                    alt="Quickupp Engineering Pod"
                    className="mx-photo-img"
                  />
                </div>
              </div>
            </div>

            {/* 4-Metric Counter Strip with Top Line */}
            <div ref={statsRef} className="mx-metrics-strip">
              <div className="mx-metric-card">
                <div className="mx-metric-num-row">
                  <span className="mx-metric-big-num">{teamCount}+</span>
                  <span className="mx-metric-sup">/ Experts</span>
                </div>
                <div className="mx-metric-label">Global Team Members</div>
              </div>

              <div className="mx-metric-card">
                <div className="mx-metric-num-row">
                  <span className="mx-metric-big-num">{sprintCount}%</span>
                  <span className="mx-metric-sup">/ Sprints</span>
                </div>
                <div className="mx-metric-label">On-Time Milestone Delivery</div>
              </div>

              <div className="mx-metric-card">
                <div className="mx-metric-num-row">
                  <span className="mx-metric-big-num">{yearsCount}+</span>
                  <span className="mx-metric-sup">/ Years</span>
                </div>
                <div className="mx-metric-label">Industry Mastery</div>
              </div>

              <div className="mx-metric-card">
                <div className="mx-metric-num-row">
                  <span className="mx-metric-big-num">100%</span>
                  <span className="mx-metric-sup">/ Remote</span>
                </div>
                <div className="mx-metric-label">Distributed Velocity</div>
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
                <span className="mx-lime-sub">TEAM VALUES</span>
                <h2 className="mx-lime-title">
                  The core principles guiding our execution every day
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
                  <div className="mx-lime-col-icon-wrap">🛡️</div>
                  <h3 className="mx-lime-col-title">Radical Integrity</h3>
                  <p className="mx-lime-col-desc">
                    Unwavering honesty in client communication, transparent pricing, and verifiable performance metrics.
                  </p>
                  <div className="mx-lime-col-bottom-line"></div>
                </div>

                <div className="mx-lime-col">
                  <div className="mx-lime-col-icon-wrap">⚡</div>
                  <h3 className="mx-lime-col-title">Engineering Rigor</h3>
                  <p className="mx-lime-col-desc">
                    Clean code, scalable cloud architectures, sub-second load times, and automated end-to-end testing.
                  </p>
                  <div className="mx-lime-col-bottom-line"></div>
                </div>

                <div className="mx-lime-col">
                  <div className="mx-lime-col-icon-wrap">🤖</div>
                  <h3 className="mx-lime-col-title">AI-Native Innovation</h3>
                  <p className="mx-lime-col-desc">
                    Continuously leveraging cutting-edge LLM models, agents, and automation workflows to deliver unfair advantage.
                  </p>
                  <div className="mx-lime-col-bottom-line"></div>
                </div>

                <div className="mx-lime-col">
                  <div className="mx-lime-col-icon-wrap">🎯</div>
                  <h3 className="mx-lime-col-title">Customer Obsession</h3>
                  <p className="mx-lime-col-desc">
                    Your revenue targets, lead pipeline, and operational speed are our single north-star metric.
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
                <span className="mx-sub-badge">LEADERSHIP &amp; EXPERTS</span>
                <h2 className="mx-section-heading" style={{ margin: "4px 0 0" }}>
                  Meet our licensed strategists and technical experts in practice
                </h2>
              </div>
              <Link href="/career" className="mx-btn-lime">
                <span>View Open Roles</span>
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
                <span className="mx-sub-badge">WORK WITH THE BEST</span>
                <h2 className="mx-cta-title">
                  Ready to Scale With a Dedicated Growth Pod?
                </h2>
                <p className="mx-cta-desc">
                  Connect directly with our senior practitioners to design your customized marketing, AI, or engineering roadmap.
                </p>
              </div>
              <div className="mx-cta-actions">
                <Link href="/contact" className="mx-btn-lime">
                  <span>Schedule Consultation</span>
                  <div className="mx-btn-icon-circle">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </Link>
                <Link href="/about/who-we-are" className="mx-btn-outline-white">
                  About Who We Are
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

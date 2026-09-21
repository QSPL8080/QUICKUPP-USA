"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function OurApproachInteractive() {
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [expertsCount, setExpertsCount] = useState<number>(0);
  const [retentionCount, setRetentionCount] = useState<number>(0);
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

  const phases = [
    {
      num: "01",
      title: "Understand — Start With the Business",
      subtitle: "First, we listen. Then, we solve.",
      desc: "We understand your goals, customers, market, competition, challenges and current systems before recommending a solution.",
      link: "/contact"
    },
    {
      num: "02",
      title: "Strategize — Find What Moves the Needle",
      subtitle: "The right strategy creates the right direction.",
      desc: "We turn insights into a focused roadmap with clear priorities, actions and measurable objectives across Marketing, AI, and Tech.",
      link: "/services"
    },
    {
      num: "03",
      title: "Build — Bring Strategy to Life",
      subtitle: "One strategy. One connected execution.",
      desc: "Our teams execute across Marketing, AI and Technology—from performance marketing and SEO to AI automation, websites, and software.",
      link: "/services/web-design-development"
    },
    {
      num: "04",
      title: "Optimize — Measure. Learn. Improve.",
      subtitle: "Launching is not the goal. Better performance is.",
      desc: "We track performance, analyze results, and continuously improve what we build with CRO, A/B testing, and AI tuning.",
      link: "/services/paid-marketing"
    },
    {
      num: "05",
      title: "Grow — Build for What's Next",
      subtitle: "Today's solution becomes tomorrow's growth engine.",
      desc: "We scale what works, identify new opportunities, and evolve your solutions as your business grows.",
      link: "/contact"
    }
  ];

  const threePillars = [
    {
      num: "01",
      title: "Marketing Attracts",
      desc: "Build visibility, generate demand and turn attention into business opportunities across search engines, social media, and AI platforms."
    },
    {
      num: "02",
      title: "AI Accelerates",
      desc: "Implement intelligent AI workflows, automated lead handling, chatbots and operational automation to operate faster."
    },
    {
      num: "03",
      title: "Technology Scales",
      desc: "High-performance websites, custom web apps, mobile applications and scalable digital infrastructure engineered for growth."
    }
  ];

  return (
    <div className="scaleforge-page-root">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="sf-hero-section">
        <div className="sf-hero-bg">
          <img src="/images/hero-bg-2.png" alt="Our Approach Background" />
        </div>
        <div className="sf-container">
          <div className="sf-hero-grid">
            <div>
              <div className="sf-tag">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }}></span>
                OUR PROVEN METHODOLOGY
              </div>
              <h1 className="sf-hero-title">
                Understand. Strategize.<br />
                <span style={{ color: '#7c3aed' }}>Build. Optimize. Grow.</span>
              </h1>
              <div className="sf-hero-sub">A Disciplined Framework for Compounding Business Growth</div>
              <p className="sf-hero-desc">
                Growth is not accidental. It is the result of a disciplined, repeatable system that connects deep business discovery with strategic execution across Marketing, AI, and Technology.
              </p>
              <div className="sf-btn-row">
                <Link href="/contact" className="sf-btn-primary">
                  <span>Start With Discovery</span>
                  <div className="sf-btn-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </Link>
                <Link href="/about/our-team" className="sf-btn-secondary">
                  <span>Meet Our Team →</span>
                </Link>
              </div>
            </div>

            <div className="sf-hero-card">
              <div className="sf-hero-card-tag">PHILOSOPHY</div>
              <div className="sf-hero-card-count">5-Step</div>
              <div className="sf-hero-card-label">
                Lifecycle connecting discovery, strategy, sprint execution, optimization, and compounding growth.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 5 PHASES LIST */}
      <section className="sf-manifesto-section">
        <div className="sf-container">
          <div className="sf-manifesto-grid">
            <div className="sf-section-tag">THE 5 PHASES</div>
            <div>
              <p className="sf-manifesto-quote">
                "First, we listen. Then, we solve. The right strategy creates the right direction."
              </p>
              <div className="sf-manifesto-callout">
                One Strategy. One Connected Execution. Compounding Returns.
              </div>
            </div>
          </div>

          <div className="sf-advantages-list">
            {phases.map((ph, idx) => (
              <Link key={idx} href={ph.link} className="sf-advantage-row">
                <div>
                  <div className="sf-adv-num">PHASE {ph.num}</div>
                  <div className="sf-adv-title">{ph.title}</div>
                </div>
                <div>
                  <p className="sf-adv-desc">{ph.desc}</p>
                </div>
                <div className="sf-adv-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. VIDEO SHOWCASE BANNER */}
      <section className="sf-video-section">
        <div className="sf-container">
          <div className="sf-video-top">
            <div className="sf-section-tag">METHODOLOGY IN ACTION</div>
            <h2 className="sf-video-heading">Disciplined Sprint Delivery</h2>
          </div>
          <div className="sf-video-container">
            <video autoPlay muted loop playsInline poster="/images/about-video-poster.jpg">
              <source src="/images/about-showcase.mp4" type="video/mp4" />
            </video>
            <div className="sf-video-overlay">
              <div>
                <div className="sf-video-overlay-title">Iterative &amp; Data-Driven</div>
                <p className="sf-video-overlay-desc">
                  Every sprint delivers measurable value. We analyze user data, refine conversion funnels, and tune AI models to keep your business growing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. IMPACT STATS GRID (Live Counters) */}
      <section className="sf-impact-section" ref={statsRef}>
        <div className="sf-container">
          <div className="sf-impact-header">
            <div>
              <div className="sf-section-tag">EXECUTION EXCELLENCE</div>
              <h2 className="sf-video-heading">Proven by the Numbers</h2>
            </div>
          </div>

          <div className="sf-impact-grid">
            <div className="sf-impact-card">
              <div className="sf-impact-num">{projectsCount}+</div>
              <p className="sf-impact-text">
                Successful projects delivered across web platforms, marketing campaigns, and custom AI systems.
              </p>
            </div>
            <div className="sf-impact-card">
              <div className="sf-impact-num">{expertsCount}+</div>
              <p className="sf-impact-text">
                Specialized growth strategists, AI engineers, and full-stack software architects.
              </p>
            </div>
            <div className="sf-impact-card">
              <div className="sf-impact-num">{retentionCount}%</div>
              <p className="sf-impact-text">
                Client retention driven by consistent delivery and measurable commercial outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DARK PILLARS SECTION */}
      <section className="sf-methodology-section">
        <div className="sf-container">
          <div className="sf-methodology-top">
            <div>
              <div className="sf-stat-box-tag">CONNECTED GROWTH</div>
              <h2 className="sf-methodology-title">
                Three Pillars Connected Into One System
              </h2>
              <p className="sf-methodology-desc">
                When Marketing, AI, and Technology are integrated seamlessly, every dollar spent compounds in efficiency.
              </p>
            </div>

            <div className="sf-stat-box-dark">
              <div className="sf-stat-box-tag">AGILE VELOCITY</div>
              <div className="sf-stat-box-num">2-Wk</div>
              <div className="sf-stat-box-label">
                Sprint cycles with continuous testing, feedback, and feature deployments.
              </div>
            </div>
          </div>

          <div className="sf-pillars-grid">
            {threePillars.map((pil, idx) => (
              <div key={idx} className="sf-pillar-card">
                <div className="sf-pillar-num">PILLAR {pil.num}</div>
                <div className="sf-pillar-title">{pil.title}</div>
                <p className="sf-pillar-desc">{pil.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CLOSING CTA SECTION */}
      <section className="sf-cta-section" style={{ paddingTop: '80px' }}>
        <div className="sf-container">
          <div className="sf-cta-box">
            <div>
              <div className="sf-tag">START YOUR PROJECT</div>
              <h2 className="sf-cta-title">
                Ready for a Disciplined Approach to Growth?
              </h2>
              <p className="sf-cta-desc">
                Book a strategic discovery call to see how our 5-phase framework can accelerate your marketing pipeline and streamline your technology.
              </p>
              <div className="sf-cta-check">
                <span>✓</span> Free Discovery Session &amp; Growth Audit
              </div>
              <div className="sf-btn-row">
                <Link href="/contact" className="sf-btn-primary">
                  <span>Book a Discovery Session</span>
                  <div className="sf-btn-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </Link>
                <Link href="/about/our-team" className="sf-btn-secondary">
                  <span>Meet Our Team →</span>
                </Link>
              </div>
            </div>

            <div className="sf-cta-img-wrap">
              <img src="/images/cta-banner-bg.jpg" alt="Quickupp Softech Approach" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

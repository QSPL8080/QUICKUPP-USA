"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function WhyChooseUsInteractive() {
  const [roasCount, setRoasCount] = useState<number>(0);
  const [speedCount, setSpeedCount] = useState<number>(0);
  const [uptimeCount, setUptimeCount] = useState<number>(0);
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
            if (r >= 5) {
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

  const advantages = [
    {
      num: "01",
      title: "Three Capabilities Under One Roof",
      subtitle: "Marketing, AI & Technology working as one unified engine.",
      desc: "No more juggling disconnected agencies, freelance designers, and separate developers. We provide an integrated team and single-source accountability for your growth.",
      link: "/services"
    },
    {
      num: "02",
      title: "Revenue & Outcome-Driven Focus",
      subtitle: "We prioritize actual revenue and CAC over vanity clicks.",
      desc: "Every campaign, automation workflow, and software feature we build is directly mapped to business metrics: customer acquisition cost, conversion lift, and lifetime value.",
      link: "/services/paid-marketing"
    },
    {
      num: "03",
      title: "AI-First Unfair Advantage",
      subtitle: "Harness cutting-edge AI to automate operations and scale output.",
      desc: "From generative AI video production and automated lead qualification agents to AI Search Optimization (GEO & AEO), we ensure your business leads the modern digital landscape.",
      link: "/services/ai-automation-solutions"
    },
    {
      num: "04",
      title: "Enterprise-Grade Engineering Standards",
      subtitle: "Modern tech stacks engineered for speed, security, and scale.",
      desc: "We build on modern Next.js, TypeScript, cloud microservices, and robust APIs designed to handle massive traffic with sub-second speeds and 99.9% uptime.",
      link: "/services/web-design-development"
    },
    {
      num: "05",
      title: "Radical Transparency & Dedicated Pods",
      subtitle: "Direct access to senior strategists with zero middlemen.",
      desc: "No opaque retainers or confusing account management layers. You receive live analytics dashboards, weekly sprint demos, and direct access to your execution pod.",
      link: "/about/our-approach"
    },
    {
      num: "06",
      title: "Agile Sprints & Rapid Speed to Market",
      subtitle: "Deliver value in weeks rather than dragging out quarters.",
      desc: "Our agile 2-week sprint cycles allow us to rapidly launch high-converting landing pages, ad campaigns, AI workflows, and software features.",
      link: "/contact"
    }
  ];

  const methodologySteps = [
    {
      num: "01",
      title: "Discovery & Alignment",
      desc: "We conduct deep stakeholder interviews, analyze customer journeys, and audit your digital stack to identify high-impact growth levers."
    },
    {
      num: "02",
      title: "Integrated Roadmap",
      desc: "We design a cross-functional strategy connecting Marketing campaigns, AI automations, and Technology infrastructure into clear sprint milestones."
    },
    {
      num: "03",
      title: "Agile Sprint Execution",
      desc: "Our multidisciplinary pod executes in rapid sprints—launching campaigns, engineering features, and deploying automations with weekly demo reviews."
    },
    {
      num: "04",
      title: "Optimization & Scaling",
      desc: "We track real-time conversion data, run A/B split tests, tune AI models, and scale winning channels to compound your business returns."
    }
  ];

  return (
    <div className="scaleforge-page-root">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="sf-hero-section">
        <div className="sf-hero-bg">
          <img src="/images/hero-bg-2.png" alt="Why Choose Us Background" />
        </div>
        <div className="sf-container">
          <div className="sf-hero-grid">
            <div>
              <div className="sf-tag">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#def25c', display: 'inline-block' }}></span>
                WHY CHOOSE US
              </div>
              <h1 className="sf-hero-title">
                The Growth Partner Built for<br />
                <span style={{ color: '#def25c' }}>What's Next.</span>
              </h1>
              <div className="sf-hero-sub">Why Ambitious Businesses Partner With Quickupp Softech</div>
              <p className="sf-hero-desc">
                Modern business growth requires more than isolated marketing campaigns or disconnected software. It requires a synchronized ecosystem where Marketing drives customer acquisition, AI automates operations, and Technology provides a resilient foundation for scale.
              </p>
              <div className="sf-btn-row">
                <Link href="/contact" className="sf-btn-primary">
                  <span>Schedule a Consultation</span>
                  <div className="sf-btn-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </Link>
                <Link href="/about/our-approach" className="sf-btn-secondary">
                  <span>See Our Approach →</span>
                </Link>
              </div>
            </div>

            <div className="sf-hero-card">
              <div className="sf-hero-card-tag">OUR PROMISE</div>
              <div className="sf-hero-card-count">100%</div>
              <div className="sf-hero-card-label">
                Single-source accountability across Marketing, AI &amp; Software Engineering. No disconnected vendors, no excuses.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MANIFESTO & ADVANTAGES LIST (Interactive Hover Rows with Rotating Arrows) */}
      <section className="sf-manifesto-section">
        <div className="sf-container">
          <div className="sf-manifesto-grid">
            <div className="sf-section-tag">OUR ADVANTAGE</div>
            <div>
              <p className="sf-manifesto-quote">
                "We bring together strategy, creativity, artificial intelligence, and software engineering to solve real business challenges and build compounding growth."
              </p>
              <div className="sf-manifesto-callout">
                Three Capabilities. One Growth Partner. Zero Vendor Friction.
              </div>
            </div>
          </div>

          <div className="sf-advantages-list">
            {advantages.map((adv, idx) => (
              <Link key={idx} href={adv.link} className="sf-advantage-row">
                <div>
                  <div className="sf-adv-num">{adv.num} / ADVANTAGE</div>
                  <div className="sf-adv-title">{adv.title}</div>
                </div>
                <div>
                  <p className="sf-adv-desc">{adv.desc}</p>
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
            <div className="sf-section-tag">INTEGRATED EXECUTION</div>
            <h2 className="sf-video-heading">Engineered for Real-World Business Impact</h2>
          </div>
          <div className="sf-video-container">
            <video autoPlay muted loop playsInline poster="/images/about-video-poster.jpg">
              <source src="/images/about-showcase.mp4" type="video/mp4" />
            </video>
            <div className="sf-video-overlay">
              <div>
                <div className="sf-video-overlay-title">Strategy Meets Execution</div>
                <p className="sf-video-overlay-desc">
                  Whether launching high-converting multi-channel ad funnels, deploying custom AI workflow agents, or building enterprise cloud applications, our unified pod delivers results that scale.
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
              <div className="sf-section-tag">PROVEN TRACK RECORD</div>
              <h2 className="sf-video-heading">Measured in Real Business Outcomes</h2>
            </div>
          </div>

          <div className="sf-impact-grid">
            <div className="sf-impact-card">
              <div className="sf-impact-num">{roasCount}x</div>
              <p className="sf-impact-text">
                Average Return on Ad Spend (ROAS) generated across Google, Meta, and LinkedIn performance marketing campaigns.
              </p>
            </div>
            <div className="sf-impact-card">
              <div className="sf-impact-num">{speedCount}x</div>
              <p className="sf-impact-text">
                Operational speed increase with our automated lead routing, custom AI workflows, and CRM integrations.
              </p>
            </div>
            <div className="sf-impact-card">
              <div className="sf-impact-num">{uptimeCount}%</div>
              <p className="sf-impact-text">
                Uptime and enterprise reliability across all custom websites, cloud microservices, and mobile applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DARK METHODOLOGY SECTION */}
      <section className="sf-methodology-section">
        <div className="sf-container">
          <div className="sf-methodology-top">
            <div>
              <div className="sf-stat-box-tag">DISCIPLINED METHODOLOGY</div>
              <h2 className="sf-methodology-title">
                A 4-Step Framework Built for Predictable Scale
              </h2>
              <p className="sf-methodology-desc">
                We eliminate guesswork through a structured lifecycle that aligns marketing strategy, artificial intelligence, and software engineering at every phase.
              </p>
            </div>

            <div className="sf-stat-box-dark">
              <div className="sf-stat-box-tag">CLIENT RETENTION</div>
              <div className="sf-stat-box-num">98%</div>
              <div className="sf-stat-box-label">
                Long-term client partnerships built on transparency, compounding ROI, and consistent delivery.
              </div>
            </div>
          </div>

          <div className="sf-pillars-grid">
            {methodologySteps.map((step, idx) => (
              <div key={idx} className="sf-pillar-card">
                <div className="sf-pillar-num">PHASE {step.num}</div>
                <div className="sf-pillar-title">{step.title}</div>
                <p className="sf-pillar-desc">{step.desc}</p>
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
              <div className="sf-tag">LET'S BUILD TOGETHER</div>
              <h2 className="sf-cta-title">
                Ready to Accelerate Your Growth?
              </h2>
              <p className="sf-cta-desc">
                Discover how our integrated Marketing, AI, and Technology solutions can transform your customer acquisition and streamline your operations.
              </p>
              <div className="sf-cta-check">
                <span>✓</span> Free 30-Minute Growth Strategy &amp; Tech Audit
              </div>
              <div className="sf-btn-row">
                <Link href="/contact" className="sf-btn-primary">
                  <span>Schedule Your Consultation</span>
                  <div className="sf-btn-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </Link>
                <Link href="/services" className="sf-btn-secondary">
                  <span>Explore All Services →</span>
                </Link>
              </div>
            </div>

            <div className="sf-cta-img-wrap">
              <img src="/images/cta-banner-bg.jpg" alt="Quickupp Softech Growth" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function WhoWeAreInteractive() {
  const [clientsCount, setClientsCount] = useState<number>(0);
  const [retentionCount, setRetentionCount] = useState<number>(0);
  const [projectsCount, setProjectsCount] = useState<number>(0);
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
        }
      },
      { threshold: 0.2 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  const capabilities = [
    {
      num: "01",
      title: "Marketing",
      subtitle: "Attract the right customers.",
      desc: "Build visibility, generate demand and turn attention into business opportunities across SEO, AI Search Visibility (AEO/GEO), Paid Ads, Social Media, and Video Production.",
      link: "/services"
    },
    {
      num: "02",
      title: "AI & Automation",
      subtitle: "Automate smarter. Work faster.",
      desc: "Implement intelligent AI workflows, automated lead handling, AI video production, chatbots, and operational automation to help your business operate faster and scale efficiently.",
      link: "/services/ai-automation-solutions"
    },
    {
      num: "03",
      title: "Technology",
      subtitle: "Build the digital foundation for scale.",
      desc: "High-performance websites, custom web applications, mobile apps, enterprise software, and scalable digital infrastructure engineered for performance, security, and growth.",
      link: "/services/web-design-development"
    }
  ];

  const whyPartnerPillars = [
    {
      num: "01",
      title: "Three Capabilities Under One Roof",
      desc: "Marketing attracts customers. AI automates processes. Technology scales the foundation. When all three work together, your business moves faster and grows more predictably."
    },
    {
      num: "02",
      title: "No Disconnected Vendors",
      desc: "No more managing separate marketing agencies, AI tools, and development companies. We provide one integrated team and one clear strategy."
    },
    {
      num: "03",
      title: "Solutions Built Around Growth",
      desc: "We don't push one-size-fits-all packages. We build what your business needs to attract customers, streamline operations, and scale."
    },
    {
      num: "04",
      title: "Transparent Execution & Measurable Impact",
      desc: "Clear communication, honest advice, and solutions focused on measurable business outcomes—not vanity metrics."
    }
  ];

  return (
    <div className="scaleforge-page-root">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="sf-hero-section">
        <div className="sf-hero-bg">
          <img src="/images/hero-bg-2.png" alt="Who We Are Background" />
        </div>
        <div className="sf-container">
          <div className="sf-hero-grid">
            <div>
              <div className="sf-tag">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }}></span>
                WHO WE ARE
              </div>
              <h1 className="sf-hero-title">
                Marketing. AI. Technology.<br />
                <span style={{ color: '#7c3aed' }}>Built for Growth.</span>
              </h1>
              <div className="sf-hero-sub">Your Trusted Digital Growth Partner</div>
              <p className="sf-hero-desc">
                Quickupp Softech is a full-service Marketing, AI &amp; Technology company helping ambitious businesses grow, scale and stay ahead in an increasingly digital world.
              </p>
              <p className="sf-hero-desc" style={{ marginTop: "-16px" }}>
                We bring together the power of digital marketing, artificial intelligence and technology to help businesses attract the right customers, build stronger brands, improve operations and create meaningful digital experiences.
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
                <Link href="/about/why-choose-us" className="sf-btn-secondary">
                  <span>Why Choose Us →</span>
                </Link>
              </div>
            </div>

            <div className="sf-hero-card">
              <div className="sf-hero-card-tag">OUR PROMISE</div>
              <div className="sf-hero-card-count">100%</div>
              <div className="sf-hero-card-label">
                We don't just deliver services. We build solutions designed around your growth.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE CAPABILITIES SECTION */}
      <section className="sf-manifesto-section">
        <div className="sf-container">
          <div className="sf-manifesto-grid">
            <div className="sf-section-tag">THREE CAPABILITIES</div>
            <div>
              <p className="sf-manifesto-quote">
                "The way businesses grow is changing faster than ever. Quickupp Softech connects Marketing, AI, and Technology into one connected growth engine."
              </p>
              <div className="sf-manifesto-callout">
                Marketing attracts. AI accelerates. Technology scales.
              </div>
            </div>
          </div>

          <div className="sf-advantages-list">
            {capabilities.map((cap, idx) => (
              <Link key={idx} href={cap.link} className="sf-advantage-row">
                <div>
                  <div className="sf-adv-num">{cap.num} / CAPABILITY</div>
                  <div className="sf-adv-title">{cap.title}</div>
                </div>
                <div>
                  <p className="sf-adv-desc">{cap.desc}</p>
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
            <div className="sf-section-tag">SOLUTIONS DESIGNED FOR SCALE</div>
            <h2 className="sf-video-heading">Connecting Strategy, Creativity &amp; Engineering</h2>
          </div>
          <div className="sf-video-container">
            <video autoPlay muted loop playsInline poster="/images/about-video-poster.jpg">
              <source src="/images/about-showcase.mp4" type="video/mp4" />
            </video>
            <div className="sf-video-overlay">
              <div>
                <div className="sf-video-overlay-title">Built for Long-Term Partnership</div>
                <p className="sf-video-overlay-desc">
                  From performance marketing and SEO to AI automation, websites, mobile applications, and custom software, we combine execution to solve real business challenges.
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
              <div className="sf-section-tag">GLOBAL TRACK RECORD</div>
              <h2 className="sf-video-heading">Our Impact in Numbers</h2>
            </div>
          </div>

          <div className="sf-impact-grid">
            <div className="sf-impact-card">
              <div className="sf-impact-num">{clientsCount}+</div>
              <p className="sf-impact-text">
                Global clients served across the United States, UK, Middle East, and international markets.
              </p>
            </div>
            <div className="sf-impact-card">
              <div className="sf-impact-num">{retentionCount}%</div>
              <p className="sf-impact-text">
                Client retention rate driven by transparent communication and compounding business results.
              </p>
            </div>
            <div className="sf-impact-card">
              <div className="sf-impact-num">{projectsCount}+</div>
              <p className="sf-impact-text">
                Successful digital projects, AI automations, and custom software platforms delivered.
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
              <div className="sf-stat-box-tag">THE QUICKUPP DIFFERENCE</div>
              <h2 className="sf-methodology-title">
                Why Businesses Partner With Quickupp Softech
              </h2>
              <p className="sf-methodology-desc">
                We combine strategy, creativity, technology and execution to solve real business challenges without disconnected silos.
              </p>
            </div>

            <div className="sf-stat-box-dark">
              <div className="sf-stat-box-tag">LONG-TERM VALUE</div>
              <div className="sf-stat-box-num">3-in-1</div>
              <div className="sf-stat-box-label">
                Marketing, AI &amp; Technology unified under one roof for accelerated speed to market.
              </div>
            </div>
          </div>

          <div className="sf-pillars-grid">
            {whyPartnerPillars.map((pil, idx) => (
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
              <div className="sf-tag">LET'S TALK GROWTH</div>
              <h2 className="sf-cta-title">
                Ready to Grow Your Business? Let's Talk.
              </h2>
              <p className="sf-cta-desc">
                Whether you want to generate more leads, automate workflows, or build custom software, our multidisciplinary team is ready to help.
              </p>
              <div className="sf-cta-check">
                <span>✓</span> Free 30-Minute Growth Strategy &amp; Tech Consultation
              </div>
              <div className="sf-btn-row">
                <Link href="/contact" className="sf-btn-primary">
                  <span>Schedule a Consultation</span>
                  <div className="sf-btn-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </Link>
                <Link href="/about/why-choose-us" className="sf-btn-secondary">
                  <span>Why Choose Us →</span>
                </Link>
              </div>
            </div>

            <div className="sf-cta-img-wrap">
              <img src="/images/cta-banner-bg.jpg" alt="Quickupp Softech Who We Are" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

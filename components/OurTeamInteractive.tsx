"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function OurTeamInteractive() {
  const [teamCount, setTeamCount] = useState<number>(0);
  const [sprintCount, setSprintCount] = useState<number>(0);
  const [yearsCount, setYearsCount] = useState<number>(0);
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
      name: "Alex Vance",
      role: "Chief Executive Officer & Strategy Lead",
      desc: "Over 12 years building multi-channel customer acquisition systems, revenue growth architecture, and enterprise digital transformations.",
      num: "01"
    },
    {
      name: "Sophia Martinez",
      role: "Chief Technology Officer & Lead Architect",
      desc: "Specializes in cloud microservices, modern Next.js/TypeScript architecture, complex API integrations, and enterprise software security.",
      num: "02"
    },
    {
      name: "Vikram Malhotra",
      role: "Head of AI & Automation Solutions",
      desc: "Pioneering intelligent AI chatbots, automated WhatsApp lead routing engines, predictive customer analytics, and generative AI media.",
      num: "03"
    },
    {
      name: "Julia Chen",
      role: "Director of Performance Marketing",
      desc: "Managed over $15M in multi-channel ad spend across Google, Meta, LinkedIn, and TikTok with continuous ROAS optimization.",
      num: "04"
    },
    {
      name: "Marcus Reynolds",
      role: "Creative Director & Video Production Lead",
      desc: "Oversees AI UGC video production, high-impact brand storytelling, 3D visual assets, digital twins, and high-converting ad sets.",
      num: "05"
    },
    {
      name: "Priya Sharma",
      role: "Head of Client Growth & Delivery",
      desc: "Ensures transparent client communication, seamless agile sprint delivery, and outcome-driven campaign execution for global clients.",
      num: "06"
    }
  ];

  const values = [
    {
      num: "01",
      title: "Excellence Without Compromise",
      desc: "We take immense pride in our craft. Every line of code, ad campaign, and AI workflow is built to the highest standard of durability."
    },
    {
      num: "02",
      title: "Radical Transparency",
      desc: "No vanity metrics. We give honest advice, clear milestone reporting, and complete visibility into project performance."
    },
    {
      num: "03",
      title: "Continuous Innovation",
      desc: "We continuously research, test, and adopt emerging AI models and technologies to keep our clients ahead of the competition."
    },
    {
      num: "04",
      title: "Client-Obsessed Partnership",
      desc: "We treat your business like our own and measure our success solely by your compounding growth."
    }
  ];

  return (
    <div className="scaleforge-page-root">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="sf-hero-section">
        <div className="sf-hero-bg">
          <img src="/images/hero-bg-2.png" alt="Our Team Background" />
        </div>
        <div className="sf-container">
          <div className="sf-hero-grid">
            <div>
              <div className="sf-tag">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }}></span>
                OUR PEOPLE &amp; CULTURE
              </div>
              <h1 className="sf-hero-title">
                The Minds Behind<br />
                <span style={{ color: '#7c3aed' }}>Quickupp Softech.</span>
              </h1>
              <div className="sf-hero-sub">Multidisciplinary Experts Dedicated to Your Business Growth</div>
              <p className="sf-hero-desc">
                We are a global collective of growth strategists, AI researchers, software engineers, and creative producers united by a single mission: to build impactful digital solutions that empower ambitious businesses to lead their industries.
              </p>
              <div className="sf-btn-row">
                <Link href="/contact" className="sf-btn-primary">
                  <span>Work With Our Team</span>
                  <div className="sf-btn-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </Link>
                <Link href="/career" className="sf-btn-secondary">
                  <span>Explore Careers →</span>
                </Link>
              </div>
            </div>

            <div className="sf-hero-card">
              <div className="sf-hero-card-tag">EXPERTISE</div>
              <div className="sf-hero-card-count">30+</div>
              <div className="sf-hero-card-label">
                Senior growth strategists, software engineers, and AI architects working on your project.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TEAM ROSTER LIST */}
      <section className="sf-manifesto-section">
        <div className="sf-container">
          <div className="sf-manifesto-grid">
            <div className="sf-section-tag">LEADERSHIP</div>
            <div>
              <p className="sf-manifesto-quote">
                "We do not pass your business to junior interns. Every client engagement is directly led by senior domain experts."
              </p>
              <div className="sf-manifesto-callout">
                Senior Talent. Proven Track Record. Direct Communication.
              </div>
            </div>
          </div>

          <div className="sf-advantages-list">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="sf-advantage-row">
                <div>
                  <div className="sf-adv-num">{member.num} / {member.role}</div>
                  <div className="sf-adv-title">{member.name}</div>
                </div>
                <div>
                  <p className="sf-adv-desc">{member.desc}</p>
                </div>
                <div className="sf-adv-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. VIDEO SHOWCASE BANNER */}
      <section className="sf-video-section">
        <div className="sf-container">
          <div className="sf-video-top">
            <div className="sf-section-tag">GLOBAL DELIVERY HUBS</div>
            <h2 className="sf-video-heading">Connecting Talent Across US, UK, Middle East &amp; India</h2>
          </div>
          <div className="sf-video-container">
            <video autoPlay muted loop playsInline poster="/images/about-video-poster.jpg">
              <source src="/images/about-showcase.mp4" type="video/mp4" />
            </video>
            <div className="sf-video-overlay">
              <div>
                <div className="sf-video-overlay-title">Collaborative &amp; High-Performing</div>
                <p className="sf-video-overlay-desc">
                  Our distributed teams provide 24/7 delivery velocity, seamless sprint cycles, and responsive communication for clients worldwide.
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
              <div className="sf-section-tag">TEAM METRICS</div>
              <h2 className="sf-video-heading">Dedicated to Your Growth</h2>
            </div>
          </div>

          <div className="sf-impact-grid">
            <div className="sf-impact-card">
              <div className="sf-impact-num">{teamCount}+</div>
              <p className="sf-impact-text">
                Multidisciplinary team members across growth marketing, AI engineering, and software development.
              </p>
            </div>
            <div className="sf-impact-card">
              <div className="sf-impact-num">{sprintCount}%</div>
              <p className="sf-impact-text">
                On-time sprint delivery across client roadmaps and product engineering milestones.
              </p>
            </div>
            <div className="sf-impact-card">
              <div className="sf-impact-num">{yearsCount}+</div>
              <p className="sf-impact-text">
                Years of collective leadership experience executing enterprise transformations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GUIDING VALUES SECTION */}
      <section className="sf-methodology-section">
        <div className="sf-container">
          <div className="sf-methodology-top">
            <div>
              <div className="sf-stat-box-tag">CORE VALUES</div>
              <h2 className="sf-methodology-title">
                Principles That Guide Every Project
              </h2>
              <p className="sf-methodology-desc">
                We believe in craftsmanship, transparency, and relentless innovation to help our clients lead their industries.
              </p>
            </div>

            <div className="sf-stat-box-dark">
              <div className="sf-stat-box-tag">OUR CULTURE</div>
              <div className="sf-stat-box-num">100%</div>
              <div className="sf-stat-box-label">
                Client-obsessed execution with zero fluff or vanity metrics.
              </div>
            </div>
          </div>

          <div className="sf-pillars-grid">
            {values.map((val, idx) => (
              <div key={idx} className="sf-pillar-card">
                <div className="sf-pillar-num">VALUE {val.num}</div>
                <div className="sf-pillar-title">{val.title}</div>
                <p className="sf-pillar-desc">{val.desc}</p>
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
              <div className="sf-tag">JOIN FORCES</div>
              <h2 className="sf-cta-title">
                Ready to Work With Our Dedicated Team?
              </h2>
              <p className="sf-cta-desc">
                Whether you need a dedicated growth pod or specialized staff augmentation, we have the talent and systems ready for you.
              </p>
              <div className="sf-cta-check">
                <span>âœ“</span> Direct Access to Senior Strategists &amp; Engineers
              </div>
              <div className="sf-btn-row">
                <Link href="/contact" className="sf-btn-primary">
                  <span>Start a Conversation</span>
                  <div className="sf-btn-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </Link>
                <Link href="/career" className="sf-btn-secondary">
                  <span>View Careers →</span>
                </Link>
              </div>
            </div>

            <div className="sf-cta-img-wrap">
              <img src="/images/cta-banner-bg.jpg" alt="Quickupp Softech Team" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

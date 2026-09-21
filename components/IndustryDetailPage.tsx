"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { ServicePageData, ServiceBlock } from "@/lib/servicePageTypes";

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function FlipButton({
  href,
  label,
  className = "su-flip-btn",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link href={href} className={className}>
      <span className="su-flip-btn-text">
        <span className="su-flip-btn-label">{label}</span>
        <span className="su-flip-btn-hover-label">{label}</span>
      </span>
      <span className="su-flip-btn-icon">
        <ArrowIcon />
      </span>
    </Link>
  );
}

function AnimatedCheckList({ bullets }: { bullets: string[] }) {
  const [isVisible, setIsVisible] = useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={listRef} className={`su-check-list ${isVisible ? "su-check-list-visible" : ""}`}>
      {bullets.map((b, i) => (
        <div
          key={i}
          className="su-check-item"
          style={{
            transitionDelay: `${i * 90}ms`,
          }}
        >
          <span
            className="su-check-icon"
            style={{
              transitionDelay: `${i * 90 + 40}ms`,
            }}
          >
            <CheckIcon />
          </span>
          <span>{b}</span>
        </div>
      ))}
    </div>
  );
}

function LiveGrowthTelemetryCard({ crumb }: { crumb: string }) {
  const milestones = [
    { label: "Month 1", title: "Setup & Indexing", stat: "+45%", leads: "220+ leads", x: 30, y: 80 },
    { label: "Month 3", title: "Funnel Acceleration", stat: "+160%", leads: "840+ leads", x: 125, y: 58 },
    { label: "Month 6", title: "Scale & Dominance", stat: "+275%", leads: "1,620+ leads", x: 235, y: 34 },
    { label: "Scale Phase", title: "AI Compounding", stat: "+380%", leads: "3,450+ leads", x: 340, y: 12 },
  ];

  const [activeIdx, setActiveIdx] = useState(3);
  const activeMilestone = milestones[activeIdx];

  return (
    <div className="su-growth-card">
      {/* Card Header */}
      <div className="su-gc-header">
        <div>
          <div className="su-gc-tag">
            <span className="su-gc-dot" />
            <span>Growth Impact Engine</span>
          </div>
          <h3 className="su-gc-title">{crumb} Performance ROI</h3>
        </div>
        <div className="su-gc-badge">
          <span>↗ +380%</span>
        </div>
      </div>

      {/* Interactive Growth Trajectory Chart */}
      <div className="su-gc-chart-box">
        <div className="su-gc-chart-status">
          <span className="su-gc-phase-name">{activeMilestone.title}</span>
          <span className="su-gc-phase-stat">{activeMilestone.stat} Surge ({activeMilestone.leads})</span>
        </div>

        <div className="su-gc-svg-wrap">
          <svg viewBox="0 0 370 95" className="su-gc-svg" preserveAspectRatio="none">
            <defs>
              <linearGradient id="suGrowthLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="50%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="suGrowthArea" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Subtle Grid Lines */}
            <line x1="0" y1="25" x2="370" y2="25" stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1="0" y1="60" x2="370" y2="60" stroke="#e2e8f0" strokeDasharray="3 3" />

            {/* Area Fill */}
            <path
              d="M 0,86 C 50,84 80,66 125,58 C 175,48 195,40 235,34 C 285,26 305,16 370,10 L 370,95 L 0,95 Z"
              fill="url(#suGrowthArea)"
            />

            {/* Smooth Growth Line */}
            <path
              d="M 0,86 C 50,84 80,66 125,58 C 175,48 195,40 235,34 C 285,26 305,16 370,10"
              fill="none"
              stroke="url(#suGrowthLine)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Data Points */}
            {milestones.map((m, idx) => {
              const isSelected = activeIdx === idx;
              return (
                <g
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  onMouseEnter={() => setActiveIdx(idx)}
                  style={{ cursor: "pointer" }}
                >
                  {isSelected && (
                    <circle cx={m.x} cy={m.y} r="9" fill="none" stroke="#7c3aed" strokeWidth="2" opacity="0.35" />
                  )}
                  <circle
                    cx={m.x}
                    cy={m.y}
                    r={isSelected ? 5.5 : 4}
                    fill={isSelected ? "#7c3aed" : "#2563eb"}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Milestone Switcher Tabs */}
        <div className="su-gc-tabs">
          {milestones.map((m, idx) => (
            <button
              key={idx}
              type="button"
              className={`su-gc-tab ${activeIdx === idx ? "is-active" : ""}`}
              onClick={() => setActiveIdx(idx)}
              onMouseEnter={() => setActiveIdx(idx)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2 Clear Metric Rows */}
      <div className="su-gc-metrics">
        <div className="su-gc-metric-row">
          <div className="su-gc-metric-head">
            <span className="su-gc-metric-title">Search &amp; Organic Acquisition</span>
            <span className="su-gc-metric-pill su-pill-blue">+320%</span>
          </div>
          <div className="su-gc-bar-track">
            <div className="su-gc-bar-fill su-fill-blue" style={{ width: "86%" }} />
          </div>
        </div>

        <div className="su-gc-metric-row">
          <div className="su-gc-metric-head">
            <span className="su-gc-metric-title">High-Intent Lead Volume</span>
            <span className="su-gc-metric-pill su-pill-purple">+245%</span>
          </div>
          <div className="su-gc-bar-track">
            <div className="su-gc-bar-fill su-fill-purple" style={{ width: "74%" }} />
          </div>
        </div>
      </div>

      {/* Bottom KPI 3-Tile Summary */}
      <div className="su-gc-kpis">
        <div className="su-gc-kpi-item">
          <span className="su-gc-kpi-val">&lt; 15m</span>
          <span className="su-gc-kpi-lbl">Lead Response</span>
        </div>
        <div className="su-gc-kpi-item">
          <span className="su-gc-kpi-val">4.8x</span>
          <span className="su-gc-kpi-lbl">Pipeline ROI</span>
        </div>
        <div className="su-gc-kpi-item">
          <span className="su-gc-kpi-val">100%</span>
          <span className="su-gc-kpi-lbl">Enterprise Safe</span>
        </div>
      </div>
    </div>
  );
}

export default function IndustryDetailPage({ data }: { data: ServicePageData }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const marqueeTokens = [
    "Data-Driven ROI",
    "Omnichannel Visibility",
    "AI Workflow Automation",
    "High-Intent Lead Gen",
    "Domain-Specific Strategy",
    "Performance Engineering",
    "Full-Funnel Execution",
    "Continuous Optimization",
  ];

  return (
    <div className="su-ind-page-wrapper">
      <Header />


      {/* =================================================================
          1. HERO SECTION (SaleUnion Service Hero)
          ================================================================= */}
      <section className="su-ind-hero">
        <div className="su-hero-glow-1" />
        <div className="su-hero-glow-2" />
        <div className="su-container">
          <div className="su-hero-content">
            <div className="su-badge">
              <span className="su-badge-dot" />
              {data.heroEyebrow || data.crumb} Growth &amp; AI Ecosystem
            </div>

            <h1 className="su-hero-title">
              {data.heroTitle}
            </h1>

            {data.heroParagraphs && data.heroParagraphs[0] && (
              <p className="su-hero-desc">{data.heroParagraphs[0]}</p>
            )}

            <div className="su-hero-actions">
              <FlipButton
                href={data.heroCta?.href || "/contact"}
                label={data.heroCta?.label || "Get Industry Strategy"}
              />
              <a href="#services-breakdown" className="su-secondary-btn">
                <span>Explore Capabilities</span>
                <span>↓</span>
              </a>
            </div>

            {/* Strategic Overview Box */}
            {data.heroParagraphs && data.heroParagraphs.length > 1 && (
              <div className="su-overview-box">
                <div className="su-overview-box-header">
                  <div className="su-overview-title">
                    <span className="su-overview-sparkle">✦</span>
                    Market Opportunity &amp; Strategic Execution
                  </div>
                  <span className="su-overview-badge">
                    <span className="su-badge-dot" />
                    Strategic Blueprint
                  </span>
                </div>
                <div className="su-overview-body">
                  <p className="su-overview-desc">{data.heroParagraphs[1]}</p>
                  {data.heroParagraphs[2] && (
                    <p className="su-overview-desc" style={{ marginTop: "12px" }}>
                      {data.heroParagraphs[2]}
                    </p>
                  )}
                </div>
                <div className="su-overview-tags">
                  <span className="su-tag-chip">⚡ Full-Funnel Growth</span>
                  <span className="su-tag-chip">🎯 High-Intent Lead Gen</span>
                  <span className="su-tag-chip">🤖 AI Workflow Automation</span>
                  <span className="su-tag-chip">📈 Data-Driven Scaling</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =================================================================
          2. GEOMETRIC VECTOR MARQUEE TICKER (SaleUnion Ticker)
          ================================================================= */}
      <div className="su-marquee-wrap">
        <div className="su-marquee-track">
          <div className="su-marquee-group">
            {marqueeTokens.map((token, i) => (
              <div key={i} className="su-marquee-item">
                <span className="su-marquee-icon"><StarIcon /></span>
                <span>{token}</span>
              </div>
            ))}
          </div>
          <div className="su-marquee-group" aria-hidden="true">
            {marqueeTokens.map((token, i) => (
              <div key={`dup-${i}`} className="su-marquee-item">
                <span className="su-marquee-icon"><StarIcon /></span>
                <span>{token}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =================================================================
          3. NEXT-GEN MANIFESTO SECTION
          ================================================================= */}
      <section className="su-manifesto-section">
        <div className="su-container">
          <div className="su-manifesto-badge">
            Next-Gen Industry Agency
          </div>
          <h2 className="su-manifesto-quote">
            We architect scalable digital growth systems, AI workflows, and high-conversion infrastructure engineered specifically for {data.crumb} leaders.
          </h2>
          <div className="su-manifesto-pills">
            <span className="su-manifesto-pill">Targeted Acquisition</span>
            <span className="su-manifesto-pill">Data Precision</span>
            <span className="su-manifesto-pill">AI Workflow Automation</span>
            <span className="su-manifesto-pill">High-Ticket Lead Generation</span>
            <span className="su-manifesto-pill">Continuous Scalability</span>
          </div>
        </div>
      </section>

      {/* =================================================================
          4. MEASURED IMPACT / 3 METRIC CARDS SECTION
          ================================================================= */}
      <section className="su-impact-section">
        <div className="su-container">
          <div className="su-section-header">
            <div className="su-badge">
              <span className="su-badge-dot" />
              Proven Impact
            </div>
            <h2 className="su-section-title">Measurable Outcomes for {data.crumb}</h2>
            <p className="su-section-desc">
              Precision execution backed by domain knowledge, intelligent automation, and compounding ROI.
            </p>
          </div>

          <div className="su-impact-grid">
            {/* Card 1: Quality */}
            <div className="su-impact-card">
              <div>
                <div className="su-impact-top">
                  <span className="su-impact-tag">01 / Strategy</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#10b981" }}>✦ VERIFIED</span>
                </div>
                <div className="su-impact-label" style={{ fontSize: "24px", lineHeight: 1.25, marginTop: "12px" }}>
                  Excellence Through Domain Precision
                </div>
              </div>
              <p className="su-impact-desc" style={{ marginTop: "24px" }}>
                Every solution is architected specifically around the unit economics and conversion dynamics of {data.crumb}.
              </p>
            </div>

            {/* Card 2: Percentage Counter */}
            <div className="su-impact-card">
              <div>
                <div className="su-impact-top">
                  <span className="su-impact-tag">02 / Satisfaction</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#0284c7" }}>RETENTION</span>
                </div>
                <div className="su-impact-number">98%</div>
                <div className="su-impact-label">Client Retention &amp; Growth</div>
              </div>
              <p className="su-impact-desc">
                High client satisfaction driven by transparent reporting, proactive iteration, and sustained growth.
              </p>
            </div>

            {/* Card 3: Dark Counter */}
            <div className="su-impact-card su-impact-card-dark">
              <div>
                <div className="su-impact-top">
                  <span className="su-impact-tag">03 / Multiplier</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#00d2ff" }}>VELOCITY</span>
                </div>
                <div className="su-impact-number">3.8x</div>
                <div className="su-impact-label">Average Pipeline &amp; ROAS</div>
              </div>
              <p className="su-impact-desc">
                Accelerating conversion cycles and qualified enquiries through integrated search, paid ads, and AI nurturing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          5. DYNAMIC BLOCKS & CAPABILITIES BREAKDOWN
          ================================================================= */}
      <div id="services-breakdown">
        {data.blocks.map((block: ServiceBlock, idx: number) => {
          switch (block.type) {
            case "descPairs":
              return (
                <section key={idx} className="su-capabilities-section">
                  <div className="su-container">
                    <div className="su-section-header">
                      <div className="su-badge">
                        <span className="su-badge-dot" />
                        {block.subtitle || "Capabilities"}
                      </div>
                      <h2 className="su-section-title">{block.title || "Industry Solutions"}</h2>
                      {block.desc && <p className="su-section-desc">{block.desc}</p>}
                    </div>
                  </div>

                  {/* 3ss: Infinite Looping Cards Track (SaleUnion Style Loop) */}
                  <div className="su-cards-loop-wrapper">
                    <div className="su-cards-loop-track">
                      {block.items.map((item, i) => {
                        const isTurquoise = i % 2 !== 0;
                        return (
                          <div
                            key={`loop1-${i}`}
                            className={`su-loop-card ${isTurquoise ? "turquoise" : "off-white"}`}
                          >
                            <div>
                              <div className="su-cap-top">
                                <span className="su-cap-num">0{i + 1} / SERVICE</span>
                                <span className="su-cap-arrow">
                                  <ArrowIcon />
                                </span>
                              </div>
                              <h3 className="su-cap-title">{item.title}</h3>
                              <p className="su-cap-desc">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                      {/* Loop duplicate set for seamless infinite scrolling */}
                      {block.items.map((item, i) => {
                        const isTurquoise = i % 2 !== 0;
                        return (
                          <div
                            key={`loop2-${i}`}
                            className={`su-loop-card ${isTurquoise ? "turquoise" : "off-white"}`}
                            aria-hidden="true"
                          >
                            <div>
                              <div className="su-cap-top">
                                <span className="su-cap-num">0{i + 1} / SERVICE</span>
                                <span className="su-cap-arrow">
                                  <ArrowIcon />
                                </span>
                              </div>
                              <h3 className="su-cap-title">{item.title}</h3>
                              <p className="su-cap-desc">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {block.cta && (
                    <div style={{ textAlign: "center", marginTop: "36px" }}>
                      <FlipButton href={block.cta.href} label={block.cta.label} />
                    </div>
                  )}
                </section>
              );

            case "list":
              return (
                <section key={idx} className="su-segments-section">
                  <div className="su-container">
                    <div className="su-section-header">
                      <div className="su-badge">
                        <span className="su-badge-dot" />
                        {block.subtitle || "Target Focus"}
                      </div>
                      <h2 className="su-section-title">{block.title}</h2>
                      {block.desc && <p className="su-section-desc">{block.desc}</p>}
                    </div>

                    {/* 5ss: Animated & Proper Segment Cards */}
                    <div className="su-segments-grid">
                      {block.items.map((item, i) => (
                        <div key={i} className="su-segment-item">
                          <div className="su-segment-left">
                            <span className="su-segment-icon">
                              <CheckIcon />
                            </span>
                            <span>{item}</span>
                          </div>
                          <span className="su-segment-badge">
                            0{i + 1}
                          </span>
                        </div>
                      ))}
                    </div>

                    {block.cta && (
                      <div style={{ textAlign: "center", marginTop: "36px" }}>
                        <FlipButton href={block.cta.href} label={block.cta.label} />
                      </div>
                    )}
                  </div>
                </section>
              );

            case "ai":
              return (
                <section key={idx} className="su-ai-section">
                  <div className="su-container">
                    {/* 4ss: Clean, Proper AI & Automation Box */}
                    <div className="su-ai-box">
                      <div className="su-ai-badge">
                        <span className="su-badge-dot" style={{ background: "#7c3aed", boxShadow: "0 0 10px #7c3aed" }} />
                        AI &amp; Automation Ecosystem
                      </div>
                      <h2 className="su-section-title" style={{ textAlign: "left", marginBottom: "14px" }}>
                        {block.title}
                      </h2>
                      {block.intro && (
                        <p style={{ fontSize: "16px", lineHeight: 1.7, color: "#475569", maxWidth: "860px" }}>
                          {block.intro}
                        </p>
                      )}

                      {block.bullets && (
                        <div className="su-ai-pills-grid">
                          {block.bullets.map((b, i) => (
                            <div key={i} className="su-ai-pill-item">
                              <span className="su-ai-dot" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {block.desc && (
                        <div className="su-ai-footer-note">
                          <span style={{ color: "#7c3aed", fontSize: "18px" }}>✦</span>
                          <span>{block.desc}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );

            case "process":
              return (
                <section key={idx} className="su-process-section">
                  <div className="su-container">
                    <div className="su-section-header">
                      <div className="su-badge">
                        <span className="su-badge-dot" />
                        Proven Workflow
                      </div>
                      <h2 className="su-section-title">{block.title}</h2>
                    </div>

                    <div className="su-process-grid">
                      {block.steps.map((step, i) => (
                        <div
                          key={i}
                          className={`su-process-card ${i % 2 === 0 ? "su-process-card-up" : "su-process-card-down"}`}
                        >
                          <span className="su-process-step-tag">{step.num} / STEP</span>
                          <h3 className="su-process-title">{step.title}</h3>
                          <p className="su-process-desc">{step.desc || step.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case "whyChoose":
              return (
                <section key={idx} className="su-innovation-section">
                  <div className="su-container">
                    <div className="su-innovation-grid">
                      <div>
                        <div className="su-badge">
                          <span className="su-badge-dot" />
                          {block.title || "Competitive Advantage"}
                        </div>
                        <h2 className="su-section-title" style={{ textAlign: "left" }}>
                          {block.tagline || "Why Partner with Quickupp?"}
                        </h2>
                        {block.desc && (
                          <p style={{ fontSize: "16px", lineHeight: 1.7, color: "#475569" }}>
                            {block.desc}
                          </p>
                        )}

                        <AnimatedCheckList bullets={block.bullets} />

                        {block.cta && (
                          <FlipButton href={block.cta.href} label={block.cta.label} />
                        )}
                      </div>

                      {/* Right Visual Card - Realistic Live Telemetry Dashboard */}
                      <LiveGrowthTelemetryCard crumb={data.crumb} />
                    </div>
                  </div>
                </section>
              );

            case "faq":
              return (
                <section key={idx} className="su-faq-cta-section">
                  <div className="su-container">
                    <div className="su-faq-cta-grid">
                      {/* Left Column: FAQ Accordion */}
                      <div className="su-faq-col">
                        <div className="su-badge">
                          <span className="su-badge-dot" />
                          Got Questions?
                        </div>
                        <h2 className="su-section-title" style={{ textAlign: "left", marginBottom: "24px" }}>
                          Frequently Asked Questions
                        </h2>

                        <div className="su-faq-list">
                          {block.items.map((faq, i) => {
                            const isOpen = openFaq === i;
                            return (
                              <div key={i} className={`su-faq-card ${isOpen ? "open" : ""}`}>
                                <button
                                  type="button"
                                  className="su-faq-btn"
                                  onClick={() => setOpenFaq(isOpen ? null : i)}
                                  aria-expanded={isOpen}
                                >
                                  <span>{faq.q}</span>
                                  <span className="su-faq-icon">+</span>
                                </button>
                                {isOpen && <div className="su-faq-body">{faq.a}</div>}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Column: Dark CTA Box (Side-by-Side) */}
                      <div className="su-cta-col">
                        <div className="su-cta-box su-cta-box-side">
                          <div className="su-cta-badge">
                            <span className="su-badge-dot" style={{ background: "#00d2ff", boxShadow: "0 0 10px #00d2ff" }} />
                            Ready to Lead Your Sector?
                          </div>
                          <h2 className="su-cta-title" style={{ textAlign: "left" }}>
                            {data.closingTitle}
                          </h2>
                          <p className="su-cta-desc" style={{ textAlign: "left" }}>
                            {data.closingDesc}
                          </p>

                          <div className="su-cta-perks">
                            <div className="su-cta-perk-item">
                              <span className="su-cta-perk-check">✓</span>
                              <span>Dedicated {data.crumb} Strategist</span>
                            </div>
                            <div className="su-cta-perk-item">
                              <span className="su-cta-perk-check">✓</span>
                              <span>Custom Growth Blueprint in 48h</span>
                            </div>
                            <div className="su-cta-perk-item">
                              <span className="su-cta-perk-check">✓</span>
                              <span>No Long-Term Lock-in Contracts</span>
                            </div>
                          </div>

                          <div className="su-cta-actions" style={{ justifyContent: "flex-start", marginTop: "24px" }}>
                            {data.closingCtas && data.closingCtas[0] ? (
                              <FlipButton
                                href={data.closingCtas[0].href}
                                label={data.closingCtas[0].label}
                                className="su-cta-btn-white"
                              />
                            ) : (
                              <FlipButton
                                href="/contact"
                                label="Talk to Our Growth Specialists"
                                className="su-cta-btn-white"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}
      </div>

      {/* Fallback CTA if no FAQ block */}
      {!data.blocks?.some((b) => b.type === "faq") && (
        <section className="su-cta-section">
          <div className="su-container">
            <div className="su-cta-box">
              <div className="su-cta-badge">
                <span className="su-badge-dot" style={{ background: "#00d2ff", boxShadow: "0 0 10px #00d2ff" }} />
                Ready to Lead Your Sector?
              </div>
              <h2 className="su-cta-title">{data.closingTitle}</h2>
              <p className="su-cta-desc">{data.closingDesc}</p>
              <div className="su-cta-actions">
                {data.closingCtas && data.closingCtas[0] ? (
                  <FlipButton
                    href={data.closingCtas[0].href}
                    label={data.closingCtas[0].label}
                    className="su-cta-btn-white"
                  />
                ) : (
                  <FlipButton
                    href="/contact"
                    label="Talk to Our Growth Specialists"
                    className="su-cta-btn-white"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}


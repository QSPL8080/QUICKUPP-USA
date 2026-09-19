"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { ServicePageData, ServiceBlock } from "@/lib/servicePageTypes";

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function IndustryDetailPage({ data }: { data: ServicePageData }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="ind-page-wrapper">
      <link rel="stylesheet" href="/css/industry-system.css" />
      <Header />

      {/* 1. HERO SECTION */}
      <section className="ind-detail-hero">
        <div className="ind-hero-glow" />
        <div className="w-layout-blockcontainer container w-container">
          <div className="ind-hero-content">
            <div className="ind-badge">
              <span className="ind-badge-dot" />
              {data.heroEyebrow || data.crumb} Industry Solutions
            </div>
            <h1 className="ind-hero-title">
              {data.heroTitle}
            </h1>
            {data.heroParagraphs && data.heroParagraphs[0] && (
              <p className="ind-hero-desc">{data.heroParagraphs[0]}</p>
            )}
            <div className="ind-hero-actions">
              <Link href={data.heroCta?.href || "/contact"} className="ind-btn-primary">
                {data.heroCta?.label || "Get Industry Strategy"}
                <ArrowIcon />
              </Link>
              <a href="#services-breakdown" className="ind-btn-secondary">
                Explore Capabilities
              </a>
            </div>

            {/* Overview Box */}
            {data.heroParagraphs && data.heroParagraphs.length > 1 && (
              <div className="ind-overview-card">
                <div className="ind-overview-heading">Market Opportunity &amp; Strategy</div>
                <p className="ind-overview-text">{data.heroParagraphs[1]}</p>
                {data.heroParagraphs[2] && (
                  <p className="ind-overview-text" style={{ marginTop: "12px" }}>
                    {data.heroParagraphs[2]}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC BLOCKS */}
      <div id="services-breakdown">
        {data.blocks.map((block: ServiceBlock, idx: number) => {
          switch (block.type) {
            case "descPairs":
              return (
                <section key={idx} style={{ padding: "80px 0" }}>
                  <div className="w-layout-blockcontainer container w-container">
                    <div className="ind-section-header">
                      <div className="ind-badge">
                        <span className="ind-badge-dot" />
                        {block.subtitle || "Deliverables"}
                      </div>
                      <h2 className="ind-section-title">{block.title}</h2>
                      {block.desc && <p className="ind-hero-desc">{block.desc}</p>}
                    </div>

                    <div className="ind-deliverables-grid">
                      {block.items.map((item, i) => (
                        <div key={i} className="ind-deliv-card">
                          <span className="ind-deliv-num">0{i + 1}</span>
                          <h3 className="ind-deliv-title">{item.title}</h3>
                          <p className="ind-deliv-desc">{item.desc}</p>
                        </div>
                      ))}
                    </div>

                    {block.cta && (
                      <div style={{ textAlign: "center", marginTop: "40px" }}>
                        <Link href={block.cta.href} className="ind-btn-primary">
                          {block.cta.label}
                          <ArrowIcon />
                        </Link>
                      </div>
                    )}
                  </div>
                </section>
              );

            case "list":
              return (
                <section key={idx} style={{ padding: "80px 0", background: "#ffffff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                  <div className="w-layout-blockcontainer container w-container">
                    <div className="ind-section-header">
                      <div className="ind-badge">
                        <span className="ind-badge-dot" />
                        {block.subtitle || "Target Focus"}
                      </div>
                      <h2 className="ind-section-title">{block.title}</h2>
                      {block.desc && <p className="ind-hero-desc">{block.desc}</p>}
                    </div>

                    <div className="ind-checklist-grid">
                      {block.items.map((item, i) => (
                        <div key={i} className="ind-check-item">
                          <span className="ind-check-icon">
                            <CheckIcon />
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {block.cta && (
                      <div style={{ textAlign: "center", marginTop: "40px" }}>
                        <Link href={block.cta.href} className="ind-btn-secondary">
                          {block.cta.label}
                          <ArrowIcon />
                        </Link>
                      </div>
                    )}
                  </div>
                </section>
              );

            case "ai":
              return (
                <section key={idx} style={{ padding: "80px 0" }}>
                  <div className="w-layout-blockcontainer container w-container">
                    <div className="ind-ai-banner">
                      <div className="ind-badge" style={{ background: "rgba(124, 58, 237, 0.08)" }}>
                        <span className="ind-badge-dot" />
                        AI &amp; Automation Integration
                      </div>
                      <h2 className="ind-section-title" style={{ textAlign: "left", marginBottom: "16px" }}>
                        {block.title}
                      </h2>
                      {block.intro && (
                        <p style={{ fontSize: "16px", lineHeight: 1.7, color: "#475569", maxWidth: "800px" }}>
                          {block.intro}
                        </p>
                      )}

                      {block.bullets && (
                        <div className="ind-ai-pills">
                          {block.bullets.map((b, i) => (
                            <div key={i} className="ind-ai-pill">
                              <span className="ind-ai-pill-dot" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {block.desc && (
                        <p style={{ marginTop: "24px", fontSize: "15px", color: "#64748b", fontWeight: 600 }}>
                          {block.desc}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              );

            case "process":
              return (
                <section key={idx} className="ind-process-section">
                  <div className="w-layout-blockcontainer container w-container">
                    <div className="ind-section-header">
                      <div className="ind-badge">
                        <span className="ind-badge-dot" />
                        Proven Workflow
                      </div>
                      <h2 className="ind-section-title">{block.title}</h2>
                    </div>

                    <div className="ind-process-grid">
                      {block.steps.map((step, i) => (
                        <div key={i} className="ind-process-card">
                          <span className="ind-process-num">{step.num} / STEP</span>
                          <h3 className="ind-process-card-title">{step.title}</h3>
                          <p className="ind-process-card-desc">{step.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case "whyChoose":
              return (
                <section key={idx} style={{ padding: "80px 0", background: "#f8fafc" }}>
                  <div className="w-layout-blockcontainer container w-container">
                    <div className="ind-section-header">
                      <div className="ind-badge">
                        <span className="ind-badge-dot" />
                        {block.title || "Competitive Advantage"}
                      </div>
                      <h2 className="ind-section-title">{block.tagline}</h2>
                      {block.desc && <p className="ind-hero-desc">{block.desc}</p>}
                    </div>

                    <div className="ind-checklist-grid">
                      {block.bullets.map((b, i) => (
                        <div key={i} className="ind-check-item">
                          <span className="ind-check-icon">
                            <CheckIcon />
                          </span>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case "faq":
              return (
                <section key={idx} className="ind-faq-section">
                  <div className="w-layout-blockcontainer container w-container">
                    <div className="ind-section-header">
                      <div className="ind-badge">
                        <span className="ind-badge-dot" />
                        Got Questions?
                      </div>
                      <h2 className="ind-section-title">Frequently Asked Questions</h2>
                    </div>

                    <div className="ind-faq-list">
                      {block.items.map((faq, i) => {
                        const isOpen = openFaq === i;
                        return (
                          <div key={i} className={"ind-faq-card " + (isOpen ? "open" : "")}>
                            <button
                              type="button"
                              className="ind-faq-question-btn"
                              onClick={() => setOpenFaq(isOpen ? null : i)}
                            >
                              <span>{faq.q}</span>
                              <span className="ind-faq-toggle-icon">+</span>
                            </button>
                            {isOpen && <div className="ind-faq-answer">{faq.a}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}
      </div>

      {/* 3. CLOSING CONVERSION BANNER */}
      <section className="ind-cta-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="ind-cta-box">
            <div className="ind-badge" style={{ background: "rgba(255, 255, 255, 0.1)", color: "#00d2ff", borderColor: "rgba(255, 255, 255, 0.2)" }}>
              <span className="ind-badge-dot" style={{ background: "#00d2ff" }} />
              Ready to Lead Your Sector?
            </div>
            <h2 className="ind-cta-title">{data.closingTitle}</h2>
            <p className="ind-cta-desc">{data.closingDesc}</p>
            <div className="ind-hero-actions">
              {data.closingCtas && data.closingCtas[0] ? (
                <Link href={data.closingCtas[0].href} className="ind-btn-primary">
                  {data.closingCtas[0].label}
                  <ArrowIcon />
                </Link>
              ) : (
                <Link href="/contact" className="ind-btn-primary">
                  Talk to Our Growth Specialists
                  <ArrowIcon />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

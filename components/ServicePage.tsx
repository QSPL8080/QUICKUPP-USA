"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { ServicePageData, ServiceBlock } from "@/lib/servicePageTypes";

// Diagonal Arrow Icon matching Meridian UI
function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="ms-btn-icon">
      <path
        d="M18.5621 6V15.75C18.5621 15.8992 18.5029 16.0423 18.3974 16.1477C18.2919 16.2532 18.1488 16.3125 17.9996 16.3125C17.8505 16.3125 17.7074 16.2532 17.6019 16.1477C17.4964 16.0423 17.4371 15.8992 17.4371 15.75V7.3575L6.39714 18.3975C6.29051 18.4969 6.14947 18.551 6.00375 18.5484C5.85802 18.5458 5.71898 18.4868 5.61592 18.3837C5.51286 18.2807 5.45383 18.1416 5.45126 17.9959C5.44869 17.8502 5.50278 17.7091 5.60214 17.6025L16.6421 6.5625H8.24964C8.10046 6.5625 7.95738 6.50324 7.85189 6.39775C7.7464 6.29226 7.68714 6.14918 7.68714 6C7.68714 5.85082 7.7464 5.70774 7.85189 5.60225C7.95738 5.49676 8.10046 5.4375 8.24964 5.4375H17.9996C18.1488 5.4375 18.2919 5.49676 18.3974 5.60225C18.5029 5.70774 18.5621 5.85082 18.5621 6Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Checkmark Icon
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path
        d="M21.2655 7.01552L9.26552 19.0155C9.23069 19.0504 9.18934 19.078 9.14381 19.0969C9.09829 19.1158 9.04949 19.1255 9.00021 19.1255C8.95093 19.1255 8.90213 19.1158 8.85661 19.0969C8.81108 19.078 8.76972 19.0504 8.7349 19.0155L3.4849 13.7655C3.41453 13.6952 3.375 13.5997 3.375 13.5002C3.375 13.4007 3.41453 13.3053 3.4849 13.2349C3.55526 13.1645 3.6507 13.125 3.75021 13.125C3.84972 13.125 3.94516 13.1645 4.01552 13.2349L9.00021 18.2196L20.7349 6.4849C20.8053 6.41453 20.9007 6.375 21.0002 6.375C21.0997 6.375 21.1952 6.41453 21.2655 6.4849C21.3359 6.55526 21.3754 6.6507 21.3754 6.75021C21.3754 6.84972 21.3359 6.94516 21.2655 7.01552Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Distinct Modern Geometric Icon Generator based on index/type
function CardIcon({ index }: { index: number }) {
  const icons = [
    // Workflow / Architecture
    <svg key="0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></svg>,
    // Target / Performance
    <svg key="1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    // Growth / Analytics
    <svg key="2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 7 7 4-4 7 7"/><path d="M14 7h7v7"/></svg>,
    // Layers / Systems
    <svg key="3" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
    // AI Sparkles
    <svg key="4" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>,
    // Automation / Gear
    <svg key="5" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>,
    // Code / Engineering
    <svg key="6" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    // Video / Media
    <svg key="7" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>,
  ];
  return icons[index % icons.length];
}

function BlockRenderer({ block, index }: { block: ServiceBlock; index: number }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  switch (block.type) {
    case "list": {
      return (
        <section className="ms-section">
          <div className="ms-container">
            <div className="ms-split-layout">
              <div>
                <div className="ms-eyebrow">
                  <span className="ms-eyebrow-dot"></span>
                  <span>{block.subtitle ?? "Deliverables"}</span>
                </div>
                {block.title && <h2 className="ms-section-title">{block.title}</h2>}
                {block.tagline && (
                  <p style={{ fontSize: "18px", fontWeight: 600, color: "var(--ms-accent)", marginBottom: "12px" }}>
                    {block.tagline}
                  </p>
                )}
                {block.desc && <p className="ms-section-desc">{block.desc}</p>}
                {block.note && (
                  <p style={{ fontSize: "14px", fontStyle: "italic", color: "var(--ms-text-faded)", marginTop: "12px" }}>
                    {block.note}
                  </p>
                )}
                {block.cta && (
                  <div style={{ marginTop: "32px" }}>
                    <Link href={block.cta.href} className="ms-btn ms-btn-primary">
                      <span>{block.cta.label}</span>
                      <ArrowIcon />
                    </Link>
                  </div>
                )}
              </div>

              <div>
                <div className="ms-callout-wrap" style={{ padding: "36px 32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--ms-accent)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Key Focus Areas
                    </span>
                    <span style={{ fontSize: "12px", background: "rgba(222,242,92,0.12)", color: "var(--ms-accent)", padding: "4px 12px", borderRadius: "100px", fontWeight: 700 }}>
                      {block.items.length} Deliverables
                    </span>
                  </div>
                  <div className="ms-checklist-group" style={{ margin: 0 }}>
                    {block.items.map((item, i) => (
                      <div key={i} className="ms-check-item">
                        <div className="ms-check-icon">
                          <CheckIcon />
                        </div>
                        <span className="ms-check-text">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    case "descPairs":
      return (
        <section className="ms-section ms-section-alt">
          <div className="ms-container">
            <div className="ms-section-header">
              <div className="ms-eyebrow">
                <span className="ms-eyebrow-dot"></span>
                <span>{block.subtitle ?? "What's Included"}</span>
              </div>
              {block.title && <h2 className="ms-section-title">{block.title}</h2>}
              {block.tagline && (
                <p style={{ fontSize: "18px", fontWeight: 600, color: "var(--ms-accent)", marginBottom: "8px" }}>
                  {block.tagline}
                </p>
              )}
              {block.desc && <p className="ms-section-desc">{block.desc}</p>}
            </div>

            <div className="ms-grid-border">
              {block.items.map((item, i) => (
                <div key={i} className="ms-card-icon">
                  <div className="ms-card-top-row">
                    <div className="ms-icon-slot">
                      <CardIcon index={i} />
                    </div>
                    <span className="ms-card-num">0{i + 1}</span>
                  </div>
                  <h3 className="ms-card-title">{item.title}</h3>
                  <p className="ms-card-desc">{item.desc}</p>
                </div>
              ))}
            </div>

            {block.cta && (
              <div style={{ marginTop: "40px", textAlign: "center" }}>
                <Link href={block.cta.href} className="ms-btn ms-btn-secondary">
                  <span>{block.cta.label}</span>
                  <ArrowIcon />
                </Link>
              </div>
            )}
          </div>
        </section>
      );

    case "process":
      return (
        <section className="ms-section">
          <div className="ms-container">
            <div className="ms-process-split">
              <div className="ms-process-sticky">
                <div className="ms-eyebrow">
                  <span className="ms-eyebrow-dot"></span>
                  <span>Process</span>
                </div>
                <h2 className="ms-section-title">{block.title}</h2>
                <p className="ms-section-desc">
                  Our battle-tested workflow ensures total alignment, disciplined execution, and measurable outcomes at every phase.
                </p>
                <div style={{ marginTop: "28px" }}>
                  <Link href="/contact" className="ms-btn ms-btn-primary">
                    <span>Discuss Your Project</span>
                    <ArrowIcon />
                  </Link>
                </div>
              </div>

              <div className="ms-step-list">
                {block.steps.map((step, i) => (
                  <div key={i} className="ms-step-item">
                    <div className="ms-step-number">{step.num.replace(/^0+/, "") || i + 1}</div>
                    <div>
                      <h3 className="ms-step-heading">{step.title}</h3>
                      <p className="ms-step-desc">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      );

    case "whyChoose":
      return (
        <section className="ms-section ms-section-alt">
          <div className="ms-container">
            <div className="ms-split-layout">
              <div>
                <div className="ms-eyebrow">
                  <span className="ms-eyebrow-dot"></span>
                  <span>{block.title ?? "Why Choose Us"}</span>
                </div>
                <h2 className="ms-section-title">{block.tagline}</h2>
                {block.desc && <p className="ms-section-desc">{block.desc}</p>}
                {block.cta && (
                  <div style={{ marginTop: "32px" }}>
                    <Link href={block.cta.href} className="ms-btn ms-btn-primary">
                      <span>{block.cta.label}</span>
                      <ArrowIcon />
                    </Link>
                  </div>
                )}
              </div>

              <div>
                <div className="ms-checklist-group">
                  {block.bullets.map((b, i) => (
                    <div key={i} className="ms-check-item">
                      <div className="ms-check-icon">
                        <CheckIcon />
                      </div>
                      <span className="ms-check-text">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      );

    case "industries":
      return (
        <section className="ms-section">
          <div className="ms-container">
            <div className="ms-section-header is-center">
              <div className="ms-eyebrow">
                <span className="ms-eyebrow-dot"></span>
                <span>Experience</span>
              </div>
              <h2 className="ms-section-title">Industries We Serve</h2>
              <p className="ms-section-desc">
                Specialized domain knowledge and tailored strategies across key high-growth business sectors.
              </p>
            </div>

            <div className="ms-industry-grid">
              {block.industries.map((ind, i) => (
                <div key={i} className="ms-industry-item">
                  <span style={{ color: "var(--ms-accent)" }}>✦</span>
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "ai":
      return (
        <section className="ms-section">
          <div className="ms-container">
            <div className="ms-ai-spotlight">
              <div className="ms-eyebrow" style={{ color: "var(--ms-accent)" }}>
                <span className="ms-eyebrow-dot"></span>
                <span>Next-Gen Innovation</span>
              </div>
              <h2 className="ms-ai-title">{block.title}</h2>
              {block.intro && <p className="ms-ai-desc">{block.intro}</p>}

              {block.bullets && block.bullets.length > 0 && (
                <div className="ms-bullet-cloud">
                  {block.bullets.map((b, i) => (
                    <div key={i} className="ms-bullet-pill">
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}

              {block.desc && <p className="ms-ai-desc" style={{ marginTop: "16px" }}>{block.desc}</p>}

              {block.cta && (
                <div style={{ marginTop: "32px" }}>
                  <Link href={block.cta.href} className="ms-btn ms-btn-primary">
                    <span>{block.cta.label}</span>
                    <ArrowIcon />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      );

    case "faq":
      return (
        <section className="ms-section ms-section-alt">
          <div className="ms-container">
            <div className="ms-section-header is-center">
              <div className="ms-eyebrow">
                <span className="ms-eyebrow-dot"></span>
                <span>FAQ</span>
              </div>
              <h2 className="ms-section-title">Frequently Asked Questions</h2>
              <p className="ms-section-desc">
                Everything you need to know about our capabilities, delivery process, and partnership model.
              </p>
            </div>

            <div className="ms-faq-list">
              {block.items.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className={`ms-faq-item ${isOpen ? "is-active" : ""}`}>
                    <div className="ms-faq-header" onClick={() => setOpenFaq(isOpen ? null : i)}>
                      <h3 className="ms-faq-question">{item.q}</h3>
                      <div className="ms-faq-toggle">+</div>
                    </div>
                    {isOpen && (
                      <div className="ms-faq-body">
                        <p>{item.a}</p>
                      </div>
                    )}
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
}

export default function ServicePage({ data }: { data: ServicePageData }) {
  return (
    <>
      <Header />

      <main className="meridian-service-page">
        {/* Load scoped Meridian CSS */}
        <link rel="stylesheet" href="/css/meridian-service.css" />

        {/* 1. Hero Section */}
        <section className="ms-hero">
          <div className="ms-container">
            <div className="ms-hero-center">
              <div className="ms-eyebrow">
                <span className="ms-eyebrow-dot"></span>
                <span>{data.heroEyebrow || data.crumb}</span>
              </div>
              <h1 className="ms-hero-heading ms-animate-fade-up">{data.heroTitle}</h1>
              {data.heroParagraphs && data.heroParagraphs.length > 0 && (
                <p className="ms-hero-desc">{data.heroParagraphs[0]}</p>
              )}
              <div className="ms-cta-buttons">
                <Link href={data.heroCta.href} className="ms-btn ms-btn-primary">
                  <span>{data.heroCta.label}</span>
                  <ArrowIcon />
                </Link>
                <Link href="#overview" className="ms-btn ms-btn-secondary">
                  <span>Explore Capabilities</span>
                  <ArrowIcon />
                </Link>
              </div>
            </div>

            {/* Hero Visual Presentation with Meridian Aesthetic */}
            <div className="ms-hero-visual">
              <img
                src="/images/about-hero-bg.webp"
                alt={data.heroTitle}
                loading="eager"
              />
              <div className="ms-corner-badge">
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ms-accent)" }}></span>
                <span>Quickupp Softech • High-Performance Delivery</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Overview Callout Section */}
        {data.heroParagraphs && data.heroParagraphs.length > 1 && (
          <section id="overview" className="ms-section-sm">
            <div className="ms-container">
              <div className="ms-callout-wrap">
                <div className="ms-eyebrow">
                  <span className="ms-eyebrow-dot"></span>
                  <span>Overview</span>
                </div>
                <h2 className="ms-callout-heading">{data.heroParagraphs[1]}</h2>
                {data.heroParagraphs.slice(2).map((p, idx) => (
                  <p key={idx} className="ms-callout-subtext" style={{ marginTop: "12px" }}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 3. Dynamic Service Blocks */}
        {data.blocks.map((block, idx) => (
          <BlockRenderer key={idx} block={block} index={idx} />
        ))}

        {/* 4. Closing Conversion Banner */}
        <section className="ms-section">
          <div className="ms-container">
            <div className="ms-closing-card">
              <div className="ms-eyebrow" style={{ justifyContent: "center" }}>
                <span className="ms-eyebrow-dot"></span>
                <span>Ready to Scale</span>
              </div>
              <h2 className="ms-closing-title">{data.closingTitle}</h2>
              <p className="ms-closing-desc">{data.closingDesc}</p>
              <div className="ms-cta-buttons">
                {data.closingCtas.map((cta, idx) => (
                  <Link
                    key={idx}
                    href={cta.href}
                    className={`ms-btn ${idx === 0 ? "ms-btn-primary" : "ms-btn-secondary"}`}
                  >
                    <span>{cta.label}</span>
                    <ArrowIcon />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}



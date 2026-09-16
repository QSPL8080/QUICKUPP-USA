"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Button from "@/components/Button";
import type { ServicePageData, ServiceBlock } from "@/lib/servicePageTypes";

function Block({ block, index }: { block: ServiceBlock; index: number }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  switch (block.type) {
    case "list": {
      // Alternate list section styles so they don't look repetitive
      const isAlt = index % 2 === 1;
      return (
        <div className={`qs-split-section ${isAlt ? "qs-split-alt" : ""}`}>
          <div className="qs-split-left">
            <div className="subtitle-head-wrap">
              <div className="subtitle-left-icon"></div>
              <div className="subtitle-head">
                {block.title?.includes("Advertising")
                  ? "Paid Campaigns & Growth"
                  : block.title?.includes("Content")
                  ? "Creative Studio"
                  : "Core Capabilities"}
              </div>
            </div>
            {block.title && <h2 className="heading-title qs-section-heading">{block.title}</h2>}
            {block.desc && <p className="paragraph-large qs-section-desc">{block.desc}</p>}
            {block.cta && (
              <div className="button-wrap qs-cta-wrap">
                <Button href={block.cta.href} label={block.cta.label} />
              </div>
            )}
          </div>
          <div className="qs-split-right">
            <div className={`qs-list-card ${isAlt ? "qs-card-tinted" : ""}`}>
              <div className="qs-list-card-header">
                <span className="qs-list-count-badge">{block.items.length} Focus Areas</span>
              </div>
              <div className="qs-check-grid">
                {block.items.map((item, i) => (
                  <div key={i} className="qs-check-item">
                    <div className="qs-check-bullet">
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L4.5 8.5L11 1.5" stroke="#102b32" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="qs-check-label">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "descPairs":
      return (
        <div className="qs-full-section">
          <div className="qs-section-center-head">
            <div className="subtitle-head-wrap">
              <div className="subtitle-left-icon"></div>
              <div className="subtitle-head">Channels &amp; Networks</div>
            </div>
            {block.title && <h2 className="heading-title qs-section-heading">{block.title}</h2>}
            {block.desc && <p className="paragraph-large qs-section-desc">{block.desc}</p>}
          </div>
          <div className={`qs-platform-grid cols-${block.columns ?? 3}`}>
            {block.items.map((item, i) => (
              <div key={i} className="qs-platform-card">
                <div className="qs-platform-card-top">
                  <div className="qs-platform-badge-num">0{i + 1}</div>
                  <span className="qs-platform-dot"></span>
                </div>
                <h3 className="text-style-h4 qs-platform-title">{item.title}</h3>
                <p className="qs-platform-desc">{item.desc}</p>
              </div>
            ))}
          </div>
          {block.cta && (
            <div className="button-wrap qs-cta-wrap" style={{ marginTop: "32px", textAlign: "center", display: "flex", justifyContent: "center" }}>
              <Button href={block.cta.href} label={block.cta.label} />
            </div>
          )}
        </div>
      );

    case "process":
      return (
        <div className="qs-full-section">
          <div className="qs-section-center-head">
            <div className="subtitle-head-wrap">
              <div className="subtitle-left-icon"></div>
              <div className="subtitle-head">Proven Methodology</div>
            </div>
            <h2 className="heading-title qs-section-heading">{block.title}</h2>
          </div>
          <div className="qs-process-grid">
            {block.steps.map((step, i) => (
              <div key={i} className="qs-process-item">
                <div className="qs-process-top-row">
                  <span className="qs-process-badge">{step.num}</span>
                  <div className="qs-process-line"></div>
                </div>
                <h3 className="text-style-h4 qs-process-title">{step.title}</h3>
                <p className="qs-process-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "whyChoose":
      return (
        <div className="qs-split-section qs-why-split">
          <div className="qs-split-left">
            <div className="subtitle-head-wrap">
              <div className="subtitle-left-icon"></div>
              <div className="subtitle-head">Why Choose Quickupp Softech?</div>
            </div>
            <h2 className="heading-title qs-section-heading">{block.tagline}</h2>
            <p className="paragraph-large qs-section-desc">
              We combine creative storytelling, platform-specific mastery, and data-driven advertising to scale your business predictably.
            </p>
          </div>
          <div className="qs-split-right">
            <div className="qs-why-card-wrap">
              <div className="qs-why-grid">
                {block.bullets.map((b, i) => (
                  <div key={i} className="qs-why-item">
                    <div className="qs-why-bullet-icon">
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L4.5 8.5L11 1.5" stroke="#102b32" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="qs-why-label">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case "industries":
      return (
        <div className="qs-full-section">
          <div className="qs-section-center-head">
            <div className="subtitle-head-wrap">
              <div className="subtitle-left-icon"></div>
              <div className="subtitle-head">Industry Experience</div>
            </div>
            <h2 className="heading-title qs-section-heading">Industries We Serve</h2>
          </div>
          <div className="qs-industry-pills-wrap">
            {block.industries.map((ind, i) => (
              <span key={i} className="qs-industry-tag">
                <span className="qs-industry-dot"></span>
                {ind}
              </span>
            ))}
          </div>
        </div>
      );

    case "ai":
      return (
        <div className="qs-ai-spotlight-box">
          <div className="qs-ai-inner">
            <div className="subtitle-head-wrap" style={{ marginBottom: "16px" }}>
              <div className="subtitle-left-icon" style={{ background: "#def25c" }}></div>
              <div className="subtitle-head" style={{ color: "#def25c" }}>
                Next-Gen Automation
              </div>
            </div>
            <h2 className="heading-title qs-ai-heading">{block.title}</h2>
            <p className="qs-ai-desc">{block.desc}</p>
            {block.cta && (
              <div className="button-wrap qs-cta-wrap" style={{ marginTop: "28px" }}>
                <Button href={block.cta.href} label={block.cta.label} variant="secondary-bg" />
              </div>
            )}
          </div>
        </div>
      );

    case "faq":
      return (
        <div className="qs-full-section qs-faq-section">
          <div className="qs-section-center-head">
            <div className="subtitle-head-wrap">
              <div className="subtitle-left-icon"></div>
              <div className="subtitle-head">Common Questions</div>
            </div>
            <h2 className="heading-title qs-section-heading">Frequently Asked Questions</h2>
          </div>
          <div className="qs-faq-accordion">
            {block.items.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={`qs-faq-card ${isOpen ? "is-open" : ""}`}
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                >
                  <div className="qs-faq-question-row">
                    <span className="qs-faq-q-text">{item.q}</span>
                    <span className="qs-faq-toggle-icon">{isOpen ? "−" : "+"}</span>
                  </div>
                  {isOpen && (
                    <div className="qs-faq-answer" onClick={(e) => e.stopPropagation()}>
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default function ServicePage({ data }: { data: ServicePageData }) {
  return (
    <>
      <Header />
      <PageHero title={data.crumb} description={data.heroTitle} crumb={data.crumb} />

      {/* Intro Hero Overview */}
      <section className="section-gap qs-service-hero-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="qs-intro-hero">
            <div className="subtitle-head-wrap">
              <div className="subtitle-left-icon"></div>
              <div className="subtitle-head">{data.heroEyebrow}</div>
            </div>
            <h2 className="heading-title qs-main-title">{data.heroTitle}</h2>
            <div className="qs-hero-body-text">
              {data.heroParagraphs.map((p, i) => (
                <p key={i} className="paragraph-large">
                  {p}
                </p>
              ))}
            </div>
            <div className="button-wrap qs-cta-wrap" style={{ marginTop: "28px" }}>
              <Button href={data.heroCta.href} label={data.heroCta.label} />
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Content Sections */}
      {data.blocks.map((block, i) => (
        <section key={i} className="section-gap qs-content-section">
          <div className="w-layout-blockcontainer container w-container">
            <Block block={block} index={i} />
          </div>
        </section>
      ))}

      {/* Closing Banner */}
      <section className="section-gap qs-content-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="qs-closing-box">
            <h2 className="heading-title qs-closing-title">
              {data.closingTitle}
            </h2>
            <p className="qs-closing-desc">
              {data.closingDesc}
            </p>
            <div className="qs-cta-row">
              {data.closingCtas.map((cta, i) => (
                <Button
                  key={i}
                  href={cta.href}
                  label={cta.label}
                  variant={i === 0 ? "secondary-bg" : "white-bg"}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}


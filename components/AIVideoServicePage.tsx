"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { ServicePageData } from "@/lib/servicePageTypes";

interface Props {
  data: ServicePageData;
  categoryLabel?: string;
  categorySlug?: string;
}

// Helper to render headings with the second half or punchline in gradient text
function renderGradientHeading(text?: string) {
  if (!text) return null;
  const words = text.trim().split(/\s+/);
  if (words.length === 1) {
    return <span className="qs-gradient-text">{words[0]}</span>;
  }
  if (words.length === 2) {
    return (
      <>
        <span>{words[0]}</span> <span className="qs-gradient-text">{words[1]}</span>
      </>
    );
  }
  const splitPoint = Math.max(1, Math.floor(words.length * 0.55));
  const firstPart = words.slice(0, splitPoint).join(" ");
  const secondPart = words.slice(splitPoint).join(" ");

  return (
    <>
      <span>{firstPart}</span>{" "}
      <span className="qs-gradient-text">{secondPart}</span>
    </>
  );
}

function StaggeredDeliverablesSection({
  title,
  desc,
  items,
}: {
  title: string;
  desc?: string;
  items: string[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="sc-values-compact-section">
      <div className="w-layout-blockcontainer container w-container">
        <div className="sc-values-compact-header">
          <div className="sc-values-badge">
            <span className="sc-values-badge-dot" />
            <span>FORMATS &amp; DELIVERABLES</span>
          </div>
          <h2 className="sc-section-title">{renderGradientHeading(title)}</h2>
          <p className="sc-section-desc">
            {desc ||
              "From social-first viral content to enterprise-grade communications, explore the video formats we produce at scale."}
          </p>
        </div>

        <div className={`sc-values-compact-grid ${isInView ? "is-in-view" : ""}`}>
          {items.map((item, idx) => (
            <div
              key={idx}
              className="sc-values-compact-card"
              style={{
                transitionDelay: isInView ? `${idx * 75}ms` : "0ms",
              }}
            >
              <div className="sc-values-card-top">
                <span className="sc-values-compact-number">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="sc-values-card-indicator" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 12L12 4M12 4H6M12 4V10"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              <h3 className="sc-values-compact-title">{item}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AIVideoServicePage({
  data,
}: Props) {
  // Scroll highlight animation for Manifesto / Hero Subtitle
  const manifestoRef = useRef<HTMLHeadingElement>(null);
  const [manifestoProgress, setManifestoProgress] = useState(0);

  const heroIntro =
    data.heroParagraphs && data.heroParagraphs.length > 0
      ? data.heroParagraphs[0]
      : "";

  const manifestoWords = useMemo(() => heroIntro ? heroIntro.split(" ") : [], [heroIntro]);

  useEffect(() => {
    let ticking = false;
    const calculateProgress = () => {
      if (!manifestoRef.current) return;
      const rect = manifestoRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;

      const startY = windowH * 0.85;
      const endY = windowH * 0.35;
      const currentY = rect.top;

      let p = (startY - currentY) / (startY - endY);
      p = Math.max(0, Math.min(1, p));
      setManifestoProgress(p);
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    calculateProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const videoGallerySamples = [
    "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1576828831022-ae4189f50078?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
  ];

  return (
    <div className="sc-career-page">
      <Header />

      {/* =========================================================================
          1. HERO SECTION (Manifesto Scroll Reveal & Continuous Video Gallery)
          ========================================================================= */}
      <section className="sc-manifesto-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="sc-manifesto-center-wrap">
            {data.heroEyebrow && (
              <span className="sc-manifesto-badge">
                {data.heroEyebrow}
              </span>
            )}
            <h1 className="sc-hero-title" style={{ fontSize: "clamp(30px, 3.6vw, 48px)", fontWeight: 800, color: "#0b0f17", margin: "0 0 16px" }}>
              {renderGradientHeading(data.heroTitle)}
            </h1>
            {manifestoWords.length > 0 && (
              <h2 ref={manifestoRef} className="sc-manifesto-text-center" style={{ marginTop: "16px" }}>
                {manifestoWords.map((word, idx) => {
                  const wordThreshold = (idx + 0.3) / manifestoWords.length;
                  const isRevealed = manifestoProgress >= wordThreshold;
                  return (
                    <span
                      key={idx}
                      className={`sc-scroll-word ${isRevealed ? "is-revealed" : ""}`}
                    >
                      {word}
                    </span>
                  );
                })}
              </h2>
            )}

            {data.heroParagraphs && data.heroParagraphs.length > 1 && (
              <div style={{ maxWidth: "780px", margin: "20px auto 0", textAlign: "center", color: "#475569", fontSize: "16px", lineHeight: "1.7" }}>
                {data.heroParagraphs.slice(1).map((para, idx) => (
                  <p key={idx} style={{ margin: "8px 0" }}>
                    {para}
                  </p>
                ))}
              </div>
            )}

            {data.heroCta && (
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "28px", flexWrap: "wrap" }}>
                <Link href={data.heroCta.href || "/contact"} className="sc-apply-role-btn" style={{ padding: "12px 28px", fontSize: "14px" }}>
                  <span>{data.heroCta.label}</span>
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                    <path d="M3.75 9L14.25 9M14.25 9L9 3.75M14.25 9L9 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Continuous Video Gallery Strip */}
        <div className="sc-gallery-strip">
          <div className="sc-gallery-track">
            {videoGallerySamples.concat(videoGallerySamples).map((imgSrc, idx) => (
              <div key={idx} className="sc-gallery-card">
                <img src={imgSrc} alt="AI Video Showcase" className="sc-gallery-img" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. DYNAMIC SECTIONS MAPPED STRICTLY FROM SERVICE DATA BLOCKS
          ========================================================================= */}
      <div>
        {data.blocks.map((block, bIdx) => {
          const blockTitle = (block as any).title;
          const blockDesc = (block as any).desc;
          
          let items: string[] = [];
          if ((block as any).items) {
            items = (block as any).items.map((it: any) => typeof it === "string" ? it : it.title || it.name);
          } else if ((block as any).bullets) {
            items = (block as any).bullets;
          }

          // -------------------------------------------------------------------
          // DEDICATED WHY CHOOSE SECTION (No repetition of sc-values grid)
          // -------------------------------------------------------------------
          if (block.type === "whyChoose") {
            return (
              <section key={bIdx} className="sc-why-choose-video-section">
                <div className="w-layout-blockcontainer container w-container">
                  <div className="sc-section-header" style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 36px" }}>
                    <div className="sc-values-badge" style={{ marginBottom: "12px" }}>
                      <span className="sc-values-badge-dot" style={{ backgroundColor: "#10b981" }} />
                      <span>WHY QUICKUPP</span>
                    </div>
                    <h2 className="sc-section-title">{renderGradientHeading(blockTitle)}</h2>
                    <p className="sc-section-desc">
                      Built for high performance, creative excellence, and measurable business growth.
                    </p>
                  </div>

                  <div className="sc-why-choose-cards-grid">
                    {items.map((bullet, idx) => (
                      <div key={idx} className="sc-why-choose-card">
                        <div className="sc-why-choose-icon-box">
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                            <path d="M16.6666 5L7.49992 14.1667L3.33325 10" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="sc-why-choose-card-text">
                          <h3 className="sc-why-choose-card-title">{bullet}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          // -------------------------------------------------------------------
          // BLOCK TYPE 1: DELIVERABLES & FORMATS (Points Coming One by One)
          // -------------------------------------------------------------------
          if (bIdx === 0 || (block.type === "list" && !blockTitle?.toLowerCase().includes("sample"))) {
            return (
              <StaggeredDeliverablesSection
                key={bIdx}
                title={blockTitle}
                desc={blockDesc}
                items={items}
              />
            );
          }

          // -------------------------------------------------------------------
          // BLOCK TYPE 2: AI / USE CASES (Split Showcase Layout)
          // -------------------------------------------------------------------
          if (bIdx % 3 === 1) {
            const headerDesc = (block as any).desc || (block as any).intro;
            return (
              <section key={bIdx} className="sc-choice-section" style={{ backgroundColor: "#f8fafc" }}>
                <div className="w-layout-blockcontainer container w-container">
                  <div className="sc-choice-grid">
                    {/* Left Visual */}
                    <div className="sc-choice-left-visual">
                      <img
                        src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80"
                        alt={blockTitle}
                        className="sc-choice-left-img"
                      />
                      <div className="sc-choice-badge-overlay">
                        <div className="sc-choice-badge-title">Enterprise Video Engine</div>
                        <p className="sc-choice-badge-sub">High-converting video assets engineered for scale &amp; retention.</p>
                      </div>
                    </div>

                    {/* Right Column Content */}
                    <div className="sc-choice-right-content" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <h2 className="sc-section-title" style={{ textAlign: "left", margin: "0 0 24px 0", fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 800, color: "#0b0f17", lineHeight: 1.25 }}>
                        {renderGradientHeading(blockTitle)}
                      </h2>
                      <div className="sc-choice-cards-grid">
                        {items.map((item, idx) => (
                          <div key={idx} className="sc-choice-item-card">
                            <div className="sc-choice-card-icon-wrap">
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                              </svg>
                            </div>
                            <span className="sc-choice-item-title">{item}</span>
                          </div>
                        ))}
                      </div>
                      {headerDesc && (
                        <p className="sc-section-desc" style={{ textAlign: "left", margin: "20px 0 0", color: "#475569", fontSize: "15px", lineHeight: "1.6" }}>
                          {headerDesc}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          // -------------------------------------------------------------------
          // BLOCK TYPE 3: SAMPLES (Roles List)
          // -------------------------------------------------------------------
          return (
            <section key={bIdx} className="sc-roles-section" style={{ backgroundColor: "#ffffff" }}>
              <div className="w-layout-blockcontainer container w-container">
                <div className="sc-section-header" style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 36px" }}>
                  <div className="sc-values-badge" style={{ marginBottom: "12px", display: "inline-flex" }}>
                    <span className="sc-values-badge-dot" style={{ backgroundColor: "#a855f7" }} />
                    <span>PRODUCTION SHOWCASE</span>
                  </div>
                  <h2 className="sc-section-title" style={{ fontSize: "clamp(26px, 3.2vw, 40px)", fontWeight: 800, color: "#0b0f17", margin: "0 0 14px", lineHeight: 1.25 }}>
                    {renderGradientHeading(blockTitle)}
                  </h2>
                  {blockDesc && <p className="sc-section-desc">{blockDesc}</p>}
                </div>

                <div className="sc-roles-list">
                  {items.map((item, idx) => (
                    <div key={idx} className="sc-role-card" style={{ alignItems: "center" }}>
                      <div className="sc-role-left">
                        <h3 className="sc-role-title" style={{ margin: 0 }}>{item}</h3>
                      </div>
                      <div className="sc-role-right-actions">
                        <Link href="/contact" className="sc-apply-role-btn">
                          <span>Get a Quote</span>
                          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                            <path d="M3.75 9L14.25 9M14.25 9L9 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* =========================================================================
          3. CINEMATIC PARALLAX REVEAL CTA BANNER
          ========================================================================= */}
      <section className="su-cinematic-cta-section">
        <div className="su-cinematic-bg-media" />
        <div className="su-cinematic-dark-overlay" />
        <div className="w-layout-blockcontainer container w-container">
          <div className="su-cinematic-content">
            <h2 className="su-cinematic-heading">
              {renderGradientHeading(data.closingTitle)}
            </h2>
            {data.closingDesc && (
              <div style={{ maxWidth: "680px", margin: "0 auto 28px", color: "rgba(255, 255, 255, 0.9)", fontSize: "16px", lineHeight: "1.6" }}>
                {data.closingDesc.split("\n").filter(Boolean).map((line, lIdx) => (
                  <p key={lIdx} style={{ margin: "6px 0" }}>{line}</p>
                ))}
              </div>
            )}
            <div className="su-cinematic-action-wrap" style={{ gap: "14px", flexWrap: "wrap" }}>
              {(data.closingCtas && data.closingCtas.length > 0
                ? data.closingCtas
                : [{ label: "Start Your Video", href: "/contact" }]
              ).map((cta, cIdx) => (
                <Link
                  key={cIdx}
                  href={cta.href || "/contact"}
                  className="su-flip-button"
                  style={cIdx > 0 ? { background: "rgba(255, 255, 255, 0.15)", color: "#ffffff", backdropFilter: "blur(8px)", border: "1px solid rgba(255, 255, 255, 0.25)" } : undefined}
                >
                  <div className="su-flip-button-texts">
                    <div className="su-flip-button-text _01">{cta.label}</div>
                    <div className="su-flip-button-text _02">{cta.label}</div>
                  </div>
                  <div className="su-flip-arrow-box">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 18" fill="none" className="su-flip-arrow _01">
                      <path d="M3.75 9L14.25 9M14.25 9L9 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 18" fill="none" className="su-flip-arrow _02">
                      <path d="M3.75 9L14.25 9M14.25 9L9 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

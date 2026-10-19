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

interface SubpageMedia {
  showcase: string;
  showcaseBadgeTitle: string;
  showcaseBadgeSub: string;
  gallery: string[];
  ctaBg: string;
}

const aiVideoSubpageMedia: Record<string, SubpageMedia> = {
  "AI Avatar Video": {
    showcase: "https://images.unsplash.com/photo-1573497491765-dccce02b29df?auto=format&fit=crop&w=1200&q=80",
    showcaseBadgeTitle: "Lifelike Multilingual AI Presenters",
    showcaseBadgeSub: "Studio-grade digital humans delivering scripts in 140+ languages.",
    gallery: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
    ],
    ctaBg: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80",
  },
  "AI UGC Video": {
    showcase: "https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=1200&q=80",
    showcaseBadgeTitle: "High-Converting AI UGC Creators",
    showcaseBadgeSub: "Organic, TikTok-first creator hooks engineered for viral ROAS.",
    gallery: [
      "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=800&q=80",
    ],
    ctaBg: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1600&q=80",
  },
  "AI Hyper-Realistic Video": {
    showcase: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80",
    showcaseBadgeTitle: "Cinematic Hyper-Realistic Synthesis",
    showcaseBadgeSub: "Hollywood-grade visual storytelling with photorealistic VFX rendering.",
    gallery: [
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    ],
    ctaBg: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80",
  },
  "Digital Twin & Clone Video": {
    showcase: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
    showcaseBadgeTitle: "Biometrically Accurate Digital Twins",
    showcaseBadgeSub: "Scale your executive presence and voice without manual recording.",
    gallery: [
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80",
    ],
    ctaBg: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=80",
  },
};

export default function AIVideoServicePage({
  data,
  categoryLabel,
  categorySlug,
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

  const activeMedia = aiVideoSubpageMedia[data.crumb] || aiVideoSubpageMedia["AI Avatar Video"];
  const videoGallerySamples = activeMedia.gallery;

  return (
    <div className="sc-career-page">
      <Header />

      {/* =========================================================================
          1. HERO SECTION (Manifesto Scroll Reveal & Continuous Video Gallery)
          ========================================================================= */}
      <section className="sc-manifesto-section">
        <div className="w-layout-blockcontainer container w-container">
          {/* Breadcrumb Navigation */}
          <div className="asx-breadcrumb" style={{ justifyContent: "center", marginBottom: "20px" }}>
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Services</span>
            <span>/</span>
            {categorySlug && categoryLabel ? (
              <>
                <Link href={`/services/${categorySlug}`}>{categoryLabel}</Link>
                <span>/</span>
              </>
            ) : null}
            <span className="asx-breadcrumb-current">{data.crumb}</span>
          </div>

          <div className="sc-manifesto-center-wrap">
            {data.heroEyebrow && (
              <span className="sc-manifesto-badge">
                {data.heroEyebrow}
              </span>
            )}
            <h1 className="sc-hero-title" style={{ margin: "0 0 16px" }}>
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
                        src={activeMedia.showcase}
                        alt={blockTitle}
                        className="sc-choice-left-img"
                        loading="lazy"
                      />
                      <div className="sc-choice-badge-overlay">
                        <div className="sc-choice-badge-title">{activeMedia.showcaseBadgeTitle}</div>
                        <p className="sc-choice-badge-sub">{activeMedia.showcaseBadgeSub}</p>
                      </div>
                    </div>

                    {/* Right Column Content */}
                    <div className="sc-choice-right-content" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <h2 className="sc-section-title" style={{ textAlign: "left", margin: "0 0 20px 0" }}>
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
                  <h2 className="sc-section-title" style={{ margin: "0 0 14px" }}>
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
        <div
          className="su-cinematic-bg-media"
          style={{ backgroundImage: `url("${activeMedia.ctaBg}")` }}
        />
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

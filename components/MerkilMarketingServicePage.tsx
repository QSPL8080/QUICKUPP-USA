"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/app/merkil-service.css";
import type {
  ServicePageData,
  ListBlock,
  DescPairsBlock,
  ProcessBlock,
  WhyChooseBlock,
  IndustriesBlock,
  AiBlock,
  FaqBlock,
  CardsBlock,
  StepsBlock,
} from "@/lib/servicePageTypes";

interface MerkilMarketingServicePageProps {
  data: ServicePageData;
  categoryLabel?: string;
  categorySlug?: string;
}

// Helper to render headings with the second half or last words in light gray text
function renderMerkilHeading(text: string) {
  if (!text) return null;
  const words = text.split(" ");
  if (words.length <= 3) {
    return <span>{text}</span>;
  }
  const splitPoint = Math.ceil(words.length / 2);
  const firstHalf = words.slice(0, splitPoint).join(" ");
  const secondHalf = words.slice(splitPoint).join(" ");

  return (
    <>
      <span>{firstHalf}</span>{" "}
      <span className="text-light-gray">{secondHalf}</span>
    </>
  );
}

export default function MerkilMarketingServicePage({
  data,
  categoryLabel = "AI-Powered Digital Marketing",
  categorySlug = "ai-powered-digital-marketing-services",
}: MerkilMarketingServicePageProps) {
  // FAQs closed by default
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Extract items faithfully from any block type without generating synthetic fallback text
  const extractItems = (block: any): { title: string; desc?: string }[] => {
    if (block.type === "list") {
      return (block.items || []).map((it: string) => ({
        title: it,
      }));
    }
    if (block.type === "descPairs") {
      return (block.items || []).map((it: any) => ({
        title: it.title,
        desc: it.desc,
      }));
    }
    if (block.type === "process" || block.type === "steps") {
      return (block.steps || []).map((st: any) => ({
        title: st.title,
        desc: st.desc || st.text,
      }));
    }
    if (block.type === "whyChoose") {
      return (block.bullets || []).map((b: string) => ({
        title: b,
      }));
    }
    if (block.type === "ai") {
      return (block.bullets || []).map((b: string) => ({
        title: b,
      }));
    }
    if (block.type === "cards") {
      return (block.cards || []).map((c: any) => ({
        title: c.title,
        desc: c.text || c.desc,
      }));
    }
    return [];
  };

  return (
    <div className="merkil-page-wrapper">
      <Header />

      <main style={{ paddingTop: "80px" }}>
        {/* ========================================================================= */}
        {/* SECTION 1: HERO SECTION (Full-Bleed Right Edge-to-Edge) */}
        {/* ========================================================================= */}
        <section className="merkil-hero-section" style={{ padding: "40px 0 60px" }}>
          <div className="merkil-hero-grid">
            <div className="merkil-hero-left">
              <div className="merkil-hero-content" style={{ gap: "18px" }}>
                {/* Eyebrow Badge */}
                <div className="badge yellow">
                  <img
                    src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/6890bee0bc046268f9b1496c_magic-wand.svg"
                    loading="lazy"
                    alt="Badge Icon"
                    className="badge-icon"
                  />
                  <div className="tagline">{data.heroEyebrow || data.crumb || "Digital Marketing"}</div>
                </div>

                <h1 className="home-hero-heading" style={{ margin: "4px 0 10px" }}>
                  {renderMerkilHeading(data.heroTitle)}
                </h1>

                {data.heroParagraphs && data.heroParagraphs.length > 0 && (
                  <div className="hero-subtitle-wrap" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {data.heroParagraphs.map((p, pIdx) => (
                      <div key={pIdx} className="paragraph-01 text-dark-gray" style={{ lineHeight: "26px", fontSize: "15px" }}>
                        {p}
                      </div>
                    ))}
                  </div>
                )}

                <div className="hero-button-wrap" style={{ marginTop: "10px", display: "flex", gap: "16px", alignItems: "center" }}>
                  <Link href={data.heroCta?.href || "/contact"} className="cta-button w-variant-8ce7a3fd-e4dc-43a0-b1eb-b74ad04c7e67 w-inline-block">
                    <img
                      src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fd96b8386df55b73b8d7d_Call.svg"
                      loading="lazy"
                      alt=""
                      className="call"
                    />
                    <div className="cta-button-text-wrap w-variant-8ce7a3fd-e4dc-43a0-b1eb-b74ad04c7e67">
                      <div className="cta-button-text-group">
                        <div className="button-01-text">{data.heroCta?.label || "Book a Free Call"}</div>
                        <div className="button-01-text">{data.heroCta?.label || "Book a Free Call"}</div>
                      </div>
                    </div>
                  </Link>

                  <Link href={`/services/${categorySlug}`} className="button-01 w-inline-block">
                    <div className="button-01-arrow-wrap">
                      <div className="button-01-arrow-group">
                        <img
                          src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fdc9026d2687b7bd01696_Arrow.svg"
                          loading="lazy"
                          alt=""
                          className="button-01-arrow"
                        />
                        <img
                          src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fdc9026d2687b7bd01696_Arrow.svg"
                          loading="lazy"
                          alt=""
                          className="button-01-arrow"
                        />
                      </div>
                    </div>
                    <div className="button-01-text-wrap">
                      <div className="button-01-text-group">
                        <div className="button-01-text">All Services</div>
                        <div className="button-01-text">All Services</div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="merkil-hero-right">
              <div className="merkil-hero-image-box" style={{ minHeight: "520px", maxHeight: "580px" }}>
                <img
                  src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b38088492c916cc2b2e802_203646ac22604322e486f1d149b88bc6_Hero%20Image.avif"
                  loading="lazy"
                  alt={data.heroTitle}
                  className="merkil-hero-img"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: SEQUENCED DISTINCT UNIQUE MERKIL LAYOUTS */}
        {/* ========================================================================= */}
        <div>
          {data.blocks.map((block, bIdx) => {
            const blockTitle = (block as any).title || "Specialized Solutions";
            const blockDesc = (block as any).desc || (block as any).intro;
            const blockTagline = (block as any).tagline;
            const blockCta = (block as any).cta;
            const items = extractItems(block);

            // -------------------------------------------------------------------
            // FAQ BLOCK: Accordion with all closed by default
            // -------------------------------------------------------------------
            if (block.type === "faq") {
              const faqBlock = block as FaqBlock;
              const faqItems = faqBlock.items || faqBlock.faqs || [];
              return (
                <section key={bIdx} className="faq w-variant-base" style={{ backgroundColor: "#ffffff", padding: "64px 0" }}>
                  <div className="container">
                    <div className="faq-wrap" style={{ maxWidth: "900px", margin: "0 auto" }}>
                      <div className="section-header-wrap center" style={{ marginBottom: "36px" }}>
                        <div className="section-header-content small">
                          <div className="section-badge-wrap">
                            <div className="section-badge w-variant-base">
                              <div className="badge-dot" />
                              <div className="tagline">{blockTagline || "Got Questions?"}</div>
                            </div>
                          </div>
                          <div className="section-heading-wrap space" style={{ marginTop: "14px" }}>
                            <h2 className="section-heading text-center" style={{ fontSize: "28px" }}>
                              {renderMerkilHeading(faqBlock.title || "Frequently Asked Questions")}
                            </h2>
                          </div>
                        </div>
                      </div>

                      <div className="faq-main-wrap" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        {faqItems.map((f, idx) => (
                          <div
                            key={idx}
                            className={`faq-item ${openFaq === idx ? "is-open" : ""}`}
                            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                            style={{ cursor: "pointer", padding: "20px 24px", borderRadius: "16px" }}
                          >
                            <div className="faq-question-wrap">
                              <div className="text-style-h3 faq-question" style={{ fontSize: "16.5px" }}>{f.q}</div>
                              <div className="faq-arrow-block">
                                <div className="faq-arrow-horizontal" />
                                <div className="faq-arrow-vertical" />
                              </div>
                            </div>
                            {openFaq === idx && (
                              <div className="faq-answer" style={{ paddingTop: "14px", fontSize: "14px", lineHeight: "24px", color: "#50545a" }}>
                                {f.a}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              );
            }

            // -------------------------------------------------------------------
            // INDUSTRIES BLOCK: Brand Chips
            // -------------------------------------------------------------------
            if (block.type === "industries") {
              const indBlock = block as IndustriesBlock;
              return (
                <section key={bIdx} className="brands" style={{ padding: "56px 0", backgroundColor: "#f8fafc" }}>
                  <div className="container">
                    <div className="section-header-wrap center" style={{ marginBottom: "32px" }}>
                      <div className="section-header-content">
                        <div className="section-badge-wrap">
                          <div className="section-badge w-variant-base">
                            <div className="badge-dot" />
                            <div className="tagline">{blockTagline || "Industry Verticals"}</div>
                          </div>
                        </div>
                        <div className="section-heading-wrap space" style={{ marginTop: "14px" }}>
                          <h2 className="section-heading text-center" style={{ fontSize: "28px" }}>
                            {renderMerkilHeading(indBlock.title || "Industries We Serve")}
                          </h2>
                        </div>
                        {blockDesc && (
                          <div className="section-subtitle-wrap" style={{ marginTop: "12px" }}>
                            <div className="paragraph-02 text-center text-dark-gray">{blockDesc}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", maxWidth: "1050px", margin: "0 auto" }}>
                      {indBlock.industries.map((ind, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "12px 24px",
                            backgroundColor: "#ffffff",
                            borderRadius: "100px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#0b0f17",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <span style={{ color: "#8b5cf6", fontSize: "14px" }}>✦</span>
                          <span>{ind}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            }

            // -------------------------------------------------------------------
            // PROCESS BLOCK: Merkil Purpose Stepper
            // -------------------------------------------------------------------
            if (block.type === "process" || block.type === "steps") {
              return (
                <section key={bIdx} className="merkil-purpose-section" style={{ backgroundColor: "#ffffff", padding: "64px 0" }}>
                  <div className="container">
                    <div className="section-header-wrap" style={{ marginBottom: "36px" }}>
                      <div className="section-header-left">
                        {blockTagline && (
                          <div className="section-badge-wrap">
                            <div className="section-badge w-variant-base">
                              <div className="badge-dot" />
                              <div className="tagline">{blockTagline}</div>
                            </div>
                          </div>
                        )}
                        <div className="section-heading-wrap">
                          <h2 className="section-heading" style={{ fontSize: "28px" }}>
                            {renderMerkilHeading(blockTitle)}
                          </h2>
                        </div>
                      </div>
                      {blockDesc && (
                        <div className="section-header-right">
                          <div className="paragraph-02 text-dark-gray">{blockDesc}</div>
                        </div>
                      )}
                    </div>

                    <div className="merkil-purpose-wrap" style={{ marginTop: "24px" }}>
                      <div className="merkil-purpose-left">
                        <div className="merkil-purpose-image-box" style={{ minHeight: "420px", borderRadius: "24px" }}>
                          <img
                            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80"
                            alt="Execution Framework"
                          />
                        </div>
                      </div>

                      <div className="merkil-purpose-right" style={{ gap: "16px" }}>
                        {items.map((st, idx) => {
                          const iconColors = ["", "pink", "yellow"];
                          return (
                            <div key={idx} className="merkil-purpose-card" style={{ padding: "18px 22px", borderRadius: "16px" }}>
                              <div className={`merkil-purpose-icon-box ${iconColors[idx % 3]}`} style={{ width: "38px", height: "38px", fontSize: "14px" }}>
                                {String(idx + 1).padStart(2, "0")}
                              </div>
                              <div className="merkil-purpose-details">
                                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0b0f17", marginBottom: "4px" }}>
                                  {st.title}
                                </h3>
                                {st.desc && (
                                  <p className="text-dark-gray" style={{ fontSize: "14px", lineHeight: "22px", margin: 0 }}>
                                    {st.desc}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>
              );
            }

            // -------------------------------------------------------------------
            // 5-SS: AI SECTION - SIDE BY SIDE WITH ONE-BY-ONE SLOW POINT ANIMATION
            // -------------------------------------------------------------------
            if (block.type === "ai") {
              const aiBlock = block as AiBlock;
              return (
                <section key={bIdx} className="ai-highlight-section" style={{ backgroundColor: "#fdfcff", padding: "64px 0", borderTop: "1px solid #f3effc" }}>
                  <div className="container">
                    <div className="ai-side-container">
                      {/* Left Side: Header & Overview */}
                      <div>
                        <div className="section-badge-wrap" style={{ marginBottom: "16px" }}>
                          <div className="section-badge w-variant-base" style={{ backgroundColor: "#f5f0ff", borderColor: "#e9dcfc" }}>
                            <div className="badge-dot" style={{ backgroundColor: "#8b5cf6" }} />
                            <div className="tagline">{aiBlock.tagline || "AI-Powered Innovation"}</div>
                          </div>
                        </div>
                        <h2 className="section-heading" style={{ fontSize: "32px", lineHeight: "1.25", marginBottom: "16px" }}>
                          {renderMerkilHeading(aiBlock.title || "AI-Powered Intelligence")}
                        </h2>
                        {aiBlock.desc && (
                          <div className="paragraph-01 text-dark-gray" style={{ fontSize: "15px", lineHeight: "26px", marginBottom: "28px" }}>
                            {aiBlock.desc}
                          </div>
                        )}
                        {blockCta && (
                          <div>
                            <Link href={blockCta.href || "/contact"} className="cta-button w-variant-8ce7a3fd-e4dc-43a0-b1eb-b74ad04c7e67 w-inline-block">
                              <img
                                src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fd96b8386df55b73b8d7d_Call.svg"
                                loading="lazy"
                                alt=""
                                className="call"
                              />
                              <div className="cta-button-text-wrap w-variant-8ce7a3fd-e4dc-43a0-b1eb-b74ad04c7e67">
                                <div className="cta-button-text-group">
                                  <div className="button-01-text">{blockCta.label}</div>
                                  <div className="button-01-text">{blockCta.label}</div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Right Side: Points Appearing One-by-One Slowly */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {(aiBlock.bullets || []).map((bullet, idx) => (
                          <div
                            key={idx}
                            className="stagger-point"
                            style={{
                              animationDelay: `${idx * 0.25 + 0.15}s`,
                              padding: "16px 22px",
                              backgroundColor: "#ffffff",
                              borderRadius: "16px",
                              border: "1px solid #e9dcfc",
                              boxShadow: "0 4px 14px rgba(139, 92, 246, 0.05)",
                              display: "flex",
                              alignItems: "center",
                              gap: "14px",
                              transition: "all 0.3s ease",
                            }}
                          >
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "10px",
                                backgroundColor: "#f5f0ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#8b5cf6",
                                fontWeight: 800,
                                fontSize: "13px",
                                flexShrink: 0,
                              }}
                            >
                              ✦
                            </div>
                            <div style={{ fontSize: "15px", fontWeight: 700, color: "#0b0f17", lineHeight: "22px" }}>
                              {bullet}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              );
            }

            // -------------------------------------------------------------------
            // 4-SS: WHY CHOOSE BLOCK - SIMPLE, DISTINCT, CLEAN BENEFIT CARDS (NO MARQUEE)
            // -------------------------------------------------------------------
            if (block.type === "whyChoose") {
              return (
                <section key={bIdx} className="merkil-why-clean-section" style={{ backgroundColor: "#f8fafc", padding: "64px 0" }}>
                  <div className="container">
                    <div className="section-header-wrap center" style={{ marginBottom: "36px" }}>
                      <div className="section-header-content">
                        {blockTagline && (
                          <div className="section-badge-wrap">
                            <div className="section-badge w-variant-base">
                              <div className="badge-dot" style={{ backgroundColor: "#10b981" }} />
                              <div className="tagline">{blockTagline}</div>
                            </div>
                          </div>
                        )}
                        <div className="section-heading-wrap space" style={{ marginTop: "14px" }}>
                          <h2 className="section-heading text-center" style={{ fontSize: "30px" }}>
                            {renderMerkilHeading(blockTitle)}
                          </h2>
                        </div>
                        {blockDesc && (
                          <div className="section-subtitle-wrap" style={{ marginTop: "12px" }}>
                            <div className="paragraph-02 text-center text-dark-gray">{blockDesc}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "14px",
                        maxWidth: "1100px",
                        margin: "0 auto",
                      }}
                    >
                      {items.map((item, idx) => (
                        <div key={idx} className="why-simple-card">
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "8px",
                              backgroundColor: "#e6f9ed",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#10b981",
                              fontWeight: 800,
                              fontSize: "14px",
                              flexShrink: 0,
                            }}
                          >
                            ✓
                          </div>
                          <div>
                            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0b0f17", margin: 0, lineHeight: "1.35" }}>
                              {item.title}
                            </h3>
                            {item.desc && (
                              <p style={{ fontSize: "13px", color: "#50545a", margin: 0, marginTop: "2px" }}>
                                {item.desc}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {blockCta && (
                      <div style={{ display: "flex", justifyContent: "center", marginTop: "36px" }}>
                        <Link href={blockCta.href || "/contact"} className="button-01 w-inline-block">
                          <div className="button-01-arrow-wrap">
                            <div className="button-01-arrow-group">
                              <img
                                src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fdc9026d2687b7bd01696_Arrow.svg"
                                loading="lazy"
                                alt=""
                                className="button-01-arrow"
                              />
                              <img
                                src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fdc9026d2687b7bd01696_Arrow.svg"
                                loading="lazy"
                                alt=""
                                className="button-01-arrow"
                              />
                            </div>
                          </div>
                          <div className="button-01-text-wrap">
                            <div className="button-01-text-group">
                              <div className="button-01-text">{blockCta.label}</div>
                              <div className="button-01-text">{blockCta.label}</div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </section>
              );
            }

            // -------------------------------------------------------------------
            // DISPATCHER FOR ALL OTHER CONTENT BLOCKS:
            // -------------------------------------------------------------------
            const cycleIndex = bIdx % 4;

            // ===================================================================
            // 1-SS: COMPACT MARQUEE RIBBON (Cycle 0)
            // ===================================================================
            if (cycleIndex === 0) {
              const row1Items = items.filter((_, i) => i % 2 === 0);
              const row2Items = items.filter((_, i) => i % 2 === 1);
              const list1 = row1Items.length > 0 ? row1Items : items;
              const list2 = row2Items.length > 0 ? row2Items : items;

              const duplicateToMin = (arr: typeof items, minLen = 8) => {
                let res = [...arr];
                while (res.length < minLen && arr.length > 0) {
                  res = [...res, ...arr];
                }
                return res;
              };

              const track1 = duplicateToMin(list1);
              const track2 = duplicateToMin(list2);

              return (
                <section key={bIdx} className="merkil-marquee-section" style={{ backgroundColor: "#ffffff", padding: "54px 0" }}>
                  <div className="container">
                    <div className="section-header-wrap" style={{ marginBottom: "28px" }}>
                      <div className="section-header-left">
                        {blockTagline && (
                          <div className="section-badge-wrap">
                            <div className="section-badge w-variant-base">
                              <div className="badge-dot" />
                              <div className="tagline">{blockTagline}</div>
                            </div>
                          </div>
                        )}
                        <div className="section-heading-wrap">
                          <h2 className="section-heading" style={{ fontSize: "28px" }}>
                            {renderMerkilHeading(blockTitle)}
                          </h2>
                        </div>
                      </div>
                      {blockDesc && (
                        <div className="section-header-right">
                          <div className="paragraph-02 text-dark-gray">{blockDesc}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Compact Infinite Marquee Container (1-SS) */}
                  <div className="merkil-marquee-container" style={{ marginTop: "18px", padding: "8px 0" }}>
                    {/* Row 1: Scrolling Left */}
                    <div className="merkil-marquee-row" style={{ marginBottom: "10px" }}>
                      <div className="merkil-marquee-track scroll-left" style={{ gap: "12px" }}>
                        {[...track1, ...track1].map((item, idx) => (
                          <div key={idx} className="merkil-marquee-card compact">
                            <div className="merkil-marquee-card-header">
                              <div
                                className="merkil-card-num-box"
                                style={{
                                  backgroundColor: (idx % track1.length) % 3 === 0 ? "#f5f0ff" : (idx % track1.length) % 3 === 1 ? "#fdf2ff" : "#fcfde6",
                                  border: `1px solid ${(idx % track1.length) % 3 === 0 ? "#e9dcfc" : (idx % track1.length) % 3 === 1 ? "#f5dcfc" : "#eef3aa"}`,
                                  width: "24px",
                                  height: "24px",
                                  fontSize: "11px",
                                }}
                              >
                                {String((idx % track1.length) + 1).padStart(2, "0")}
                              </div>
                              <span className="merkil-card-badge" style={{ fontSize: "10.5px" }}>✦ Core</span>
                            </div>
                            <div className="merkil-marquee-card-body">
                              <h3>{item.title}</h3>
                              {item.desc && <p style={{ fontSize: "12px", lineHeight: "17px", marginTop: "2px" }}>{item.desc}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Row 2: Scrolling Right */}
                    <div className="merkil-marquee-row">
                      <div className="merkil-marquee-track scroll-right" style={{ gap: "12px" }}>
                        {[...track2, ...track2].map((item, idx) => (
                          <div key={idx} className="merkil-marquee-card compact">
                            <div className="merkil-marquee-card-header">
                              <div
                                className="merkil-card-num-box"
                                style={{
                                  backgroundColor: (idx % track2.length) % 3 === 1 ? "#f5f0ff" : (idx % track2.length) % 3 === 2 ? "#fdf2ff" : "#fcfde6",
                                  border: `1px solid ${(idx % track2.length) % 3 === 1 ? "#e9dcfc" : (idx % track2.length) % 3 === 2 ? "#f5dcfc" : "#eef3aa"}`,
                                  width: "24px",
                                  height: "24px",
                                  fontSize: "11px",
                                }}
                              >
                                {String(((idx % track2.length) + 1) + track1.length).padStart(2, "0")}
                              </div>
                              <span className="merkil-card-badge" style={{ fontSize: "10.5px" }}>✦ Module</span>
                            </div>
                            <div className="merkil-marquee-card-body">
                              <h3>{item.title}</h3>
                              {item.desc && <p style={{ fontSize: "12px", lineHeight: "17px", marginTop: "2px" }}>{item.desc}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {blockCta && (
                    <div className="container" style={{ display: "flex", justifyContent: "center", marginTop: "32px" }}>
                      <Link href={blockCta.href || "/contact"} className="button-01 w-inline-block">
                        <div className="button-01-arrow-wrap">
                          <div className="button-01-arrow-group">
                            <img
                              src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fdc9026d2687b7bd01696_Arrow.svg"
                              loading="lazy"
                              alt=""
                              className="button-01-arrow"
                            />
                            <img
                              src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fdc9026d2687b7bd01696_Arrow.svg"
                              loading="lazy"
                              alt=""
                              className="button-01-arrow"
                            />
                          </div>
                        </div>
                        <div className="button-01-text-wrap">
                          <div className="button-01-text-group">
                            <div className="button-01-text">{blockCta.label}</div>
                            <div className="button-01-text">{blockCta.label}</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )}
                </section>
              );
            }

            // ===================================================================
            // 3-COLOR PASTEL BENTO CARDS (Cycle 1 - Platform Management)
            // ===================================================================
            if (cycleIndex === 1) {
              return (
                <section key={bIdx} className="services" style={{ backgroundColor: "#f8fafc", padding: "64px 0" }}>
                  <div className="container">
                    <div className="services-wrap">
                      <div className="section-header-wrap" style={{ marginBottom: "36px" }}>
                        <div className="section-header-left">
                          {blockTagline && (
                            <div className="section-badge-wrap">
                              <div className="section-badge w-variant-base">
                                <div className="badge-dot" />
                                <div className="tagline">{blockTagline}</div>
                              </div>
                            </div>
                          )}
                          <div className="section-heading-wrap">
                            <h2 className="section-heading" style={{ fontSize: "28px" }}>
                              {renderMerkilHeading(blockTitle)}
                            </h2>
                          </div>
                        </div>
                        {blockDesc && (
                          <div className="section-header-right">
                            <div className="paragraph-02 text-dark-gray">{blockDesc}</div>
                          </div>
                        )}
                      </div>

                      <div className="services-main-wrap" style={{ marginTop: "24px", gap: "18px" }}>
                        {items.map((item, idx) => {
                          const mod = idx % 3 === 0 ? "" : idx % 3 === 1 ? "_02" : "_03";
                          const icons = [
                            "https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/6890df3745eb863957876bc0_Pen.svg",
                            "https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/6890df37694b8b03c5806646_File.svg",
                            "https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/6890df1c52aea5653b4d88fc_Seo.svg",
                          ];
                          return (
                            <div key={idx} className={`services-card ${mod}`} style={{ padding: "24px 22px", borderRadius: "18px" }}>
                              <div>
                                <img src={icons[idx % 3]} loading="lazy" alt="" className="services-icon" style={{ width: "30px", height: "30px", marginBottom: "16px" }} />
                                <div className="services-details">
                                  <div className="services-text-wrap">
                                    <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0b0f17", marginBottom: item.desc ? "6px" : "0" }}>
                                      {item.title}
                                    </h3>
                                    {item.desc && (
                                      <p style={{ fontSize: "13.5px", lineHeight: "22px", color: "rgba(11, 15, 23, 0.75)", margin: 0 }}>
                                        {item.desc}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {blockCta && (
                        <div style={{ display: "flex", justifyContent: "center", marginTop: "36px" }}>
                          <Link href={blockCta.href || "/contact"} className="button-01 w-inline-block">
                            <div className="button-01-arrow-wrap">
                              <div className="button-01-arrow-group">
                                <img
                                  src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fdc9026d2687b7bd01696_Arrow.svg"
                                  loading="lazy"
                                  alt=""
                                  className="button-01-arrow"
                                />
                                <img
                                  src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fdc9026d2687b7bd01696_Arrow.svg"
                                  loading="lazy"
                                  alt=""
                                  className="button-01-arrow"
                                />
                              </div>
                            </div>
                            <div className="button-01-text-wrap">
                              <div className="button-01-text-group">
                                <div className="button-01-text">{blockCta.label}</div>
                                <div className="button-01-text">{blockCta.label}</div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            }

            // ===================================================================
            // 2-SS: EDITORIAL SHOWCASE WITH ONE-BY-ONE ANIMATED POINTS (Cycle 2 - Advertising)
            // ===================================================================
            if (cycleIndex === 2) {
              return (
                <section key={bIdx} className="about-01" style={{ backgroundColor: "#ffffff", padding: "64px 0" }}>
                  <div className="container">
                    <div className="about-01-wrap">
                      <div className="about-01-header-wrap" style={{ marginBottom: "32px" }}>
                        <div className="section-heading-wrap">
                          {blockTagline && (
                            <div className="section-badge-wrap position">
                              <div className="section-badge">
                                <div className="badge-dot" />
                                <div className="tagline">{blockTagline}</div>
                              </div>
                            </div>
                          )}
                          <h2 className="section-heading about-01-heading" style={{ fontSize: "28px" }}>
                            {renderMerkilHeading(blockTitle)}
                          </h2>
                        </div>
                      </div>

                      <div className="about-01-main-wrap" style={{ marginTop: "24px", gap: "40px" }}>
                        <div className="about-01-left">
                          <div className="about-01-details">
                            {blockDesc && (
                              <div className="about-01-text-wrap" style={{ marginBottom: "22px" }}>
                                <div className="paragraph-02 text-dark-gray" style={{ lineHeight: "26px", fontSize: "15px" }}>
                                  {blockDesc}
                                </div>
                              </div>
                            )}

                            {/* Staggered One-By-One Points (2-SS) */}
                            {items.length > 0 && (
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: items.length > 4 ? "repeat(2, 1fr)" : "1fr",
                                  gap: "12px",
                                  marginBottom: "24px",
                                }}
                              >
                                {items.map((item, iIdx) => (
                                  <div
                                    key={iIdx}
                                    className="stagger-point"
                                    style={{
                                      animationDelay: `${iIdx * 0.15 + 0.1}s`,
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: "10px",
                                      padding: "12px 16px",
                                      backgroundColor: "#f8fafc",
                                      borderRadius: "12px",
                                      border: "1px solid #e2e8f0",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                                    }}
                                  >
                                    <span style={{ color: "#8b5cf6", fontWeight: 700, fontSize: "14px" }}>✦</span>
                                    <div>
                                      <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#0b0f17" }}>{item.title}</div>
                                      {item.desc && (
                                        <div style={{ fontSize: "13px", color: "rgba(11,15,23,0.7)", marginTop: "3px" }}>
                                          {item.desc}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {blockCta && (
                              <div className="about-01-button-wrap" style={{ marginTop: "20px" }}>
                                <Link href={blockCta.href || "/contact"} className="button-02 w-inline-block">
                                  <div className="button-02-arrow-wrap">
                                    <div className="button-02-arrow-group">
                                      <img
                                        loading="lazy"
                                        src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fdc9026d2687b7bd01696_Arrow.svg"
                                        alt=""
                                        className="button-02-arrow"
                                      />
                                      <img
                                        loading="lazy"
                                        src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fdea99c92801291dd0db4_Arrow%20White.svg"
                                        alt=""
                                        className="button-02-arrow"
                                      />
                                    </div>
                                  </div>
                                  <div className="button-02-text-wrap">
                                    <div className="button-02-text-group">
                                      <div className="button-01-text text-white">{blockCta.label}</div>
                                      <div className="button-01-text">{blockCta.label}</div>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="about-01-right">
                          <div className="about-01-image-wrap" style={{ height: "380px", borderRadius: "20px" }}>
                            <div className="image-wrap">
                              <img
                                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80"
                                loading="lazy"
                                alt={blockTitle}
                                className="fit-cover"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );
            }

            // ===================================================================
            // 3-SS: CREATIVE CONTENT 3D MEDIA BENTO GRID (Cycle 3 - Content Creation)
            // ===================================================================
            const creativeIcons = ["📹", "🎨", "📱", "📊", "⚡", "✍️", "📅", "🚀"];
            return (
              <section key={bIdx} className="merkil-creative-content-section" style={{ backgroundColor: "#fdfdfd", padding: "64px 0", borderTop: "1px solid #f0f0f3" }}>
                <div className="container">
                  <div className="section-header-wrap" style={{ marginBottom: "36px" }}>
                    <div className="section-header-left">
                      {blockTagline && (
                        <div className="section-badge-wrap">
                          <div className="section-badge w-variant-base">
                            <div className="badge-dot" style={{ backgroundColor: "#ec4899" }} />
                            <div className="tagline">{blockTagline}</div>
                          </div>
                        </div>
                      )}
                      <div className="section-heading-wrap">
                        <h2 className="section-heading" style={{ fontSize: "28px" }}>
                          {renderMerkilHeading(blockTitle)}
                        </h2>
                      </div>
                    </div>
                    {blockDesc && (
                      <div className="section-header-right">
                        <div className="paragraph-02 text-dark-gray">{blockDesc}</div>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                      gap: "16px",
                      marginTop: "24px",
                    }}
                  >
                    {items.map((item, idx) => (
                      <div key={idx} className="creative-content-card">
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "14px",
                            backgroundColor: idx % 3 === 0 ? "#fdf2ff" : idx % 3 === 1 ? "#f5f0ff" : "#fcfde6",
                            border: `1px solid ${idx % 3 === 0 ? "#f5dcfc" : idx % 3 === 1 ? "#e9dcfc" : "#eef3aa"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                            flexShrink: 0,
                          }}
                        >
                          {creativeIcons[idx % creativeIcons.length]}
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", fontWeight: 800, color: "#8b5cf6", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "2px" }}>
                            Format {String(idx + 1).padStart(2, "0")}
                          </div>
                          <h3 style={{ fontSize: "15.5px", fontWeight: 700, color: "#0b0f17", margin: 0, lineHeight: "1.3" }}>
                            {item.title}
                          </h3>
                          {item.desc && (
                            <p style={{ fontSize: "13px", lineHeight: "19px", color: "#50545a", margin: 0, marginTop: "4px" }}>
                              {item.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {blockCta && (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "36px" }}>
                      <Link href={blockCta.href || "/contact"} className="button-01 w-inline-block">
                        <div className="button-01-arrow-wrap">
                          <div className="button-01-arrow-group">
                            <img
                              src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fdc9026d2687b7bd01696_Arrow.svg"
                              loading="lazy"
                              alt=""
                              className="button-01-arrow"
                            />
                            <img
                              src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fdc9026d2687b7bd01696_Arrow.svg"
                              loading="lazy"
                              alt=""
                              className="button-01-arrow"
                            />
                          </div>
                        </div>
                        <div className="button-01-text-wrap">
                          <div className="button-01-text-group">
                            <div className="button-01-text">{blockCta.label}</div>
                            <div className="button-01-text">{blockCta.label}</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: CLOSING FULL-WIDTH CTA BANNER */}
        {/* ========================================================================= */}
        <section className="cta" style={{ padding: "64px 0" }}>
          <div className="container">
            <div className="cta-wrap">
              <div className="badge white pill">
                <img
                  src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/6890bee0bc046268f9b1496c_magic-wand.svg"
                  loading="lazy"
                  alt="Badge Icon"
                  className="badge-icon"
                />
                <div className="tagline">Take The Next Step</div>
              </div>
              <div className="cta-heading-wrap" style={{ marginTop: "16px" }}>
                <h2 className="section-heading text-center" style={{ fontSize: "32px" }}>
                  {renderMerkilHeading(data.closingTitle || "Take your marketing to the next level")}
                </h2>
              </div>
              {data.closingDesc && (
                <div className="cta-subtitle-wrap" style={{ marginTop: "14px" }}>
                  <div className="paragraph-02 text-center text-dark-gray" style={{ whiteSpace: "pre-line", fontSize: "15px" }}>
                    {data.closingDesc}
                  </div>
                </div>
              )}
              <div className="cta-button-wrap" style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center", marginTop: "28px" }}>
                {(data.closingCtas || [{ label: "Book a Free Call", href: "/contact" }]).map((cta, cIdx) => (
                  <Link key={cIdx} href={cta.href || "/contact"} className="cta-button w-variant-8ce7a3fd-e4dc-43a0-b1eb-b74ad04c7e67 w-inline-block">
                    <img
                      src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fd96b8386df55b73b8d7d_Call.svg"
                      loading="lazy"
                      alt=""
                      className="call"
                    />
                    <div className="cta-button-text-wrap w-variant-8ce7a3fd-e4dc-43a0-b1eb-b74ad04c7e67">
                      <div className="cta-button-text-group">
                        <div className="button-01-text">{cta.label}</div>
                        <div className="button-01-text">{cta.label}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
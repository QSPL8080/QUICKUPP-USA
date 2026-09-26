"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { ServicePageData, ServiceBlock } from "@/lib/servicePageTypes";
import "@/app/copora-service.css";

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

// Copora Signature Dual-Text Roll-up Button
function CoporaButton({
  href,
  label,
  variant = "black",
  className = "",
}: {
  href: string;
  label: string;
  variant?: "black" | "white" | "white-solid";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`button-link-hover ${
        variant === "white"
          ? "white"
          : variant === "white-solid"
          ? "white-solid"
          : ""
      } ${className}`}
    >
      <div className="button-content">
        <div className="button-text-wrap regular-text">
          <div className="button-text">{label}</div>
        </div>
        <div className="button-text-wrap hover-text">
          <div className="button-text">{label}</div>
        </div>
      </div>
    </Link>
  );
}

export default function CoporaServicePage({ data }: Props) {
  // All FAQ items hidden by default
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract blocks by type
  const faqBlock = data.blocks.find(
    (b): b is Extract<ServiceBlock, { type: "faq" }> => b.type === "faq"
  );
  const faqItems: { q: string; a: string }[] = faqBlock
    ? faqBlock.items || (faqBlock as any).faqs || []
    : [];

  const processBlock = data.blocks.find(
    (b): b is Extract<ServiceBlock, { type: "process" }> => b.type === "process"
  );

  const whyChooseBlock = data.blocks.find(
    (b): b is Extract<ServiceBlock, { type: "whyChoose" }> =>
      b.type === "whyChoose"
  );

  const descPairsBlock = data.blocks.find(
    (b): b is Extract<ServiceBlock, { type: "descPairs" }> =>
      b.type === "descPairs"
  );

  const industriesBlock = data.blocks.find(
    (b): b is Extract<ServiceBlock, { type: "industries" }> =>
      b.type === "industries"
  );

  // Primary service offering blocks (cards with cta buttons)
  const serviceOfferingBlocks = data.blocks.filter((b) => {
    if (
      b.type === "faq" ||
      b.type === "process" ||
      b.type === "steps" ||
      b.type === "whyChoose" ||
      b.type === "descPairs" ||
      b.type === "industries"
    ) {
      return false;
    }
    // Offerings have a CTA button
    return (b as any).cta !== undefined;
  });

  // Additional capability / audience blocks (without CTA)
  const businessNeedsBlock = data.blocks.find(
    (b) =>
      b.type === "ai" &&
      (b as any).cta === undefined &&
      !((b as any).title?.includes("Why Invest") ||
        (b as any).title?.includes("Why Businesses Invest"))
  ) as any;

  // Investment / value justification block
  const whyInvestBlock = data.blocks.find(
    (b) =>
      b.type === "ai" &&
      (b as any).cta === undefined &&
      ((b as any).title?.includes("Why Invest") ||
        (b as any).title?.includes("Why Businesses Invest"))
  ) as any;

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in-view");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = containerRef.current?.querySelectorAll(".copora-reveal");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Context-specific landscape showcase image
  const heroImage =
    data.crumb === "Application Development"
      ? "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1800&q=85"
      : data.crumb === "Product Engineering"
      ? "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1800&q=85"
      : data.crumb === "Quality Assurance & Testing"
      ? "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1800&q=85"
      : data.crumb === "UI/UX Design"
      ? "https://images.unsplash.com/photo-1581291518655-9523c93269c4?auto=format&fit=crop&w=1800&q=85"
      : "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1800&q=85";

  const industryLinks: Record<string, string> = {
    Healthcare: "/industries/healthcare",
    "Home Services": "/industries/home-services",
    "Professional Services": "/industries/professional-services",
    Education: "/industries/education",
    "IT & SaaS": "/industries/it-saas",
    eCommerce: "/industries/ecommerce",
    "Real Estate": "/industries/real-estate",
    "Interior Design": "/industries/interior-design",
    "Travel & Hospitality": "/industries/travel-hospitality",
    Automotive: "/contact",
  };

  return (
    <div className="copora-page" ref={containerRef}>
      <Header />

      {/* =========================================================================
          1. HERO SECTION (Strictly User Content)
          ========================================================================= */}
      <section className="hero-section">
        <div className="container-medium w-container">
          <div className="section-title about-title-center copora-reveal">
            {data.heroEyebrow && (
              <div className="pre-section-title">{data.heroEyebrow}</div>
            )}
            <h1>{renderGradientHeading(data.heroTitle)}</h1>

            {data.heroParagraphs && data.heroParagraphs.length > 0 && (
              <div className="hero-paragraphs-container">
                <p className="hero-lead-paragraph">
                  {data.heroParagraphs[0]}
                </p>

                {data.heroParagraphs.length > 1 && (
                  <div className="hero-supporting-paragraphs">
                    {data.heroParagraphs.slice(1).map((para, idx) => (
                      <p key={idx} className="hero-sub-paragraph">
                        {para}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Hero Action Buttons */}
            <div className="hero-buttons-wrap">
              {data.heroCtas && data.heroCtas.length > 0 ? (
                <>
                  <CoporaButton
                    href={data.heroCtas[0].href}
                    label={data.heroCtas[0].label}
                    variant="black"
                  />
                  {data.heroCtas[1] && (
                    <CoporaButton
                      href={data.heroCtas[1].href}
                      label={data.heroCtas[1].label}
                      variant="white"
                    />
                  )}
                </>
              ) : data.heroCta ? (
                <CoporaButton
                  href={data.heroCta.href}
                  label={data.heroCta.label}
                  variant="black"
                />
              ) : null}
            </div>
          </div>

          <div
            className="about-image-wrap copora-reveal"
            style={{ marginTop: "1.5rem" }}
          >
            <div className="about-inner-image">
              <img
                src={heroImage}
                alt={data.heroTitle}
                className="hero-inner-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. CORE SERVICES GRID
          ========================================================================= */}
      {serviceOfferingBlocks.length > 0 && (
        <section className="copora-services-section">
          <div className="container w-container">
            <div className="section-title section-center-title copora-reveal">
              <div className="pre-section-title">OUR SERVICES &amp; EXPERTISE</div>
              <h2>
                {data.crumb
                  ? renderGradientHeading(`Our ${data.crumb} Services`)
                  : renderGradientHeading("Our Core Services")}
              </h2>
              {data.crumb === "Application Development" && (
                <p style={{ color: "#5a5a5a", fontSize: "1.05rem", margin: "0 auto", maxWidth: "780px" }}>
                  We offer complete mobile application development solutions for startups, SMBs, enterprises, and growing digital businesses.
                </p>
              )}
              {data.crumb === "Product Engineering" && (
                <p style={{ color: "#5a5a5a", fontSize: "1.05rem", margin: "0 auto", maxWidth: "780px" }}>
                  We develop custom software solutions around your business processes, users, technology environment, and long-term growth objectives.
                </p>
              )}
            </div>

            <div className="copora-services-grid copora-reveal">
              {serviceOfferingBlocks.map((block: any, idx: number) => {
                const bTitle = block.title;
                const bSubtitle = block.subtitle;
                const bDesc = block.desc;
                const bIntro = block.intro;
                const bItems: any[] =
                  block.items || block.bullets || block.cards || [];
                const bNote = block.note;
                const bCta = block.cta;
                const stepNum = String(idx + 1).padStart(2, "0");

                return (
                  <div key={idx} className="copora-service-card">
                    <div className="copora-card-body">
                      <div className="copora-card-head">
                        <h3 className="copora-service-title">{bTitle}</h3>
                        <span className="copora-service-num">{stepNum}</span>
                      </div>

                      {bSubtitle && (
                        <div className="copora-service-subtitle">{bSubtitle}</div>
                      )}

                      {bDesc && <p className="copora-service-desc">{bDesc}</p>}

                      {bIntro && (
                        <div className="copora-service-intro-label">{bIntro}</div>
                      )}

                      {bItems.length > 0 && (
                        <div className="copora-bullets-grid">
                          {bItems.map((item: any, iIdx: number) => {
                            const itemText =
                              typeof item === "string"
                                ? item
                                : item.title && item.desc
                                ? `${item.title}: ${item.desc}`
                                : item.title || item.text || item.desc || "";
                            return (
                              <div key={iIdx} className="copora-bullet-item">
                                <span className="copora-bullet-dot" />
                                <span>{itemText}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {bNote && <div className="copora-service-note">{bNote}</div>}
                    </div>

                    {bCta && (
                      <div className="copora-card-action">
                        <CoporaButton
                          href={bCta.href || "/contact"}
                          label={bCta.label}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          3. WHY CHOOSE (DESC PAIRS OR SPLIT MATRIX)
          ========================================================================= */}
      {descPairsBlock && (
        <section className="copora-why-section" style={{ backgroundColor: "#ffffff" }}>
          <div className="container w-container">
            <div className="section-title section-center-title copora-reveal">
              <div className="pre-section-title">WHY QUICKUPP SOFTECH</div>
              <h2>{renderGradientHeading(descPairsBlock.title || "Why Choose Quickupp Softech?")}</h2>
              {descPairsBlock.desc && (
                <p style={{ color: "#5a5a5a", fontSize: "1.05rem", margin: "0 auto", maxWidth: "680px" }}>
                  {descPairsBlock.desc}
                </p>
              )}
            </div>

            <div className="copora-desc-pairs-grid copora-reveal">
              {descPairsBlock.items.map((item, idx) => (
                <div key={idx} className="copora-desc-pair-card">
                  <span className="copora-desc-pair-num">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="copora-desc-pair-title">{item.title}</h3>
                  <p className="copora-desc-pair-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {whyChooseBlock && (
        <section className="copora-why-section">
          <div className="container-medium w-container">
            <div className="copora-why-grid copora-reveal">
              {/* Left Column Card */}
              <div className="copora-why-card-left">
                <div>
                  {whyChooseBlock.tagline && (
                    <div className="copora-tagline-badge">
                      <span>✦</span>
                      <span>{whyChooseBlock.tagline}</span>
                    </div>
                  )}
                  <h2
                    className="our-mission-title"
                    style={{ marginBottom: "1.25rem" }}
                  >
                    {renderGradientHeading(whyChooseBlock.title || "Why Choose Quickupp Softech?")}
                  </h2>
                  <p
                    style={{
                      color: "#5a5a5a",
                      fontSize: "1.05rem",
                      lineHeight: "1.65",
                      margin: 0,
                    }}
                  >
                    {whyChooseBlock.desc}
                  </p>
                </div>
              </div>

              {/* Right Column Dark Matrix Card */}
              <div className="copora-why-card-right">
                <div className="copora-why-bullets">
                  {whyChooseBlock.bullets.map((bullet, idx) => (
                    <div key={idx} className="copora-why-bullet-item">
                      <span className="copora-check-icon">✓</span>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          4. PROCESS (CONTINUOUS RIGHT-TO-LEFT INFINITE LOOP)
          ========================================================================= */}
      {processBlock && (
        <section className="copora-process-section">
          <div className="container w-container">
            <div className="section-title section-center-title copora-reveal">
              <div className="pre-section-title white">OUR METHODOLOGY &amp; WORKFLOW</div>
              <h2 style={{ color: "#ffffff" }}>{renderGradientHeading(processBlock.title)}</h2>
              {processBlock.desc && (
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "1.05rem",
                    margin: "0 auto",
                    maxWidth: "680px",
                  }}
                >
                  {processBlock.desc}
                </p>
              )}
            </div>
          </div>

          <div className="copora-process-marquee-container">
            <div className="copora-process-marquee-track">
              {[...processBlock.steps, ...processBlock.steps].map((step, idx) => (
                <div key={idx} className="copora-step-card">
                  <div className="copora-step-num">{step.num}</div>
                  <h3 className="copora-step-title">{step.title}</h3>
                  <p className="copora-step-desc">{step.desc || step.text}</p>
                </div>
              ))}
            </div>
          </div>

          {processBlock.cta && (
            <div
              className="container w-container"
              style={{ marginTop: "1.75rem" }}
            >
              <div className="copora-process-cta copora-reveal">
                <CoporaButton
                  href={processBlock.cta.href || "/contact"}
                  label={processBlock.cta.label}
                  variant="white-solid"
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          5. BUSINESS NEEDS FEATURE MATRIX
          ========================================================================= */}
      {businessNeedsBlock && (
        <section className="copora-feature-matrix-section">
          <div className="container w-container">
            <div className="section-title section-center-title copora-reveal">
              <div className="pre-section-title">STRATEGIC CAPABILITIES</div>
              <h2>{renderGradientHeading(businessNeedsBlock.title)}</h2>
              {businessNeedsBlock.intro && (
                <p style={{ color: "#5a5a5a", fontSize: "1.05rem", margin: "0 auto", maxWidth: "720px" }}>
                  {businessNeedsBlock.intro}
                </p>
              )}
            </div>

            <div className="copora-feature-matrix-grid copora-reveal">
              {businessNeedsBlock.bullets?.map((item: string, idx: number) => (
                <div key={idx} className="copora-feature-matrix-card">
                  <span className="copora-feature-dot" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          6. WHY BUSINESSES INVEST SECTION
          ========================================================================= */}
      {whyInvestBlock && (
        <section className="copora-investment-section">
          <div className="container w-container">
            <div className="section-title section-center-title copora-reveal">
              <div className="pre-section-title">BUSINESS VALUE &amp; ROI</div>
              <h2>{renderGradientHeading(whyInvestBlock.title)}</h2>
              {whyInvestBlock.intro && (
                <p style={{ color: "#5a5a5a", fontSize: "1.05rem", margin: "0 auto", maxWidth: "680px" }}>
                  {whyInvestBlock.intro}
                </p>
              )}
            </div>

            <div className="copora-investment-box copora-reveal">
              <div className="copora-investment-bullets">
                {whyInvestBlock.bullets?.map((bullet: string, idx: number) => (
                  <div key={idx} className="copora-investment-item">
                    <span className="copora-investment-check">✓</span>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>

              {whyInvestBlock.desc && (
                <p className="copora-investment-footer">
                  {whyInvestBlock.desc}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          7. INDUSTRIES WE SERVE
          ========================================================================= */}
      {industriesBlock && (
        <section className="copora-industries-section">
          <div className="container w-container">
            <div className="section-title section-center-title copora-reveal">
              <div className="pre-section-title">SECTOR EXPERTISE</div>
              <h2>{renderGradientHeading(industriesBlock.title || "Industries We Serve")}</h2>
              {industriesBlock.intro && (
                <p
                  style={{
                    color: "#5a5a5a",
                    fontSize: "1.05rem",
                    margin: "0 auto",
                    maxWidth: "680px",
                  }}
                >
                  {industriesBlock.intro}
                </p>
              )}
            </div>

            <div className="copora-industries-grid copora-reveal">
              {industriesBlock.industries.map((ind, idx) => {
                const linkHref = industryLinks[ind] || "/contact";
                return (
                  <Link
                    key={idx}
                    href={linkHref}
                    className="copora-industry-pill"
                  >
                    <span>{ind}</span>
                    <span className="copora-industry-arrow">→</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          8. FREQUENTLY ASKED QUESTIONS (DEFAULT ALL CLOSED)
          ========================================================================= */}
      {faqItems.length > 0 && (
        <section className="copora-faq-section" style={{ paddingTop: "5rem" }}>
          <div className="container w-container">
            <div className="section-title section-center-title copora-reveal">
              <div className="pre-section-title">FREQUENTLY ASKED QUESTIONS</div>
              <h2>{renderGradientHeading(faqBlock?.title || "Frequently Asked Questions")}</h2>
            </div>

            <div className="copora-faq-wrap copora-reveal">
              {faqItems.map((item: any, idx: number) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="copora-faq-item"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                  >
                    <div className="copora-faq-header">
                      <h4 className="copora-faq-question">{item.q}</h4>
                      <span
                        className={`copora-faq-icon ${isOpen ? "open" : ""}`}
                      >
                        +
                      </span>
                    </div>
                    {isOpen && (
                      <div className="copora-faq-answer">
                        <p style={{ margin: 0 }}>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          9. CLOSING CTA BANNER
          ========================================================================= */}
      <section className="cta-section section-spacing">
        <div className="container-medium w-container">
          <div className="cta-item copora-reveal">
            <div className="cta-title-wrap">
              <h3 className="about-cta-title">
                {renderGradientHeading(
                  data.closingTitle ||
                    "Build a Website That Works for Your Business"
                )}
              </h3>
              {data.closingDesc && (
                <div
                  className="cta-description"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {data.closingDesc}
                </div>
              )}
            </div>
            <div className="hero-buttons-wrap">
              {data.closingCtas && data.closingCtas.length > 0 ? (
                <>
                  <CoporaButton
                    href={data.closingCtas[0].href}
                    label={data.closingCtas[0].label}
                    variant="black"
                  />
                  {data.closingCtas[1] && (
                    <CoporaButton
                      href={data.closingCtas[1].href}
                      label={data.closingCtas[1].label}
                      variant="white"
                    />
                  )}
                </>
              ) : (
                <CoporaButton
                  href="/contact"
                  label="Get a Free Consultation"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}



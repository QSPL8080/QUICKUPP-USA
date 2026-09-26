"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { ServicePageData, ServiceBlock } from "@/lib/servicePageTypes";

// Diagonal Arrow Icon
function DiagonalArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`lc-arrow-icon ${className}`}
      aria-hidden="true"
    >
      <path
        d="M3 11L11 3M11 3H4M11 3V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Geometric Icon Renderer for Cards
function BoxedIcon({ index }: { index: number }) {
  const icons = [
    // 0: Code / Framework
    <svg key="0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    // 1: Architecture / System
    <svg key="1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></svg>,
    // 2: Speed / Performance
    <svg key="2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    // 3: Security / Shield
    <svg key="3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    // 4: Layers / Scalability
    <svg key="4" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
    // 5: Mobile / Device
    <svg key="5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><line x1="12" x2="12.01" y1="18" y2="18"/></svg>,
    // 6: Database / Cloud
    <svg key="6" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
    // 7: Check / Quality
    <svg key="7" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>,
  ];
  return <div className="lc-boxed-icon">{icons[index % icons.length]}</div>;
}

// Dual-Text Sliding Animated Button (Lifecycle Reference Signature Interaction)
function LifecycleButton({
  href,
  label,
  variant = "primary",
  className = "",
}: {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "dark" | "outline";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`lc-btn lc-btn-${variant} ${className}`}
    >
      <span className="lc-btn-inner">
        <span className="lc-btn-text-main">{label}</span>
        <span aria-hidden="true" className="lc-btn-text-hover">
          {label}
        </span>
      </span>
      <DiagonalArrow />
    </Link>
  );
}

// Helper to render headings with punchline in gradient text
function renderGradientHeading(text?: string) {
  if (!text) return null;
  const words = text.split(" ");
  if (words.length <= 2) {
    return <span className="qs-gradient-text">{text}</span>;
  }
  const splitIndex = Math.ceil(words.length / 2);
  const firstHalf = words.slice(0, splitIndex).join(" ");
  const secondHalf = words.slice(splitIndex).join(" ");

  return (
    <>
      {firstHalf} <span className="qs-gradient-text">{secondHalf}</span>
    </>
  );
}

export default function ITLifecycleServicePage({ data }: { data: ServicePageData }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for Lifecycle-style staggered scroll reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("lc-in-view");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = containerRef.current?.querySelectorAll(".lc-reveal");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const aiBlocks = data.blocks.filter((b) => b.type === "ai");
  const processBlock = data.blocks.find((b) => b.type === "process");
  const whyChooseBlock = data.blocks.find((b) => b.type === "whyChoose");
  const industriesBlock = data.blocks.find((b) => b.type === "industries");
  const faqBlock = data.blocks.find((b) => b.type === "faq");
  const listBlocks = data.blocks.filter((b) => b.type === "list" || b.type === "descPairs");

  return (
    <div ref={containerRef} className="lc-page-wrapper">
      <Header />

      {/* ===== 1. HERO SECTION ===== */}
      <section className="lc-hero">
        <div className="lc-container">
          <div className="lc-hero-grid">
            <div className="lc-hero-content lc-reveal lc-reveal-up">
              {/* Bracketed Eyebrow Badge */}
              <div className="lc-badge">
                <span className="lc-badge-dot"></span>
                <span>[{data.heroEyebrow || "Information Technology"}]</span>
              </div>

              {/* Large Editorial Headline */}
              <h1 className="lc-hero-title">{renderGradientHeading(data.heroTitle)}</h1>

              {/* Lead Paragraphs */}
              <div className="lc-hero-lead-wrap">
                {data.heroParagraphs.map((p, i) => (
                  <p key={i} className={`lc-hero-desc ${i === 0 ? "lc-hero-lead" : ""}`}>
                    {p}
                  </p>
                ))}
              </div>

              {/* Primary Action Button */}
              {data.heroCta && (
                <div className="lc-hero-actions">
                  <LifecycleButton
                    href={data.heroCta.href}
                    label={data.heroCta.label}
                    variant="primary"
                  />
                  <Link href="/contact" className="lc-hero-secondary-link">
                    <span>Talk to an Architect</span>
                    <DiagonalArrow />
                  </Link>
                </div>
              )}
            </div>

            {/* Supporting Visual Dashboard Card */}
            <div className="lc-hero-visual lc-reveal lc-reveal-left">
              <div className="lc-card-glass">
                <div className="lc-glass-header">
                  <div className="lc-dots-row">
                    <span className="lc-dot lc-dot-red"></span>
                    <span className="lc-dot lc-dot-yellow"></span>
                    <span className="lc-dot lc-dot-green"></span>
                  </div>
                  <div className="lc-glass-title">Production Environment</div>
                  <div className="lc-badge-mini">Live 99.9%</div>
                </div>

                <div className="lc-glass-body">
                  <div className="lc-metric-row">
                    <div className="lc-metric-item">
                      <span className="lc-metric-num">100%</span>
                      <span className="lc-metric-lbl">Custom Code</span>
                    </div>
                    <div className="lc-metric-item">
                      <span className="lc-metric-num">&lt; 0.8s</span>
                      <span className="lc-metric-lbl">Load Speed</span>
                    </div>
                    <div className="lc-metric-item">
                      <span className="lc-metric-num">24/7</span>
                      <span className="lc-metric-lbl">Architecture</span>
                    </div>
                  </div>

                  <div className="lc-code-preview">
                    <div className="lc-code-line"><span className="lc-c-keyword">import</span> &#123; ScalableEngine &#125; <span className="lc-c-keyword">from</span> <span className="lc-c-string">&quot;@quickupp/core&quot;</span>;</div>
                    <div className="lc-code-line"><span className="lc-c-keyword">const</span> system = <span className="lc-c-func">deployInfrastructure</span>(&#123;</div>
                    <div className="lc-code-line lc-indent"><span className="lc-c-prop">performance</span>: <span className="lc-c-string">&quot;optimal&quot;</span>,</div>
                    <div className="lc-code-line lc-indent"><span className="lc-c-prop">security</span>: <span className="lc-c-string">&quot;enterprise-grade&quot;</span></div>
                    <div className="lc-code-line">&#125;);</div>
                  </div>

                  <div className="lc-feature-pills">
                    <span className="lc-pill">Full-Stack Engineering</span>
                    <span className="lc-pill">API First</span>
                    <span className="lc-pill">Modern UI/UX</span>
                    <span className="lc-pill">Enterprise Scale</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. CAPABILITIES & SOLUTIONS (EDITORIAL CARDS & SPLIT MODULES) ===== */}
      {aiBlocks.length > 0 && (
        <section className="lc-section lc-bg-light">
          <div className="lc-container">
            <div className="lc-section-head lc-reveal lc-reveal-up">
              <div className="lc-badge lc-badge-dark">
                <span className="lc-badge-dot lc-dot-lime"></span>
                <span>[Capabilities &amp; Solutions]</span>
              </div>
              <h2 className="lc-section-title">Engineered For Performance &amp; <span className="qs-gradient-text">Scalability</span></h2>
              <p className="lc-section-sub">
                Explore our full suite of technical capabilities, architectures, and development frameworks built around your business goals.
              </p>
            </div>

            <div className="lc-modules-grid">
              {aiBlocks.map((block, idx) => {
                if (block.type !== "ai") return null;
                const b = block;
                const isEven = idx % 2 === 0;

                return (
                  <div
                    key={idx}
                    className={`lc-module-card lc-reveal lc-reveal-up ${isEven ? "lc-card-accent" : ""}`}
                  >
                    <div className="lc-card-top">
                      <div className="lc-card-idx-badge">
                        <BoxedIcon index={idx} />
                        <span className="lc-module-num">0{idx + 1}</span>
                      </div>
                      <h3 className="lc-card-title">{b.title}</h3>
                      {b.intro && <p className="lc-card-intro">{b.intro}</p>}
                    </div>

                    {b.bullets && b.bullets.length > 0 && (
                      <div className="lc-card-bullets-wrap">
                        <div className="lc-bullets-label">Core Capabilities</div>
                        <ul className="lc-bullets-list">
                          {b.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="lc-bullet-item">
                              <span className="lc-check-dot">✓</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="lc-card-footer">
                      {b.cta ? (
                        <LifecycleButton
                          href={b.cta.href}
                          label={b.cta.label}
                          variant={isEven ? "primary" : "outline"}
                        />
                      ) : (
                        <LifecycleButton
                          href="/contact"
                          label="Discuss Requirements"
                          variant="outline"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== 3. OTHER LIST / DESC PAIR BLOCKS ===== */}
      {listBlocks.length > 0 && (
        <section className="lc-section lc-bg-white">
          <div className="lc-container">
            {listBlocks.map((blk, lIdx) => (
              <div key={lIdx} className="lc-deliverables-wrap lc-reveal lc-reveal-up">
                <div className="lc-badge lc-badge-dark">
                  <span className="lc-badge-dot"></span>
                  <span>[{blk.subtitle ?? "Service Deliverables"}]</span>
                </div>
                <h2 className="lc-section-title">{renderGradientHeading(blk.title)}</h2>
                {blk.desc && <p className="lc-section-sub">{blk.desc}</p>}

                {blk.type === "list" && (
                  <div className="lc-deliverable-grid">
                    {blk.items.map((it, itemIdx) => (
                      <div key={itemIdx} className="lc-deliverable-card">
                        <span className="lc-del-num">0{itemIdx + 1}</span>
                        <h4 className="lc-del-text">{it}</h4>
                      </div>
                    ))}
                  </div>
                )}

                {blk.type === "descPairs" && (
                  <div className="lc-desc-grid">
                    {blk.items.map((pair, pIdx) => (
                      <div key={pIdx} className="lc-desc-card">
                        <BoxedIcon index={pIdx} />
                        <h4 className="lc-desc-title">{pair.title}</h4>
                        <p className="lc-desc-p">{pair.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== 4. ENGINEERING PROCESS / METHODOLOGY (LIFECYCLE HORIZONTAL FLOW) ===== */}
      {processBlock && processBlock.type === "process" && (
        <section className="lc-section lc-bg-dark">
          <div className="lc-container">
            <div className="lc-section-head lc-reveal lc-reveal-up">
              <div className="lc-badge lc-badge-lime">
                <span className="lc-badge-dot lc-dot-lime"></span>
                <span>[Our Methodology]</span>
              </div>
              <h2 className="lc-section-title lc-text-white">{renderGradientHeading(processBlock.title)}</h2>
              <p className="lc-section-sub lc-text-dim">
                A rigorous, transparent, and iterative approach from technical architecture to production deployment.
              </p>
            </div>

            <div className="lc-process-flow">
              {processBlock.steps.map((step, sIdx) => (
                <div key={sIdx} className="lc-step-card lc-reveal lc-reveal-up">
                  <div className="lc-step-header">
                    <span className="lc-step-badge">{step.num}</span>
                    <span className="lc-step-connector"></span>
                  </div>
                  <h4 className="lc-step-title">{step.title}</h4>
                  <p className="lc-step-desc">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 5. WHY CHOOSE QUICKUPP SOFTECH ===== */}
      {whyChooseBlock && whyChooseBlock.type === "whyChoose" && (
        <section className="lc-section lc-bg-light">
          <div className="lc-container">
            <div className="lc-why-grid">
              <div className="lc-why-left lc-reveal lc-reveal-left">
                <div className="lc-badge lc-badge-dark">
                  <span className="lc-badge-dot"></span>
                  <span>[Why Partner With Us]</span>
                </div>
                <h2 className="lc-section-title">{renderGradientHeading(whyChooseBlock.title ?? "Built for Speed, Quality & Reliability")}</h2>
                <p className="lc-why-tagline">{whyChooseBlock.tagline}</p>
                {whyChooseBlock.desc && <p className="lc-section-sub">{whyChooseBlock.desc}</p>}

                <div className="lc-why-cta-wrap">
                  <LifecycleButton
                    href="/contact"
                    label="Start Your Engagement"
                    variant="primary"
                  />
                </div>
              </div>

              <div className="lc-why-right lc-reveal lc-reveal-right">
                <div className="lc-features-grid">
                  {whyChooseBlock.bullets.map((bullet, idx) => (
                    <div key={idx} className="lc-feature-card">
                      <BoxedIcon index={idx} />
                      <div className="lc-feature-info">
                        <h4 className="lc-feature-title">{bullet}</h4>
                        <p className="lc-feature-desc">
                          Dedicated engineering rigor, high-standards code reviews, and proactive technical management.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== 6. INDUSTRIES MATRIX ===== */}
      {industriesBlock && industriesBlock.type === "industries" && (
        <section className="lc-section lc-bg-white">
          <div className="lc-container">
            <div className="lc-section-head lc-reveal lc-reveal-up">
              <div className="lc-badge lc-badge-dark">
                <span className="lc-badge-dot"></span>
                <span>[Industry Domain Expertise]</span>
              </div>
              <h2 className="lc-section-title">Built Across <span className="qs-gradient-text">Modern Industries</span></h2>
              <p className="lc-section-sub">
                Our technology systems power operations across high-compliance and fast-growth verticals.
              </p>
            </div>

            <div className="lc-industries-grid lc-reveal lc-reveal-up">
              {industriesBlock.industries.map((ind, iIdx) => (
                <Link
                  key={iIdx}
                  href={`/industries/${ind.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="lc-industry-pill"
                >
                  <span className="lc-ind-name">{ind}</span>
                  <DiagonalArrow className="lc-ind-arrow" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 7. TWO-COLUMN FAQ ACCORDION (LIFECYCLE SIGNATURE STYLE) ===== */}
      {faqBlock && faqBlock.type === "faq" && faqBlock.items.length > 0 && (
        <section className="lc-section lc-bg-light">
          <div className="lc-container">
            <div className="lc-faq-layout">
              <div className="lc-faq-sidebar lc-reveal lc-reveal-left">
                <div className="lc-badge lc-badge-dark">
                  <span className="lc-badge-dot"></span>
                  <span>[Help &amp; Support]</span>
                </div>
                <h2 className="lc-faq-heading">Frequently Asked <span className="qs-gradient-text">Questions</span></h2>
                <p className="lc-faq-intro">
                  Have questions about our technology stack, development timelines, or engagement models? We are here to help.
                </p>
                <div className="lc-faq-contact-card">
                  <div className="lc-faq-contact-title">Need a tailored solution?</div>
                  <p className="lc-faq-contact-p">Speak directly with a senior solutions architect today.</p>
                  <LifecycleButton
                    href="/contact"
                    label="Get in Touch"
                    variant="dark"
                  />
                </div>
              </div>

              <div className="lc-faq-accordion lc-reveal lc-reveal-right">
                {faqBlock.items.map((item, qIdx) => {
                  const isOpen = openFaq === qIdx;
                  return (
                    <div
                      key={qIdx}
                      className={`lc-accordion-item ${isOpen ? "lc-acc-open" : ""}`}
                    >
                      <button
                        type="button"
                        className="lc-accordion-header"
                        onClick={() => setOpenFaq(isOpen ? null : qIdx)}
                        aria-expanded={isOpen}
                      >
                        <span className="lc-accordion-q">{item.q}</span>
                        <span className="lc-accordion-toggle">
                          <span className="lc-toggle-line lc-toggle-h"></span>
                          <span className={`lc-toggle-line lc-toggle-v ${isOpen ? "lc-v-hidden" : ""}`}></span>
                        </span>
                      </button>
                      <div
                        className="lc-accordion-content"
                        style={{
                          maxHeight: isOpen ? "400px" : "0px",
                          opacity: isOpen ? 1 : 0,
                          visibility: isOpen ? "visible" : "hidden",
                        }}
                      >
                        <p className="lc-accordion-a">{item.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== 8. HIGH-IMPACT CLOSING CTA SECTION ===== */}
      <section className="lc-section lc-cta-section">
        <div className="lc-container">
          <div className="lc-cta-box lc-reveal lc-reveal-up">
            <div className="lc-badge lc-badge-lime">
              <span className="lc-badge-dot lc-dot-lime"></span>
              <span>[Ready To Build?]</span>
            </div>
            <h2 className="lc-cta-title">{renderGradientHeading(data.closingTitle || "Build Better Software. Scale With Technology.")}</h2>
            <p className="lc-cta-desc">
              {data.closingDesc || "Get in touch with Quickupp Softech today to discuss your project, architecture, and technology roadmap."}
            </p>

            <div className="lc-cta-buttons">
              {data.closingCtas && data.closingCtas.length > 0 ? (
                data.closingCtas.map((c, cIdx) => (
                  <LifecycleButton
                    key={cIdx}
                    href={c.href}
                    label={c.label}
                    variant={cIdx === 0 ? "primary" : "secondary"}
                  />
                ))
              ) : (
                <LifecycleButton
                  href="/contact"
                  label="Schedule a Consultation"
                  variant="primary"
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

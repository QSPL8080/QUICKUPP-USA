"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { ServicePageData, ServiceBlock, ListBlock } from "@/lib/servicePageTypes";

// Diagonal Arrow Icon (Adventria Vector 11)
function MainArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rt-main-arrow ${className}`}
      aria-hidden="true"
    >
      <path
        d="M2.5 9.5L9.5 2.5M9.5 2.5H3.5M9.5 2.5V8.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Play Icon for Video Previews
function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

// Feature Icon Generator for Collection Cards
function CardIcon({ index }: { index: number }) {
  const icons = [
    // 0: Brain / AI
    <svg key="0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>,
    // 1: Video / Camera
    <svg key="1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
    // 2: Workflow
    <svg key="2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></svg>,
    // 3: User Clone
    <svg key="3" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>,
    // 4: Automation
    <svg key="4" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    // 5: Display
    <svg key="5" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>,
  ];
  return <div className="rt-card-image-box">{icons[index % icons.length]}</div>;
}

// Dual-Sliding Adventria Button
function AdventriaButton({
  href,
  label,
  variant = "white",
  className = "",
}: {
  href: string;
  label: string;
  variant?: "white" | "red" | "border";
  className?: string;
}) {
  return (
    <Link href={href} className={`rt-button-body rt-button-${variant} ${className}`}>
      <span className="rt-button-text">{label}</span>
      <span className="rt-btn-arrow">
        <MainArrow />
      </span>
    </Link>
  );
}

export default function AdventriaServicePage({ data }: { data: ServicePageData }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeListItem, setActiveListItem] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("rt-in-view");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = containerRef.current?.querySelectorAll(".rt-reveal");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Primary list block for interactive switcher
  const listBlock = data.blocks.find(
    (b): b is ListBlock => b.type === "list" && !b.title.toLowerCase().includes("sample")
  );

  return (
    <div className="adv-page-container" ref={containerRef}>
      <Header />

      {/* ==========================================================================
          1. INNER HERO SECTION (.rt-inner-hero)
          ========================================================================== */}
      <section className="rt-inner-hero">
        <div className="rt-inner-hero-border">
          <div className="rt-inner-hero-border-line" />
          <div className="rt-inner-hero-border-line" />
          <div className="rt-inner-hero-border-line" />
          <div className="rt-inner-hero-border-line" />
        </div>

        <div className="rt-inner-hero-image">
          <img
            src="https://cdn.prod.website-files.com/689c310ea1d0a3bf71297573/68f1e968f2112162d202c462_adventria-service-three-hero.webp"
            alt="Hero backdrop"
          />
        </div>

        <div className="rt-inner-hero-overlay" />

        <div className="rt-inner-hero-content rt-reveal">
          <div className="rt-inner-hero-sub-wrapper">
            <div className="rt-sub-text rt-text-color-white">
              {data.heroEyebrow || data.crumb || "Our Service"}
            </div>
          </div>

          <h1 className="rt-text-style-h1 rt-text-color-white rt-gap-off">
            {data.heroTitle}
          </h1>

          {data.heroParagraphs && data.heroParagraphs.length > 0 && (
            <div className="rt-hero-paras">
              {data.heroParagraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          )}

          <div className="rt-hero-ctas">
            <AdventriaButton
              href={data.heroCta?.href || "/contact"}
              label={data.heroCta?.label || "Get in Touch"}
              variant="white"
            />
            <AdventriaButton
              href="/contact"
              label="Explore Solutions"
              variant="border"
            />
          </div>
        </div>
      </section>

      {/* ==========================================================================
          2. MISSION & INTERACTIVE NUMBERED SWITCHER (.rt-service-mission)
          ========================================================================== */}
      {listBlock && listBlock.items && (
        <section className="rt-service-mission">
          <div className="rt-container-main">
            {/* Top Mission Statement */}
            <div className="rt-text-card-gap-big rt-reveal">
              <div className="rt-text-style-h2">
                We believe in delivering measurable AI solutions that drive real results. From digital production to intelligent workflow automation, we scale your business with precision.
              </div>

              <div className="rt-service-mission-top">
                <div className="rt-sub-text-gap rt-border">
                  <div className="rt-sub-text">Our Mission</div>
                </div>
                <div className="rt-service-mission-para">
                  <p>
                    We partner with forward-thinking enterprises to overcome creative bottlenecks, automate operations, and unlock high-impact growth through cutting-edge artificial intelligence.
                  </p>
                </div>
              </div>
            </div>

            {/* Content: Left Feature Spotlight & Right Interactive Numbered Rows */}
            <div className="rt-service-mission-content">
              {/* Left Column Spotlight Card */}
              <div className="rt-service-mission-left rt-reveal">
                <div className="rt-mission-feature-preview">
                  <div className="rt-mission-preview-badge">
                    Capability {String(activeListItem + 1).padStart(2, "0")}
                  </div>
                  <h3 className="rt-mission-preview-title">
                    {listBlock.items[activeListItem]}
                  </h3>
                  <p className="rt-mission-preview-desc">
                    Engineered with advanced AI algorithms to deliver studio-quality results, flawless consistency, and effortless scalability for modern digital distribution.
                  </p>

                  <div className="rt-mission-preview-bullets">
                    <div className="rt-mission-preview-bullet">
                      <span className="rt-check-bullet-icon">✓</span>
                      <span>High-engagement visual fidelity</span>
                    </div>
                    <div className="rt-mission-preview-bullet">
                      <span className="rt-check-bullet-icon">✓</span>
                      <span>Tailored script &amp; brand voice customization</span>
                    </div>
                    <div className="rt-mission-preview-bullet">
                      <span className="rt-check-bullet-icon">✓</span>
                      <span>Rapid turnarounds &amp; multi-format delivery</span>
                    </div>
                  </div>

                  <AdventriaButton
                    href="/contact"
                    label={`Start ${listBlock.items[activeListItem]}`}
                    variant="red"
                  />
                </div>
              </div>

              {/* Right Column Numbered Interactive Rows */}
              <div className="rt-service-mission-right rt-reveal">
                {listBlock.items.map((item, idx) => {
                  const isActive = activeListItem === idx;
                  return (
                    <div
                      key={idx}
                      className="rt-service-mission-item-wrapper"
                      onClick={() => setActiveListItem(idx)}
                    >
                      <div className={`rt-service-mission-item ${isActive ? "on" : "rt-off"}`}>
                        <div className={isActive ? "rt-mission-on" : "rt-mission-of"}>
                          <MainArrow />
                        </div>
                        <div className="rt-service-mission-item-inner">
                          <div className={`rt-text-style-h6 ${isActive ? "rt-mission-active" : "rt-mission-in-active"}`}>
                            {item}
                          </div>
                          <div className={`rt-text-style-h6 ${isActive ? "rt-mission-active" : "rt-mission-in-active"}`}>
                            {String(idx + 1).padStart(2, "0")}
                          </div>
                        </div>
                      </div>
                      <div className="rt-service-mission-border">
                        <div
                          className={`rt-service-mission-border-inner ${
                            isActive ? "rt-active" : "rt-inactive"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==========================================================================
          3. DYNAMIC CONTENT BLOCKS (descPairs, ai, samples, etc.)
          ========================================================================== */}
      {data.blocks.map((block, index) => {
        // Block: descPairs (Cards Showcase Grid)
        if (block.type === "descPairs") {
          return (
            <section key={index} className="rt-service-v3">
              <div className="rt-container-main">
                <div className="about-three-service-wrapper rt-reveal">
                  <div className="rt-sub-text-gap">
                    <div className="rt-sub-text">Our Services</div>
                  </div>
                  <h2 className="rt-text-style-h2 rt-gap-off">
                    {block.title || "Providing brilliant service for your business"}
                  </h2>
                  {block.tagline && (
                    <p style={{ color: "var(--rt-color-body)", marginTop: "8px" }}>
                      {block.tagline}
                    </p>
                  )}
                </div>

                <div className="rt-cards-showcase-grid">
                  {block.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="rt-collection-item rt-reveal">
                      <div className="rt-card-details">
                        <CardIcon index={itemIdx} />
                        <h3 className="rt-text-style-h6">{item.title}</h3>
                        <p style={{ margin: 0, fontSize: "14.5px", lineHeight: "1.6" }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {block.cta && (
                  <div style={{ textAlign: "center", marginTop: "44px" }} className="rt-reveal">
                    <AdventriaButton
                      href={block.cta.href}
                      label={block.cta.label}
                      variant="red"
                    />
                  </div>
                )}
              </div>
            </section>
          );
        }

        // Block: AI Target Audiences & Capabilities
        if (block.type === "ai") {
          return (
            <section key={index} className="rt-service-v3">
              <div className="rt-container-main">
                <div className="about-three-service-wrapper rt-reveal">
                  <div className="rt-sub-text-gap">
                    <div className="rt-sub-text">Applications</div>
                  </div>
                  <h2 className="rt-text-style-h2 rt-gap-off">
                    {block.title}
                  </h2>
                  {block.intro && (
                    <p style={{ color: "var(--rt-color-body)", marginTop: "8px" }}>
                      {block.intro}
                    </p>
                  )}
                </div>

                <div className="rt-cards-showcase-grid">
                  {(block.bullets || []).map((bullet, bulletIdx) => (
                    <div key={bulletIdx} className="rt-collection-item rt-reveal">
                      <div className="rt-card-details">
                        <CardIcon index={bulletIdx + 2} />
                        <h3 className="rt-text-style-h6">{bullet}</h3>
                        {block.desc && (
                          <p style={{ margin: 0, fontSize: "14.5px", lineHeight: "1.6" }}>
                            {block.desc}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // Block: Samples Grid (Video Samples)
        if (block.type === "list" && block.title.toLowerCase().includes("sample")) {
          return (
            <section key={index} className="rt-service-v3">
              <div className="rt-container-main">
                <div className="about-three-service-wrapper rt-reveal">
                  <div className="rt-sub-text-gap">
                    <div className="rt-sub-text">Portfolio Showcase</div>
                  </div>
                  <h2 className="rt-text-style-h2 rt-gap-off">
                    {block.title}
                  </h2>
                  {block.tagline && (
                    <p style={{ color: "var(--rt-color-body)", marginTop: "8px" }}>
                      {block.tagline}
                    </p>
                  )}
                </div>

                <div className="rt-cards-showcase-grid">
                  {block.items.map((sampleName, sIdx) => (
                    <div key={sIdx} className="rt-collection-item rt-reveal">
                      <div className="rt-card-media-wrap">
                        <div className="rt-card-play-icon">
                          <PlayIcon />
                        </div>
                      </div>
                      <div className="rt-card-details">
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--rt-color-red)" }}>
                          Sample #{String(sIdx + 1).padStart(2, "0")}
                        </div>
                        <h3 className="rt-text-style-h6">{sampleName}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // Block: Process Pipeline
        if (block.type === "process") {
          return (
            <section key={index} className="rt-process-section">
              <div className="rt-container-main">
                <div className="about-three-service-wrapper rt-reveal">
                  <div className="rt-sub-text-gap">
                    <div className="rt-sub-text">Methodology</div>
                  </div>
                  <h2 className="rt-text-style-h2 rt-gap-off">{block.title}</h2>
                  {block.tagline && (
                    <p style={{ color: "var(--rt-color-body)", marginTop: "8px" }}>
                      {block.tagline}
                    </p>
                  )}
                </div>

                <div className="rt-process-grid">
                  {block.steps.map((step, stepIdx) => (
                    <div key={stepIdx} className="rt-process-card rt-reveal">
                      <div className="rt-process-num">{step.num}</div>
                      <h3 className="rt-text-style-h6">{step.title}</h3>
                      <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6", color: "var(--rt-color-body)" }}>
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // Block: Why Choose Us (.rt-our-experience)
        if (block.type === "whyChoose") {
          return (
            <section key={index} className="rt-our-experience">
              <div className="rt-container-main">
                <div className="rt-our-experiencee-wrap">
                  {/* Left Experience Stat Counter */}
                  <div className="rt-our-experience-left rt-reveal">
                    <div className="rt-chose-experience">
                      <div className="rt-experience-stat-row">
                        <div>
                          <div className="rt-counter-big-num">
                            10<span>+</span>
                          </div>
                          <div className="rt-counter-stat-label">
                            Years of Technology &amp; AI Innovation
                          </div>
                        </div>
                      </div>

                      <div className="rt-experience-stat-row">
                        <div>
                          <div className="rt-counter-big-num">
                            500<span>+</span>
                          </div>
                          <div className="rt-counter-stat-label">
                            High-Performance Production Deliverables
                          </div>
                        </div>
                      </div>

                      <div className="rt-experience-stat-row">
                        <div>
                          <div className="rt-counter-big-num">
                            99.8<span>%</span>
                          </div>
                          <div className="rt-counter-stat-label">
                            Client Satisfaction &amp; Reliability SLA
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Advantage List */}
                  <div className="home-one-chose-text rt-reveal">
                    <div>
                      <div className="rt-sub-text-gap">
                        <div className="rt-sub-text">{block.tagline || "Why Choose Us"}</div>
                      </div>
                      <h2 className="rt-text-style-h2 rt-gap-off">
                        {block.title || "Trusted by businesses worldwide for results"}
                      </h2>
                    </div>

                    <div className="rt-our-experience-text-card-wrap">
                      {(block.bullets || []).map((bullet, bIdx) => (
                        <div key={bIdx} className="rt-our-experience-text-card">
                          <div className="rt-our-experience-text-card-heading">
                            <div className="rt-card-check-badge">✓</div>
                            <div className="rt-text-style-h6">{bullet}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // Block: FAQ Section
        if (block.type === "faq") {
          return (
            <section key={index} className="rt-faq-section">
              <div className="rt-container-main">
                <div className="about-three-service-wrapper rt-reveal">
                  <div className="rt-sub-text-gap">
                    <div className="rt-sub-text">FAQ</div>
                  </div>
                  <h2 className="rt-text-style-h2 rt-gap-off">{block.title}</h2>
                </div>

                <div className="rt-faq-wrap">
                  {block.items.map((item, faqIdx) => {
                    const isOpen = openFaq === faqIdx;
                    return (
                      <div
                        key={faqIdx}
                        className={`rt-faq-item ${isOpen ? "rt-open" : ""} rt-reveal`}
                      >
                        <button
                          type="button"
                          className="rt-faq-trigger"
                          onClick={() => setOpenFaq(isOpen ? null : faqIdx)}
                        >
                          <span className="rt-text-style-h6">{item.q}</span>
                          <span className="rt-faq-icon-btn">+</span>
                        </button>
                        {isOpen && (
                          <div className="rt-faq-answer-body">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        }

        return null;
      })}

      {/* ==========================================================================
          4. OUR STORY / HIGH-AVAILABILITY DARK STATS SECTION (.rt-our-story)
          ========================================================================== */}
      <section className="rt-our-story">
        <div className="rt-container-main">
          <div className="rt-our-story-top rt-reveal">
            <div className="rt-our-story-top-left">
              <div className="rt-sub-text-gap">
                <div className="rt-sub-text rt-text-color-white">Our Story</div>
              </div>
              <h2 className="rt-text-style-h2 rt-text-color-white rt-gap-off">
                Ensure high availability of your services
              </h2>
              <p className="rt-body-color-two rt-gap-off" style={{ lineHeight: "1.7" }}>
                Ensure high availability of your services with our proactive AI support and pipeline monitoring. We help prevent downtime, optimize performance, and maintain reliability for seamless operations.
              </p>
            </div>

            <div className="rt-our-story-top-right">
              <div className="rt-our-story-top-item">
                <div className="rt-stat-pill-num">
                  29<span>+</span>
                </div>
                <div className="rt-our-story-top-line" />
                <div>
                  <div className="rt-text-style-h6 rt-text-color-white">
                    Track and analyze performance
                  </div>
                  <p className="rt-body-color-two rt-gap-off" style={{ fontSize: "14px", marginTop: "4px" }}>
                    Gain clear insights with accurate data tracking and analytics to guide better business decisions.
                  </p>
                </div>
              </div>

              <div className="rt-our-story-top-item">
                <div className="rt-stat-pill-num">
                  85<span>+</span>
                </div>
                <div className="rt-our-story-top-line" />
                <div>
                  <div className="rt-text-style-h6 rt-text-color-white">
                    Projects completed
                  </div>
                  <p className="rt-body-color-two rt-gap-off" style={{ fontSize: "14px", marginTop: "4px" }}>
                    Successfully delivering innovative AI solutions that meet goals and exceed expectations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          5. LET'S MAKE SOMETHING GREAT WORK TOGETHER (.rt-work-together-main)
          ========================================================================== */}
      <div className="rt-container-main">
        <div className="rt-work-together-main rt-reveal">
          <div className="rt-work-together-text">
            <div className="rt-sub-text-gap">
              <div className="rt-sub-text rt-text-color-white">
                Let&apos;s make something great work together
              </div>
            </div>
            <h2 className="rt-text-style-h2 rt-text-color-white rt-gap-off">
              {data.closingTitle || "Start your journey toward sustainable growth today"}
            </h2>
            <p className="rt-body-color-two rt-gap-off" style={{ lineHeight: "1.6" }}>
              {data.closingDesc || "Quickupp Softech — Marketing. AI. Technology. Built for Growth."}
            </p>
          </div>

          <div>
            <AdventriaButton
              href={data.closingCtas?.[0]?.href || "/contact"}
              label={data.closingCtas?.[0]?.label || "Get in touch"}
              variant="white"
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

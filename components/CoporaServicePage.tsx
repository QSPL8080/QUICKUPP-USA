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

// Copora Signature Dual-Text Roll-up Button
function CoporaButton({
  href,
  label,
  variant = "black",
  className = "",
}: {
  href: string;
  label: string;
  variant?: "black" | "white";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`button-link-hover ${variant === "white" ? "white" : ""} ${className}`}
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
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract FAQ block and Capability blocks
  const faqBlock = data.blocks.find(
    (b): b is Extract<ServiceBlock, { type: "faq" }> => b.type === "faq"
  );
  const faqItems: { q: string; a: string }[] = faqBlock
    ? (faqBlock.items || (faqBlock as any).faqs || [])
    : [];

  const capabilityBlocks = data.blocks.filter(
    (b) => b.type !== "faq" && b.type !== "whyChoose"
  );

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

  const heroImage =
    "https://cdn.prod.website-files.com/682eb96f62a81d664ea524a9/68414b23e4a1780f6e00358a_2163272981e07765b1f7275f01ced92a_about-hero-image.jpg";

  const storyImages = [
    "https://cdn.prod.website-files.com/682eb96f62a81d664ea524a9/684188924e3a84c43778e3c1_b53aa0a78d72079528a5e21eb4835b28_Professional%20Collaboration%20in%20a%20Modern%20Office.jpg",
    "https://cdn.prod.website-files.com/682eb96f62a81d664ea524a9/684bda0d7c35d7c4062a70dc_background-video-poster-00001.jpg",
  ];

  const capabilityStockImages = [
    "https://cdn.prod.website-files.com/682eb96f62a81d664ea524a9/68427e7dc02fae8530fc38b1_a50a739aea751346e4ab819ac09aaf79_team-member-01.jpg",
    "https://cdn.prod.website-files.com/682eb96f62a81d664ea524a9/68427fba967104cf61ef5dbb_1b1c43bf59f83f149fbe791babf3ed39_team-member-02.webp",
    "https://cdn.prod.website-files.com/682eb96f62a81d664ea524a9/68427ee584a1134b0e51b52c_bfef99deeced931eed3f0d901713fe99_team-member-03.jpg",
    "https://cdn.prod.website-files.com/682eb96f62a81d664ea524a9/68427ee5934fa2c5608a1002_267ae3d2952c2c81065fb8f450bf3db0_team-member-04.jpg",
    "https://cdn.prod.website-files.com/682eb96f62a81d664ea524a9/68427fba2a3b755e610b3637_0f8e743069b14e3767dbfc98d877b9bf_team-member-05.webp",
  ];

  const milestones = [
    {
      type: "top",
      year: "2018",
      title: "Founded with Purpose",
      desc: "Architecting high-performance web systems",
    },
    {
      type: "bottom",
      year: "2020",
      title: "Scaled Nationally",
      desc: "Full-stack mobile & enterprise engineering",
    },
    {
      type: "top",
      year: "2022",
      title: "200+ Products Delivered",
      desc: "Robust cloud-native microservices",
    },
    {
      type: "bottom",
      year: "2023",
      title: "Global Tech Partnerships",
      desc: "Next.js, React, AWS & AI integrations",
    },
    {
      type: "top",
      year: "2024",
      title: "Global Expansion",
      desc: "Serving US and international high-growth brands",
    },
    {
      type: "bottom",
      year: "2026",
      title: "Innovation at Scale",
      desc: "Next-gen resilient platforms & zero-downtime SLA",
    },
  ];

  return (
    <div className="copora-page" ref={containerRef}>
      <Header />

      {/* =========================================================================
          1. HERO SECTION (Identical to Copora About Page Hero)
          ========================================================================= */}
      <section className="hero-section">
        <div className="container-medium w-container">
          <div className="section-title about-title-center copora-reveal">
            {data.heroEyebrow && (
              <div className="pre-section-title">{data.heroEyebrow}</div>
            )}
            <h1>{data.heroTitle}</h1>
            {data.heroParagraphs && data.heroParagraphs.length > 0 && (
              <p className="about-hero-description">{data.heroParagraphs[0]}</p>
            )}
          </div>

          <div className="about-image-wrap copora-reveal">
            {/* Featured Hero Large Media */}
            <div className="about-inner-image">
              <img
                src={heroImage}
                alt={data.heroTitle}
                className="hero-inner-image"
              />
            </div>

            {/* 3-Item Overlapping Bottom Strip */}
            <div className="grid-about-hero-image">
              {/* Card 1: Visual Overlay + Stat */}
              <div
                className="about-hero-image-item one"
                style={{
                  backgroundImage:
                    "url('https://cdn.prod.website-files.com/682eb96f62a81d664ea524a9/68315bab565ab296177dcfde_0b9db51c5595e0b0dd51bb5ad1701578_hero-image-03.jpg')",
                }}
              >
                <div className="about-inner-text-wrap">
                  <div className="about-inner-text">Enterprise Delivery</div>
                </div>
                <div className="about-inner-title-wrap">
                  <h2 className="about-inner-title">260+</h2>
                  <p className="text-white" style={{ color: "#ffffff", margin: 0, fontSize: "0.9rem" }}>
                    Helping companies grow and perform better.
                  </p>
                </div>
                <div className="about-hero-overlay" />
              </div>

              {/* Card 2: Black Card + Dual-text Button */}
              <div className="about-hero-image-item two">
                <h3 className="about-detail-title">
                  24/7 support to keep your{" "}
                  <span className="about-text-span">business moving forward</span>
                </h3>
                <CoporaButton
                  href={data.heroCta?.href || "/contact"}
                  label={data.heroCta?.label || "Get in touch"}
                  variant="white"
                />
              </div>

              {/* Card 3: Experience Stat Card */}
              <div className="about-hero-image-item third">
                <div className="about-inner-pre-title">
                  <div className="about-pre-title">Years of experience</div>
                </div>
                <div className="about-info">
                  <h3>10+</h3>
                  <p>Years helping businesses thrive through technology</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. OUR STORY SECTION (Copora 2-Column Story with Video Lightbox)
          ========================================================================= */}
      <section className="our-story-section section-spacing">
        <div className="container w-container">
          <div className="section-title copora-reveal">
            <h2>Built on expertise, driven by results - Get to know our process</h2>
          </div>

          <div className="our-story-grid">
            {/* Left Narrative Column */}
            <div className="our-story-detail-item copora-reveal">
              <p className="story-description-one">
                {data.heroParagraphs && data.heroParagraphs.length > 1
                  ? data.heroParagraphs[1]
                  : "We did not start with a big boardroom - just a big idea: to make software development more human, strategic, and impact-driven."}
              </p>
              <p className="story-description-two">
                {data.heroParagraphs && data.heroParagraphs.length > 2
                  ? data.heroParagraphs[2]
                  : "From helping early-stage ventures define their roadmap to guiding enterprises through modern digital transformation, our journey has always been about one thing - unlocking clarity and measurable scalability for every client."}
              </p>
              <div style={{ marginTop: "12px" }}>
                <CoporaButton href="/contact" label="Discuss Your Architecture" />
              </div>
            </div>

            {/* Right Media + Signature Column */}
            <div className="our-story-image-item copora-reveal">
              <div className="grid-our-story-image">
                <div className="our-story-image-wrap">
                  <img
                    src={storyImages[0]}
                    alt="Engineering collaboration"
                    className="our-story-image"
                  />
                </div>
                <div
                  className="lightbox-link"
                  onClick={() => setVideoModalOpen(true)}
                >
                  <img
                    src={storyImages[1]}
                    alt="Video preview"
                    className="lightbox-video-thumb"
                  />
                  <div className="about-hero-overlay" style={{ opacity: 0.4 }} />
                  <div className="our-story-text">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>Play reel</span>
                  </div>
                </div>
              </div>

              {/* Signature Block */}
              <div className="our-story-info-wrap">
                <img
                  src="/images/copora/story-signature.svg"
                  alt="Leadership signature"
                  className="signature"
                />
                <div className="our-story-info">
                  <h3 className="our-story-name">Quickupp Architecture Team</h3>
                  <div className="our-story-position">Engineering & Strategy Practice</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. MILESTONE SECTION (Copora Alternating Timeline)
          ========================================================================= */}
      <section className="milestone-section section-spacing">
        <div className="container w-container">
          <div className="milestone-title-wrap copora-reveal">
            <div className="pre-section-title white">What we offer</div>
            <h2>Our journey of growth & impact</h2>
            <p className="milestone-description">
              From architectural discovery to global deployment and continuous optimization - here is how we deliver measurable impact.
            </p>
          </div>

          <div className="milestone-detail-list copora-reveal">
            <div className="grid-milestone">
              {milestones.map((item: any, idx: number) => {
                if (item.type === "top") {
                  return (
                    <div key={idx} className="milestone-item-one">
                      <div className="milestone-top-item-one">
                        <img
                          src="/images/copora/milestone-image.svg"
                          alt="Pin"
                          className="milestone-image"
                        />
                        <div className="milestone-text">{item.title}</div>
                      </div>
                      <div className="milestone-year-one">
                        <div className="milestone-text">{item.year}</div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={idx} className="milestone-item-two">
                      <div className="milestone-year-two">
                        <div className="milestone-text">{item.year}</div>
                      </div>
                      <div className="milestone-top-item-two">
                        <img
                          src="/images/copora/milestone-image.svg"
                          alt="Pin"
                          className="milestone-image rotate"
                        />
                        <div className="milestone-text">{item.title}</div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. OUR MISSION & VISION SECTION (Copora 2-Column Cards)
          ========================================================================= */}
      <section className="our-mission-section section-spacing">
        <div className="container-medium w-container">
          <div className="grid-our-mission">
            {/* Left Mission Card */}
            <div className="our-mission-item copora-reveal">
              <h2 className="our-mission-title">Our Mission</h2>
              <p style={{ color: "#121512", fontSize: "1.05rem", lineHeight: "1.65", margin: 0 }}>
                To empower businesses through resilient engineering, high-converting digital products, and transparent technology partnerships. We build clean, scalable, and performance-obsessed platforms that directly accelerate revenue and operational efficiency.
              </p>
              <div style={{ paddingTop: "10px" }}>
                <CoporaButton href="/contact" label="Partner With Us" />
              </div>
            </div>

            {/* Right Vision Card with Textured Background */}
            <div
              className="our-vision-item copora-reveal"
              style={{
                backgroundImage:
                  "url('https://cdn.prod.website-files.com/682eb96f62a81d664ea524a9/6842795ec9dea88362ffd4ef_e07247beda0932230ac19dd7ba7141e3_our-vision-bg-image.jpg')",
              }}
            >
              <div className="our-vision-inner-item">
                <h2 className="our-mission-title">Our Vision</h2>
                <p>
                  We aim to lead the way in reshaping how modern businesses build, scale, and maintain mission-critical software in a rapidly evolving technological landscape.
                </p>
                <ul className="our-vision-list">
                  <li className="our-vision-list-item">Global Scalability & Cloud Elasticity</li>
                  <li className="our-vision-list-item">Clean Architecture & Maintainable Codebases</li>
                  <li className="our-vision-list-item">Measurable Business Impact & High ROI</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. SPECIALIZED CAPABILITIES / PROBLEM SOLVERS GRID (Copora Team Cards Style)
          ========================================================================= */}
      <section className="our-team-section">
        <div className="container w-container">
          <div className="section-title section-center-title copora-reveal">
            <div className="pre-section-title">Specialized Services</div>
            <h2>Our team of problem solvers & capabilities</h2>
            <p style={{ color: "#5a5a5a", fontSize: "1.05rem", margin: 0 }}>
              Tailored technology modules designed to engineer fast, resilient, and enterprise-ready digital platforms.
            </p>
          </div>

          <div className="grid-team copora-reveal">
            {capabilityBlocks.map((block, idx) => {
              const bTitle = (block as any).title || "Specialized Capability";
              const bIntro = (block as any).intro || (block as any).desc || "High-performance software solutions tailored for scalable business impact.";
              const imageSrc = capabilityStockImages[idx % capabilityStockImages.length];

              return (
                <div key={idx} className="team-item">
                  <img
                    src={imageSrc}
                    alt={bTitle}
                    className="team-avatar-image"
                  />
                  <div className="team-info">
                    <h3 className="team-member-name">{bTitle}</h3>
                    <div className="gray-text">
                      {bIntro.length > 55 ? `${bIntro.substring(0, 52)}...` : bIntro}
                    </div>
                    <div className="team-social-media-item-wrap">
                      <div className="team-social-media-item">
                        <Link href="/contact" className="team-badge-tag">
                          Get a Quote &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. INTERACTIVE FAQ ACCORDION (If Available)
          ========================================================================= */}
      {faqItems.length > 0 && (
        <section className="copora-faq-section">
          <div className="container w-container">
            <div className="section-title section-center-title copora-reveal">
              <div className="pre-section-title">Clarifications & Answers</div>
              <h2>Frequently Asked Questions</h2>
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
                      <span className={`copora-faq-icon ${isOpen ? "open" : ""}`}>
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
          7. SIGNATURE CTA BANNER (Copora About CTA)
          ========================================================================= */}
      <section className="cta-section section-spacing">
        <div className="container-medium w-container">
          <div className="cta-item copora-reveal">
            <div className="cta-title-wrap">
              <h3 className="about-cta-title">
                {data.closingTitle || "Let’s build something that moves your business forward"}
              </h3>
              <p className="cta-description">
                {data.closingDesc ||
                  "From initial code audit to full-stack delivery and ongoing cloud optimization, our team is ready to scale your digital presence."}
              </p>
            </div>
            <div>
              <CoporaButton
                href="/contact"
                label={
                  data.closingCtas && data.closingCtas.length > 0
                    ? data.closingCtas[0].label
                    : "Get started now"
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* Video Lightbox Modal */}
      {videoModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setVideoModalOpen(false)}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "860px",
              aspectRatio: "16/9",
              background: "#000",
              borderRadius: "12px",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoModalOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "rgba(255, 255, 255, 0.2)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                cursor: "pointer",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              &#10005;
            </button>
            <iframe
              src="https://www.youtube.com/embed/r507nu6MqFk?autoplay=1"
              title="Architecture & Engineering Showcase"
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

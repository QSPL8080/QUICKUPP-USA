"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { ServicePageData, ServiceBlock, ListBlock, CardsBlock, StepsBlock, FaqBlock } from "@/lib/servicePageTypes";

const serviceImages = [
  "https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68a8c652faddc427986bc208_Services%20Image1.jpg",
  "https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68a8c652c1e25073a0538410_Services%20Image2.jpg",
  "https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68a8c6521cb67e81661aaad8_Services%20Image3.jpg",
  "https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68a8c652566a0be2eda8c9c1_Services%20Image4.jpg",
];

const testimonials = [
  {
    name: "Jakob Alison",
    role: "Project Manager at triko",
    desc: "Was initially hesitant about the project, but the team quickly put my mind at ease. Their expertise and creative solutions were impressive. The final product exceeded my expectations.",
    avatar: "https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68a8b2ce85663a578d1bef2a_Testimonial%20Card%20Author%20Image1.png",
  },
  {
    name: "Alisa Olivia",
    role: "CTO at Ritovex",
    desc: "I came to them with a vague idea, and they helped me refine it into a concrete plan. Throughout the process, they kept me informed and involved, ensuring I was happy with the direction.",
    avatar: "https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68a8b2ce08dcf75e3ac0a337_Testimonial%20Card%20Author%20Image2.png",
  },
  {
    name: "Jordan Walk",
    role: "Software Engineer at Briks",
    desc: "Working with them was a true pleasure. They were responsive, communicative, and always willing to go the extra mile. I especially appreciated their attention to detail.",
    avatar: "https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68a8b2ced4b407065ff16588_Testimonial%20Card%20Author%20Image3.png",
  },
  {
    name: "Ema Watson",
    role: "Founder at Ritof",
    desc: "Throughout the process, they kept me informed and involved, ensuring I was happy with the direction. I came to them with a vague idea, and they helped me refine it into a concrete plan.",
    avatar: "https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68a8b2cea461dc549f0c811d_Testimonial%20Card%20Author%20Image4.png",
  },
];

export default function RitovexServicePage({ data }: { data: ServicePageData }) {
  const [openServiceIdx, setOpenServiceIdx] = useState<number | null>(0);
  const [hoveredServiceIdx, setHoveredServiceIdx] = useState<number | null>(null);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Extract blocks
  const primaryListBlock = data.blocks.find(
    (b): b is ListBlock => b.type === "list" && !b.title.toLowerCase().includes("sample")
  );

  const secondaryListBlocks = data.blocks.filter(
    (b): b is ListBlock => b.type === "list" && b !== primaryListBlock
  );

  const cardBlocks = data.blocks.filter((b): b is CardsBlock => b.type === "cards");
  const stepBlocks = data.blocks.filter((b): b is StepsBlock => b.type === "steps");
  const rawFaqs = data.blocks.filter((b): b is FaqBlock => b.type === "faq");

  // Format FAQs
  const allFaqs =
    rawFaqs.length > 0 && ((rawFaqs[0].items && rawFaqs[0].items.length > 0) || (rawFaqs[0].faqs && rawFaqs[0].faqs.length > 0))
      ? (rawFaqs[0].items || rawFaqs[0].faqs || [])
      : [
          {
            q: "What Services Do You Offer?",
            a: "We provide end-to-end strategy, execution, technology automation, and ongoing optimization for all our enterprise service offerings.",
          },
          {
            q: "What Is the Project Timeline?",
            a: "Sprint deliveries typically launch within 3–7 business days, with enterprise integrations deployed in continuous 2-week milestones.",
          },
          {
            q: "Do You Offer Ongoing Support?",
            a: "Yes, absolutely. We provide 24/7 technical and campaign SLA support, dedicated account managers, and continuous performance tuning.",
          },
          {
            q: "How Do You Ensure Quality?",
            a: "Through strict agile methodology, multi-stage automated QA, conversion rate optimization benchmarks, and direct stakeholder approval checkpoints.",
          },
          {
            q: "Can I Request Custom Features?",
            a: "Yes, every engagement is 100% custom-tailored to your tech stack, workflows, branding, and measurable business growth targets.",
          },
        ];

  return (
    <div className="page-wrapper">
      <Header />

      {/* ==========================================================================
          1. HERO INNER BANNER (.section.inner-banner)
          ========================================================================== */}
      <section className="section inner-banner">
        <div className="container">
          <div className="inner-banner-content">
            <div className="section-subtitle-wrap">
              <div className="section-subtitle-single">
                <img
                  src="https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/687810aa5293f9e8c955c26a_Section%20Subtitle%20Icon.svg"
                  alt="Subtitle Icon"
                  className="section-subtitle-icon"
                />
                <div className="section-subtitle">
                  {data.heroEyebrow || data.crumb || "Creative Solutions"}
                </div>
              </div>
            </div>

            <div className="inner-banner-typography">
              <h1 className="inner-banner-title">{data.heroTitle}</h1>
              {data.heroParagraphs && data.heroParagraphs.length > 0 && (
                <div className="inner-banner-description">
                  {data.heroParagraphs.map((p, idx) => (
                    <p key={idx} style={{ margin: "0 0 12px 0" }}>
                      {p}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="services-button-wrapper">
              <Link href={data.heroCta?.href || "/contact"} className="primary-button">
                <div className="primary-button-inner">
                  <div className="primary-button-text-wrap">
                    <div className="primary-button-text-block">{data.heroCta?.label || "Start Projects"}</div>
                    <div className="primary-button-text-block is-text-absolute">{data.heroCta?.label || "Start Projects"}</div>
                  </div>
                </div>
              </Link>
              <Link href="/contact" className="primary-button">
                <div className="primary-button-inner w-variant-e542b707-47be-8374-03f0-de6722c5f865">
                  <div className="primary-button-text-wrap">
                    <div className="primary-button-text-block w-variant-e542b707-47be-8374-03f0-de6722c5f865">
                      Get a Free Consultation
                    </div>
                    <div className="primary-button-text-block w-variant-e542b707-47be-8374-03f0-de6722c5f865 is-text-absolute">
                      Get a Free Consultation
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="services-banner-image-wrapper">
              <img
                src="https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68af4e501d73fa101254bd24_Services%20Banner%20Image.jpg"
                alt="Service Image"
                className="services-banner-image"
              />
              <div className="scroll-image-overlay-wrap">
                <div className="scroll-image-overlay-top"></div>
                <div className="scroll-image-overlay-bottom"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          2. CORE DELIVERABLES / SERVICES (.section.services) - DARK OBSIDIAN (#141414)
          ========================================================================== */}
      {primaryListBlock && primaryListBlock.items && (
        <section className="section services">
          <div className="container">
            <div className="section-title-wrapper">
              <div className="section-subtitle-wrap">
                <div className="section-subtitle-single gray-bg">
                  <img
                    src="https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68a8be303fa5a8c72f1cf197_Section%20Subtitle%20Icon2.svg"
                    alt="Subtitle Icon"
                    className="section-subtitle-icon"
                  />
                  <div className="section-subtitle white">Capabilities</div>
                </div>
              </div>
              <h2 className="section-title white">{primaryListBlock.title}</h2>
              {primaryListBlock.intro && (
                <p className="section-description white-color services">{primaryListBlock.intro}</p>
              )}
            </div>

            <div className="services-contenr">
              {primaryListBlock.items.map((item, idx) => {
                const isOpen = openServiceIdx === idx;
                const isHovered = hoveredServiceIdx === idx;
                const imgUrl = serviceImages[idx % serviceImages.length];
                const numStr = String(idx + 1).padStart(2, "0");

                let title = item;
                let desc = "";
                if (item.includes(" - ")) {
                  const parts = item.split(" - ");
                  title = parts[0];
                  desc = parts.slice(1).join(" - ");
                } else if (item.includes(": ")) {
                  const parts = item.split(": ");
                  title = parts[0];
                  desc = parts.slice(1).join(": ");
                }

                return (
                  <div key={idx} className={`services-single-wrapper ${isOpen ? "active" : ""}`}>
                    <div
                      className="services-single"
                      onMouseEnter={() => setHoveredServiceIdx(idx)}
                      onMouseLeave={() => setHoveredServiceIdx(null)}
                      onClick={() => setOpenServiceIdx(isOpen ? null : idx)}
                    >
                      <div className="services-name-wrapper">
                        <div className="services-name-number-wrapper">
                          <div className="services-number">{numStr}</div>
                          <h2 className="services-name">{title}</h2>
                        </div>
                        <div className="services-arrow-icon-wrapper">
                          <img
                            src="https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68a8c4dc0bf39abe4f4c253d_Services%20Arrow%20Icon.svg"
                            alt="Arrow"
                            className="services-arrow-icon"
                          />
                        </div>
                      </div>

                      {isOpen && desc && (
                        <div className="services-description-wrapper">
                          <div className="services-description-single">
                            <p className="services-description-text">{desc}</p>
                          </div>
                        </div>
                      )}

                      {/* 12-degree Tilted Hover Graphic */}
                      <img
                        src={imgUrl}
                        alt={title}
                        className={`services-image ${isHovered ? "hovered" : ""}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================================================
          3. FEATURE CARDS / TECH GRID (.section.cms-technology) - WHITE BACKGROUND
          ========================================================================== */}
      {cardBlocks.length > 0 && (
        <section className="section cms-technology">
          <div className="container">
            {cardBlocks.map((block, bIdx) => (
              <div key={bIdx} style={{ marginBottom: bIdx < cardBlocks.length - 1 ? "80px" : "0" }}>
                <div className="section-title-wrapper">
                  <div className="section-subtitle-wrap">
                    <div className="section-subtitle-single">
                      <img
                        src="https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/687810aa5293f9e8c955c26a_Section%20Subtitle%20Icon.svg"
                        alt="Subtitle Icon"
                        className="section-subtitle-icon"
                      />
                      <div className="section-subtitle">Features &amp; Tech</div>
                    </div>
                  </div>
                  <h2 className="section-title cms-technology-tools">{block.title}</h2>
                  {block.intro && (
                    <p className="section-description cms-technology-description">{block.intro}</p>
                  )}
                </div>

                <div className="cms-technology-content">
                  <div className="cms-technology-top-card">
                    {block.cards?.slice(0, 4).map((card, cIdx) => (
                      <div key={cIdx} className="cms-technology-top-card-single">
                        <div className="cms-tech-name">{card.title}</div>
                        <p className="cms-tech-desc">{card.text}</p>
                      </div>
                    ))}
                  </div>
                  {block.cards && block.cards.length > 4 && (
                    <div className="cms-technology-bottom-card">
                      {block.cards.slice(4, 7).map((card, cIdx) => (
                        <div key={cIdx} className="cms-technology-top-card-single">
                          <div className="cms-tech-name">{card.title}</div>
                          <p className="cms-tech-desc">{card.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==========================================================================
          4. BENEFITS & PROCESS (.section.benefit-section) - DARK THEME (#141414)
          ========================================================================== */}
      {(secondaryListBlocks.length > 0 || stepBlocks.length > 0) && (
        <section className="section benefit-section">
          <div className="container">
            <div className="benefit-content">
              <div className="benefit-image-wrapper">
                <img
                  src="https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68af526b9b09c1f0d5201fb8_Benefit%20Image.jpg"
                  alt="Benefit Image"
                  className="benefit-image"
                />
              </div>
              <div className="benefit-typography">
                <div className="benefit-section-title-wrapper">
                  <div className="section-subtitle-wrap left-alignment">
                    <div className="section-subtitle-single gray-bg">
                      <img
                        src="https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68a8be303fa5a8c72f1cf197_Section%20Subtitle%20Icon2.svg"
                        alt="Subtitle Icon"
                        className="section-subtitle-icon"
                      />
                      <div className="section-subtitle white">Key Advantages</div>
                    </div>
                  </div>
                  <div className="benefit-section-title-description">
                    <h2 className="section-title white">
                      {secondaryListBlocks[0]?.title || stepBlocks[0]?.title || "Why Choose Our Services"}
                    </h2>
                    <p className="section-description white-color benefit-description">
                      {secondaryListBlocks[0]?.intro ||
                        stepBlocks[0]?.intro ||
                        "Get high-quality results, faster delivery, and tailored solutions that grow with your business."}
                    </p>
                  </div>

                  <div className="benefit-card-wrapper">
                    {(secondaryListBlocks[0]?.items || stepBlocks[0]?.steps?.map((s) => `${s.title}: ${s.text}`) || [
                      "Fast & Reliable Delivery: We prioritize timely completion without compromising quality.",
                      "Tailored to Your Needs: Every solution is customized to fit your unique goals and challenges.",
                      "Continuous Performance: Data-driven benchmarks and continuous conversion optimization.",
                    ]).map((item, idx) => {
                      let title = item;
                      let desc = "";
                      if (item.includes(": ")) {
                        const parts = item.split(": ");
                        title = parts[0];
                        desc = parts.slice(1).join(": ");
                      } else if (item.includes(" - ")) {
                        const parts = item.split(" - ");
                        title = parts[0];
                        desc = parts.slice(1).join(" - ");
                      }
                      return (
                        <div key={idx} className="benefit-card-single">
                          <div className="benefit-card-icon-wrapper">
                            <img
                              src="https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68af54ee3bafdceb6ffba3dc_Benefit%20Card%20Icon1.svg"
                              alt="Check"
                              className="benefit-card-icon"
                            />
                          </div>
                          <div className="benefit-card-title-description">
                            <div className="benefit-card-title">{title}</div>
                            {desc && <p className="benefit-card-description">{desc}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==========================================================================
          5. FAQ SECTION (.section.faq) - WHITE BACKGROUND
          ========================================================================== */}
      <section className="section faq">
        <div className="container">
          <div className="section-title-wrapper">
            <div className="section-subtitle-wrap">
              <div className="section-subtitle-single">
                <img
                  src="https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/687810aa5293f9e8c955c26a_Section%20Subtitle%20Icon.svg"
                  alt="Subtitle Icon"
                  className="section-subtitle-icon"
                />
                <div className="section-subtitle">FAQS</div>
              </div>
            </div>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-description cms-technology-description">
              Find answers to common questions about our working process, technology stack, and service execution.
            </p>
          </div>

          <div className="faq-content">
            <div className="faq-typography-card">
              <div className="faq-title-card-wrapper">
                <div className="faq-card-title-single">
                  <h3 className="faq-card-title">Still Have More Questions?</h3>
                </div>
                <p className="faq-card-description">
                  If you’re curious or need more info, feel free to reach out—we’re here to help!
                </p>
              </div>
              <div className="faq-typography-card-button-wrapper">
                <Link href="/contact" className="primary-button">
                  <div className="primary-button-inner">
                    <div className="primary-button-text-wrap">
                      <div className="primary-button-text-block">Contact Us Now</div>
                      <div className="primary-button-text-block is-text-absolute">Contact Us Now</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            <div className="faq-wrapper">
              {allFaqs.map((faq, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div
                    key={idx}
                    className={`single-faq-accordion-wrap ${isOpen ? "active" : ""}`}
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  >
                    <div className="faq-accordion-question-wrap">
                      <div className="faq-question">{faq.q}</div>
                      <div className="faq-icon-wrapper">
                        <img
                          src="https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68af5ce71c07351569a5efe0_Faq%20Icon.svg"
                          alt="Toggle"
                          className="faq-icon"
                        />
                      </div>
                    </div>
                    {isOpen && (
                      <div className="core-values-accordion-answer-wrap">
                        <div className="faq-answer">
                          <p className="faq-answer-text">{faq.a}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          6. TESTIMONIAL SECTION (.section.testimonial) - WHITE BACKGROUND
          ========================================================================== */}
      <section className="section testimonial">
        <div className="testimonial-top-content">
          <div className="container">
            <div className="section-title-wrapper">
              <div className="section-subtitle-wrap">
                <div className="section-subtitle-single">
                  <img
                    src="https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/687810aa5293f9e8c955c26a_Section%20Subtitle%20Icon.svg"
                    alt="Subtitle Icon"
                    className="section-subtitle-icon"
                  />
                  <div className="section-subtitle">Testimonial</div>
                </div>
              </div>
              <h2 className="section-title">What Our Clients are Saying</h2>
              <p className="section-description about-us">
                Hear directly from our clients about their experiences and the results we've delivered.
              </p>
            </div>
          </div>
        </div>

        <div className="testimonial-bottom-content">
          <div className="testimonial-ticker">
            <div className="ticker-testimonial">
              {[...testimonials, ...testimonials].map((t, idx) => (
                <div key={idx} className="testimonial-card">
                  <div className="testimonial-card-review-wrapper">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <img
                        key={s}
                        src="https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68a7706fdbe1cb1c58f4bc43_Testimonial%20Card%20Review%20Icon1.svg"
                        alt="Star"
                        className="testimonial-card-review-icon"
                      />
                    ))}
                  </div>
                  <div className="testimonial-card-description-wrapper">
                    <p className="testimonial-card-description-text">{t.desc}</p>
                  </div>
                  <div className="testimonial-card-author-wrapper">
                    <div className="testimonial-card-author-image-wrapper">
                      <img src={t.avatar} alt={t.name} className="testimonial-card-author-image" />
                    </div>
                    <div className="testimonial-card-author-name-bio-wrapper">
                      <h6 className="testimonial-card-author-name">{t.name}</h6>
                      <div className="testimonial-card-author-bio">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          7. CTA SECTION (.section.cta) - DARK OBSIDIAN GRADIENT BOX
          ========================================================================== */}
      <section className="section cta">
        <div className="container">
          <div className="cta-content">
            <div className="cta-wrapper">
              <div className="cta-typography">
                <div className="cta-title-wrapper">
                  <h6 className="cta-subtitle">Have a project in mind? Just let us know!</h6>
                  <h2 className="cta-title">Let’s Start Talk</h2>
                </div>
                <div className="cta-button-wrapper">
                  <Link href="/contact" className="primary-button">
                    <div className="primary-button-inner w-variant-white">
                      <div className="primary-button-text-wrap">
                        <div className="primary-button-text-block">Connect With Us</div>
                        <div className="primary-button-text-block is-text-absolute">Connect With Us</div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

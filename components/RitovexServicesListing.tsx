"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { serviceGroups } from "@/lib/sitemap";

const serviceImages = [
  "https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68a8c652faddc427986bc208_Services%20Image1.jpg",
  "https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68a8c652c1e25073a0538410_Services%20Image2.jpg",
  "https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68a8c6521cb67e81661aaad8_Services%20Image3.jpg",
  "https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68a8c652566a0be2eda8c9c1_Services%20Image4.jpg",
];

const techTools = [
  { name: "Next.js / React", desc: "High-performance full-stack web framework", icon: "⚛️" },
  { name: "OpenAI / Claude", desc: "Advanced reasoning & generative AI models", icon: "🤖" },
  { name: "HeyGen / Synthesia", desc: "Studio-grade AI avatar & video synthesis", icon: "🎬" },
  { name: "Python / PyTorch", desc: "Custom machine learning automation pipelines", icon: "🐍" },
  { name: "Google & Meta Ads", desc: "Data-driven programmatic ad platforms", icon: "📊" },
  { name: "AWS / Cloudflare", desc: "Enterprise cloud hosting & global CDN", icon: "☁️" },
  { name: "PostgreSQL & Redis", desc: "Real-time, scalable database infrastructure", icon: "⚡" },
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

const faqs = [
  {
    q: "What Services Do You Offer?",
    a: "We provide comprehensive AI-powered digital marketing, AI video creation (avatars, UGC, clones, hyper-realistic production), full-stack web and app engineering, and dedicated staff augmentation.",
  },
  {
    q: "What Is the Project Timeline?",
    a: "Timelines depend on the scope. AI video assets and automated workflows typically deliver in 3 to 7 business days, while enterprise marketing strategies and full-stack software run on flexible 2-week agile sprints.",
  },
  {
    q: "Do You Offer Ongoing Support?",
    a: "Yes, absolutely. We believe in building long-term relationships with our clients. Our ongoing support packages ensure your digital assets, ad campaigns, and systems remain secure, up-to-date, and perform optimally.",
  },
  {
    q: "How Do You Ensure Quality?",
    a: "Thorough requirement gathering, agile development methodologies, continuous testing and quality assurance at every stage, regular client feedback loops, and adherence to industry best practices and coding standards.",
  },
  {
    q: "Can I Request Custom Features?",
    a: "Yes, we welcome custom feature requests! We understand that every business has unique requirements. Our flexible development approach allows us to incorporate custom functionalities and integrations to perfectly align with your vision and business goals.",
  },
];

export default function RitovexServicesListing() {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [openServiceIdx, setOpenServiceIdx] = useState<number | null>(0);
  const [hoveredServiceIdx, setHoveredServiceIdx] = useState<number | null>(null);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const currentGroup = serviceGroups[activeTabIdx] || serviceGroups[0];

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
                <div className="section-subtitle">Our Capabilities</div>
              </div>
            </div>

            <div className="inner-banner-typography">
              <h1 className="inner-banner-title">Creative Solutions</h1>
              <p className="inner-banner-description">
                We deliver innovative, tailor-made strategies that solve problems, spark ideas, and bring your vision to life—efficiently and effectively.
              </p>
            </div>

            <div className="services-button-wrapper">
              <Link href="/contact" className="primary-button">
                <div className="primary-button-inner">
                  <div className="primary-button-text-wrap">
                    <div className="primary-button-text-block">Start Projects</div>
                    <div className="primary-button-text-block is-text-absolute">Start Projects</div>
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
          2. SERVICES SECTION (.section.services) - DARK OBSIDIAN BACKGROUND (#141414)
          ========================================================================== */}
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
                <div className="section-subtitle white">Services</div>
              </div>
            </div>
            <h2 className="section-title white">Your Needs, Our Expertise</h2>
            <p className="section-description white-color services">
              Your Vision, Our Expertise – Together, we bring ideas to life with tailored solutions that deliver real results. Let’s build something amazing.
            </p>
          </div>

          {/* Category Tabs Filter */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "48px" }}>
            {serviceGroups.map((group, idx) => {
              const isActive = activeTabIdx === idx;
              return (
                <button
                  key={group.label}
                  onClick={() => {
                    setActiveTabIdx(idx);
                    setOpenServiceIdx(0);
                  }}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "100px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    border: isActive ? "1px solid transparent" : "1px solid rgba(246, 246, 249, 0.2)",
                    background: isActive ? "var(--rx-logo-gradient)" : "rgba(255, 255, 255, 0.05)",
                    color: "#ffffff",
                    boxShadow: isActive ? "0 4px 16px var(--rx-logo-glow)" : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {group.label}
                </button>
              );
            })}
          </div>

          {/* Services Accordion List with 12deg Tilted Hover Image */}
          <div className="services-contenr">
            {currentGroup.items.map((item, idx) => {
              const isOpen = openServiceIdx === idx;
              const isHovered = hoveredServiceIdx === idx;
              const imgUrl = serviceImages[idx % serviceImages.length];
              const numStr = String(idx + 1).padStart(2, "0");

              return (
                <div key={item.href} className={`services-single-wrapper ${isOpen ? "active" : ""}`}>
                  <div
                    className="services-single"
                    onMouseEnter={() => setHoveredServiceIdx(idx)}
                    onMouseLeave={() => setHoveredServiceIdx(null)}
                    onClick={() => setOpenServiceIdx(isOpen ? null : idx)}
                  >
                    <div className="services-name-wrapper">
                      <div className="services-name-number-wrapper">
                        <div className="services-number">{numStr}</div>
                        <h2 className="services-name">{item.label}</h2>
                      </div>
                      <div className="services-arrow-icon-wrapper">
                        <img
                          src="https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68a8c4dc0bf39abe4f4c253d_Services%20Arrow%20Icon.svg"
                          alt="Arrow"
                          className="services-arrow-icon"
                        />
                      </div>
                    </div>

                    {isOpen && (
                      <div className="services-description-wrapper">
                        <div className="services-description-single">
                          <p className="services-description-text">
                            {item.desc || "Comprehensive high-impact strategy engineered for high conversion, predictable performance, and continuous automated growth."}
                          </p>
                          <div style={{ marginTop: "16px" }}>
                            <Link href={item.href} className="primary-button" style={{ fontSize: "14px" }}>
                              <div className="primary-button-inner" style={{ padding: "10px 22px" }}>
                                <div className="primary-button-text-wrap">
                                  <div className="primary-button-text-block">Explore {item.label}</div>
                                  <div className="primary-button-text-block is-text-absolute">Explore {item.label}</div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 12-degree Tilted Hover Graphic */}
                    <img
                      src={imgUrl}
                      alt={item.label}
                      className={`services-image ${isHovered ? "hovered" : ""}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================================================
          3. CMS TECHNOLOGY SECTION (.section.cms-technology) - WHITE BACKGROUND
          ========================================================================== */}
      <section className="section cms-technology">
        <div className="container">
          <div className="section-title-wrapper">
            <div className="section-subtitle-wrap">
              <div className="section-subtitle-single">
                <img
                  src="https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/687810aa5293f9e8c955c26a_Section%20Subtitle%20Icon.svg"
                  alt="Subtitle Icon"
                  className="section-subtitle-icon"
                />
                <div className="section-subtitle">CMS Technology</div>
              </div>
            </div>
            <h2 className="section-title cms-technology-tools">Tools We Use to Build Great Products</h2>
            <p className="section-description cms-technology-description">
              We use modern, reliable technologies to craft fast, user-friendly digital experiences. Our stack is built for performance, scalability, and smooth development.
            </p>
          </div>

          <div className="cms-technology-content">
            <div className="cms-technology-top-card">
              {techTools.slice(0, 4).map((tech, i) => (
                <div key={i} className="cms-technology-top-card-single">
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>{tech.icon}</div>
                  <div className="cms-tech-name">{tech.name}</div>
                  <p className="cms-tech-desc">{tech.desc}</p>
                </div>
              ))}
            </div>
            <div className="cms-technology-bottom-card">
              {techTools.slice(4, 7).map((tech, i) => (
                <div key={i} className="cms-technology-top-card-single">
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>{tech.icon}</div>
                  <div className="cms-tech-name">{tech.name}</div>
                  <p className="cms-tech-desc">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          4. BENEFIT SECTION (.section.benefit-section) - DARK THEME (#141414)
          ========================================================================== */}
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
                    <div className="section-subtitle white">Benefit</div>
                  </div>
                </div>
                <div className="benefit-section-title-description">
                  <h2 className="section-title white">Why Choose Our Services</h2>
                  <p className="section-description white-color benefit-description">
                    Get high-quality results, faster delivery, and tailored solutions that grow with your business. We focus on value, efficiency, and long-term success for every project.
                  </p>
                </div>
                <div className="benefit-card-wrapper">
                  <div className="benefit-card-single">
                    <div className="benefit-card-icon-wrapper">
                      <img
                        src="https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68af54ee3bafdceb6ffba3dc_Benefit%20Card%20Icon1.svg"
                        alt="Check"
                        className="benefit-card-icon"
                      />
                    </div>
                    <div className="benefit-card-title-description">
                      <div className="benefit-card-title">Fast &amp; Reliable Delivery</div>
                      <p className="benefit-card-description">We prioritize timely completion without compromising quality.</p>
                    </div>
                  </div>
                  <div className="benefit-card-single">
                    <div className="benefit-card-icon-wrapper">
                      <img
                        src="https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68af54ee3bafdceb6ffba3dc_Benefit%20Card%20Icon1.svg"
                        alt="Check"
                        className="benefit-card-icon"
                      />
                    </div>
                    <div className="benefit-card-title-description">
                      <div className="benefit-card-title">Tailored to Your Needs</div>
                      <p className="benefit-card-description">Every solution is customized to fit your unique goals and challenges.</p>
                    </div>
                  </div>
                  <div className="benefit-card-single">
                    <div className="benefit-card-icon-wrapper">
                      <img
                        src="https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/68af54ee3bafdceb6ffba3dc_Benefit%20Card%20Icon1.svg"
                        alt="Check"
                        className="benefit-card-icon"
                      />
                    </div>
                    <div className="benefit-card-title-description">
                      <div className="benefit-card-title">Continuous AI Optimization</div>
                      <p className="benefit-card-description">Data-driven performance benchmarks and ongoing iterative improvement.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              Find answers to common questions about our working process, technology stack, and project execution.
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
              {faqs.map((faq, idx) => {
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

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/app/merkil-service.css";
import type { ServiceCategoryMeta } from "@/lib/servicesData";

interface MerkilCategoryHubProps {
  category: ServiceCategoryMeta;
}

export default function MerkilCategoryHub({ category }: MerkilCategoryHubProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="merkil-page-wrapper">
      <Header />

      <main style={{ paddingTop: "80px" }}>
        {/* ========================================================================= */}
        {/* 1. HERO SECTION (Full-Bleed Right Edge to Edge Matching Reference) */}
        {/* ========================================================================= */}
        <section className="merkil-hero-section">
          <div className="merkil-hero-grid">
            <div className="merkil-hero-left">
              <div className="merkil-hero-content">
                <div className="badge yellow">
                  <img
                    src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/6890bee0bc046268f9b1496c_magic-wand.svg"
                    loading="lazy"
                    alt="Badge Icon"
                    className="badge-icon"
                  />
                  <div className="tagline">Digital Marketing Agency</div>
                </div>

                <h1 className="home-hero-heading">
                  We help bold brands grow with{" "}
                  <span className="text-light-gray">strategic marketing</span>
                </h1>

                <div className="hero-subtitle-wrap">
                  <div className="paragraph-01 text-dark-gray">
                    We help bold brands grow with strategic marketing, creative storytelling, and data-driven campaigns that connect and inspire action.
                  </div>
                </div>

                <div className="hero-button-wrap">
                  <Link href="/contact" className="cta-button w-variant-8ce7a3fd-e4dc-43a0-b1eb-b74ad04c7e67 w-inline-block">
                    <img
                      src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fd96b8386df55b73b8d7d_Call.svg"
                      loading="lazy"
                      alt=""
                      className="call"
                    />
                    <div className="cta-button-text-wrap w-variant-8ce7a3fd-e4dc-43a0-b1eb-b74ad04c7e67">
                      <div className="cta-button-text-group">
                        <div className="button-01-text">Book a Free Call</div>
                        <div className="button-01-text">Book a Free Call</div>
                      </div>
                    </div>
                  </Link>

                  <Link href="#services-section" className="button-01 w-inline-block">
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
                        <div className="button-01-text">Our Services</div>
                        <div className="button-01-text">Our Services</div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="merkil-hero-right">
              <div className="merkil-hero-image-box">
                <img
                  src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b38088492c916cc2b2e802_203646ac22604322e486f1d149b88bc6_Hero%20Image.avif"
                  loading="lazy"
                  alt="Hero Image"
                  className="merkil-hero-img"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. BRANDS MARQUEE */}
        {/* ========================================================================= */}
        <section className="brands w-variant-9191cf81-6812-c5a1-2f22-543a654b1af3">
          <div className="container">
            <div className="brands-wrap">
              <div className="section-header-wrap center">
                <div className="section-header-content">
                  <div className="section-heading-wrap">
                    <div className="text-style-h5">
                      Partnering with the world’s leading enterprises
                    </div>
                  </div>
                </div>
              </div>
              <div className="brands-main-wrap">
                <div className="brands-marquee">
                  <div className="brands-list">
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aad0e27a6bad7e5fa2_Logo%20(1).svg" loading="lazy" alt="Logo" className="brand" />
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aad9bd6601d5169c07_Logo%20(9).svg" loading="lazy" alt="Logo" className="brand" />
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aae86b0b10ea8f97e0_Logo%20(6).svg" loading="lazy" alt="Logo" className="brand" />
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aa4c03cecaab9c8cd4_Logo%20(8).svg" loading="lazy" alt="Logo" className="brand" />
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aa0f5b95bfbd9dc00a_Logo%20(7).svg" loading="lazy" alt="Logo" className="brand" />
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aad0e27a6bad7e5fa2_Logo%20(1).svg" loading="lazy" alt="Logo" className="brand" />
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aad9bd6601d5169c07_Logo%20(9).svg" loading="lazy" alt="Logo" className="brand" />
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aae86b0b10ea8f97e0_Logo%20(6).svg" loading="lazy" alt="Logo" className="brand" />
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aa4c03cecaab9c8cd4_Logo%20(8).svg" loading="lazy" alt="Logo" className="brand" />
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aa0f5b95bfbd9dc00a_Logo%20(7).svg" loading="lazy" alt="Logo" className="brand" />
                  </div>
                  <div className="brands-list">
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aad0e27a6bad7e5fa2_Logo%20(1).svg" loading="lazy" alt="Logo" className="brand" />
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aad9bd6601d5169c07_Logo%20(9).svg" loading="lazy" alt="Logo" className="brand" />
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aae86b0b10ea8f97e0_Logo%20(6).svg" loading="lazy" alt="Logo" className="brand" />
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aa4c03cecaab9c8cd4_Logo%20(8).svg" loading="lazy" alt="Logo" className="brand" />
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aa0f5b95bfbd9dc00a_Logo%20(7).svg" loading="lazy" alt="Logo" className="brand" />
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aad0e27a6bad7e5fa2_Logo%20(1).svg" loading="lazy" alt="Logo" className="brand" />
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aad9bd6601d5169c07_Logo%20(9).svg" loading="lazy" alt="Logo" className="brand" />
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aae86b0b10ea8f97e0_Logo%20(6).svg" loading="lazy" alt="Logo" className="brand" />
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aa4c03cecaab9c8cd4_Logo%20(8).svg" loading="lazy" alt="Logo" className="brand" />
                    <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b383aa0f5b95bfbd9dc00a_Logo%20(7).svg" loading="lazy" alt="Logo" className="brand" />
                  </div>
                </div>
                <div className="brand-left-shadow" />
                <div className="brand-right-shadow" />
              </div>
              <div className="divider w-variant-20d78349-7875-4114-4306-99b9c641c0b2" />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. SERVICES (3-COLOR BENTO CARDS LINKED TO SUBPAGES) */}
        {/* ========================================================================= */}
        <section id="services-section" className="services">
          <div className="container">
            <div className="services-wrap">
              <div className="section-header-wrap">
                <div className="section-header-left">
                  <div className="section-badge-wrap">
                    <div className="section-badge w-variant-base">
                      <div className="badge-dot" />
                      <div className="tagline">Our Service</div>
                    </div>
                  </div>
                  <div className="section-heading-wrap">
                    <h2 className="section-heading">
                      How we make it happen{" "}
                      <span className="text-light-gray">together with purpose</span>
                    </h2>
                  </div>
                </div>
                <div className="section-header-right">
                  <div className="paragraph-02 text-dark-gray">
                    We combine strategy, creativity, and data to deliver impactful marketing solutions. From discovery to execution.
                  </div>
                </div>
              </div>

              <div className="services-main-wrap">
                {category.services.map((srv, idx) => {
                  const cardModifiers = ["", "_02", "_03"];
                  const mod = cardModifiers[idx % 3];
                  const icons = [
                    "https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/6890df3745eb863957876bc0_Pen.svg",
                    "https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/6890df37694b8b03c5806646_File.svg",
                    "https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/6890df1c52aea5653b4d88fc_Seo.svg",
                  ];
                  const icon = icons[idx % 3];
                  const tagSets = [
                    ["Brand Strategy", "Graphic Design", "Production"],
                    ["SEO", "Content Writing", "Content Checker"],
                    ["AI Search", "Research", "Site Analysis"],
                  ];
                  const tags = tagSets[idx % 3];

                  return (
                    <Link
                      key={srv.slug}
                      href={`/services/${category.categorySlug}/${srv.slug}`}
                      className={`services-card ${mod} w-inline-block`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <img src={icon} loading="lazy" alt="" className="services-icon" />
                      <div className="services-details">
                        <div className="services-text-wrap">
                          <div className="text-style-h3">{srv.label}</div>
                          <div className="paragraph-02 black-text-70">{srv.desc}</div>
                        </div>
                        <div className="services-tag-wrap">
                          {tags.map((t, tIdx) => (
                            <div key={tIdx} className="services-tag">
                              <div className="tagline">{t}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. ABOUT-01 ((Our Studio) Editorial Showcase) */}
        {/* ========================================================================= */}
        <section className="about-01">
          <div className="container">
            <div className="about-01-wrap">
              <div className="about-01-header-wrap">
                <div className="section-heading-wrap">
                  <div className="section-badge-wrap position">
                    <div className="section-badge w-variant-base">
                      <div className="badge-dot" />
                      <div className="tagline">(Our Studio)</div>
                    </div>
                  </div>
                  <h2 className="section-heading about-01-heading">
                    <span className="about-text-space">We’re here</span> to push limits, defy the ordinary, and transform bold ideas into digital experiences that leave a mark. Our process begins by immersing ourselves in your brand{" "}
                    <span className="text-light-gray">
                      — aligning every move with your vision, goals, and audience to create real, measurable impact.
                    </span>
                  </h2>
                </div>
              </div>

              <div className="about-01-main-wrap">
                <div className="about-01-left">
                  <div className="about-01-video-wrap">
                    <div className="image-wrap">
                      <img
                        src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/6892209ac5973d35fda7e80b_About%20Image%2001.avif"
                        loading="lazy"
                        alt="About Image"
                        className="fit-cover"
                      />
                    </div>
                  </div>
                  <div className="about-01-details">
                    <div className="about-01-text-wrap">
                      <div className="paragraph-02 text-dark-gray">
                        A creative agency pushing brands beyond boundaries — through design, storytelling, and strategy. We are a multidisciplinary design studio crafting visionary solutions for ambitious enterprises.
                      </div>
                      <div className="paragraph-02 text-dark-gray">
                        Our passion is to craft visionary solutions for ambitious brands, unlocking exponential growth through data-driven campaigns and relentless optimization.
                      </div>
                    </div>
                    <div className="about-01-button-wrap">
                      <Link href="/about" className="button-02 w-inline-block">
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
                            <div className="button-01-text text-white">Know more About us</div>
                            <div className="button-01-text">Know more About us</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="about-01-right">
                  <div className="about-01-image-wrap">
                    <div className="image-wrap">
                      <img
                        src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/6892209b02a78e4d3388e880_About%20Image%2002.avif"
                        loading="lazy"
                        alt="About Image"
                        className="fit-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. PROJECT-01 (Selected Projects Showcase) */}
        {/* ========================================================================= */}
        <section className="project-01">
          <div className="container">
            <div className="section-header-wrap">
              <div className="section-header-left">
                <div className="section-badge-wrap">
                  <div className="section-badge w-variant-base">
                    <div className="badge-dot" />
                    <div className="tagline">Selected Projects</div>
                  </div>
                </div>
                <div className="section-heading-wrap">
                  <h2 className="section-heading">
                    Portfolio of impactful and{" "}
                    <span className="text-light-gray">successful campaigns</span>
                  </h2>
                </div>
              </div>
              <div className="section-header-right">
                <div className="paragraph-02 text-dark-gray">
                  We combine strategy, creativity, and data to deliver impactful marketing solutions. From discovery to execution.
                </div>
              </div>
            </div>
          </div>

          <div className="project-01-list-wrap">
            {/* Project 1 */}
            <div className="project-01-list">
              <div className="container">
                <div className="project-01-link">
                  <div className="project-01-item">
                    <div className="project-01-left">
                      <div className="text-style-h4">01 //</div>
                      <div className="project-01-details">
                        <div className="project-01-text-wrap">
                          <div className="text-style-h3">Lukox. Project Amplify</div>
                          <div className="paragraph-02 text-dark-gray">
                            We combine strategy, creativity, and data to deliver impactful marketing solutions.
                          </div>
                        </div>
                        <Link href="/case-studies" className="button-03">
                          <img
                            loading="lazy"
                            src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fdc9026d2687b7bd01696_Arrow.svg"
                            alt=""
                            className="button-03-arrow"
                          />
                          <div className="button-01-text">View Project</div>
                          <div className="button-underline" />
                        </Link>
                      </div>
                    </div>
                    <div className="project-01-right">
                      <div className="project-01-info-wrap">
                        <div className="project-01-tag-wrap">
                          <div className="project-01-tag">
                            <div className="tagline">Social Media Branding</div>
                          </div>
                          <div className="project-01-tag">
                            <div className="tagline">Rebranding</div>
                          </div>
                        </div>
                        <div className="project-01-year">
                          <div className="tagline">©</div>
                          <div className="tagline">2025</div>
                        </div>
                      </div>
                      <div className="project-01-image-wrap">
                        <div className="project-01-thumbnail-wrap">
                          <div className="image-wrap">
                            <img
                              src="https://cdn.prod.website-files.com/68910e1fd50820e9f30b6e65/68910fb87566c53c935e665e_Project%20Image%201.avif"
                              loading="lazy"
                              alt=""
                              className="fit-cover"
                            />
                          </div>
                          <div className="project-arrow small">
                            <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b3855fdd635887297357a7_Arrow.svg" loading="lazy" alt="" />
                          </div>
                        </div>
                        <div className="project-01-thumbnail-wrap _02">
                          <div className="image-wrap">
                            <img
                              src="https://cdn.prod.website-files.com/68910e1fd50820e9f30b6e65/68910fbdb15c4059ce72e431_Project%20Image%202.avif"
                              loading="lazy"
                              alt=""
                              className="fit-cover"
                            />
                          </div>
                          <div className="project-arrow small">
                            <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b3855fdd635887297357a7_Arrow.svg" loading="lazy" alt="" />
                          </div>
                        </div>
                        <div className="project-01-thumbnail-wrap _03">
                          <div className="image-wrap">
                            <img
                              src="https://cdn.prod.website-files.com/68910e1fd50820e9f30b6e65/68910fc5f77b77beff3b7b22_Project%20Image%203.avif"
                              loading="lazy"
                              alt=""
                              className="fit-cover"
                            />
                          </div>
                          <div className="project-arrow small">
                            <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b3855fdd635887297357a7_Arrow.svg" loading="lazy" alt="" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 2 */}
            <div className="project-01-list _02">
              <div className="container">
                <div className="project-01-link">
                  <div className="project-01-item">
                    <div className="project-01-left">
                      <div className="text-style-h4">02 //</div>
                      <div className="project-01-details">
                        <div className="project-01-text-wrap">
                          <div className="text-style-h3">Blux. Website Design</div>
                          <div className="paragraph-02 text-dark-gray">
                            Creating sleek, modern websites that captivate and elevate your brand online.
                          </div>
                        </div>
                        <Link href="/case-studies" className="button-03">
                          <img
                            loading="lazy"
                            src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fdc9026d2687b7bd01696_Arrow.svg"
                            alt=""
                            className="button-03-arrow"
                          />
                          <div className="button-01-text">View Project</div>
                          <div className="button-underline" />
                        </Link>
                      </div>
                    </div>
                    <div className="project-01-right">
                      <div className="project-01-info-wrap">
                        <div className="project-01-tag-wrap">
                          <div className="project-01-tag">
                            <div className="tagline">Strategy</div>
                          </div>
                          <div className="project-01-tag">
                            <div className="tagline">Web Design</div>
                          </div>
                        </div>
                        <div className="project-01-year">
                          <div className="tagline">©</div>
                          <div className="tagline">2025</div>
                        </div>
                      </div>
                      <div className="project-01-image-wrap">
                        <div className="project-01-thumbnail-wrap">
                          <div className="image-wrap">
                            <img
                              src="https://cdn.prod.website-files.com/68910e1fd50820e9f30b6e65/689110d6202a5c67aee5aa60_Project%20Image%204.avif"
                              loading="lazy"
                              alt=""
                              className="fit-cover"
                            />
                          </div>
                          <div className="project-arrow small">
                            <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b3855fdd635887297357a7_Arrow.svg" loading="lazy" alt="" />
                          </div>
                        </div>
                        <div className="project-01-thumbnail-wrap _02">
                          <div className="image-wrap">
                            <img
                              src="https://cdn.prod.website-files.com/68910e1fd50820e9f30b6e65/689110ce13ff82405f756ff2_Project%20Image%205.avif"
                              loading="lazy"
                              alt=""
                              className="fit-cover"
                            />
                          </div>
                          <div className="project-arrow small">
                            <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b3855fdd635887297357a7_Arrow.svg" loading="lazy" alt="" />
                          </div>
                        </div>
                        <div className="project-01-thumbnail-wrap _03">
                          <div className="image-wrap">
                            <img
                              src="https://cdn.prod.website-files.com/68910e1fd50820e9f30b6e65/689110d26cff5ad70809d28f_Project%20Image%206.avif"
                              loading="lazy"
                              alt=""
                              className="fit-cover"
                            />
                          </div>
                          <div className="project-arrow small">
                            <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b3855fdd635887297357a7_Arrow.svg" loading="lazy" alt="" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 3 */}
            <div className="project-01-list">
              <div className="container">
                <div className="project-01-link">
                  <div className="project-01-item">
                    <div className="project-01-left">
                      <div className="text-style-h4">03 //</div>
                      <div className="project-01-details">
                        <div className="project-01-text-wrap">
                          <div className="text-style-h3">konx. Branding &amp; Design</div>
                          <div className="paragraph-02 text-dark-gray">
                            Building bold brands with innovative design that makes a lasting impact.
                          </div>
                        </div>
                        <Link href="/case-studies" className="button-03">
                          <img
                            loading="lazy"
                            src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fdc9026d2687b7bd01696_Arrow.svg"
                            alt=""
                            className="button-03-arrow"
                          />
                          <div className="button-01-text">View Project</div>
                          <div className="button-underline" />
                        </Link>
                      </div>
                    </div>
                    <div className="project-01-right">
                      <div className="project-01-info-wrap">
                        <div className="project-01-tag-wrap">
                          <div className="project-01-tag">
                            <div className="tagline">Seo</div>
                          </div>
                          <div className="project-01-tag">
                            <div className="tagline">Strategy</div>
                          </div>
                        </div>
                        <div className="project-01-year">
                          <div className="tagline">©</div>
                          <div className="tagline">2025</div>
                        </div>
                      </div>
                      <div className="project-01-image-wrap">
                        <div className="project-01-thumbnail-wrap">
                          <div className="image-wrap">
                            <img
                              src="https://cdn.prod.website-files.com/68910e1fd50820e9f30b6e65/689111393712ea83a0b4e137_Project%20Image%207.avif"
                              loading="lazy"
                              alt=""
                              className="fit-cover"
                            />
                          </div>
                          <div className="project-arrow small">
                            <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b3855fdd635887297357a7_Arrow.svg" loading="lazy" alt="" />
                          </div>
                        </div>
                        <div className="project-01-thumbnail-wrap _02">
                          <div className="image-wrap">
                            <img
                              src="https://cdn.prod.website-files.com/68910e1fd50820e9f30b6e65/689111346ff21c86b89e9395_Project%20Image%208.avif"
                              loading="lazy"
                              alt=""
                              className="fit-cover"
                            />
                          </div>
                          <div className="project-arrow small">
                            <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b3855fdd635887297357a7_Arrow.svg" loading="lazy" alt="" />
                          </div>
                        </div>
                        <div className="project-01-thumbnail-wrap _03">
                          <div className="image-wrap">
                            <img
                              src="https://cdn.prod.website-files.com/68910e1fd50820e9f30b6e65/6891113ec4cf9833cb5da866_Project%20Image%209.avif"
                              loading="lazy"
                              alt=""
                              className="fit-cover"
                            />
                          </div>
                          <div className="project-arrow small">
                            <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68b3855fdd635887297357a7_Arrow.svg" loading="lazy" alt="" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. GROWTH (Sustained Annual Growth) */}
        {/* ========================================================================= */}
        <section className="growth">
          <div className="container">
            <div className="growth-wrap">
              <div className="section-header-wrap center">
                <div className="section-header-content">
                  <div className="section-badge-wrap">
                    <div className="section-badge w-variant-base">
                      <div className="badge-dot" />
                      <div className="tagline">Sustained Annual Growth</div>
                    </div>
                  </div>
                  <div className="section-heading-wrap space">
                    <h2 className="section-heading text-center">
                      Consistent performance{" "}
                      <span className="text-light-gray">over the year</span>
                    </h2>
                  </div>
                  <div className="section-subtitle-wrap">
                    <div className="paragraph-02 text-center text-dark-gray">
                      Our annual growth reflects the impact of focused strategy, innovation, and client trust. Each year, we continue to scale, expand our reach, and deliver measurable value—driven by data, insight, and consistent execution.
                    </div>
                  </div>
                </div>
              </div>

              <div className="growth-main-wrap">
                <div className="growth-circle-wrap">
                  <img
                    src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68911ed2da0080a9f83b105b_Circle.avif"
                    loading="lazy"
                    alt="Annual Performance Orbital Circle"
                    className="growth-circle"
                  />
                  <div className="circle-text-wrap">
                    <div className="circle-text">
                      Annual<br />Performance
                    </div>
                  </div>
                </div>

                <div className="growth-list-wrap">
                  {/* Card 1 */}
                  <div className="growth-list">
                    <div className="growth-icon-block">
                      <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/689121c65f9520065ce47dc6_Pen.svg" loading="lazy" alt="" className="growth-icon" />
                    </div>
                    <div className="growth-details">
                      <div className="growth-badge-wrap">
                        <div className="tagline text-center">46% Annual Rate</div>
                      </div>
                      <div className="growth-text-wrap">
                        <h3 className="text-style-h3">Social Media Campaign</h3>
                        <div className="paragraph-02 text-dark-gray">
                          Building strong brand connections with engaging content and strategies tailored to each platform.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="growth-list">
                    <div className="growth-icon-block button-02-text-group">
                      <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/689121c67f47853fad44b287_File.svg" loading="lazy" alt="" className="growth-icon" />
                    </div>
                    <div className="growth-details _02">
                      <div className="growth-badge-wrap _02">
                        <div className="tagline text-center">34% Annual Rate</div>
                      </div>
                      <div className="growth-text-wrap">
                        <h3 className="text-style-h3">Paid Marketing</h3>
                        <div className="paragraph-02 text-dark-gray">
                          Targeted ad campaigns designed to reach the right audience, drive traffic, and maximize ROI.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="growth-list">
                    <div className="growth-icon-block">
                      <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/689121c6cf34dda824810302_Seo.svg" loading="lazy" alt="" className="growth-icon" />
                    </div>
                    <div className="growth-details">
                      <div className="growth-badge-wrap _03">
                        <div className="tagline text-center">20% Annual Rate</div>
                      </div>
                      <div className="growth-text-wrap">
                        <h3 className="text-style-h3">SEO Marketing</h3>
                        <div className="paragraph-02 text-dark-gray">
                          Improving search visibility to attract quality traffic and drive long-term organic growth.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. FEEDBACK (Client Testimonials & Feedback Marquee) */}
        {/* ========================================================================= */}
        <section className="feedback w-variant-base">
          <div className="container">
            <div className="feedback-wrap">
              <div className="section-header-wrap center">
                <div className="section-header-content medium">
                  <div className="section-badge-wrap">
                    <div className="section-badge w-variant-base">
                      <div className="badge-dot" />
                      <div className="tagline">Client Feedback</div>
                    </div>
                  </div>
                  <div className="section-heading-wrap space">
                    <h2 className="section-heading text-center">
                      Trusted by brands worldwide and{" "}
                      <span className="text-light-gray">growing every day</span>
                    </h2>
                  </div>
                </div>
              </div>

              <div className="feedback-main-wrap">
                {/* Column 1 */}
                <div className="feedback-column _01">
                  <div className="feedback-marquee-wrap">
                    <div className="feedback-list _01">
                      <div className="feedback-item">
                        <div className="feedback-text">
                          &quot;Working with Merkil was a game changer for our brand. Their creative strategies took our social presence to the next level.&quot;
                        </div>
                        <div className="feedback-author-wrap">
                          <div className="feedback-author-text">
                            <div className="text-style-h4">David Lin</div>
                            <div className="paragraph-02 text-dark-gray">Head of Growth, Lumina</div>
                          </div>
                        </div>
                      </div>
                      <div className="feedback-item">
                        <div className="feedback-text">
                          &quot;The SEO strategy they executed delivered over 240% increase in inbound leads within our first four months.&quot;
                        </div>
                        <div className="feedback-author-wrap">
                          <div className="feedback-author-text">
                            <div className="text-style-h4">Sarah Jenkins</div>
                            <div className="paragraph-02 text-dark-gray">VP Marketing, ScaleFlow</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2 - CEO Highlight & Counter Stats */}
                <div className="feedback-column center">
                  <div className="feedback-content-wrap">
                    <div className="quote-wrap">
                      <img src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/68942a033f7d4c9f1165e638_Quote.svg" loading="lazy" alt="" className="quote-icon" />
                      <div className="quote-text">
                        &quot;Our agency was built on the belief that true growth happens when creativity meets rigorous algorithmic execution.&quot;
                      </div>
                      <div className="quote-author-wrap">
                        <div className="text-style-h4">Alex Morgan</div>
                        <div className="paragraph-02 text-dark-gray">Founder &amp; CEO</div>
                      </div>
                    </div>

                    <div className="counter-main-wrap">
                      <div className="counter-item">
                        <div className="text-style-h2">+140%</div>
                        <div className="paragraph-02 text-dark-gray">Organic Reach</div>
                      </div>
                      <div className="counter-item">
                        <div className="text-style-h2">4.9/5</div>
                        <div className="paragraph-02 text-dark-gray">Client Rating</div>
                      </div>
                      <div className="counter-item">
                        <div className="text-style-h2">98%</div>
                        <div className="paragraph-02 text-dark-gray">Client Retention</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="feedback-column _02">
                  <div className="feedback-marquee-wrap">
                    <div className="feedback-list _02">
                      <div className="feedback-item">
                        <div className="feedback-text">
                          &quot;Their paid marketing precision and creative copy testing allowed us to scale from $50k to $300k/mo profitable ad spend.&quot;
                        </div>
                        <div className="feedback-author-wrap">
                          <div className="feedback-author-text">
                            <div className="text-style-h4">Marcus Vance</div>
                            <div className="paragraph-02 text-dark-gray">CMO, TechNext</div>
                          </div>
                        </div>
                      </div>
                      <div className="feedback-item">
                        <div className="feedback-text">
                          &quot;Incredible attention to detail, proactive reporting, and unmatched creative execution across all our channels.&quot;
                        </div>
                        <div className="feedback-author-wrap">
                          <div className="feedback-author-text">
                            <div className="text-style-h4">Elena Rostova</div>
                            <div className="paragraph-02 text-dark-gray">Director of Brand, Nexa</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. PRICING-01 (Interactive Pricing Switcher) */}
        {/* ========================================================================= */}
        <section className="pricing-01">
          <div className="container">
            <div className="pricing-01-wrap">
              <div className="section-header-wrap">
                <div className="section-header-left">
                  <div className="section-badge-wrap">
                    <div className="section-badge w-variant-base">
                      <div className="badge-dot" />
                      <div className="tagline">Pricing Plan</div>
                    </div>
                  </div>
                  <div className="section-heading-wrap">
                    <h2 className="section-heading">
                      Plans designed to maximize{" "}
                      <span className="text-light-gray">ROI and fast growth</span>
                    </h2>
                  </div>
                </div>
                <div className="section-header-right">
                  <div className="paragraph-02 text-dark-gray">
                    We combine strategy, creativity, data to deliver impactful marketing solutions. From discovery to execution.
                  </div>
                </div>
              </div>

              {/* Monthly / Yearly Switch */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    backgroundColor: "#f0eff5",
                    padding: "6px",
                    borderRadius: "100px",
                    gap: "6px",
                  }}
                >
                  <button
                    onClick={() => setIsYearly(false)}
                    style={{
                      padding: "10px 24px",
                      borderRadius: "100px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "14px",
                      backgroundColor: !isYearly ? "#ffffff" : "transparent",
                      color: !isYearly ? "#000000" : "#71717a",
                      boxShadow: !isYearly ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Monthly Billing
                  </button>
                  <button
                    onClick={() => setIsYearly(true)}
                    style={{
                      padding: "10px 24px",
                      borderRadius: "100px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "14px",
                      backgroundColor: isYearly ? "#ffffff" : "transparent",
                      color: isYearly ? "#000000" : "#71717a",
                      boxShadow: isYearly ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Yearly Billing <span style={{ color: "#8b5cf6", fontSize: "12px", marginLeft: "4px" }}>(-20%)</span>
                  </button>
                </div>
              </div>

              <div className="pricing-grid">
                {/* Plan 1 */}
                <div className="pricing-card">
                  <div className="pricing-top">
                    <div className="text-style-h4">Starter</div>
                    <div className="pricing-amount">
                      {isYearly ? "$1,990" : "$2,490"}
                      <span className="pricing-period">/month</span>
                    </div>
                    <div className="paragraph-02 text-dark-gray">
                      Ideal for emerging brands looking to establish predictable inbound pipeline.
                    </div>
                  </div>
                  <div className="pricing-divider" />
                  <div className="pricing-features">
                    <div className="pricing-feature-item">
                      <span style={{ color: "#8b5cf6", marginRight: "8px" }}>✓</span> AI Search &amp; SEO Foundation
                    </div>
                    <div className="pricing-feature-item">
                      <span style={{ color: "#8b5cf6", marginRight: "8px" }}>✓</span> Social Channel Management (2 platforms)
                    </div>
                    <div className="pricing-feature-item">
                      <span style={{ color: "#8b5cf6", marginRight: "8px" }}>✓</span> Bi-weekly Performance Reporting
                    </div>
                  </div>
                  <Link href="/contact" className="button-02 w-inline-block" style={{ marginTop: "28px", width: "100%", justifyContent: "center" }}>
                    <div className="button-02-text-wrap">
                      <div className="button-02-text-group">
                        <div className="button-01-text text-white">Get Started</div>
                        <div className="button-01-text">Get Started</div>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Plan 2 - Featured */}
                <div className="pricing-card featured" style={{ border: "2px solid #8b5cf6", position: "relative" }}>
                  <div className="badge purple pill" style={{ position: "absolute", top: "-14px", right: "24px" }}>
                    Most Popular
                  </div>
                  <div className="pricing-top">
                    <div className="text-style-h4">Growth Scale</div>
                    <div className="pricing-amount">
                      {isYearly ? "$3,990" : "$4,990"}
                      <span className="pricing-period">/month</span>
                    </div>
                    <div className="paragraph-02 text-dark-gray">
                      Engineered for high-growth enterprises aiming to dominate their market.
                    </div>
                  </div>
                  <div className="pricing-divider" />
                  <div className="pricing-features">
                    <div className="pricing-feature-item">
                      <span style={{ color: "#8b5cf6", marginRight: "8px" }}>✓</span> Full Omni-Channel AI Campaign Management
                    </div>
                    <div className="pricing-feature-item">
                      <span style={{ color: "#8b5cf6", marginRight: "8px" }}>✓</span> Multi-Platform Paid Ads (Google, Meta, TikTok)
                    </div>
                    <div className="pricing-feature-item">
                      <span style={{ color: "#8b5cf6", marginRight: "8px" }}>✓</span> Dedicated Growth Strategist &amp; Creative Team
                    </div>
                    <div className="pricing-feature-item">
                      <span style={{ color: "#8b5cf6", marginRight: "8px" }}>✓</span> Real-Time ROI Analytics Dashboard
                    </div>
                  </div>
                  <Link href="/contact" className="cta-button w-variant-8ce7a3fd-e4dc-43a0-b1eb-b74ad04c7e67 w-inline-block" style={{ marginTop: "28px", width: "100%", justifyContent: "center" }}>
                    <div className="cta-button-text-wrap w-variant-8ce7a3fd-e4dc-43a0-b1eb-b74ad04c7e67">
                      <div className="cta-button-text-group">
                        <div className="button-01-text">Get Started</div>
                        <div className="button-01-text">Get Started</div>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Plan 3 */}
                <div className="pricing-card">
                  <div className="pricing-top">
                    <div className="text-style-h4">Enterprise Dominance</div>
                    <div className="pricing-amount">
                      {isYearly ? "$7,990" : "$9,990"}
                      <span className="pricing-period">/month</span>
                    </div>
                    <div className="paragraph-02 text-dark-gray">
                      Complete end-to-end digital dominance with bespoke AI solutions.
                    </div>
                  </div>
                  <div className="pricing-divider" />
                  <div className="pricing-features">
                    <div className="pricing-feature-item">
                      <span style={{ color: "#8b5cf6", marginRight: "8px" }}>✓</span> Unlimited AI Video &amp; Creative Production
                    </div>
                    <div className="pricing-feature-item">
                      <span style={{ color: "#8b5cf6", marginRight: "8px" }}>✓</span> Custom Algorithmic Bidding &amp; Lead Routing
                    </div>
                    <div className="pricing-feature-item">
                      <span style={{ color: "#8b5cf6", marginRight: "8px" }}>✓</span> Executive SLA &amp; 24/7 Dedicated Support
                    </div>
                  </div>
                  <Link href="/contact" className="button-02 w-inline-block" style={{ marginTop: "28px", width: "100%", justifyContent: "center" }}>
                    <div className="button-02-text-wrap">
                      <div className="button-02-text-group">
                        <div className="button-01-text text-white">Get Started</div>
                        <div className="button-01-text">Get Started</div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 9. FAQ (Got Questions? Accordion) */}
        {/* ========================================================================= */}
        <section className="faq w-variant-base">
          <div className="container">
            <div className="faq-wrap">
              <div className="section-header-wrap center">
                <div className="section-header-content small">
                  <div className="section-badge-wrap">
                    <div className="section-badge w-variant-base">
                      <div className="badge-dot" />
                      <div className="tagline">FAQ</div>
                    </div>
                  </div>
                  <div className="section-heading-wrap space">
                    <h2 className="h2 text-center">Got questions?</h2>
                  </div>
                  <div className="section-subtitle-wrap">
                    <div className="paragraph-02 text-dark-gray text-center">
                      We combine strategy, creativity, and data to deliver impactful marketing solutions. From discovery to execution.
                    </div>
                  </div>
                </div>
              </div>

              <div className="faq-main-wrap">
                {[
                  {
                    q: "What digital marketing services does your agency provide?",
                    a: "We offer end-to-end digital marketing solutions including AI-powered SEO, social media marketing, paid ads (Google, Meta, TikTok), content marketing, brand strategy, email automation, and conversion rate optimization.",
                  },
                  {
                    q: "How does AI enhance your digital marketing campaigns?",
                    a: "We leverage predictive AI models for hyper-targeted audience segmentation, autonomous budget reallocation, automated creative variance testing, and real-time search intent discovery to maximize campaign ROI.",
                  },
                  {
                    q: "How quickly can we expect measurable results?",
                    a: "Paid marketing campaigns typically generate measurable traffic and qualified pipeline within the first 7 to 14 days. Comprehensive SEO and content strategies build compounding organic momentum within 60 to 90 days.",
                  },
                  {
                    q: "Do you offer custom tailored packages for specific business models?",
                    a: "Yes. Every engagement is customized to align with your target audience, unit economics, market maturity, and specific commercial growth milestones.",
                  },
                ].map((faq, idx) => (
                  <div
                    key={idx}
                    className={`faq-item ${openFaq === idx ? "is-open" : ""}`}
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    <div className="faq-question-wrap">
                      <div className="text-style-h3 faq-question">{faq.q}</div>
                      <div className="faq-arrow-block">
                        <div className="faq-arrow-horizontal" />
                        <div className="faq-arrow-vertical" />
                      </div>
                    </div>
                    {openFaq === idx && <div className="faq-answer">{faq.a}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 10. BLOG-01 (Insights / Articles Grid) */}
        {/* ========================================================================= */}
        <section className="blog-01">
          <div className="container">
            <div className="blog-01-wrap">
              <div className="section-header-wrap">
                <div className="section-header-left large">
                  <div className="section-badge-wrap">
                    <div className="section-badge w-variant-base">
                      <div className="badge-dot" />
                      <div className="tagline">Insights</div>
                    </div>
                  </div>
                  <div className="section-heading-wrap">
                    <h2 className="section-heading">
                      The pulse of digital marketing{" "}
                      <span className="text-light-gray">and strategy trends</span>
                    </h2>
                  </div>
                </div>
                <div className="section-header-right">
                  <div className="section-subtitle-wrap space">
                    <div className="paragraph-02 text-dark-gray">
                      Stay ahead with the latest digital marketing insights &amp; blogs that connect.
                    </div>
                  </div>
                  <div className="section-button-right">
                    <Link href="/blog" className="button-02 w-inline-block">
                      <div className="button-02-arrow-wrap">
                        <div className="button-02-arrow-group">
                          <img loading="lazy" src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fdc9026d2687b7bd01696_Arrow.svg" alt="" className="button-02-arrow" />
                          <img loading="lazy" src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fdea99c92801291dd0db4_Arrow%20White.svg" alt="" className="button-02-arrow" />
                        </div>
                      </div>
                      <div className="button-02-text-wrap">
                        <div className="button-02-text-group">
                          <div className="button-01-text text-white">View all Insights</div>
                          <div className="button-01-text">View all Insights</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="blog-01-main-wrap">
                {[
                  {
                    title: "How AEO and GEO Are Changing Search in 2026",
                    category: "SEO & AI",
                    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
                    slug: "/blog/how-aeo-and-geo-are-changing-search",
                  },
                  {
                    title: "The Death of Third-Party Cookies and First-Party Strategies",
                    category: "Paid Ads",
                    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
                    slug: "/blog/the-death-of-third-party-cookies",
                  },
                  {
                    title: "Deploying AI Agents for Hyper-Targeted Lead Qualification",
                    category: "Automation",
                    img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80",
                    slug: "/blog/deploying-ai-agents-for-lead-qualification",
                  },
                ].map((post, idx) => (
                  <Link key={idx} href={post.slug} className="blog-01-card w-inline-block" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="blog-01-image-wrap">
                      <img src={post.img} alt={post.title} className="fit-cover" />
                    </div>
                    <div className="blog-01-details">
                      <div className="blog-01-tag">{post.category}</div>
                      <h3 className="blog-01-title">{post.title}</h3>
                      <div className="button-03" style={{ marginTop: "12px" }}>
                        <div className="button-01-text">Read Article →</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 11. CTA BANNER (Take your marketing to the next level) */}
        {/* ========================================================================= */}
        <section className="cta">
          <div className="container">
            <div className="cta-wrap">
              <div className="badge white pill">
                <img
                  src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/6890bee0bc046268f9b1496c_magic-wand.svg"
                  loading="lazy"
                  alt="Badge Icon"
                  className="badge-icon"
                />
                <div className="tagline">Digital Marketing Agency</div>
              </div>
              <div className="cta-heading-wrap">
                <h2 className="section-heading text-center">
                  Take your marketing <span className="text-light-gray">to the next level</span>
                </h2>
              </div>
              <div className="cta-subtitle-wrap">
                <div className="paragraph-02 text-center text-dark-gray">
                  Ready to transform your brand’s digital presence? Our expert team is here to help you create impactful marketing strategies that drive real results.
                </div>
              </div>
              <div className="cta-button-wrap">
                <Link href="/contact" className="cta-button w-variant-8ce7a3fd-e4dc-43a0-b1eb-b74ad04c7e67 w-inline-block">
                  <img
                    src="https://cdn.prod.website-files.com/688d31d885372b14ca5e3d8b/688fd96b8386df55b73b8d7d_Call.svg"
                    loading="lazy"
                    alt=""
                    className="call"
                  />
                  <div className="cta-button-text-wrap w-variant-8ce7a3fd-e4dc-43a0-b1eb-b74ad04c7e67">
                    <div className="cta-button-text-group">
                      <div className="button-01-text">Book a Free Call</div>
                      <div className="button-01-text">Book a Free Call</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

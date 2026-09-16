import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { homeExtraSections } from "@/data/homeExtraSections";

export const metadata: Metadata = {
  title: "Quickupp Softech | Digital Marketing, AI & IT Solutions",
  description:
    "Quickupp Softech is a digital marketing, AI, and IT solutions agency helping brands grow with performance marketing, web & app development, and AI-driven automation.",
};

export default function Home() {
  return (
    <>
      <Header />
      <section className="hero-one-section">
        <div
          data-delay="5000"
          data-animation="fade"
          className="hero-one-slider w-slider"
          data-autoplay="true"
          data-easing="ease"
          data-hide-arrows="false"
          data-disable-swipe="false"
          data-autoplay-limit="0"
          data-nav-spacing="3"
          data-duration="500"
          data-infinite="true"
        >
          <div className="w-slider-mask">
            <div className="hero-one-slide w-slide">
              <div className="hero-one-wrap">
                <div className="w-layout-blockcontainer container hero-container w-container">
                  <div className="hero-one-content">
                    <div className="hero-one-title-wrap">
                      <div className="overflow-hidden">
                        <div className="hero-subtitle-wrap">
                          <div className="subtitle-left-icon"></div>
                          <div className="hero-one-title-small">
                            Grow Your Brand Faster.
                          </div>
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <h1 className="hero-one-title">
                          Marketing That Delivers ROI.
                        </h1>
                      </div>
                    </div>
                  </div>
                  <div className="hero-one-wrapper">
                    <div className="overflow-hidden">
                      <div className="icon-style-one">
                        <div className="icon-style-one-image-wrap">
                          <img
                            src="/images/icon-style-01-01.avif"
                            alt="icon-style-01-01"
                            className="icon-style-one-image _01"
                          />
                          <img
                            src="/images/icon-style-01-02.avif"
                            alt="icon-style-01-02"
                            className="icon-style-one-image"
                          />
                          <img
                            src="/images/icon-style-01-03.avif"
                            alt="icon-style-01-03"
                            className="icon-style-one-image"
                          />
                          <img
                            src="/images/icon-style-01-04.avif"
                            alt="icon-style-01-04"
                            className="icon-style-one-image"
                          />
                          <div className="icon-style-one-image text-style-h4">
                            25k
                          </div>
                        </div>
                        <div className="icon-style-one-desc">
                          Staffing Solutions You Can Count On
                        </div>
                      </div>
                    </div>
                    <div className="hero-one-desc-wrap">
                      <div className="overflow-hidden">
                        <div className="hero-one-desc">
                          We build result-focused marketing solutions that help
                          brands reach, engage, and convert customers.
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <div className="button-wrap">
                          <a
                            href="/contact"
                            data-wf--button--variant="white-bg"
                            data-w-id="8932a183-40ec-c216-e8b4-670b55f18dc8"
                            className="button-link w-inline-block"
                          >
                            <div className="button-hover-overlay w-variant-a5f868ad-bc85-023e-3422-a627daa9b2ef"></div>
                            <div className="button-text-wrapper w-variant-a5f868ad-bc85-023e-3422-a627daa9b2ef">
                              <div className="button-text-wrap">
                                <div className="button-text">Contact Us</div>
                                <div className="button-text-hover">
                                  Contact Us
                                </div>
                              </div>
                            </div>
                            <div className="button-arrow-wrapper w-variant-a5f868ad-bc85-023e-3422-a627daa9b2ef">
                              <div className="button-arrow-wrap">
                                <img
                                  src="/images/button-arrow.svg"
                                  loading="lazy"
                                  width="20"
                                  height="20"
                                  alt="button-arrow"
                                  className="button-arrow"
                                />
                              </div>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hero-one-overlay-one overlay"></div>
                <div className="hero-one-overlay-two overlay"></div>
                <div className="hero-one-overlay-three overlay"></div>
              </div>
            </div>
            <div className="hero-one-slide w-slide">
              <div className="hero-one-wrap _02">
                <div className="w-layout-blockcontainer container hero-container w-container">
                  <div className="hero-one-content">
                    <div className="hero-one-title-wrap">
                      <div className="overflow-hidden">
                        <div className="hero-subtitle-wrap">
                          <div className="subtitle-left-icon"></div>
                          <div className="hero-one-title-small">
                            Accelerate brand growth.
                          </div>
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <h1 className="hero-one-title">
                          Marketing built for results.
                        </h1>
                      </div>
                    </div>
                  </div>
                  <div className="hero-one-wrapper">
                    <div className="overflow-hidden">
                      <div className="icon-style-one">
                        <div className="icon-style-one-image-wrap">
                          <img
                            src="/images/icon-style-01-01.avif"
                            loading="lazy"
                            alt="icon-style-01-01"
                            className="icon-style-one-image _01"
                          />
                          <img
                            src="/images/icon-style-01-02.avif"
                            loading="lazy"
                            alt="icon-style-01-02"
                            className="icon-style-one-image"
                          />
                          <img
                            src="/images/icon-style-01-03.avif"
                            loading="lazy"
                            alt="icon-style-01-03"
                            className="icon-style-one-image"
                          />
                          <img
                            src="/images/icon-style-01-04.avif"
                            loading="lazy"
                            alt="icon-style-01-04"
                            className="icon-style-one-image"
                          />
                          <div className="icon-style-one-image text-style-h4">
                            25k
                          </div>
                        </div>
                        <div className="icon-style-one-desc">
                          Results-driven marketing solutions
                        </div>
                      </div>
                    </div>
                    <div className="hero-one-desc-wrap">
                      <div className="overflow-hidden">
                        <div className="hero-one-desc">
                          In order to help brands reach, engage, and convert
                          consumers, we design campaigns that are measurable.
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <div className="button-wrap">
                          <a
                            href="/contact"
                            data-wf--button--variant="white-bg"
                            data-w-id="8932a183-40ec-c216-e8b4-670b55f18dc8"
                            className="button-link w-inline-block"
                          >
                            <div className="button-hover-overlay w-variant-a5f868ad-bc85-023e-3422-a627daa9b2ef"></div>
                            <div className="button-text-wrapper w-variant-a5f868ad-bc85-023e-3422-a627daa9b2ef">
                              <div className="button-text-wrap">
                                <div className="button-text">Contact us</div>
                                <div className="button-text-hover">
                                  Contact us
                                </div>
                              </div>
                            </div>
                            <div className="button-arrow-wrapper w-variant-a5f868ad-bc85-023e-3422-a627daa9b2ef">
                              <div className="button-arrow-wrap">
                                <img
                                  src="/images/button-arrow.svg"
                                  loading="lazy"
                                  width="20"
                                  height="20"
                                  alt="button-arrow"
                                  className="button-arrow"
                                />
                              </div>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hero-one-overlay-one overlay"></div>
                <div className="hero-one-overlay-two overlay"></div>
                <div className="hero-one-overlay-three overlay"></div>
              </div>
            </div>
          </div>
          <div className="display-none w-slider-arrow-left"></div>
          <div className="display-none w-slider-arrow-right"></div>
          <div className="display-none w-slider-nav w-round"></div>
        </div>
        <div
          data-w-id="a2bc9cf3-4395-f75a-76f6-5e8322781da5"
          style={{ opacity: 0 }}
          className="hero-one-bottom-section"
        >
          <div className="hero-one-bottom">
            <div className="counter-style-one">
              <div className="counter-numbers">
                <div className="single-number _01">
                  <div className="counter-number">1</div>
                  <div className="counter-number">1</div>
                  <div className="counter-number">2</div>
                  <div className="counter-number">3</div>
                  <div className="counter-number">4</div>
                  <div className="counter-number">5</div>
                  <div className="counter-number">6</div>
                  <div className="counter-number">7</div>
                  <div className="counter-number">8</div>
                  <div className="counter-number">1</div>
                </div>
                <div className="single-number _02">
                  <div className="counter-number">5</div>
                  <div className="counter-number">1</div>
                  <div className="counter-number">2</div>
                  <div className="counter-number">3</div>
                  <div className="counter-number">4</div>
                  <div className="counter-number">5</div>
                  <div className="counter-number">6</div>
                  <div className="counter-number">7</div>
                  <div className="counter-number">8</div>
                  <div className="counter-number">5</div>
                </div>
                <div className="single-number _01">
                  <div className="counter-number">1</div>
                  <div className="counter-number">1</div>
                  <div className="counter-number">2</div>
                  <div className="counter-number">3</div>
                  <div className="counter-number">4</div>
                  <div className="counter-number">5</div>
                  <div className="counter-number">6</div>
                  <div className="counter-number">7</div>
                  <div className="counter-number">8</div>
                  <div className="counter-number">1</div>
                </div>
                <div className="single-number">K</div>
                <div className="counter-one-icon">+</div>
              </div>
              <div className="text-style-h5">Active Members Globally</div>
            </div>
            <div className="hero-one-bottom-text display-none-767">
              Thousands of members worldwide are part of our co-working eco
              system.
            </div>
          </div>
          <div className="hero-one-bottom-curve"></div>
          <div className="hero-one-bottom-curve _02"></div>
        </div>
      </section>

      <section className="section-gap section-margin">
        <div
          data-w-id="318c8f49-211f-1422-d249-74397a9a3d1d"
          style={{ opacity: 0 }}
          className="client-logo-title"
        >
          1000+ Trusted Clients Over Worldwide
        </div>
        <div className="overflow-hidden">
          <div className="client-logo-one-box">
            <div className="client-logo-one-wrap">
              {[
                "01",
                "02",
                "03",
                "04",
                "05",
                "06",
                "02",
                "01",
                "03",
                "04",
                "05",
                "06",
              ].map((num, i) => (
                <div key={i} className="client-log-one">
                  <img
                    src={`/images/client-logo-${num}.svg`}
                    alt={`Client-logo-${num}`}
                    width="250"
                    height="50"
                    className="client-one-logo"
                  />
                </div>
              ))}
            </div>
            <div className="client-logo-one-wrap">
              {[
                "01",
                "02",
                "03",
                "04",
                "05",
                "06",
                "02",
                "01",
                "03",
                "04",
                "05",
                "06",
              ].map((num, i) => (
                <div key={i} className="client-log-one">
                  <img
                    src={`/images/client-logo-${num}.svg`}
                    alt={`Client-logo-${num}`}
                    width="250"
                    height="50"
                    className="client-one-logo"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-gap padding-top-0">
        <div className="w-layout-blockcontainer container w-container">
          <div className="home-one-about-columns">
            <div
              id="w-node-d265e082-f772-d40f-a7e7-8c0126914dad-5076cc8e"
              className="home-one-about-left-column"
            >
              <div className="heading-subtitle counter-three-heading">
                <div className="subtitle-head-wrap">
                  <div className="subtitle-left-icon"></div>
                  <div className="subtitle-head">Why Choose us</div>
                </div>
                <div className="heading-title-animation">
                  <h2 className="heading-title">
                    Our agency provides a comprehensive suite of marketing
                    growth.
                  </h2>
                  <div className="title-overlays">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        className={`text-title-overlay _${String(i + 1).padStart(2, "0")}`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="home-one-about1-inner-columns">
                <div className="home-one-about1-inner-left-column">
                  <div
                    data-w-id="7fb126df-d1c9-b3f7-50a5-f989a8a7c038"
                    style={{ opacity: 0 }}
                    className="home-one-about-one"
                  >
                    <div className="home-one-about-circle _02"></div>
                    <div className="home-one-about-circle"></div>
                    <div className="counter-style-two">
                      <div className="text-style-h4 white-text">
                        Monthly Traffic
                      </div>
                      <div className="counter-numbers two">
                        <div className="single-number _01">
                          {[3, 1, 2, 3, 4, 5, 6, 7, 8, 3].map((n, i) => (
                            <div key={i} className="counter-number">
                              {n}
                            </div>
                          ))}
                        </div>
                        <div className="single-number _02">
                          {[3, 1, 2, 3, 4, 5, 6, 7, 8, 3].map((n, i) => (
                            <div key={i} className="counter-number">
                              {n}
                            </div>
                          ))}
                        </div>
                        <div className="single-number">.</div>
                        <div className="single-number _01">
                          {[4, 1, 2, 3, 4, 5, 6, 7, 8, 4].map((n, i) => (
                            <div key={i} className="counter-number">
                              {n}
                            </div>
                          ))}
                        </div>
                        <div className="single-number secondary-text">K</div>
                      </div>
                    </div>
                    <div className="progress-bar home-one-progress">
                      <div className="progress-bar-title-wrap">
                        <div className="progress-bar-title">
                          Client Deliverables
                        </div>
                        <div className="progress-bar-title">80%</div>
                      </div>
                      <div className="progress-bar-outer">
                        <div className="progress-bar-inner"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="home-one-about1-inner-right-column">
                  <div className="home-one-about-center-wrap">
                    <div className="overflow-hidden">
                      <div
                        data-w-id="ead2f8d6-184f-e553-c540-4197acdeaadc"
                        style={{ opacity: 0 }}
                        className="home-one-about-text"
                      >
                        We are a passionate marketing agency dedicated to bold,
                        unforgettable brands. Through meaningful design
                        experiences and build lasting impact. Our work blends
                        strategy, innovation, and creativity to inspire growth.
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <div
                        data-w-id="3e9c9abb-a0df-1d27-454b-456ee1b54163"
                        style={{ opacity: 0 }}
                        className="button-wrap"
                      >
                        <a
                          href="/about"
                          data-wf--button--variant="secondary-bg"
                          data-w-id="8932a183-40ec-c216-e8b4-670b55f18dc8"
                          className="button-link w-inline-block"
                        >
                          <div className="button-hover-overlay"></div>
                          <div className="button-text-wrapper">
                            <div className="button-text-wrap">
                              <div className="button-text">Know More</div>
                              <div className="button-text-hover">Know More</div>
                            </div>
                          </div>
                          <div className="button-arrow-wrapper">
                            <div className="button-arrow-wrap">
                              <img
                                src="/images/button-arrow.svg"
                                loading="lazy"
                                width="20"
                                height="20"
                                alt="button-arrow"
                                className="button-arrow"
                              />
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                    <div className="icon-style-two-wrap">
                      <div
                        data-w-id="cb6a360d-4dc5-9606-63de-1514cd547fb8"
                        style={{ opacity: 0 }}
                        className="icon-style-two"
                      >
                        <div className="icon-style-two-icon-wrap">
                          <img
                            src="/images/icon-01.svg"
                            alt="icon-01"
                            className="icon-style-two-icon"
                          />
                        </div>
                        <div className="icon-style-two-content">
                          <div className="text-style-h3">
                            Sales &amp; marketing assets
                          </div>
                          <div>
                            This could include population data on age
                          </div>
                        </div>
                      </div>
                      <div
                        data-w-id="c565a597-d64c-e744-ee98-8a8fc709eb5f"
                        style={{ opacity: 0 }}
                        className="icon-style-two"
                      >
                        <div className="icon-style-two-icon-wrap">
                          <img
                            src="/images/icon-02.svg"
                            alt="icon-02"
                            className="icon-style-two-icon"
                          />
                        </div>
                        <div className="icon-style-two-content">
                          <div className="text-style-h3">
                            Innovative tech solutions
                          </div>
                          <div>
                            A market analysis provides information industries
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              id="w-node-a4c800e4-6942-376a-7926-d90e86ff12ae-5076cc8e"
              className="home-one-about-right-column"
            >
              <img
                className="about-image"
                src="/images/home1-about-01.jpg"
                width="auto"
                height="auto"
                alt="home1-about-01"
                style={{ opacity: 0 }}
                sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px, 100vw"
                data-w-id="3b901ac5-9a84-f166-a27e-0a2f8c45ec25"
                loading="lazy"
                srcSet="/images/home1-about-01-p-500.jpg 500w, /images/home1-about-01-p-800.jpg 800w, /images/home1-about-01.jpg 1300w"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="service-section section-gap">
        <div className="w-layout-blockcontainer container w-container">
          <div className="horizontal-heading-wrapper">
            <div className="subheading-wrapper">
              <div className="subtitle-head-wrap">
                <div className="subtitle-left-icon"></div>
                <div className="subtitle-head white-text">What We Offer</div>
              </div>
            </div>
            <div className="heading-wrapper horizontal-wrap padding-bottom-0">
              <div className="heading-subtitle">
                <div className="heading-title-animation">
                  <h2 className="heading-title service-heading">
                    We follow a clear strategy of investing in ‍high potential
                    real estate opportunities ‍growth.
                  </h2>
                  <div className="title-overlays">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        className={`text-title-overlay _${String(i + 1).padStart(2, "0")} global-bg`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="home-one-service-wrapper">
            <div className="home-one-service-wrap">
              <div className="service-one-list-wrap w-dyn-list">
                <div role="list" className="service-one-list w-dyn-items">
                  {[
                    {
                      href: "/services",
                      title: "Digital Marketing",
                      num: "{01}",
                      img: "service-img-01",
                      desc: "To become the most trusted partner for brands seeking digital transformation, brand reputation, and revenue growth.",
                    },
                    {
                      href: "/services",
                      title: "Advertising Services",
                      num: "{02}",
                      img: "service-img-02",
                      desc: "Targeted ad campaigns are created and managed across digital platforms to boost visibility, engagement.",
                    },
                    {
                      href: "/services",
                      title: "Performance Marketing",
                      num: "{03}",
                      img: "service-img-03",
                      desc: "Driven by data and analytics, campaigns are continuously optimized to deliver measurable results, improved efficiency.",
                    },
                    {
                      href: "/services",
                      title: "Lead Generation",
                      num: "{04}",
                      img: "service-img-04",
                      desc: "Qualified leads are captured through strategic funnels, paid media, and content designed to support business growth.",
                    },
                    {
                      href: "/services",
                      title: "Social Management",
                      num: "{05}",
                      img: "service-img-05",
                      desc: "Social channels are managed with planned content, active engagement to strengthen brand presence",
                    },
                  ].map((service, i) => (
                    <div
                      key={i}
                      role="listitem"
                      className="service-one w-dyn-item"
                    >
                      <a
                        data-w-id="aa8c28b1-5c6b-2155-df4f-2486fefb32a7"
                        href={service.href}
                        className="service-one-wrap w-inline-block"
                      >
                        <div className="home-one-service-text-wrap">
                          <div
                            style={{ opacity: 0 }}
                            className="home-one-service-text"
                          >
                            {service.desc}
                          </div>
                        </div>
                        <div className="service-one-heading-wrap">
                          <div className="service-one-contents">
                            <img
                              src="/images/secondary-left-icon.svg"
                              loading="lazy"
                              style={{
                                display: "block",
                                transform:
                                  "translate3d(-60px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                opacity: 0,
                              }}
                              alt="secondary-left-icon"
                              className="service-one-icon"
                            />
                            <div
                              style={{
                                transform:
                                  "translate3d(0px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                              }}
                              className="service-one-title-number-wrap"
                            >
                              <div className="service-one-title-wrap">
                                <div
                                  style={{ color: "rgba(255,255,255,0.4)" }}
                                  className="service-one-title"
                                >
                                  {service.title}
                                </div>
                                <div className="home-one-service-text two">
                                  {service.desc}
                                </div>
                              </div>
                              <div
                                style={{ color: "rgba(255,255,255,0.4)" }}
                                className="service-one-number"
                              >
                                {service.num}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{
                              transform:
                                "translate3d(0, -30%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                              opacity: 0,
                            }}
                            className="service-one-image-wrap"
                          >
                            <img
                              src={`/images/${service.img}.jpg`}
                              loading="lazy"
                              alt={service.img}
                              sizes="100vw"
                              srcSet={`/images/${service.img}-p-500.jpg 500w, /images/${service.img}-p-800.jpg 800w, /images/${service.img}-p-1080.jpg 1080w, /images/${service.img}.jpg 1520w`}
                              className="service-one-image"
                            />
                          </div>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
              <div
                data-w-id="53b52da4-c64e-e83c-d859-1857c45619c0"
                style={{ opacity: 0 }}
                className="button-wrap service-style-one-button"
              >
                <a
                  href="/services"
                  data-wf--button--variant="secondary-bg"
                  data-w-id="8932a183-40ec-c216-e8b4-670b55f18dc8"
                  className="button-link w-inline-block"
                >
                  <div className="button-hover-overlay"></div>
                  <div className="button-text-wrapper">
                    <div className="button-text-wrap">
                      <div className="button-text">View All Services</div>
                      <div className="button-text-hover">View All Services</div>
                    </div>
                  </div>
                  <div className="button-arrow-wrapper">
                    <div className="button-arrow-wrap">
                      <img
                        src="/images/button-arrow.svg"
                        loading="lazy"
                        width="20"
                        height="20"
                        alt="button-arrow"
                        className="button-arrow"
                      />
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="service-overlay"></div>
        <div className="service-overlay _02"></div>
        <div className="service-overlay _03"></div>
      </section>

      <section className="section-gap">
        <div className="w-layout-blockcontainer container position-relative w-container">
          <div className="counter-heading-contents">
            <div className="heading-subtitle counter-three-heading">
              <div className="subtitle-head-wrap">
                <div className="subtitle-left-icon"></div>
                <div className="subtitle-head">Why Choose us</div>
              </div>
              <div className="heading-title-animation">
                <h2 className="heading-title">
                  Our agency is dedicated to boosting your brand&apos;s reach,
                  generating quality leads
                </h2>
                <div className="title-overlays">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className={`text-title-overlay _${String(i + 1).padStart(2, "0")}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="counter-heading-columns">
              <div
                data-w-id="78f17ef5-e5f5-54b2-3f46-2a95b252cb8f"
                style={{
                  WebkitTransform:
                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                  MozTransform:
                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                  msTransform:
                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                  transform:
                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                  opacity: 0,
                }}
                className="counter-heading-left-column"
              >
                <div className="button-wrap">
                  <a
                    href="/contact"
                    data-wf--button--variant="secondary-bg"
                    data-w-id="8932a183-40ec-c216-e8b4-670b55f18dc8"
                    className="button-link w-inline-block"
                  >
                    <div className="button-hover-overlay"></div>
                    <div className="button-text-wrapper">
                      <div className="button-text-wrap">
                        <div className="button-text">Read More</div>
                        <div className="button-text-hover">Read More</div>
                      </div>
                    </div>
                    <div className="button-arrow-wrapper">
                      <div className="button-arrow-wrap">
                        <img
                          src="/images/button-arrow.svg"
                          loading="lazy"
                          width="20"
                          height="20"
                          alt="button-arrow"
                          className="button-arrow"
                        />
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              <div
                id="w-node-_78f17ef5-e5f5-54b2-3f46-2a95b252cb93-5076cc8e"
                data-w-id="78f17ef5-e5f5-54b2-3f46-2a95b252cb93"
                style={{
                  WebkitTransform:
                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                  MozTransform:
                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                  msTransform:
                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                  transform:
                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                  opacity: 0,
                }}
                className="counter-heading-right-column"
              >
                <div className="heading-subtitle">
                  <div className="heading-subheading-desc-wrap">
                    <div className="heading-subheading-desc">
                      We don&apos;t just design. We build experiences that tell
                      a story and leave a lasting impression. Take a closer look
                      at our selected work.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            data-w-id="78f17ef5-e5f5-54b2-3f46-2a95b252cb98"
            style={{
              WebkitTransform:
                "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
              MozTransform:
                "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
              msTransform:
                "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
              transform:
                "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
              opacity: 0,
            }}
            className="counter-style-three-wrap"
          >
            {[
              {
                title: "Trusted Use",
                nums1: [4, 1, 2, 3, 4, 5, 6, 7, 8, 4],
                nums2: [5, 1, 2, 3, 4, 5, 6, 7, 8, 5],
                nums3: [0, 1, 2, 3, 4, 5, 6, 7, 8, 0],
                icon: "+",
                img: "counter-style-three-img-01",
              },
              {
                title: "Positive Reviews",
                nums1: [2, 1, 2, 3, 4, 5, 6, 7, 8, 2],
                nums2: [5, 1, 2, 3, 4, 5, 6, 7, 8, 5],
                nums3: null,
                icon: "k",
                img: "counter-style-three-img-02",
              },
              {
                title: "Cover Marketing",
                nums1: [1, 1, 2, 3, 4, 5, 6, 7, 8, 1],
                nums2: [1, 1, 2, 3, 4, 5, 6, 7, 8, 1],
                nums3: [0, 1, 2, 3, 4, 5, 6, 7, 8, 0],
                icon: "+",
                img: "counter-style-three-img-03",
              },
            ].map((counter, i) => (
              <div key={i} className="counter-style-three">
                <div className="icon-style-three-counter-wrap">
                  <div className="counter-three-title">{counter.title}</div>
                  <div className="icon-style-three-number-wrap">
                    <div className="counter-numbers three">
                      <div className="single-number _01">
                        {counter.nums1.map((n, j) => (
                          <div key={j} className="counter-number">
                            {n}
                          </div>
                        ))}
                      </div>
                      <div className="single-number _02">
                        {counter.nums2.map((n, j) => (
                          <div key={j} className="counter-number">
                            {n}
                          </div>
                        ))}
                      </div>
                      {counter.nums3 && (
                        <div className="single-number _01">
                          {counter.nums3.map((n, j) => (
                            <div key={j} className="counter-number">
                              {n}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="counter-one-icon">{counter.icon}</div>
                    </div>
                  </div>
                </div>
                <img
                  src={`/images/${counter.img}.jpg`}
                  loading="lazy"
                  sizes="100vw"
                  srcSet={`/images/${counter.img}-p-500.jpg 500w, /images/${counter.img}.jpg 680w`}
                  alt={counter.img}
                  className="icon-style-three-img"
                />
              </div>
            ))}
          </div>
          <div
            data-w-id="78f17ef5-e5f5-54b2-3f46-2a95b252cc5c"
            className="icon-style-eight"
          >
            <div className="icon-style-one-image-wrap">
              <img
                src="/images/icon-style-01-01.avif"
                alt="icon-style-01-01"
                className="icon-style-one-image _01"
              />
              <img
                src="/images/icon-style-01-02.avif"
                alt="icon-style-01-02"
                className="icon-style-one-image"
              />
              <div className="icon-style-one-image">
                <img
                  src="/images/down-left.svg"
                  loading="lazy"
                  alt="down-left"
                  className="icon-style-eight-image"
                />
              </div>
            </div>
            <div className="icon-style-eight-desc">
              Since 2011, we&apos;ve been helping and people grow through
              innovation.
            </div>
          </div>
          <img
            src="/images/counter-three-bg-pattern.png"
            loading="lazy"
            data-w-id="764f8099-87da-861c-d705-882ec8d5310a"
            alt="counter-three-bg-pattern"
            className="counter-three-bg-pattern"
          />
        </div>
      </section>

      <section className="project-section section-gap section-margin">
        <div className="w-layout-blockcontainer container w-container">
          <div
            data-w-id="864277dd-ad4a-e49d-db64-b83731d65738"
            className="project-height"
          >
            <div className="project-one-sticky">
              <img
                src="/images/footer-bg.png"
                loading="lazy"
                sizes="100vw"
                srcSet="/images/footer-bg-p-500.png 500w, /images/footer-bg.png 673w"
                alt="Footer-bg"
                className="project-one-bg-image"
              />
              <div className="project-one-wrap">
                <div className="project-one-heading-wrap">
                  <div>
                    <div className="heading-subtitle">
                      <div className="subtitle-head-wrap">
                        <div className="subtitle-left-icon"></div>
                        <div className="subtitle-head">Our projects</div>
                      </div>
                      <div className="heading-title-animation">
                        <h2 className="heading-title big">Latest work</h2>
                        <div className="title-overlay light-bg"></div>
                      </div>
                    </div>
                  </div>
                  <div
                    data-w-id="17138b3a-19fd-3781-74aa-79754375776d"
                    style={{ opacity: 0 }}
                    className="project-one-date-wrapper display-none-991"
                  >
                    <div className="project-one-date _01">08.2025</div>
                    <div className="project-one-date _02">10.2025</div>
                    <div className="project-one-date _03">12.2025</div>
                    <div className="project-one-date _04">04.2025</div>
                  </div>
                </div>
                <div className="project-one display-none-991">
                  <div className="project-one-left-column">
                    <div
                      data-w-id="a05e4763-ccac-82a1-bd57-86a1268c3b52"
                      style={{ opacity: 0 }}
                      className="project-one-desc-wrap"
                    >
                      <div className="project-one-desc _01">
                        We don&apos;t just design. We build experiences that
                        tell a story and leave a lasting impression.
                      </div>
                      <div className="project-one-desc _02">
                        From insight to execution, we design experiences that
                        strengthen brands and deliver value.
                      </div>
                      <div className="project-one-desc _03">
                        Smart marketing is more than visuals—it&apos;s about
                        influence and performance.
                      </div>
                      <div className="project-one-desc _04">
                        Great brands are built on meaningful experiences that
                        connect and perform.
                      </div>
                    </div>
                  </div>
                  <div
                    data-w-id="29c9a259-6cf6-043b-95da-2046207897f4"
                    style={{ opacity: 0 }}
                    className="project-one-center-column"
                  >
                    <div className="project-one-image-wrap">
                      <img
                        src="/images/project-01.jpg"
                        loading="lazy"
                        alt="project-01"
                        className="project-one-image _01"
                      />
                      <img
                        src="/images/project-02.jpg"
                        alt="project-02"
                        className="project-one-image _02"
                      />
                      <img
                        src="/images/project-03.jpg"
                        alt="project-03"
                        className="project-one-image _03"
                      />
                      <img
                        src="/images/project-04.jpg"
                        alt="project-04"
                        className="project-one-image _04"
                      />
                    </div>
                  </div>
                  <div className="project-one-right-column">
                    <div
                      data-w-id="6b28a062-b83c-f3d3-6236-521a12aaed98"
                      style={{ opacity: 0 }}
                      className="project-one-title-wrap"
                    >
                      <div className="project-one-title _01">
                        Content marketing
                      </div>
                      <div className="project-one-title _02">
                        Revenue Optimization
                      </div>
                      <div className="project-one-title _03">
                        Campaign management
                      </div>
                      <div className="project-one-title _04">
                        Engagement Growth
                      </div>
                    </div>
                    <div
                      data-w-id="4ed3d0c4-87c9-fdd8-f9c1-c8bdee19c68e"
                      style={{ opacity: 0 }}
                      className="button-wrap"
                    >
                      <a
                        href="/portfolio"
                        data-wf--button--variant="secondary-bg"
                        data-w-id="8932a183-40ec-c216-e8b4-670b55f18dc8"
                        className="button-link w-inline-block"
                      >
                        <div className="button-hover-overlay"></div>
                        <div className="button-text-wrapper">
                          <div className="button-text-wrap">
                            <div className="button-text">View all Projects</div>
                            <div className="button-text-hover">
                              View all Projects
                            </div>
                          </div>
                        </div>
                        <div className="button-arrow-wrapper">
                          <div className="button-arrow-wrap">
                            <img
                              src="/images/button-arrow.svg"
                              loading="lazy"
                              width="20"
                              height="20"
                              alt="button-arrow"
                              className="button-arrow"
                            />
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gap">
        <div className="w-layout-blockcontainer container w-container">
          <div className="team-wrap">
            <div className="team-one-grid">
              <div
                data-w-id="0341cf5b-1e34-64ca-6947-69c3ea8937e6"
                style={{
                  WebkitTransform:
                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                  MozTransform:
                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                  msTransform:
                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                  transform:
                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                  opacity: 0,
                }}
                className="team-one-column"
              >
                <div className="team-one w-dyn-list">
                  <div role="list" className="team-one-list w-dyn-items">
                    {[
                      {
                        href: "/team/ronald-benson",
                        name: "Ronald Benson",
                        role: "Worker",
                        img: "team-img-01",
                      },
                      {
                        href: "/team/heanri-dokanai",
                        name: "Heanri Dokanai",
                        role: "Founder",
                        img: "team-img-02",
                      },
                      {
                        href: "/team/robert-jhonson",
                        name: "Robert Jhonson",
                        role: "Co-CEO",
                        img: "team-img-03",
                      },
                    ].map((member, i) => (
                      <div
                        key={i}
                        role="listitem"
                        className="team-one-item w-dyn-item"
                      >
                        <div className="team-one-wrap">
                          <a
                            href={member.href}
                            className="team-one-image-wrap w-inline-block"
                          >
                            <img
                              alt="Team Image"
                              loading="lazy"
                              src={`/images/${member.img}.jpg`}
                              sizes="100vw"
                              srcSet={`/images/${member.img}-p-500.jpg 500w, /images/${member.img}.jpg 800w`}
                              className="team-one-preview"
                            />
                          </a>
                          <div className="team-one-inner">
                            <div className="team-one-title-wrap">
                              <div
                                data-w-id="b8be9552-a1c8-561f-73a6-fb73b0d59132"
                                style={{
                                  WebkitTransform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  MozTransform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  msTransform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  transform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  opacity: 0,
                                }}
                              >
                                <a
                                  href={member.href}
                                  className="text-style-h2"
                                >
                                  {member.name}
                                </a>
                              </div>
                              <div className="team-one-social-link-ul">
                                {[0, 1, 2].map((j) => (
                                  <div
                                    key={j}
                                    style={{
                                      WebkitTransform:
                                        "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                      MozTransform:
                                        "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                      msTransform:
                                        "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                      transform:
                                        "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                      opacity: 0,
                                    }}
                                  >
                                    <a
                                      href="https://www.facebook.com/"
                                      className="team-one-social-link w-inline-block"
                                    >
                                      <div className="meta-one-icons"></div>
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="team-one-link-wrap">
                              <div
                                style={{
                                  WebkitTransform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  MozTransform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  msTransform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  transform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  opacity: 0,
                                }}
                                className="team-one-category-wrap"
                              >
                                <div className="category">(</div>
                                <div className="category">{member.role}</div>
                                <div className="category">)</div>
                              </div>
                              <div
                                style={{
                                  WebkitTransform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  MozTransform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  msTransform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  transform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  opacity: 0,
                                }}
                              >
                                <a
                                  href={member.href}
                                  className="team-one-link w-inline-block"
                                >
                                  <img
                                    src="/images/down-left.svg"
                                    loading="lazy"
                                    alt="down-left"
                                    className="team-one-link-icon"
                                  />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div
                id="w-node-_0341cf5b-1e34-64ca-6947-69c3ea893806-5076cc8e"
                className="team-one-center-column"
              >
                <div
                  data-w-id="0341cf5b-1e34-64ca-6947-69c3ea893807"
                  style={{
                    WebkitTransform:
                      "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                    MozTransform:
                      "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                    msTransform:
                      "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                    transform:
                      "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                    opacity: 0,
                  }}
                  className="heading-subtitle center"
                >
                  <div className="subtitle-head-wrap">
                    <div className="subtitle-left-icon"></div>
                    <div className="subtitle-head">Marketing professional</div>
                  </div>
                  <div className="heading-title-animation">
                    <h2 className="heading-title team-heading">Skilled Team</h2>
                    <div className="title-overlay bg-white"></div>
                  </div>
                </div>
                <div
                  data-w-id="0341cf5b-1e34-64ca-6947-69c3ea893810"
                  style={{
                    WebkitTransform:
                      "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                    MozTransform:
                      "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                    msTransform:
                      "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                    transform:
                      "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                    opacity: 0,
                  }}
                  className="team-scroll-wrap display-none-767"
                >
                  <img
                    src="/images/arrow-global.svg"
                    loading="lazy"
                    alt="arrow-global"
                    className="team-down-arrow"
                  />
                  <div className="text-style-h4">Scroll Down</div>
                </div>
              </div>
              <div
                data-w-id="0341cf5b-1e34-64ca-6947-69c3ea89387a"
                style={{
                  WebkitTransform:
                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                  MozTransform:
                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                  msTransform:
                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                  transform:
                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                  opacity: 0,
                }}
                className="team-one-column"
              >
                <div className="team-one w-dyn-list">
                  <div role="list" className="team-one-list w-dyn-items">
                    {[
                      {
                        href: "/team/marko-daniel",
                        name: "Marko Daniel",
                        role: "Head Engineer",
                        img: "team-img-04",
                      },
                      {
                        href: "/team/sony-miltar",
                        name: "Sony Miltar",
                        role: "Marketing Manager",
                        img: "team-img-05",
                      },
                      {
                        href: "/team/jake-nicholson",
                        name: "Jake Nicholson",
                        role: "Director",
                        img: "team-img-06",
                      },
                    ].map((member, i) => (
                      <div
                        key={i}
                        role="listitem"
                        className="team-one-item w-dyn-item"
                      >
                        <div className="team-one-wrap">
                          <a
                            href={member.href}
                            className="team-one-image-wrap w-inline-block"
                          >
                            <img
                              alt="Team Image"
                              loading="lazy"
                              src={`/images/${member.img}.jpg`}
                              sizes="100vw"
                              srcSet={`/images/${member.img}-p-500.jpg 500w, /images/${member.img}.jpg 800w`}
                              className="team-one-preview"
                            />
                          </a>
                          <div className="team-one-inner">
                            <div className="team-one-title-wrap">
                              <div
                                style={{
                                  WebkitTransform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  MozTransform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  msTransform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  transform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  opacity: 0,
                                }}
                              >
                                <a
                                  href={member.href}
                                  className="text-style-h2"
                                >
                                  {member.name}
                                </a>
                              </div>
                              <div className="team-one-social-link-ul">
                                {[0, 1, 2].map((j) => (
                                  <div
                                    key={j}
                                    style={{
                                      WebkitTransform:
                                        "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                      MozTransform:
                                        "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                      msTransform:
                                        "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                      transform:
                                        "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                      opacity: 0,
                                    }}
                                  >
                                    <a
                                      href="https://www.facebook.com/"
                                      className="team-one-social-link w-inline-block"
                                    >
                                      <div className="meta-one-icons"></div>
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="team-one-link-wrap">
                              <div
                                style={{
                                  WebkitTransform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  MozTransform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  msTransform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  transform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  opacity: 0,
                                }}
                                className="team-one-category-wrap"
                              >
                                <div className="category">(</div>
                                <div className="category">{member.role}</div>
                                <div className="category">)</div>
                              </div>
                              <div
                                style={{
                                  WebkitTransform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  MozTransform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  msTransform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  transform:
                                    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                                  opacity: 0,
                                }}
                              >
                                <a
                                  href={member.href}
                                  className="team-one-link w-inline-block"
                                >
                                  <img
                                    src="/images/down-left.svg"
                                    loading="lazy"
                                    alt="down-left"
                                    className="team-one-link-icon"
                                  />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {homeExtraSections.map((s, i) => (
        <section
          key={i}
          className={s.cls}
          dangerouslySetInnerHTML={{ __html: s.inner }}
        />
      ))}
      <Footer />
    </>
  );
}

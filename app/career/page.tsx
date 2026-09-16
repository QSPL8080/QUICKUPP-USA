import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Career | Mercket - Webflow HTML website template",
  description:
    "Build, create, and succeed with a team that values innovation and excellence.",
};

const careerJobs = [
  { category: "Opportunity", title: "Frontend Developer", type: "Community", price: "$20/hour" },
  { category: "Role", title: "Frontend Developer", type: "Engagement", price: "$25/hour" },
  { category: "Focus", title: "Data Warehouse Specialist", type: "Research", price: "$10/hour" },
  { category: "Position", title: "Data Warehouse Specialist", type: "Analytical", price: "$30/hour" },
  { category: "Track", title: "Quantitative Analyst", type: "Learning", price: "$35/hour" },
  { category: "Category", title: "Quantitative Analyst", type: "Volunteering", price: "$15/hour" },
];

export default function CareerPage() {
  return (
    <>
      <Header />
      <section className="breadcrumb-section _03">
        <div className="w-layout-blockcontainer container-large w-container">
          <div className="breadcrumb-wrap">
            <div className="breadcrumb-title-animation">
              <h2 className="breadcrumb-heading-title">Grow With Us</h2>
            </div>
          </div>
          <div className="breadcrumb-bottom-content">
            <div className="breadcrumb-pages-map">
              <div className="breadcrumb-pages-text-wrap">
                <a href="#" className="breadcrumb-pages-text underline">
                  Home
                </a>
                <div className="dashed">/</div>
              </div>
              <div className="breadcrumb-pages-text">Career</div>
            </div>
            <div className="breadcrumb-desc-wrap">
              <div className="breadcrumb-desc">
                Build, create, and succeed with a team that values innovation
                and excellence.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gap">
        <div className="w-layout-blockcontainer container w-container">
          <div className="home-one-about-flex">
            <div className="home-about-left-column">
              <div
                data-w-id="c36e9af9-7497-c82f-2262-36ce86c181d4"
                style={{ opacity: 0 }}
                className="home-about-left-column-inner"
              ></div>
            </div>
            <div className="home-about-right-column">
              <div className="home-one-about-inner">
                <div className="home-about-heading">
                  <div className="heading-subtitle">
                    <div className="subtitle-head-wrap">
                      <div className="subtitle-left-icon"></div>
                      <div className="subtitle-head">Performance driven</div>
                    </div>
                    <div className="heading-title-animation">
                      <h2 className="heading-title">
                        We create impactful marketing and advertising solutions
                        that help brands.
                      </h2>
                      <div className="title-overlays">
                        {Array.from({ length: 10 }, (_, i) => (
                          <div
                            key={i}
                            className={`text-title-overlay _0${i + 1}`}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <div
                      data-w-id="c36e9af9-7497-c82f-2262-36ce86c181eb"
                      style={{ opacity: 0 }}
                      className="button-wrap"
                    >
                      <a
                        href="/contact"
                        data-wf--button--variant="global-bg"
                        data-w-id="8932a183-40ec-c216-e8b4-670b55f18dc8"
                        className="button-link w-inline-block"
                      >
                        <div className="button-hover-overlay w-variant-0684220c-96fe-5662-c5e3-017642cf4120"></div>
                        <div className="button-text-wrapper w-variant-0684220c-96fe-5662-c5e3-017642cf4120">
                          <div className="button-text-wrap">
                            <div className="button-text">Contact Us</div>
                            <div className="button-text-hover">Contact Us</div>
                          </div>
                        </div>
                        <div className="button-arrow-wrapper w-variant-0684220c-96fe-5662-c5e3-017642cf4120">
                          <div className="button-arrow-wrap">
                            <img
                              src="/images/button-arrow.svg"
                              loading="lazy"
                              width="20"
                              height="20"
                              alt="button-arrow"
                              className="button-arrow w-variant-0684220c-96fe-5662-c5e3-017642cf4120"
                            />
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="icon-style-four-wrap">
                  <div
                    data-w-id="c36e9af9-7497-c82f-2262-36ce86c181ef"
                    style={{ opacity: 0 }}
                    className="icon-style-four"
                  >
                    <div className="icon-style-four-icon-wrap">
                      <img
                        src="/images/icon-02.svg"
                        loading="lazy"
                        alt="icon-02"
                        className="icon-style-five-icon"
                      />
                    </div>
                    <div className="icon-style-four-content">
                      <div className="text-style-h4">
                        Tailored Solutions
                        <br />
                      </div>
                      <div>
                        Where the future of energy is not just a concept
                        it&apos;s our mission.
                      </div>
                    </div>
                  </div>
                  <div
                    data-w-id="c36e9af9-7497-c82f-2262-36ce86c181f8"
                    style={{ opacity: 0 }}
                    className="icon-style-four"
                  >
                    <div className="icon-style-four-icon-wrap">
                      <img
                        src="/images/icon-03.svg"
                        loading="lazy"
                        alt="icon-03"
                        className="icon-style-five-icon"
                      />
                    </div>
                    <div className="icon-style-four-content">
                      <div className="text-style-h4">Communication</div>
                      <div>
                        Where messaging drives clarity, confidence, and
                        measurable impact.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gap section-margin padding-top-0">
        <div className="client-logo-title">
          1000+ Trusted Clients Over Worldwide
        </div>
        <div className="overflow-hidden">
          <div className="client-logo-one-box">
            {[0, 1].map((row) => (
              <div key={row} className="client-logo-one-wrap">
                {["01", "02", "03", "04", "05", "06", "02", "01", "03", "04", "05", "06"].map(
                  (num, i) => (
                    <div key={i} className="client-log-one">
                      <img
                        src={`/images/client-logo-${num}.svg`}
                        alt={`Client-logo-${num}`}
                        className="client-one-logo"
                      />
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-gap padding-top-0">
        <div className="w-layout-blockcontainer container w-container">
          <div className="career-section-wrapper">
            <div>
              <div className="subtitle-head-wrap">
                <div className="subtitle-left-icon"></div>
                <div className="subtitle-head">Career choice</div>
              </div>
            </div>
            <div className="career-heading-wrap">
              <div className="heading-title-animation">
                <h2 className="heading-title career-heading">
                  We provide growth focused opportunities
                </h2>
                <div className="title-overlays">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className={`text-title-overlay _0${i + 1}`}
                    ></div>
                  ))}
                </div>
              </div>
              <div
                data-w-id="7556e2b0-4d1b-adf3-6c3f-0a372366d85e"
                className="icon-style-one career-page"
              >
                <div className="icon-style-one-image-wrap">
                  <img
                    src="/images/icon-style-01-03.avif"
                    loading="lazy"
                    style={{ opacity: 0 }}
                    data-w-id="7556e2b0-4d1b-adf3-6c3f-0a372366d860"
                    alt="icon-style-01-03"
                    className="icon-style-one-image _01"
                  />
                  <img
                    src="/images/icon-style-01-04.avif"
                    loading="lazy"
                    style={{ opacity: 0 }}
                    data-w-id="7556e2b0-4d1b-adf3-6c3f-0a372366d861"
                    alt="icon-style-01-04"
                    className="icon-style-one-image"
                  />
                  <div
                    data-w-id="7556e2b0-4d1b-adf3-6c3f-0a372366d862"
                    style={{ opacity: 0 }}
                    className="icon-style-one-image text-style-h4"
                  >
                    25k
                  </div>
                </div>
                <div
                  data-w-id="7556e2b0-4d1b-adf3-6c3f-0a372366d864"
                  style={{ opacity: 0 }}
                  className="icon-one-desc"
                >
                  Since 2011, we&apos;ve been helping and people grow through
                  innovation.
                </div>
              </div>
            </div>
            <div
              id="w-node-b2f6045f-ee01-8dbf-5356-0d6dd6071b08-5076cc9d"
              className="career-book"
            >
              <div
                data-w-id="e16db46f-31ef-b861-940b-d8973f21bc58"
                style={{ opacity: 0 }}
                className="career-book-wrapper"
              >
                <div className="career-book-image-wrap">
                  <img
                    src="/images/faq-man.jpg"
                    loading="lazy"
                    alt="faq-man"
                    className="career-book-image"
                  />
                </div>
                <div>
                  <div
                    data-w-id="91b72ee0-c2bf-55d3-32b3-94a7fb2a0ed9"
                    style={{ opacity: 0 }}
                    className="text-style-h4"
                  >
                    Need a quick walkthrough?
                  </div>
                  <div
                    data-w-id="e16db46f-31ef-b861-940b-d8973f21bc68"
                    style={{ opacity: 0 }}
                    className="career-desc"
                  >
                    or email us your queries at{" "}
                    <a
                      href="mailto:example@pbmit.com"
                      className="underline-link"
                    >
                      example@pbmit.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="career-wrapper">
              {careerJobs.map((job, i) => (
                <div
                  key={i}
                  style={{ opacity: 0 }}
                  className="career-wrap"
                >
                  <div className="career-left-column">
                    <div className="career-category-wrap">
                      <div className="category">(</div>
                      <div className="category">{job.category}</div>
                      <div className="category">)</div>
                    </div>
                    <div className="career-text">{job.title}</div>
                  </div>
                  <div className="career-right-column">
                    <div className="career-subtitle">{job.type}</div>
                    <div className="career-price">{job.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

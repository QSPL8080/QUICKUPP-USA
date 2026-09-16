import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Faq | Mercket - Webflow HTML website template",
  description:
    "Find quick answers to common questions about our services and process.",
};

const faqItems = [
  {
    tab: "Tab 1",
    question: "What industries do you provide services for?",
    answer:
      "We work across multiple industries including startups, technology, finance and professional services. Our strategies are tailored to each market's audience and competitive landscape to ensure relevance and scalability.",
  },
  {
    tab: "Tab 2",
    question: "What budget do I need for paid advertising?",
    answer:
      "Budgets depend on your goals, platforms, and target audience. We help define a cost-effective starting point that aligns with your objectives and resources. Spend is optimized to maximize conversions and ROI.",
  },
  {
    tab: "Tab 3",
    question: "Can you optimize my existing ad campaigns?",
    answer:
      "Yes, we audit your current campaigns to review structure, targeting, and creatives. We identify gaps, inefficiencies, and opportunities for improvement. Campaigns are refined using data-driven insights and testing.",
  },
  {
    tab: "Tab 4",
    question: "Do you offer branding or rebranding services?",
    answer:
      "Yes, we provide complete branding and rebranding solutions. This includes brand strategy, visual identity, and messaging alignment. Rebranding focuses on clarity, relevance, and market positioning.",
  },
  {
    tab: "Tab 5",
    question: "How long does the branding process take?",
    answer:
      "Timelines vary based on project scope and brand requirements. Most branding projects are completed within four to eight weeks. Clear milestones help keep the process efficient and transparent.",
  },
  {
    tab: "Tab 6",
    question: "Do you provide SEO and social media marketing?",
    answer:
      "Yes, we offer SEO and social media marketing services. Our approach includes content strategy, optimization, and ongoing performance tracking. These services are designed to improve engagement, and organic growth",
  },
  {
    tab: "Tab 7",
    question: "Will you manage my social media accounts?",
    answer:
      "Yes, we manage content planning, posting, and audience engagement. All content is aligned with your brand voice and business goals. Performance is monitored and optimized on a regular basis.",
  },
];

const transformStyle = {
  WebkitTransform:
    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
  MozTransform:
    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
  msTransform:
    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
  transform:
    "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
  opacity: 0,
};

export default function FaqPage() {
  return (
    <>
      <Header />
      <section className="breadcrumb-section _04">
        <div className="w-layout-blockcontainer container-large w-container">
          <div className="breadcrumb-wrap">
            <div className="breadcrumb-title-animation">
              <h2 className="breadcrumb-heading-title">Quick Answers</h2>
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
              <div className="breadcrumb-pages-text">Faq</div>
            </div>
            <div className="breadcrumb-desc-wrap">
              <div className="breadcrumb-desc">
                Find quick answers to common questions about our services and
                process.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gap padding-bottom-0">
        <div className="w-layout-blockcontainer container w-container">
          <div className="home-two-faq-wrapper">
            <div className="faq-book-section">
              <div
                data-w-id="09755a03-2709-aa98-0417-fc22927bf2d2"
                style={transformStyle}
                className="faq-book-wrapper"
              >
                <div className="faq-book-wrap">
                  <div className="faq-book-image-wrap">
                    <img
                      src="/images/faq-man.jpg"
                      alt="faq-man"
                      style={transformStyle}
                      data-w-id="09755a03-2709-aa98-0417-fc22927bf2d5"
                      className="faq-book-image"
                    />
                  </div>
                  <div className="faq-book-content">
                    <div
                      data-w-id="09755a03-2709-aa98-0417-fc22927bf2d7"
                      style={transformStyle}
                      className="text-style-h2"
                    >
                      Need a quick walkthrough?
                    </div>
                    <div
                      data-w-id="09755a03-2709-aa98-0417-fc22927bf2d9"
                      style={transformStyle}
                    >
                      Book a call with Adam, our dedicated Customer Success
                      Representative, and discover how our solutions can
                      accelerate your business growth.
                      <br />
                      <br />
                      Adam will walk you through the process, answer your
                      questions.
                    </div>
                  </div>
                </div>
                <div className="faq-book-bottom">
                  <div data-w-id="09755a03-2709-aa98-0417-fc22927bf2df" style={transformStyle}>
                    <a
                      href="/contact"
                      data-wf--button--variant="secondary-bg"
                      data-w-id="8932a183-40ec-c216-e8b4-670b55f18dc8"
                      className="button-link w-inline-block"
                    >
                      <div className="button-hover-overlay"></div>
                      <div className="button-text-wrapper">
                        <div className="button-text-wrap">
                          <div className="button-text">Book a call</div>
                          <div className="button-text-hover">Book a call</div>
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
                  <div
                    data-w-id="09755a03-2709-aa98-0417-fc22927bf2e2"
                    style={transformStyle}
                    className="faq-bottom-desc"
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
            <div className="faq-page-wrapper">
              <div
                data-current="Tab 1"
                data-easing="ease"
                data-duration-in="300"
                data-duration-out="100"
                className="accordian-style-one w-tabs"
              >
                <div className="accordian-list w-tab-menu">
                  {faqItems.map((faq, i) => (
                    <a
                      key={i}
                      data-w-tab={faq.tab}
                      className={`accordian-wrapper w-inline-block w-tab-link${i === 0 ? " w--current" : ""}`}
                    >
                      <div style={transformStyle} className="accordian-wrap">
                        <div className="accordian-title-wrap">
                          <div className="text-style-h3">{faq.question}</div>
                          <div className="accordian-icon-wrap">
                            <img
                              src="/images/down-left.png"
                              loading="lazy"
                              alt="down-left"
                              className="accordian-icon"
                            />
                          </div>
                        </div>
                        <div className="accordian-desc-wrap">
                          <div className="accordian-desc">{faq.answer}</div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                <div className="display-none w-tab-content">
                  {faqItems.map((faq, i) => (
                    <div
                      key={i}
                      data-w-tab={faq.tab}
                      className={`w-tab-pane${i === 0 ? " w--tab-active" : ""}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="client-logo-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="client-logo-title-wrap">
            <div
              data-w-id="e1e46951-7325-1827-fe42-f5baf4e9f268"
              style={transformStyle}
              className="client-logo-title"
            >
              1000+ Trusted Clients Over Worldwide
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="client-logo-one-box border-none">
              {[0, 1].map((row) => (
                <div key={row} className="client-logo-one-wrap">
                  {["01", "02", "03", "04", "05", "06", "02", "01", "03", "04", "05", "06"].map(
                    (num, i) => (
                      <div key={i} className="client-log-one">
                        <img
                          src={`/images/client-logo-${num}.svg`}
                          loading="lazy"
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
        </div>
      </section>

      <Footer />
    </>
  );
}

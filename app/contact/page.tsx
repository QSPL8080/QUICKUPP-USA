import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact | Mercket - Webflow HTML website template",
  description:
    "A professional consultant Webflow theme built for business advisors, coaches, and consulting firms.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <section className="breadcrumb-section _03">
        <div className="w-layout-blockcontainer container-large w-container">
          <div className="breadcrumb-wrap">
            <div className="breadcrumb-title-animation">
              <h2 className="breadcrumb-heading-title">Contact Us</h2>
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
              <div className="breadcrumb-pages-text">Contact us</div>
            </div>
            <div className="breadcrumb-desc-wrap">
              <div className="breadcrumb-desc">
                We&apos;d love to hear from you—send us a message and let&apos;s
                start the conversation.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-sectiom">
        <div className="container">
          <div className="contact-us-grid">
            <div
              data-w-id="fcf8feea-fec7-b5a1-668b-27b0222b284a"
              className="contact-us-heading-wrap"
            >
              <div className="heading-subtitle">
                <div className="subtitle-head-wrap">
                  <div className="subtitle-left-icon"></div>
                  <div className="subtitle-head white-text">Contact us</div>
                </div>
                <div className="heading-title-animation">
                  <h2 className="heading-title white-text">
                    Get in Touch Today!
                  </h2>
                </div>
                <div className="heading-subheading-desc-wrap">
                  <div className="heading-subheading-desc white-text">
                    Whether you have questions, require expert guidance, or are
                    ready to start a project, we&apos;re here to provide
                    support.
                  </div>
                </div>
              </div>
              <div className="icon-style-six-wrapper">
                <div
                  data-w-id="91c36857-c4b3-ac0b-56de-136aa14ca224"
                  style={{ opacity: 0 }}
                  className="icon-style-six"
                >
                  <div className="icon-style-six-icon-wrap">
                    <div className="icon-style-six-icon"></div>
                  </div>
                  <div className="icon-style-six-title-wrap">
                    <div className="text-style-h4 white-text">Call us 24/7</div>
                    <div className="icon-style-six-subtitle white-desc-text">
                      Phone: +001 236-895-4732
                    </div>
                  </div>
                </div>
                <div
                  data-w-id="fd20e1e7-7a95-3e48-77d1-1977181d98a2"
                  style={{ opacity: 0 }}
                  className="icon-style-six"
                >
                  <div className="icon-style-six-icon-wrap">
                    <div className="icon-style-six-icon"></div>
                  </div>
                  <div className="icon-style-six-title-wrap">
                    <div className="text-style-h4 white-text">Mail us 24/7</div>
                    <div className="icon-style-six-subtitle white-desc-text">
                      noreply@pbminfotech.com
                    </div>
                  </div>
                </div>
                <div
                  data-w-id="eda4035c-9f2e-54ab-5ded-72650a3796d6"
                  style={{ opacity: 0 }}
                  className="icon-style-six last"
                >
                  <div className="icon-style-six-icon-wrap">
                    <div className="icon-style-six-icon"></div>
                  </div>
                  <div className="icon-style-six-title-wrap">
                    <div className="text-style-h4 white-text">
                      Visit our office
                    </div>
                    <div className="icon-style-six-subtitle white-desc-text">
                      Los Angeles Gournandi, 1230 Bariasl
                    </div>
                  </div>
                </div>
              </div>
              <div className="contact-social-icon-list-flex">
                <div className="contact-social-icon-text">
                  Follow On Socials :
                </div>
                <ul role="list" className="contact-social-icon-list">
                  {[0, 1, 2, 3].map((i) => (
                    <li key={i} className="contact-social-icon-list-item">
                      <a
                        href="#"
                        className="contact-social-icon-link w-inline-block"
                      >
                        <div className="meta-icons"></div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="contact-us-form-wrap">
              <h2
                data-w-id="1f1b0cb4-177e-6d63-e09c-a500e754afe6"
                style={{ opacity: 0 }}
                className="contact-form-title"
              >
                Send a Message
              </h2>
              <div
                data-w-id="42d8a8f9-3638-05e4-c3bb-064369019e2a"
                style={{ opacity: 0 }}
              >
                Your email address will not be published.
              </div>
              <div className="contact-form-wrap w-form">
                <form
                  id="wf-form-Contact-Form"
                  name="wf-form-Contact-Form"
                  data-name="Contact Form"
                  method="get"
                  className="contact-form"
                >
                  <div className="contact-form-grid">
                    <input
                      className="contact-form-input bg-light w-input"
                      maxLength={256}
                      name="Full-Name"
                      data-name="Full Name"
                      style={{ opacity: 0 }}
                      placeholder="Full Name *"
                      data-w-id="78c8a190-b222-9a37-27a0-57889f9f5b05"
                      type="text"
                      id="Full-Name"
                      required
                    />
                    <input
                      className="contact-form-input bg-light w-node-ec75112a-1ef3-15ce-0baf-2cea67c7d092-5076cc94 w-input"
                      maxLength={256}
                      name="Phone-Number"
                      data-name="Phone Number"
                      style={{ opacity: 0 }}
                      placeholder="Phone Number*"
                      data-w-id="ec75112a-1ef3-15ce-0baf-2cea67c7d092"
                      type="tel"
                      id="Phone-Number"
                      required
                    />
                    <input
                      className="contact-form-input bg-light w-node-da8baa20-9ff3-ebcd-822a-953475167a54-5076cc94 w-input"
                      maxLength={256}
                      name="Email-Address"
                      data-name="Email Address"
                      style={{ opacity: 0 }}
                      placeholder="Email Address*"
                      data-w-id="da8baa20-9ff3-ebcd-822a-953475167a54"
                      type="email"
                      id="Email-Address"
                      required
                    />
                    <select
                      id="Service"
                      name="Service"
                      data-name="Service"
                      required
                      data-w-id="893cb8af-57f6-94f8-ce31-aa7719c4f384"
                      style={{ opacity: 0 }}
                      className="contact-form-input bg-light w-node-_893cb8af-57f6-94f8-ce31-aa7719c4f384-5076cc94 w-select"
                    >
                      <option value="">Service Type</option>
                      <option value="Digital Marketing">
                        Digital Marketing
                      </option>
                      <option value="Advertising Services">
                        Advertising Services
                      </option>
                      <option value="Performance Marketing">
                        Performance Marketing
                      </option>
                      <option value="Lead Generation">Lead Generation</option>
                    </select>
                    <textarea
                      className="contact-form-input textarea bg-light w-node-_78c8a190-b222-9a37-27a0-57889f9f5b08-5076cc94 w-input"
                      maxLength={5000}
                      name="Message"
                      data-name="Message"
                      style={{ opacity: 0 }}
                      placeholder="Message"
                      data-w-id="78c8a190-b222-9a37-27a0-57889f9f5b08"
                      id="Message"
                    ></textarea>
                    <label
                      id="w-node-_55c055bd-3701-038c-6b8f-26c761c6154e-5076cc94"
                      className="w-checkbox"
                    >
                      <input
                        type="checkbox"
                        id="checkbox"
                        name="checkbox"
                        data-name="Checkbox"
                        className="w-checkbox-input checkbox"
                      />
                      <span
                        className="checkbox-label w-form-label"
                      >
                        Save my name, email, and website in this browser for
                        the next time I comment.
                      </span>
                    </label>
                  </div>
                  <div
                    data-w-id="78ed9629-787e-3d1e-9063-a73e3b5db0af"
                    style={{ opacity: 0 }}
                    className="input-button-wrap"
                  >
                    <input
                      type="submit"
                      data-wait="Please wait..."
                      className="submit-button w-button"
                      value="Submit Message"
                    />
                    <a
                      href="#"
                      data-wf--button--variant="secondary-bg"
                      data-w-id="8932a183-40ec-c216-e8b4-670b55f18dc8"
                      className="button-link w-inline-block"
                    >
                      <div className="button-hover-overlay"></div>
                      <div className="button-text-wrapper">
                        <div className="button-text-wrap">
                          <div className="button-text">Submit Message</div>
                          <div className="button-text-hover">
                            Submit Message
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
                </form>
                <div className="success-message w-form-done">
                  <div>Thank you! Your submission has been received!</div>
                </div>
                <div className="error-message w-form-fail">
                  <div>
                    Oops! Something went wrong while submitting the form.
                  </div>
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
              data-w-id="f5b76cb3-d4c5-0fa5-aee4-19713b583065"
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
              className="client-logo-title"
            >
              1000+ Trusted Clients Over Worldwide
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="client-logo-one-box border-none">
              {[0, 1].map((row) => (
                <div key={row} className="client-logo-one-wrap">
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
                        loading="lazy"
                        alt={`Client-logo-${num}`}
                        className="client-one-logo"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        data-w-id="02ffdc56-b382-d351-d661-fcaa1116dc9c"
        style={{ opacity: 0 }}
        className="section-margin"
      >
        <div
          data-w-id="02ffdc56-b382-d351-d661-fcaa1116dc9d"
          className="maps w-embed w-iframe"
        >
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
            src="https://maps.google.com/maps?q=jersery%20city%20new%20york&t=m&z=15&output=embed&iwloc=near"
            title="jersery city new york"
            aria-label="jersery city new york"
            frameBorder="0"
          ></iframe>
        </div>
      </section>

      <Footer />
    </>
  );
}

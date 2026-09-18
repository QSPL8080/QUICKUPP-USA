import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Button from "@/components/Button";

export const metadata: Metadata = {
  title: "Contact Us | Quickupp Softech - Start Your Growth Journey",
  description:
    "Get in touch with Quickupp Softech. Discuss your Digital Marketing, AI Automation, or Custom Software project with our growth team.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <PageHero
        title="Let's Build Your Growth Story"
        crumb="Contact Us"
        description="Ready to scale your business with Marketing, AI, and Technology? Reach out to our team today."
      />

      <section className="section-gap" style={{ paddingTop: "64px", paddingBottom: "96px" }}>
        <div className="w-layout-blockcontainer container w-container">
          <div className="qs-split-section">
            {/* Left Contact Info */}
            <div className="qs-split-left">
              <div className="subtitle-head-wrap">
                <div className="subtitle-left-icon"></div>
                <div className="subtitle-head">Get In Touch</div>
              </div>
              <h2 className="heading-title qs-section-heading" style={{ fontSize: "clamp(26px, 3.2vw, 40px)", marginBottom: "16px" }}>
                Start the Conversation
              </h2>
              <p className="paragraph-large qs-section-desc" style={{ marginBottom: "32px" }}>
                Whether you need a full-funnel digital marketing strategy, an AI automation roadmap, or a dedicated development team, we&apos;re here to help you move forward.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "36px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#def25c", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>
                    ✉
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#98a2b3", textTransform: "uppercase" }}>Email Us</div>
                    <a href="mailto:contact@quickupp.com" style={{ fontSize: "16px", fontWeight: 700, color: "#18171c", textDecoration: "none" }}>
                      contact@quickupp.com
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#def25c", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>
                    📍
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#98a2b3", textTransform: "uppercase" }}>Global Headquarters</div>
                    <div style={{ fontSize: "15px", color: "#344054", fontWeight: 500 }}>
                      Quickupp Softech — Serving Clients Across USA, India &amp; Worldwide
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#def25c", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>
                    ⚡
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#98a2b3", textTransform: "uppercase" }}>Response Time</div>
                    <div style={{ fontSize: "15px", color: "#344054", fontWeight: 500 }}>
                      We respond to all qualified enquiries within 24 business hours.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Contact Form */}
            <div className="qs-split-right">
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #eaecf0",
                  borderRadius: "24px",
                  padding: "40px 32px",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.04)",
                }}
              >
                <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#18171c", marginBottom: "8px" }}>
                  Request a Free Strategy Consultation
                </h3>
                <p style={{ fontSize: "14px", color: "#667085", marginBottom: "24px" }}>
                  Fill out the form below and our growth team will connect with a customized plan.
                </p>

                <form style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#344054", marginBottom: "6px" }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      required
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: "1px solid #d0d5dd",
                        fontSize: "15px",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#344054", marginBottom: "6px" }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="john@company.com"
                        required
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "10px",
                          border: "1px solid #d0d5dd",
                          fontSize: "15px",
                          outline: "none",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#344054", marginBottom: "6px" }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "10px",
                          border: "1px solid #d0d5dd",
                          fontSize: "15px",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#344054", marginBottom: "6px" }}>
                      Services You&apos;re Interested In
                    </label>
                    <select
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: "1px solid #d0d5dd",
                        fontSize: "15px",
                        outline: "none",
                        background: "#fff",
                      }}
                    >
                      <option>Integrated Growth (Marketing + AI + Tech)</option>
                      <option>AI-Powered Digital Marketing &amp; SEO</option>
                      <option>AI Video Production &amp; Avatars</option>
                      <option>AI Automation &amp; Chatbot Solutions</option>
                      <option>Web &amp; Mobile App Development</option>
                      <option>Staff Augmentation (Marketing / IT)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#344054", marginBottom: "6px" }}>
                      Tell Us About Your Project &amp; Goals *
                    </label>
                    <textarea
                      rows={4}
                      placeholder="What are your current challenges and what growth targets are you aiming to achieve?"
                      required
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: "1px solid #d0d5dd",
                        fontSize: "15px",
                        outline: "none",
                        fontFamily: "inherit",
                      }}
                    ></textarea>
                  </div>

                  <div style={{ marginTop: "8px" }}>
                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        padding: "14px 24px",
                        borderRadius: "12px",
                        background: "#18171c",
                        color: "#def25c",
                        fontWeight: 800,
                        fontSize: "16px",
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                      }}
                    >
                      Submit Your Request →
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

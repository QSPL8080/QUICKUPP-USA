import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Button from "@/components/Button";

export const metadata: Metadata = {
  title: "Portfolio & Client Projects | Quickupp Softech",
  description:
    "Explore our featured projects in Digital Marketing, AI Automation, Web & Mobile App Development, and SaaS engineering.",
};

const projects = [
  {
    title: "MedCare Health Network",
    category: "Healthcare & AI Automation",
    tags: ["Healthcare SEO", "Google Ads", "AI Chatbot", "Patient CRM"],
    metric: "+340% Patient Enquiries",
    desc: "Complete digital growth ecosystem for a multi-specialty healthcare provider, integrating local SEO, conversion-focused landing pages, and automated WhatsApp appointment booking.",
    img: "/images/blog-img-01.jpg",
  },
  {
    title: "ApexFlow SaaS Platform",
    category: "IT & SaaS Product Engineering",
    tags: ["Next.js", "Cloud Architecture", "Performance Marketing", "B2B Lead Gen"],
    metric: "$2.4M Pipeline Generated",
    desc: "End-to-end product redesign, SaaS web application build, and multi-channel LinkedIn + Google demand generation strategy for a high-growth B2B workflow platform.",
    img: "/images/blog-img-02.jpg",
  },
  {
    title: "Velvet & Stone Interiors",
    category: "Interior Design & Brand Growth",
    tags: ["Brand Positioning", "Meta Ads", "Portfolio Website", "Lead Qualification"],
    metric: "4.8x Return on Ad Spend",
    desc: "Visual storytelling and portfolio-led paid social campaigns targeting high-net-worth homeowners, backed by an instant AI qualification funnel.",
    img: "/images/blog-img-03.jpg",
  },
  {
    title: "LuxeStay Resorts & Villas",
    category: "Travel & Hospitality",
    tags: ["Direct Booking Engine", "SEO", "Instagram Reels", "Email Automation"],
    metric: "+185% Direct Bookings",
    desc: "Fast, mobile-first booking experience and immersive AI UGC travel video campaigns driving direct guest reservations and reducing OTA fee dependence.",
    img: "/images/blog-img-04.jpg",
  },
  {
    title: "UrbanCraft Living D2C",
    category: "eCommerce & Shopify Plus",
    tags: ["Shopify Plus", "Google Shopping", "Cart Recovery", "WhatsApp Marketing"],
    metric: "+220% YoY Revenue",
    desc: "Custom Shopify store build with automated cart abandonment recovery, customer segmentation, and high-converting Google Shopping campaigns.",
    img: "/images/blog-img-05.jpg",
  },
  {
    title: "PrimeView Real Estate Launch",
    category: "Real Estate & Lead Gen",
    tags: ["Performance Max", "Site Visit Funnel", "WhatsApp Automation", "Virtual Tours"],
    metric: "650+ Site Visits Booked",
    desc: "Pre-launch and launch digital campaign for a premium residential development, featuring hyper-local geo-targeting and automated sales CRM routing.",
    img: "/images/blog-img-06.jpg",
  },
];

export default function PortfolioPage() {
  return (
    <>
      <Header />
      <PageHero
        title="Our Portfolio & Featured Work"
        crumb="Portfolio"
        description="Discover how we combine Marketing, AI, and Technology to solve real business challenges and deliver measurable growth."
      />

      <section className="section-gap" style={{ background: "#f8f9fa", paddingTop: "64px", paddingBottom: "96px" }}>
        <div className="w-layout-blockcontainer container w-container">
          <div className="qs-section-center-head" style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 48px auto" }}>
            <div className="subtitle-head-wrap" style={{ justifyContent: "center" }}>
              <div className="subtitle-left-icon"></div>
              <div className="subtitle-head">Proven Impact Across Industries</div>
            </div>
            <h2 className="heading-title qs-section-heading" style={{ fontSize: "clamp(26px, 3.2vw, 38px)" }}>
              Featured Case Studies &amp; Projects
            </h2>
            <p className="paragraph-large" style={{ fontSize: "17px", lineHeight: "1.75", color: "#475467", marginTop: "12px" }}>
              Explore a selection of digital transformations, performance campaigns, custom web applications, and AI automation systems built by Quickupp Softech.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 380px))",
              justifyContent: "center",
              gap: "32px",
              marginBottom: "64px",
            }}
          >
            {projects.map((proj, idx) => (
              <div
                key={idx}
                className="qs-blog-card"
                style={{
                  background: "#fff",
                  border: "1px solid #eaecf0",
                  borderRadius: "20px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
                  <img
                    src={proj.img}
                    alt={proj.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                      background: "#def25c",
                      color: "#18171c",
                      fontWeight: 800,
                      fontSize: "13px",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    {proj.metric}
                  </div>
                </div>

                <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#98a2b3", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                    {proj.category}
                  </div>
                  <h3 style={{ fontSize: "21px", fontWeight: 700, color: "#18171c", marginBottom: "12px", lineHeight: 1.35 }}>
                    {proj.title}
                  </h3>
                  <p style={{ fontSize: "14.5px", lineHeight: "1.65", color: "#475467", marginBottom: "20px", flexGrow: 1 }}>
                    {proj.desc}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "24px" }}>
                    {proj.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: "4px 10px",
                          borderRadius: "6px",
                          background: "#f2f4f7",
                          color: "#344054",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div style={{ paddingTop: "16px", borderTop: "1px solid #f2f4f7" }}>
                    <Button href="/contact" label="Discuss Similar Project" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="section-gap" style={{ background: "#f8f9fa", paddingTop: "0px", paddingBottom: "80px" }}>
        <div className="w-layout-blockcontainer container w-container">
          <div className="qs-ai-spotlight-box" style={{ padding: "52px 40px", borderRadius: "24px" }}>
            <div className="qs-ai-inner" style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>
              <div className="subtitle-head-wrap" style={{ justifyContent: "center", marginBottom: "16px" }}>
                <div className="subtitle-left-icon" style={{ background: "#def25c" }}></div>
                <div className="subtitle-head" style={{ color: "#def25c" }}>Your Growth Story Starts Here</div>
              </div>
              <h2 className="heading-title qs-ai-heading" style={{ fontSize: "clamp(28px, 3.6vw, 44px)", marginBottom: "16px" }}>
                Ready to Build Your Next Milestone?
              </h2>
              <p className="qs-ai-desc" style={{ fontSize: "17px", lineHeight: "1.75", color: "rgba(255,255,255,0.9)", marginBottom: "28px" }}>
                Whether you need a full digital marketing campaign, an AI automation pipeline, or a high-performing web application, we have the team to make it happen.
              </p>
              <div className="qs-cta-row" style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
                <Button href="/contact" label="Schedule a Consultation" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

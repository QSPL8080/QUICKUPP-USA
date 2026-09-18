import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { resourceItems } from "@/lib/sitemap";

export const metadata: Metadata = {
  title: "Resources & Insights | Quickupp Softech",
  description:
    "Access industry insights, case studies, client testimonials, and featured portfolios from Quickupp Softech.",
};

const resourceCards = [
  {
    title: "Blogs & Insights",
    href: "/blog",
    desc: "Actionable articles on AI search visibility, digital marketing trends, SEO, automation, and web development strategies.",
    eyebrow: "Thought Leadership",
    cta: "Read Articles",
  },
  {
    title: "Case Studies",
    href: "/case-studies",
    desc: "In-depth breakdowns of real client challenges, our custom solutions, and verified ROI metrics across industries.",
    eyebrow: "Proven Results",
    cta: "View Case Studies",
  },
  {
    title: "Portfolio",
    href: "/portfolio",
    desc: "Explore featured projects in Web & App Development, SaaS Engineering, AI Video Production, and Performance Marketing.",
    eyebrow: "Featured Work",
    cta: "Explore Portfolio",
  },
  {
    title: "Client Testimonials",
    href: "/testimonials",
    desc: "Hear what founders, CMOs, and enterprise leaders have to say about working with Quickupp Softech.",
    eyebrow: "Social Proof",
    cta: "Read Reviews",
  },
];

export default function ResourcesPage() {
  return (
    <>
      <Header />
      <PageHero
        title="Knowledge, Results &amp; Insights"
        crumb="Resources"
        description="Learn how we solve complex digital challenges and help businesses grow with Marketing, AI, and Technology."
      />

      <section className="section-gap" style={{ paddingTop: "64px", paddingBottom: "96px" }}>
        <div className="w-layout-blockcontainer container w-container">
          <div className="qs-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "28px" }}>
            {resourceCards.map((res, i) => (
              <a
                key={i}
                href={res.href}
                className="qs-card"
                style={{
                  background: "#fff",
                  border: "1px solid #eaecf0",
                  borderRadius: "20px",
                  padding: "36px 28px",
                  display: "flex",
                  flexDirection: "column",
                  textDecoration: "none",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#98a2b3", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                  {res.eyebrow}
                </div>
                <h3 style={{ fontSize: "24px", fontWeight: 700, color: "#18171c", marginBottom: "12px" }}>
                  {res.title}
                </h3>
                <p style={{ fontSize: "15px", lineHeight: "1.65", color: "#475467", marginBottom: "20px", flexGrow: 1 }}>
                  {res.desc}
                </p>
                <div style={{ fontWeight: 700, color: "#18171c", fontSize: "15px" }}>
                  {res.cta} →
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

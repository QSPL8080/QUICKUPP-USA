import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Button from "@/components/Button";

export const metadata: Metadata = {
  title: "Case Studies | Quickupp Softech - Proven Growth Results",
  description:
    "Read in-depth case studies showing how Quickupp Softech drives revenue, leads, and operational efficiency for clients worldwide.",
};

const caseStudies = [
  {
    title: "Scaling Patient Bookings by 340% for Regional Healthcare Network",
    client: "CareFirst Healthcare",
    industry: "Healthcare",
    services: ["Local SEO & AEO", "Google Ads", "AI Enquiry Bot", "CRM Automation"],
    challenge: "High cost-per-lead and a high drop-off rate between website visits and scheduled appointments.",
    solution: "Deployed hyper-local SEO, keyword-clustered Search Ads, conversion-optimized specialty pages, and an automated AI triage chatbot on WhatsApp.",
    results: [
      { num: "+340%", label: "Increase in Monthly Patient Leads" },
      { num: "-48%", label: "Reduction in Cost Per Acquisition" },
      { num: "92%", label: "Faster Inquiry Response Time" },
    ],
  },
  {
    title: "Transforming a B2B SaaS Pipeline to $2.4M ARR in 9 Months",
    client: "CloudOps Enterprise",
    industry: "IT & SaaS",
    services: ["SaaS SEO", "LinkedIn Ads", "Custom Landing Pages", "Lead Scoring"],
    challenge: "Targeting enterprise buyers with long sales cycles and low demo conversion rates from organic search.",
    solution: "Restructured content architecture around high-intent problem keywords, launched account-based LinkedIn campaigns, and redesigned the self-serve trial onboarding flow.",
    results: [
      { num: "$2.4M", label: "Qualified Pipeline Generated" },
      { num: "3.2x", label: "Increase in Demo Requests" },
      { num: "41%", label: "Trial-to-Paid Conversion Rate" },
    ],
  },
  {
    title: "Driving 4.8x ROAS for a High-End Interior Design Studio",
    client: "Atelier Spaces",
    industry: "Interior Design",
    services: ["Meta Video Ads", "Portfolio Web Design", "WhatsApp CRM Funnel"],
    challenge: "Attracting unqualified budget-shopper leads rather than luxury homeowners looking for turnkey renovations.",
    solution: "Created cinematic project video showcases, refined Meta audience filters to luxury homeowners, and implemented a multi-step project scope qualification form.",
    results: [
      { num: "4.8x", label: "Verified Return on Ad Spend" },
      { num: "+180%", label: "Consultation Bookings" },
      { num: "$420K+", label: "Average Project Value Acquired" },
    ],
  },
];

export default function CaseStudiesPage() {
  return (
    <>
      <Header />
      <PageHero
        title="Client Case Studies"
        crumb="Case Studies"
        description="Explore real stories of how our Marketing, AI, and Technology solutions deliver measurable business impact."
      />

      <section className="section-gap" style={{ background: "#f8f9fa", paddingTop: "64px", paddingBottom: "96px" }}>
        <div className="w-layout-blockcontainer container w-container">
          <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
            {caseStudies.map((study, idx) => (
              <div
                key={idx}
                style={{
                  background: "#fff",
                  border: "1px solid #eaecf0",
                  borderRadius: "24px",
                  padding: "44px 36px",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <span
                    style={{
                      background: "rgba(222, 242, 92, 0.4)",
                      color: "#18171c",
                      fontSize: "13px",
                      fontWeight: 800,
                      padding: "4px 12px",
                      borderRadius: "12px",
                    }}
                  >
                    {study.industry}
                  </span>
                  <span style={{ fontSize: "14px", color: "#667085", fontWeight: 600 }}>
                    Client: {study.client}
                  </span>
                </div>

                <h2 style={{ fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 700, color: "#18171c", marginBottom: "20px", lineHeight: 1.25 }}>
                  {study.title}
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
                  <div style={{ background: "#f8f9fa", padding: "20px 24px", borderRadius: "14px", borderLeft: "4px solid #eaecf0" }}>
                    <div style={{ fontSize: "14px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#18171c", marginBottom: "8px" }}>
                      The Challenge
                    </div>
                    <p style={{ fontSize: "15px", lineHeight: "1.65", color: "#475467", margin: 0 }}>
                      {study.challenge}
                    </p>
                  </div>

                  <div style={{ background: "#f8f9fa", padding: "20px 24px", borderRadius: "14px", borderLeft: "4px solid #8b5cf6" }}>
                    <div style={{ fontSize: "14px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#18171c", marginBottom: "8px" }}>
                      Our Solution
                    </div>
                    <p style={{ fontSize: "15px", lineHeight: "1.65", color: "#475467", margin: 0 }}>
                      {study.solution}
                    </p>
                  </div>
                </div>

                {/* Metric cards */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "20px",
                    background: "#18171c",
                    padding: "28px 24px",
                    borderRadius: "16px",
                    color: "#fff",
                    marginBottom: "28px",
                  }}
                >
                  {study.results.map((res, rIdx) => (
                    <div key={rIdx} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "clamp(28px, 3.5vw, 38px)", fontWeight: 800, color: "#7c3aed", lineHeight: 1.1, marginBottom: "6px" }}>
                        {res.num}
                      </div>
                      <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                        {res.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {study.services.map((srv, sIdx) => (
                      <span key={sIdx} style={{ fontSize: "12px", background: "#f2f4f7", padding: "4px 10px", borderRadius: "6px", fontWeight: 600, color: "#344054" }}>
                        {srv}
                      </span>
                    ))}
                  </div>
                  <Button href="/contact" label="Get Similar Results" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

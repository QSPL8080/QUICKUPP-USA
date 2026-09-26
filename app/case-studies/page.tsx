"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResourceCtaBanner from "@/components/ResourceCtaBanner";

const filterTabs = [
  "All Case Studies",
  "Healthcare & AI",
  "IT & SaaS",
  "Interior Design",
  "Hospitality",
  "eCommerce & D2C",
  "Real Estate",
];

const featuredStudy = {
  title: "Scaling Patient Bookings by 340% for Regional Healthcare Network",
  client: "CareFirst Healthcare Network",
  category: "Healthcare & AI",
  tag: "HEALTHCARE • AI AUTOMATION",
  desc: "Transformed patient acquisition for a multi-specialty regional provider by replacing slow manual intake with 24/7 automated WhatsApp AI scheduling and intent-clustered local search campaigns.",
  img: "/images/blog-img-01.jpg",
  highlight: "+340% Patient Bookings",
  metrics: [
    { val: "+340%", lbl: "Patient Enquiries" },
    { val: "-48%", lbl: "Cost Per Acquisition" },
    { val: "92%", lbl: "Faster Response Time" },
  ],
  services: ["Healthcare SEO", "Google Ads", "WhatsApp AI Bot", "Patient CRM"],
};

const caseStudiesList = [
  {
    title: "Scaling B2B Enterprise Pipeline to $2.4M ARR in 9 Months",
    client: "ApexFlow Technologies",
    category: "IT & SaaS",
    timeline: "9-Month Growth Sprint",
    desc: "Engineered a custom Next.js web application paired with bottom-of-funnel SEO and account-based LinkedIn marketing to dramatically shorten enterprise sales cycles.",
    highlight: "$2.4M ARR Pipeline",
    img: "/images/blog-img-02.jpg",
    metrics: [
      { val: "$2.4M", lbl: "Pipeline Generated" },
      { val: "3.2x", lbl: "Demo Requests" },
      { val: "41%", lbl: "Trial Conversion" },
    ],
    services: ["Next.js App", "SaaS SEO", "LinkedIn Ads", "B2B Lead Gen"],
  },
  {
    title: "Generating 4.8x ROAS for Luxury Turnkey Interior Design Studio",
    client: "Velvet & Stone Interiors",
    category: "Interior Design",
    timeline: "6-Month Brand Funnel",
    desc: "Targeted high-net-worth homeowners through cinematic video showcases and an instant multi-tier AI qualification funnel that pre-vetted project budgets.",
    highlight: "4.8x Return on Ads",
    img: "/images/blog-img-03.jpg",
    metrics: [
      { val: "4.8x", lbl: "Meta Ad ROAS" },
      { val: "+180%", lbl: "Consultations" },
      { val: "$420K+", lbl: "Avg Project Size" },
    ],
    services: ["Meta Video Ads", "Portfolio Web", "AI Lead Form", "WhatsApp CRM"],
  },
  {
    title: "Increasing Direct Villa Bookings by 185% and Slashing OTA Fees",
    client: "LuxeStay Resorts & Villas",
    category: "Hospitality",
    timeline: "3-Month Direct Engine",
    desc: "Built a fast mobile-first direct booking engine backed by viral Instagram UGC reels and automated email sequences, reducing third-party OTA commissions by 65%.",
    highlight: "+185% Direct Bookings",
    img: "/images/blog-img-04.jpg",
    metrics: [
      { val: "+185%", lbl: "Direct Bookings" },
      { val: "-65%", lbl: "OTA Commission" },
      { val: "3.4x", lbl: "Email Revenue" },
    ],
    services: ["Booking Engine", "Hospitality SEO", "Instagram UGC", "Email Flows"],
  },
  {
    title: "Accelerating D2C Revenue by 220% YoY with Headless Shopify Plus",
    client: "UrbanCraft Living",
    category: "eCommerce & D2C",
    timeline: "12-Month Omnichannel",
    desc: "Custom headless Shopify build with automated cart abandonment recovery, customer segmentation, and high-converting Google Shopping Performance Max campaigns.",
    highlight: "+220% YoY Revenue",
    img: "/images/blog-img-05.jpg",
    metrics: [
      { val: "+220%", lbl: "YoY Revenue" },
      { val: "+44%", lbl: "Checkout Rate" },
      { val: "2.8x", lbl: "Repeat Orders" },
    ],
    services: ["Shopify Plus", "Google Shopping", "Cart Recovery", "WhatsApp CRM"],
  },
  {
    title: "Booking 650+ Qualified Site Visits for Premium Residential Launch",
    client: "PrimeView Developments",
    category: "Real Estate",
    timeline: "Pre-Launch & Launch",
    desc: "Pre-launch performance marketing campaign uniting hyper-local geo-targeting, virtual tour walkthroughs, and automated sales scheduling via WhatsApp.",
    highlight: "650+ Site Visits",
    img: "/images/blog-img-06.jpg",
    metrics: [
      { val: "650+", lbl: "Site Visits Booked" },
      { val: "88%", lbl: "Show-Up Rate" },
      { val: "14 min", lbl: "Avg Booking Time" },
    ],
    services: ["Performance Max", "Site Visit Funnel", "WhatsApp Bot", "Virtual Tours"],
  },
  {
    title: "Scaling Multi-Location Healthcare Clinics to 5,000+ Monthly Inquiries",
    client: "MetroCare Health Systems",
    category: "Healthcare & AI",
    timeline: "Multi-Clinic Rollout",
    desc: "Unified local Google map rankings, localized paid search campaigns, and AI patient reception bots across 8 clinic locations to triple patient throughput.",
    highlight: "+310% Clinic Volume",
    img: "/images/blog-img-01.jpg",
    metrics: [
      { val: "+310%", lbl: "Clinic Inquiries" },
      { val: "-52%", lbl: "Cost Per Lead" },
      { val: "4.9/5", lbl: "Patient Rating" },
    ],
    services: ["Local SEO", "Google PPC", "AI Receptionist", "Multi-Location"],
  },
];

function renderGradientHeading(text?: string) {
  if (!text) return null;
  const words = text.split(" ");
  if (words.length <= 2) {
    return <span className="qs-gradient-text">{text}</span>;
  }
  const splitIndex = Math.ceil(words.length / 2);
  const firstHalf = words.slice(0, splitIndex).join(" ");
  const secondHalf = words.slice(splitIndex).join(" ");

  return (
    <>
      {firstHalf} <span className="qs-gradient-text">{secondHalf}</span>
    </>
  );
}

export default function CaseStudiesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Case Studies");

  const filteredStudies =
    selectedCategory === "All Case Studies"
      ? caseStudiesList
      : caseStudiesList.filter((s) => s.category.toLowerCase().includes(selectedCategory.toLowerCase().split(" ")[0]));

  return (
    <>
      <Header />
      <main className="res-page-wrap">
        {/* Editorial Hero Header */}
        <section style={{ paddingTop: "40px", paddingBottom: "32px" }}>
          <div className="res-container">
            <div style={{ maxWidth: "860px" }}>
              <div className="res-tag">
                <span className="res-tag-dot" />
                PROVEN CASE STUDIES &amp; IMPACT
              </div>
              <h1
                style={{
                  fontSize: "clamp(34px, 4.4vw, 54px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "#0f172a",
                  lineHeight: 1.15,
                  margin: "0 0 18px 0",
                }}
              >
                Proven Impact. <span className="qs-gradient-text">Quantifiable Growth.</span>
              </h1>
              <p
                style={{
                  fontSize: "clamp(16px, 1.3vw, 19px)",
                  lineHeight: 1.65,
                  color: "#475569",
                  margin: 0,
                  maxWidth: "760px",
                }}
              >
                Explore how we combine Marketing, AI, and Software Engineering to solve complex business challenges and drive verified revenue for ambitious brands.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="res-filter-bar" style={{ marginTop: "36px" }}>
              {filterTabs.map((tab, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCategory(tab)}
                  className={`res-filter-pill ${selectedCategory === tab ? "is-active active" : ""}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Case Study Hero Split */}
        <section style={{ paddingBottom: "48px" }}>
          <div className="res-container">
            <div className="res-featured-grid">
              <div className="res-featured-img-wrap">
                <img
                  src={featuredStudy.img}
                  alt={featuredStudy.title}
                  className="res-featured-img"
                />
                <span
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    background: "#0f172a",
                    color: "#7c3aed",
                    fontSize: "12px",
                    fontWeight: 800,
                    padding: "6px 14px",
                    borderRadius: "14px",
                    letterSpacing: "0.02em",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                    border: "1px solid rgba(222, 242, 92, 0.35)",
                  }}
                >
                  {featuredStudy.highlight}
                </span>
              </div>

              <div className="res-featured-content">
                <div className="res-tag">
                  <span className="res-tag-dot" />
                  {featuredStudy.tag}
                </div>

                <h2 className="res-featured-title" style={{ fontSize: "clamp(26px, 3.2vw, 38px)" }}>
                  {renderGradientHeading(featuredStudy.title)}
                </h2>

                <p className="res-featured-desc">
                  {featuredStudy.desc}
                </p>

                {/* 3 Metric Pills Row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    padding: "16px 14px",
                    borderRadius: "16px",
                    marginBottom: "24px",
                  }}
                >
                  {featuredStudy.metrics.map((m, idx) => (
                    <div key={idx} style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "clamp(20px, 2.2vw, 26px)",
                          fontWeight: 800,
                          color: "#0f172a",
                          lineHeight: 1.1,
                          marginBottom: "4px",
                        }}
                      >
                        {m.val}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>
                        {m.lbl}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "24px" }}>
                  {featuredStudy.services.map((srv, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: "#f1f5f9",
                        color: "#334155",
                      }}
                    >
                      {srv}
                    </span>
                  ))}
                </div>

                <Link href="/contact" className="res-btn-dark" style={{ alignSelf: "flex-start" }}>
                  Discuss Similar Growth Strategy
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Column Trendy Case Studies Grid */}
        <section style={{ paddingTop: "16px", paddingBottom: "80px" }}>
          <div className="res-container">
            <div className="res-grid-3">
              {filteredStudies.map((study, idx) => (
                <article key={idx} className="res-card">
                  <div className="res-card-img-wrap">
                    <img src={study.img} alt={study.title} />
                    <span className="res-card-badge">{study.category}</span>
                    <span
                      style={{
                        position: "absolute",
                        top: "14px",
                        right: "14px",
                        background: "#0f172a",
                        color: "#7c3aed",
                        fontSize: "12px",
                        fontWeight: 800,
                        padding: "5px 11px",
                        borderRadius: "14px",
                        letterSpacing: "0.02em",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                        border: "1px solid rgba(222, 242, 92, 0.3)",
                      }}
                    >
                      {study.highlight}
                    </span>
                  </div>

                  <div className="res-card-body">
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                      Client: {study.client}
                    </div>
                    <h3 className="res-card-title">{study.title}</h3>
                    <p className="res-card-desc">{study.desc}</p>

                    {/* Clean 3-Metric Strip */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "6px",
                        background: "#f8fafc",
                        border: "1px solid #f1f5f9",
                        borderRadius: "12px",
                        padding: "10px 8px",
                        margin: "16px 0",
                        textAlign: "center",
                      }}
                    >
                      {study.metrics.map((m, mIdx) => (
                        <div key={mIdx}>
                          <div style={{ fontSize: "14.5px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: "2px" }}>
                            {m.val}
                          </div>
                          <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>
                            {m.lbl}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px" }}>
                      {study.services.map((srv, sIdx) => (
                        <span
                          key={sIdx}
                          style={{
                            fontSize: "11.5px",
                            fontWeight: 600,
                            padding: "3px 9px",
                            borderRadius: "6px",
                            background: "#f1f5f9",
                            color: "#334155",
                          }}
                        >
                          {srv}
                        </span>
                      ))}
                    </div>

                    <div style={{ marginTop: "auto", paddingTop: "14px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Link
                        href="/contact"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#0f172a",
                          textDecoration: "none",
                        }}
                      >
                        Explore Case Strategy
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Athelas Modern Dual-Action CTA Banner */}
        <ResourceCtaBanner
          tag="GET STARTED WITH QUICKUPP"
          title="Ready to Build Your Next"
          titleAccent="Growth Milestone?"
          primaryHref="/contact"
          primaryLabel="Schedule a Strategy Call"
          secondaryHref="/portfolio"
          secondaryLabel="Explore Our Portfolio"
        />
      </main>
      <Footer />
    </>
  );
}



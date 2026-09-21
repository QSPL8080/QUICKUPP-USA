"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResourceCtaBanner from "@/components/ResourceCtaBanner";

const categories = ["All Projects", "AI & Automation", "SaaS & Web Apps", "Performance Marketing", "eCommerce & D2C", "Real Estate"];

const projects = [
  {
    title: "MedCare Health Network",
    category: "AI & Automation",
    tags: ["Healthcare SEO", "Google Ads", "AI Chatbot", "Patient CRM"],
    metric: "+340% Patient Enquiries",
    desc: "Complete digital growth ecosystem for a multi-specialty healthcare provider, integrating local SEO, conversion-focused landing pages, and automated WhatsApp appointment booking.",
    img: "/images/blog-img-01.jpg",
    slug: "/case-studies",
  },
  {
    title: "ApexFlow SaaS Platform",
    category: "SaaS & Web Apps",
    tags: ["Next.js", "Cloud Architecture", "Performance Marketing", "B2B Lead Gen"],
    metric: "$2.4M Pipeline Generated",
    desc: "End-to-end product redesign, SaaS web application build, and multi-channel LinkedIn + Google demand generation strategy for a high-growth B2B workflow platform.",
    img: "/images/blog-img-02.jpg",
    slug: "/case-studies",
  },
  {
    title: "Velvet & Stone Interiors",
    category: "Performance Marketing",
    tags: ["Brand Positioning", "Meta Ads", "Portfolio Website", "Lead Qualification"],
    metric: "4.8x Return on Ad Spend",
    desc: "Visual storytelling and portfolio-led paid social campaigns targeting high-net-worth homeowners, backed by an instant AI qualification funnel.",
    img: "/images/blog-img-03.jpg",
    slug: "/case-studies",
  },
  {
    title: "LuxeStay Resorts & Villas",
    category: "Performance Marketing",
    tags: ["Direct Booking Engine", "SEO", "Instagram Reels", "Email Automation"],
    metric: "+185% Direct Bookings",
    desc: "Fast, mobile-first booking experience and immersive AI UGC travel video campaigns driving direct guest reservations and reducing OTA fee dependence.",
    img: "/images/blog-img-04.jpg",
    slug: "/case-studies",
  },
  {
    title: "UrbanCraft Living D2C",
    category: "eCommerce & D2C",
    tags: ["Shopify Plus", "Google Shopping", "Cart Recovery", "WhatsApp Marketing"],
    metric: "+220% YoY Revenue",
    desc: "Custom Shopify store build with automated cart abandonment recovery, customer segmentation, and high-converting Google Shopping campaigns.",
    img: "/images/blog-img-05.jpg",
    slug: "/case-studies",
  },
  {
    title: "PrimeView Real Estate Launch",
    category: "Real Estate",
    tags: ["Performance Max", "Site Visit Funnel", "WhatsApp Automation", "Virtual Tours"],
    metric: "650+ Site Visits Booked",
    desc: "Pre-launch and launch digital campaign for a premium residential development, featuring hyper-local geo-targeting and automated sales CRM routing.",
    img: "/images/blog-img-06.jpg",
    slug: "/case-studies",
  },
];

export default function PortfolioPage() {
  const [selectedCat, setSelectedCat] = useState("All Projects");

  const filteredProjects =
    selectedCat === "All Projects"
      ? projects
      : projects.filter((p) => p.category.toLowerCase().includes(selectedCat.toLowerCase().split(" ")[0]));

  return (
    <>
      <Header />
      <main className="res-page-wrap">
        {/* Editorial Header */}
        <section style={{ paddingTop: "40px", paddingBottom: "36px" }}>
          <div className="res-container">
            <div style={{ maxWidth: "860px" }}>
              <div className="res-tag">
                <span className="res-tag-dot" />
                OUR PORTFOLIO
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
                Engineered for Performance. Built for Growth.
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
                Discover how we merge AI automation, Next.js engineering, and high-performance multi-channel marketing to drive measurable ROI for forward-thinking brands.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="res-filter-bar" style={{ marginTop: "36px" }}>
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCat(cat)}
                  className={`res-filter-pill ${selectedCat === cat ? "is-active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3-Column Portfolio Cards Grid */}
        <section style={{ paddingTop: "12px", paddingBottom: "80px" }}>
          <div className="res-container">
            <div className="res-grid-3">
              {filteredProjects.map((proj, idx) => (
                <article key={idx} className="res-card">
                  <div className="res-card-img-wrap">
                    <img src={proj.img} alt={proj.title} />
                    <span className="res-card-badge">{proj.category}</span>
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
                      {proj.metric}
                    </span>
                  </div>

                  <div className="res-card-body">
                    <h3 className="res-card-title">{proj.title}</h3>
                    <p className="res-card-desc">{proj.desc}</p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "16px 0 20px 0" }}>
                      {proj.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: "6px",
                            background: "#f1f5f9",
                            color: "#334155",
                          }}
                        >
                          {tag}
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
                        Discuss Similar Project
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
          titleAccent="Digital Milestone?"
          primaryLabel="Schedule a Strategy Call"
          primaryHref="/contact"
          secondaryLabel="Explore Case Studies"
          secondaryHref="/case-studies"
        />
      </main>
      <Footer />
    </>
  );
}

"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResourceCtaBanner from "@/components/ResourceCtaBanner";

const filterTabs = ["All Reviews", "Healthcare", "SaaS & Tech", "eCommerce & D2C", "Real Estate", "Enterprise"];

const reviews = [
  {
    quote: "Quickupp Softech completely transformed our patient acquisition funnel. In under four months, our appointment booking volume grew by more than 300% while reducing our cost per lead.",
    author: "Dr. Arvind Mehta",
    title: "Medical Director",
    company: "MetroCare Health Systems",
    rating: 5,
    highlight: "+340% Patient Bookings",
    category: "Healthcare",
  },
  {
    quote: "Finding a single team that excels in Next.js web development, AI automation workflows, and high-ROI paid marketing is nearly impossible. Quickupp delivered on every front.",
    author: "Sarah Jenkins",
    title: "VP of Marketing",
    company: "SaaSFlow Technologies",
    rating: 5,
    highlight: "$2.4M Pipeline Growth",
    category: "SaaS & Tech",
  },
  {
    quote: "Their team built our custom Shopify Plus experience and integrated automated WhatsApp cart recovery. Our conversion rates and repeat customer purchases doubled.",
    author: "Rohan Kapoor",
    title: "Founder & CEO",
    company: "UrbanLuxe Living",
    rating: 5,
    highlight: "220% YoY Revenue",
    category: "eCommerce & D2C",
  },
  {
    quote: "Before Quickupp, our real estate leads were low quality and required endless chasing. Their AI lead qualification bot now handles initial vetting automatically, booking site visits directly.",
    author: "Vikram Malhotra",
    title: "Head of Sales",
    company: "Prestige Horizon Developers",
    rating: 5,
    highlight: "650+ Site Visits Booked",
    category: "Real Estate",
  },
  {
    quote: "The transparency and communication are outstanding. We receive clear data-driven reports, proactive recommendations, and genuine growth strategy every single month.",
    author: "Elena Rostova",
    title: "Co-Founder",
    company: "Nova Digital Brands",
    rating: 5,
    highlight: "98% Satisfaction Rating",
    category: "Enterprise",
  },
  {
    quote: "Quickupp's AI UGC and Avatar video production allowed us to test 50+ video ads in a single month at a fraction of our traditional studio production cost. A game changer.",
    author: "David Chen",
    title: "Growth Lead",
    company: "PulseWear D2C",
    rating: 5,
    highlight: "4.5x ROAS Across Meta",
    category: "eCommerce & D2C",
  },
];

export default function TestimonialsPage() {
  const [selectedTab, setSelectedTab] = useState("All Reviews");

  const filteredReviews =
    selectedTab === "All Reviews"
      ? reviews
      : reviews.filter((r) => r.category.toLowerCase().includes(selectedTab.toLowerCase().split(" ")[0]));

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
                CLIENT TESTIMONIALS & TRUST
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
                Real Partnerships. <span className="qs-gradient-text">Measurable Growth Outcomes.</span>
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
                Hear directly from the founders, CMOs, and growth executives who rely on Quickupp Softech to architect high-performance digital engines.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="res-filter-bar" style={{ marginTop: "36px" }}>
              {filterTabs.map((tab, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedTab(tab)}
                  className={`res-filter-pill ${selectedTab === tab ? "is-active" : ""}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3-Column Testimonial Cards */}
        <section style={{ paddingTop: "12px", paddingBottom: "80px" }}>
          <div className="res-container">
            <div className="res-grid-3">
              {filteredReviews.map((rev, idx) => (
                <article
                  key={idx}
                  className="res-card"
                  style={{
                    padding: "36px 30px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <div style={{ color: "#f59e0b", fontSize: "16px", letterSpacing: "3px" }}>
                      {"★".repeat(rev.rating)}
                    </div>
                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 800,
                        background: "rgba(222, 242, 92, 0.35)",
                        color: "#0f172a",
                        padding: "5px 11px",
                        borderRadius: "14px",
                        border: "1px solid rgba(15, 23, 42, 0.08)",
                      }}
                    >
                      {rev.highlight}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: "15.5px",
                      lineHeight: 1.7,
                      color: "#334155",
                      fontStyle: "italic",
                      marginBottom: "28px",
                      flexGrow: 1,
                    }}
                  >
                    &ldquo;{rev.quote}&rdquo;
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      paddingTop: "20px",
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "#0f172a",
                        color: "#7c3aed",
                        fontWeight: 800,
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {rev.author.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                        {rev.author}
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>
                        {rev.title}, {rev.company}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Athelas Modern Dual-Action CTA Banner */}
        <ResourceCtaBanner
          tag="JOIN OUR SUCCESS STORIES"
          title="Ready to Drive Scalable"
          titleAccent="Revenue for Your Brand?"
          primaryLabel="Talk to a Growth Strategist"
          primaryHref="/contact"
          secondaryLabel="Explore All Resources"
          secondaryHref="/resources"
        />
      </main>
      <Footer />
    </>
  );
}

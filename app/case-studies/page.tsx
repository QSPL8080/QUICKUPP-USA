"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResourceCtaBanner from "@/components/ResourceCtaBanner";

const filterTabs = [
  "All Case Studies",
  "Healthcare & Emergency Care",
  "Legal & Law Firms",
  "Real Estate & Multifamily",
  "Local & Automotive Services",
  "Finance & Professional",
  "Retail & Transport",
];

const featuredStudy = {
  title: "9,196 Patient Calls in 60 Days Across 9 Texas Emergency Centers",
  client: "Neighbors Emergency Center",
  category: "Healthcare & Emergency Care",
  tag: "HEALTHCARE • MULTI-LOCATION EMERGENCY CARE",
  desc: "Operates freestanding emergency rooms across Texas, from the Houston area to Amarillo and Lubbock. We engineered a unified performance engine combining Google Ads, Google Business Profiles, local SEO, and call tracking as one system—delivering 9,196 patient calls and 3,805 verified conversions in 60 days.",
  img: "/images/blog-img-01.jpg",
  highlight: "9,196 Patient Calls",
  metrics: [
    { val: "9,196", lbl: "Tracked Patient Calls" },
    { val: "95%", lbl: "Call Answer Rate" },
    { val: "3,805", lbl: "Google Ads Conversions" },
  ],
  services: ["Google Ads", "Google Business Profile", "Healthcare SEO", "Call Tracking"],
};

const caseStudiesList = [
  {
    title: "9,196 Patient Calls in 60 Days Across 9 Texas Emergency Centers",
    client: "Neighbors Emergency Center",
    category: "Healthcare & Emergency Care",
    timeline: "Texas-Wide ER Rollout",
    desc: "Unified Google Ads, Business Profiles, local SEO, and 24/7 call tracking across nine Texas ER locations (Amarillo, Baytown, Crosby, Kingwood, Livingston, Lubbock, Pasadena, Pearland, Porter).",
    highlight: "9,196 Patient Calls",
    img: "/images/blog-img-01.jpg",
    metrics: [
      { val: "9,196", lbl: "Patient Calls (60 Days)" },
      { val: "95%", lbl: "Call Answer Rate" },
      { val: "3,805", lbl: "Google Ads Conversions" },
    ],
    services: ["Google Ads", "GBP Management", "Healthcare SEO", "Call Tracking"],
  },
  {
    title: "6,532 Patient Calls in 60 Days Across Seven Texas Emergency Rooms",
    client: "Exceptional Emergency Center",
    category: "Healthcare & Emergency Care",
    timeline: "Multi-Location Performance",
    desc: "For seven active 24/7 ER locations across Amarillo, Beaumont, Fort Worth, Orange, Port Arthur, and Tyler, we ran synchronized Google Ads, GBP optimization, and local search to win emergency discovery.",
    highlight: "6,532 Patient Calls",
    img: "/images/contact-boardroom.jpg",
    metrics: [
      { val: "6,532", lbl: "Patient Phone Calls" },
      { val: "94%", lbl: "Calls Answered" },
      { val: "3,178", lbl: "Google Ads Conversions" },
    ],
    services: ["Google Ads", "GBP Optimization", "Local ER SEO", "Call Tracking"],
  },
  {
    title: "4,405 Patient Calls in 60 Days & #1 for “Emergency Room Near Me” Across South Texas",
    client: "STAT Specialty Hospital",
    category: "Healthcare & Emergency Care",
    timeline: "Border Market Domination",
    desc: "Serving South Texas border communities across Laredo (North & South), Eagle Pass, and Del Rio with targeted bilingual search campaigns, Google Ads, and local GBP authority.",
    highlight: "4,405 Patient Calls",
    img: "/images/contact-team-conference.jpg",
    metrics: [
      { val: "4,405", lbl: "Tracked Patient Calls" },
      { val: "#1", lbl: "ER Near Me Ranking" },
      { val: "1,864", lbl: "Google Ads Conversions" },
    ],
    services: ["Google Ads", "Local SEO", "GBP Optimization", "Call Tracking"],
  },
  {
    title: "3,145 Patient Calls in 60 Days Across Three Texas ERs & 43% Lower Cost Per Click",
    client: "Altus Emergency Centers",
    category: "Healthcare & Emergency Care",
    timeline: "60-Day Patient Growth",
    desc: "Operates freestanding emergency rooms in Lake Jackson, Lumberton, and Waxahachie. Replaced fragmented marketing with unified local SEO, Google Ads, and call tracking to capture high-intent patients.",
    highlight: "3,145 Patient Calls",
    img: "/images/contact-consultation-team.jpg",
    metrics: [
      { val: "3,145", lbl: "Tracked Patient Calls" },
      { val: "94%", lbl: "Calls Answered" },
      { val: "−43%", lbl: "Google Ads Cost/Click" },
    ],
    services: ["Local SEO", "Google Business Profile", "Google Ads", "Call Tracking"],
  },
  {
    title: "From Invisible to Page One for “Emergency Room” & Direction Requests Up 112%",
    client: "St. Michael’s Elite Hospital",
    category: "Healthcare & Emergency Care",
    timeline: "Year-Over-Year Surge",
    desc: "Positioned a premier 24-hour emergency hospital in Sugar Land/Houston at #7 on Google from outside the top 100, driving massive year-over-year increases in patient visits and direction requests.",
    highlight: "+112% Direction Requests",
    img: "/images/contact-meeting-room.jpg",
    metrics: [
      { val: "+112%", lbl: "Direction Requests YoY" },
      { val: "843", lbl: "Patient Calls (60 Days)" },
      { val: "#7", lbl: '“Emergency Room” Rank' },
    ],
    services: ["Hospital SEO", "GBP Management", "Google Ads", "Call Tracking"],
  },
  {
    title: "From Zero Rankings to 9 #1 Positions on Google & 1,368 Inbound Calls in 60 Days",
    client: "Kim Bruno Law",
    category: "Legal & Law Firms",
    timeline: "Bilingual Growth Sprint",
    desc: "Built a dominant bilingual English & Spanish search presence across Greater Houston for wrongful death and vehicle accident cases, outcompeting mega-budget personal injury advertisers.",
    highlight: "9 #1 Google Positions",
    img: "/images/contact-professional-consultant.jpg",
    metrics: [
      { val: "9", lbl: "#1 Google Rankings" },
      { val: "1,368", lbl: "Phone Calls (60 Days)" },
      { val: "547K", lbl: "Search Impressions" },
    ],
    services: ["Bilingual Legal SEO", "City Practice Pages", "Google Business Profile", "Call Tracking"],
  },
  {
    title: "From 1 to 52 Ranking Keywords & 7 at #1 on Google in Ten Months",
    client: "JLG Law",
    category: "Legal & Law Firms",
    timeline: "10-Month Authority Sprint",
    desc: "Engineered deep practice-area and suburb search architecture for a premier Houston criminal defense firm, generating #1 Google rankings for high-stakes federal and state defense inquiries.",
    highlight: "52 Ranking Keywords",
    img: "/images/blog-img-02.jpg",
    metrics: [
      { val: "1 → 52", lbl: "Keywords in Top 100" },
      { val: "7", lbl: "#1 Google Rankings" },
      { val: "583K", lbl: "Search Impressions" },
    ],
    services: ["Criminal Defense SEO", "Practice Area Pages", "GBP Optimization", "Organic Search"],
  },
  {
    title: "From Zero Rankings to 19 Page-One Positions on Google in Nine Months",
    client: "Lakhani & McGrath",
    category: "Legal & Law Firms",
    timeline: "9-Month Local Climb",
    desc: "Established hyper-targeted suburb and case-type landing pages across Greater Houston, taking a personal injury firm from zero visibility to 19 page-one positions and 227K organic impressions.",
    highlight: "19 Page-One Positions",
    img: "/images/contact-corporate-consultation.jpg",
    metrics: [
      { val: "0 → 19", lbl: "Page-1 Google Positions" },
      { val: "227K", lbl: "Search Impressions" },
      { val: "78%", lbl: "Organic Traffic Share" },
    ],
    services: ["Personal Injury SEO", "Case-Type Pages", "Google Business Profile", "Rank Tracking"],
  },
  {
    title: "From Zero Rankings to Page One for Accident-Type Searches in Three Months",
    client: "Romero Injury Law",
    category: "Legal & Law Firms",
    timeline: "90-Day Rapid Rank",
    desc: "Targeted specific high-intent crash queries (T-bone, intersection, multi-vehicle) and Houston suburbs to rank a boutique injury firm on page one within 90 days of launch.",
    highlight: "0 → 20 Top-100 Keywords",
    img: "/images/contact-client-consultation.jpg",
    metrics: [
      { val: "0 → 20", lbl: "Keywords in Top 100" },
      { val: "#5", lbl: "T-Bone Attorney Rank" },
      { val: "87%", lbl: "Calls Answered" },
    ],
    services: ["Accident-Type SEO", "Suburb Expansion", "GBP Optimization", "Call Tracking"],
  },
  {
    title: "11 City Bookkeeping Pages on Google's First Page Within a Month of Launch",
    client: "MadTax",
    category: "Finance & Professional",
    timeline: "30-Day City Launch",
    desc: "Constructed targeted city service pages across Houston and nationwide for a boutique bookkeeping and tax consultancy, capturing 11 first-page positions and 7 top-5 rankings in 30 days.",
    highlight: "11 Page-1 Rankings",
    img: "/images/contact-consulting-planning.jpg",
    metrics: [
      { val: "0 → 11", lbl: "Page-1 City Keywords" },
      { val: "1 → 23", lbl: "Keywords in Top 100" },
      { val: "7", lbl: "Top-5 City Keywords" },
    ],
    services: ["City Service Pages", "On-Page SEO", "Rank Tracking", "Local Search"],
  },
  {
    title: "Turning Local Search into 4,199 Renter Actions in 60 Days",
    client: "Ainsley Heights",
    category: "Real Estate & Multifamily",
    timeline: "60-Day Renter Engine",
    desc: "Managed local search and Google Business Profile for a premier Houston luxury apartment community, driving 1,915 physical direction requests and 4,199 total tenant interactions.",
    highlight: "4,199 Renter Actions",
    img: "/images/blog-img-04.jpg",
    metrics: [
      { val: "4,199", lbl: "Renter Google Actions" },
      { val: "31%", lbl: "Action Conversion Rate" },
      { val: "1,915", lbl: "Direction Requests" },
    ],
    services: ["Multifamily SEO", "Google Business Profile", "Website Search", "Local Listings"],
  },
  {
    title: "4,798 Renter Actions on Google in 60 Days for Orlando Apartment Community",
    client: "Grandewood Pointe",
    category: "Real Estate & Multifamily",
    timeline: "60-Day Leasing Surge",
    desc: "Elevated an Orlando multifamily apartment community above national listing portals, delivering 2,823 website visits and 1,576 direction requests from local Google Maps searches.",
    highlight: "4,798 Renter Actions",
    img: "/images/blog-img-03.jpg",
    metrics: [
      { val: "4,798", lbl: "Renter Google Actions" },
      { val: "2,823", lbl: "Website Clicks from GBP" },
      { val: "1,576", lbl: "Direction Requests" },
    ],
    services: ["Apartment Community SEO", "GBP Management", "Website Search", "Tour Booking"],
  },
  {
    title: "5,067 Customer Calls in 60 Days for Two Houston Auto Repair Shops",
    client: "Eric’s Car Care",
    category: "Local & Automotive Services",
    timeline: "Omnichannel Auto Care",
    desc: "Synchronized Google Ads, Local Services Ads (LSA), Business Profiles, and SEO across two Kirby Drive repair shops in Houston, capturing 5,067 customer calls with a 97% answer rate.",
    highlight: "5,067 Customer Calls",
    img: "/images/blog-img-06.jpg",
    metrics: [
      { val: "5,067", lbl: "Tracked Customer Calls" },
      { val: "97%", lbl: "Calls Answered" },
      { val: "1,402", lbl: "Google Ads Conversions" },
    ],
    services: ["Google Ads", "Local Services Ads (LSA)", "GBP Optimization", "Auto Repair SEO"],
  },
  {
    title: "Doubling the Area Where They Rank Top 3 in Google Maps in Four Months",
    client: "AFA Movers",
    category: "Local & Automotive Services",
    timeline: "4-Month Map-Pack Scale",
    desc: "Expanded Google Maps top-3 radius from 31% to 64% of their 6-mile Sugar Land/Houston service territory, elevating commercial, residential, and piano moving queries into top positions.",
    highlight: "2x Maps Top-3 Coverage",
    img: "/images/contact-strategy-consultation.jpg",
    metrics: [
      { val: "2×", lbl: "Top-3 Maps Coverage (64%)" },
      { val: "93%", lbl: "Local Top-10 Coverage" },
      { val: "7.5 → 3.9", lbl: "Avg Maps Rank Position" },
    ],
    services: ["Maps Pack SEO", "Google Business Profile", "Grid Rank Tracking", "Local Relevance"],
  },
  {
    title: "From Invisible to the Google Maps Top 10 for New York Car Shipping Searches",
    client: "E&G Elite",
    category: "Retail & Transport",
    timeline: "6-Month Grid Expansion",
    desc: "Enabled a Manhattan-based vehicle transport carrier to outrank national broker aggregators, scaling top-10 Google Maps coverage from 0% to 59% across a 6-mile NYC grid.",
    highlight: "0% → 59% Maps Top-10",
    img: "/images/contact-tech-discussion.jpg",
    metrics: [
      { val: "0% → 59%", lbl: "Maps Top-10 Coverage" },
      { val: "77%", lbl: "NYC Grid Top-10 Coverage" },
      { val: "74%", lbl: "Calls from Google Profile" },
    ],
    services: ["Local SEO", "Google Business Profile", "Call Tracking", "Maps Grid Tracking"],
  },
  {
    title: "From Not in the Top 100 to #1 on Google for 14 Local Searches",
    client: "Smoke It Up",
    category: "Retail & Transport",
    timeline: "Multi-Location Retail Climb",
    desc: "Transformed visibility for two Texas retail locations (Angleton & Cypress), propelling 14 keywords to #1 on Google and generating 122.4K search impressions and 287 phone calls in 60 days.",
    highlight: "14 #1 Google Rankings",
    img: "/images/blog-img-05.jpg",
    metrics: [
      { val: "14", lbl: "Keywords at #1 on Google" },
      { val: "23 / 27", lbl: "Keywords in Top-3 Organic" },
      { val: "122.4K", lbl: "Search Impressions (60 Days)" },
    ],
    services: ["Local SEO", "GBP Management", "Content Optimization", "Store Foot-Traffic"],
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
      : caseStudiesList.filter((s) => s.category === selectedCategory);

  return (
    <>
      <Header />
      <main className="res-page-wrap">
        {/* Editorial Hero Header */}
        <section style={{ paddingTop: "40px", paddingBottom: "32px" }}>
          <div className="res-container">
            <div className="asx-breadcrumb" style={{ marginBottom: "20px" }}>
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/resources">Resources</Link>
              <span>/</span>
              <span className="asx-breadcrumb-current">Case Studies</span>
            </div>

            <div style={{ maxWidth: "860px" }}>
              <div className="res-tag">
                <span className="res-tag-dot" />
                PROVEN CASE STUDIES &amp; IMPACT
              </div>
              <h1
                style={{
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

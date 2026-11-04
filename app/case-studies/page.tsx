"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResourceCtaBanner from "@/components/ResourceCtaBanner";
import { CASE_STUDIES } from "@/data/case-studies";

const filterTabs = [
  "All Case Studies",
  "Healthcare & Emergency Care",
  "Legal & Law Firms",
  "Real Estate & Multifamily",
  "Local & Automotive Services",
  "Finance & Professional",
  "Retail & Transport",
];

const featuredStudy = CASE_STUDIES[0];

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
      ? CASE_STUDIES
      : CASE_STUDIES.filter((s) => s.category === selectedCategory);

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
              <Link href={`/case-studies/${featuredStudy.slug}`} className="res-featured-img-wrap">
                <img
                  src={featuredStudy.img}
                  alt={featuredStudy.title}
                  className="res-featured-img"
                />
                <span
                  style={{
                    position: "absolute",
                    top: "18px",
                    right: "18px",
                    background: "#0f172a",
                    color: "#7c3aed",
                    fontSize: "13.5px",
                    fontWeight: 800,
                    padding: "6px 14px",
                    borderRadius: "20px",
                    letterSpacing: "0.02em",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                    border: "1px solid rgba(222, 242, 92, 0.35)",
                  }}
                >
                  {featuredStudy.highlight}
                </span>
              </Link>

              <div className="res-featured-content">
                <div className="res-tag">
                  <span className="res-tag-dot" />
                  {featuredStudy.tag}
                </div>

                <Link
                  href={`/case-studies/${featuredStudy.slug}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <h2 className="res-featured-title" style={{ fontSize: "clamp(26px, 3.2vw, 38px)" }}>
                    {renderGradientHeading(featuredStudy.title)}
                  </h2>
                </Link>

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

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                  <Link href={`/case-studies/${featuredStudy.slug}`} className="res-btn-dark">
                    Read Full Case Study
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
                  <Link
                    href="/contact"
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#4f46e5",
                      textDecoration: "none",
                      padding: "10px 16px",
                    }}
                  >
                    Discuss Similar Strategy &rarr;
                  </Link>
                </div>
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
                  <Link href={`/case-studies/${study.slug}`} className="res-card-img-wrap">
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
                  </Link>

                  <div className="res-card-body">
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                      Client: {study.client}
                    </div>
                    <Link
                      href={`/case-studies/${study.slug}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <h3 className="res-card-title">{study.title}</h3>
                    </Link>
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
                        href={`/case-studies/${study.slug}`}
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
                        Read Full Case Study
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

        {/* High-Converting CTA Banner */}
        <ResourceCtaBanner />
      </main>
      <Footer />
    </>
  );
}

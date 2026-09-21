"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function ArrowDownRightSvg({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="7" x2="17" y2="17" />
      <polyline points="17 7 17 17 7 17" />
    </svg>
  );
}

const industriesData = [
  {
    id: "healthcare",
    title: "Healthcare & Clinics",
    tagline: "Doctor-led educational content, patient acquisition & clinic growth",
    href: "/industries/healthcare",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
        <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
        <circle cx="20" cy="10" r="2" />
      </svg>
    ),
  },
  {
    id: "professional-services",
    title: "Professional Services",
    tagline: "High-trust executive authority, thought leadership & B2B explainers",
    href: "/industries/professional-services",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    id: "it-saas",
    title: "IT & SaaS",
    tagline: "Product demos, feature walkthroughs & user acquisition funnels",
    href: "/industries/it-saas",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="m9 8 3 3-3 3" />
        <line x1="15" y1="16" x2="15.01" y2="16" />
      </svg>
    ),
  },
  {
    id: "real-estate",
    title: "Real Estate",
    tagline: "Cinematic property tours, agent authority & luxury development leads",
    href: "/industries/real-estate",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: "travel-hospitality",
    title: "Travel & Hospitality",
    tagline: "Experience showcases, resort tours & direct booking acceleration",
    href: "/industries/travel-hospitality",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
  {
    id: "home-services",
    title: "Home Services",
    tagline: "Job showcase reels, customer testimonials & local service leads",
    href: "/industries/home-services",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    id: "education",
    title: "Education & EdTech",
    tagline: "Course previews, student testimonial funnels & enrollment ads",
    href: "/industries/education",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    id: "ecommerce",
    title: "eCommerce & Retail",
    tagline: "Viral TikTok/Reel ads, 3D unboxing & high-converting product videos",
    href: "/industries/ecommerce",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    id: "interior-design",
    title: "Interior Design & Architecture",
    tagline: "High-end aesthetic walk-throughs & portfolio transformation reels",
    href: "/industries/interior-design",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];

export default function IndustriesOverviewHub() {
  return (
    <div className="asx-page">
      <Header />

      <main style={{ paddingTop: "100px", paddingBottom: "80px" }}>
        <section style={{ backgroundColor: "#f4f5f5", padding: "64px 0", borderBottom: "1px solid #e5eaee" }}>
          <div className="asx-container" style={{ textAlign: "center" }}>
            <div className="asx-tag-pill" style={{ marginBottom: "16px" }}>
              <span className="asx-tag-dot" />
              <span>Full-Stack Industry Solutions</span>
            </div>

            <h1 style={{ fontSize: "48px", fontWeight: 800, color: "#001d28", margin: "0 0 16px", letterSpacing: "-0.03em" }}>
              Industries We Scale with <span style={{ color: "#0b7b8b" }}>Marketing & AI</span>
            </h1>
            <p style={{ fontSize: "16px", color: "#2c436b", maxWidth: "600px", margin: "0 auto" }}>
              Select your industry below to explore tailored growth strategies, proven conversion funnels, and automated AI systems.
            </p>
          </div>
        </section>

        <section style={{ padding: "64px 0" }}>
          <div className="asx-container">
            <div className="asx-hub-grid">
              {industriesData.map((item) => (
                <Link key={item.id} href={item.href} className="asx-hub-card">
                  <div>
                    <div className="asx-hub-icon">
                      {item.icon}
                    </div>
                    <h2 className="asx-hub-title">{item.title}</h2>
                    <p className="asx-hub-tagline">{item.tagline}</p>
                  </div>
                  <div className="asx-hub-footer">
                    <span>Explore Subpage</span>
                    <ArrowDownRightSvg size={14} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

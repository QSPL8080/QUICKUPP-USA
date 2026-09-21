"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const industriesData = [
  {
    id: "healthcare",
    category: "Healthcare & Wellness",
    title: "Healthcare",
    tagline: "Patients, Trust & Growth",
    desc: "Grow your healthcare brand, reach more patients, and build lasting clinical trust with medical SEO, patient lead gen, and HIPAA-compliant AI.",
    href: "/industries/healthcare",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
    pills: ["Healthcare SEO", "Google Ads", "Patient Lead Gen", "AI Automation"],
  },
  {
    id: "education",
    category: "Education & Services",
    title: "Education",
    tagline: "Admissions & Student Enrolment",
    desc: "Attract more students, generate high-intent admissions enquiries, and scale student enrolments for colleges, institutes, and edtech platforms.",
    href: "/industries/education",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    pills: ["Admissions Funnels", "Student SEO", "Paid Campaigns", "Enrolment AI"],
  },
  {
    id: "real-estate",
    category: "Real Estate & Commerce",
    title: "Real Estate",
    tagline: "High-Ticket Property Leads",
    desc: "Generate qualified buyer and seller enquiries, book more on-site visits, and accelerate property sales with geo-targeted ads and automated CRM.",
    href: "/industries/real-estate",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    pills: ["Property Ads", "Local SEO", "Site Visit Booking", "AI Lead Nurture"],
  },
  {
    id: "home-services",
    category: "Home Services & Design",
    title: "Home Services",
    tagline: "Booked Calendars & Inbound Jobs",
    desc: "Fill your appointment calendar with high-ticket residential and commercial service calls through Google Local Services Ads, SEO, and instant booking.",
    href: "/industries/home-services",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    pills: ["Google LSA", "Local SEO", "Job Lead Gen", "Call Automation"],
  },
  {
    id: "it-saas",
    category: "Technology & SaaS",
    title: "IT & SaaS",
    tagline: "Pipeline, MRR & User Acquisition",
    desc: "Accelerate MRR, scale qualified enterprise demos, reduce CAC, and improve trial-to-paid conversion with high-performance B2B demand gen.",
    href: "/industries/it-saas",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="m9 8 3 3-3 3" />
        <line x1="15" y1="16" x2="15.01" y2="16" />
      </svg>
    ),
    pills: ["SaaS Demand Gen", "Product Marketing", "Demo Pipelines", "Full-Stack Dev"],
  },
  {
    id: "interior-design",
    category: "Home Services & Design",
    title: "Interior Design",
    tagline: "High-Budget Client Acquisition",
    desc: "Attract luxury homeowners and commercial clients, showcase your visual portfolio, and turn website visitors into high-ticket design contracts.",
    href: "/industries/interior-design",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.29 7 12 12 20.71 7" />
        <line x1="12" y1="22" x2="12" y2="12" />
      </svg>
    ),
    pills: ["Visual Marketing", "Portfolio SEO", "Luxury Funnels", "Social Reels"],
  },
  {
    id: "professional-services",
    category: "Education & Services",
    title: "Professional Services",
    tagline: "Authority & High-Retainer Clients",
    desc: "Position legal, financial, and consulting firms as industry leaders while generating high-value client enquiries and executive retainers.",
    href: "/industries/professional-services",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    pills: ["Thought Leadership", "B2B Lead Gen", "Authority SEO", "CRM Systems"],
  },
  {
    id: "ecommerce",
    category: "Real Estate & Commerce",
    title: "eCommerce",
    tagline: "ROAS, Scale & Customer Retention",
    desc: "Scale direct-to-consumer and B2B eCommerce revenue with performance ads, retention marketing, conversion optimization, and automated workflows.",
    href: "/industries/ecommerce",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
    ),
    pills: ["Performance Ads", "Email & SMS Nurture", "Shopify/Web CRO", "Omnichannel AI"],
  },
  {
    id: "travel-hospitality",
    category: "Real Estate & Commerce",
    title: "Travel & Hospitality",
    tagline: "Direct Bookings & Occupancy",
    desc: "Increase direct guest bookings, reduce OTA commissions, and maximize seasonal occupancy for hotels, resorts, travel agencies, and luxury stays.",
    href: "/industries/travel-hospitality",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
      </svg>
    ),
    pills: ["Direct Booking Funnels", "Hospitality SEO", "Guest AI Concierge", "Brand Media"],
  },
];

const categories = [
  "All Industries",
  "Healthcare & Wellness",
  "Technology & SaaS",
  "Real Estate & Commerce",
  "Education & Services",
  "Home Services & Design",
];

export default function IndustriesOverviewHub() {
  const [activeCategory, setActiveCategory] = useState("All Industries");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredIndustries =
    activeCategory === "All Industries"
      ? industriesData
      : industriesData.filter((item) => item.category === activeCategory);

  const faqs = [
    {
      q: "Why should we choose industry-specific growth strategies rather than generic marketing?",
      a: "Every industry operates with different buyer behaviors, sales cycles, regulatory considerations, and competitive benchmarks. Generic marketing fails to address customer friction points. Our industry-tailored systems align SEO keywords, ad messaging, AI qualification, and tech integrations directly with how your specific customers make buying decisions.",
    },
    {
      q: "How quickly can we expect to see results for our industry?",
      a: "Performance campaigns (Google & Meta Ads, AI Lead Automation) typically generate qualified inquiries within the first 7 to 14 days. Organic channels like SEO, Content Authority, and AEO compound strongly between months 2 and 6 to create an enduring, cost-efficient customer acquisition pipeline.",
    },
    {
      q: "Can you integrate with our existing industry software and CRM?",
      a: "Yes. We integrate seamlessly with all major CRMs, EHR/EMR healthcare systems, Real Estate MLS and lead portals, Learning Management Systems (LMS), ERPs, Shopify/Magento stores, and custom software stacks via automated webhooks and REST APIs.",
    },
    {
      q: "Do you handle HIPAA, legal compliance, and data privacy requirements?",
      a: "Yes. Our campaigns, landing pages, tracking mechanisms, and AI workflows strictly adhere to industry-specific compliance standards including HIPAA, GDPR, CAN-SPAM, and financial data privacy guidelines.",
    },
    {
      q: "What does the onboarding and kickoff process look like?",
      a: "After an initial discovery and competitor audit, we deliver a 90-day sector growth roadmap within 5 business days. Once approved, our team sets up tracking, configures campaigns, launches optimized landing assets, and activates AI automation workflows.",
    },
  ];

  return (
    <div className="ind-page-wrapper">
      <Header />


      {/* 1. HERO SECTION */}
      <section className="ind-hero-section">
        <div className="ind-hero-glow" />
        <div className="w-layout-blockcontainer container w-container">
          <div className="ind-hero-content">
            <div className="ind-badge">
              <span className="ind-badge-dot" />
              Tailored Sector Solutions
            </div>
            <h1 className="ind-hero-title">
              Marketing, AI &amp; Technology Built for{" "}
              <span className="ind-gradient-text">High-Growth Industries</span>
            </h1>
            <p className="ind-hero-desc">
              We engineer specialized customer acquisition funnels, custom web platforms, and automated operations tailored to the exact dynamics of your sector.
            </p>
            <div className="ind-hero-actions">
              <Link href="/contact" className="ind-btn-primary">
                Get Industry Growth Audit
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </Link>
              <a href="#industries-grid" className="ind-btn-secondary">
                Explore All 9 Sectors
              </a>
            </div>

            {/* Stats Strip */}
            <div className="ind-stats-strip">
              <div className="ind-stat-item">
                <span className="ind-stat-val">9+</span>
                <span>Dedicated Sectors</span>
              </div>
              <span style={{ opacity: 0.2 }}>•</span>
              <div className="ind-stat-item">
                <span className="ind-stat-val">3.8x</span>
                <span>Average ROI</span>
              </div>
              <span style={{ opacity: 0.2 }}>•</span>
              <div className="ind-stat-item">
                <span className="ind-stat-val">98%</span>
                <span>Client Retention</span>
              </div>
              <span style={{ opacity: 0.2 }}>•</span>
              <div className="ind-stat-item">
                <span className="ind-stat-val">24/7</span>
                <span>Support &amp; Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE FILTERABLE 9-CARD SHOWCASE GRID */}
      <section id="industries-grid" style={{ padding: "80px 0 96px" }}>
        <div className="w-layout-blockcontainer container w-container">
          {/* Filter Bar */}
          <div className="ind-filter-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={"ind-filter-btn " + (activeCategory === cat ? "active" : "")}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="ind-cards-grid">
            {filteredIndustries.map((ind) => (
              <Link key={ind.id} href={ind.href} className="ind-card">
                <div>
                  <div className="ind-card-top">
                    <div className="ind-card-icon">{ind.icon}</div>
                    <span className="ind-card-tag">{ind.title}</span>
                  </div>
                  <h3 className="ind-card-title">{ind.title}</h3>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#7c3aed", marginBottom: "8px" }}>
                    {ind.tagline}
                  </div>
                  <p className="ind-card-desc">{ind.desc}</p>
                </div>

                <div>
                  <div className="ind-card-pills">
                    {ind.pills.map((p, idx) => (
                      <span key={idx} className="ind-card-pill">
                        {p}
                      </span>
                    ))}
                  </div>
                  <div className="ind-card-footer">
                    <span>Explore Solutions</span>
                    <span className="ind-card-arrow">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 4-STEP INDUSTRY GROWTH PROCESS */}
      <section className="ind-process-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="ind-section-header">
            <div className="ind-badge">
              <span className="ind-badge-dot" />
              Our Methodology
            </div>
            <h2 className="ind-section-title">
              How We Engineer Growth for Your Industry
            </h2>
            <p className="ind-hero-desc">
              A structured 4-step execution framework designed to systematically scale your customer pipeline and operational efficiency.
            </p>
          </div>

          <div className="ind-process-grid">
            <div className="ind-process-card">
              <span className="ind-process-num">01 / AUDIT</span>
              <h3 className="ind-process-card-title">Sector &amp; Competitor Audit</h3>
              <p className="ind-process-card-desc">
                We analyze your market position, competitor keywords, audience demand trends, and conversion leakage to identify the highest-ROI opportunities.
              </p>
            </div>

            <div className="ind-process-card">
              <span className="ind-process-num">02 / STRATEGY</span>
              <h3 className="ind-process-card-title">Custom Funnel Architecture</h3>
              <p className="ind-process-card-desc">
                We craft an omnichannel acquisition plan integrating SEO, paid media, high-converting landing pages, and tailored messaging for your sector.
              </p>
            </div>

            <div className="ind-process-card">
              <span className="ind-process-num">03 / AI INTEGRATION</span>
              <h3 className="ind-process-card-title">Automation &amp; Operations</h3>
              <p className="ind-process-card-desc">
                We deploy intelligent AI chatbots, automated lead qualification, CRM synchronization, and instant follow-ups to maximize lead conversion.
              </p>
            </div>

            <div className="ind-process-card">
              <span className="ind-process-num">04 / SCALE &amp; ROI</span>
              <h3 className="ind-process-card-title">Continuous Optimization</h3>
              <p className="ind-process-card-desc">
                We track performance metrics in real-time, optimize CAC and ROAS, and scale budget across high-performing channels for compounding growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="ind-faq-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="ind-section-header">
            <div className="ind-badge">
              <span className="ind-badge-dot" />
              Got Questions?
            </div>
            <h2 className="ind-section-title">Frequently Asked Questions</h2>
            <p className="ind-hero-desc">
              Everything you need to know about our industry-specialized growth models and onboarding.
            </p>
          </div>

          <div className="ind-faq-list">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className={"ind-faq-card " + (isOpen ? "open" : "")}>
                  <button
                    type="button"
                    className="ind-faq-question-btn"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                  >
                    <span>{faq.q}</span>
                    <span className="ind-faq-toggle-icon">+</span>
                  </button>
                  {isOpen && <div className="ind-faq-answer">{faq.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. CLOSING CONVERSION CTA */}
      <section className="ind-cta-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="ind-cta-box">
            <div className="ind-badge" style={{ background: "rgba(255, 255, 255, 0.1)", color: "#00d2ff", borderColor: "rgba(255, 255, 255, 0.2)" }}>
              <span className="ind-badge-dot" style={{ background: "#00d2ff" }} />
              Ready to Accelerate?
            </div>
            <h2 className="ind-cta-title">
              Let&apos;s Build an Industry-Dominating Growth System
            </h2>
            <p className="ind-cta-desc">
              Schedule a strategy call with our growth specialists to discover how we can transform your customer acquisition and operations.
            </p>
            <div className="ind-hero-actions">
              <Link href="/contact" className="ind-btn-primary">
                Book Your Growth Consultation
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

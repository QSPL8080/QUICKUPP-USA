import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResourceCtaBanner from "@/components/ResourceCtaBanner";
import CaseStudyShare from "@/components/CaseStudyShare";
import { getAllCaseStudySlugs, getCaseStudyBySlug, CASE_STUDIES } from "@/data/case-studies";
import "@/app/case-study-detail.css";

export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = getAllCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) {
    return { title: "Case Study | Quickupp Softech" };
  }

  return {
    title: `${study.title} | ${study.client} Case Study | Quickupp Softech`,
    description: study.desc,
    openGraph: {
      title: `${study.title} - ${study.client}`,
      description: study.desc,
      images: [{ url: study.img, width: 1200, height: 630, alt: study.title }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: study.title,
      description: study.desc,
      images: [study.img],
    },
  };
}

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

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);

  if (!study) {
    notFound();
  }

  // Related studies: pick up to 3 studies (prefer same category, fallback to others)
  const otherStudies = CASE_STUDIES.filter((c) => c.slug !== study.slug);
  const sameCat = otherStudies.filter((c) => c.category === study.category);
  const diffCat = otherStudies.filter((c) => c.category !== study.category);
  const relatedStudies = [...sameCat, ...diffCat].slice(0, 3);

  return (
    <>
      <Header />
      <main className="csd-page">
        {/* Hero Section */}
        <section className="csd-hero">
          <div className="csd-container">
            {/* Breadcrumb */}
            <div className="csd-breadcrumbs">
              <Link href="/">Home</Link>
              <span className="csd-breadcrumbs-sep">/</span>
              <Link href="/resources">Resources</Link>
              <span className="csd-breadcrumbs-sep">/</span>
              <Link href="/case-studies">Case Studies</Link>
              <span className="csd-breadcrumbs-sep">/</span>
              <span className="csd-breadcrumbs-current">{study.client}</span>
            </div>

            {/* Badges */}
            <div className="csd-header-badges">
              <span className="csd-badge-pill">{study.category}</span>
              <span className="csd-badge-pill csd-badge-pill-dark">{study.highlight}</span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#64748b",
                  marginLeft: "auto",
                }}
              >
                {study.timeline}
              </span>
            </div>

            {/* Title */}
            <h1 className="csd-title">{renderGradientHeading(study.title)}</h1>

            {/* Lead Description */}
            <p className="csd-lead">{study.desc}</p>

            {/* Meta Bar */}
            <div className="csd-meta-bar">
              <div className="csd-meta-item">
                <span className="csd-meta-label">Client</span>
                <span className="csd-meta-value">{study.client}</span>
              </div>
              <div className="csd-meta-item">
                <span className="csd-meta-label">Industry</span>
                <span className="csd-meta-value">{study.industry}</span>
              </div>
              <div className="csd-meta-item">
                <span className="csd-meta-label">Location</span>
                <span className="csd-meta-value">{study.location}</span>
              </div>
              <div className="csd-meta-item">
                <span className="csd-meta-label">Timeline / Engagement</span>
                <span className="csd-meta-value">{study.timeline}</span>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="csd-metrics-ribbon">
              {study.metrics.map((m, idx) => (
                <div key={idx} className="csd-metric-card">
                  <div className="csd-metric-val">{m.val}</div>
                  <div className="csd-metric-lbl">{m.lbl}</div>
                </div>
              ))}
            </div>

            {/* Hero Visual Showcase */}
            <div className="csd-hero-visual">
              <img src={study.img} alt={study.title} />
              <div className="csd-hero-visual-overlay">
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 800,
                      color: "#93c5fd",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "4px",
                    }}
                  >
                    Verified Case Analysis
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>
                    {study.client} &bull; {study.location}
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(222, 242, 92, 0.4)",
                    color: "#7c3aed",
                    fontSize: "14px",
                    fontWeight: 800,
                    padding: "8px 16px",
                    borderRadius: "14px",
                  }}
                >
                  {study.highlight}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2-Column Main Layout */}
        <section className="csd-layout-section">
          <div className="csd-container">
            <div className="csd-layout-grid">
              {/* Left Column: Full Case Details */}
              <div className="csd-main-col">
                {/* 1. The Challenge */}
                <article className="csd-card-block">
                  <div className="csd-eyebrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                    The Obstacle &amp; Baseline State
                  </div>
                  <h2 className="csd-section-title">{study.challenge.heading}</h2>
                  <div className="csd-prose">
                    {study.challenge.paragraphs.map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </article>

                {/* 2. What We Did */}
                <article className="csd-card-block">
                  <div className="csd-eyebrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                      <rect x="9" y="9" width="6" height="6" />
                      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
                    </svg>
                    Strategic Execution &amp; Engineering
                  </div>
                  <h2 className="csd-section-title">{study.whatWeDid.heading}</h2>
                  <div className="csd-prose">
                    <p style={{ fontWeight: 500, fontSize: "17px", color: "#1e293b" }}>
                      {study.whatWeDid.summary}
                    </p>
                  </div>

                  {/* Strategy Steps */}
                  <div className="csd-steps-grid">
                    {study.whatWeDid.steps.map((step, idx) => (
                      <div key={idx} className="csd-step-item">
                        <div className="csd-step-number">
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                        <div className="csd-step-content">
                          <h3 className="csd-step-title">{step.title}</h3>
                          <p className="csd-step-desc">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                {/* 3. The Results */}
                <article className="csd-card-block">
                  <div className="csd-eyebrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                    Measurable Results &amp; ROI
                  </div>
                  <h2 className="csd-section-title">{study.results.heading}</h2>
                  <div className="csd-prose">
                    {study.results.paragraphs.map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>

                  {/* Highlight Callout */}
                  <div className="csd-highlight-box">
                    <div className="csd-highlight-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 800,
                          color: "#059669",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "4px",
                        }}
                      >
                        Key Verified Achievement
                      </div>
                      <p className="csd-highlight-text">
                        {study.highlight} achieved through synchronized marketing &amp; technology execution.
                      </p>
                    </div>
                  </div>
                </article>

                {/* 4. What's Next */}
                <article className="csd-card-block">
                  <div className="csd-eyebrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                    </svg>
                    Ongoing Roadmap &amp; Scaling
                  </div>
                  <h2 className="csd-section-title">{study.whatsNext.heading}</h2>
                  <div className="csd-prose">
                    {study.whatsNext.paragraphs.map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </article>

                {/* 5. Data Sources Transparency */}
                <div className="csd-audit-note">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>
                    <strong>Verification &amp; Audit Note:</strong> {study.dataSources}
                  </span>
                </div>
              </div>

              {/* Right Column: Sticky Sidebar */}
              <aside className="csd-sidebar">
                {/* Project Specs */}
                <div className="csd-side-card">
                  <h3 className="csd-side-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    Case Snapshot
                  </h3>
                  <div className="csd-spec-row">
                    <span className="csd-spec-key">Client</span>
                    <span className="csd-spec-val">{study.client}</span>
                  </div>
                  <div className="csd-spec-row">
                    <span className="csd-spec-key">Industry</span>
                    <span className="csd-spec-val">{study.industry}</span>
                  </div>
                  <div className="csd-spec-row">
                    <span className="csd-spec-key">Geography</span>
                    <span className="csd-spec-val">{study.location}</span>
                  </div>
                  <div className="csd-spec-row">
                    <span className="csd-spec-key">Duration</span>
                    <span className="csd-spec-val">{study.timeline}</span>
                  </div>

                  <div style={{ marginTop: "18px" }}>
                    <span className="csd-meta-label">Delivered Capabilities</span>
                    <div className="csd-services-pills">
                      {study.services.map((srv, idx) => (
                        <span key={idx} className="csd-srv-pill">
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Conversion Card */}
                <div className="csd-cta-card">
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#7c3aed",
                      fontSize: "12px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "10px",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    Ready for Similar Impact?
                  </div>
                  <h3 className="csd-cta-title">
                    Engineer Your Next Growth Sprint
                  </h3>
                  <p className="csd-cta-desc">
                    Get an in-depth performance audit and a tailored growth roadmap built for your industry.
                  </p>
                  <Link href="/contact" className="csd-cta-btn">
                    Schedule Strategy Session
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </Link>

                  <div
                    style={{
                      marginTop: "16px",
                      fontSize: "12px",
                      color: "#94a3b8",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>Or call: +1 (346) 660-2443</span>
                  </div>
                </div>

                {/* Share Card */}
                <div className="csd-side-card">
                  <h3 className="csd-side-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    Share Case Study
                  </h3>
                  <CaseStudyShare title={study.title} />
                </div>

                {/* Back to Case Studies link */}
                <div style={{ textAlign: "center", paddingTop: "8px" }}>
                  <Link
                    href="/case-studies"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#4f46e5",
                      textDecoration: "none",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back to All Case Studies
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Related Case Studies */}
        <section className="csd-related-section">
          <div className="csd-container">
            <div className="csd-related-header">
              <div>
                <div className="csd-eyebrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                  More Verified Case Studies
                </div>
                <h2 className="csd-related-title">
                  Explore More Client Success Stories
                </h2>
              </div>
              <Link href="/case-studies" className="csd-view-all-link">
                View All 16 Case Studies
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="res-grid-3">
              {relatedStudies.map((r, idx) => (
                <article key={idx} className="res-card">
                  <Link href={`/case-studies/${r.slug}`} className="res-card-img-wrap">
                    <img src={r.img} alt={r.title} />
                    <span className="res-card-badge">{r.category}</span>
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
                      {r.highlight}
                    </span>
                  </Link>

                  <div className="res-card-body">
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "6px",
                      }}
                    >
                      Client: {r.client}
                    </div>
                    <Link
                      href={`/case-studies/${r.slug}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <h3 className="res-card-title">{r.title}</h3>
                    </Link>
                    <p className="res-card-desc">{r.desc}</p>

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
                      {r.metrics.map((m, mIdx) => (
                        <div key={mIdx}>
                          <div
                            style={{
                              fontSize: "14.5px",
                              fontWeight: 800,
                              color: "#0f172a",
                              lineHeight: 1.1,
                              marginBottom: "2px",
                            }}
                          >
                            {m.val}
                          </div>
                          <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>
                            {m.lbl}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        marginTop: "auto",
                        paddingTop: "14px",
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      <Link
                        href={`/case-studies/${r.slug}`}
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
                          <path d="M5 12h14" />
                          <path d="M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <ResourceCtaBanner />
      </main>
      <Footer />
    </>
  );
}

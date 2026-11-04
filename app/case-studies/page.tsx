import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResourceMotion from "@/components/ResourceMotion";
import { CASE_STUDY_ORDER, caseStudyKickerParts, getCaseStudyDoc, headlineStats, infoValue } from "@/lib/caseStudies";
import "@/app/case-studies-list.css";

export const metadata: Metadata = {
  title: "Case Studies | Quickupp Softech",
  description: "Client case studies from Quickupp Softech: Google Ads, Google Business Profiles, SEO and call tracking results.",
  alternates: {
    canonical: "https://www.quickuppsoftech.us/case-studies",
  },
};

/*
 * Case studies list: one row per case study, using only what its document
 * says (kicker, title, introduction, client, services and the first three
 * headline results).
 */
export default function CaseStudiesPage() {
  const studies = CASE_STUDY_ORDER.map((slug) => ({ slug, doc: getCaseStudyDoc(slug) })).filter(
    (s): s is { slug: (typeof CASE_STUDY_ORDER)[number]; doc: NonNullable<ReturnType<typeof getCaseStudyDoc>> } => Boolean(s.doc)
  );

  return (
    <>
      <Header />
      <main className="csl-page">
        <section className="csl-hero">
          <div className="csl-container">
            <div className="asx-breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/resources">Resources</Link>
              <span>/</span>
              <span className="asx-breadcrumb-current">Case Studies</span>
            </div>
            <h1 className="csl-h1">
              Case <span className="qs-gradient-text">Studies</span>
            </h1>
          </div>
        </section>

        <section className="csl-list-section">
          <div className="csl-container">
            <div className="csl-list">
              {studies.map(({ slug, doc }) => {
                const stats = headlineStats(doc).slice(0, 3);
                return (
                  <article key={slug} className="csl-row">
                    <div className="csl-meta">
                      <span className="csl-kicker">{caseStudyKickerParts(doc.kicker).join(" · ")}</span>
                      <span className="csl-client">{infoValue(doc, "Client")}</span>
                      <span className="csl-services">{infoValue(doc, "Services")}</span>
                    </div>
                    <div className="csl-main">
                      <h2 className="csl-title">
                        <Link href={`/case-studies/${slug}`}>{doc.title}</Link>
                      </h2>
                      <p className="csl-intro">{doc.intro}</p>
                      {stats.length > 0 && (
                        <dl className="csl-stats">
                          {stats.map((s) => (
                            <div key={s.val + s.lbl} className="csl-stat">
                              <dt>{s.val}</dt>
                              <dd>{s.lbl}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                      <Link href={`/case-studies/${slug}`} className="csl-more">
                        <span>Read Full Case Study</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
        <ResourceMotion variant="cases" />
      </main>
      <Footer />
    </>
  );
}

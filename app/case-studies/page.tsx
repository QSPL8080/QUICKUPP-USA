import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CaseStudiesGrid, { type CaseCard } from "@/components/CaseStudiesGrid";
import { CASE_STUDY_ORDER, caseStudyArea, caseStudyCover, getCaseStudyDoc, headlineStats, infoValue } from "@/lib/caseStudies";
import "@/app/case-studies-list.css";

export const metadata: Metadata = {
  title: "Case Studies | Quickupp Softech",
  description: "Client case studies from Quickupp Softech: Google Ads, Google Business Profiles, SEO and call tracking results.",
  alternates: {
    canonical: "https://www.quickuppsoftech.us/case-studies",
  },
};

/*
 * Case studies list ("cl-"): a hero with a moving reel of each client's
 * headline result, then category chips, a featured study and a magazine grid.
 * Every word and number comes from the case study documents.
 */
export default function CaseStudiesPage() {
  const cards: CaseCard[] = CASE_STUDY_ORDER.flatMap((slug) => {
    const doc = getCaseStudyDoc(slug);
    if (!doc) return [];
    const { area, sector } = caseStudyArea(doc);
    return [
      {
        slug,
        title: doc.title,
        intro: doc.intro,
        client: infoValue(doc, "Client"),
        location: infoValue(doc, "Location"),
        services: infoValue(doc, "Services"),
        area,
        sector,
        stats: headlineStats(doc).slice(0, 3),
        cover: caseStudyCover(slug),
      },
    ];
  });

  // the reel: each client's first headline result, in two columns moving opposite ways
  const reel = cards.filter((c) => c.stats[0]).map((c) => ({ slug: c.slug, client: c.client, val: c.stats[0].val, lbl: c.stats[0].lbl }));
  const half = Math.ceil(reel.length / 2);
  const cols = [reel.slice(0, half), reel.slice(half)];

  return (
    <>
      <Header />
      <main className="cl-page">
        <section className="cl-hero">
          <div className="cl-container cl-hero-grid">
            <div className="cl-hero-copy">
              <div className="asx-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/resources">Resources</Link>
                <span>/</span>
                <span className="asx-breadcrumb-current">Case Studies</span>
              </div>
              <h1 className="cl-h1">
                <span className="cl-h1-line">Case</span>{" "}
                <span className="cl-h1-line">
                  <span className="qs-gradient-text">Studies</span>
                </span>
              </h1>
            </div>

            <div className="cl-reel" aria-hidden="true">
              {cols.map((col, ci) => (
                <div key={ci} className={`cl-reel-col${ci === 1 ? " is-down" : ""}`}>
                  {[0, 1].map((rep) => (
                    <div key={rep} className="cl-reel-track">
                      {col.map((r) => (
                        <div key={`${rep}-${r.slug}`} className="cl-reel-card">
                          <strong>{r.val}</strong>
                          <span className="cl-reel-lbl">{r.lbl}</span>
                          <span className="cl-reel-client">{r.client}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cl-list">
          <div className="cl-container">
            <CaseStudiesGrid cards={cards} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

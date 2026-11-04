import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { CsBlock } from "@/data/case-study-docs";
import { CASE_STUDY_ORDER, getCaseStudyDoc } from "@/lib/caseStudies";
import "@/app/case-study-detail.css";

/*
 * One case study, exactly as its document is written: the same headings,
 * text, results, tables, charts and closing box, in the same order.
 */

export function generateStaticParams() {
  return CASE_STUDY_ORDER.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getCaseStudyDoc(slug);
  if (!doc) return { title: "Case Study | Quickupp Softech" };
  return {
    title: `${doc.title} | Quickupp Softech`,
    description: doc.intro,
    alternates: {
      canonical: `https://www.quickuppsoftech.us/case-studies/${slug}`,
    },
    openGraph: { title: doc.title, description: doc.intro, type: "article" },
  };
}

/* the document's sections start at each small uppercase label (THE CHALLENGE, RESULTS · …) */
function toSections(blocks: CsBlock[]) {
  const sections: CsBlock[][] = [];
  for (const b of blocks) {
    if (b.type === "kicker" || b.type === "cta" || !sections.length) sections.push([b]);
    else sections[sections.length - 1].push(b);
  }
  return sections;
}

function Block({ b, headline }: { b: CsBlock; headline: boolean }) {
  switch (b.type) {
    case "kicker":
      return <p className="csx-kicker">{b.text}</p>;
    case "h2":
      return <h2 className="csx-h2">{b.text}</h2>;
    case "p":
      return <p className="csx-text">{b.text}</p>;
    case "caption":
      return <p className="csx-caption">{b.text}</p>;
    case "list":
      return (
        <ul className="csx-list">
          {b.items.map((it, i) => (
            <li key={i}>
              {it.lead && <strong>{it.lead} </strong>}
              {it.text}
            </li>
          ))}
        </ul>
      );
    case "img":
      return (
        <figure className="csx-figure">
          <img src={b.src} alt="" loading="lazy" />
        </figure>
      );
    case "stats":
      return (
        <dl className={`csx-stats${headline ? " is-headline" : ""}`} style={{ ["--csx-cols" as string]: Math.min(b.cols, 4) }}>
          {b.items.map((s, i) => (
            <div key={i} className="csx-stat">
              <dt>{s.val}</dt>
              <dd>{s.lbl}</dd>
            </div>
          ))}
        </dl>
      );
    case "table":
      return (
        <div className="csx-table-wrap">
          <table className="csx-table">
            <thead>
              <tr>
                {b.headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className={b.total && i === b.rows.length - 1 ? "is-total" : undefined}>
                  {r.map((c, j) => (
                    <td key={j}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "cta":
      return (
        <div className="csx-cta">
          <p className="csx-kicker">{b.kicker}</p>
          {b.title && <h2 className="csx-h2">{b.title}</h2>}
          {b.text && <p className="csx-text">{b.text}</p>}
          <Link href="/contact" className="csx-btn">
            <span>Contact Us</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      );
  }
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { slug } = await params;
  const doc = getCaseStudyDoc(slug);
  if (!doc) notFound();

  const sections = toSections(doc.blocks);

  return (
    <>
      <Header />
      <main className="csx-page">
        <section className="csx-hero">
          <div className="csx-container">
            <div className="asx-breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/resources">Resources</Link>
              <span>/</span>
              <Link href="/case-studies">Case Studies</Link>
            </div>
            <p className="csx-kicker">{doc.kicker}</p>
            <h1 className="csx-h1">{doc.title}</h1>
            <p className="csx-intro">{doc.intro}</p>
            <dl className="csx-info">
              {doc.info.labels.map((l, i) => (
                <div key={l} className="csx-info-item">
                  <dt>{l}</dt>
                  <dd>{doc.info.values[i]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <div className="csx-body">
          <div className="csx-container">
            {sections.map((sec, i) => {
              const isCta = sec[0].type === "cta";
              const headline = sec[0].type === "kicker" && /^HEADLINE RESULTS/i.test(sec[0].text);
              return (
                <section key={i} className={isCta ? "csx-section csx-section-cta" : `csx-section${headline ? " csx-section-headline" : ""}`}>
                  {sec.map((b, j) => (
                    <Block key={j} b={b} headline={headline} />
                  ))}
                </section>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

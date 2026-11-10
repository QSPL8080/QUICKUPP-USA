import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CaseStudyNav from "@/components/CaseStudyNav";
import type { CsBlock } from "@/data/case-study-docs";
import { CASE_STUDY_ORDER, caseStudyArea, caseStudyCover, getCaseStudyDoc, headlineStats, sectionLabel } from "@/lib/caseStudies";
import "@/app/case-study-detail.css";

/*
 * One case study ("cd-"), exactly as its document is written — the same
 * headings, text, results, tables, charts and closing box, in the same order —
 * presented as: a photo hero with the client facts, the headline results band,
 * a page navigator beside the numbered sections, and the next case study.
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
    openGraph: { title: doc.title, description: doc.intro, type: "article", images: [caseStudyCover(slug, 1200)] },
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

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

function Block({ b }: { b: CsBlock }) {
  switch (b.type) {
    case "kicker":
      return null; // shown as the section's label
    case "h2":
      return <h2 className="cd-h2">{b.text}</h2>;
    case "p":
      return <p className="cd-text">{b.text}</p>;
    case "caption":
      return <p className="cd-caption">{b.text}</p>;
    case "list":
      return (
        <ul className="cd-list">
          {b.items.map((it, i) => (
            <li key={i} data-cs-reveal="" style={{ ["--d" as string]: `${Math.min(i, 6) * 0.05}s` }}>
              <span className="cd-list-mark" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                {it.lead && <strong>{it.lead} </strong>}
                {it.text}
              </span>
            </li>
          ))}
        </ul>
      );
    case "img":
      return (
        <figure className="cd-figure" data-cs-reveal="">
          <img src={b.src} alt="" loading="lazy" />
        </figure>
      );
    case "stats":
      return (
        <dl className="cd-stats" style={{ ["--cd-cols" as string]: Math.min(b.cols, 4) }}>
          {b.items.map((s, i) => (
            <div key={i} className="cd-stat" data-cs-reveal="" style={{ ["--d" as string]: `${i * 0.06}s` }}>
              <dt>{s.val}</dt>
              <dd>{s.lbl}</dd>
            </div>
          ))}
        </dl>
      );
    case "table":
      return (
        <div className="cd-table-wrap" data-cs-reveal="">
          <table className="cd-table">
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
        <div className="cd-cta" data-cs-reveal="">
          <span className="cd-cta-glow" aria-hidden="true" />
          <p className="cd-cta-kicker">{b.kicker}</p>
          {b.title && <h2 className="cd-cta-title">{b.title}</h2>}
          {b.text && <p className="cd-cta-text">{b.text}</p>}
          <Link href="/contact" className="cd-btn">
            <span>Contact Us</span>
            <Arrow />
          </Link>
        </div>
      );
  }
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { slug } = await params;
  const doc = getCaseStudyDoc(slug);
  if (!doc) notFound();

  const { area, sector } = caseStudyArea(slug);
  const sections = toSections(doc.blocks);
  const headIndex = sections.findIndex((sec) => sec[0].type === "kicker" && /^HEADLINE RESULTS/i.test(sec[0].text));
  const headline = headIndex >= 0 ? sections[headIndex] : null;
  const headKicker = headline && headline[0].type === "kicker" ? headline[0].text : "";
  const headStats = headlineStats(doc);
  const body = sections
    .map((sec, i) => ({ sec, i }))
    .filter(({ i }) => i !== headIndex)
    .map(({ sec, i }) => ({ sec, i, id: `section-${i + 1}`, isCta: sec[0].type === "cta", label: sec[0].type === "kicker" ? sectionLabel(sec[0].text) : "" }));
  const nav = body.filter((s) => !s.isCta && s.label).map((s) => ({ id: s.id, label: s.label }));
  const numberOf = new Map(body.filter((s) => !s.isCta).map((s, k) => [s.id, k + 1]));

  const at = CASE_STUDY_ORDER.indexOf(slug as (typeof CASE_STUDY_ORDER)[number]);
  const nextSlug = CASE_STUDY_ORDER[(at + 1) % CASE_STUDY_ORDER.length];
  const next = getCaseStudyDoc(nextSlug);

  return (
    <>
      <Header />
      <main className="cd-page">
        {/* ---- Hero: the client's world, the title and the facts ---- */}
        <section className="cd-hero">
          <div className="cd-hero-stage">
            <span className="cd-hero-img" style={{ backgroundImage: `url('${caseStudyCover(slug)}')` }} aria-hidden="true" />
            <span className="cd-hero-shade" aria-hidden="true" />
            <div className="cd-container cd-hero-inner">
              <div className="asx-breadcrumb cd-crumbs">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/resources">Resources</Link>
                <span>/</span>
                <Link href="/case-studies">Case Studies</Link>
              </div>
              <p className="cd-tags">
                <span className="cd-tag">{area}</span>
                {sector && <span className="cd-tag cd-tag-ghost">{sector}</span>}
              </p>
              <h1 className="cd-h1">{doc.title}</h1>
              <p className="cd-intro">{doc.intro}</p>
              <dl className="cd-facts">
                {doc.info.labels.map((l, i) => (
                  <div key={l} className="cd-fact">
                    <dt>{l}</dt>
                    <dd>{doc.info.values[i]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ---- Headline results, lifted over the hero's edge ---- */}
        {headStats.length > 0 && (
          <section className="cd-headline">
            <div className="cd-container">
              <div className="cd-headline-card" data-cs-reveal="">
                {headKicker && <p className="cd-headline-kicker">{headKicker}</p>}
                <dl className="cd-headline-stats" style={{ ["--cd-cols" as string]: Math.min(headStats.length, 4) }}>
                  {headStats.map((s, i) => (
                    <div key={i} className="cd-headline-stat">
                      <dt>{s.val}</dt>
                      <dd>{s.lbl}</dd>
                    </div>
                  ))}
                </dl>
                {/* anything else the document puts in this section (rare) */}
                {headline && headline.slice(1).filter((b) => b.type !== "stats").map((b, j) => <Block key={j} b={b} />)}
              </div>
            </div>
          </section>
        )}

        {/* ---- The story: page navigator + numbered sections ---- */}
        <div className="cd-container cd-layout">
          <aside className="cd-aside">
            <CaseStudyNav items={nav} />
          </aside>
          <article className="cd-article">
            {body.map(({ sec, id, isCta, label }) => {
              if (isCta) {
                return (
                  <section key={id} id={id} className="cd-section cd-section-cta">
                    {sec.map((b, j) => (
                      <Block key={j} b={b} />
                    ))}
                  </section>
                );
              }
              const n = numberOf.get(id) || 0;
              return (
                <section key={id} id={id} className="cd-section">
                  {label && (
                    <p className="cd-label" data-cs-reveal="">
                      <span className="cd-label-n">{String(n).padStart(2, "0")}</span>
                      <span>{label}</span>
                    </p>
                  )}
                  {sec.map((b, j) => (
                    <Block key={j} b={b} />
                  ))}
                </section>
              );
            })}
          </article>
        </div>

        {/* ---- Next case study ---- */}
        {next && nextSlug !== slug && (
          <section className="cd-next">
            <div className="cd-container">
              <Link href={`/case-studies/${nextSlug}`} className="cd-next-card" data-cs-reveal="">
                <span className="cd-next-img" style={{ backgroundImage: `url('${caseStudyCover(nextSlug, 1400)}')` }} aria-hidden="true" />
                <span className="cd-next-shade" aria-hidden="true" />
                <span className="cd-next-body">
                  <span className="cd-next-kicker">Next Case Study</span>
                  <span className="cd-next-title">{next.title}</span>
                  <span className="cd-next-go" aria-hidden="true">
                    <Arrow />
                  </span>
                </span>
              </Link>
              <Link href="/case-studies" className="cd-all">
                All Case Studies
              </Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

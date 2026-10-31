import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalMotion from "@/components/LegalMotion";
import "@/app/legal.css";

/*
 * Simple legal pages ("lgl-"): Terms and Conditions and Privacy Policy.
 * One readable column in the site's fonts and type scale. Every word comes
 * from the document data (data/legal/*); web addresses and emails in the
 * text become links, nothing is added.
 */

export type LegalBlock = { p: string } | { list: string[] } | { h3: string } | { lines: string[] };

export type LegalDoc = {
  title: string;
  crumb: string;
  effective: string;
  updated: string;
  sections: { title: string; blocks: LegalBlock[] }[];
};

const SITE = "https://www.quickuppsoftech.us";
const LINK_RE = /(https?:\/\/[^\s]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

/** Text with its web addresses and email addresses turned into links */
function Linked({ text }: { text: string }) {
  const parts = text.split(LINK_RE);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return part;
        const trail = part.match(/[.,;:)]+$/)?.[0] ?? "";
        const value = trail ? part.slice(0, -trail.length) : part;
        let link: React.ReactNode;
        if (value.includes("@") && !value.startsWith("http")) {
          link = (
            <a href={`mailto:${value}`} className="lgl-link">
              {value}
            </a>
          );
        } else if (value.startsWith(SITE)) {
          link = (
            <Link href={value.slice(SITE.length).replace(/\/$/, "") || "/"} className="lgl-link">
              {value}
            </Link>
          );
        } else {
          link = (
            <a href={value} className="lgl-link" target="_blank" rel="noopener noreferrer">
              {value}
            </a>
          );
        }
        return (
          <span key={i}>
            {link}
            {trail}
          </span>
        );
      })}
    </>
  );
}

/** "Label: text" lines show the label in bold */
function Labelled({ text }: { text: string }) {
  const m = text.match(/^([A-Z][A-Za-z &-]{1,32}:)(\s.*)?$/);
  if (!m) return <Linked text={text} />;
  return (
    <>
      <strong className="lgl-label">{m[1]}</strong>
      {m[2] && <Linked text={m[2]} />}
    </>
  );
}

function Blocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if ("p" in b)
          return (
            <p key={i} className="lgl-text">
              <Labelled text={b.p} />
            </p>
          );
        if ("h3" in b)
          return (
            <h3 key={i} className="lgl-h3">
              {b.h3}
            </h3>
          );
        if ("lines" in b)
          return (
            <p key={i} className="lgl-text lgl-lines">
              {b.lines.map((l, j) => (
                <span key={j} className="lgl-line">
                  {j === 0 ? <Labelled text={l} /> : <Linked text={l} />}
                </span>
              ))}
            </p>
          );
        return (
          <ul key={i} className="lgl-list">
            {b.list.map((t) => (
              <li key={t}>
                <Labelled text={t} />
              </li>
            ))}
          </ul>
        );
      })}
    </>
  );
}

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <div className="lgl-page">
      <Header />
      <main>
        <section className="lgl-hero">
          <div className="lgl-hero-bg" aria-hidden="true" />
          <div className="lgl-container">
            <nav className="lgl-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className="lgl-crumb-sep">/</span>
              <span className="lgl-crumb-current">{doc.crumb}</span>
            </nav>
            <h1 className="lgl-h1">
              {doc.title.split(" ").length > 1 ? (
                <>
                  {doc.title.split(" ")[0]} <span className="qs-gradient-text">{doc.title.split(" ").slice(1).join(" ")}</span>
                </>
              ) : (
                <span className="qs-gradient-text">{doc.title}</span>
              )}
            </h1>
            <div className="lgl-dates">
              <span className="lgl-date">
                <span className="lgl-date-label">Effective Date:</span> {doc.effective}
              </span>
              <span className="lgl-date-dot" aria-hidden="true" />
              <span className="lgl-date">
                <span className="lgl-date-label">Last Updated:</span> {doc.updated}
              </span>
            </div>
          </div>
        </section>

        <div className="lgl-container lgl-doc">
          {doc.sections.map((s, i) => (
            <section key={s.title} id={`section-${i + 1}`} className="lgl-sec">
              <h2 className="lgl-h2">
                <span className="lgl-num">{i + 1}.</span> {s.title}
              </h2>
              <Blocks blocks={s.blocks} />
            </section>
          ))}
        </div>
      </main>
      <LegalMotion />
      <Footer />
    </div>
  );
}

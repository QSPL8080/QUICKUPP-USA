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

const LABEL_RE = /^([A-Z][A-Za-z &-]{1,32}):(?:\s(.*))?$/;

/** "Label: text" → [label, text] (text may be empty, e.g. "US Mailing Address:") */
const splitLabel = (text: string) => {
  const m = text.match(LABEL_RE);
  return m ? { label: m[1], value: m[2] ?? "" } : null;
};

/** A labelled row as one line: a multi-line address is joined with commas */
const asRow = (b: LegalBlock) => {
  if ("p" in b) return splitLabel(b.p);
  if ("lines" in b) {
    const head = splitLabel(b.lines[0]);
    if (!head) return null;
    return { label: head.label, value: [head.value, ...b.lines.slice(1)].filter(Boolean).join(", ") };
  }
  return null;
};

function Labelled({ text }: { text: string }) {
  const row = splitLabel(text);
  if (!row) return <Linked text={text} />;
  return (
    <>
      <strong className="lgl-label">{row.label}:</strong>
      {row.value && (
        <>
          {" "}
          <Linked text={row.value} />
        </>
      )}
    </>
  );
}

function Blocks({ blocks }: { blocks: LegalBlock[] }) {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];

    // Two or more "Label: value" lines in a row become a details card
    const rows: { label: string; value: string }[] = [];
    for (let j = i; j < blocks.length; j++) {
      const r = asRow(blocks[j]);
      if (!r || !r.value) break;
      rows.push(r);
    }
    if (rows.length >= 2) {
      out.push(
        <dl key={i} className="lgl-info">
          {rows.map((r) => (
            <div key={r.label} className="lgl-info-row">
              <dt>{r.label}</dt>
              <dd>
                <Linked text={r.value} />
              </dd>
            </div>
          ))}
        </dl>
      );
      i += rows.length - 1;
      continue;
    }

    if ("p" in b) {
      out.push(
        <p key={i} className="lgl-text">
          <Labelled text={b.p} />
        </p>
      );
    } else if ("h3" in b) {
      out.push(
        <h3 key={i} className="lgl-h3">
          {b.h3}
        </h3>
      );
    } else if ("lines" in b) {
      const r = asRow(b);
      out.push(
        <p key={i} className="lgl-text">
          {r ? <Labelled text={`${r.label}: ${r.value}`} /> : <Linked text={b.lines.join(", ")} />}
        </p>
      );
    } else {
      const twoCol = b.list.length >= 6 && b.list.every((t) => t.length <= 44);
      out.push(
        <ul key={i} className={`lgl-list${twoCol ? " lgl-list-2" : ""}`}>
          {b.list.map((t) => (
            <li key={t}>
              <Labelled text={t} />
            </li>
          ))}
        </ul>
      );
    }
  }
  return <>{out}</>;
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
                <span className="lgl-date-dot" aria-hidden="true" />
                <span className="lgl-date-label">Effective Date:</span> {doc.effective}
              </span>
              <span className="lgl-date">
                <span className="lgl-date-dot" aria-hidden="true" />
                <span className="lgl-date-label">Last Updated:</span> {doc.updated}
              </span>
            </div>
          </div>
        </section>

        <div className="lgl-container lgl-doc">
          {doc.sections.map((s, i) => (
            <section key={s.title} id={`section-${i + 1}`} className="lgl-sec">
              <div className="lgl-sec-head">
                <span className="lgl-num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="lgl-h2">
                  <span className="lgl-sr">{i + 1}. </span>
                  {s.title}
                </h2>
              </div>
              <div className="lgl-sec-body">
                <Blocks blocks={s.blocks} />
              </div>
            </section>
          ))}
        </div>
      </main>
      <LegalMotion />
      <Footer />
    </div>
  );
}

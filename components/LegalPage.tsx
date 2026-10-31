import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GeoToc from "@/components/GeoToc";
import LucideIcon from "@/components/LucideIcon";
import LegalMotion from "@/components/LegalMotion";
import "@/app/legal.css";

/*
 * Legal pages ("lgl-" design): Terms and Conditions (and later the Privacy
 * Policy). Site fonts, type scale and heading gradient; a numbered contents
 * rail beside the document. Every word comes from the document data
 * (data/legal/*), nothing is added here.
 */

type Fact = { label: string; value?: string; href?: string; lines?: string[] };

export type LegalBlock =
  | { p: string }
  | { list: string[]; tone?: "deny" }
  | { link: { href: string; label: string; title?: string } }
  | { facts: Fact[] }
  | { sub: string; blocks: LegalBlock[] }
  | {
      contact: {
        name: string;
        addressLabel: string;
        address: string[];
        rows: { label: string; value: string; href: string }[];
      };
    };

export type LegalDoc = {
  title: string;
  crumb: string;
  effective: string;
  updated: string;
  sections: { title: string; blocks: LegalBlock[] }[];
};

const isExternal = (href: string) => /^https?:/.test(href);

function SmartLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}

function GradientTitle({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return <span className="qs-gradient-text">{text}</span>;
  const split = Math.max(1, Math.floor(words.length * 0.55));
  return (
    <>
      {words.slice(0, split).join(" ")} <span className="qs-gradient-text">{words.slice(split).join(" ")}</span>
    </>
  );
}

const CalendarIcon = ({ refresh = false }: { refresh?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {refresh ? (
      <>
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
      </>
    ) : (
      <>
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    )}
  </svg>
);

const CrossIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

function Blocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if ("p" in b) return <p key={i} className="lgl-text">{b.p}</p>;

        if ("list" in b) {
          const short = b.list.every((t) => t.length <= 48);
          return (
            <ul key={i} className={`lgl-list${short && b.list.length >= 6 ? " lgl-list-2" : ""}${b.tone === "deny" ? " lgl-list-deny" : ""}`}>
              {b.list.map((t) => (
                <li key={t}>
                  <span className="lgl-mark" aria-hidden="true">
                    {b.tone === "deny" ? <CrossIcon /> : <LucideIcon name="check" size={11} strokeWidth={3.2} />}
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          );
        }

        if ("link" in b)
          return (
            <p key={i} className="lgl-text lgl-link-line">
              {b.link.title && <span className="lgl-link-title">{b.link.title} </span>}
              <SmartLink href={b.link.href} className="lgl-link">
                {b.link.label}
                <LucideIcon name="arrow-up-right" size={14} strokeWidth={2.2} />
              </SmartLink>
            </p>
          );

        if ("facts" in b)
          return (
            <dl key={i} className="lgl-facts">
              {b.facts.map((f) => (
                <div key={f.label} className="lgl-fact">
                  <dt>{f.label}</dt>
                  <dd>
                    {f.lines ? (
                      f.lines.map((l) => (
                        <span key={l} className="lgl-line">
                          {l}
                        </span>
                      ))
                    ) : f.href ? (
                      <SmartLink href={f.href} className="lgl-link">
                        {f.value}
                      </SmartLink>
                    ) : (
                      f.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          );

        if ("sub" in b)
          return (
            <div key={i} className="lgl-sub">
              <h3 className="lgl-h3">{b.sub}</h3>
              <Blocks blocks={b.blocks} />
            </div>
          );

        const c = b.contact;
        return (
          <div key={i} className="lgl-contact">
            <div className="lgl-contact-main">
              <div className="lgl-contact-name">{c.name}</div>
              <div className="lgl-contact-addr">
                <span className="lgl-contact-icon" aria-hidden="true">
                  <LucideIcon name="map-pin" size={18} />
                </span>
                <div>
                  <div className="lgl-contact-label">{c.addressLabel}</div>
                  <address className="lgl-address">
                    {c.address.map((l) => (
                      <span key={l} className="lgl-line">
                        {l}
                      </span>
                    ))}
                  </address>
                </div>
              </div>
            </div>
            <ul className="lgl-contact-rows">
              {c.rows.map((r) => (
                <li key={r.label}>
                  <SmartLink href={r.href} className="lgl-contact-row">
                    <span className="lgl-contact-icon" aria-hidden="true">
                      <LucideIcon name={r.href.startsWith("mailto:") ? "mail" : "globe"} size={18} />
                    </span>
                    <span className="lgl-contact-text">
                      <span className="lgl-contact-label">{r.label}</span>
                      <span className="lgl-contact-value">{r.value}</span>
                    </span>
                    <span className="lgl-contact-go" aria-hidden="true">
                      <LucideIcon name="arrow-up-right" size={16} strokeWidth={2.2} />
                    </span>
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
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
              <GradientTitle text={doc.title} />
            </h1>
            <div className="lgl-dates">
              <div className="lgl-date">
                <span className="lgl-date-icon">
                  <CalendarIcon />
                </span>
                <span className="lgl-date-text">
                  <span className="lgl-date-label">Effective Date</span>
                  <span className="lgl-date-value">{doc.effective}</span>
                </span>
              </div>
              <div className="lgl-date">
                <span className="lgl-date-icon">
                  <CalendarIcon refresh />
                </span>
                <span className="lgl-date-text">
                  <span className="lgl-date-label">Last Updated</span>
                  <span className="lgl-date-value">{doc.updated}</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="lgl-container lgl-doc">
          <GeoToc
            items={doc.sections.map((s, i) => ({ id: `section-${i + 1}`, label: s.title }))}
            title={
              <>
                <LucideIcon name="file-text" size={14} />
                <span>{doc.crumb}</span>
              </>
            }
          />
          <div className="lgl-doc-main">
            {doc.sections.map((s, i) => (
              <section key={s.title} id={`section-${i + 1}`} className="lgl-sec">
                <header className="lgl-sec-head">
                  <span className="lgl-sec-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="lgl-h2">
                    <span className="lgl-sr">{i + 1}. </span>
                    {s.title}
                  </h2>
                </header>
                <div className="lgl-sec-body">
                  <Blocks blocks={s.blocks} />
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <LegalMotion />
      <Footer />
    </div>
  );
}

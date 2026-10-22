"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/app/marketing-service-page.css";
import type {
  ServicePageData,
  ServiceBlock,
  ListBlock,
  DescPairsBlock,
  ProcessBlock,
  WhyChooseBlock,
  IndustriesBlock,
  AiBlock,
  FaqBlock,
  CardsBlock,
  StepsBlock,
} from "@/lib/servicePageTypes";
import LucideIcon from "@/components/LucideIcon";

/*
 * AI-Powered Digital Marketing service pages (all 9 subpages).
 * Own editorial design: full-width photo hero, hairline lists, sticky section
 * headings, solid violet accent. Every word comes from the page's data file,
 * in its original order — the template adds no labels, badges or copy.
 * Photos are local (public/images) and decorative only.
 */

interface MerkilMarketingServicePageProps {
  data: ServicePageData;
  categoryLabel?: string;
  categorySlug?: string;
}

type PhotoSet = { hero: string; ai: string };

const I = (name: string) => `/images/${name}`;

/* One set per page so a photo never repeats on the same page */
const photoSets: Record<string, PhotoSet> = {
  "Social Media Marketing": { hero: I("slider-01-02.jpg"), ai: I("blog-img-02.jpg") },
  "SEO & AI Search Visibility": { hero: I("project-04.jpg"), ai: I("counter-style-three-img-03.jpg") },
  "Paid Marketing": { hero: I("home-two-about.jpg"), ai: I("counter-style-three-img-02.jpg") },
  "Content Marketing": { hero: I("blog-img-03.jpg"), ai: I("blog-img-05.jpg") },
  "Media Production": { hero: I("project-02.jpg"), ai: I("service-img-06.jpg") },
  "Online Reputation Management": { hero: I("contact-customer-consultant.jpg"), ai: I("service-img-03.jpg") },
  "Email Marketing": { hero: I("service-img-05.jpg"), ai: I("contact-office-consultation.jpg") },
  "SMS Marketing": { hero: I("slider-01-01.jpg"), ai: I("contact-support-consultant.jpg") },
  "WhatsApp Marketing": { hero: I("service-img-01.jpg"), ai: I("contact-professional-consultant.jpg") },
};

const fallbackPhotos = photoSets["Social Media Marketing"];

/** Puts the last ~45% of a heading in the brand gradient (site-wide style). */
function GradientHeading({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 3) return <span className="qs-gradient-text">{text}</span>;
  const split = Math.max(1, Math.floor(words.length * 0.55));
  return (
    <>
      {words.slice(0, split).join(" ")}{" "}
      <span className="qs-gradient-text">{words.slice(split).join(" ")}</span>
    </>
  );
}

function ArrowIcon() {
  return <LucideIcon name="arrow-right" size={16} strokeWidth={2.2} />;
}

function Button({ href, label, variant = "accent" }: { href: string; label: string; variant?: "accent" | "light" | "outline" | "outline-light" }) {
  return (
    <Link href={href || "/contact"} className={`mks-btn mks-btn-${variant}`}>
      <span>{label}</span>
      {(variant === "accent" || variant === "light") && <ArrowIcon />}
    </Link>
  );
}

/** Plain list with hairline separators and an accent dash */
function RuleList({ items, columns = 2 }: { items: string[]; columns?: 1 | 2 | 3 }) {
  return (
    <ul className={`mks-rules mks-rules-${columns}`}>
      {items.map((it, i) => (
        <li key={`${it}-${i}`}>
          <span className="mks-dash" aria-hidden="true" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

/** Text lines a block provides besides its title/tagline, in data order. */
function textLines(block: { desc?: string; intro?: string }) {
  return [block.desc, block.intro].filter(Boolean) as string[];
}

/** "01. Strategy" → { num: "01.", title: "Strategy" }; otherwise uses the step's num. */
function splitStep(title: string, num?: string) {
  const m = title.match(/^(\d{1,2})\.\s*(.+)$/);
  if (m) return { num: `${m[1]}.`, title: m[2] };
  return { num: num ? `${num}.` : "", title };
}

const sameText = (a?: string, b?: string) => (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();

export default function MerkilMarketingServicePage({
  data,
  categoryLabel = "AI-Powered Digital Marketing",
  categorySlug = "ai-powered-digital-marketing-services",
}: MerkilMarketingServicePageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const photos = photoSets[data.crumb] ?? fallbackPhotos;
  const firstListIndex = data.blocks.findIndex((b) => b.type === "list");

  /* Section heading row: title (+ tagline) on the left, text on the right */
  const headRow = (title?: string, tagline?: string, lines: string[] = [], dark = false) => (
    <div className={`mks-headrow${lines.length === 0 ? " is-single" : ""}`}>
      <div>
        {title && <h2 className={`mks-h2${dark ? " is-light" : ""}`}><GradientHeading text={title} /></h2>}
        {tagline && !sameText(tagline, title) && <p className="mks-tagline">{tagline}</p>}
      </div>
      {lines.length > 0 && (
        <div className="mks-headrow-text">
          {lines.map((l, i) => (
            <p key={i} className="mks-text">
              {l}
            </p>
          ))}
        </div>
      )}
    </div>
  );

  const renderBlock = (block: ServiceBlock, index: number) => {
    /* Overview index: the first list block */
    if (block.type === "list" && index === firstListIndex) {
      const b = block as ListBlock;
      const cols = b.items.length > 9 || b.items.length % 4 === 0 ? 4 : 3;
      return (
        <section key={index} className="mks-section">
          <div className="mks-container">
            {headRow(b.title, b.tagline || b.subtitle, textLines(b))}
            <ul className={`mks-index mks-index-${cols}`}>
              {b.items.map((it, i) => (
                <li key={`${it}-${i}`}>
                  <span className="mks-index-mark" aria-hidden="true" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
            {b.note && <p className="mks-note">{b.note}</p>}
            {b.cta && (
              <div className="mks-actions">
                <Button href={b.cta.href} label={b.cta.label} />
              </div>
            )}
          </div>
        </section>
      );
    }

    /* Detail sections: sticky heading column + list column */
    if (block.type === "list") {
      const b = block as ListBlock;
      return (
        <section key={index} className="mks-section mks-detail">
          <div className="mks-container mks-detail-grid">
            <div className="mks-detail-head">
              <div className="mks-sticky">
                <h2 className="mks-h2"><GradientHeading text={b.title} /></h2>
                {(b.tagline || b.subtitle) && !sameText(b.tagline || b.subtitle, b.title) && (
                  <p className="mks-tagline">{b.tagline || b.subtitle}</p>
                )}
                {textLines(b).map((l, i) => (
                  <p key={i} className="mks-text">
                    {l}
                  </p>
                ))}
              </div>
            </div>
            <div className="mks-detail-body">
              <RuleList items={b.items} columns={b.items.length > 5 ? 2 : 1} />
              {b.note && <p className="mks-note">{b.note}</p>}
              {b.cta && (
                <div className="mks-actions">
                  <Button href={b.cta.href} label={b.cta.label} />
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    /* Title + description rows */
    if (block.type === "descPairs" || block.type === "cards") {
      const isPairs = block.type === "descPairs";
      const pairs = block as DescPairsBlock;
      const rows = isPairs
        ? pairs.items.map((it) => ({ title: it.title, text: it.desc }))
        : (block as CardsBlock).cards.map((c) => ({ title: c.title, text: c.text }));
      const lines = isPairs ? textLines(pairs) : (block as CardsBlock).intro ? [(block as CardsBlock).intro as string] : [];
      return (
        <section key={index} className="mks-section mks-tint">
          <div className="mks-container">
            {headRow(block.title, isPairs ? pairs.tagline || pairs.subtitle : undefined, lines)}
            <dl className="mks-pairs">
              {rows.map((r, i) => (
                <div key={`${r.title}-${i}`} className="mks-pair">
                  <dt className="mks-h3">{r.title}</dt>
                  {r.text && <dd className="mks-text">{r.text}</dd>}
                </div>
              ))}
            </dl>
            {isPairs && pairs.cta && (
              <div className="mks-actions">
                <Button href={pairs.cta.href} label={pairs.cta.label} />
              </div>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "process" || block.type === "steps") {
      const isProcess = block.type === "process";
      const proc = block as ProcessBlock;
      const steps = isProcess
        ? (proc.steps || []).map((s) => ({ ...splitStep(s.title, s.num), text: s.desc || s.text }))
        : (block as StepsBlock).steps.map((s, i) => ({ ...splitStep(s.title, s.num || String(i + 1).padStart(2, "0")), text: s.text }));
      const lines = isProcess ? textLines(proc) : (block as StepsBlock).intro ? [(block as StepsBlock).intro as string] : [];
      return (
        <section key={index} className="mks-section">
          <div className="mks-container">
            {headRow(block.title, isProcess ? proc.tagline : undefined, lines)}
            <ol className={`mks-timeline mks-timeline-${Math.min(steps.length, 7)}`}>
              {steps.map((s, i) => (
                <li key={`${s.title}-${i}`}>
                  {s.num && <span className="mks-step-num">{s.num}</span>}
                  <h3 className="mks-h3">{s.title}</h3>
                  {s.text && <p className="mks-text">{s.text}</p>}
                </li>
              ))}
            </ol>
            {isProcess && proc.items && proc.items.length > 0 && <RuleList items={proc.items} columns={3} />}
            {isProcess && proc.cta && (
              <div className="mks-actions">
                <Button href={proc.cta.href} label={proc.cta.label} />
              </div>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "whyChoose") {
      const b = block as WhyChooseBlock;
      return (
        <section key={index} className="mks-section mks-ink">
          <div className="mks-container">
            {headRow(b.title, b.tagline, b.intro ? [b.intro] : [], true)}
            <ul className="mks-why">
              {b.bullets.map((it, i) => (
                <li key={`${it}-${i}`}>
                  <LucideIcon name="check" size={18} strokeWidth={2.4} />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
            {b.desc && <p className="mks-why-desc">{b.desc}</p>}
            {b.cta && (
              <div className="mks-actions">
                <Button href={b.cta.href} label={b.cta.label} variant="light" />
              </div>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "ai") {
      const b = block as AiBlock;
      return (
        <section key={index} className="mks-section mks-tint">
          <div className="mks-container mks-ai">
            <div className="mks-ai-photo" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos.ai} alt="" loading="lazy" />
            </div>
            <div className="mks-ai-body">
              <h2 className="mks-h2"><GradientHeading text={b.title} /></h2>
              {(b.tagline || b.subtitle) && !sameText(b.tagline || b.subtitle, b.title) && (
                <p className="mks-tagline">{b.tagline || b.subtitle}</p>
              )}
              {b.intro && <p className="mks-text">{b.intro}</p>}
              <RuleList items={b.bullets || []} columns={2} />
              {b.desc && <p className="mks-note">{b.desc}</p>}
              {b.cta && (
                <div className="mks-actions">
                  <Button href={b.cta.href} label={b.cta.label} />
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    if (block.type === "industries") {
      const b = block as IndustriesBlock;
      return (
        <section key={index} className="mks-section">
          <div className="mks-container">
            {headRow(b.title, b.tagline, textLines(b))}
            <ul className="mks-words">
              {b.industries.map((it, i) => (
                <li key={`${it}-${i}`}>{it}</li>
              ))}
            </ul>
          </div>
        </section>
      );
    }

    if (block.type === "faq") {
      const b = block as FaqBlock;
      const items = b.items || b.faqs || [];
      if (items.length === 0) return null;
      return (
        <section key={index} className="mks-section mks-tint">
          <div className="mks-container mks-faq-grid">
            <div className="mks-faq-head">
              {b.title && <h2 className="mks-h2"><GradientHeading text={b.title} /></h2>}
              {b.tagline && !sameText(b.tagline, b.title) && <p className="mks-tagline">{b.tagline}</p>}
              {textLines(b).map((l, i) => (
                <p key={i} className="mks-text">
                  {l}
                </p>
              ))}
            </div>
            <div className="mks-faq">
              {items.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={`${f.q}-${i}`} className={`mks-faq-item${open ? " is-open" : ""}`}>
                    <button
                      type="button"
                      className="mks-faq-q"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : i)}
                    >
                      <span className="mks-faq-text">{f.q}</span>
                      <span className="mks-faq-sign" aria-hidden="true" />
                    </button>
                    {open && <p className="mks-faq-a">{f.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    return null;
  };

  const heroCtas = data.heroCtas && data.heroCtas.length > 0 ? data.heroCtas : data.heroCta ? [data.heroCta] : [];

  return (
    <div className="mks-page">
      <Header />

      <main>
        {/* Hero: full-width photo banner */}
        <section className="mks-hero">
          <div className="mks-hero-bg" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos.hero} alt="" />
          </div>
          <div className="mks-container mks-hero-inner">
            <nav className="mks-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <span>Services</span>
              <span>/</span>
              {categorySlug && categoryLabel ? (
                <>
                  <Link href={`/services/${categorySlug}`}>{categoryLabel}</Link>
                  <span>/</span>
                </>
              ) : null}
              <span className="mks-breadcrumb-current">{data.crumb}</span>
            </nav>

            {data.heroEyebrow && <p className="mks-eyebrow">{data.heroEyebrow}</p>}
            <h1 className="mks-h1">
              <GradientHeading text={data.heroTitle} />
            </h1>
            <div className="mks-hero-copy">
              {data.heroParagraphs.map((p, i) => (
                <p key={i} className="mks-hero-text">
                  {p}
                </p>
              ))}
            </div>
            {heroCtas.length > 0 && (
              <div className="mks-actions">
                {heroCtas.map((cta, i) => (
                  <Button key={`${cta.label}-${i}`} href={cta.href} label={cta.label} variant={i === 0 ? "light" : "outline-light"} />
                ))}
              </div>
            )}
          </div>
        </section>

        {data.blocks.map((block, i) => renderBlock(block, i))}

        {/* Closing: full-width accent band */}
        <section className="mks-closing">
          <div className="mks-container mks-closing-grid">
            <div>
              {data.closingTitle && <h2 className="mks-h2 is-light"><GradientHeading text={data.closingTitle} /></h2>}
              {(data.closingDesc || "")
                .split(/\n+/)
                .filter(Boolean)
                .map((p, i) => (
                  <p key={i} className="mks-closing-text">
                    {p}
                  </p>
                ))}
              {data.closingTagline && <p className="mks-closing-tagline">{data.closingTagline}</p>}
              {data.closingSignature && (
                <p className="mks-closing-text">
                  <strong>{data.closingSignature.name}</strong> {data.closingSignature.line}
                </p>
              )}
            </div>
            {data.closingCtas && data.closingCtas.length > 0 && (
              <div className="mks-actions mks-closing-actions">
                {data.closingCtas.map((cta, i) => (
                  <Button key={`${cta.label}-${i}`} href={cta.href} label={cta.label} variant={i === 0 ? "light" : "outline-light"} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

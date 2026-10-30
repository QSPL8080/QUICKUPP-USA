"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceEnquiryForm from "@/components/ServiceEnquiryForm";
import EditorialMotion from "@/components/EditorialMotion";
import "@/app/marketing-studio.css";
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

/*
 * AI-Powered Digital Marketing service pages (all 9 subpages).
 * "mkx-" studio design, used only here: photo cover hero with an overlapping title card, services index,
 * campaign cards with chip lists, poster cards, a numbered process flow,
 * a check list panel, industry chips, FAQ accordion and a gradient-edged
 * closing card. Every word comes from the
 * page's data file in its original order; the template adds no copy.
 */

interface MerkilMarketingServicePageProps {
  data: ServicePageData;
  categoryLabel?: string;
  categorySlug?: string;
}

type PhotoSet = { hero: string; ai: string; cta: string };
const I = (name: string) => `/images/${name}`;

/* One set per page so a photo never repeats on the same page */
const photoSets: Record<string, PhotoSet> = {
  "Social Media Marketing": {
    hero: I("slider-01-02.jpg"),
    ai: I("blog-img-02.jpg"),
    cta: I("contact-agency-consultation.jpg"),
  },
  "SEO & AI Search Visibility": {
    hero: I("project-04.jpg"),
    ai: I("counter-style-three-img-03.jpg"),
    cta: I("contact-consulting-planning.jpg"),
  },
  "Paid Marketing": {
    hero: I("home-two-about.jpg"),
    ai: I("counter-style-three-img-02.jpg"),
    cta: I("contact-diverse-meeting.jpg"),
  },
  "Content Marketing": {
    hero: I("blog-img-03.jpg"),
    ai: I("blog-img-05.jpg"),
    cta: I("contact-meeting-discussion.jpg"),
  },
  "Media Production": {
    hero: I("project-02.jpg"),
    ai: I("service-img-06.jpg"),
    cta: I("contact-video-consultation.jpg"),
  },
  "Online Reputation Management": {
    hero: I("contact-customer-consultant.jpg"),
    ai: I("service-img-03.jpg"),
    cta: I("contact-corporate-consultation.jpg"),
  },
  "Email Marketing": {
    hero: I("service-img-05.jpg"),
    ai: I("contact-office-consultation.jpg"),
    cta: I("contact-consultancy-partners.jpg"),
  },
  "SMS Marketing": {
    hero: I("slider-01-01.jpg"),
    ai: I("contact-support-consultant.jpg"),
    cta: I("contact-consultancy-headway.jpg"),
  },
  "WhatsApp Marketing": {
    hero: I("service-img-01.jpg"),
    ai: I("contact-professional-consultant.jpg"),
    cta: I("contact-boardroom.jpg"),
  },
};
const fallbackPhotos = photoSets["Social Media Marketing"];

const closingPerksMap: Record<string, string[]> = {
  "Social Media Marketing": [
    "AI Creative Ideation & Trends",
    "Multi-Platform Organic Reach",
    "High-Converting Ad Campaigns",
  ],
  "SEO & AI Search Visibility": [
    "AI Search & LLM Engine Visibility",
    "High-Intent Keyword Rankings",
    "Technical Audits & Speed Tuning",
  ],
  "Paid Marketing": [
    "ROAS-Driven Campaign Scaling",
    "Precision Audience Targeting",
    "Real-Time AI Bidding & Creative Testing",
  ],
  "Content Marketing": [
    "Authority-Building Thought Leadership",
    "Multi-Format Content Engines",
    "High-Intent Conversion Strategy",
  ],
  "Media Production": [
    "High-End Visual Storytelling",
    "Engaging Short-Form Reels & Video Ads",
    "Turnkey Studio Post-Production",
  ],
  "Online Reputation Management": [
    "Proactive Brand & Sentiment Defense",
    "5-Star Review Acceleration",
    "Executive Search Result Protection",
  ],
  "Email Marketing": [
    "Hyper-Personalized Automated Flows",
    "99%+ Inbox Deliverability Focus",
    "High-Converting Lifecycle Campaigns",
  ],
  "SMS Marketing": [
    "Instant 98% Open Rate Impact",
    "TCPA-Compliant High-Speed Routing",
    "Automated VIP & Flash Alert Triggers",
  ],
  "WhatsApp Marketing": [
    "Interactive Two-Way Conversational Flows",
    "Direct CRM & Catalog Integration",
    "Automated Instant Lead Qualification",
  ],
};

const defaultClosingPerks = [
  "AI-Powered Strategy & Execution",
  "Transparent, Measurable ROI",
  "Dedicated Marketing Specialists",
];

const sameText = (a?: string, b?: string) => (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();

function CheckIcon() {
  return (
    <svg className="mkx-close-perk-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Grad({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 3) return <span className="qs-gradient-text">{text}</span>;
  const split = Math.max(1, Math.floor(words.length * 0.55));
  return (
    <>
      {words.slice(0, split).join(" ")} <span className="qs-gradient-text">{words.slice(split).join(" ")}</span>
    </>
  );
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}

function Btn({ href, label, variant = "dark" }: { href?: string; label: string; variant?: "dark" | "outline" }) {
  return (
    <Link href={href || "/contact"} className={`mkx-btn mkx-btn-${variant}`}>
      <span>{label}</span>
      {variant === "dark" && <Arrow />}
    </Link>
  );
}

/** Title row: tagline above, title, then any text lines */
function Head({
  title,
  tagline,
  lines = [],
  center = false,
}: {
  title?: string;
  tagline?: string;
  lines?: string[];
  center?: boolean;
}) {
  return (
    <div className={`mkx-head${center ? " mkx-head-center" : ""}`}>
      {tagline && !sameText(tagline, title) && <p className="mkx-kicker">{tagline}</p>}
      {title && (
        <h2>
          <Grad text={title} />
        </h2>
      )}
      {lines.map((l, i) => (
        <p key={i} className="mkx-text">
          {l}
        </p>
      ))}
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="mkx-chips">
      {items.map((it, i) => (
        <li key={`${it}-${i}`}>
          <span className="mkx-chip-dot" aria-hidden="true" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

/** Process: numbered cards joined by arrow connectors */
function ProcessFlow({ steps }: { steps: { num: string; title: string; text?: string }[] }) {
  const n = steps.length;
  const cols = n === 6 ? 3 : n >= 7 ? 4 : n;
  return (
    <ol className="mkx-flow" style={{ "--mkx-cols": cols } as React.CSSProperties}>
      {steps.map((s, i) => {
        const rowEnd = (i + 1) % cols === 0 || i === n - 1;
        return (
          <li key={`${s.title}-${i}`} className={`mkx-flow-card${rowEnd ? " is-row-end" : ""}`}>
            <div className="mkx-flow-top">
              {s.num && <span className="mkx-flow-num">{s.num}</span>}
              <span className="mkx-flow-line" aria-hidden="true" />
            </div>
            <h3>{s.title}</h3>
            {s.text && <p className="mkx-text">{s.text}</p>}
            {!rowEnd && (
              <span className="mkx-flow-next" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mkx-checks">
      {items.map((it, i) => (
        <li key={`${it}-${i}`}>
          <span className="mkx-check" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span className="mkx-check-text">{it}</span>
        </li>
      ))}
    </ul>
  );
}

function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mkx-faq">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={`${f.q}-${i}`} className={`mkx-faq-item${isOpen ? " is-open" : ""}`}>
            <button type="button" className="mkx-faq-q" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
              <span className="mkx-faq-text">{f.q}</span>
              <span className="mkx-faq-sign" aria-hidden="true" />
            </button>
            <div className="mkx-faq-a">
              <div>
                <p className="mkx-text">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function splitStep(title: string, num?: string) {
  const m = title.match(/^(\d{1,2})\.\s*(.+)$/);
  if (m) return { num: m[1].padStart(2, "0"), title: m[2] };
  return { num: num || "", title };
}

export default function MerkilMarketingServicePage({
  data,
  categoryLabel = "AI-Powered Digital Marketing",
  categorySlug = "ai-powered-digital-marketing-services",
}: MerkilMarketingServicePageProps) {
  const photos = photoSets[data.crumb] ?? fallbackPhotos;
  const firstListIndex = data.blocks.findIndex((b) => b.type === "list");
  /* campaign cards (lists after the first) alternate sides */
  const cardFlipAt: boolean[] = [];
  data.blocks.reduce((flip, b, i) => {
    if (b.type !== "list" || i === firstListIndex) return flip;
    cardFlipAt[i] = !flip;
    return !flip;
  }, false);

  const renderBlock = (block: ServiceBlock, index: number) => {
    /* Overview: the first list, set as a keyword wall */
    if (block.type === "list" && index === firstListIndex) {
      const b = block as ListBlock;
      return (
        <section key={index} className="mkx-sec qs-backdrop" style={{ "--qs-backdrop": "url('/images/blog-img-04.jpg')" } as React.CSSProperties}>
          <div className="mkx-container">
            <Head title={b.title} tagline={b.tagline || b.subtitle} lines={[b.desc, b.intro].filter(Boolean) as string[]} />
            <ul className="mkx-index">
              {b.items.map((it, i) => (
                <li key={`${it}-${i}`}>
                  <span className="mkx-chip-dot" aria-hidden="true" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
            {b.note && <p className="mkx-remark">{b.note}</p>}
            {b.cta && (
              <div className="mkx-actions">
                <Btn href={b.cta.href} label={b.cta.label} />
              </div>
            )}
          </div>
        </section>
      );
    }

    /* Other lists: campaign cards with chips, alternating sides */
    if (block.type === "list") {
      const b = block as ListBlock;
      const cardFlip = cardFlipAt[index];
      const lines = [b.desc, b.intro].filter(Boolean) as string[];
      return (
        <section key={index} className="mkx-sec mkx-sec-card">
          <div className="mkx-container">
            <div className={`mkx-campaign${cardFlip ? "" : " is-flip"}`}>
              <div className="mkx-campaign-copy">
                {(b.tagline || b.subtitle) && !sameText(b.tagline || b.subtitle, b.title) && (
                  <p className="mkx-kicker">{b.tagline || b.subtitle}</p>
                )}
                <h2>
                  <Grad text={b.title} />
                </h2>
                {lines.map((l, i) => (
                  <p key={i} className="mkx-text">
                    {l}
                  </p>
                ))}
                {b.cta && (
                  <div className="mkx-actions">
                    <Btn href={b.cta.href} label={b.cta.label} />
                  </div>
                )}
              </div>
              <div className="mkx-campaign-list">
                <Chips items={b.items} />
                {b.note && <p className="mkx-remark">{b.note}</p>}
              </div>
            </div>
          </div>
        </section>
      );
    }

    /* Title + description pairs: poster cards */
    if (block.type === "descPairs" || block.type === "cards") {
      const isPairs = block.type === "descPairs";
      const pairs = block as DescPairsBlock;
      const rows = isPairs
        ? pairs.items.map((it) => ({ title: it.title, text: it.desc }))
        : (block as CardsBlock).cards.map((c) => ({ title: c.title, text: c.text }));
      const lines = isPairs
        ? ([pairs.desc, pairs.intro].filter(Boolean) as string[])
        : (block as CardsBlock).intro
          ? [(block as CardsBlock).intro as string]
          : [];
      const cols = rows.length === 2 || rows.length === 4 ? 2 : 3;
      return (
        <section key={index} className="mkx-sec mkx-soft">
          <div className="mkx-container">
            <Head title={block.title} tagline={isPairs ? pairs.tagline || pairs.subtitle : undefined} lines={lines} />
            <div className={`mkx-posters mkx-posters-${cols}`}>
              {rows.map((r, i) => (
                <article key={`${r.title}-${i}`} className="mkx-poster">
                  <h3>{r.title}</h3>
                  {r.text && <p className="mkx-text">{r.text}</p>}
                </article>
              ))}
            </div>
            {isPairs && pairs.cta && (
              <div className="mkx-actions">
                <Btn href={pairs.cta.href} label={pairs.cta.label} />
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
        : (block as StepsBlock).steps.map((s) => ({ ...splitStep(s.title, s.num), text: s.text }));
      const lines = isProcess
        ? ([proc.desc, proc.intro].filter(Boolean) as string[])
        : (block as StepsBlock).intro
          ? [(block as StepsBlock).intro as string]
          : [];
      return (
        <section key={index} className="mkx-sec mkx-soft">
          <div className="mkx-container">
            <Head title={block.title} tagline={isProcess ? proc.tagline : undefined} lines={lines} />
            <ProcessFlow steps={steps} />
            {isProcess && proc.items && proc.items.length > 0 && <Chips items={proc.items} />}
            {isProcess && proc.cta && (
              <div className="mkx-actions">
                <Btn href={proc.cta.href} label={proc.cta.label} />
              </div>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "whyChoose") {
      const b = block as WhyChooseBlock;
      return (
        <section key={index} className="mkx-sec mkx-soft">
          <div className="mkx-container mkx-why">
            <div className="mkx-why-head">
              <Head title={b.title} tagline={b.tagline} lines={b.intro ? [b.intro] : []} />
              {b.desc && <p className="mkx-text">{b.desc}</p>}
              {b.cta && (
                <div className="mkx-actions">
                  <Btn href={b.cta.href} label={b.cta.label} />
                </div>
              )}
            </div>
            <CheckList items={b.bullets} />
          </div>
        </section>
      );
    }

    if (block.type === "ai") {
      const b = block as AiBlock;
      return (
        <section key={index} className="mkx-sec">
          <div className="mkx-container mkx-ai">
            <div className="mkx-ai-photo" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos.ai} alt="" loading="lazy" />
            </div>
            <div className="mkx-ai-body">
              <Head title={b.title} tagline={b.tagline || b.subtitle} lines={b.intro ? [b.intro] : []} />
              {b.bullets && b.bullets.length > 0 && <Chips items={b.bullets} />}
              {b.desc && <p className="mkx-remark">{b.desc}</p>}
              {b.cta && (
                <div className="mkx-actions">
                  <Btn href={b.cta.href} label={b.cta.label} />
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
        <section
          key={index}
          className="mkx-sec mkx-soft qs-backdrop"
          style={{ "--qs-backdrop": "url('/images/contact-meeting-room.jpg')" } as React.CSSProperties}
        >
          <div className="mkx-container">
            <Head title={b.title} tagline={b.tagline} lines={[b.desc, b.intro].filter(Boolean) as string[]} center />
            <ul className="mkx-chips mkx-chips-center">
              {b.industries.map((it, i) => (
                <li key={`${it}-${i}`}>
                  <span className="mkx-chip-dot" aria-hidden="true" />
                  <span>{it}</span>
                </li>
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
        <section key={index} className="mkx-sec">
          <div className="mkx-container">
            <FaqList items={items} />
          </div>
        </section>
      );
    }

    return null;
  };

  const heroCtas = data.heroCtas && data.heroCtas.length > 0 ? data.heroCtas : data.heroCta ? [data.heroCta] : [];
  const [heroLead, ...heroRest] = data.heroParagraphs;

  return (
    <div className="mkx-page">
      <Header />
      <main>
        <section className="mkx-hero">
          <div className="mkx-hero-bg" aria-hidden="true" />
          <div className="mkx-container">
            <nav className="mkx-crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span>Services</span>
              <span aria-hidden="true">/</span>
              {categorySlug && categoryLabel ? (
                <>
                  <Link href={`/services/${categorySlug}`}>{categoryLabel}</Link>
                  <span aria-hidden="true">/</span>
                </>
              ) : null}
              <span className="mkx-crumb-now">{data.crumb}</span>
            </nav>
            <div className="mkx-cover">
              <div className="mkx-cover-photo" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos.hero} alt="" />
              </div>
              <div className="mkx-cover-card">
                <h1>
                  <Grad text={data.heroTitle} />
                </h1>
                {heroLead && <p className="mkx-lead">{heroLead}</p>}
              </div>
            </div>
            {(heroRest.length > 0 || heroCtas.length > 0) && (
              <div className="mkx-cover-foot">
                <div className="mkx-cover-more">
                  {heroRest.map((p, i) => (
                    <p key={i} className="mkx-text">
                      {p}
                    </p>
                  ))}
                </div>
                {heroCtas.length > 0 && (
                  <div className="mkx-actions">
                    {heroCtas.map((c, i) => (
                      <Btn key={`${c.label}-${i}`} href={c.href} label={c.label} variant={i === 0 ? "dark" : "outline"} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {data.blocks.map((block, i) => renderBlock(block, i))}

        <ServiceEnquiryForm service="digital-marketing" current={data.crumb} />

        <section className="mkx-close-sec">
          <div className="mkx-container">
            <div className="mkx-close">
              <div className="mkx-close-copy">
                <div className="mkx-close-badge">
                  <span className="mkx-badge-dot" aria-hidden="true" />
                  <span>{data.closingTagline || `Ready to Scale • ${data.crumb || "Digital Marketing"}`}</span>
                </div>

                {data.closingTitle && (
                  <h2>
                    <Grad text={data.closingTitle} />
                  </h2>
                )}

                {(data.closingDesc || "")
                  .split(/\n+/)
                  .filter(Boolean)
                  .map((p, i) => {
                    const isMotto = /Marketing\.\s*AI\.\s*Technology/i.test(p);
                    return isMotto ? (
                      <div key={i} className="mkx-close-motto">
                        <span className="mkx-motto-dot" aria-hidden="true" />
                        <span>{p}</span>
                      </div>
                    ) : (
                      <p key={i} className="mkx-close-desc">
                        {p}
                      </p>
                    );
                  })}

                {data.closingSignature && (
                  <div className="mkx-close-signature">
                    <strong>{data.closingSignature.name}</strong> <span>{data.closingSignature.line}</span>
                  </div>
                )}

                {data.closingCtas && data.closingCtas.length > 0 && (
                  <div className="mkx-close-actions">
                    {data.closingCtas.map((c, i) => (
                      <Link
                        key={`${c.label}-${i}`}
                        href={c.href || "/contact"}
                        className={`mkx-close-btn ${i === 0 ? "mkx-close-btn-primary" : "mkx-close-btn-secondary"}`}
                      >
                        <span>{c.label}</span>
                        <Arrow />
                      </Link>
                    ))}
                  </div>
                )}

                <div className="mkx-close-perks">
                  {(closingPerksMap[data.crumb || ""] || defaultClosingPerks).map((perk, i) => (
                    <div key={i} className="mkx-close-perk">
                      <CheckIcon />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mkx-close-media" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos.cta} alt="" loading="lazy" />
                <div className="mkx-close-media-overlay" />
                <div className="mkx-close-badge-float">
                  <span className="mkx-badge-pulse" />
                  <span>Quickupp Softech® • Growth Partner</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <EditorialMotion />
      <Footer />
    </div>
  );
}

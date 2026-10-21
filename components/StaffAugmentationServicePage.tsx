"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/app/staff-augmentation-service.css";
import type {
  AiBlock,
  FaqBlock,
  ProcessBlock,
  ServicePageData,
  WhyChooseBlock,
} from "@/lib/servicePageTypes";

/*
 * Staff Augmentation service pages (Marketing & Design / IT).
 * Everything shown comes from the page's data file — no placeholder
 * testimonials, stats or template copy. Photos are decorative only.
 */

type PhotoSet = {
  hero: string;
  heroSmall: string;
  resources: string;
  why: string;
  audience: string;
  faq: string;
  closing: string;
};

const photoSets: Record<string, PhotoSet> = {
  "IT Staff Augmentation": {
    hero: "/images/contact-corporate-consultation.jpg",
    heroSmall: "/images/contact-consultancy-partners.jpg",
    resources: "/images/titlebar-img-02.jpg",
    why: "/images/contact-office-consultation.jpg",
    audience: "/images/contact-agency-consultation.jpg",
    faq: "/images/contact-support-consultant.jpg",
    closing: "/images/contact-consulting-planning.jpg",
  },
  "Marketing & Design Staff Augmentation": {
    hero: "/images/service-img-04.jpg",
    heroSmall: "/images/contact-diverse-meeting.jpg",
    resources: "/images/titlebar-img-03.jpg",
    why: "/images/contact-customer-consultant.jpg",
    audience: "/images/contact-meeting-discussion.jpg",
    faq: "/images/contact-professional-consultant.jpg",
    closing: "/images/service-img-06.jpg",
  },
};

/** Puts the last ~45% of a heading in the brand gradient. */
function GradientHeading({ text }: { text: string }) {
  const words = text.split(" ");
  if (words.length < 3) return <span className="sxa-gradient">{text}</span>;
  const split = Math.max(1, Math.floor(words.length * 0.55));
  return (
    <>
      {words.slice(0, split).join(" ")}{" "}
      <span className="sxa-gradient">{words.slice(split).join(" ")}</span>
    </>
  );
}

function Svg({ children, size = 20, stroke = 1.9 }: { children: React.ReactNode; size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const ArrowIcon = () => (
  <Svg size={16} stroke={2.2}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </Svg>
);

const CheckIcon = () => (
  <Svg size={13} stroke={2.8}>
    <path d="M20 6L9 17l-5-5" />
  </Svg>
);

/* Icons for the "Who Can Benefit?" cards, matched on keywords */
function audienceIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("startup")) return <path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M14.5 4.5c3-1.5 5.5-1.5 5.5-1.5s0 2.5-1.5 5.5L12 15l-3-3zM9 12l-3-1 2.5-3H12M12 15l1 3 3-2.5V12" />;
  if (l.includes("smb")) return <><path d="M3 21h18M5 21V8l7-4 7 4v13" /><path d="M9 21v-5h6v5M9 11h.01M15 11h.01" /></>;
  if (l.includes("saas")) return <path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 8.5a4.75 4.75 0 0 1-1 9.5z" />;
  if (l.includes("e-commerce") || l.includes("ecommerce")) return <><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" /><circle cx="10" cy="20" r="1" /><circle cx="17" cy="20" r="1" /></>;
  if (l.includes("software")) return <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" />;
  if (l.includes("technology")) return <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></>;
  if (l.includes("enterprise")) return <><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01" /></>;
  if (l.includes("agenc")) return <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />;
  if (l.includes("global")) return <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>;
  if (l.includes("in-house") || l.includes("team")) return <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.2a5 5 0 0 1 5.5 4.8" /></>;
  return <path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.4 7.2 17.9l.9-5.4L4.2 8.7l5.4-.8z" />;
}

function PrimaryButton({ href, label, light = false }: { href: string; label: string; light?: boolean }) {
  return (
    <Link href={href} className={`sxa-btn ${light ? "sxa-btn-white" : "sxa-btn-dark"}`}>
      <span>{label}</span>
      <span className="sxa-btn-icon">
        <ArrowIcon />
      </span>
    </Link>
  );
}

function SectionBg({ src }: { src: string }) {
  return (
    <div className="sxa-bg" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading="lazy" />
    </div>
  );
}

export default function StaffAugmentationServicePage({
  data,
  categoryLabel,
  categorySlug,
}: {
  data: ServicePageData;
  categoryLabel?: string;
  categorySlug?: string;
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const photos = photoSets[data.crumb] ?? photoSets["IT Staff Augmentation"];

  /* Split the content blocks: "ai" blocks before the process are the talent
     tracks, the one after it is the audience ("Who Can Benefit?"). */
  const processIndex = data.blocks.findIndex((b) => b.type === "process");
  const tracks = data.blocks.filter(
    (b, i): b is AiBlock => b.type === "ai" && (processIndex === -1 || i < processIndex)
  );
  const audience = data.blocks.find(
    (b, i): b is AiBlock => b.type === "ai" && processIndex !== -1 && i > processIndex
  );
  const processBlock = data.blocks.find((b): b is ProcessBlock => b.type === "process");
  const why = data.blocks.find((b): b is WhyChooseBlock => b.type === "whyChoose");
  const faq = data.blocks.find((b): b is FaqBlock => b.type === "faq");
  const faqItems = faq ? faq.items || faq.faqs || [] : [];

  /* Hero: a short closing line ("Add the Right Talent. ...") is shown as a statement */
  const lastPara = data.heroParagraphs[data.heroParagraphs.length - 1] || "";
  const hasStatement = data.heroParagraphs.length > 1 && lastPara.length < 80;
  const heroParas = hasStatement ? data.heroParagraphs.slice(0, -1) : data.heroParagraphs;

  const heroRoles = (tracks[0]?.bullets || []).slice(0, 4);
  const showWhyTagline = why?.tagline && !why.bullets.includes(why.tagline);

  /* Closing: first paragraph holds the questions, the rest is the answer */
  const [closingQuestionsText, ...closingRest] = data.closingDesc.split(/\n\s*\n/);
  const closingQuestions = closingQuestionsText.match(/[^?]+\?/g)?.map((q) => q.trim()) ?? [];
  const closingParas = closingQuestions.length > 0 ? closingRest : [closingQuestionsText, ...closingRest];

  return (
    <div className="sxa-page">
      <Header />

      <main>
        {/* 1. Hero */}
        <section className="sxa-hero">
          <div className="sxa-hero-glow" aria-hidden="true" />
          <div className="sxa-container">
            <nav className="sxa-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <span>Services</span>
              <span>/</span>
              {categorySlug && categoryLabel && categoryLabel !== data.crumb ? (
                <>
                  <Link href={`/services/${categorySlug}`}>{categoryLabel}</Link>
                  <span>/</span>
                </>
              ) : null}
              <span className="sxa-breadcrumb-current">{data.crumb}</span>
            </nav>

            <div className="sxa-hero-grid">
              <div className="sxa-hero-copy">
                <span className="sxa-pill">{data.heroEyebrow}</span>
                <h1 className="sxa-h1">
                  <GradientHeading text={data.heroTitle} />
                </h1>
                {heroParas.map((p, i) => (
                  <p key={i} className={i === 0 ? "sxa-lead" : "sxa-text"}>
                    {p}
                  </p>
                ))}
                {hasStatement && <p className="sxa-statement">{lastPara}</p>}
                <div className="sxa-actions">
                  {(data.heroCtas && data.heroCtas.length > 0 ? data.heroCtas : [data.heroCta]).map((cta, i) =>
                    i === 0 ? (
                      <PrimaryButton key={cta.label} href={cta.href} label={cta.label} />
                    ) : (
                      <Link key={cta.label} href={cta.href} className="sxa-btn sxa-btn-outline">
                        {cta.label}
                      </Link>
                    )
                  )}
                </div>
              </div>

              <div className="sxa-hero-visual">
                <div className="sxa-hero-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photos.hero} alt="" />
                </div>
                <div className="sxa-hero-photo-small" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photos.heroSmall} alt="" />
                </div>
                {tracks[0] && heroRoles.length > 0 && (
                  <div className="sxa-roster">
                    <span className="sxa-roster-title">{tracks[0].title}</span>
                    <ul>
                      {heroRoles.map((r) => (
                        <li key={r}>
                          <span className="sxa-tick">
                            <CheckIcon />
                          </span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Talent tracks */}
        {tracks.length > 0 && (
          <section className="sxa-section sxa-dark sxa-has-bg">
            <SectionBg src={photos.resources} />
            <div className="sxa-container">
              {data.resourcesTitle && (
                <div className="sxa-head">
                  <h2 className="sxa-h2 sxa-tracks-title">
                    <GradientHeading text={data.resourcesTitle} />
                  </h2>
                  {data.resourcesIntro && <p className="sxa-lead">{data.resourcesIntro}</p>}
                </div>
              )}
              <div className={`sxa-tracks sxa-tracks-${Math.min(tracks.length, 2)}`}>
                {tracks.map((t, ti) => (
                  <article key={t.title} className="sxa-track">
                    <div className="sxa-track-head">
                      <span className="sxa-track-num">{String(ti + 1).padStart(2, "0")}</span>
                      {data.resourcesTitle ? (
                        <h3 className="sxa-h2">{t.title}</h3>
                      ) : (
                        <h2 className="sxa-h2">{t.title}</h2>
                      )}
                      {t.intro && <p className="sxa-text">{t.intro}</p>}
                    </div>
                    <ul className="sxa-role-list">
                      {(t.bullets || []).map((b) => (
                        <li key={b} className="sxa-role">
                          <span className="sxa-role-dot" aria-hidden="true" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    {t.cta && (
                      <div className="sxa-track-cta">
                        <PrimaryButton href={t.cta.href} label={t.cta.label} light />
                      </div>
                    )}
                  </article>
                ))}
              </div>
              {data.resourcesCta && (
                <div className="sxa-actions sxa-center">
                  <PrimaryButton href={data.resourcesCta.href} label={data.resourcesCta.label} light />
                </div>
              )}
            </div>
          </section>
        )}

        {/* 3. Why Choose Quickupp Softech? */}
        {why && (
          <section className="sxa-section">
            <div className="sxa-container sxa-why">
              <div className="sxa-why-aside">
                <div className="sxa-why-sticky">
                  <h2 className="sxa-h2">
                    <GradientHeading text={why.title || ""} />
                  </h2>
                  {showWhyTagline && <p className="sxa-eyebrow">{why.tagline}</p>}
                  <div className="sxa-why-photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photos.why} alt="" loading="lazy" />
                    {why.desc && <p className="sxa-why-quote">{why.desc}</p>}
                  </div>
                </div>
              </div>
              <ol className="sxa-why-list">
                {why.bullets.map((b, i) => (
                  <li key={b} className="sxa-why-item">
                    <span className="sxa-why-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="sxa-why-label">{b}</span>
                    <span className="sxa-why-check">
                      <CheckIcon />
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* 4. How it works */}
        {processBlock && (
          <section className="sxa-section sxa-soft">
            <div className="sxa-container">
              <div className="sxa-head">
                <h2 className="sxa-h2">
                  <GradientHeading text={processBlock.title} />
                </h2>
              </div>
              <ol
                className="sxa-timeline"
                style={{ "--sxa-steps": (processBlock.steps || []).length } as React.CSSProperties}
              >
                {(processBlock.steps || []).map((st) => (
                  <li key={st.num} className="sxa-tl-step">
                    <span className="sxa-tl-node">{st.num}</span>
                    <div className="sxa-tl-body">
                      <h3 className="sxa-h3">{st.title}</h3>
                      <p className="sxa-text">{st.desc || st.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {processBlock.cta && (
                <div className="sxa-actions sxa-center">
                  <PrimaryButton href={processBlock.cta.href} label={processBlock.cta.label} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5. Who Can Benefit? */}
        {audience && (
          <section className="sxa-section sxa-has-bg">
            <SectionBg src={photos.audience} />
            <div className="sxa-container">
              <div className="sxa-head">
                <h2 className="sxa-h2">
                  <GradientHeading text={audience.title} />
                </h2>
                {audience.intro && <p className="sxa-lead">{audience.intro}</p>}
              </div>
              <ul className="sxa-audience">
                {(audience.bullets || []).map((b) => (
                  <li key={b} className="sxa-audience-card">
                    <span className="sxa-audience-icon">
                      <Svg size={22}>{audienceIcon(b)}</Svg>
                    </span>
                    <span className="sxa-audience-label">{b}</span>
                  </li>
                ))}
              </ul>
              {audience.cta && (
                <div className="sxa-actions sxa-center">
                  <PrimaryButton href={audience.cta.href} label={audience.cta.label} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* 6. FAQ */}
        {faqItems.length > 0 && (
          <section className="sxa-section">
            <div className="sxa-container sxa-faq-wrap">
              <div className="sxa-faq-aside">
                <span className="sxa-pill">FAQ</span>
                <h2 className="sxa-h2">
                  <GradientHeading text={faq?.title || "Frequently Asked Questions"} />
                </h2>
                <div className="sxa-faq-photo" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photos.faq} alt="" loading="lazy" />
                </div>
              </div>
              <div className="sxa-faq">
                {faqItems.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div key={f.q} className={`sxa-faq-item${open ? " is-open" : ""}`}>
                      <button
                        type="button"
                        className="sxa-faq-q"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? null : i)}
                      >
                        <span className="sxa-faq-index">{String(i + 1).padStart(2, "0")}</span>
                        <span className="sxa-faq-text">{f.q}</span>
                        <span className="sxa-faq-sign" aria-hidden="true" />
                      </button>
                      {open && <p className="sxa-faq-a">{f.a}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 7. Closing */}
        <section className="sxa-closing-section">
          <div className="sxa-container">
            <div className="sxa-closing sxa-has-bg">
              <SectionBg src={photos.closing} />
              <div className="sxa-closing-grid">
                <div>
                  <h2 className="sxa-h2">
                    <GradientHeading text={data.closingTitle} />
                  </h2>
                  {closingQuestions.length > 0 && (
                    <ul className="sxa-questions">
                      {closingQuestions.map((q) => (
                        <li key={q}>
                          <span className="sxa-q-mark" aria-hidden="true">?</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="sxa-closing-side">
                  {closingParas.map((p, i) => (
                    <p key={i} className="sxa-lead">
                      {p}
                    </p>
                  ))}
                  {data.closingTagline && <p className="sxa-eyebrow">{data.closingTagline}</p>}
                  <div className="sxa-actions">
                    {data.closingCtas.map((cta, i) =>
                      i === 0 ? (
                        <PrimaryButton key={cta.label} href={cta.href} label={cta.label} light />
                      ) : (
                        <Link key={cta.label} href={cta.href} className="sxa-btn sxa-btn-ghost">
                          {cta.label}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

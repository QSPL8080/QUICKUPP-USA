"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TeamMotion from "@/components/TeamMotion";
import "@/app/staff-augmentation-service.css";
import type {
  AiBlock,
  FaqBlock,
  ProcessBlock,
  ServicePageData,
  WhyChooseBlock,
} from "@/lib/servicePageTypes";
import LucideIcon, { type LucideIconName } from "@/components/LucideIcon";

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

const ArrowIcon = () => <LucideIcon name="arrow-right" size={16} strokeWidth={2.2} />;

const CheckIcon = () => <LucideIcon name="check" size={13} strokeWidth={2.8} />;

/* Icons for the "Who Can Benefit?" cards, matched on keywords */
function audienceIcon(label: string): LucideIconName {
  const l = label.toLowerCase();
  if (l.includes("startup")) return "rocket";
  if (l.includes("smb")) return "store";
  if (l.includes("saas")) return "cloud";
  if (l.includes("e-commerce") || l.includes("ecommerce")) return "shopping-cart";
  if (l.includes("software")) return "code-xml";
  if (l.includes("technology")) return "cpu";
  if (l.includes("enterprise")) return "building-2";
  if (l.includes("agenc")) return "megaphone";
  if (l.includes("global")) return "globe";
  if (l.includes("in-house") || l.includes("team")) return "users";
  return "star";
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
                      <LucideIcon name={audienceIcon(b)} size={22} />
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
            <div className="sxa-container sxa-faq-solo">
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

      <TeamMotion />
      <Footer />
    </div>
  );
}

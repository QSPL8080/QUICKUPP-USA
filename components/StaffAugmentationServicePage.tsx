"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceEnquiryForm from "@/components/ServiceEnquiryForm";
import TeamMotion from "@/components/TeamMotion";
import LucideIcon, { type LucideIconName } from "@/components/LucideIcon";
import "@/app/staff-talent.css";
import type {
  AiBlock,
  FaqBlock,
  ProcessBlock,
  ServicePageData,
  WhyChooseBlock,
} from "@/lib/servicePageTypes";

/*
 * Staff Augmentation subpages (Marketing & Design / IT) — "tlx-" design, used
 * only here. Both pages share it so they read as one family: a team-lineup
 * hero of arched portraits, split talent benches with role tiles, a bento
 * why-choose grid, a chevron process flow, a dark audience panel, a
 * soft FAQ and a closing card. Every word comes from the page's data file;
 * photos and icons are decorative only.
 */

type Photos = { lineup: string[]; why: string };

const photoSets: Record<string, Photos> = {
  "Marketing & Design Staff Augmentation": {
    lineup: [
      "/images/team-img-02.jpg",
      "/images/contact-consultation-team.jpg",
      "/images/team-img-03.jpg",
      "/images/team-img-04.jpg",
      "/images/contact-professional-consultant.jpg",
      "/images/team-img-05.jpg",
    ],
    why: "/images/contact-strategy-consultation.jpg",
  },
  "IT Staff Augmentation": {
    lineup: [
      "/images/team-img-06.jpg",
      "/images/team-img-04.jpg",
      "/images/team-img-05.jpg",
      "/images/contact-client-consultation.jpg",
      "/images/team-img-03.jpg",
      "/images/team-img-01.jpg",
    ],
    why: "/images/contact-team-collaboration.jpg",
  },
};

/** Puts the last ~45% of a heading in the site's heading gradient. */
function GradientHeading({ text }: { text: string }) {
  const words = text.split(" ");
  if (words.length < 3) return <span className="qs-gradient-text">{text}</span>;
  const split = Math.max(1, Math.floor(words.length * 0.55));
  return (
    <>
      {words.slice(0, split).join(" ")} <span className="qs-gradient-text">{words.slice(split).join(" ")}</span>
    </>
  );
}

const ROLE_ICONS: [RegExp, LucideIconName][] = [
  [/seo/i, "search"],
  [/social media marketing/i, "share-2"],
  [/ads\b/i, "target"],
  [/content marketing/i, "pen-line"],
  [/email/i, "mail"],
  [/lead/i, "filter"],
  [/analytics/i, "chart-column"],
  [/campaign/i, "megaphone"],
  [/graphic/i, "palette"],
  [/ui\/ux/i, "layout-grid"],
  [/social media creative/i, "sparkles"],
  [/ad creative/i, "eye"],
  [/presentation/i, "monitor-smartphone"],
  [/brand/i, "star"],
  [/video|reels/i, "clapperboard"],
  [/creative content/i, "book-open"],
  [/frontend/i, "monitor-smartphone"],
  [/backend/i, "settings"],
  [/full-stack/i, "layers"],
  [/web developer/i, "globe"],
  [/mobile/i, "smartphone"],
  [/react|next/i, "code-xml"],
  [/php|\.net|software engineer/i, "code-xml"],
  [/qa|testing/i, "bug"],
  [/devops/i, "workflow"],
  [/cloud/i, "cloud"],
  [/database/i, "layers"],
  [/project manager/i, "briefcase"],
  [/analyst/i, "chart-column"],
];

const roleIcon = (label: string): LucideIconName => ROLE_ICONS.find(([re]) => re.test(label))?.[1] ?? "user-round-check";

function trackIcon(title: string): LucideIconName {
  const t = title.toLowerCase();
  if (t.includes("design") || t.includes("creative")) return "palette";
  if (t.includes("marketing")) return "megaphone";
  if (t.includes("software")) return "code-xml";
  return "cpu";
}

function audienceIcon(label: string): LucideIconName {
  const l = label.toLowerCase();
  if (l.includes("startup")) return "rocket";
  if (l.includes("smb")) return "store";
  if (l.includes("saas")) return "cloud";
  if (l.includes("e-commerce")) return "shopping-cart";
  if (l.includes("software")) return "code-xml";
  if (l.includes("technology")) return "cpu";
  if (l.includes("enterprise")) return "building-2";
  if (l.includes("agenc")) return "megaphone";
  if (l.includes("global")) return "globe";
  if (l.includes("in-house")) return "users";
  return "users-round";
}

function Btn({ href, label, tone = "dark" }: { href: string; label: string; tone?: "dark" | "outline" | "white" }) {
  return (
    <Link href={href} className={`tlx-btn tlx-btn-${tone}`}>
      <span>{label}</span>
      {tone !== "outline" && <LucideIcon name="arrow-right" size={16} strokeWidth={2.2} />}
    </Link>
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
  const steps = processBlock?.steps || [];

  /* Hero: a short closing line ("Add the Right Talent. ...") becomes a segmented statement */
  const lastPara = data.heroParagraphs[data.heroParagraphs.length - 1] || "";
  const hasStatement = data.heroParagraphs.length > 1 && lastPara.length < 80;
  const heroParas = hasStatement ? data.heroParagraphs.slice(0, -1) : data.heroParagraphs;
  const statementParts = hasStatement ? lastPara.match(/[^.]+\.?/g)?.map((s) => s.trim()).filter(Boolean) ?? [] : [];
  const heroCtas = data.heroCtas && data.heroCtas.length > 0 ? data.heroCtas : [data.heroCta];

  /* Why-choose bento: photo takes 2×2 of a 4-column grid; the last tile widens to close the grid */
  const whyBullets = why?.bullets || [];
  const deskRem = (4 + whyBullets.length) % 4;
  const lastDeskSpan = deskRem === 0 ? 1 : 4 - deskRem + 1;
  const lastMobSpan = whyBullets.length % 2 === 1 ? 2 : 1;

  /* Closing: first paragraph holds the questions, the rest is the answer */
  const [closingQuestionsText, ...closingRest] = data.closingDesc.split(/\n\s*\n/);
  const closingQuestions = closingQuestionsText.match(/[^?]+\?/g)?.map((q) => q.trim()) ?? [];
  const closingParas = closingQuestions.length > 0 ? closingRest : [closingQuestionsText, ...closingRest];

  return (
    <div className="tlx-page">
      <Header />

      <main>
        {/* 1. Hero — team lineup */}
        <section className="tlx-hero">
          <div className="tlx-hero-wash" aria-hidden="true" />
          <div className="tlx-container">
            <nav className="tlx-crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span>Services</span>
              <span aria-hidden="true">/</span>
              {categorySlug && categoryLabel && categoryLabel !== data.crumb ? (
                <>
                  <Link href={`/services/${categorySlug}`}>{categoryLabel}</Link>
                  <span aria-hidden="true">/</span>
                </>
              ) : null}
              <span className="tlx-crumb-now">{data.crumb}</span>
            </nav>

            <div className="tlx-hero-copy">
              {data.heroEyebrow && data.heroEyebrow !== data.crumb && (
                <p className="tlx-eyebrow">{data.heroEyebrow}</p>
              )}
              <h1>
                <GradientHeading text={data.heroTitle} />
              </h1>
              {heroParas.map((p, i) => (
                <p key={i} className={i === 0 ? "tlx-lead" : "tlx-text"}>
                  {p}
                </p>
              ))}
              {statementParts.length > 0 && (
                <p className="tlx-statement">
                  {statementParts.map((s, i) => (
                    <span key={i} className="tlx-statement-part">
                      {s}
                    </span>
                  ))}
                </p>
              )}
              <div className="tlx-actions tlx-actions-center">
                {heroCtas.map((cta, i) => (
                  <Btn key={cta.label} href={cta.href} label={cta.label} tone={i === 0 ? "dark" : "outline"} />
                ))}
              </div>
            </div>
          </div>

          <div className="tlx-lineup" aria-hidden="true">
            {photos.lineup.map((src, i) => (
              <div key={src} className={`tlx-seat tlx-seat-${i + 1}`}>
                <div className="tlx-seat-in">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Talent benches */}
        {tracks.length > 0 && (
          <section className="tlx-sec">
            <div className="tlx-container">
              {data.resourcesTitle && (
                <div className="tlx-head tlx-head-center">
                  <h2>
                    <GradientHeading text={data.resourcesTitle} />
                  </h2>
                  {data.resourcesIntro && <p className="tlx-lead">{data.resourcesIntro}</p>}
                </div>
              )}
              <div className="tlx-benches">
                {tracks.map((t, ti) => (
                  <article key={t.title} className="tlx-bench">
                    <div className="tlx-bench-head">
                      <span className="tlx-bench-icon">
                        <LucideIcon name={trackIcon(t.title)} size={22} strokeWidth={1.9} />
                      </span>
                      <div className="tlx-bench-copy">
                        {data.resourcesTitle ? <h3>{t.title}</h3> : <h2>{t.title}</h2>}
                        {t.intro && <p className="tlx-text">{t.intro}</p>}
                      </div>
                      {t.cta && (
                        <div className="tlx-bench-cta">
                          <Btn href={t.cta.href} label={t.cta.label} />
                        </div>
                      )}
                    </div>
                    <ul className="tlx-roles">
                      {(t.bullets || []).map((b) => (
                        <li key={b} className="tlx-role">
                          <span className="tlx-role-icon">
                            <LucideIcon name={roleIcon(b)} size={18} strokeWidth={1.9} />
                          </span>
                          <span className="tlx-role-label">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              {data.resourcesCta && (
                <div className="tlx-actions tlx-actions-center tlx-after">
                  <Btn href={data.resourcesCta.href} label={data.resourcesCta.label} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* 3. Why choose — bento */}
        {why && (
          <section className="tlx-sec tlx-soft">
            <div className="tlx-container">
              <div className="tlx-head">
                <h2>
                  <GradientHeading text={why.title || ""} />
                </h2>
                {why.tagline && !whyBullets.includes(why.tagline) && <p className="tlx-lead">{why.tagline}</p>}
              </div>
              <ul className="tlx-bento">
                <li className="tlx-bento-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photos.why} alt="" loading="lazy" />
                  {why.desc && <p className="tlx-bento-quote">{why.desc}</p>}
                </li>
                {whyBullets.map((b, i) => {
                  const last = i === whyBullets.length - 1;
                  const cls = last ? ` tlx-span-d${lastDeskSpan} tlx-span-m${lastMobSpan}` : "";
                  return (
                    <li key={b} className={`tlx-bento-tile${cls}`}>
                      <span className="tlx-bento-check">
                        <LucideIcon name="check" size={15} strokeWidth={2.6} />
                      </span>
                      <span className="tlx-bento-label">{b}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {/* 4. Process — chevron flow */}
        {processBlock && (
          <section className="tlx-sec">
            <div className="tlx-container">
              <div className="tlx-head">
                <h2>
                  <GradientHeading text={processBlock.title} />
                </h2>
              </div>
              <ol className="tlx-flow" style={{ "--tlx-steps": steps.length } as React.CSSProperties}>
                {steps.map((st, i) => (
                  <li
                    key={st.num}
                    className={`tlx-flow-step${i === steps.length - 1 ? " is-last" : ""}`}
                    style={{ "--tlx-i": i } as React.CSSProperties}
                  >
                    <span className="tlx-flow-num">{st.num}</span>
                    <h3>{st.title}</h3>
                    <p className="tlx-text">{st.desc || st.text}</p>
                  </li>
                ))}
              </ol>
              {processBlock.cta && (
                <div className="tlx-actions tlx-actions-center tlx-after">
                  <Btn href={processBlock.cta.href} label={processBlock.cta.label} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5. Who can benefit — dark panel */}
        {audience && (
          <section className="tlx-sec tlx-sec-tight">
            <div className="tlx-container">
              <div className="tlx-panel">
                <div className="tlx-panel-glow" aria-hidden="true" />
                <div className="tlx-panel-grid">
                  <div className="tlx-panel-head">
                    <h2>
                      <GradientHeading text={audience.title} />
                    </h2>
                    {audience.intro && <p className="tlx-lead">{audience.intro}</p>}
                    {audience.cta && (
                      <div className="tlx-actions">
                        <Btn href={audience.cta.href} label={audience.cta.label} tone="white" />
                      </div>
                    )}
                  </div>
                  <ul className="tlx-who">
                    {(audience.bullets || []).map((b) => (
                      <li key={b} className="tlx-who-row">
                        <span className="tlx-who-icon">
                          <LucideIcon name={audienceIcon(b)} size={19} strokeWidth={1.9} />
                        </span>
                        <span className="tlx-who-label">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 6. FAQ (no heading) */}
        {faqItems.length > 0 && (
          <section className="tlx-sec">
            <div className="tlx-container tlx-faq-wrap">
              <div className="tlx-faq">
                {faqItems.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div key={f.q} className={`tlx-faq-item${open ? " is-open" : ""}`}>
                      <button
                        type="button"
                        className="tlx-faq-q"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? null : i)}
                      >
                        <span className="tlx-faq-text">{f.q}</span>
                        <span className="tlx-faq-sign" aria-hidden="true" />
                      </button>
                      <div className="tlx-faq-a" aria-hidden={!open}>
                        <div>
                          <p className="tlx-text">{f.a}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <ServiceEnquiryForm service="staff-augmentation" current={data.crumb} />

        {/* 7. Closing */}
        <section className="tlx-sec tlx-closing-sec">
          <div className="tlx-container">
            <div className="tlx-closing">
              <h2>
                <GradientHeading text={data.closingTitle} />
              </h2>
              {closingQuestions.length > 0 && (
                <ul className="tlx-asks">
                  {closingQuestions.map((q) => (
                    <li key={q} className="tlx-ask">
                      {q}
                    </li>
                  ))}
                </ul>
              )}
              {closingParas.map((p, i) => (
                <p key={i} className="tlx-lead tlx-closing-text">
                  {p}
                </p>
              ))}
              {data.closingTagline && <p className="tlx-cue">{data.closingTagline}</p>}
              <div className="tlx-actions tlx-actions-center">
                {data.closingCtas.map((cta, i) => (
                  <Btn key={cta.label} href={cta.href} label={cta.label} tone={i === 0 ? "dark" : "outline"} />
                ))}
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

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceEnquiryForm from "@/components/ServiceEnquiryForm";
import TechMotion from "@/components/TechMotion";
import LucideIcon, { type LucideIconName } from "@/components/LucideIcon";
import type {
  AiBlock,
  DescPairsBlock,
  FaqBlock,
  IndustriesBlock,
  ProcessBlock,
  ServiceBlock,
  ServicePageData,
  WhyChooseBlock,
} from "@/lib/servicePageTypes";
import "@/app/it-services.css";

/*
 * Information Technology Services subpages — "itx-" design, used only here:
 * a split hero with the photo filling the right half of the screen, open service cards for each offering, check-tile panels, outlined spec cards, a dark
 * process board, why-choose split, linked industry pills, FAQ and an inline
 * call-to-action bar. Every word comes from the page's data file.
 */

interface Props {
  data: ServicePageData;
  categoryLabel?: string;
  categorySlug?: string;
}

function Grad({ text }: { text?: string }) {
  if (!text) return null;
  const words = text.trim().split(/\s+/);
  if (words.length < 3) return <span className="qs-gradient-text">{text}</span>;
  const split = Math.max(1, Math.floor(words.length * 0.55));
  return (
    <>
      {words.slice(0, split).join(" ")} <span className="qs-gradient-text">{words.slice(split).join(" ")}</span>
    </>
  );
}

const Arrow = ({ size = 16 }: { size?: number }) => <LucideIcon name="arrow-right" size={size} strokeWidth={2.2} />;
const Check = () => <LucideIcon name="check" size={12} strokeWidth={3} />;

function Btn({ href, label, variant = "dark" }: { href?: string; label: string; variant?: "dark" | "outline" | "white" | "ghost" }) {
  return (
    <Link href={href || "/contact"} className={`itx-btn itx-btn-${variant}`}>
      <span>{label}</span>
      {(variant === "dark" || variant === "white") && <Arrow />}
    </Link>
  );
}

const heroImages: Record<string, string> = {
  "Application Development": "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1400&q=85",
  "Product Engineering": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=85",
  "Quality Assurance & Testing": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=85",
  "UI/UX Design": "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1400&q=85",
};
const defaultHero = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=85";

const industryLinks: Record<string, string> = {
  Healthcare: "/industries/healthcare",
  "Home Services": "/industries/home-services",
  "Professional Services": "/industries/professional-services",
  Education: "/industries/education",
  "IT & SaaS": "/industries/it-saas",
  eCommerce: "/industries/ecommerce",
  "Real Estate": "/industries/real-estate",
  "Interior Design": "/industries/interior-design",
  "Travel & Hospitality": "/industries/travel-hospitality",
  Automotive: "/contact",
};

const industryIcons: Record<string, LucideIconName> = {
  Healthcare: "heart-pulse",
  "Home Services": "house",
  "Professional Services": "briefcase",
  Education: "graduation-cap",
  "IT & SaaS": "cloud",
  eCommerce: "shopping-cart",
  "Real Estate": "building",
  "Interior Design": "sofa",
  "Travel & Hospitality": "plane",
  Automotive: "settings",
};

const pad = (n: number) => String(n).padStart(2, "0");
const lines = (t?: string) => (t || "").split("\n").map((l) => l.trim()).filter(Boolean);

/* ---- Service offerings: open service cards, two per row --------------------- */
function Capabilities({ blocks }: { blocks: AiBlock[] }) {
  return (
    <section className="itx-sec">
      <div className="itx-container">
        <div className={`itx-svc-grid${blocks.length === 1 ? " is-single" : ""}`}>
          {blocks.map((b, i) => (
            <article key={`${b.title}-${i}`} className="itx-svc">
              <div className="itx-svc-top">
                <span className="itx-svc-num" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <span className="itx-svc-rule" aria-hidden="true" />
              </div>
              {b.subtitle && <p className="itx-kicker">{b.subtitle}</p>}
              <h3>{b.title}</h3>
              {lines(b.desc).map((l, k) => (
                <p key={`d${k}`} className="itx-text">
                  {l}
                </p>
              ))}
              {lines(b.intro).map((l, k) => (
                <p key={`i${k}`} className="itx-text">
                  {l}
                </p>
              ))}
              {b.bullets && b.bullets.length > 0 && (
                <ul className="itx-svc-list">
                  {b.bullets.map((it) => (
                    <li key={it}>
                      <span className="itx-dot" aria-hidden="true" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              )}
              {b.cta && (
                <Link href={b.cta.href || "/contact"} className="itx-svc-link">
                  <span>{b.cta.label}</span>
                  <Arrow size={15} />
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- Other list blocks: heading column + dotted list card --------------------- */
function TilePanel({ b, soft }: { b: AiBlock; soft: boolean }) {
  return (
    <section className={`itx-sec${soft ? " itx-soft" : ""}`}>
      <div className="itx-container itx-pair">
        <div className="itx-pair-head">
          {b.subtitle && <p className="itx-kicker">{b.subtitle}</p>}
          <h2>
            <Grad text={b.title} />
          </h2>
          {lines(b.intro).map((l, k) => (
            <p key={k} className="itx-text">
              {l}
            </p>
          ))}
          {b.cta && (
            <div className="itx-actions">
              <Btn href={b.cta.href} label={b.cta.label} />
            </div>
          )}
        </div>
        <div className="itx-pair-card">
          <ul className="itx-dots">
            {(b.bullets || []).map((it) => (
              <li key={it}>
                <span className="itx-dot" aria-hidden="true" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
          {lines(b.desc).map((l, k) => (
            <p key={k} className="itx-pair-note">
              {l}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- Title + description pairs: numbered cards ------------------------------ */
function SpecCards({ b }: { b: DescPairsBlock }) {
  return (
    <section className="itx-sec itx-soft">
      <div className="itx-container">
        <div className="itx-head">
          {b.title && (
            <h2>
              <Grad text={b.title} />
            </h2>
          )}
          {lines(b.desc).map((l, k) => (
            <p key={k} className="itx-text">
              {l}
            </p>
          ))}
        </div>
        <div className="itx-specs">
          {b.items.map((it, i) => (
            <article key={it.title} className="itx-spec">
              <div className="itx-svc-top">
                <span className="itx-svc-num" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <span className="itx-svc-rule" aria-hidden="true" />
              </div>
              <h3>{it.title}</h3>
              <p className="itx-text">{it.desc}</p>
            </article>
          ))}
        </div>
        {b.cta && (
          <div className="itx-actions itx-actions-center">
            <Btn href={b.cta.href} label={b.cta.label} />
          </div>
        )}
      </div>
    </section>
  );
}

/* ---- Process: rows of steps on a shared line -------------------------------- */
function ProcessBoard({ b }: { b: ProcessBlock }) {
  const steps = b.steps || [];
  const perRow = steps.length === 6 || steps.length === 5 ? 3 : 4;
  const rows: (typeof steps)[] = [];
  for (let i = 0; i < steps.length; i += perRow) rows.push(steps.slice(i, i + perRow));
  return (
    <section
      className="itx-sec qs-backdrop"
      style={{ "--qs-backdrop": "url('/images/contact-client-deal.jpg')" } as React.CSSProperties}
    >
      <div className="itx-container">
        <div className="itx-head itx-head-center">
          <h2>
            <Grad text={b.title} />
          </h2>
          {lines(b.intro).map((l, k) => (
            <p key={`i${k}`} className="itx-text">
              {l}
            </p>
          ))}
          {lines(b.desc).map((l, k) => (
            <p key={`d${k}`} className="itx-text">
              {l}
            </p>
          ))}
        </div>
        <div className="itx-track-rows">
          {rows.map((row, r) => (
            <ol key={r} className="itx-track" style={{ "--itx-cols": perRow } as React.CSSProperties}>
              {row.map((st, i) => (
                <li key={`${st.title}-${i}`} className="itx-track-step">
                  <span className="itx-track-node">{st.num || pad(r * perRow + i + 1)}</span>
                  <h3>{st.title}</h3>
                  {(st.desc || st.text) && <p className="itx-text">{st.desc || st.text}</p>}
                </li>
              ))}
            </ol>
          ))}
        </div>
        {b.cta && (
          <div className="itx-actions itx-actions-center">
            <Btn href={b.cta.href} label={b.cta.label} />
          </div>
        )}
      </div>
    </section>
  );
}

/* ---- Why choose: one wide card ----------------------------------------------- */
function WhySplit({ b }: { b: WhyChooseBlock }) {
  return (
    <section className="itx-sec itx-soft">
      <div className="itx-container">
        <div className="itx-why-card">
          <div className="itx-why-top">
            <div className="itx-why-titles">
              {b.tagline && <p className="itx-kicker">{b.tagline}</p>}
              {b.title && (
                <h2>
                  <Grad text={b.title} />
                </h2>
              )}
              {lines(b.intro).map((l, k) => (
                <p key={`i${k}`} className="itx-text">
                  {l}
                </p>
              ))}
            </div>
            {lines(b.desc).map((l, k) => (
              <p key={`d${k}`} className="itx-statement">
                {l}
              </p>
            ))}
          </div>
          <ul className="itx-why-grid">
            {b.bullets.map((it) => (
              <li key={it}>
                <span className="itx-tick" aria-hidden="true">
                  <Check />
                </span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
          {b.cta && (
            <div className="itx-actions">
              <Btn href={b.cta.href} label={b.cta.label} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---- Industries: hairline link grid ------------------------------------------- */
function IndustryPills({ b }: { b: IndustriesBlock }) {
  return (
    <section className="itx-sec qs-backdrop" style={{ "--qs-backdrop": "url('/images/contact-meeting-room.jpg')" } as React.CSSProperties}>
      <div className="itx-container">
        <div className="itx-head itx-head-center">
          {b.title && (
            <h2>
              <Grad text={b.title} />
            </h2>
          )}
          {lines(b.intro).map((l, k) => (
            <p key={k} className="itx-text">
              {l}
            </p>
          ))}
        </div>
        <ul className="itx-ind copora-industries-grid">
          {b.industries.map((ind) => (
            <li key={ind}>
              <Link href={industryLinks[ind] || "/contact"} className="itx-ind-link">
                <span className="itx-ind-icon" aria-hidden="true">
                  <LucideIcon name={industryIcons[ind] || "sparkles"} size={20} strokeWidth={1.8} />
                </span>
                <span className="itx-ind-name">{ind}</span>
                <span className="itx-ind-go" aria-hidden="true">
                  <LucideIcon name="arrow-up-right" size={15} strokeWidth={2.2} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---- FAQ: soft cards ---------------------------------------------------------- */
function Faq({ b }: { b: FaqBlock }) {
  const items = b.items || b.faqs || [];
  const [open, setOpen] = useState<number | null>(0);
  if (!items.length) return null;
  return (
    <section className="itx-sec itx-soft">
      <div className="itx-container itx-faq">
        {items.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className={`itx-faq-item${isOpen ? " is-open" : ""}`}>
              <button type="button" className="itx-faq-q" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
                <span>{f.q}</span>
                <span className="itx-faq-sign" aria-hidden="true" />
              </button>
              <div className="itx-faq-a">
                <div>
                  <p className="itx-text">{f.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function CoporaServicePage({ data, categoryLabel, categorySlug }: Props) {
  const heroImage = heroImages[data.crumb] || defaultHero;
  const heroCtas = data.heroCtas && data.heroCtas.length ? data.heroCtas : data.heroCta ? [data.heroCta] : [];
  const [heroLead, ...heroRest] = data.heroParagraphs || [];
  const showEyebrow = !!data.heroEyebrow && data.heroEyebrow.trim() !== data.crumb.trim();
  /* Group consecutive service offerings (list blocks with a button) into one capability set */
  const groups: ({ kind: "caps"; blocks: AiBlock[] } | { kind: "block"; block: ServiceBlock })[] = [];
  data.blocks.forEach((b) => {
    const isCap = b.type === "ai" && !!(b as AiBlock).cta && (b as AiBlock).bullets?.length;
    const last = groups[groups.length - 1];
    if (isCap) {
      if (last && last.kind === "caps") last.blocks.push(b as AiBlock);
      else groups.push({ kind: "caps", blocks: [b as AiBlock] });
    } else groups.push({ kind: "block", block: b });
  });

  let tileSoft = false;

  const crumbs = (
    <nav className="itx-crumbs" aria-label="Breadcrumb">
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
      <span className="itx-crumb-now">{data.crumb}</span>
    </nav>
  );
  const more = heroRest.map((p, i) => (
    <p key={i} className="itx-text">
      {p}
    </p>
  ));
  const actions =
    heroCtas.length > 0 ? (
      <div className="itx-actions">
        {heroCtas.map((c, i) => (
          <Btn key={c.label} href={c.href} label={c.label} variant={i === 0 ? "dark" : "outline"} />
        ))}
      </div>
    ) : null;

  return (
    <div className="itx-page">
      <Header />
      <main>
        <section className="itx-hero itx-hero-edge">
          <div className="itx-hero-bg" aria-hidden="true" />
          <div className="itx-edge-photo" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImage} alt="" />
          </div>
          <div className="itx-container">
            {crumbs}
            <div className="itx-hero-grid">
              <div className="itx-hero-copy">
                {showEyebrow && <p className="itx-kicker">{data.heroEyebrow}</p>}
                <h1>
                  <Grad text={data.heroTitle} />
                </h1>
                {heroLead && <p className="itx-lead">{heroLead}</p>}
                {heroRest.length > 0 && <div className="itx-hero-more">{more}</div>}
                {actions}
              </div>
            </div>
          </div>
        </section>

        {groups.map((g, i) => {
          if (g.kind === "caps") return <Capabilities key={i} blocks={g.blocks} />;
          const b = g.block;
          if (b.type === "ai") {
            tileSoft = !tileSoft;
            return <TilePanel key={i} b={b as AiBlock} soft={tileSoft} />;
          }
          if (b.type === "descPairs") return <SpecCards key={i} b={b as DescPairsBlock} />;
          if (b.type === "process") return <ProcessBoard key={i} b={b as ProcessBlock} />;
          if (b.type === "whyChoose") return <WhySplit key={i} b={b as WhyChooseBlock} />;
          if (b.type === "industries") return <IndustryPills key={i} b={b as IndustriesBlock} />;
          if (b.type === "faq") return <Faq key={i} b={b as FaqBlock} />;
          return null;
        })}

        <ServiceEnquiryForm service="it-services" current={data.crumb} />

        <section className="itx-close-sec">
          <div className="itx-container">
            <div className="itx-close">
              <span className="itx-close-glow" aria-hidden="true" />
              {data.closingTitle && (
                <h2>
                  <Grad text={data.closingTitle} />
                </h2>
              )}
              {lines(data.closingDesc).map((l, k) => (
                <p key={k} className="itx-text">
                  {l}
                </p>
              ))}
              {data.closingTagline && <p className="itx-kicker">{data.closingTagline}</p>}
              {data.closingCtas && data.closingCtas.length > 0 && (
                <div className="itx-actions itx-actions-center">
                  {data.closingCtas.map((c, i) => (
                    <Btn key={c.label} href={c.href} label={c.label} variant={i === 0 ? "dark" : "outline"} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <TechMotion seed={(data.crumb || "").length} />
      <Footer />
    </div>
  );
}

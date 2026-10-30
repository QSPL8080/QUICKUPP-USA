"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutMotion from "@/components/AboutMotion";
import AboutArt, { type ArtKind } from "@/components/AboutArt";
import "@/app/about-folio.css";
import { ABOUT_NAV, type AboutCta, type AboutPageData, type AboutSection, type AboutTitle } from "@/data/about/pages";

/*
 * About subpages — "abx-" folio design, used only here.
 * Content comes from data/about/pages.ts; the layout adds no copy of its own.
 */

function Arrow({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}

function Check({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Title({ t }: { t: AboutTitle }) {
  return t.accent ? (
    <>
      {t.text} <span className="qs-gradient-text">{t.accent}</span>
    </>
  ) : (
    <>{t.text}</>
  );
}

function Eyebrow({ text, light }: { text?: string; light?: boolean }) {
  if (!text) return null;
  return <p className={`abx-eyebrow${light ? " abx-eyebrow-light" : ""}`}>{text}</p>;
}

function Btn({ cta, variant = "dark" }: { cta?: AboutCta; variant?: "dark" | "outline" | "white" | "ghost" }) {
  if (!cta) return null;
  return (
    <Link href={cta.href} className={`abx-btn abx-btn-${variant}`}>
      <span>{cta.label}</span>
      {(variant === "dark" || variant === "white") && <Arrow />}
    </Link>
  );
}

function Quote({ text }: { text?: string }) {
  const id = useId().replace(/:/g, "");
  if (!text) return null;
  return (
    <blockquote className="abx-quote">
      <svg className="abx-quote-mark" viewBox="0 0 34 26" aria-hidden="true">
        <defs>
          <linearGradient id={`q${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00d2ff" />
            <stop offset="0.5" stopColor="#6366f1" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#q${id})`}
          d="M0 26V15.6C0 6.9 4.2 1.7 12.6 0l1.6 3.4C9.7 5 7.5 7.9 7.3 12h6.2v14H0zm19.8 0V15.6C19.8 6.9 24 1.7 32.4 0L34 3.4c-4.5 1.6-6.7 4.5-6.9 8.6h6.2v14H19.8z"
        />
      </svg>
      <p className="abx-quote-text">{text}</p>
    </blockquote>
  );
}

function Checks({ items, cols = 1 }: { items?: string[]; cols?: 1 | 2 }) {
  if (!items?.length) return null;
  return (
    <ul className={`abx-checks${cols === 2 ? " abx-checks-2" : ""}`}>
      {items.map((it, i) => (
        <li key={i}>
          <span className="abx-check" aria-hidden="true">
            <Check />
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function Diptych({ images }: { images: [string, string] }) {
  return (
    <div className="abx-diptych" aria-hidden="true">
      <div className="abx-diptych-a">
        <img src={images[0]} alt="" loading="lazy" />
      </div>
      <div className="abx-diptych-b">
        <img src={images[1]} alt="" loading="lazy" />
      </div>
    </div>
  );
}

/* ---- Sections --------------------------------------------------------------- */

function Statement({ s, backdrop }: { s: Extract<AboutSection, { kind: "statement" }>; backdrop?: string }) {
  const side = s.images ? "images" : s.aside ? "aside" : null;
  const body = (
    <div className="abx-statement-body">
      <Eyebrow text={s.eyebrow} />
      <h2>
        <Title t={s.title} />
      </h2>
      {s.paras.map((p, i) => (
        <p key={i} className={i === 0 && !side ? "abx-lead" : "abx-text"}>
          {p}
        </p>
      ))}
      <Checks items={s.list} />
      <Quote text={s.highlight} />
      {s.cta && (
        <div className="abx-actions">
          <Btn cta={s.cta} />
        </div>
      )}
    </div>
  );
  if (!side) {
    return (
      <section className={`abx-sec${bdClass(backdrop)}`} style={bdStyle(backdrop)}>
        <div className="abx-container abx-folio">{body}</div>
      </section>
    );
  }
  return (
    <section className={`abx-sec${bdClass(backdrop)}`} style={bdStyle(backdrop)}>
      <div className="abx-container abx-split">
        {body}
        {side === "images" && <Diptych images={s.images!} />}
        {side === "aside" && (
          <aside className="abx-aside">
            <p className="abx-aside-label">{s.aside!.label}</p>
            <ol className="abx-aside-list">
              {s.aside!.items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ol>
            {s.aside!.after && <p className="abx-aside-after">{s.aside!.after}</p>}
          </aside>
        )}
      </div>
    </section>
  );
}

function Panels({ s, backdrop, art }: { s: Extract<AboutSection, { kind: "panels" }>; backdrop?: string; art?: React.ReactNode }) {
  const [active, setActive] = useState(0);
  const hasHeadText = !!(s.paras?.length || s.highlight);
  return (
    <section className={`abx-sec abx-soft${bdClass(backdrop)}`} style={bdStyle(backdrop)}>
      {art}
      <div className="abx-container">
        <div className={`abx-head${hasHeadText ? " abx-head-split" : ""}`}>
          <div className="abx-head-main">
            <Eyebrow text={s.eyebrow} />
            <h2>
              <Title t={s.title} />
            </h2>
          </div>
          {hasHeadText && (
            <div className="abx-head-side">
              {s.paras?.map((p, i) => (
                <p key={i} className="abx-text">
                  {p}
                </p>
              ))}
              {s.highlight && <p className="abx-strong">{s.highlight}</p>}
            </div>
          )}
        </div>
        <div className="abx-panels">
          {s.panels.map((p, i) => (
            <article
              key={i}
              className={`abx-panel${active === i ? " is-active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              tabIndex={0}
            >
              <span className="abx-panel-glow" aria-hidden="true" />
              <p className="abx-panel-label">{p.label}</p>
              <div className="abx-panel-body">
                {p.title && <h3>{p.title}</h3>}
                <p className="abx-panel-text">{p.text}</p>
              </div>
            </article>
          ))}
        </div>
        {(s.note || s.cta) && (
          <div className="abx-panels-foot">
            {s.note && <p className="abx-note">{s.note}</p>}
            <Btn cta={s.cta} />
          </div>
        )}
      </div>
    </section>
  );
}

/* Soft photo backdrops for two sections per page (see .qs-backdrop in globals.css) */
const ABOUT_BACKDROPS = ["/images/contact-strategy-consultation.jpg", "/images/home-one-about-bg.jpg"];
const bdStyle = (img?: string) => (img ? ({ "--qs-backdrop": `url('${img}')` } as React.CSSProperties) : undefined);
const bdClass = (img?: string) => (img ? " qs-backdrop" : "");
/* Only plain sections qualify: the expanding panels, the pinned index viewer and the
   stats section have their own animation, so they never get a backdrop */
const BACKDROP_SCORE: Record<string, number> = { goals: 5, statement: 5, route: 3 };

function pickBackdrops(kinds: string[]): (string | undefined)[] {
  const ok = kinds.map((k, i) => (BACKDROP_SCORE[k] ? i : -1)).filter((i) => i >= 0);
  let best: number[] = ok.slice(0, 1);
  let bestScore = -1;
  // Prefer two qualifying sections that are not next to each other; fall back to neighbours
  for (const gap of [2, 1]) {
    for (const i of ok)
      for (const j of ok) {
        if (j - i < gap) continue;
        const score = BACKDROP_SCORE[kinds[i]] + BACKDROP_SCORE[kinds[j]];
        if (score > bestScore) {
          best = [i, j];
          bestScore = score;
        }
      }
    if (bestScore >= 0) break;
  }
  const out: (string | undefined)[] = kinds.map(() => undefined);
  best.forEach((idx, n) => (out[idx] = ABOUT_BACKDROPS[n]));
  return out;
}

function Goals({ s, backdrop }: { s: Extract<AboutSection, { kind: "goals" }>; backdrop?: string }) {
  return (
    <section className={`abx-sec${bdClass(backdrop)}`} style={bdStyle(backdrop)}>
      <div className="abx-container">
        <div className="abx-head abx-head-split">
          <div className="abx-head-main">
            <Eyebrow text={s.eyebrow} />
            <h2>
              <Title t={s.title} />
            </h2>
          </div>
          <div className="abx-head-side">
            {s.paras.map((p, i) => (
              <p key={i} className="abx-text">
                {p}
              </p>
            ))}
          </div>
        </div>
        {s.listIntro && <p className="abx-cue">{s.listIntro}</p>}
        <ul className="abx-tiles">
          {s.items.map((it, i) => (
            <li key={i}>
              <span className="abx-check" aria-hidden="true">
                <Check />
              </span>
              <span className="abx-tile-text">{it}</span>
            </li>
          ))}
        </ul>
        {s.after && <p className="abx-after">{s.after}</p>}
      </div>
    </section>
  );
}

function Route({ s, soft, backdrop, art }: { s: Extract<AboutSection, { kind: "route" }>; soft: boolean; backdrop?: string; art?: React.ReactNode }) {
  const plain = s.steps.every((st) => !st.text && !st.label);
  const hasQuote = s.steps.some((st) => !!st.quote);
  return (
    <section
      className={`abx-sec${soft ? " abx-soft" : ""}${bdClass(backdrop)}`}
      style={bdStyle(backdrop)}
    >
      {art}
      <div className="abx-container">
        <div className="abx-head abx-head-center">
          <Eyebrow text={s.eyebrow} />
          <h2>
            <Title t={s.title} />
          </h2>
          {s.intro && <p className="abx-text">{s.intro}</p>}
        </div>
        <ol className={`abx-steps${plain ? " abx-steps-plain" : ""}${hasQuote ? " has-quote" : ""}`}>
          {s.steps.map((st, i) => (
            <li key={i} className="abx-step">
              <div className="abx-step-head">
                {st.label && <p className="abx-step-label">{st.label}</p>}
                <h3>{st.title}</h3>
              </div>
              {st.text && <p className="abx-text abx-step-text">{st.text}</p>}
              {st.quote && <p className="abx-step-quote">{st.quote}</p>}
            </li>
          ))}
        </ol>
        {s.after && <p className="abx-after">{s.after}</p>}
        {s.cta && (
          <div className="abx-actions abx-actions-center">
            <Btn cta={s.cta} />
          </div>
        )}
      </div>
    </section>
  );
}

/* Scroll-driven: the block stays pinned while the page scrolls through it,
   and the selected point follows the scroll position */
const INDEX_STEP_VH = 26;

function IndexViewer({ s, backdrop, art }: { s: Extract<AboutSection, { kind: "index" }>; backdrop?: string; art?: React.ReactNode }) {
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const n = s.items.length;

  // Scroll range the pinned block travels through
  const range = () => {
    const wrap = wrapRef.current;
    const pin = pinRef.current;
    if (!wrap || !pin) return null;
    const top = wrap.getBoundingClientRect().top + window.scrollY;
    const travel = wrap.offsetHeight - pin.offsetHeight;
    return { top, travel };
  };

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      if (window.innerWidth <= 991) return;
      const r = range();
      if (!r || r.travel <= 0) return;
      const pinTop = parseFloat(getComputedStyle(pinRef.current!).top) || 0;
      const progress = (window.scrollY + pinTop - r.top) / r.travel;
      const idx = Math.min(n - 1, Math.max(0, Math.floor(progress * n)));
      setActive((prev) => (prev === idx ? prev : idx));
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [n]);

  // Clicking a point scrolls to its place in the range
  const go = (i: number) => {
    setActive(i);
    if (window.innerWidth <= 991) return;
    const r = range();
    if (!r) return;
    const pinTop = parseFloat(getComputedStyle(pinRef.current!).top) || 0;
    window.scrollTo({ top: r.top - pinTop + ((i + 0.5) / n) * r.travel, behavior: "smooth" });
  };

  return (
    <section className={`abx-sec abx-soft abx-index-sec${bdClass(backdrop)}`} style={bdStyle(backdrop)}>
      <div
        ref={wrapRef}
        className="abx-index-scroll"
        style={{ "--abx-index-len": `${n * INDEX_STEP_VH}vh` } as React.CSSProperties}
      >
        <div ref={pinRef} className="abx-index-pin">
          {art}
          <div className="abx-container">
            <div className="abx-head">
              <Eyebrow text={s.eyebrow} />
              <h2>
                <Title t={s.title} />
              </h2>
            </div>
            <div className="abx-index">
              <div className="abx-index-nav" role="tablist" aria-orientation="vertical">
                <span
                  className="abx-index-progress"
                  aria-hidden="true"
                  style={{ transform: `scaleX(${(active + 1) / n})` }}
                />
                {s.items.map((it, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={active === i}
                    className={`abx-index-tab${active === i ? " is-active" : ""}`}
                    onClick={() => go(i)}
                  >
                    <span className="abx-index-tab-text">{it.title}</span>
                    <span className="abx-index-tab-arrow" aria-hidden="true">
                      <Arrow size={15} />
                    </span>
                  </button>
                ))}
              </div>
              <div className="abx-index-stage">
                {s.items.map((it, i) => (
                  <article key={i} className={`abx-index-panel${active === i ? " is-active" : ""}`} role="tabpanel">
                    <h3 className="abx-index-title qs-t-lg">{it.title}</h3>
                    <p className="abx-text">{it.desc}</p>
                    <Checks items={it.list} cols={2} />
                    {it.sub && <p className="abx-index-sub">{it.sub}</p>}
                    {it.cta && (
                      <Link href={it.cta.href} className="abx-link">
                        <span>{it.cta.label}</span>
                        <Arrow size={15} />
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="abx-index-spacer" aria-hidden="true" />
      </div>
    </section>
  );
}

function Proof({ s, backdrop, art }: { s: Extract<AboutSection, { kind: "proof" }>; backdrop?: string; art?: React.ReactNode }) {
  return (
    <section className={`abx-sec${bdClass(backdrop)}`} style={bdStyle(backdrop)}>
      {art}
      <div className="abx-container">
        <div className="abx-split">
          <div className="abx-statement-body">
            <Eyebrow text={s.eyebrow} />
            <h2>
              <Title t={s.title} />
            </h2>
            {s.paras.map((p, i) => (
              <p key={i} className="abx-text">
                {p}
              </p>
            ))}
            <Quote text={s.note} />
          </div>
          {s.images && <Diptych images={s.images} />}
        </div>
        <dl className="abx-stats">
          {s.stats.map((st, i) => (
            <div key={i} className="abx-stat">
              <dt className="abx-stat-value">{st.value}</dt>
              <dd className="abx-stat-caption">{st.label}</dd>
            </div>
          ))}
        </dl>
        {s.cta && (
          <div className="abx-actions abx-actions-center">
            <Btn cta={s.cta} />
          </div>
        )}
      </div>
    </section>
  );
}

/* Edge graphics: one per page, each unique to its page, beside the single section
   it suits best (never a photo-backdrop section, never the hero) */
type ArtSpot = { kind: ArtKind; side: "left" | "right" };
const ART_SPOTS: Record<string, Partial<Record<number | "close", ArtSpot>>> = {
  "Who We Are": { 0: { kind: "layers", side: "right" } },
  "Our Approach": { 0: { kind: "route", side: "left" } },
  "Why Choose Us": { 0: { kind: "growth", side: "left" } },
  "Why Businesses Choose Us": { 0: { kind: "modules", side: "right" } },
};

/* ---- Page --------------------------------------------------------------------- */
export default function AboutPage({ data }: { data: AboutPageData }) {
  const pathname = usePathname();
  const isRoot = pathname === "/about";
  const { hero, closing } = data;
  /* panels and index sections sit on a soft background; a route section does too,
     unless the section before it is already soft */
  const softAt: boolean[] = [];
  data.sections.reduce((prevSoft, x, i) => {
    softAt[i] = x.kind === "panels" || x.kind === "index" || (x.kind === "route" && !prevSoft);
    return softAt[i];
  }, false);
  /* Two sections per page get the soft photo backdrop: the best-scoring pair that are
     not next to each other, so the photos never run into one another */
  const backdropFor = pickBackdrops(data.sections.map((x) => x.kind));
  const artSpots = ART_SPOTS[data.crumb] ?? {};

  return (
    <div className="abx-page">
      <Header />
      <main>
        <section className="abx-hero">
          <div className="abx-hero-bg" aria-hidden="true" />
          <div className="abx-container">
            <div className="abx-hero-top">
              <nav className="abx-crumbs" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span aria-hidden="true">/</span>
                {isRoot ? (
                  <span className="abx-crumb-now">About Us</span>
                ) : (
                  <>
                    <Link href="/about">About</Link>
                    <span aria-hidden="true">/</span>
                    <span className="abx-crumb-now">{data.crumb}</span>
                  </>
                )}
              </nav>
              <nav className="abx-subnav" aria-label="About">
                {ABOUT_NAV.map((n) => {
                  const on = pathname === n.href || (isRoot && n.href === "/about/who-we-are");
                  return (
                    <Link key={n.href} href={n.href} className={`abx-subnav-link${on ? " is-on" : ""}`} aria-current={on ? "page" : undefined}>
                      {n.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <Eyebrow text={hero.eyebrow} />
            <h1 className="abx-hero-title">
              <Title t={hero.title} />
            </h1>

            <div className="abx-hero-cols">
              <div className="abx-hero-left">
                <p className="abx-lead">{hero.lead}</p>
                {hero.cta && (
                  <div className="abx-actions">
                    <Btn cta={hero.cta} />
                  </div>
                )}
              </div>
              <div className="abx-hero-right">
                {hero.paras?.map((p, i) => (
                  <p key={i} className="abx-text">
                    {p}
                  </p>
                ))}
                <Quote text={hero.highlight} />
              </div>
            </div>

            <div className="abx-slats" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="abx-slat" style={{ backgroundImage: `url('${hero.image}')`, "--abx-s": i } as React.CSSProperties} />
              ))}
            </div>
          </div>
        </section>

        {data.sections.map((s, i) => {
          const backdrop = backdropFor[i];
          const soft = softAt[i];
          const spot = backdrop ? undefined : artSpots[i];
          const art = spot ? <AboutArt kind={spot.kind} side={spot.side} /> : undefined;
          if (s.kind === "statement") return <Statement key={i} s={s} backdrop={backdrop} />;
          if (s.kind === "panels") return <Panels key={i} s={s} backdrop={backdrop} art={art} />;
          if (s.kind === "goals") return <Goals key={i} s={s} backdrop={backdrop} />;
          if (s.kind === "index") return <IndexViewer key={i} s={s} backdrop={backdrop} art={art} />;
          if (s.kind === "proof") return <Proof key={i} s={s} backdrop={backdrop} art={art} />;
          if (s.kind === "route") return <Route key={i} s={s} soft={soft} backdrop={backdrop} art={art} />;
          return null;
        })}

        <section className="abx-close-sec">
          {artSpots.close && <AboutArt kind={artSpots.close.kind} side={artSpots.close.side} />}
          <div className="abx-container">
            <div className={`abx-close${closing.lines?.length ? "" : " abx-close-solo"}`}>
              <span className="abx-close-grid" aria-hidden="true" />
              <div className="abx-close-main">
                <Eyebrow text={closing.eyebrow} light />
                <h2>
                  <Title t={closing.title} />
                </h2>
                {closing.paras.map((p, i) => (
                  <p key={i} className="abx-close-text">
                    {p}
                  </p>
                ))}
                <div className="abx-actions">
                  {closing.ctas.map((c, i) => (
                    <Btn key={i} cta={c} variant={i === 0 ? "white" : "ghost"} />
                  ))}
                </div>
              </div>
              {closing.lines?.length ? (
                <ul className="abx-close-lines">
                  {closing.lines.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </section>
      </main>
      <AboutMotion seed={(data.crumb || "").length % 6} />
      <Footer />
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/app/youtube-promotion-page.css";
import type { YouTubePromotionContent } from "@/data/services/youtube-video-promotion";

/*
 * YouTube Video Promotion page.
 * Own design: video-player hero, chapter-style process, placement previews,
 * comparison table and a request form. Site fonts, heading gradient and
 * buttons. Every word comes from data/services/youtube-video-promotion.ts.
 */

const FORM_EMAIL = "hello@quickuppsoftech.com";

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

/** YouTube icon — same mark the site footer uses, in its brand red */
export function YouTubeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 3.5 24 17" aria-hidden="true">
      <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#ffffff" />
      <path
        fill="#ff0000"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      />
    </svg>
  );
}

function Svg({ children, size = 22, stroke = 1.9 }: { children: React.ReactNode; size?: number; stroke?: number }) {
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

const CheckIcon = ({ size = 14 }: { size?: number }) => (
  <Svg size={size} stroke={2.6}>
    <path d="M20 6L9 17l-5-5" />
  </Svg>
);

const reachIcons = [
  <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.2a5 5 0 0 1 5.5 4.8" /></>,
  <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  <><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" /></>,
];

const whyIcons = [
  <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 14h3M8 17h6" /></>,
  <><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  <><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>,
  <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="2.5" y="14" width="4.5" height="6" rx="1.5" /><rect x="17" y="14" width="4.5" height="6" rx="1.5" /></>,
];

const audienceIcons = [
  <><rect x="2.5" y="5" width="19" height="14" rx="4" /><path d="M10 9.5v5l4.5-2.5z" /></>,
  <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></>,
  <><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M10 21v-4h4v4" /></>,
  <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" /></>,
  <><path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.4 7.2 17.9l.9-5.4L4.2 8.7l5.4-.8z" /></>,
  <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
];

/* Small decorative previews for each YouTube placement (no text) */
function PlacementPreview({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="ytp-prev ytp-prev-instream" aria-hidden="true">
        <div className="ytp-prev-screen">
          <YouTubeIcon size={30} />
          <span className="ytp-prev-adbar" />
        </div>
        <span className="ytp-prev-progress"><span /></span>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="ytp-prev ytp-prev-feed" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`ytp-feed-row${i === 0 ? " is-ad" : ""}`}>
            <span className="ytp-feed-thumb" />
            <span className="ytp-feed-lines">
              <span />
              <span />
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="ytp-prev ytp-prev-shorts" aria-hidden="true">
        <div className="ytp-phone">
          <span className="ytp-phone-side">
            <span />
            <span />
            <span />
          </span>
          <span className="ytp-phone-caption" />
        </div>
      </div>
    );
  }
  return (
    <div className="ytp-prev ytp-prev-search" aria-hidden="true">
      <div className="ytp-search-bar">
        <Svg size={14} stroke={2.2}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </Svg>
        <span />
      </div>
      <div className="ytp-feed-row is-ad">
        <span className="ytp-feed-thumb" />
        <span className="ytp-feed-lines">
          <span />
          <span />
        </span>
      </div>
    </div>
  );
}

function Button({ href, label, variant = "dark" }: { href: string; label: string; variant?: "dark" | "outline" | "white" | "ghost" }) {
  const isHash = href.startsWith("#");
  const cls = `ytp-btn ytp-btn-${variant}`;
  const inner = (
    <>
      <span>{label}</span>
      {(variant === "dark" || variant === "white") && <ArrowIcon />}
    </>
  );
  return isHash ? (
    <a href={href} className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

export default function YouTubePromotionPage({ content }: { content: YouTubePromotionContent }) {
  const c = content;
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [values, setValues] = useState<string[]>(() => c.form.fields.map(() => ""));

  const fieldTypes: Record<string, string> = {
    Email: "email",
    "Phone / WhatsApp": "tel",
    "YouTube Video or Channel URL": "url",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = c.form.fields.map((f, i) => `${f}: ${values[i] || "-"}`).join("\n");
    const subject = `${c.form.cardTitle} — ${values[0] || ""}`.trim();
    window.location.href = `mailto:${FORM_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="ytp-page">
      <Header />

      <main>
        {/* 1. Hero */}
        <section className="ytp-hero">
          <div className="ytp-container">
            <nav className="ytp-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <span>Services</span>
              <span>/</span>
              <span className="ytp-breadcrumb-current">{c.crumb}</span>
            </nav>

            <div className="ytp-hero-grid">
              <div className="ytp-hero-copy">
                <p className="ytp-eyebrow">
                  <YouTubeIcon size={20} />
                  <span>{c.hero.eyebrow}</span>
                </p>
                <h1 className="ytp-h1">
                  <GradientHeading text={c.hero.title} />
                </h1>
                <p className="ytp-lead">{c.hero.lead}</p>
                <p className="ytp-text">{c.hero.text}</p>
                <div className="ytp-actions">
                  {c.hero.ctas.map((cta, i) => (
                    <Button key={cta.label} href={cta.href} label={cta.label} variant={i === 0 ? "dark" : "outline"} />
                  ))}
                </div>
                <ul className="ytp-highlights">
                  {c.hero.highlights.map((h) => (
                    <li key={h}>
                      <span className="ytp-check">
                        <CheckIcon size={12} />
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ytp-player" aria-hidden="true">
                <div className="ytp-player-screen">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/project-02.jpg" alt="" />
                  <span className="ytp-player-play">
                    <YouTubeIcon size={78} />
                  </span>
                </div>
                <div className="ytp-player-bar">
                  <span className="ytp-player-progress">
                    <span />
                  </span>
                  <span className="ytp-player-controls">
                    <Svg size={16} stroke={2.2}>
                      <path d="M7 5v14l11-7z" />
                    </Svg>
                    <Svg size={16} stroke={2}>
                      <path d="M11 5L6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7" />
                    </Svg>
                    <span className="ytp-player-spacer" />
                    <Svg size={16} stroke={2}>
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </Svg>
                    <Svg size={16} stroke={2}>
                      <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
                    </Svg>
                  </span>
                </div>
                <div className="ytp-player-up">
                  {[0, 1].map((i) => (
                    <div key={i} className="ytp-feed-row">
                      <span className="ytp-feed-thumb" />
                      <span className="ytp-feed-lines">
                        <span />
                        <span />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Reach beyond subscribers */}
        <section className="ytp-section">
          <div className="ytp-container ytp-reach">
            <div className="ytp-reach-copy">
              <h2 className="ytp-h2">
                <GradientHeading text={c.reach.title} />
              </h2>
              {c.reach.paragraphs.map((p, i) => (
                <p key={i} className={i === 0 ? "ytp-lead" : "ytp-text"}>
                  {p}
                </p>
              ))}
              <div className="ytp-actions">
                <Button href={c.reach.cta.href} label={c.reach.cta.label} />
              </div>
            </div>
            <ul className="ytp-reach-list">
              {c.reach.points.map((p, i) => (
                <li key={p}>
                  <span className="ytp-icon-tile">
                    <Svg size={20}>{reachIcons[i % reachIcons.length]}</Svg>
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3. Process as video chapters */}
        <section className="ytp-section ytp-soft">
          <div className="ytp-container">
            <div className="ytp-head">
              <h2 className="ytp-h2">
                <GradientHeading text={c.process.title} />
              </h2>
              <p className="ytp-tagline">{c.process.subtitle}</p>
            </div>
            <ol className="ytp-chapters" style={{ "--ytp-steps": c.process.steps.length } as React.CSSProperties}>
              {c.process.steps.map((s) => (
                <li key={s.num}>
                  <span className="ytp-chapter-bar" aria-hidden="true" />
                  <span className="ytp-chapter-num">{s.num}.</span>
                  <h3 className="ytp-h3">{s.title}</h3>
                  <p className="ytp-text">{s.desc}</p>
                </li>
              ))}
            </ol>
            <div className="ytp-actions ytp-center">
              <Button href={c.process.cta.href} label={c.process.cta.label} />
            </div>
          </div>
        </section>

        {/* 4. Placements */}
        <section className="ytp-section">
          <div className="ytp-container">
            <div className="ytp-head">
              <h2 className="ytp-h2">
                <GradientHeading text={c.placements.title} />
              </h2>
              <p className="ytp-tagline">{c.placements.subtitle}</p>
            </div>
            <ul className="ytp-placements">
              {c.placements.items.map((it, i) => (
                <li key={it.title} className="ytp-placement">
                  <PlacementPreview index={i} />
                  <h3 className="ytp-h3">{it.title}</h3>
                  <p className="ytp-text">{it.desc}</p>
                </li>
              ))}
            </ul>
            <p className="ytp-note">{c.placements.note}</p>
          </div>
        </section>

        {/* 5. Why choose */}
        <section className="ytp-section ytp-soft">
          <div className="ytp-container">
            <div className="ytp-head">
              <h2 className="ytp-h2">
                <GradientHeading text={c.why.title} />
              </h2>
              <p className="ytp-tagline">{c.why.subtitle}</p>
            </div>
            <ul className="ytp-why">
              {c.why.items.map((it, i) => (
                <li key={it.title}>
                  <span className="ytp-icon-tile">
                    <Svg size={20}>{whyIcons[i % whyIcons.length]}</Svg>
                  </span>
                  <h3 className="ytp-h3">{it.title}</h3>
                  <p className="ytp-text">{it.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 6. Who can benefit */}
        <section className="ytp-section">
          <div className="ytp-container">
            <div className="ytp-head">
              <h2 className="ytp-h2">
                <GradientHeading text={c.audience.title} />
              </h2>
            </div>
            <ul className="ytp-audience">
              {c.audience.items.map((it, i) => (
                <li key={it.title}>
                  <span className="ytp-avatar">
                    <Svg size={22}>{audienceIcons[i % audienceIcons.length]}</Svg>
                  </span>
                  <div>
                    <h3 className="ytp-h3">{it.title}</h3>
                    <p className="ytp-text">{it.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 7. What you get */}
        <section className="ytp-section ytp-soft">
          <div className="ytp-container">
            <div className="ytp-deliver">
              <h2 className="ytp-h2">
                <GradientHeading text={c.deliverables.title} />
              </h2>
              <ul className="ytp-deliver-list">
                {c.deliverables.items.map((it) => (
                  <li key={it}>
                    <span className="ytp-check">
                      <CheckIcon />
                    </span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
              <p className="ytp-note ytp-note-left">{c.deliverables.note}</p>
            </div>
          </div>
        </section>

        {/* 8. Comparison */}
        <section className="ytp-section">
          <div className="ytp-container">
            <div className="ytp-head">
              <h2 className="ytp-h2">
                <GradientHeading text={c.comparison.title} />
              </h2>
              <p className="ytp-text">{c.comparison.intro}</p>
            </div>
            <div className="ytp-compare" role="table">
              <div className="ytp-compare-row ytp-compare-headrow" role="row">
                <div role="columnheader">{c.comparison.columns[0]}</div>
                <div role="columnheader" className="is-paid">
                  <YouTubeIcon size={20} />
                  {c.comparison.columns[1]}
                </div>
              </div>
              {c.comparison.rows.map((r, i) => (
                <div key={i} className="ytp-compare-row" role="row">
                  <div role="cell">{r[0]}</div>
                  <div role="cell" className="is-paid">
                    {r[1]}
                  </div>
                </div>
              ))}
            </div>
            <p className="ytp-statement">{c.comparison.closing}</p>
          </div>
        </section>

        {/* 9. Ready */}
        <section className="ytp-ready">
          <div className="ytp-container ytp-ready-inner">
            <h2 className="ytp-h2">
              <GradientHeading text={c.ready.title} />
            </h2>
            {c.ready.lines.map((l, i) => (
              <p key={i} className={i === 0 ? "ytp-ready-lead" : "ytp-ready-text"}>
                {l}
              </p>
            ))}
            <div className="ytp-actions ytp-center">
              {c.ready.ctas.map((cta, i) => (
                <Button key={cta.label} href={cta.href} label={cta.label} variant={i === 0 ? "white" : "ghost"} />
              ))}
            </div>
          </div>
        </section>

        {/* 10. FAQ */}
        <section className="ytp-section">
          <div className="ytp-container ytp-faq-wrap">
            <div className="ytp-head">
              <h2 className="ytp-h2">
                <GradientHeading text={c.faq.title} />
              </h2>
            </div>
            <div className="ytp-faq">
              {c.faq.items.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q} className={`ytp-faq-item${open ? " is-open" : ""}`}>
                    <button
                      type="button"
                      className="ytp-faq-q"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : i)}
                    >
                      <span className="ytp-faq-text">{f.q}</span>
                      <span className="ytp-faq-sign" aria-hidden="true" />
                    </button>
                    {open && <p className="ytp-faq-a">{f.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 11. Request form */}
        <section id="promotion-plan" className="ytp-section ytp-soft ytp-form-section">
          <div className="ytp-container ytp-form-grid">
            <div className="ytp-form-copy">
              <h2 className="ytp-h2">
                <GradientHeading text={c.form.title} />
              </h2>
              <p className="ytp-text">{c.form.intro}</p>
            </div>
            <form className="ytp-form" onSubmit={handleSubmit}>
              <h3 className="ytp-form-title">
                <YouTubeIcon size={26} />
                <span>{c.form.cardTitle}</span>
              </h3>
              <div className="ytp-fields">
                {c.form.fields.map((f, i) => {
                  const id = `ytp-field-${i}`;
                  return (
                    <label key={f} htmlFor={id} className={`ytp-field${i === c.form.fields.length - 1 && c.form.fields.length % 2 === 1 ? " is-wide" : ""}`}>
                      <span>{f}</span>
                      <input
                        id={id}
                        type={fieldTypes[f] || "text"}
                        required={i <= 1 || i === 3}
                        value={values[i]}
                        onChange={(e) => {
                          const next = [...values];
                          next[i] = e.target.value;
                          setValues(next);
                        }}
                      />
                    </label>
                  );
                })}
              </div>
              <button type="submit" className="ytp-btn ytp-btn-dark ytp-submit">
                <span>{c.form.submit}</span>
                <ArrowIcon />
              </button>
              <p className="ytp-form-note">{c.form.note}</p>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

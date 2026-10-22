"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/app/youtube-promotion-page.css";
import type { YouTubePromotionContent } from "@/data/services/youtube-video-promotion";
import LucideIcon, { type LucideIconName } from "@/components/LucideIcon";

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

const ArrowIcon = () => <LucideIcon name="arrow-right" size={16} strokeWidth={2.2} />;

const CheckIcon = ({ size = 14 }: { size?: number }) => <LucideIcon name="check" size={size} strokeWidth={2.8} />;

const reachIcons: LucideIconName[] = ["target", "users", "eye", "chart-column", "sliders-horizontal"];
const whyIcons: LucideIconName[] = ["target", "briefcase", "shield-check", "trending-up", "file-text", "headset"];
const audienceIcons: LucideIconName[] = ["video", "music", "building-2", "mic", "sparkles", "map-pin"];

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
        <LucideIcon name="search" size={14} strokeWidth={2.2} />
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
                    <LucideIcon name="play" size={16} strokeWidth={2.2} />
                    <LucideIcon name="volume-2" size={16} />
                    <span className="ytp-player-spacer" />
                    <LucideIcon name="settings" size={16} />
                    <LucideIcon name="maximize" size={16} />
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
                    <LucideIcon name={reachIcons[i % reachIcons.length]} size={20} />
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
                    <LucideIcon name={whyIcons[i % whyIcons.length]} size={20} />
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
                    <LucideIcon name={audienceIcons[i % audienceIcons.length]} size={22} />
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

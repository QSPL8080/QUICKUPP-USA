"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/app/youtube-promotion-page.css";
import type { YouTubePromotionContent } from "@/data/services/youtube-video-promotion";
import LucideIcon, { type LucideIconName } from "@/components/LucideIcon";
import { setupScrollMotion, type MotionPreset } from "@/lib/scrollMotion";

/*
 * YouTube Video Promotion page — "video studio" design, used only here:
 * cinematic reel hero with a highlight bar, an "Up next" queue, a
 * timeline editor whose playhead follows the scroll, a placements bento,
 * channel-style audience cards, a playlist panel, a split-screen comparison
 * and a pulsing play CTA. Site fonts, sizes, heading gradient and buttons.
 * Every word comes from data/services/youtube-video-promotion.ts.
 */

const FORM_EMAIL = "hello@quickuppsoftech.com";

/* Scroll-in motion for this page only (different from every other page) */
const YT_PRESET: MotionPreset = {
  prefix: "yv",
  heroTitle: "sweep-lg",
  hero: "blink",
  heading: "sweep",
  text: "soft",
  media: "play",
  splitFirst: "reel-l",
  splitMiddle: "soft",
  splitLast: "reel-r",
  items: ["tv", "deal", "pulse", "stack"],
  stagger: 0.07,
  heroStep: 0.09,
  skip: ".ytv-reel, .ytv-perks, .ytv-editor-track",
};

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
function YouTubeIcon({ size = 24 }: { size?: number }) {
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
const CheckIcon = ({ size = 14 }: { size?: number }) => <LucideIcon name="check" size={size} strokeWidth={3} />;

const reachIcons: LucideIconName[] = ["target", "users", "eye", "chart-column", "sliders-horizontal"];
const queueFill = [68, 42, 84, 30, 56];
const whyIcons: LucideIconName[] = ["target", "briefcase", "shield-check", "trending-up", "file-text", "headset"];
const audienceIcons: LucideIconName[] = ["video", "music", "building-2", "mic", "sparkles", "map-pin"];

const REEL = [
  { src: "/images/slider-01-01.jpg", pos: "far-l" },
  { src: "/images/home-two-about.jpg", pos: "near-l" },
  { src: "/images/project-05.jpg", pos: "center" },
  { src: "/images/blog-img-03.jpg", pos: "near-r" },
  { src: "/images/slider-01-02.jpg", pos: "far-r" },
];

function Button({ href, label, variant = "dark" }: { href: string; label: string; variant?: "dark" | "outline" }) {
  const cls = `ytv-btn ytv-btn-${variant}`;
  const inner = (
    <>
      <span>{label}</span>
      {variant === "dark" && <ArrowIcon />}
    </>
  );
  return href.startsWith("#") ? (
    <a href={href} className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

/* Decorative previews for each placement (no text) */
function PlacementPreview({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="ytv-pv ytv-pv-instream" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/service-img-05.jpg" alt="" loading="lazy" />
        <span className="ytv-pv-skip">
          <LucideIcon name="play" size={12} strokeWidth={2.4} />
          <span />
        </span>
        <span className="ytv-pv-adbar">
          <span />
        </span>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="ytv-pv ytv-pv-feed" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`ytv-pv-row${i === 0 ? " is-ad" : ""}`}>
            <span className="ytv-pv-thumb" />
            <span className="ytv-pv-lines">
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
      <div className="ytv-pv ytv-pv-shorts" aria-hidden="true">
        <div className="ytv-phone">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/service-img-03.jpg" alt="" loading="lazy" />
          <span className="ytv-phone-side">
            <LucideIcon name="star" size={15} />
            <LucideIcon name="message-circle" size={15} />
            <LucideIcon name="arrow-up-right" size={15} />
          </span>
          <span className="ytv-phone-cap">
            <span />
            <span />
          </span>
          <span className="ytv-phone-bar">
            <span />
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="ytv-pv ytv-pv-search" aria-hidden="true">
      <div className="ytv-pv-search-bar">
        <LucideIcon name="search" size={14} strokeWidth={2.4} />
        <span />
      </div>
      {[0, 1].map((i) => (
        <div key={i} className={`ytv-pv-row${i === 0 ? " is-ad" : ""}`}>
          <span className="ytv-pv-thumb" />
          <span className="ytv-pv-lines">
            <span />
            <span />
          </span>
        </div>
      ))}
    </div>
  );
}

export default function YouTubePromotionPage({ content }: { content: YouTubePromotionContent }) {
  const c = content;
  const rootRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [values, setValues] = useState<string[]>(() => c.form.fields.map(() => ""));

  /* Scroll-in motion + "switch on when visible" details */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cleanupMotion = setupScrollMotion(root, YT_PRESET, 0);
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-on");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.25 }
    );
    root.querySelectorAll("[data-yv-on]").forEach((el) => io.observe(el));
    return () => {
      cleanupMotion();
      io.disconnect();
    };
  }, []);

  /* Timeline playhead follows the scroll through the process section */
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const n = c.process.steps.length;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = editor.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.82;
      const end = vh * 0.3 - r.height * 0.5;
      const p = Math.min(1, Math.max(0, (start - r.top) / (start - end)));
      editor.style.setProperty("--yv-p", p.toFixed(4));
      setActiveStep(Math.min(n - 1, Math.floor(p * n)));
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
  }, [c.process.steps.length]);

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
    <div className="ytv-page" ref={rootRef}>
      <Header />

      <main>
        {/* 1. Hero — headline, highlight bar and a cinematic reel */}
        <section className="ytv-hero">
          <div className="ytv-hero-bg" aria-hidden="true" />
          <div className="ytv-container">
            <nav className="ytv-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <span>Services</span>
              <span>/</span>
              <span className="ytv-breadcrumb-current">{c.crumb}</span>
            </nav>

            <div className="ytv-hero-head">
              <p className="ytv-pill">
                <YouTubeIcon size={20} />
                <span>{c.hero.eyebrow}</span>
              </p>
              <h1 className="ytv-h1">
                <GradientHeading text={c.hero.title} />
              </h1>
              <p className="ytv-lead">{c.hero.lead}</p>
              <p className="ytv-text ytv-hero-text">{c.hero.text}</p>
              <div className="ytv-actions">
                {c.hero.ctas.map((cta, i) => (
                  <Button key={cta.label} href={cta.href} label={cta.label} variant={i === 0 ? "dark" : "outline"} />
                ))}
              </div>
            </div>

            <ul className="ytv-perks">
              {c.hero.highlights.map((h, i) => (
                <li key={h} style={{ "--i": i } as React.CSSProperties}>
                  <span className="ytv-perk-icon">
                    <CheckIcon size={12} />
                  </span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <div className="ytv-reel" aria-hidden="true">
              {REEL.map((r, i) => (
                <div key={r.src} className={`ytv-reel-card is-${r.pos}`} style={{ "--i": i } as React.CSSProperties}>
                  <div className="ytv-reel-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.src} alt="" />
                    {r.pos === "center" ? (
                      <>
                        <span className="ytv-reel-play">
                          <YouTubeIcon size={76} />
                        </span>
                        <span className="ytv-reel-controls">
                          <span className="ytv-reel-progress">
                            <span />
                          </span>
                          <span className="ytv-reel-icons">
                            <LucideIcon name="play" size={15} strokeWidth={2.4} />
                            <LucideIcon name="volume-2" size={15} />
                            <span className="ytv-reel-spacer" />
                            <LucideIcon name="settings" size={15} />
                            <LucideIcon name="maximize" size={15} />
                          </span>
                        </span>
                      </>
                    ) : (
                      <span className="ytv-reel-mini">
                        <LucideIcon name="play" size={14} strokeWidth={2.6} />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Reach — copy + "Up next" queue */}
        <section className="ytv-section">
          <div className="ytv-container ytv-reach">
            <div className="ytv-reach-copy">
              <h2 className="ytv-h2">
                <GradientHeading text={c.reach.title} />
              </h2>
              {c.reach.paragraphs.map((p, i) => (
                <p key={i} className={i === 0 ? "ytv-lead" : "ytv-text"}>
                  {p}
                </p>
              ))}
              <div className="ytv-actions ytv-actions-left">
                <Button href={c.reach.cta.href} label={c.reach.cta.label} />
              </div>
            </div>

            <div className="ytv-queue" data-yv-on="">
              <div className="ytv-queue-top" aria-hidden="true">
                <span />
                <span />
                <span />
                <span className="ytv-queue-line" />
              </div>
              <ol className="ytv-queue-list">
                {c.reach.points.map((p, i) => (
                  <li key={p} className={i === 0 ? "is-playing" : undefined}>
                    <span
                      className="ytv-qthumb"
                      style={{ "--w": `${queueFill[i % queueFill.length]}%`, "--i": i } as React.CSSProperties}
                      aria-hidden="true"
                    >
                      <LucideIcon name={reachIcons[i % reachIcons.length]} size={22} />
                      {i === 0 && (
                        <span className="ytv-eq">
                          <i />
                          <i />
                          <i />
                        </span>
                      )}
                      <span className="ytv-qthumb-bar">
                        <span />
                      </span>
                    </span>
                    <span className="ytv-qtext">{p}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* 3. Process — timeline editor with a scroll-driven playhead */}
        <section className="ytv-section ytv-soft">
          <div className="ytv-container">
            <div className="ytv-head">
              <h2 className="ytv-h2">
                <GradientHeading text={c.process.title} />
              </h2>
              <p className="ytv-tagline">{c.process.subtitle}</p>
            </div>

            <div className="ytv-editor" ref={editorRef} style={{ "--n": c.process.steps.length } as React.CSSProperties}>
              <div className="ytv-editor-track" aria-hidden="true">
                <div className="ytv-ruler">
                  {Array.from({ length: 49 }).map((_, i) => (
                    <span key={i} className={i % 4 === 0 ? "is-major" : undefined} />
                  ))}
                </div>
                <div className="ytv-clips">
                  {c.process.steps.map((s, i) => (
                    <span
                      key={s.num}
                      className={`ytv-clip${i === activeStep ? " is-active" : ""}${i < activeStep ? " is-done" : ""}`}
                      style={{ "--i": i } as React.CSSProperties}
                    />
                  ))}
                </div>
                <span className="ytv-playhead" />
              </div>

              <ol className="ytv-steps">
                {c.process.steps.map((s, i) => (
                  <li key={s.num} data-state={i === activeStep ? "active" : i < activeStep ? "done" : "next"}>
                    <span className="ytv-step-num">{s.num}.</span>
                    <h3 className="ytv-h3">{s.title}</h3>
                    <p className="ytv-text">{s.desc}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="ytv-actions">
              <Button href={c.process.cta.href} label={c.process.cta.label} />
            </div>
          </div>
        </section>

        {/* 4. Placements — bento */}
        <section className="ytv-section">
          <div className="ytv-container">
            <div className="ytv-head">
              <h2 className="ytv-h2">
                <GradientHeading text={c.placements.title} />
              </h2>
              <p className="ytv-tagline">{c.placements.subtitle}</p>
            </div>
            <ul className="ytv-bento">
              {c.placements.items.map((it, i) => (
                <li key={it.title} className={`ytv-tile ytv-tile-${i}`}>
                  <PlacementPreview index={i} />
                  <div className="ytv-tile-body">
                    <h3 className="ytv-h3">{it.title}</h3>
                    <p className="ytv-text">{it.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="ytv-note">{c.placements.note}</p>
          </div>
        </section>

        {/* 5. Why choose — cards with a progress line */}
        <section className="ytv-section ytv-soft">
          <div className="ytv-container">
            <div className="ytv-head">
              <h2 className="ytv-h2">
                <GradientHeading text={c.why.title} />
              </h2>
              <p className="ytv-tagline">{c.why.subtitle}</p>
            </div>
            <ul className="ytv-why" data-yv-on="">
              {c.why.items.map((it, i) => (
                <li key={it.title} style={{ "--i": i } as React.CSSProperties}>
                  <span className="ytv-why-bar" aria-hidden="true">
                    <span />
                  </span>
                  <span className="ytv-why-icon">
                    <LucideIcon name={whyIcons[i % whyIcons.length]} size={22} />
                  </span>
                  <h3 className="ytv-h3">{it.title}</h3>
                  <p className="ytv-text">{it.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 6. Who can benefit — channel cards */}
        <section className="ytv-section">
          <div className="ytv-container">
            <div className="ytv-head">
              <h2 className="ytv-h2">
                <GradientHeading text={c.audience.title} />
              </h2>
            </div>
            <ul className="ytv-channels">
              {c.audience.items.map((it, i) => (
                <li key={it.title}>
                  <span className="ytv-avatar" aria-hidden="true">
                    <span className="ytv-avatar-ring" />
                    <span className="ytv-avatar-core">
                      <LucideIcon name={audienceIcons[i % audienceIcons.length]} size={26} />
                    </span>
                  </span>
                  <h3 className="ytv-h3">{it.title}</h3>
                  <p className="ytv-text">{it.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 7. What you get — playlist panel */}
        <section className="ytv-section ytv-pl-sec">
          <div className="ytv-container">
            <div className="ytv-playlist">
              <div className="ytv-playlist-head">
                <span className="ytv-playlist-mark" aria-hidden="true">
                  <YouTubeIcon size={34} />
                </span>
                <h2 className="ytv-h2">
                  <GradientHeading text={c.deliverables.title} />
                </h2>
                <p className="ytv-playlist-note">{c.deliverables.note}</p>
              </div>
              <ol className="ytv-playlist-list">
                {c.deliverables.items.map((it) => (
                  <li key={it}>
                    <span className="ytv-pl-check">
                      <CheckIcon size={13} />
                    </span>
                    <span className="ytv-pl-text">{it}</span>
                    <span className="ytv-pl-eq" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* 8. Comparison — split screen */}
        <section className="ytv-section ytv-soft">
          <div className="ytv-container">
            <div className="ytv-head">
              <h2 className="ytv-h2">
                <GradientHeading text={c.comparison.title} />
              </h2>
              <p className="ytv-text ytv-head-text">{c.comparison.intro}</p>
            </div>
            <div className="ytv-versus" role="table">
              <div className="ytv-vs-row ytv-vs-headrow" role="row">
                <div role="columnheader" className="ytv-vs-cell is-organic">
                  <span className="ytv-vs-icon">
                    <LucideIcon name="trending-up" size={18} />
                  </span>
                  {c.comparison.columns[0]}
                </div>
                <div role="columnheader" className="ytv-vs-cell is-paid">
                  <YouTubeIcon size={22} />
                  {c.comparison.columns[1]}
                </div>
              </div>
              {c.comparison.rows.map((r, i) => (
                <div key={i} className="ytv-vs-row" role="row">
                  <div role="cell" className="ytv-vs-cell is-organic">
                    {r[0]}
                  </div>
                  <div role="cell" className="ytv-vs-cell is-paid">
                    {r[1]}
                  </div>
                </div>
              ))}
            </div>
            <p className="ytv-statement">{c.comparison.closing}</p>
          </div>
        </section>

        {/* 9. Ready — pulsing play CTA */}
        <section className="ytv-section">
          <div className="ytv-container">
            <div className="ytv-ready">
              <span className="ytv-ready-play" aria-hidden="true">
                <span className="ytv-ripple" />
                <span className="ytv-ripple" />
                <span className="ytv-ripple" />
                <YouTubeIcon size={64} />
              </span>
              <h2 className="ytv-h2">
                <GradientHeading text={c.ready.title} />
              </h2>
              {c.ready.lines.map((l, i) => (
                <p key={i} className={i === 0 ? "ytv-lead" : "ytv-text"}>
                  {l}
                </p>
              ))}
              <div className="ytv-actions">
                {c.ready.ctas.map((cta, i) => (
                  <Button key={cta.label} href={cta.href} label={cta.label} variant={i === 0 ? "dark" : "outline"} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 10. FAQ */}
        <section className="ytv-section ytv-soft">
          <div className="ytv-container ytv-faq-solo">
            <div className="ytv-faq">
              {c.faq.items.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q} className={`ytv-faq-item${open ? " is-open" : ""}`}>
                    <button type="button" className="ytv-faq-q" aria-expanded={open} onClick={() => setOpenFaq(open ? null : i)}>
                      <span>{f.q}</span>
                      <span className="ytv-faq-sign" aria-hidden="true" />
                    </button>
                    <div className="ytv-faq-a" aria-hidden={!open}>
                      <div>
                        <p className="ytv-text">{f.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 11. Request form */}
        <section id="promotion-plan" className="ytv-section ytv-form-sec">
          <div className="ytv-container ytv-form-grid">
            <div className="ytv-form-copy">
              <h2 className="ytv-h2">
                <GradientHeading text={c.form.title} />
              </h2>
              <p className="ytv-text">{c.form.intro}</p>
            </div>
            <form className="ytv-form" onSubmit={handleSubmit}>
              <div className="ytv-form-top">
                <YouTubeIcon size={30} />
                <h3 className="ytv-h3">{c.form.cardTitle}</h3>
              </div>
              <div className="ytv-fields">
                {c.form.fields.map((f, i) => {
                  const id = `ytv-field-${i}`;
                  const wide = i === c.form.fields.length - 1 && c.form.fields.length % 2 === 1;
                  return (
                    <label key={f} htmlFor={id} className={`ytv-field${wide ? " is-wide" : ""}`}>
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
              <button type="submit" className="ytv-btn ytv-btn-dark ytv-submit">
                <span>{c.form.submit}</span>
                <ArrowIcon />
              </button>
              <p className="ytv-form-note">{c.form.note}</p>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import HomeIcon, { type HomeIconName } from "@/components/home/HomeIcon";
import HomeMotion from "@/components/home/HomeMotion";
import ServiceExplorer from "@/components/home/ServiceExplorer";
import HomeHero from "@/components/home/HomeHero";
import TechStack from "@/components/home/TechStack";
import BookingSection from "@/components/BookingSection";
import { ABOUT, FINAL, HERO, INDUSTRIES, INSIGHTS, PROCESS, SERVICES, TECH, TRUST, VOICES, WHY, WORK } from "@/data/home-content";
import "@/app/home.css";

/*
 * Home page ("hx-" design, used on no other page). Every word comes from the
 * supplied home page document; pictures are the site's own photos and the
 * client logos. Site fonts, type scale, heading gradient and black/white buttons.
 */

type Cta = { label: string; href: string; external?: boolean };

function Button({ cta, tone = "dark", className = "" }: { cta: Cta; tone?: "dark" | "light" | "ghost" | "white"; className?: string }) {
  const cls = `hx-cta hx-cta-${tone}${className ? ` ${className}` : ""}`;
  const inner = (
    <>
      <span className="hx-cta-label">{cta.label}</span>
      <span className="hx-cta-arrow" aria-hidden="true">
        <HomeIcon name={cta.external ? "arrow-up-right" : "arrow-right"} size={16} strokeWidth={2.2} />
      </span>
    </>
  );
  if (cta.external)
    return (
      <a href={cta.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  return (
    <Link href={cta.href} className={cls}>
      {inner}
    </Link>
  );
}

/* a two-line section title; the second line carries the site gradient */
function Title({ lines, as: Tag = "h2", className = "" }: { lines: string[]; as?: "h1" | "h2"; className?: string }) {
  return (
    <Tag className={`hx-title ${className}`}>
      {lines.map((l, i) => (
        <span key={l} className="hx-line" data-hx="line" style={{ "--d": `${i * 0.12}s` } as CSSProperties}>
          <span className={i === lines.length - 1 ? "hx-line-in qs-gradient-text" : "hx-line-in"}>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

// the insights paragraph: first sentence as the body, the rest as the quoted note
const [INSIGHTS_LEAD, ...INSIGHTS_REST] = INSIGHTS.text.split(/(?<=\.)\s+/);
const INSIGHTS_NOTE = INSIGHTS_REST.join(" ");

// client faces for the testimonials strip (24 cards around the curve)
const FACES = ["testimonial-img-01", "team-img-01", "testimonial-img-02", "team-img-02", "testimonial-img-03", "team-img-03", "testimonial-img-04", "team-img-04", "testimonial-01", "team-img-05", "testimonial-03", "team-img-06"];
const CURVE_FACES = [...FACES, ...FACES];

function Logos() {
  const nums = ["01", "02", "03", "04", "05", "06"];
  const row = (k: string) => (
    <div className="hx-logos-row" aria-hidden={k === "b" ? true : undefined} key={k}>
      {nums.map((n) => (
        <img key={`${k}${n}`} src={`/images/client-logo-${n}.svg`} alt={k === "a" ? "Client logo" : ""} loading="lazy" />
      ))}
    </div>
  );
  return <div className="hx-logos">{[row("a"), row("b")]}</div>;
}

function Section({ id, className, children }: { id?: string; className: string; children: ReactNode }) {
  return (
    <section id={id} className={`hx-section ${className}`}>
      {children}
    </section>
  );
}

export default function HomeView() {
  return (
    <main className="hx-page">
      <HomeMotion />

      {/* 1. Hero: the growth dial */}
      <HomeHero
        hero={HERO}
        actions={
          <>
            <Button cta={HERO.primary} tone="white" />
            <Button cta={HERO.secondary} tone="ghost" />
          </>
        }
      />

      {/* 2. Trust strip: a full-width dark band with the count and the promise,
          then two crossing tapes: the four services one way, client logos the other */}
      <section className="hx-trust">
        <div className="hx-trust-band">
          <span className="hx-trust-lines" aria-hidden="true" />
          <span className="hx-trust-glow" aria-hidden="true" />
          <div className="hx-wrap hx-trust-row">
            <h2 className="hx-trust-title" data-hx="rise">
              <span className="hx-trust-num">
                <span data-hx-count={TRUST.count}>{TRUST.count.toLocaleString("en-US")}</span>
                {TRUST.countSuffix}
              </span>
              <span className="hx-trust-rest">{TRUST.titleRest}</span>
            </h2>
            <span className="hx-trust-bar" aria-hidden="true">
              <span />
            </span>
            <h3 className="hx-trust-sub" data-hx="rise" style={d(0.15)}>
              {TRUST.subtitle}
            </h3>
          </div>
        </div>

        <div className="hx-tapes">
          <div className="hx-tape hx-tape-svc">
            <div className="hx-tape-track">
              {[0, 1].map((k) => (
                <ul key={k} className="hx-tape-row" aria-hidden={k === 1 ? true : undefined}>
                  {[...TRUST.services, ...TRUST.services, ...TRUST.services].map((sv, i) => (
                    <li key={`${k}-${i}`} aria-hidden={k === 0 && i >= TRUST.services.length ? true : undefined}>
                      <span>{sv}</span>
                      <svg className="hx-tape-star" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0z" />
                      </svg>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
          <div className="hx-tape hx-tape-logos">
            <Logos />
          </div>
        </div>
      </section>

      {/* 3. About: laid out like the About pages' opening (title, ruled two
          columns, one wide photo cut into four slats that rise in turn) */}
      {/* 3. About: Laid out with animated content presentation and unique 4-slat parallax shutter entrance */}
      <Section className="hx-about">
        <span className="hx-about-bg" aria-hidden="true" />
        <div className="hx-wrap">
          <div className="hx-about-header" data-hx="rise" style={d(0.04)}>
            <div className="hx-about-badge">
              <span className="hx-badge-dot" aria-hidden="true" />
              <span>WHO WE ARE &bull; OUR INTEGRATED APPROACH</span>
            </div>
            <Title lines={ABOUT.title} className="hx-about-title" />
          </div>

          <div className="hx-about-cols" data-hx="rule">
            <div className="hx-about-col hx-about-left" data-hx="rise" style={d(0.12)}>
              <p className="hx-lead">
                {ABOUT.text[0]}
              </p>
              <div className="hx-about-actions">
                <Button cta={ABOUT.cta} />
              </div>
            </div>
            <div className="hx-about-col hx-about-right" data-hx="rise" style={d(0.22)}>
              <p className="hx-body">
                {ABOUT.text[1]}
              </p>
            </div>
          </div>

          {/* 4 Slats of the original image with unique shutter & alternating depth transition */}
          <div className="hx-about-slats" data-hx="slats" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="hx-about-slat" style={{ "--s": i } as CSSProperties}>
                <span className="hx-slat-shine" aria-hidden="true" />
              </span>
            ))}
            <span className="hx-about-slats-beam" aria-hidden="true" />
          </div>
        </div>
      </Section>

      {/* 4. Services */}
      <Section id="services" className="hx-svc">
        <div className="hx-wrap">
          <div className="hx-head hx-head-split">
            <Title lines={SERVICES.title} />
            <p className="hx-body" data-hx="rise" style={d(0.15)}>
              {SERVICES.text}
            </p>
          </div>
          <div data-hx="rise" style={d(0.1)}>
            <ServiceExplorer items={SERVICES.items} />
          </div>
        </div>
      </Section>

      {/* 5. Why choose: a bento of the five reasons, every one fully readable */}
      <Section className="hx-why">
        <div className="hx-why-glow" aria-hidden="true" />
        <div className="hx-wrap">
          <div className="hx-wb">
            <div className="hx-wb-intro">
              <Title lines={WHY.title} />
              <p className="hx-body" data-hx="rise" style={d(0.15)}>
                {WHY.text}
              </p>
              <div data-hx="rise" style={d(0.25)}>
                <Button cta={WHY.cta} tone="light" />
              </div>
            </div>

            {(() => {
              const [lead, ...rest] = WHY.points;
              return (
                <>
                  <article className="hx-wb-card hx-wb-lead" data-hx="lift" style={d(0.1)}>
                    <span className="hx-wb-rings" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                    <span className="hx-wb-icon hx-wb-icon-lg" aria-hidden="true">
                      <HomeIcon name={lead.icon as HomeIconName} size={26} />
                    </span>
                    <h3 className="hx-wb-title">{lead.title}</h3>
                    <p className="hx-wb-text">{lead.text}</p>
                  </article>

                  <ol className="hx-wb-row">
                    <span className="hx-wb-wire" aria-hidden="true">
                      <span />
                    </span>
                    {rest.map((pt, i) => (
                      <li key={pt.title} className="hx-wb-card hx-wb-item" data-hx="lift" style={d(0.15 + i * 0.08)}>
                        <span className="hx-wb-mark" aria-hidden="true">
                          <HomeIcon name={pt.icon as HomeIconName} size={120} strokeWidth={1.1} />
                        </span>
                        <span className="hx-wb-icon" aria-hidden="true">
                          <HomeIcon name={pt.icon as HomeIconName} size={20} />
                        </span>
                        <h3 className="hx-wb-title">{pt.title}</h3>
                        <p className="hx-wb-text">{pt.text}</p>
                      </li>
                    ))}
                  </ol>
                </>
              );
            })()}
          </div>
        </div>
      </Section>

      {/* 6. Portfolio & Case Studies */}
      <Section className="hx-work">
        <div className="hx-wrap hx-work-grid">
          <div className="hx-work-copy">
            <Title lines={WORK.title} />
            {WORK.text.map((t, i) => (
              <p key={i} className={i === 0 ? "hx-lead" : "hx-body"} data-hx="rise" style={d(0.15 + i * 0.1)}>
                {t}
              </p>
            ))}
            <div className="hx-actions" data-hx="rise" style={d(0.35)}>
              <Button cta={WORK.primary} />
              <Button cta={WORK.secondary} tone="light" />
            </div>
          </div>
          <div className="hx-work-reel" aria-hidden="true">
            {[
              ["/images/project-01.jpg", "/images/project-03.jpg", "/images/project-05.jpg", "/images/counter-style-three-img-02.jpg"],
              ["/images/project-02.jpg", "/images/project-04.jpg", "/images/counter-style-three-img-01.jpg", "/images/slider-01-02.jpg"],
            ].map((col, c) => (
              <div key={c} className={`hx-reel-col hx-reel-${c ? "down" : "up"}`}>
                <div className="hx-reel-track">
                  {[...col, ...col].map((src, i) => (
                    <figure key={i} className="hx-reel-shot">
                      <img src={src} alt="" loading="lazy" />
                    </figure>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 7. Client Testimonials: the message, then a curved strip of client
          faces that turns slowly around the viewer like a wraparound screen */}
      <Section className="hx-voices hx-curve">
        <div className="hx-wrap">
          <div className="hx-curve-head">
            <Title lines={VOICES.title} className="hx-center" />
            <p className="hx-body hx-center" data-hx="rise" style={d(0.15)}>
              {VOICES.text}
            </p>
            <div className="hx-center" data-hx="rise" style={d(0.25)}>
              <Button cta={VOICES.cta} />
            </div>
          </div>
        </div>
        <div className="hx-curve-stage" aria-hidden="true" data-hx="rise" style={d(0.2)}>
          <div className="hx-curve-view">
            <div className="hx-curve-ring">
              {CURVE_FACES.map((f, i) => (
                <span key={`${f}-${i}`} className="hx-curve-card" style={{ "--i": i } as CSSProperties}>
                  <img src={`/images/${f}.jpg`} alt="" loading="lazy" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 8. Our Process: five steps rising like a staircase, Improve at the top */}
      <Section className="hx-stair">
        <div className="hx-wrap">
          <div className="hx-stair-head">
            <Title lines={PROCESS.title} />
            <div data-hx="rise" style={d(0.15)}>
              <Button cta={PROCESS.cta} />
            </div>
          </div>
          <ol className="hx-stair-steps" data-hx-track="">
            {PROCESS.steps.map((s, i) => (
              <li key={s.num} className={`hx-stair-step${i === PROCESS.steps.length - 1 ? " is-top" : ""}`} style={{ "--i": i } as CSSProperties}>
                <div className="hx-stair-block">
                  <div className="hx-stair-body">
                    <div className="hx-stair-top">
                      <span className="hx-stair-icon" aria-hidden="true">
                        <HomeIcon name={s.icon as HomeIconName} size={18} />
                      </span>
                      <span className="hx-stair-num">{s.num}.</span>
                    </div>
                    <h3 className="hx-stair-title">{s.title}</h3>
                    <p className="hx-stair-text">{s.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* 9. Industries: one framed panel of modules over a faded photo, the same look as the AI automation service pages */}
      <Section className="hx-ind qs-backdrop">
        <div className="hx-wrap">
          <div className="hx-head hx-ind-head">
            <p className="hx-eyebrow hx-eyebrow-solo" data-hx="fade">
              <span className="hx-eyebrow-word">{INDUSTRIES.eyebrow}</span>
            </p>
            <Title lines={INDUSTRIES.title} />
            <p className="hx-body hx-narrow" data-hx="rise" style={d(0.15)}>
              {INDUSTRIES.text}
            </p>
          </div>
          <ul className="hx-ind-grid">
            {INDUSTRIES.items.map((it, i) => (
              <li key={it.name} className="hx-ind-card" data-hx="card" style={d((i % 3) * 0.08)}>
                <span className="hx-ind-icon" aria-hidden="true">
                  <HomeIcon name={it.icon as HomeIconName} size={20} />
                </span>
                <h3 className="hx-ind-name">{it.name}</h3>
                <p className="hx-ind-text">{it.text}</p>
              </li>
            ))}
            <li className="hx-ind-cta" data-hx="card" style={d(0.16)}>
              <Button cta={INDUSTRIES.cta} tone="light" />
            </li>
          </ul>
        </div>
      </Section>

      {/* 10. Technology & Capabilities: a dark stage with a radar sweeping
          behind it (the Contact page hero look), the groups as rows */}
      <section className="hx-radar">
        <div className="hx-radar-stage">
          <div className="hx-radar-scope" aria-hidden="true">
            <span className="hx-radar-ring" />
            <span className="hx-radar-ring" />
            <span className="hx-radar-ring" />
            <span className="hx-radar-sweep" />
            <i className="hx-radar-blip" />
            <i className="hx-radar-blip" />
            <i className="hx-radar-blip" />
            <i className="hx-radar-blip" />
          </div>
          <div className="hx-radar-grid" aria-hidden="true" />
          <div className="hx-wrap hx-radar-inner">
            <Title lines={TECH.title} />
            <div className="hx-radar-cols">
              <div className="hx-radar-lead">
                <p className="hx-radar-text" data-hx="rise" style={d(0.15)}>
                  {TECH.text}
                </p>
                <div data-hx="rise" style={d(0.25)}>
                  <Button cta={TECH.cta} tone="white" />
                </div>
              </div>
              <TechStack rows={TECH.rows} />
            </div>
          </div>
        </div>
      </section>

      {/* 11. Blog & Insights: words on the left, an offset pair of photos on
          the right (the About pages' layout); the photos drift apart as you scroll */}
      <Section className="hx-insights hx-duo">
        <div className="hx-wrap">
          <div className="hx-duo-grid">
            <div className="hx-duo-copy">
              <Title lines={INSIGHTS.title} />
              <p className="hx-body" data-hx="rise" style={d(0.15)}>
                {INSIGHTS_LEAD}
              </p>
              <blockquote className="hx-duo-quote" data-hx="rise" style={d(0.25)}>
                <svg className="hx-duo-quote-mark" viewBox="0 0 34 26" aria-hidden="true">
                  <defs>
                    <linearGradient id="hx-duo-q" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#00d2ff" />
                      <stop offset="0.5" stopColor="#6366f1" />
                      <stop offset="1" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#hx-duo-q)"
                    d="M0 26V15.6C0 6.9 4.2 1.7 12.6 0l1.6 3.4C9.7 5 7.5 7.9 7.3 12h6.2v14H0zm19.8 0V15.6C19.8 6.9 24 1.7 32.4 0L34 3.4c-4.5 1.6-6.7 4.5-6.9 8.6h6.2v14H19.8z"
                  />
                </svg>
                <p>{INSIGHTS_NOTE}</p>
              </blockquote>
            </div>
            <div className="hx-duo-pics" aria-hidden="true" data-hx="unveil" data-hx-track="">
              <div className="hx-duo-pic hx-duo-pic-a">
                <img src="/images/blog-img-02.jpg" alt="" loading="lazy" />
              </div>
              <div className="hx-duo-pic hx-duo-pic-b">
                <img src="/images/blog-img-04.jpg" alt="" loading="lazy" />
              </div>
            </div>
          </div>
          <div className="hx-duo-foot" data-hx="rise" style={d(0.1)}>
            <Button cta={INSIGHTS.cta} />
          </div>
        </div>
      </Section>

      {/* Book a call (live Calendly) */}
      <BookingSection
        eyebrow={HERO.primary.label}
        title={["Schedule Your Discovery Call", "with Our Team"]}
        text={["Choose a convenient date and time, and let\u2019s talk about your goals and how we can help your business grow."]}
        tone="soft"
      />

      {/* 12. Contact & Final CTA: the dark grid card used to close the About
          pages, with a slow light sweeping across the grid */}
      <section className="hx-close">
        <div className="hx-wrap">
          <div className="hx-close-card" data-hx="lift">
            <span className="hx-close-grid" aria-hidden="true" />
            <span className="hx-close-sweep" aria-hidden="true" />
            <div className="hx-close-main">
              <Title lines={FINAL.title} />
              <p className="hx-body" data-hx="rise" style={d(0.15)}>
                {FINAL.text}
              </p>
              <div className="hx-actions" data-hx="rise" style={d(0.25)}>
                <Button cta={FINAL.primary} tone="white" />
                <Button cta={FINAL.secondary} tone="ghost" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

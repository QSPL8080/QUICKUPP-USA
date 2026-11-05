import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import HomeIcon, { type HomeIconName } from "@/components/home/HomeIcon";
import HomeMotion from "@/components/home/HomeMotion";
import ServiceExplorer from "@/components/home/ServiceExplorer";
import HomeHero from "@/components/home/HomeHero";
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
      {/* 3. About: Laid out with animated pedestal narrative and 4 unique interactive showcase pillars */}
      <Section className="hx-about">
        <span className="hx-about-bg" aria-hidden="true" />
        <div className="hx-wrap">
          <div className="hx-about-header">
            <div className="hx-about-badge" data-hx="rise" style={d(0.04)}>
              <span className="hx-badge-dot" aria-hidden="true" />
              <span>WHO WE ARE &bull; OUR INTEGRATED APPROACH</span>
            </div>
            <Title lines={ABOUT.title} className="hx-about-title" />
          </div>

          <div className="hx-about-cols" data-hx="rule">
            <div className="hx-about-card hx-about-card-left" data-hx="rise" style={d(0.12)}>
              <div className="hx-card-pill">
                <span className="hx-card-pill-num">01</span>
                <span>PURPOSE &amp; VISION</span>
              </div>
              <p className="hx-lead">
                {ABOUT.text[0]}
              </p>
              <div className="hx-about-chips">
                <span className="hx-about-chip">
                  <HomeIcon name="bot" size={14} className="hx-chip-icon" /> Connected AI &amp; Growth Systems
                </span>
                <span className="hx-about-chip">
                  <HomeIcon name="code-xml" size={14} className="hx-chip-icon" /> Purpose-Built Custom Tech
                </span>
              </div>
              <div className="hx-about-actions">
                <Button cta={ABOUT.cta} />
              </div>
            </div>

            <div className="hx-about-card hx-about-card-right" data-hx="rise" style={d(0.22)}>
              <div className="hx-card-pill">
                <span className="hx-card-pill-num">02</span>
                <span>EXECUTION ROADMAP</span>
              </div>
              <p className="hx-body">
                {ABOUT.text[1]}
              </p>
              <div className="hx-about-chips">
                <span className="hx-about-chip">
                  <HomeIcon name="sparkles" size={14} className="hx-chip-icon" /> Strategy to Rapid Deployment
                </span>
                <span className="hx-about-chip">
                  <HomeIcon name="check" size={14} className="hx-chip-icon" /> Measurable Enterprise ROI
                </span>
              </div>
              <div className="hx-about-stat-strip">
                <div className="hx-about-stat">
                  <span className="hx-stat-num">100%</span>
                  <span className="hx-stat-desc">Execution-First Delivery</span>
                </div>
                <div className="hx-about-stat-sep" aria-hidden="true" />
                <div className="hx-about-stat">
                  <span className="hx-stat-num">Full-Stack</span>
                  <span className="hx-stat-desc">Marketing &amp; AI Integration</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Unique Visual Pillars with Interactive Accordion & Scroll Unfold */}
          <div className="hx-about-gallery" data-hx="gallery">
            {[
              {
                num: "01",
                tag: "Strategy",
                title: "Executive Roadmapping",
                desc: "Goal discovery & growth architecture",
                img: "/images/contact-boardroom.jpg",
              },
              {
                num: "02",
                tag: "Engineering",
                title: "Custom Web & Systems",
                desc: "High-performance scalable platforms",
                img: "/images/contact-tech-discussion.jpg",
              },
              {
                num: "03",
                tag: "AI Systems",
                title: "Intelligent Automations",
                desc: "Autonomous agents & smart workflows",
                img: "/images/contact-consultancy-meeting.jpg",
              },
              {
                num: "04",
                tag: "Enterprise ROI",
                title: "Performance & Scaling",
                desc: "Revenue expansion & client success",
                img: "/images/contact-client-deal.jpg",
              },
            ].map((card, i) => (
              <div
                key={card.num}
                className="hx-about-photo-card"
                data-hx="about-item"
                style={{ "--i": i, "--d": `${0.1 + i * 0.1}s` } as CSSProperties}
              >
                <div className="hx-photo-media">
                  <img
                    src={card.img}
                    alt={card.title}
                    loading="lazy"
                    className="hx-photo-img"
                  />
                  <div className="hx-photo-scrim" aria-hidden="true" />
                  <div className="hx-photo-glow" aria-hidden="true" />
                </div>
                
                <div className="hx-photo-top">
                  <span className="hx-photo-chip">
                    <span className="hx-photo-num">{card.num}</span>
                    <span className="hx-photo-tag">{card.tag}</span>
                  </span>
                  <span className="hx-photo-action-btn" aria-hidden="true">
                    <HomeIcon name="arrow-up-right" size={15} strokeWidth={2.4} />
                  </span>
                </div>

                <div className="hx-photo-body">
                  <h3 className="hx-photo-title">{card.title}</h3>
                  <p className="hx-photo-desc">{card.desc}</p>
                </div>
              </div>
            ))}
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

      {/* 5. Why choose */}
      <Section className="hx-why">
        <div className="hx-why-glow" aria-hidden="true" />
        <div className="hx-wrap hx-why-grid">
          <div className="hx-why-intro">
            <Title lines={WHY.title} />
            <p className="hx-body" data-hx="rise" style={d(0.15)}>
              {WHY.text}
            </p>
            <div data-hx="rise" style={d(0.25)}>
              <Button cta={WHY.cta} tone="light" />
            </div>
          </div>
          <ol className="hx-why-list" data-hx-track="">
            <span className="hx-why-rail" aria-hidden="true">
              <span className="hx-why-rail-fill" />
            </span>
            {WHY.points.map((p, i) => (
              <li key={p.title} className="hx-why-item" data-hx="slide" style={d(i * 0.05)}>
                <span className="hx-why-icon" aria-hidden="true">
                  <HomeIcon name={p.icon as HomeIconName} size={20} />
                </span>
                <div>
                  <h3 className="hx-why-title">{p.title}</h3>
                  <p className="hx-why-text">{p.text}</p>
                </div>
              </li>
            ))}
          </ol>
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

      {/* 7. Client Testimonials */}
      <Section className="hx-voices">
        <div className="hx-wrap">
          <div className="hx-voices-card" data-hx="lift">
            <div className="hx-voices-faces" aria-hidden="true">
              {["testimonial-img-01", "testimonial-img-02", "testimonial-img-03", "testimonial-img-04", "testimonial-03", "team-img-04"].map((f, i) => (
                <span key={f} className={`hx-face hx-face-${i + 1}`}>
                  <img src={`/images/${f}.jpg`} alt="" loading="lazy" />
                </span>
              ))}
            </div>
            <span className="hx-voices-mark" aria-hidden="true">
              <HomeIcon name="quote" size={30} strokeWidth={1.6} />
            </span>
            <Title lines={VOICES.title} className="hx-center" />
            <p className="hx-body hx-center hx-narrow" data-hx="rise" style={d(0.15)}>
              {VOICES.text}
            </p>
            <div className="hx-center" data-hx="rise" style={d(0.25)}>
              <Button cta={VOICES.cta} />
            </div>
          </div>
        </div>
      </Section>

      {/* 8. Our Process */}
      <Section className="hx-flow">
        <div className="hx-wrap">
          <div className="hx-head hx-head-split">
            <Title lines={PROCESS.title} />
            <div data-hx="rise" style={d(0.15)}>
              <Button cta={PROCESS.cta} />
            </div>
          </div>
          <ol className="hx-flow-steps" data-hx-track="">
            <span className="hx-flow-line" aria-hidden="true">
              <span className="hx-flow-line-fill" />
            </span>
            {PROCESS.steps.map((s, i) => (
              <li key={s.num} className="hx-flow-step" data-hx="rise" style={d(i * 0.1)}>
                <span className="hx-flow-node" aria-hidden="true">
                  <HomeIcon name={s.icon as HomeIconName} size={20} />
                </span>
                <span className="hx-flow-num">{s.num}.</span>
                <h3 className="hx-flow-title">{s.title}</h3>
                <p className="hx-flow-text">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* 9. Industries */}
      <Section className="hx-ind">
        <div className="hx-wrap">
          <div className="hx-head hx-head-center">
            <p className="hx-eyebrow hx-eyebrow-solo" data-hx="fade">
              <span className="hx-eyebrow-word">{INDUSTRIES.eyebrow}</span>
            </p>
            <Title lines={INDUSTRIES.title} className="hx-center" />
            <p className="hx-body hx-center hx-narrow" data-hx="rise" style={d(0.15)}>
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

      {/* 10. Technology & Capabilities */}
      <Section className="hx-tech">
        <div className="hx-wrap hx-tech-grid">
          <div className="hx-tech-copy">
            <Title lines={TECH.title} />
            <p className="hx-body" data-hx="rise" style={d(0.15)}>
              {TECH.text}
            </p>
            <div data-hx="rise" style={d(0.25)}>
              <Button cta={TECH.cta} />
            </div>
          </div>
          <div className="hx-tech-panel" data-hx="lift">
            <div className="hx-tech-bar" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <dl className="hx-tech-rows">
              {TECH.rows.map((r, i) => (
                <div key={r.label} className="hx-tech-row" data-hx="type" style={d(0.1 + i * 0.1)}>
                  <dt>
                    <HomeIcon name={r.icon as HomeIconName} size={16} />
                    <span>{r.label}</span>
                  </dt>
                  <dd>
                    {r.items.map((t, j) => (
                      <span key={t} className="hx-tech-pill" style={d(0.2 + i * 0.1 + j * 0.06)}>
                        {t}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* 11. Blog & Insights */}
      <Section className="hx-insights">
        <div className="hx-wrap hx-insights-grid">
          <div className="hx-insights-stack" aria-hidden="true">
            {["/images/blog-img-02.jpg", "/images/blog-img-04.jpg", "/images/blog-img-01.jpg"].map((src, i) => (
              <figure key={src} className={`hx-page-card hx-page-card-${i + 1}`} data-hx="fan" style={d(i * 0.12)}>
                <img src={src} alt="" loading="lazy" />
                <span className="hx-page-lines">
                  <i />
                  <i />
                  <i />
                </span>
              </figure>
            ))}
          </div>
          <div className="hx-insights-copy">
            <Title lines={INSIGHTS.title} />
            <p className="hx-body" data-hx="rise" style={d(0.15)}>
              {INSIGHTS.text}
            </p>
            <div data-hx="rise" style={d(0.25)}>
              <Button cta={INSIGHTS.cta} />
            </div>
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

      {/* 12. Contact & Final CTA */}
      <section className="hx-final">
        <div className="hx-wrap">
          <div className="hx-final-card" data-hx="lift">
            <span className="hx-final-sun" aria-hidden="true" />
            <span className="hx-final-floor" aria-hidden="true" />
            <Title lines={FINAL.title} className="hx-center" />
            <p className="hx-body hx-center hx-narrow" data-hx="rise" style={d(0.15)}>
              {FINAL.text}
            </p>
            <div className="hx-actions hx-actions-center" data-hx="rise" style={d(0.25)}>
              <Button cta={FINAL.primary} tone="light" />
              <Button cta={FINAL.secondary} tone="ghost" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

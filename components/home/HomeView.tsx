import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import HomeIcon, { type HomeIconName } from "@/components/home/HomeIcon";
import HomeMotion from "@/components/home/HomeMotion";
import ServiceExplorer from "@/components/home/ServiceExplorer";
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

      {/* 1. Hero: Dark Stage (inspired by Contact page) + Layered Realistic Photo Composite */}
      <section className="hx-hero">
        <div className="hx-stage">
          {/* Ambient Radar & Grid (Contact Page Style) */}
          <div className="hx-radar" aria-hidden="true">
            <span className="hx-radar-ring" />
            <span className="hx-radar-ring" />
            <span className="hx-radar-ring" />
            <span className="hx-radar-sweep" />
            <i className="hx-blip hx-blip-1" />
            <i className="hx-blip hx-blip-2" />
            <i className="hx-blip hx-blip-3" />
            <i className="hx-blip hx-blip-4" />
          </div>
          <div className="hx-stage-grid" aria-hidden="true" />

          <div className="hx-wrap hx-stage-inner">
            <div className="hx-hero-grid">
              {/* Left Column: Value Proposition */}
              <div className="hx-hero-copy">
                {/* Live Status Badge */}
                <div className="hx-live-badge" data-hx="fade">
                  <span className="hx-live-dot" aria-hidden="true" />
                  <span className="hx-live-text">Your Trusted AI &amp; Digital Growth Partner</span>
                </div>

                {/* Eyebrow Track */}
                <p className="hx-hero-eyebrow" data-hx="fade">
                  {HERO.eyebrow.map((w, i) => (
                    <span key={w} className="hx-eyebrow-word" style={d(0.1 + i * 0.12)}>
                      {w}
                    </span>
                  ))}
                </p>

                {/* Main Headline */}
                <h1 className="hx-hero-title">
                  {HERO.title.map((l, i) => (
                    <span key={l} className="hx-line" data-hx="line" style={d(0.15 + i * 0.14)}>
                      <span className={i === HERO.title.length - 1 ? "hx-line-in qs-gradient-text" : "hx-line-in"}>{l}</span>
                    </span>
                  ))}
                </h1>

                <p className="hx-hero-text" data-hx="rise" style={d(0.55)}>
                  {HERO.text}
                </p>

                {/* High Contrast Actions */}
                <div className="hx-actions" data-hx="rise" style={d(0.7)}>
                  <Button cta={HERO.primary} tone="white" />
                  <Button cta={HERO.secondary} tone="ghost" />
                </div>

                {/* Trust Points */}
                <ul className="hx-support" data-hx="rise" style={d(0.85)}>
                  {HERO.supporting.map((s) => (
                    <li key={s}>
                      <HomeIcon name="check" size={14} strokeWidth={2.6} />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column: Layered Realistic Photo Composite */}
              <div className="hx-hero-art" data-hx="zoom" style={d(0.3)}>
                <div className="hx-hero-composite">
                  {/* Primary Realistic Team Photo */}
                  <div className="hx-photo-card hx-photo-main">
                    <img
                      src="/images/contact-team-collaboration.jpg"
                      alt="Quickupp Softech strategy & execution team"
                      loading="eager"
                    />
                    <div className="hx-photo-overlay" />
                    <div className="hx-photo-caption">
                      <span className="hx-photo-tag">Strategy &amp; Innovation</span>
                      <span className="hx-photo-title">Building Scalable Digital Futures</span>
                    </div>
                  </div>

                  {/* Secondary Overlapping Realistic Photo */}
                  <div className="hx-photo-card hx-photo-secondary">
                    <img
                      src="/images/contact-boardroom.jpg"
                      alt="Executive strategic planning meeting"
                      loading="lazy"
                    />
                    <div className="hx-photo-overlay" />
                  </div>

                  {/* Floating Glass Stat Badge 1: Lead Velocity */}
                  <div className="hx-stat-chip hx-stat-roi" data-hx="lift">
                    <div className="hx-stat-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                        <polyline points="16 7 22 7 22 13" />
                      </svg>
                    </div>
                    <div className="hx-stat-info">
                      <span className="hx-stat-val">+340%</span>
                      <span className="hx-stat-lbl">Lead Velocity Growth</span>
                    </div>
                  </div>

                  {/* Floating Glass Stat Badge 2: Client Retention + Avatars */}
                  <div className="hx-stat-chip hx-stat-retention" data-hx="lift">
                    <div className="hx-avatar-stack">
                      <img src="/images/team-img-01.jpg" alt="Client partner 1" />
                      <img src="/images/team-img-02.jpg" alt="Client partner 2" />
                      <img src="/images/team-img-03.jpg" alt="Client partner 3" />
                    </div>
                    <div className="hx-stat-info">
                      <div className="hx-stat-rating">
                        <span className="hx-stat-val">98%</span>
                        <span className="hx-stars" aria-label="5 stars">★★★★★</span>
                      </div>
                      <span className="hx-stat-lbl">Client Retention Rate</span>
                    </div>
                  </div>

                  {/* Floating Glass Stat Badge 3: Active Deployments */}
                  <div className="hx-stat-chip hx-stat-tech" data-hx="lift">
                    <span className="hx-stat-pulse-dot" aria-hidden="true" />
                    <div className="hx-stat-info">
                      <span className="hx-stat-val">250+</span>
                      <span className="hx-stat-lbl">Systems Deployed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlapping Capabilities Dock (Contact Page Dock style for Home Verticals) */}
        <div className="hx-wrap">
          <aside className="hx-dock" aria-label="Core Capabilities">
            <div className="hx-dock-intro">
              <span className="hx-dock-tag">ENTERPRISE SOLUTIONS</span>
              <h2 className="hx-dock-title">Strategic Execution Across 4 Core Verticals</h2>
              <p className="hx-dock-text">
                Explore our specialized departments working in synergy to acquire customers, automate operations, and scale technology.
              </p>
            </div>
            <div className="hx-dock-grid">
              <Link href="/services/ai-powered-digital-marketing-services" className="hx-dock-card">
                <div className="hx-dock-card-top">
                  <span className="hx-dock-card-icon"><HomeIcon name="megaphone" size={20} /></span>
                  <span className="hx-dock-card-arrow" aria-hidden="true">→</span>
                </div>
                <h3 className="hx-dock-card-title">AI Digital Marketing</h3>
                <p className="hx-dock-card-sub">SEO, Google/Meta Ads &amp; Lead Generation</p>
              </Link>
              <Link href="/services/ai-automation-solutions" className="hx-dock-card">
                <div className="hx-dock-card-top">
                  <span className="hx-dock-card-icon"><HomeIcon name="bot" size={20} /></span>
                  <span className="hx-dock-card-arrow" aria-hidden="true">→</span>
                </div>
                <h3 className="hx-dock-card-title">AI &amp; Automation</h3>
                <p className="hx-dock-card-sub">AI Agents, Chatbots &amp; Workflow Systems</p>
              </Link>
              <Link href="/services/information-technology-services" className="hx-dock-card">
                <div className="hx-dock-card-top">
                  <span className="hx-dock-card-icon"><HomeIcon name="code-xml" size={20} /></span>
                  <span className="hx-dock-card-arrow" aria-hidden="true">→</span>
                </div>
                <h3 className="hx-dock-card-title">Custom IT &amp; Web Apps</h3>
                <p className="hx-dock-card-sub">Next.js, Cloud Architectures &amp; Software</p>
              </Link>
              <Link href="/services/staff-augmentation" className="hx-dock-card">
                <div className="hx-dock-card-top">
                  <span className="hx-dock-card-icon"><HomeIcon name="users" size={20} /></span>
                  <span className="hx-dock-card-arrow" aria-hidden="true">→</span>
                </div>
                <h3 className="hx-dock-card-title">Staff Augmentation</h3>
                <p className="hx-dock-card-sub">Dedicated Technical &amp; Growth Specialists</p>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* 2. Trust strip */}
      <section className="hx-trust">
        <div className="hx-wrap">
          <div className="hx-trust-card" data-hx="lift">
            <div className="hx-trust-top">
              <h2 className="hx-trust-title">
                <span className="hx-trust-num">
                  <span data-hx-count={TRUST.count}>{TRUST.count.toLocaleString("en-US")}</span>
                  {TRUST.countSuffix}
                </span>{" "}
                <span className="hx-trust-rest">{TRUST.titleRest}</span>
              </h2>
              <div className="hx-trust-side">
                <h3 className="hx-trust-sub">{TRUST.subtitle}</h3>
                <ul className="hx-trust-list">
                  {TRUST.services.map((s, i) => (
                    <li key={s} data-hx="pop" style={d(0.1 + i * 0.08)}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Logos />
          </div>
        </div>
      </section>

      {/* 3. About */}
      <Section className="hx-about">
        <div className="hx-wrap hx-about-grid">
          <div className="hx-about-art" aria-hidden="true">
            <figure className="hx-about-main" data-hx="wipe">
              <img src="/images/home1-about-01.jpg" alt="" loading="lazy" />
            </figure>
            <figure className="hx-about-side" data-hx="wipe" style={d(0.2)}>
              <img src="/images/contact-team-collaboration.jpg" alt="" loading="lazy" />
            </figure>
            <div className="hx-about-badge" data-hx="lift">
              <span className="hx-about-badge-num">10+</span>
              <span className="hx-about-badge-text">Years Of Digital Excellence</span>
            </div>
            <span className="hx-about-dots" />
          </div>
          <div className="hx-about-copy">
            <Title lines={ABOUT.title} />
            {ABOUT.text.map((t, i) => (
              <p key={i} className={i === 0 ? "hx-lead" : "hx-body"} data-hx="rise" style={d(0.15 + i * 0.1)}>
                {t}
              </p>
            ))}
            <div data-hx="rise" style={d(0.35)}>
              <Button cta={ABOUT.cta} />
            </div>
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

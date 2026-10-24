import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LucideIcon, { type LucideIconName } from "@/components/LucideIcon";
import GeoFaq from "@/components/GeoFaq";
import GeoToc from "@/components/GeoToc";
import LocationMotion from "@/components/LocationMotion";
import "@/app/locations.css";
import {
  LOCATIONS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  INDUSTRY_LINKS,
  pageExcerpt,
  type LocBlock,
  type LocCity,
  type LocPage,
  type LocSection,
} from "@/lib/locations";

/*
 * Location pages ("geo-" design, used only here):
 *  - LocationsHub: "Our Locations" — a numbered city directory
 *  - CityView: every service page for one city, grouped by service category
 *  - LocationServiceView: one city service page, rendered from the document
 * Site fonts, heading gradient and black/white buttons. Every word on the
 * service pages comes from the location documents (data/locations/*.json).
 */

function GradientHeading({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return <span className="qs-gradient-text">{text}</span>;
  const split = Math.max(1, Math.floor(words.length * 0.55));
  return (
    <>
      {words.slice(0, split).join(" ")} <span className="qs-gradient-text">{words.slice(split).join(" ")}</span>
    </>
  );
}

const Html = ({ html, className = "geo-text", as = "p" }: { html: string; className?: string; as?: "p" | "span" }) =>
  as === "p" ? (
    <p className={className} dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );

function CtaRow({ labels, tone = "light" }: { labels: string[]; tone?: "light" | "dark" }) {
  if (!labels.length) return null;
  return (
    <div className="geo-actions">
      {labels.map((l, i) => (
        <Link key={l + i} href="/contact" className={`geo-btn ${i === 0 ? (tone === "dark" ? "geo-btn-white" : "geo-btn-dark") : tone === "dark" ? "geo-btn-ghost" : "geo-btn-outline"}`}>
          <span>{l}</span>
          {i === 0 && <LucideIcon name="arrow-right" size={16} strokeWidth={2.2} />}
        </Link>
      ))}
    </div>
  );
}

function CheckList({ items, cols = 1 }: { items: string[]; cols?: 1 | 2 }) {
  return (
    <ul className={`geo-checks${cols === 2 ? " geo-checks-2" : ""}`}>
      {items.map((it, i) => (
        <li key={i}>
          <span className="geo-check" aria-hidden="true">
            <LucideIcon name="check" size={12} strokeWidth={3} />
          </span>
          <Html html={it} as="span" className="geo-check-text" />
        </li>
      ))}
    </ul>
  );
}

/** Renders a run of blocks; CTAs are grouped into one button row */
function Blocks({
  blocks,
  tone = "light",
  compact = false,
  panelLists = false,
}: {
  blocks: LocBlock[];
  tone?: "light" | "dark";
  compact?: boolean;
  panelLists?: boolean;
}) {
  const out: React.ReactNode[] = [];
  let ctas: string[] = [];
  const flush = (key: string) => {
    if (ctas.length) {
      out.push(
        compact ? (
          <div key={key} className="geo-card-links">
            {ctas.map((c, i) => (
              <Link key={c + i} href="/contact" className="geo-text-link">
                <span>{c}</span>
                <LucideIcon name="arrow-right" size={14} strokeWidth={2.2} />
              </Link>
            ))}
          </div>
        ) : (
          <CtaRow key={key} labels={ctas} tone={tone} />
        )
      );
      ctas = [];
    }
  };
  blocks.forEach((b, i) => {
    if (b.type === "cta") {
      ctas.push(b.label);
      return;
    }
    flush(`cta-${i}`);
    if (b.type === "p") out.push(<Html key={i} html={b.html} />);
    else if (b.type === "list")
      out.push(
        panelLists ? (
          <div key={i} className="geo-panel">
            <CheckList items={b.items} cols={b.items.length > 3 ? 2 : 1} />
          </div>
        ) : (
          <CheckList key={i} items={b.items} cols={!compact && b.items.length > 6 ? 2 : 1} />
        )
      );
    else if (b.type === "chips")
      out.push(
        <div key={i} className="geo-chips">
          {b.items.map((c) => (
            <span key={c} className="geo-chip">
              {c}
            </span>
          ))}
        </div>
      );
    else if (b.type === "steps") out.push(<Steps key={i} steps={b.steps} />);
    else if (b.type === "qa")
      out.push(
        <div key={i} className="geo-qa">
          <h3 className="geo-h3">{b.q}</h3>
          <Html html={b.a} />
        </div>
      );
    else if (b.type === "sub")
      out.push(
        <div key={i} className="geo-sub">
          <h3 className="geo-h3">{b.title}</h3>
          <Blocks blocks={b.blocks} tone={tone} compact={compact} panelLists={panelLists} />
        </div>
      );
  });
  flush("cta-end");
  return <>{out}</>;
}

function Steps({ steps }: { steps: { num: string; title: string; desc: string }[] }) {
  return (
    <ol className="geo-tl">
      {steps.map((s) => (
        <li key={s.num + s.title}>
          <span className="geo-tl-num">{s.num}</span>
          <div className="geo-tl-body">
            <h3 className="geo-h3">{s.title}</h3>
            {s.desc && <Html html={s.desc} />}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Pulls a single leading sub-heading out as the section tagline */
function splitTagline(blocks: LocBlock[]) {
  const subs = blocks.filter((b) => b.type === "sub");
  if (subs.length === 1 && blocks[0]?.type === "sub") {
    const s = blocks[0] as Extract<LocBlock, { type: "sub" }>;
    return { tagline: s.title, blocks: [...s.blocks, ...blocks.slice(1)] };
  }
  return { tagline: "", blocks };
}

/** Steps from either step lines or "01. Title" sub-headings */
function collectSteps(blocks: LocBlock[]) {
  let steps = blocks.flatMap((b) => (b.type === "steps" ? b.steps : []));
  if (!steps.length) {
    steps = blocks
      .filter((b): b is Extract<LocBlock, { type: "sub" }> => b.type === "sub")
      .map((s) => {
        const m = s.title.match(/^(\d{1,2})\.\s*(.*)$/);
        const desc = s.blocks
          .filter((x): x is { type: "p"; html: string } => x.type === "p")
          .map((x) => x.html)
          .join(" ");
        return { num: m ? m[1].padStart(2, "0") : "", title: m ? m[2] : s.title, desc };
      });
  }
  return steps;
}

/** One section of a city service page, in the document column */
function DocSection({ section, index }: { section: LocSection; index: number }) {
  const id = `s-${index}`;
  const num = String(index + 1).padStart(2, "0");
  const head = (tagline?: string) => (
    <header className="geo-doc-head">
      <span className="geo-doc-num" aria-hidden="true">
        {num}
      </span>
      <div className="geo-doc-titles">
        <h2 className="geo-h2">
          <GradientHeading text={section.heading} />
        </h2>
        {tagline && <p className="geo-tagline">{tagline}</p>}
      </div>
    </header>
  );

  if (section.kind === "faq") {
    const faqCtas = section.blocks
      .flatMap((b) => (b.type === "sub" ? b.blocks : [b]))
      .filter((b): b is { type: "cta"; label: string } => b.type === "cta")
      .map((b) => b.label);
    return (
      <section id={id} className="geo-doc-sec">
        <GeoFaq items={section.faqs || []} />
        <CtaRow labels={faqCtas} />
      </section>
    );
  }

  if (section.kind === "industries") {
    const intro = section.blocks.filter((b) => b.type === "p") as { type: "p"; html: string }[];
    return (
      <section id={id} className="geo-doc-sec">
        {head()}
        {intro.map((p, i) => (
          <Html key={i} html={p.html} />
        ))}
        <div className="geo-chips">
          {(section.chips || []).map((c) =>
            INDUSTRY_LINKS[c] ? (
              <Link key={c} href={INDUSTRY_LINKS[c]} className="geo-chip geo-chip-link">
                {c}
                <LucideIcon name="arrow-up-right" size={13} strokeWidth={2.2} />
              </Link>
            ) : (
              <span key={c} className="geo-chip">
                {c}
              </span>
            )
          )}
        </div>
      </section>
    );
  }

  if (section.kind === "steps") {
    const pre = section.blocks.filter((b) => b.type === "p");
    const ctas = [
      ...section.blocks.filter((b) => b.type === "cta"),
      ...section.blocks.flatMap((b) => (b.type === "sub" ? b.blocks.filter((x) => x.type === "cta") : [])),
    ];
    return (
      <section id={id} className="geo-doc-sec">
        {head()}
        <Steps steps={collectSteps(section.blocks)} />
        <Blocks blocks={[...pre, ...ctas]} />
      </section>
    );
  }

  if (section.kind === "cards") {
    const lead = section.blocks.filter((b) => b.type !== "sub" && b.type !== "cta");
    const subs = section.blocks.filter((b): b is Extract<LocBlock, { type: "sub" }> => b.type === "sub");
    const tail = section.blocks.filter((b) => b.type === "cta");
    return (
      <section id={id} className="geo-doc-sec">
        {head()}
        {lead.length > 0 && <Blocks blocks={lead} />}
        <div className="geo-tiles">
          {subs.map((s) => (
            <article key={s.title} className="geo-tile">
              <h3 className="geo-h3">{s.title}</h3>
              <Blocks blocks={s.blocks} compact />
            </article>
          ))}
        </div>
        {tail.length > 0 && <Blocks blocks={tail} />}
      </section>
    );
  }

  const { tagline, blocks } = splitTagline(section.blocks);
  return (
    <section id={id} className="geo-doc-sec">
      {head(tagline)}
      <Blocks blocks={blocks} panelLists />
    </section>
  );
}

/** Final call to action, full width */
function ClosingBand({ section }: { section: LocSection }) {
  const { tagline, blocks } = splitTagline(section.blocks);
  return (
    <section className="geo-section geo-closing-sec">
      <div className="geo-container">
        <div className="geo-closing">
          <h2 className="geo-h2">
            <GradientHeading text={section.heading} />
          </h2>
          {tagline && <p className="geo-tagline geo-tagline-light">{tagline}</p>}
          <Blocks blocks={blocks} tone="dark" />
        </div>
      </div>
    </section>
  );
}

/* Contour rings for the hero map (deterministic, so server and client match) */
const CONTOURS = Array.from({ length: 10 }, (_, k) => {
  const r0 = 46 + k * 40;
  const pts: string[] = [];
  for (let i = 0; i < 90; i++) {
    const t = (i / 90) * Math.PI * 2;
    const r =
      r0 * (1 + 0.07 * Math.sin(3 * t + k * 0.6) + 0.045 * Math.sin(5 * t - k * 0.9) + 0.03 * Math.sin(2 * t + k));
    pts.push(`${(450 + r * Math.cos(t)).toFixed(1)} ${(450 + r * Math.sin(t)).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
});

/** Hero map: soft topographic contour rings with the location pin at their centre */
function GeoMap() {
  return (
    <div className="geo-map" aria-hidden="true">
      <svg className="geo-map-lines" viewBox="0 0 900 900" fill="none">
        <defs>
          <linearGradient id="geo-map-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00d2ff" />
            <stop offset="0.5" stopColor="#6366f1" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <g className="geo-map-rings">
          {CONTOURS.map((d, i) => (
            <path key={i} d={d} className={i % 3 === 2 ? "is-major" : undefined} />
          ))}
        </g>
      </svg>
      <span className="geo-map-pin">
        <span className="geo-map-pulse" />
        <span className="geo-map-pulse geo-map-pulse-2" />
        <span className="geo-map-dot">
          <LucideIcon name="map-pin" size={22} />
        </span>
      </span>
    </div>
  );
}

function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="geo-breadcrumb" aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={it.label + i} className="geo-crumb">
          {it.href ? <Link href={it.href}>{it.label}</Link> : <span className="geo-crumb-current">{it.label}</span>}
          {i < items.length - 1 && <span className="geo-crumb-sep">/</span>}
        </span>
      ))}
    </nav>
  );
}

/* ======================================================================== */
/* Our Locations                                                             */
/* ======================================================================== */
export function LocationsHub() {
  return (
    <div className="geo-page">
      <Header />
      <main>
        <section className="geo-dir-sec">
          <div className="geo-dir-bg" aria-hidden="true" />
          <div className="geo-container">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Our Locations" }]} />
            <div className="geo-dir-head">
              <h1 className="geo-h1">
                <GradientHeading text="Our Locations" />
              </h1>
              <span className="geo-dir-count" aria-hidden="true">
                <span className="geo-dir-count-num">{String(LOCATIONS.length).padStart(2, "0")}</span>
                <LucideIcon name="map-pin" size={18} />
              </span>
            </div>

            <ol className="geo-dir">
              {LOCATIONS.map((c, i) => (
                <li key={c.slug}>
                  <Link href={`/locations/${c.slug}`} className="geo-dir-row">
                    <span className="geo-dir-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="geo-dir-pin" aria-hidden="true">
                      <LucideIcon name="map-pin" size={18} />
                    </span>
                    <span className="geo-dir-city">{c.city}</span>
                    <span className="geo-dir-go" aria-hidden="true">
                      <LucideIcon name="arrow-up-right" size={18} strokeWidth={2.2} />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <LocationMotion />
      <Footer />
    </div>
  );
}

/* ======================================================================== */
/* One city                                                                  */
/* ======================================================================== */
export function CityView({ city }: { city: LocCity }) {
  const groups = CATEGORY_ORDER.map((cat) => ({ cat, pages: city.pages.filter((p) => p.category === cat) })).filter(
    (g) => g.pages.length
  );
  return (
    <div className="geo-page">
      <Header />
      <main>
        <section className="geo-hero geo-hero-map geo-hero-city">
          <div className="geo-hero-bg" aria-hidden="true" />
          <GeoMap />
          <div className="geo-container">
            <div className="geo-hero-copy">
              <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Our Locations", href: "/locations" }, { label: city.city }]} />
              <h1 className="geo-h1">
                <span className="qs-gradient-text">{city.city}</span>
              </h1>
              <ul className="geo-hero-cats">
                {groups.map((g) => (
                  <li key={g.cat}>
                    <a href={`#${g.cat}`} className="geo-hero-cat">
                      <span>{CATEGORY_LABELS[g.cat]}</span>
                      <LucideIcon name="chevron-right" size={16} strokeWidth={2.2} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="geo-container geo-doc">
          <GeoToc
            items={groups.map((g) => ({ id: g.cat, label: CATEGORY_LABELS[g.cat], count: g.pages.length }))}
            title={
              <>
                <LucideIcon name="map-pin" size={14} />
                <span>{city.city}</span>
              </>
            }
          />
          <div className="geo-doc-main">
            {groups.map((g, gi) => (
              <section key={g.cat} id={g.cat} className="geo-doc-sec">
                <header className="geo-doc-head">
                  <span className="geo-doc-num" aria-hidden="true">
                    {String(gi + 1).padStart(2, "0")}
                  </span>
                  <div className="geo-doc-titles">
                    <h2 className="geo-h2">
                      <GradientHeading text={CATEGORY_LABELS[g.cat]} />
                    </h2>
                  </div>
                </header>
                <ul className="geo-svc-list">
                  {g.pages.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/${p.slug}`} className="geo-svc-row">
                        <span className="geo-svc-icon" aria-hidden="true">
                          <LucideIcon name={p.icon as LucideIconName} size={20} />
                        </span>
                        <span className="geo-svc-text">
                          <span className="geo-svc-title">{p.h1}</span>
                          <span className="geo-svc-excerpt">{pageExcerpt(p)}</span>
                        </span>
                        <span className="geo-svc-go" aria-hidden="true">
                          <LucideIcon name="arrow-up-right" size={17} strokeWidth={2.2} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </main>
      <LocationMotion seed={1} />
      <Footer />
    </div>
  );
}

/* ======================================================================== */
/* One city service page                                                     */
/* ======================================================================== */
export function LocationServiceView({ city, page }: { city: LocCity; page: LocPage }) {
  const intro = page.intro;
  const introText = intro.filter((b) => b.type !== "cta");
  const introCtas = intro.filter((b): b is { type: "cta"; label: string } => b.type === "cta").map((b) => b.label);
  const firstP = introText.findIndex((b) => b.type === "p");
  const last = page.sections[page.sections.length - 1];
  const hasClosing = !!last && (last.kind === "closing" || last.kind === "standard");
  const body = hasClosing ? page.sections.slice(0, -1) : page.sections;

  return (
    <div className="geo-page">
      <Header />
      <main>
        <section className="geo-hero geo-hero-map geo-hero-svc">
          <div className="geo-hero-bg" aria-hidden="true" />
          <GeoMap />
          <div className="geo-container">
            <div className="geo-hero-copy">
              <Breadcrumb
                items={[
                  { label: "Home", href: "/" },
                  { label: "Our Locations", href: "/locations" },
                  { label: city.city, href: `/locations/${city.slug}` },
                  { label: page.h1 },
                ]}
              />
              <h1 className="geo-h1">
                <GradientHeading text={page.h1} />
              </h1>
              {introText.map((b, i) =>
                b.type === "p" ? (
                  <Html key={i} html={b.html} className={i === firstP ? "geo-lead" : "geo-text"} />
                ) : (
                  <Blocks key={i} blocks={[b]} />
                )
              )}
              <CtaRow labels={introCtas} />
            </div>
          </div>
        </section>

        <div className="geo-container geo-doc">
          <GeoToc
            items={body.map((s, i) => ({ id: `s-${i}`, label: s.heading, faq: s.kind === "faq" })).filter((t) => !t.faq)}
            title={
              <>
                <LucideIcon name="map-pin" size={14} />
                <span>{city.city}</span>
              </>
            }
          />
          <div className="geo-doc-main">
            {body.map((s, i) => (
              <DocSection key={s.heading + i} section={s} index={i} />
            ))}
          </div>
        </div>

        {hasClosing && <ClosingBand section={last} />}
      </main>
      <LocationMotion seed={2} />
      <Footer />
    </div>
  );
}

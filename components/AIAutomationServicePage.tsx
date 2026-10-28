"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceEnquiryForm from "@/components/ServiceEnquiryForm";
import FlowMotion from "@/components/FlowMotion";
import "@/app/ai-automation-console.css";
import type {
  AiBlock,
  DescPairsBlock,
  FaqBlock,
  IndustriesBlock,
  ProcessBlock,
  ServicePageData,
  WhyChooseBlock,
} from "@/lib/servicePageTypes";
import LucideIcon, { type LucideIconName } from "@/components/LucideIcon";

/*
 * AI & Automation Solutions service page — "acx-" design, used only here:
 * split hero with a photo and floating icon chips, invert-on-hover service
 * modules, a dark capability matrix, gradient-numbered step cards, a photo +
 * icon grid for why choose, icon industry tiles, FAQ and a sign-off panel.
 * Every word comes from data/services/ai-automation-solutions.ts.
 */

function Grad({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 3) return <span className="qs-gradient-text">{text}</span>;
  const split = Math.max(1, Math.floor(words.length * 0.55));
  return (
    <>
      {words.slice(0, split).join(" ")} <span className="qs-gradient-text">{words.slice(split).join(" ")}</span>
    </>
  );
}

const Arrow = () => <LucideIcon name="arrow-right" size={16} strokeWidth={2.2} />;
const Check = ({ size = 13 }: { size?: number }) => <LucideIcon name="check" size={size} strokeWidth={2.8} />;

/* One icon per service module, in content order */
const serviceIcons: LucideIconName[] = [
  "message-circle",
  "bot",
  "workflow",
  "user-round-check",
  "filter",
  "headset",
  "file-text",
  "plug-zap",
  "sparkles",
];

/* One icon per "why choose" point and per industry, in content order */
const whyIcons: LucideIconName[] = ["sparkles", "target", "plug-zap", "workflow", "layers", "code-xml", "rocket", "settings"];
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

function Btn({ href, label, variant = "dark" }: { href?: string; label: string; variant?: "dark" | "outline" }) {
  return (
    <Link href={href || "/contact"} className={`acx-btn acx-btn-${variant}`}>
      <span>{label}</span>
      {variant === "dark" && <Arrow />}
    </Link>
  );
}

/* Outline of the hero frame: a rounded card with a notch cut into the top-left
   corner (holding the breadcrumb) and one cut into the bottom-right corner
   (holding the button). Built from the live sizes so it fits any content. */
function notchedPath(W: number, H: number, a1: number, b1: number, a2: number, b2: number) {
  const R = 40;
  const r = 22;
  return [
    `M${a1 + r} 0`,
    `H${W - R}`,
    `A${R} ${R} 0 0 1 ${W} ${R}`,
    `V${H - b2 - r}`,
    `A${r} ${r} 0 0 1 ${W - r} ${H - b2}`,
    `H${W - a2 + r}`,
    `A${r} ${r} 0 0 0 ${W - a2} ${H - b2 + r}`,
    `V${H - r}`,
    `A${r} ${r} 0 0 1 ${W - a2 - r} ${H}`,
    `H${R}`,
    `A${R} ${R} 0 0 1 0 ${H - R}`,
    `V${b1 + r}`,
    `A${r} ${r} 0 0 1 ${r} ${b1}`,
    `H${a1 - r}`,
    `A${r} ${r} 0 0 0 ${a1} ${b1 - r}`,
    `V${r}`,
    `A${r} ${r} 0 0 1 ${a1 + r} 0`,
    "Z",
  ].join(" ");
}

export default function AIAutomationServicePage({
  data,
  categoryLabel,
  categorySlug,
}: {
  data: ServicePageData;
  categoryLabel?: string;
  categorySlug?: string;
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const services = data.blocks.find((b): b is DescPairsBlock => b.type === "descPairs");
  const growth = data.blocks.find((b): b is AiBlock => b.type === "ai");
  const processBlock = data.blocks.find((b): b is ProcessBlock => b.type === "process");
  const why = data.blocks.find((b): b is WhyChooseBlock => b.type === "whyChoose");
  const industries = data.blocks.find((b): b is IndustriesBlock => b.type === "industries");
  const faq = data.blocks.find((b): b is FaqBlock => b.type === "faq");
  const faqItems = faq ? faq.items || faq.faqs || [] : [];
  const steps = processBlock?.steps || [];
  const [heroLead, ...heroRest] = data.heroParagraphs || [];

  /* Hero frame outline, measured from the breadcrumb and button notches */
  const frameRef = useRef<HTMLDivElement>(null);
  const crumbRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<{ d: string; w: number; h: number; b1: number; b2: number } | null>(null);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => {
      if (window.innerWidth <= 991) {
        setFrame(null);
        return;
      }
      const W = el.offsetWidth;
      const H = el.offsetHeight;
      const gap = 18;
      const c = crumbRef.current;
      const b = ctaRef.current;
      const a1 = c ? c.offsetWidth + gap : 0;
      const b1 = c ? c.offsetHeight + gap : 0;
      const a2 = b ? b.offsetWidth + gap : 0;
      const b2 = b ? b.offsetHeight + gap : 0;
      setFrame({ d: notchedPath(W, H, a1, b1, a2, b2), w: W, h: H, b1, b2 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className="acx-page">
      <Header />

      <main>
        {/* Hero */}
        <section className="acx-hero">
          <div
            ref={frameRef}
            className={`acx-frame${frame ? " is-notched" : ""}`}
            style={
              frame
                ? ({ "--acx-n1": `${frame.b1}px`, "--acx-n2": `${frame.b2}px` } as React.CSSProperties)
                : undefined
            }
          >
            <nav ref={crumbRef} className="acx-crumbs acx-notch-crumbs" aria-label="Breadcrumb">
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
              <span className="acx-crumb-now">{data.crumb}</span>
            </nav>

            <div className="acx-frame-shape">
              <div className="acx-stage" style={frame ? { clipPath: `path("${frame.d}")` } : undefined}>
                <div className="acx-stage-photo" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/contact-tech-discussion.jpg" alt="" />
                </div>
                <div className="acx-stage-shade" aria-hidden="true" />
                <div className="acx-stage-inner">
                  <div className="acx-stage-grid">
                    <div className="acx-stage-copy">
                      <h1>
                        <Grad text={data.heroTitle} />
                      </h1>
                      {heroLead && <p className="acx-lead">{heroLead}</p>}
                    </div>
                    {heroRest.length > 0 && (
                      <div className="acx-stage-glass">
                        {heroRest.map((p, i) => (
                          <p key={i} className="acx-text">
                            {p}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {frame && (
              <svg className="acx-frame-edge" width={frame.w} height={frame.h} viewBox={`0 0 ${frame.w} ${frame.h}`} aria-hidden="true">
                <defs>
                  <linearGradient id="acx-edge" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#00d2ff" />
                    <stop offset="0.5" stopColor="#6366f1" />
                    <stop offset="1" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <path d={frame.d} />
              </svg>
            )}

            {data.heroCta && (
              <div ref={ctaRef} className="acx-actions acx-notch-cta">
                <Btn href={data.heroCta.href} label={data.heroCta.label} />
              </div>
            )}
          </div>
        </section>

        {/* Services: modules */}
        {services && (
          <section className="acx-sec">
            <div className="acx-container">
              <div className="acx-head">
                {services.title && (
                  <h2>
                    <Grad text={services.title} />
                  </h2>
                )}
                {services.desc && <p className="acx-text">{services.desc}</p>}
              </div>
              <ul className="acx-modules">
                {services.items.map((item, i) => (
                  <li key={item.title} className="acx-module">
                    <span className="acx-module-icon" aria-hidden="true">
                      <LucideIcon name={serviceIcons[i % serviceIcons.length]} size={22} strokeWidth={1.9} />
                    </span>
                    <h3>{item.title}</h3>
                    <p className="acx-text">{item.desc}</p>
                  </li>
                ))}
              </ul>
              {services.cta && (
                <div className="acx-actions acx-actions-center">
                  <Btn href={services.cta.href} label={services.cta.label} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Growth: dark capability matrix */}
        {growth && (
          <section className="acx-sec acx-sec-tight">
            <div className="acx-container">
              <div className="acx-matrix-panel">
                <span className="acx-matrix-grid" aria-hidden="true" />
                <div className="acx-matrix-head">
                  <h2>
                    <Grad text={growth.title} />
                  </h2>
                  {growth.intro && <p className="acx-matrix-intro">{growth.intro}</p>}
                </div>
                <ul className="acx-matrix">
                  {(growth.bullets || []).map((b) => (
                    <li key={b}>
                      <span className="acx-matrix-check" aria-hidden="true">
                        <Check />
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                {growth.desc && <p className="acx-matrix-intro">{growth.desc}</p>}
                {growth.cta && (
                  <div className="acx-actions">
                    <Link href={growth.cta.href || "/contact"} className="acx-btn acx-btn-white">
                      <span>{growth.cta.label}</span>
                      <Arrow />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Process: heading column + vertical stepper */}
        {processBlock && (
          <section
            className="acx-sec acx-soft qs-backdrop"
            style={{ "--qs-backdrop": "url('/images/contact-consulting-planning.jpg')" } as React.CSSProperties}
          >
            <div className="acx-container acx-proc">
              <div className="acx-proc-side">
                <h2>
                  <Grad text={processBlock.title} />
                </h2>
                {processBlock.intro && <p className="acx-text">{processBlock.intro}</p>}
                {processBlock.desc && <p className="acx-text">{processBlock.desc}</p>}
                {processBlock.cta && (
                  <div className="acx-actions">
                    <Btn href={processBlock.cta.href} label={processBlock.cta.label} />
                  </div>
                )}
              </div>
              <ol className="acx-stepper">
                {steps.map((st) => (
                  <li key={st.num + st.title} className="acx-stepper-row">
                    <span className="acx-stepper-node">{st.num}</span>
                    <div className="acx-stepper-body">
                      <h3>{st.title}</h3>
                      <p className="acx-text">{st.desc || st.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* Why choose */}
        {why && (
          <section className="acx-sec">
            <div className="acx-container acx-why">
              <div className="acx-why-copy">
                <div className="acx-why-photo" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/contact-team-collaboration.jpg" alt="" loading="lazy" />
                </div>
                {why.tagline && <p className="acx-kicker">{why.tagline}</p>}
                {why.title && (
                  <h2>
                    <Grad text={why.title} />
                  </h2>
                )}
                {why.intro && <p className="acx-text">{why.intro}</p>}
                {why.desc && <p className="acx-statement">{why.desc}</p>}
                {why.cta && (
                  <div className="acx-actions">
                    <Btn href={why.cta.href} label={why.cta.label} />
                  </div>
                )}
              </div>
              <ul className="acx-checks">
                {why.bullets.map((b, i) => (
                  <li key={b}>
                    <span className="acx-check-icon" aria-hidden="true">
                      <LucideIcon name={whyIcons[i % whyIcons.length]} size={20} strokeWidth={1.9} />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Industries */}
        {industries && (
          <section className="acx-sec acx-soft">
            <div className="acx-container">
              <div className="acx-head acx-head-center">
                {industries.title && (
                  <h2>
                    <Grad text={industries.title} />
                  </h2>
                )}
                {industries.intro && <p className="acx-text">{industries.intro}</p>}
              </div>
              <ul className="acx-boxes">
                {industries.industries.map((ind) => (
                  <li key={ind}>
                    <span className="acx-box-icon" aria-hidden="true">
                      <LucideIcon name={industryIcons[ind] || "sparkles"} size={22} strokeWidth={1.8} />
                    </span>
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* FAQ */}
        {faqItems.length > 0 && (
          <section className="acx-sec qs-backdrop" style={{ "--qs-backdrop": "url('/images/contact-video-consultation.jpg')" } as React.CSSProperties}>
            <div className="acx-container acx-faq">
              {faqItems.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q} className={`acx-faq-item${open ? " is-open" : ""}`}>
                    <button type="button" className="acx-faq-q" aria-expanded={open} onClick={() => setOpenFaq(open ? null : i)}>
                      <span className="acx-faq-text">{f.q}</span>
                      <span className="acx-faq-sign" aria-hidden="true" />
                    </button>
                    <div className="acx-faq-a">
                      <div>
                        <p className="acx-text">{f.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <ServiceEnquiryForm service="ai-automation" current={data.crumb} />

        {/* Closing */}
        <section className="acx-close-sec">
          <div className="acx-container">
            <div className="acx-close">
              <div className="acx-close-copy">
                {data.closingTagline && <p className="acx-kicker">{data.closingTagline}</p>}
                {data.closingTitle && (
                  <h2>
                    <Grad text={data.closingTitle} />
                  </h2>
                )}
                {(data.closingDesc || "")
                  .split("\n")
                  .filter(Boolean)
                  .map((line, i) => (
                    <p key={i} className="acx-text">
                      {line}
                    </p>
                  ))}
                {data.closingCtas?.length > 0 && (
                  <div className="acx-actions">
                    {data.closingCtas.map((cta, i) => (
                      <Btn key={cta.label} href={cta.href} label={cta.label} variant={i === 0 ? "dark" : "outline"} />
                    ))}
                  </div>
                )}
              </div>
              {data.closingSignature && (
                <div className="acx-sign">
                  <span className="acx-sign-chip" aria-hidden="true">
                    <LucideIcon name="cpu" size={26} strokeWidth={1.8} />
                  </span>
                  <strong>{data.closingSignature.name}</strong>
                  <span>{data.closingSignature.line}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <FlowMotion />
      <Footer />
    </div>
  );
}

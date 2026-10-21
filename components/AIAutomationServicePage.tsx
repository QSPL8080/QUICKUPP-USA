"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/app/ai-automation-service.css";
import type {
  AiBlock,
  DescPairsBlock,
  FaqBlock,
  IndustriesBlock,
  ProcessBlock,
  ServicePageData,
  WhyChooseBlock,
} from "@/lib/servicePageTypes";

/*
 * AI & Automation Solutions service page.
 * Own "automation workflow" design on a dot grid (site gradient, fonts, buttons), an icon-only
 * workflow diagram in the hero, toggle-style benefits and a pipeline process.
 * Every word comes from data/services/ai-automation-solutions.ts — the
 * template adds no labels, badges, numbers or placeholder copy.
 */

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

function Svg({ children, size = 22, stroke = 1.8 }: { children: React.ReactNode; size?: number; stroke?: number }) {
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

/* Line icons, one per service card in content order */
const icons = {
  chat: <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20l1.1-4.2A8.4 8.4 0 1 1 21 11.5z" />,
  bot: (
    <>
      <rect x="5" y="8" width="14" height="11" rx="3" />
      <path d="M12 4v4M9 13h.01M15 13h.01M9.5 16.5h5" />
    </>
  ),
  flow: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.5 6H14a4 4 0 0 1 4 4v5.5M6 8.5V14a4 4 0 0 0 4 4h5.5" />
    </>
  ),
  crm: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M17 11l2 2 3.5-4" />
    </>
  ),
  funnel: <path d="M3 4h18l-7 8.5V19l-4 2v-8.5z" />,
  support: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="2.5" y="14" width="4.5" height="6" rx="1.5" />
      <rect x="17" y="14" width="4.5" height="6" rx="1.5" />
    </>
  ),
  doc: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  api: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" />,
  spark: <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
};

const serviceIcons = [icons.chat, icons.bot, icons.flow, icons.crm, icons.funnel, icons.support, icons.doc, icons.api, icons.spark];

/* Hero workflow diagram: icon nodes around a central AI node (decorative) */
const nodes = [
  { x: 16, y: 18, icon: icons.chat },
  { x: 84, y: 16, icon: icons.crm },
  { x: 92, y: 58, icon: icons.mail },
  { x: 12, y: 70, icon: icons.doc },
  { x: 62, y: 90, icon: icons.chart },
];

function WorkflowDiagram() {
  return (
    <div className="aix-diagram" aria-hidden="true">
      <svg className="aix-diagram-lines" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="aix-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00d2ff" />
            <stop offset="0.5" stopColor="#6366f1" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        {nodes.map((n, i) => {
          const d = `M50 50 Q ${(50 + n.x) / 2 + (i % 2 ? 10 : -10)} ${(50 + n.y) / 2 + (i % 2 ? -8 : 8)} ${n.x} ${n.y}`;
          return (
            <g key={i}>
              <path d={d} className="aix-line-base" />
              <path d={d} className="aix-line-flow" style={{ animationDelay: `${i * 0.6}s` }} />
              <circle r="1.3" className="aix-pulse">
                <animateMotion dur={`${3 + i * 0.4}s`} repeatCount="indefinite" path={d} begin={`${i * 0.5}s`} />
              </circle>
            </g>
          );
        })}
      </svg>
      <div className="aix-node aix-node-core" style={{ left: "50%", top: "50%" }}>
        <Svg size={34}>{icons.bot}</Svg>
      </div>
      {nodes.map((n, i) => (
        <div key={i} className="aix-node" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
          <Svg size={22}>{n.icon}</Svg>
        </div>
      ))}
      {/* Decorative status card: skeleton lines + toggle, no text */}
      <div className="aix-float-card">
        <span className="aix-skel w70" />
        <span className="aix-skel w45" />
        <span className="aix-mini-toggle" />
      </div>
    </div>
  );
}

function PrimaryButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href || "/contact"} className="aix-btn aix-btn-primary">
      <span>{label}</span>
      <ArrowIcon />
    </Link>
  );
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
  const [heroLead, ...heroRest] = data.heroParagraphs || [];

  return (
    <div className="aix-page">
      <Header />

      <main>
        {/* 1. Hero */}
        <section className="aix-hero">
          <div className="aix-container">
            <nav className="aix-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <span>Services</span>
              <span>/</span>
              {categorySlug && categoryLabel && categoryLabel !== data.crumb ? (
                <>
                  <Link href={`/services/${categorySlug}`}>{categoryLabel}</Link>
                  <span>/</span>
                </>
              ) : null}
              <span className="aix-breadcrumb-current">{data.crumb}</span>
            </nav>

            <div className="aix-hero-grid">
              <div className="aix-hero-copy">
                {data.heroEyebrow && <p className="aix-eyebrow">{data.heroEyebrow}</p>}
                <h1 className="aix-h1">
                  <GradientHeading text={data.heroTitle} />
                </h1>
                {heroLead && <p className="aix-lead">{heroLead}</p>}
                {heroRest.map((p, i) => (
                  <p key={i} className="aix-text">
                    {p}
                  </p>
                ))}
                {data.heroCta && (
                  <div className="aix-actions">
                    <PrimaryButton href={data.heroCta.href} label={data.heroCta.label} />
                  </div>
                )}
              </div>
              <WorkflowDiagram />
            </div>
          </div>
        </section>

        {/* 2. Our AI Automation Services */}
        {services && (
          <section className="aix-section">
            <div className="aix-container">
              <div className="aix-head">
                <h2 className="aix-h2">
                  <GradientHeading text={services.title || ""} />
                </h2>
              </div>
              <ul className="aix-services">
                {services.items.map((item, i) => (
                  <li key={item.title} className="aix-service">
                    <span className="aix-service-icon">
                      <Svg size={24}>{serviceIcons[i % serviceIcons.length]}</Svg>
                    </span>
                    <h3 className="aix-h3">{item.title}</h3>
                    <p className="aix-text">{item.desc}</p>
                  </li>
                ))}
              </ul>
              {services.cta && (
                <div className="aix-actions aix-center">
                  <PrimaryButton href={services.cta.href} label={services.cta.label} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* 3. AI Automation for Business Growth */}
        {growth && (
          <section className="aix-section aix-navy">
            <div className="aix-container aix-growth">
              <div className="aix-growth-head">
                <h2 className="aix-h2">
                  <GradientHeading text={growth.title || ""} />
                </h2>
                {growth.intro && <p className="aix-lead">{growth.intro}</p>}
              </div>
              <ul className="aix-toggles">
                {(growth.bullets || []).map((b) => (
                  <li key={b}>
                    <span>{b}</span>
                    <span className="aix-toggle" aria-hidden="true">
                      <span />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 4. Our AI Automation Process */}
        {processBlock && (
          <section className="aix-section">
            <div className="aix-container">
              <div className="aix-head">
                <h2 className="aix-h2">
                  <GradientHeading text={processBlock.title || ""} />
                </h2>
              </div>
              <ol className="aix-pipeline">
                {(processBlock.steps || []).map((st, i) => (
                  <li key={st.num} className={i % 2 === 0 ? "is-left" : "is-right"}>
                    <span className="aix-pipe-node">{st.num}</span>
                    <div className="aix-pipe-card">
                      <h3 className="aix-h3">{st.title}</h3>
                      <p className="aix-text">{st.desc || st.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {processBlock.cta && (
                <div className="aix-actions aix-center">
                  <PrimaryButton href={processBlock.cta.href} label={processBlock.cta.label} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5. Why Choose Quickupp Softech? */}
        {why && (
          <section className="aix-section aix-mint">
            <div className="aix-container">
              <div className="aix-head">
                <h2 className="aix-h2">
                  <GradientHeading text={why.title || ""} />
                </h2>
                {why.tagline && <p className="aix-tagline">{why.tagline}</p>}
              </div>
              <ul className="aix-why">
                {why.bullets.map((b) => (
                  <li key={b}>
                    <span className="aix-check">
                      <CheckIcon />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              {why.desc && <p className="aix-statement">{why.desc}</p>}
            </div>
          </section>
        )}

        {/* 6. Industries We Serve */}
        {industries && (
          <section className="aix-section">
            <div className="aix-container">
              <div className="aix-head">
                <h2 className="aix-h2">
                  <GradientHeading text={industries.title || ""} />
                </h2>
                {industries.intro && <p className="aix-lead">{industries.intro}</p>}
              </div>
              <ul className="aix-chips">
                {industries.industries.map((ind) => (
                  <li key={ind}>{ind}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 7. Frequently Asked Questions */}
        {faqItems.length > 0 && (
          <section className="aix-section aix-soft">
            <div className="aix-container aix-faq-grid">
              <div className="aix-faq-head">{faq?.title && (
                <h2 className="aix-h2">
                  <GradientHeading text={faq.title} />
                </h2>
              )}</div>
              <div className="aix-faq">
                {faqItems.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div key={f.q} className={`aix-faq-item${open ? " is-open" : ""}`}>
                      <button
                        type="button"
                        className="aix-faq-q"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? null : i)}
                      >
                        <span className="aix-faq-text">{f.q}</span>
                        <span className="aix-faq-sign" aria-hidden="true" />
                      </button>
                      {open && <p className="aix-faq-a">{f.a}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 8. Closing */}
        <section className="aix-closing-section">
          <div className="aix-container">
            <div className="aix-closing">
              <div className="aix-closing-grid" aria-hidden="true" />
              {data.closingTitle && <h2 className="aix-h2">
                  <GradientHeading text={data.closingTitle} />
                </h2>}
              {data.closingDesc
                .split("\n")
                .filter(Boolean)
                .map((line, i) => (
                  <p key={i} className="aix-closing-text">
                    {line}
                  </p>
                ))}
              {data.closingTagline && <p className="aix-closing-tagline">{data.closingTagline}</p>}
              <div className="aix-actions aix-center">
                {data.closingCtas.map((cta, i) =>
                  i === 0 ? (
                    <Link key={cta.label} href={cta.href || "/contact"} className="aix-btn aix-btn-white">
                      <span>{cta.label}</span>
                      <ArrowIcon />
                    </Link>
                  ) : (
                    <Link key={cta.label} href={cta.href || "/contact"} className="aix-btn aix-btn-ghost">
                      {cta.label}
                    </Link>
                  )
                )}
              </div>
              {data.closingSignature && (
                <div className="aix-signature">
                  <strong>{data.closingSignature.name}</strong>
                  <span>{data.closingSignature.line}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

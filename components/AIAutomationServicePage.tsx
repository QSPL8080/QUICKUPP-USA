"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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

/* Hero photo with floating icon chips (decorative) */
const floatIcons: { icon: LucideIconName; cls: string }[] = [
  { icon: "bot", cls: "acx-float-a" },
  { icon: "workflow", cls: "acx-float-b" },
  { icon: "mail", cls: "acx-float-c" },
  { icon: "chart-column", cls: "acx-float-d" },
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

  return (
    <div className="acx-page">
      <Header />

      <main>
        {/* Hero */}
        <section className="acx-hero">
          <div className="acx-hero-bg" aria-hidden="true" />
          <div className="acx-container">
            <nav className="acx-crumbs" aria-label="Breadcrumb">
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

            <div className="acx-hero-grid">
              <div className="acx-hero-copy">
                <h1>
                  <Grad text={data.heroTitle} />
                </h1>
                {heroLead && <p className="acx-lead">{heroLead}</p>}
                {heroRest.map((p, i) => (
                  <p key={i} className="acx-text">
                    {p}
                  </p>
                ))}
                {data.heroCta && (
                  <div className="acx-actions">
                    <Btn href={data.heroCta.href} label={data.heroCta.label} />
                  </div>
                )}
              </div>
              <div className="acx-hero-visual" aria-hidden="true">
                <div className="acx-hero-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/contact-tech-discussion.jpg" alt="" />
                </div>
                <span className="acx-hero-chip">
                  <LucideIcon name="cpu" size={30} strokeWidth={1.7} />
                </span>
                {floatIcons.map((f) => (
                  <span key={f.icon} className={`acx-float ${f.cls}`}>
                    <LucideIcon name={f.icon} size={20} />
                  </span>
                ))}
              </div>
            </div>
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
          <section className="acx-sec acx-soft">
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
          <section className="acx-sec">
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

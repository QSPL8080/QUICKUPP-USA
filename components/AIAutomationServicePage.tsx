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
 * Renders the page content from data/services/ai-automation-solutions.ts and
 * nothing else — no placeholder testimonials, default FAQs or template copy.
 * Photos are decorative, transparent backgrounds only.
 */

const photos = {
  hero: "/images/contact-consultancy-headway.jpg",
  growth: "/images/titlebar-img.jpg",
  industries: "/images/contact-meeting-room.jpg",
  closing: "/images/contact-video-consultation.jpg",
};

/** Puts the last ~45% of a heading in the brand gradient. */
function GradientHeading({ text }: { text: string }) {
  const words = text.split(" ");
  if (words.length < 3) return <>{text}</>;
  const split = Math.max(1, Math.floor(words.length * 0.55));
  return (
    <>
      {words.slice(0, split).join(" ")}{" "}
      <span className="aia-gradient">{words.slice(split).join(" ")}</span>
    </>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

/* One line-icon per service card, in content order */
const serviceIcons: React.ReactNode[] = [
  <path key="chat" d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20l1.1-4.2A8.4 8.4 0 1 1 21 11.5z" />,
  <>
    <rect x="5" y="8" width="14" height="11" rx="3" />
    <path d="M12 4v4M9 13h.01M15 13h.01M9.5 16.5h5" />
  </>,
  <>
    <path d="M4 7h10M4 17h6" />
    <circle cx="17" cy="7" r="3" />
    <circle cx="13" cy="17" r="3" />
    <path d="M20 17h-4" />
  </>,
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M17 11l2 2 3.5-4" />
  </>,
  <>
    <path d="M3 4h18l-7 8.5V19l-4 2v-8.5z" />
  </>,
  <>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect x="2.5" y="14" width="4.5" height="6" rx="1.5" />
    <rect x="17" y="14" width="4.5" height="6" rx="1.5" />
  </>,
  <>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </>,
  <>
    <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" />
  </>,
  <>
    <path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.4 7.2 17.9l.9-5.4L4.2 8.7l5.4-.8z" />
  </>,
];

function PrimaryButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="aia-btn aia-btn-dark">
      <span>{label}</span>
      <span className="aia-btn-icon">
        <ArrowIcon />
      </span>
    </Link>
  );
}

function SectionBg({ src }: { src: string }) {
  return (
    <div className="aia-bg" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading="lazy" />
    </div>
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

  return (
    <div className="aia-page">
      <Header />

      <main>
        {/* 1. Hero */}
        <section className="aia-hero aia-has-bg">
          <SectionBg src={photos.hero} />
          <div className="aia-container aia-hero-inner">
            <nav className="asx-breadcrumb aia-breadcrumb" aria-label="Breadcrumb">
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
              <span className="asx-breadcrumb-current">{data.crumb}</span>
            </nav>

            <span className="aia-pill">{data.heroEyebrow}</span>
            <h1 className="aia-h1">
              <GradientHeading text={data.heroTitle} />
            </h1>
            <div className="aia-hero-copy">
              {data.heroParagraphs.map((p, i) => (
                <p key={i} className={i === 0 ? "aia-lead" : "aia-text"}>
                  {p}
                </p>
              ))}
            </div>
            <div className="aia-actions">
              <PrimaryButton href={data.heroCta.href} label={data.heroCta.label} />
            </div>
          </div>
        </section>

        {/* 2. Our AI Automation Services */}
        {services && (
          <section className="aia-section">
            <div className="aia-container">
              <div className="aia-head">
                <h2 className="aia-h2">
                  <GradientHeading text={services.title || ""} />
                </h2>
              </div>
              <div className="aia-service-grid">
                {services.items.map((item, i) => (
                  <article key={item.title} className="aia-service-card">
                    <span className="aia-icon-tile">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        {serviceIcons[i % serviceIcons.length]}
                      </svg>
                    </span>
                    <h3 className="aia-h3">{item.title}</h3>
                    <p className="aia-text">{item.desc}</p>
                  </article>
                ))}
              </div>
              {services.cta && (
                <div className="aia-actions aia-center">
                  <PrimaryButton href={services.cta.href} label={services.cta.label} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* 3. AI Automation for Business Growth */}
        {growth && (
          <section className="aia-section aia-dark aia-has-bg">
            <SectionBg src={photos.growth} />
            <div className="aia-container aia-growth">
              <div className="aia-growth-head">
                <h2 className="aia-h2">
                  <GradientHeading text={growth.title} />
                </h2>
                {growth.intro && <p className="aia-lead">{growth.intro}</p>}
              </div>
              <ul className="aia-check-grid">
                {(growth.bullets || []).map((b) => (
                  <li key={b} className="aia-check-item">
                    <span className="aia-check">
                      <CheckIcon />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 4. Our AI Automation Process */}
        {processBlock && (
          <section className="aia-section aia-soft">
            <div className="aia-container">
              <div className="aia-head">
                <h2 className="aia-h2">
                  <GradientHeading text={processBlock.title} />
                </h2>
              </div>
              <ol className="aia-steps">
                {(processBlock.steps || []).map((st) => (
                  <li key={st.num} className="aia-step">
                    <span className="aia-step-num">{st.num}.</span>
                    <div>
                      <h3 className="aia-h3">{st.title}</h3>
                      <p className="aia-text">{st.desc || st.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {processBlock.cta && (
                <div className="aia-actions aia-center">
                  <PrimaryButton href={processBlock.cta.href} label={processBlock.cta.label} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5. Why Choose Quickupp Softech? */}
        {why && (
          <section className="aia-section">
            <div className="aia-container">
              <div className="aia-head">
                <h2 className="aia-h2">
                  <GradientHeading text={why.title || ""} />
                </h2>
                {why.tagline && <p className="aia-tagline">{why.tagline}</p>}
              </div>
              <ul className="aia-why-grid">
                {why.bullets.map((b) => (
                  <li key={b} className="aia-why-item">
                    <span className="aia-check">
                      <CheckIcon />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              {why.desc && <p className="aia-statement">{why.desc}</p>}
            </div>
          </section>
        )}

        {/* 6. Industries We Serve */}
        {industries && (
          <section className="aia-section aia-has-bg">
            <SectionBg src={photos.industries} />
            <div className="aia-container">
              <div className="aia-head">
                <h2 className="aia-h2">
                  <GradientHeading text={industries.title || ""} />
                </h2>
                {industries.intro && <p className="aia-lead">{industries.intro}</p>}
              </div>
              <ul className="aia-chips">
                {industries.industries.map((ind) => (
                  <li key={ind} className="aia-chip">
                    {ind}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 7. Frequently Asked Questions */}
        {faqItems.length > 0 && (
          <section className="aia-section">
            <div className="aia-container aia-faq-wrap">
              <div className="aia-head">
                <h2 className="aia-h2">
                  <GradientHeading text={faq?.title || ""} />
                </h2>
              </div>
              <div className="aia-faq">
                {faqItems.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div key={f.q} className={`aia-faq-item${open ? " is-open" : ""}`}>
                      <button
                        type="button"
                        className="aia-faq-q"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? null : i)}
                      >
                        <span>{f.q}</span>
                        <span className="aia-faq-sign" aria-hidden="true" />
                      </button>
                      {open && <p className="aia-faq-a">{f.a}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 8. Ready to Automate Your Business? */}
        <section className="aia-section aia-closing-section">
          <div className="aia-container">
            <div className="aia-closing aia-has-bg">
              <SectionBg src={photos.closing} />
              <h2 className="aia-h2">
                <GradientHeading text={data.closingTitle} />
              </h2>
              {data.closingDesc.split("\n").map((line, i) => (
                <p key={i} className={i === 0 ? "aia-lead" : "aia-text"}>
                  {line}
                </p>
              ))}
              {data.closingTagline && <p className="aia-closing-tagline">{data.closingTagline}</p>}
              <div className="aia-actions aia-center">
                {data.closingCtas.map((cta, i) =>
                  i === 0 ? (
                    <PrimaryButton key={cta.label} href={cta.href} label={cta.label} />
                  ) : (
                    <Link key={cta.label} href={cta.href} className="aia-btn aia-btn-light">
                      {cta.label}
                    </Link>
                  )
                )}
              </div>
              {data.closingSignature && (
                <div className="aia-signature">
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

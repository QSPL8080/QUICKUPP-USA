"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import "@/app/ai-video-service-page.css";
import type { AiBlock, ListBlock, ServiceBlock, ServicePageData, WhyChooseBlock } from "@/lib/servicePageTypes";

/*
 * AI Video Production service pages (AI Avatar, AI UGC, AI Hyper-Realistic,
 * Digital Twin & Clone). Own cinematic dark design with the continuous video
 * reel under the hero. Every word comes from the page's data file, in its
 * original order — the template adds no labels, badges or copy.
 */

interface Props {
  data: ServicePageData;
  categoryLabel?: string;
  categorySlug?: string;
}

interface SubpageMedia {
  showcase: string;
  gallery: string[];
  ctaBg: string;
}

/* Reel stills, showcase photo and closing backdrop per page (unchanged sources) */
const aiVideoSubpageMedia: Record<string, SubpageMedia> = {
  "AI Avatar Video": {
    showcase: "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
    ],
    ctaBg: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80",
  },
  "AI UGC Video": {
    showcase: "https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=800&q=80",
    ],
    ctaBg: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1600&q=80",
  },
  "AI Hyper-Realistic Video": {
    showcase: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    ],
    ctaBg: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80",
  },
  "Digital Twin & Clone Video": {
    showcase: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80",
    ],
    ctaBg: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=80",
  },
};

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

const PlayIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.87l10.4-6.5a1 1 0 0 0 0-1.74L9.5 4.63A1 1 0 0 0 8 5.5z" />
  </svg>
);

/** A short video-sample label like "Video Sample 01" */
const isSampleList = (b: ListBlock) => b.items.length > 0 && b.items.every((it) => /sample/i.test(it));

export default function AIVideoServicePage({ data, categoryLabel, categorySlug }: Props) {
  const media = aiVideoSubpageMedia[data.crumb] || aiVideoSubpageMedia["AI Avatar Video"];
  const reel = media.gallery.concat(media.gallery); // duplicated once for a seamless loop
  const [lead, ...restParas] = data.heroParagraphs || [];
  const heroCtas = data.heroCtas && data.heroCtas.length > 0 ? data.heroCtas : data.heroCta ? [data.heroCta] : [];

  const renderBlock = (block: ServiceBlock, index: number) => {
    if (block.type === "list" && isSampleList(block as ListBlock)) {
      const b = block as ListBlock;
      return (
        <section key={index} className="avs-section">
          <div className="avs-container">
            <div className="avs-head">
              <h2 className="avs-h2">{b.title}</h2>
              {b.tagline && <p className="avs-tagline">{b.tagline}</p>}
              {b.desc && <p className="avs-text">{b.desc}</p>}
              {b.intro && <p className="avs-text">{b.intro}</p>}
            </div>
            <ul className="avs-samples">
              {b.items.map((it, i) => (
                <li key={`${it}-${i}`} className="avs-sample">
                  <div className="avs-sample-frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={media.gallery[i % media.gallery.length]} alt="" loading="lazy" />
                    <span className="avs-play" aria-hidden="true">
                      <PlayIcon size={20} />
                    </span>
                  </div>
                  <span className="avs-sample-label">{it}</span>
                </li>
              ))}
            </ul>
            {b.cta && (
              <div className="avs-actions avs-center">
                <Link href={b.cta.href || "/contact"} className="avs-btn avs-btn-accent">
                  <span>{b.cta.label}</span>
                  <ArrowIcon />
                </Link>
              </div>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "list") {
      const b = block as ListBlock;
      return (
        <section key={index} className="avs-section">
          <div className="avs-container">
            <div className="avs-head">
              <h2 className="avs-h2">{b.title}</h2>
              {b.tagline && <p className="avs-tagline">{b.tagline}</p>}
              {b.desc && <p className="avs-text">{b.desc}</p>}
              {b.intro && <p className="avs-text">{b.intro}</p>}
            </div>
            <ul className="avs-formats">
              {b.items.map((it, i) => (
                <li key={`${it}-${i}`}>
                  <span className="avs-format-icon" aria-hidden="true">
                    <PlayIcon size={12} />
                  </span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
            {b.note && <p className="avs-note avs-center-text">{b.note}</p>}
            {b.cta && (
              <div className="avs-actions avs-center">
                <Link href={b.cta.href || "/contact"} className="avs-btn avs-btn-accent">
                  <span>{b.cta.label}</span>
                  <ArrowIcon />
                </Link>
              </div>
            )}
          </div>
        </section>
      );
    }

    if (block.type === "ai") {
      const b = block as AiBlock;
      return (
        <section key={index} className="avs-section avs-raised">
          <div className="avs-container avs-split">
            <div className="avs-viewfinder" aria-hidden="true">
              <div className="avs-viewfinder-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={media.showcase} alt="" loading="lazy" />
              </div>
              <span className="avs-corner tl" />
              <span className="avs-corner tr" />
              <span className="avs-corner bl" />
              <span className="avs-corner br" />
              <span className="avs-rec" />
            </div>
            <div className="avs-split-body">
              <h2 className="avs-h2">{b.title}</h2>
              {b.tagline && <p className="avs-tagline">{b.tagline}</p>}
              {b.intro && <p className="avs-text">{b.intro}</p>}
              <ul className="avs-tags">
                {(b.bullets || []).map((it, i) => (
                  <li key={`${it}-${i}`}>{it}</li>
                ))}
              </ul>
              {b.desc && <p className="avs-note">{b.desc}</p>}
              {b.cta && (
                <div className="avs-actions">
                  <Link href={b.cta.href || "/contact"} className="avs-btn avs-btn-accent">
                    <span>{b.cta.label}</span>
                    <ArrowIcon />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    if (block.type === "whyChoose") {
      const b = block as WhyChooseBlock;
      return (
        <section key={index} className="avs-section avs-raised">
          <div className="avs-container avs-why">
            <div className="avs-why-head">
              <h2 className="avs-h2">{b.title}</h2>
              {b.tagline && <p className="avs-tagline">{b.tagline}</p>}
              {b.intro && <p className="avs-text">{b.intro}</p>}
              {b.desc && <p className="avs-text">{b.desc}</p>}
              {b.cta && (
                <div className="avs-actions">
                  <Link href={b.cta.href || "/contact"} className="avs-btn avs-btn-accent">
                    <span>{b.cta.label}</span>
                    <ArrowIcon />
                  </Link>
                </div>
              )}
            </div>
            <ul className="avs-why-list">
              {b.bullets.map((it, i) => (
                <li key={`${it}-${i}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );
    }

    return null;
  };

  return (
    <div className="avs-page">
      <Header />

      <main>
        {/* Hero + continuous video reel */}
        <section className="avs-hero">
          <div className="avs-hero-glow" aria-hidden="true" />
          <div className="avs-container avs-hero-inner">
            <nav className="avs-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <span>Services</span>
              <span>/</span>
              {categorySlug && categoryLabel ? (
                <>
                  <Link href={`/services/${categorySlug}`}>{categoryLabel}</Link>
                  <span>/</span>
                </>
              ) : null}
              <span className="avs-breadcrumb-current">{data.crumb}</span>
            </nav>

            {data.heroEyebrow && <p className="avs-eyebrow">{data.heroEyebrow}</p>}
            <h1 className="avs-h1">{data.heroTitle}</h1>
            {lead && <p className="avs-lead">{lead}</p>}
            {restParas.map((p, i) => (
              <p key={i} className="avs-text avs-hero-text">
                {p}
              </p>
            ))}
            {heroCtas.length > 0 && (
              <div className="avs-actions avs-center">
                {heroCtas.map((cta, i) => (
                  <Link
                    key={`${cta.label}-${i}`}
                    href={cta.href || "/contact"}
                    className={`avs-btn ${i === 0 ? "avs-btn-accent" : "avs-btn-ghost"}`}
                  >
                    <span>{cta.label}</span>
                    {i === 0 && <ArrowIcon />}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="avs-reel" aria-hidden="true">
            <div className="avs-reel-track">
              {reel.map((src, i) => (
                <div key={i} className="avs-reel-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" />
                  <span className="avs-reel-play">
                    <PlayIcon size={12} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {data.blocks.map((block, i) => renderBlock(block, i))}

        {/* Closing */}
        <section className="avs-closing">
          <div className="avs-closing-bg" aria-hidden="true" style={{ backgroundImage: `url("${media.ctaBg}")` }} />
          <div className="avs-container avs-closing-inner">
            {data.closingTitle && <h2 className="avs-h2 avs-closing-title">{data.closingTitle}</h2>}
            {(data.closingDesc || "")
              .split(/\n+/)
              .filter(Boolean)
              .map((line, i) => (
                <p key={i} className="avs-closing-text">
                  {line}
                </p>
              ))}
            {data.closingTagline && <p className="avs-tagline">{data.closingTagline}</p>}
            {data.closingCtas && data.closingCtas.length > 0 && (
              <div className="avs-actions avs-center">
                {data.closingCtas.map((cta, i) => (
                  <Link
                    key={`${cta.label}-${i}`}
                    href={cta.href || "/contact"}
                    className={`avs-btn ${i === 0 ? "avs-btn-accent" : "avs-btn-ghost"}`}
                  >
                    <span>{cta.label}</span>
                    {i === 0 && <ArrowIcon />}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

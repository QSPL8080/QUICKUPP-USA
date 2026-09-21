"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type {
  ServicePageData,
  DescPairsBlock,
  ListBlock,
  ProcessBlock,
  WhyChooseBlock,
  AiBlock,
  FaqBlock,
} from "@/lib/servicePageTypes";

function AsxFamilyCareSvg() {
  return (
    <svg width="38" height="38" viewBox="0 0 64 64" fill="none" stroke="#001d28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* 3 People figures */}
      <circle cx="32" cy="19" r="4.5" />
      <path d="M25 33c0-3.9 3.1-7 7-7s7 3.1 7 7" />
      <circle cx="21" cy="23" r="3.5" />
      <path d="M15 37c0-3.3 2.7-6 6-6" />
      <circle cx="43" cy="23" r="3.5" />
      <path d="M43 31c3.3 0 6 2.7 6 6" />
      {/* Left Hand cupping */}
      <path d="M12 39c2 7 8 12 15 13" />
      <path d="M10 36c2.5-3 7-4 12-2l7 3" />
      <path d="M17 31l-7 5" />
      {/* Right Hand cupping */}
      <path d="M52 39c-2 7-8 12-15 13" />
      <path d="M54 36c-2.5-3-7-4-12-2l-7 3" />
      <path d="M47 31l7 5" />
    </svg>
  );
}

function AsxIncomeMoneySvg() {
  return (
    <svg width="38" height="38" viewBox="0 0 64 64" fill="none" stroke="#001d28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Money Bag on seat */}
      <path d="M32 14c-1.5 0-2.5 1-2.5 2.5 0 .5.5 1 1 1.5-3 1.5-5 4.5-5 8 0 4.5 3.8 8 8.5 8s8.5-3.5 8.5-8c0-3.5-2-6.5-5-8 .5-.5 1-1 1-1.5 0-1.5-1-2.5-2.5-2.5" />
      {/* Dollar symbol inside bag */}
      <path d="M33.5 21.5h-2.5a1.2 1.2 0 0 0 0 2.4h2a1.2 1.2 0 0 1 0 2.4H30" />
      <path d="M32 20v7.5" />
      {/* Rocking chair backrest slats */}
      <path d="M22 22l6 14" />
      <path d="M18 17l6 19" />
      {/* Chair Seat */}
      <path d="M22 36h22" />
      {/* Chair Legs */}
      <path d="M24 36l-4 13" />
      <path d="M40 36l3 13" />
      <path d="M20 44l22 2" />
      {/* Curved Rocking Runner at bottom */}
      <path d="M14 50c9 5 27 5 36-1" />
    </svg>
  );
}

function AsxMedicalPulseSvg() {
  return (
    <svg width="38" height="38" viewBox="0 0 64 64" fill="none" stroke="#001d28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Heart Shape */}
      <path d="M43.5 14c-4.2 0-7.8 2.5-9.5 6.2-1.7-3.7-5.3-6.2-9.5-6.2-5.8 0-10.5 4.7-10.5 10.5 0 8.5 11 16.5 20 23.3 9-6.8 20-14.8 20-23.3 0-5.8-4.7-10.5-10.5-10.5Z" />
      {/* ECG Pulse Line */}
      <path d="M18 24.5h5.5l2.5-5 3.5 10 3-7 2.5 2h5" />
      {/* Coin with $ at bottom left */}
      <circle cx="21" cy="46" r="6" />
      <path d="M22 43.5h-1.8a1 1 0 0 0 0 2h1.6a1 1 0 0 1 0 2h-1.8" />
      <path d="M21 42.5v7" />
      {/* Upward Growth Arrows at bottom right */}
      <path d="M39 49l4-8 4 8" />
      <path d="M43 41v9" />
      <path d="M46 45l3-6 3 6" />
      <path d="M49 39v7" />
    </svg>
  );
}

// Inline Clean SVG Components
function CheckSvg({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PlusCrossSvg({ isOpen, size = 18 }: { isOpen: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.25s ease",
        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
        color: isOpen ? "#7c3aed" : "#001d28",
      }}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ArrowDownRightSvg({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="7" x2="17" y2="17" />
      <polyline points="17 7 17 17 7 17" />
    </svg>
  );
}

function ThreeDotsSvg({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

function StarRatingSvg() {
  return (
    <div style={{ display: "flex", gap: "2px", color: "#7c3aed" }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

// Industry imagery mapping for high-resolution Assurix-style imagery
const industryImages: Record<
  string,
  { hero: string; story: string; arch: string; circle: string; video: string }
> = {
  Healthcare: {
    hero: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80",
    story: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80",
    arch: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
    circle: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
    video: "/video/Portfolio 1.mp4",
  },
  Education: {
    hero: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
    story: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80",
    arch: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    circle: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80",
    video: "/video/Portfolio 2.mp4",
  },
  "Real Estate": {
    hero: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
    story: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80",
    arch: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    circle: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    video: "/video/Portfolio 1.mp4",
  },
  "Home Services": {
    hero: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80",
    story: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80",
    arch: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    circle: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=600&q=80",
    video: "/video/Portfolio 2.mp4",
  },
  "IT & SaaS": {
    hero: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1600&q=80",
    story: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
    arch: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    circle: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
    video: "/video/Portfolio 1.mp4",
  },
  "Interior Design": {
    hero: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
    story: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80",
    arch: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
    circle: "https://images.unsplash.com/photo-1581291518655-9523c93269c3?auto=format&fit=crop&w=600&q=80",
    video: "/video/Portfolio 2.mp4",
  },
  "Professional Services": {
    hero: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    story: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80",
    arch: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    circle: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80",
    video: "/video/Portfolio 1.mp4",
  },
  eCommerce: {
    hero: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
    story: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1000&q=80",
    arch: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80",
    circle: "https://images.unsplash.com/photo-1556742049-0a67e55722c3?auto=format&fit=crop&w=600&q=80",
    video: "/video/Portfolio 1.mp4",
  },
  "Travel & Hospitality": {
    hero: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    story: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80",
    arch: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
    circle: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80",
    video: "/video/Portfolio 2.mp4",
  },
};

function getImagesForIndustry(crumb: string) {
  return (
    industryImages[crumb] || {
      hero: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80",
      story: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80",
      arch: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
      circle: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
      video: "/video/Portfolio 1.mp4",
    }
  );
}

export default function IndustryDetailPage({ data }: { data: ServicePageData }) {
  const images = getImagesForIndustry(data.crumb);
  const videoRef = useRef<HTMLVideoElement>(null);
  const valPropRef = useRef<HTMLDivElement>(null);
  const [valPropVisible, setValPropVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showReplay, setShowReplay] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeStep, setActiveStep] = useState<number>(4);

  useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      vid.muted = true;
      vid.play().catch(() => setIsPlaying(false));
    }
  }, [data.crumb]);

  useEffect(() => {
    const el = valPropRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setValPropVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [data.crumb]);

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused || vid.ended) {
      vid.play();
      setIsPlaying(true);
      setShowReplay(false);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
  };

  const handleReplay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = 0;
    vid.play();
    setIsPlaying(true);
    setShowReplay(false);
  };

  // Find blocks
  const descPairsBlock = data.blocks.find((b) => b.type === "descPairs") as DescPairsBlock | undefined;
  const listBlock = data.blocks.find((b) => b.type === "list") as ListBlock | undefined;
  const processBlock = data.blocks.find((b) => b.type === "process") as ProcessBlock | undefined;
  const whyChooseBlock = data.blocks.find((b) => b.type === "whyChoose") as WhyChooseBlock | undefined;
  const faqBlock = data.blocks.find((b) => b.type === "faq") as FaqBlock | undefined;

  // Derive value prop checklist items
  const valuePropItems = whyChooseBlock?.bullets && whyChooseBlock.bullets.length >= 4
    ? whyChooseBlock.bullets.slice(0, 4).map((b) => {
        const parts = b.split(" - ");
        return {
          title: parts[0],
          desc: parts[1] || "Tailored execution designed specifically for sustainable " + data.crumb + " growth and client acquisition.",
        };
      })
    : [
        {
          title: "Predictable Patient & Client Acquisition",
          desc: "High-intent digital marketing systems that consistently attract qualified " + data.crumb + " enquiries.",
        },
        {
          title: "Intelligent AI Workflow Automation",
          desc: "Automate qualification, instant booking, and follow-ups to respond to prospects in seconds.",
        },
        {
          title: "Domain Authority & Reputation",
          desc: "Establish undisputed local market leadership through 5-star reviews and search prominence.",
        },
        {
          title: "Transparent Reporting & Guaranteed ROI",
          desc: "Full pipeline visibility, transparent analytics, and dedicated strategist support.",
        },
      ];

  return (
    <div className="asx-page">
      <Header />

      <main style={{ paddingTop: "100px" }}>
        {/* ========================================================================= */}
        {/* ASSURIX SECTION 1: HERO V7 */}
        {/* ========================================================================= */}
        <section className="asx-hero-section">
          <div className="asx-container">
            {/* Breadcrumb Navigation */}
            <div className="asx-breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/industries">Industries</Link>
              <span>/</span>
              <span className="asx-breadcrumb-current">{data.crumb}</span>
            </div>

            <div className="asx-hero-grid">
              {/* Left Column: Heading + Subtitle + Buttons */}
              <div>
                <div className="asx-tag-pill">
                  <span className="asx-tag-dot" />
                  <span>{(data.heroEyebrow || data.crumb) + " Growth & AI Ecosystem"}</span>
                </div>

                <h1 className="asx-hero-title">
                  {data.heroTitle}
                </h1>

                {data.heroParagraphs && data.heroParagraphs[0] && (
                  <p className="asx-hero-desc">
                    {data.heroParagraphs[0]}
                  </p>
                )}

                <div className="asx-hero-btns">
                  <Link
                    href={data.heroCta?.href || "/contact"}
                    className="asx-btn-green"
                  >
                    {data.heroCta?.label || "Get Industry Strategy"}
                  </Link>

                  <a href="#services-breakdown" className="asx-btn-outline">
                    <span>Explore Capabilities</span>
                    <span style={{ fontSize: "14px" }}>↓</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Deep Teal Counter Card */}
              <div>
                <div className="asx-counter-card">
                  <div className="asx-counter-row">
                    <div className="asx-counter-val">
                      <span>235K</span>
                      <span className="asx-counter-plus">+</span>
                    </div>
                    <div className="asx-counter-lbl">
                      {"Qualified " + data.crumb + " Inquiries Generated"}
                    </div>
                  </div>

                  <div className="asx-counter-row">
                    <div className="asx-counter-val">
                      <span>85</span>
                      <span className="asx-counter-plus">%</span>
                    </div>
                    <div className="asx-counter-lbl">
                      Client Retention & Growth Rate
                    </div>
                  </div>

                  <div className="asx-counter-row">
                    <div className="asx-counter-val">
                      <span>98</span>
                      <span className="asx-counter-plus">%</span>
                    </div>
                    <div className="asx-counter-lbl">
                      On-Time AI Pipeline Delivery
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ASSURIX SECTION 2: CURVED HERO MEDIA BANNER */}
        {/* ========================================================================= */}
        <section className="asx-media-wrap">
          <div className="asx-media-box">
            <video
              ref={videoRef}
              src={images.video}
              poster={images.hero}
              playsInline
              loop
              muted={isMuted}
              onEnded={() => setShowReplay(true)}
            />

            <div className="asx-media-overlay">
              <div className="asx-media-top">
                <span className="asx-media-badge">
                  {"✦ " + data.crumb + " Growth Media"}
                </span>

                <div className="asx-media-controls">
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label="Toggle mute"
                    className="asx-ctrl-btn"
                  >
                    {isMuted ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label="Toggle play"
                    className="asx-ctrl-btn"
                  >
                    {isPlaying ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {showReplay && (
                <button
                  type="button"
                  onClick={handleReplay}
                  className="asx-replay-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  <span>Watch Again</span>
                </button>
              )}

              <div className="asx-media-bottom">
                <div className="asx-media-tagline">Quickupp Softech Strategy</div>
                <h3 className="asx-media-title">{data.heroTitle}</h3>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ASSURIX SECTION 3: SERVICE V5 (3 Cards with Top Floating Badges) */}
        {/* ========================================================================= */}
        <section id="services-breakdown" className="asx-section">
          <div className="asx-container">
            <div className="asx-section-header-center">
              <p className="asx-section-intro">
                {"We guide your " + data.crumb + " business through full-funnel growth — "}
                <span>from initial enquiry to loyal client.</span>
              </p>
            </div>

            <div className="asx-cards-grid-3">
              {/* Card 1: Family & Care Needs (Reference SS 1) */}
              <div className="asx-card-v5">
                <div className="asx-card-top-badge">
                  <AsxFamilyCareSvg />
                </div>
                <div>
                  <h3 className="asx-card-title">{"Your " + data.crumb.toLowerCase() + "’s needs"}</h3>
                  <p className="asx-card-desc">
                    {"Ensure your key operations and growth goals are taken care of even in your absence."}
                  </p>
                </div>
                <div className="asx-card-footer">
                  <Link href="#contact" className="asx-arrow-link">
                    <span>Read more</span>
                    <ArrowDownRightSvg />
                  </Link>
                </div>
              </div>

              {/* Card 2: Income / Revenue Replacement (Reference SS 1) */}
              <div className="asx-card-v5">
                <div className="asx-card-top-badge">
                  <AsxIncomeMoneySvg />
                </div>
                <div>
                  <h3 className="asx-card-title">Revenue & pipeline growth</h3>
                  <p className="asx-card-desc">
                    {"Keep your organization’s future secure when inquiries or revenue streams fluctuate unexpectedly."}
                  </p>
                </div>
                <div className="asx-card-footer">
                  <Link href="#contact" className="asx-arrow-link">
                    <span>Read more</span>
                    <ArrowDownRightSvg />
                  </Link>
                </div>
              </div>

              {/* Card 3: Critical Support & Certainty (Reference SS 1) */}
              <div className="asx-card-v5">
                <div className="asx-card-top-badge">
                  <AsxMedicalPulseSvg />
                </div>
                <div>
                  <h3 className="asx-card-title">Operational certainty</h3>
                  <p className="asx-card-desc">
                    {"Reliable enterprise-level systems to maintain high performance and balance for your brand."}
                  </p>
                </div>
                <div className="asx-card-footer">
                  <Link href="#contact" className="asx-arrow-link">
                    <span>Read more</span>
                    <ArrowDownRightSvg />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ASSURIX SECTION 4: VALUE PROPOSITION WITH STAGGERED ENTRANCE & CONVERGING VISUALS (Screenshot 1) */}
        {/* ========================================================================= */}
        <section
          ref={valPropRef}
          className={"asx-section " + (valPropVisible ? "asx-valprop-visible" : "")}
          style={{ borderTop: "1px solid #e5eaee" }}
        >
          <div className="asx-container">
            <div className="asx-valprop-grid">
              {/* Left Column: Staggered Checklist Value Props */}
              <div>
                <div className="asx-tag-pill" style={{ background: "#ffffff", borderColor: "#dce3e4", color: "#001d28" }}>
                  <span>{data.crumb + " Advantage"}</span>
                </div>

                <h2 className="asx-valprop-title">
                  {"Protect your " + data.crumb.toLowerCase() + " practice and secure your growth"}
                </h2>

                <p className="asx-valprop-desc">
                  Our comprehensive growth framework safeguards your marketing investments, connects AI automations, and builds resilient inbound pipelines.
                </p>

                <div className="asx-valprop-list">
                  {valuePropItems.map((item, idx) => (
                    <div key={idx} className="asx-valprop-item">
                      <div className="asx-valprop-check">
                        <CheckSvg size={13} />
                      </div>
                      <div>
                        <h4 className="asx-valprop-item-title">{item.title}</h4>
                        <p className="asx-valprop-item-desc">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Overlapping Converging Arch + Circle + Support Card Visual */}
              <div className="asx-valprop-visual">
                <img
                  src={images.arch}
                  alt={data.crumb + " architecture"}
                  className="asx-arch-img"
                  loading="lazy"
                />

                <img
                  src={images.circle}
                  alt={data.crumb + " consultation"}
                  className="asx-circle-img"
                  loading="lazy"
                />

                <div className="asx-support-card">
                  <div className="asx-sup-title">Dedicated Growth Team</div>
                  <div className="asx-sup-sub">Track active campaigns and sprint velocity</div>

                  <div className="asx-sup-list">
                    <div className="asx-sup-row">
                      <div className="asx-sup-person">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80" alt="Elijah" />
                        <div>
                          <div className="asx-sup-name">Elijah Metz</div>
                          <div className="asx-sup-role">{data.crumb + " Consultant"}</div>
                        </div>
                      </div>
                      <span style={{ color: "#94a3b8" }}><ThreeDotsSvg size={13} /></span>
                    </div>

                    <div className="asx-sup-row is-active">
                      <div className="asx-sup-person">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80" alt="Hannah" />
                        <div>
                          <div className="asx-sup-name">Hannah Rohan</div>
                          <div className="asx-sup-role">AI Automation Lead</div>
                        </div>
                      </div>
                      <span style={{ color: "#7c3aed" }}><ThreeDotsSvg size={13} /></span>
                    </div>

                    <div className="asx-sup-row">
                      <div className="asx-sup-person">
                        <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=60&q=80" alt="Elisa" />
                        <div>
                          <div className="asx-sup-name">Elisa Ritchie</div>
                          <div className="asx-sup-role">Campaign Director</div>
                        </div>
                      </div>
                      <span style={{ color: "#94a3b8" }}><ThreeDotsSvg size={13} /></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ASSURIX SECTION 5: ABOUT V3 (Story Split Section) */}
        {/* ========================================================================= */}
        <section className="asx-section" style={{ borderTop: "1px solid #e5eaee" }}>
          <div className="asx-container">
            <div className="asx-story-grid">
              {/* Left Column: Image with Floating Proof Badge */}
              <div className="asx-story-img-wrap">
                <img
                  src={images.story}
                  alt={data.crumb + " story"}
                  loading="lazy"
                />

                <div className="asx-social-proof">
                  <div className="asx-sp-title">50K+ happy clients</div>
                  <div className="asx-sp-avatars">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Client" />
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Client" />
                    <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80" alt="Client" />
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80" alt="Client" />
                  </div>
                  <div className="asx-sp-bar">
                    <div className="asx-sp-fill" />
                  </div>
                  <div className="asx-sp-rating">
                    <span>4.9 / 5.0 Rating</span>
                    <StarRatingSvg />
                  </div>
                </div>
              </div>

              {/* Right Column: Story Copy + Counter + Green Button */}
              <div>
                <div className="asx-tag-pill" style={{ background: "#ffffff", borderColor: "#dce3e4", color: "#001d28" }}>
                  <span>Our story</span>
                </div>

                <h2 className="asx-story-title">
                  Experience reliability, transparency and true commitment
                </h2>

                <p className="asx-story-desc">
                  {"We stand by our promise to deliver dependable marketing, open communication, and unwavering technical support, ensuring your " + data.crumb + " brand grows predictably every step of the way."}
                </p>

                <div className="asx-story-kpis">
                  <div className="asx-kpi-block">
                    <span className="asx-kpi-num">35+</span>
                    <span className="asx-kpi-text">Years of collective leadership & expertise</span>
                  </div>

                  <Link href={data.heroCta?.href || "/contact"} className="asx-btn-green">
                    Get a free quote
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ASSURIX SECTION 6: COMPREHENSIVE OUTLINE GRID (Service v4 Exact Replica) */}
        {/* ========================================================================= */}
        {descPairsBlock && (
          <section className="asx-section" style={{ borderTop: "1px solid #e5eaee" }}>
            <div className="asx-container">
              <div className="asx-section-header-center">
                <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#001d28", margin: "0 0 10px" }}>
                  {"Comprehensive " + data.crumb + " solutions tailored for you"}
                </h2>
                <p style={{ fontSize: "15px", color: "#2c436b", margin: 0 }}>
                  {descPairsBlock.desc || "End-to-end digital capabilities designed to generate patient inquiries and elevate brand trust."}
                </p>
              </div>

              <div className="asx-outline-marquee-wrap">
                <div className="asx-outline-marquee-track">
                  {/* Set 1 */}
                  {descPairsBlock.items.map((item, idx) => (
                    <div key={"orig-" + idx} className="asx-outline-card">
                      <div>
                        <div className="asx-icon-box">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                        </div>
                        <h3 className="asx-outline-title">{item.title}</h3>
                        <p className="asx-outline-desc">{item.desc}</p>
                      </div>

                      <div style={{ marginTop: "20px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                        <Link href="#contact" className="asx-arrow-link" style={{ fontSize: "12px" }}>
                          <span>Learn more</span>
                          <ArrowDownRightSvg size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}

                  {/* Set 2 (Duplicate for Seamless Infinite Loop) */}
                  {descPairsBlock.items.map((item, idx) => (
                    <div key={"dup-" + idx} className="asx-outline-card">
                      <div>
                        <div className="asx-icon-box">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                        </div>
                        <h3 className="asx-outline-title">{item.title}</h3>
                        <p className="asx-outline-desc">{item.desc}</p>
                      </div>

                      <div style={{ marginTop: "20px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                        <Link href="#contact" className="asx-arrow-link" style={{ fontSize: "12px" }}>
                          <span>Learn more</span>
                          <ArrowDownRightSvg size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* ASSURIX SECTION 7: WHO WE SERVE (Reference SS-2 3-Image Collage + Checklist Split Replica) */}
        {/* ========================================================================= */}
        {listBlock && (
          <section className="asx-who-split-section">
            <div className="asx-container">
              <div className="asx-who-split-grid">
                {/* Left Column: Reference SS-2 Exact 3 Shaped Overlapping Images Collage */}
                <div className="asx-collage-wrap">
                  {/* Right Main Tall Arch */}
                  <div className="asx-collage-tall-box">
                    <img
                      src={images.story}
                      alt={data.crumb + " practice"}
                      loading="lazy"
                    />
                  </div>

                  {/* Top-Left Overlapping Floating Circle with White Halo Border */}
                  <div className="asx-collage-circle-box">
                    <img
                      src={images.circle}
                      alt={data.crumb + " segment"}
                      loading="lazy"
                    />
                  </div>

                  {/* Bottom-Left Flush Arch Dome */}
                  <div className="asx-collage-dome-box">
                    <img
                      src={images.arch}
                      alt={data.crumb + " growth"}
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Right Column: Title, Subtitle, Bullets, Divider, Checkmarks, Schedule Button */}
                <div className="asx-who-content">
                  <h2 className="asx-who-title">
                    {"Affordable & scalable growth for every " + data.crumb.toLowerCase() + " stage"}
                  </h2>

                  <div className="asx-who-subtitle">
                    {data.crumb + " benefits"}
                  </div>

                  <ul className="asx-who-bullets">
                    {listBlock.items.slice(0, 5).map((item, idx) => (
                      <li key={idx} className="asx-who-bullet-item">
                        <span className="asx-who-bullet-dot" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <hr className="asx-who-divider" />

                  <div className="asx-who-checks">
                    <div className="asx-who-check-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>{listBlock.items[5] || "24/7 AI Triage & Direct Scheduling"}</span>
                    </div>
                    <div className="asx-who-check-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>{listBlock.items[6] || "Dedicated Growth Strategist Support"}</span>
                    </div>
                  </div>

                  <div>
                    <Link href="#contact" className="asx-btn-dark">
                      Schedule a call
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* ASSURIX SECTION 8: GROWTH PROCESS (Screenshots 2 & 3 Exact Replica) */}
        {/* ========================================================================= */}
        {processBlock && (
          <section className="asx-section" style={{ borderTop: "1px solid #e5eaee" }}>
            <div className="asx-container">
              <div className="asx-section-header-center">
                <h2 style={{ fontSize: "34px", fontWeight: 800, color: "#001d28", margin: "0 0 12px" }}>
                  {processBlock.title}
                </h2>
                <p style={{ fontSize: "15px", color: "#2c436b", margin: 0 }}>
                  A structured, transparent methodology delivering predictable outcomes.
                </p>
              </div>

              <div
                className="asx-process-grid"
                style={{
                  gridTemplateColumns: "repeat(" + processBlock.steps.length + ", minmax(0, 1fr))",
                }}
              >
                {processBlock.steps.map((step, idx) => {
                  const isSelected = activeStep === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveStep(idx)}
                      onMouseEnter={() => setActiveStep(idx)}
                      className={"asx-step-card " + (isSelected ? "is-active" : "")}
                    >
                      <span className="asx-step-badge">{step.num}</span>
                      <h3 className="asx-step-title">{step.title}</h3>
                      <p className="asx-step-desc">{step.desc || step.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* ASSURIX SECTION 9: FAQ ACCORDION (Service v7) */}
        {/* ========================================================================= */}
        {faqBlock && faqBlock.items && (
          <section className="asx-section" style={{ background: "#ffffff", borderTop: "1px solid #e5eaee" }}>
            <div className="asx-container-sm">
              <div className="asx-section-header-center">
                <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#001d28", margin: "0 0 10px" }}>
                  Frequently Asked Questions
                </h2>
                <p style={{ fontSize: "15px", color: "#2c436b", margin: 0 }}>
                  {"Everything you need to know about our " + data.crumb + " growth framework."}
                </p>
              </div>

              <div className="asx-faq-list">
                {faqBlock.items.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="asx-faq-item">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="asx-faq-q"
                      >
                        <span>{faq.q}</span>
                        <PlusCrossSvg isOpen={isOpen} size={18} />
                      </button>

                      {isOpen && (
                        <div className="asx-faq-a">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* ASSURIX SECTION 10: DARK MIDNIGHT CTA BANNER */}
        {/* ========================================================================= */}
        <section style={{ padding: "64px 24px" }}>
          <div className="asx-container">
            <div className="asx-cta-box">
              <h2 className="asx-cta-title">
                {"Ready to scale your "}<span>{data.crumb}</span>{" brand?"}
              </h2>

              <p className="asx-cta-desc">
                {data.closingDesc || "Get transparent execution, predictable patient inquiries, and reliable AI automation tailored for your growth."}
              </p>

              <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/contact" className="asx-btn-green" style={{ padding: "16px 36px", fontSize: "15px" }}>
                  {"Get Your " + data.crumb + " Quote"}
                </Link>

                <Link
                  href="https://calendly.com/qsaistudio/quickupp-ai-studio-30-min-strategy-call"
                  target="_blank"
                  rel="noreferrer"
                  className="asx-btn-outline"
                  style={{ padding: "16px 32px", fontSize: "15px" }}
                >
                  Book 30 min strategy call
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

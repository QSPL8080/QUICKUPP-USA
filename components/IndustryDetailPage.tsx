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

// Inline Clean SVG Components
function CheckSvg({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

function SparkleSvg({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}

// Clean & Simple Category Icon Resolver
function getCategoryIcon(name: string) {
  const n = name.toLowerCase();

  if (n.includes("legal")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18M3 7l9-4 9 4M3 7l3 9a3 3 0 0 0 6 0L9 7M15 7l3 9a3 3 0 0 0 6 0l-3-9" />
      </svg>
    );
  }
  if (n.includes("accounting") || n.includes("tax")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="16" y1="14" x2="16" y2="18" />
        <line x1="12" y1="14" x2="12" y2="18" />
        <line x1="8" y1="14" x2="8" y2="18" />
      </svg>
    );
  }
  if (n.includes("financial")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    );
  }
  if (n.includes("business")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    );
  }
  if (n.includes("management")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (n.includes("it consulting") || n.includes("it ")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
      </svg>
    );
  }
  if (n.includes("marketing") || n.includes("creative")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    );
  }
  if (n.includes("hr") || n.includes("recruitment")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
      </svg>
    );
  }
  if (n.includes("real estate")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2" />
      </svg>
    );
  }
  if (n.includes("architecture") || n.includes("design")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    );
  }
  if (n.includes("engineering") || n.includes("technical")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2" />
      </svg>
    );
  }
  if (n.includes("b2b") || n.includes("other")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }

  // Home Services
  if (n.includes("plumbing")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    );
  }
  if (n.includes("electrical")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    );
  }
  if (n.includes("hvac")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
      </svg>
    );
  }
  if (n.includes("cleaning")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21" />
      </svg>
    );
  }
  if (n.includes("roofing")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    );
  }
  if (n.includes("pest")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }

  return <CheckSvg size={14} />;
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

function renderGradientTitle(title: string) {
  if (!title) return null;
  const dotParts = title.split(". ").filter(Boolean);
  if (dotParts.length >= 2) {
    const splitIndex = Math.ceil(dotParts.length / 2);
    const firstHalf = dotParts.slice(0, splitIndex).join(". ") + (splitIndex < dotParts.length ? "." : "");
    const secondHalf = dotParts.slice(splitIndex).join(". ");
    return (
      <>
        <span>{firstHalf} </span>
        <span className="asx-gradient-text">{secondHalf}</span>
      </>
    );
  }
  const words = title.split(" ");
  if (words.length >= 4) {
    const mid = Math.ceil(words.length / 2);
    const firstHalf = words.slice(0, mid).join(" ");
    const secondHalf = words.slice(mid).join(" ");
    return (
      <>
        <span>{firstHalf} </span>
        <span className="asx-gradient-text">{secondHalf}</span>
      </>
    );
  }
  return title;
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
  const [activeStep, setActiveStep] = useState<number>(0);

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

  return (
    <div className="asx-page">
      <Header />

      <main style={{ paddingTop: "100px" }}>
        {/* ========================================================================= */}
        {/* 1. HERO SECTION */}
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
                  <span>{data.heroEyebrow || data.crumb}</span>
                </div>

                <h1 className="asx-hero-title">
                  {renderGradientTitle(data.heroTitle)}
                </h1>

                {data.heroParagraphs && data.heroParagraphs.map((p, idx) => (
                  <p key={idx} className="asx-hero-desc" style={idx > 0 ? { marginTop: "-16px" } : {}}>
                    {p}
                  </p>
                ))}

                <div className="asx-hero-btns">
                  <Link
                    href={data.heroCta?.href || "/contact"}
                    className="asx-btn-green"
                  >
                    {data.heroCta?.label || "Get Industry Strategy"}
                  </Link>

                  <a href="#services-section" className="asx-btn-outline">
                    <span>Explore Services</span>
                    <span style={{ fontSize: "14px" }}>↓</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Deep Teal Counter Card */}
              <div>
                <div className="asx-counter-card">
                  <div className="asx-counter-row">
                    <div className="asx-counter-val">
                      <span>120</span>
                      <span className="asx-counter-plus">+</span>
                    </div>
                    <div className="asx-counter-lbl">
                      Global Industry Clients & Partners
                    </div>
                  </div>

                  <div className="asx-counter-row">
                    <div className="asx-counter-val">
                      <span>98</span>
                      <span className="asx-counter-plus">%</span>
                    </div>
                    <div className="asx-counter-lbl">
                      Client Satisfaction & Retention
                    </div>
                  </div>

                  <div className="asx-counter-row">
                    <div className="asx-counter-val">
                      <span>200</span>
                      <span className="asx-counter-plus">+</span>
                    </div>
                    <div className="asx-counter-lbl">
                      Digital Growth Projects Delivered
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. CURVED HERO MEDIA BANNER */}
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
                  {"✦ " + (data.heroEyebrow || data.crumb) + " Growth"}
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
        {/* 3. DYNAMIC BLOCKS RENDERING */}
        {/* ========================================================================= */}
        {data.blocks.map((block, bIdx) => {
          if (block.type === "descPairs") {
            const descPairsBlock = block as DescPairsBlock;
            const isMarquee = descPairsBlock.items.length >= 8;
            return (
              <section key={bIdx} id={bIdx === 0 || bIdx === 2 ? "services-section" : undefined} className="asx-section" style={{ borderTop: "1px solid #e5eaee" }}>
                <div className="asx-container">
                  <div className="asx-section-header-center" style={{ maxWidth: "1050px", marginBottom: descPairsBlock.desc ? "20px" : "36px" }}>
                    <h2 className="asx-one-line-heading" style={{ fontSize: "clamp(18px, 1.8vw, 24px)", fontWeight: 800, color: "#001d28", margin: "0", letterSpacing: "-0.02em" }}>
                      {renderGradientTitle(descPairsBlock.title || ("Our " + data.crumb + " Marketing Services"))}
                    </h2>
                    {descPairsBlock.subtitle && (
                      <p style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#7c3aed", margin: "8px 0 0" }}>
                        {descPairsBlock.subtitle}
                      </p>
                    )}
                    {descPairsBlock.desc && (
                      <p style={{ fontSize: "15px", color: "#2c436b", margin: "10px auto 0", maxWidth: "680px" }}>
                        {descPairsBlock.desc}
                      </p>
                    )}
                  </div>

                  {isMarquee ? (
                    <div className="asx-outline-marquee-wrap">
                      <div className="asx-outline-marquee-track">
                        {/* Set 1 */}
                        {descPairsBlock.items.map((item, idx) => (
                          <div key={"orig-" + idx} className="asx-outline-card">
                            <div>
                              <div className="asx-icon-box">
                                <SparkleSvg size={20} />
                              </div>
                              <h3 className="asx-outline-title">{item.title}</h3>
                              <p className="asx-outline-desc">{item.desc}</p>
                            </div>

                            <div style={{ marginTop: "20px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                              <Link href="/contact" className="asx-arrow-link" style={{ fontSize: "12px" }}>
                                <span>Enquire now</span>
                                <ArrowDownRightSvg size={12} />
                              </Link>
                            </div>
                          </div>
                        ))}

                        {/* Set 2 (Duplicate for Seamless Loop) */}
                        {descPairsBlock.items.map((item, idx) => (
                          <div key={"dup-" + idx} className="asx-outline-card">
                            <div>
                              <div className="asx-icon-box">
                                <SparkleSvg size={20} />
                              </div>
                              <h3 className="asx-outline-title">{item.title}</h3>
                              <p className="asx-outline-desc">{item.desc}</p>
                            </div>

                            <div style={{ marginTop: "20px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                              <Link href="/contact" className="asx-arrow-link" style={{ fontSize: "12px" }}>
                                <span>Enquire now</span>
                                <ArrowDownRightSvg size={12} />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                      {descPairsBlock.items.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "18px",
                            padding: "26px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
                          }}
                        >
                          <div>
                            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(124, 58, 237, 0.08)", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                              <SparkleSvg size={20} />
                            </div>
                            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#001d28", margin: "0 0 10px", lineHeight: 1.3 }}>
                              {item.title}
                            </h3>
                            <p style={{ fontSize: "14.5px", color: "#2c436b", lineHeight: 1.6, margin: 0 }}>
                              {item.desc}
                            </p>
                          </div>

                          <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
                            <Link href="/contact" className="asx-arrow-link" style={{ fontSize: "13px" }}>
                              <span>Enquire now</span>
                              <ArrowDownRightSvg size={13} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {descPairsBlock.cta && (
                    <div style={{ marginTop: "36px", textAlign: "center" }}>
                      <Link href={descPairsBlock.cta.href || "/contact"} className="asx-btn-green">
                        {descPairsBlock.cta.label}
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            );
          }

          if (block.type === "list") {
            const listBlock = block as ListBlock;
            const isSplitCollage = bIdx === 0 || (listBlock.subtitle && listBlock.items.length <= 10 && listBlock.items[0]?.length > 25);

            if (isSplitCollage) {
              return (
                <section key={bIdx} className="asx-who-split-section" style={{ borderTop: "1px solid #e5eaee" }}>
                  <div className="asx-container">
                    <div className="asx-who-split-grid">
                      <div className="asx-collage-wrap">
                        <div className="asx-collage-tall-box">
                          <img src={images.story} alt={data.crumb + " practice"} loading="lazy" />
                        </div>
                        <div className="asx-collage-circle-box">
                          <img src={images.circle} alt={data.crumb + " segment"} loading="lazy" />
                        </div>
                        <div className="asx-collage-dome-box">
                          <img src={images.arch} alt={data.crumb + " growth"} loading="lazy" />
                        </div>
                      </div>

                      <div className="asx-who-content">
                        <h2 className="asx-who-title">
                          {renderGradientTitle(listBlock.title || (data.crumb + " Businesses We Help"))}
                        </h2>

                        {listBlock.subtitle && (
                          <div className="asx-who-subtitle">
                            {listBlock.subtitle}
                          </div>
                        )}

                        {listBlock.desc && (
                          <p style={{ fontSize: "15px", color: "#2c436b", margin: "0 0 20px" }}>
                            {listBlock.desc}
                          </p>
                        )}

                        <ul className="asx-who-bullets" style={{ marginTop: "20px" }}>
                          {listBlock.items.slice(0, listBlock.items.length > 2 ? listBlock.items.length - 2 : listBlock.items.length).map((item, idx) => (
                            <li key={idx} className="asx-who-bullet-item">
                              <span className="asx-who-bullet-dot" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>

                        {listBlock.items.length > 2 && (
                          <>
                            <hr className="asx-who-divider" />
                            <div className="asx-who-checks">
                              {listBlock.items.slice(listBlock.items.length - 2).map((item, idx) => (
                                <div key={idx} className="asx-who-check-item">
                                  <CheckSvg size={16} />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        <div style={{ marginTop: "24px" }}>
                          <Link href={listBlock.cta?.href || "/contact"} className="asx-btn-dark">
                            {listBlock.cta?.label || "Get Industry Strategy"}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );
            }

            // Clean, Proper, Elegant Grid Layout for List Blocks
            return (
              <section key={bIdx} className="asx-section" style={{ borderTop: "1px solid #e5eaee" }}>
                <div className="asx-container">
                  <div className="asx-section-header-center" style={{ maxWidth: "860px", marginBottom: "36px" }}>
                    {listBlock.tagline && (
                      <div className="asx-tag-pill" style={{ margin: "0 auto 12px" }}>
                        <span className="asx-tag-dot" />
                        <span>{listBlock.tagline}</span>
                      </div>
                    )}
                    <h2 style={{ fontSize: "clamp(18px, 1.8vw, 24px)", fontWeight: 800, color: "#001d28", margin: "0 0 10px" }}>
                      {renderGradientTitle(listBlock.title)}
                    </h2>
                    {listBlock.desc && (
                      <p style={{ fontSize: "15.5px", color: "#2c436b", lineHeight: 1.6, margin: 0 }}>
                        {listBlock.desc}
                      </p>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
                    {listBlock.items.map((item, idx) => {
                      const icon = getCategoryIcon(item);
                      return (
                        <div
                          key={idx}
                          className="asx-simple-card-item"
                          style={{
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "14px",
                            padding: "18px 22px",
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "10px",
                              background: "rgba(124, 58, 237, 0.08)",
                              color: "#7c3aed",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {icon}
                          </div>
                          <span style={{ fontSize: "15px", fontWeight: 600, color: "#001d28", lineHeight: 1.35 }}>
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {listBlock.cta && (
                    <div style={{ marginTop: "36px", textAlign: "center" }}>
                      <Link href={listBlock.cta.href || "/contact"} className="asx-btn-green">
                        {listBlock.cta.label}
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            );
          }

          if (block.type === "ai") {
            const aiBlock = block as AiBlock;
            return (
              <section key={bIdx} className="asx-section" style={{ borderTop: "1px solid #e5eaee" }}>
                <div className="asx-container">
                  <div className="asx-section-header-center" style={{ maxWidth: "860px" }}>
                    <h2 style={{ fontSize: "clamp(18px, 1.8vw, 24px)", fontWeight: 800, color: "#001d28", margin: "0 0 14px" }}>
                      {renderGradientTitle(aiBlock.title)}
                    </h2>
                    {aiBlock.intro && (
                      <p className="asx-section-intro" style={{ fontSize: "16px", color: "#2c436b", lineHeight: 1.65, whiteSpace: "pre-line", margin: 0 }}>
                        {aiBlock.intro}
                      </p>
                    )}
                  </div>

                  {aiBlock.bullets && aiBlock.bullets.length > 0 && (
                    <div className="asx-ecosystem-grid" style={{ marginTop: "36px" }}>
                      {aiBlock.bullets.map((pillar, idx) => (
                        <div key={idx} className="asx-ecosystem-card">
                          <span className="asx-ecosystem-badge">
                            {"0" + (idx + 1)}
                          </span>
                          <h3 className="asx-ecosystem-title">{pillar}</h3>
                        </div>
                      ))}
                    </div>
                  )}

                  {aiBlock.desc && (
                    <div className="asx-ecosystem-footer">
                      <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#001d28" }}>
                        {aiBlock.desc}
                      </p>
                    </div>
                  )}

                  {aiBlock.cta && (
                    <div style={{ marginTop: "32px", textAlign: "center" }}>
                      <Link href={aiBlock.cta.href || "/contact"} className="asx-btn-green">
                        {aiBlock.cta.label}
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            );
          }

          if (block.type === "whyChoose") {
            const whyChooseBlock = block as WhyChooseBlock;
            return (
              <section
                key={bIdx}
                ref={valPropRef}
                className={"asx-section " + (valPropVisible ? "asx-valprop-visible" : "")}
                style={{ borderTop: "1px solid #e5eaee" }}
              >
                <div className="asx-container">
                  <div className="asx-valprop-grid">
                    <div>
                      {whyChooseBlock.tagline && (
                        <div className="asx-tag-pill" style={{ marginBottom: "14px" }}>
                          <span className="asx-tag-dot" />
                          <span>{whyChooseBlock.tagline}</span>
                        </div>
                      )}

                      <h2 className="asx-valprop-title" style={{ margin: "0 0 20px" }}>
                        {renderGradientTitle(whyChooseBlock.title || "Why Choose Quickupp Softech?")}
                      </h2>

                      {whyChooseBlock.desc && (
                        <p className="asx-valprop-desc">
                          {whyChooseBlock.desc}
                        </p>
                      )}

                      <div className="asx-valprop-list" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px" }}>
                        {whyChooseBlock.bullets.map((bullet, idx) => (
                          <div key={idx} className="asx-valprop-item" style={{ marginBottom: 0 }}>
                            <div className="asx-valprop-check">
                              <CheckSvg size={14} />
                            </div>
                            <div>
                              <h4 className="asx-valprop-item-title" style={{ fontSize: "15.5px", fontWeight: 600, color: "#001d28" }}>{bullet}</h4>
                            </div>
                          </div>
                        ))}
                      </div>

                      {whyChooseBlock.cta && (
                        <div style={{ marginTop: "32px" }}>
                          <Link href={whyChooseBlock.cta.href || "/contact"} className="asx-btn-green">
                            {whyChooseBlock.cta.label}
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="asx-valprop-visual">
                      <img src={images.arch} alt={data.crumb + " growth"} className="asx-arch-img" loading="lazy" />
                      <img src={images.circle} alt={data.crumb + " expertise"} className="asx-circle-img" loading="lazy" />
                      <div className="asx-support-card">
                        <div className="asx-sup-title">Dedicated Growth Partner</div>
                        <div className="asx-sup-sub">Integrated Marketing + AI + Technology</div>

                        <div className="asx-sup-list">
                          <div className="asx-sup-row is-active">
                            <div className="asx-sup-person">
                              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#7c3aed", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>
                                QS
                              </div>
                              <div>
                                <div className="asx-sup-name">{data.crumb + " Strategist"}</div>
                                <div className="asx-sup-role" style={{ fontSize: "10px", color: "#64748b" }}>Growth Team</div>
                              </div>
                            </div>
                            <span style={{ color: "#7c3aed" }}><CheckSvg size={13} /></span>
                          </div>

                          <div className="asx-sup-row">
                            <div className="asx-sup-person">
                              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#001d28", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>
                                AI
                              </div>
                              <div>
                                <div className="asx-sup-name">AI Workflow Engineer</div>
                                <div className="asx-sup-role" style={{ fontSize: "10px", color: "#64748b" }}>Automation & Lead Routing</div>
                              </div>
                            </div>
                            <span style={{ color: "#94a3b8" }}><CheckSvg size={13} /></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          if (block.type === "process") {
            const processBlock = block as ProcessBlock;
            return (
              <section key={bIdx} className="asx-section" style={{ borderTop: "1px solid #e5eaee" }}>
                <div className="asx-container">
                  <div className="asx-section-header-center" style={{ marginBottom: "36px" }}>
                    {processBlock.tagline && (
                      <div className="asx-tag-pill" style={{ margin: "0 auto 12px" }}>
                        <span className="asx-tag-dot" />
                        <span>{processBlock.tagline}</span>
                      </div>
                    )}
                    <h2 style={{ fontSize: "clamp(18px, 1.8vw, 24px)", fontWeight: 800, color: "#001d28", margin: 0 }}>
                      {renderGradientTitle(processBlock.title)}
                    </h2>
                    {processBlock.intro && (
                      <p style={{ fontSize: "15px", color: "#2c436b", margin: "10px 0 0" }}>
                        {processBlock.intro}
                      </p>
                    )}
                  </div>

                  <div className="asx-process-grid">
                    {processBlock.steps.map((step, idx) => {
                      const isSelected = activeStep === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveStep(idx)}
                          className={"asx-step-card " + (isSelected ? "is-active" : "")}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="asx-step-header">
                            <span className="asx-step-badge">{step.num}</span>
                            <h3 className="asx-step-title">{step.title}</h3>
                          </div>
                          <p className="asx-step-desc">{step.desc || step.text}</p>
                        </div>
                      );
                    })}
                  </div>

                  {processBlock.cta && (
                    <div style={{ marginTop: "36px", textAlign: "center" }}>
                      <Link href={processBlock.cta.href || "/contact"} className="asx-btn-green">
                        {processBlock.cta.label}
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            );
          }

          if (block.type === "faq") {
            const faqBlock = block as FaqBlock;
            return (
              <section key={bIdx} className="asx-section" style={{ background: "#ffffff", borderTop: "1px solid #e5eaee" }}>
                <div className="asx-container-sm">
                  <div className="asx-section-header-center" style={{ marginBottom: "36px" }}>
                    <h2 style={{ fontSize: "clamp(18px, 1.8vw, 24px)", fontWeight: 800, color: "#001d28", margin: 0 }}>
                      {faqBlock.title || "Frequently Asked Questions"}
                    </h2>
                  </div>

                  <div className="asx-faq-list">
                    {faqBlock.items?.map((faq, idx) => {
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
            );
          }

          return null;
        })}

        {/* ========================================================================= */}
        {/* 4. CLOSING CTA BANNER */}
        {/* ========================================================================= */}
        <section style={{ padding: "64px 24px" }}>
          <div className="asx-container">
            <div className="asx-cta-box">
              <h2 className="asx-cta-title">
                {data.closingTitle ? renderGradientTitle(data.closingTitle) : (
                  <>
                    {"Ready to scale your "}
                    <span className="asx-gradient-text">{data.crumb}</span>
                    {" brand?"}
                  </>
                )}
              </h2>

              <p className="asx-cta-desc" style={{ whiteSpace: "pre-line" }}>
                {data.closingDesc}
              </p>

              <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
                {data.closingCtas?.map((cta, idx) => (
                  <Link
                    key={idx}
                    href={cta.href || "/contact"}
                    className={idx === 0 ? "asx-btn-green" : "asx-btn-outline"}
                    style={{ padding: "16px 36px", fontSize: "15px" }}
                  >
                    {cta.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

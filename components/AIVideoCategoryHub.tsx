"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { ServiceCategory } from "@/lib/servicesData";

interface VideoCapability {
  id: string;
  slug: string;
  title: string;
  category: string;
  type: string;
  turnaround: string;
  resolution: string;
  desc: string;
  tags: string[];
  features: string[];
  useCases: string[];
}

const videoCapabilitiesData: VideoCapability[] = [
  {
    id: "ai-avatar-video",
    slug: "ai-avatar-video",
    title: "AI Avatar Video Production",
    category: "AI Avatars",
    type: "Multilingual Presenter",
    turnaround: "24 - 48 Hours",
    resolution: "4K UHD / 60 FPS",
    desc: "Deploy lifelike, photorealistic AI presenters, spokespersons, and brand ambassadors across 120+ languages with zero physical studio or recording equipment.",
    tags: ["Photorealistic Lip-Sync", "120+ Languages", "Custom Attire", "Virtual Studios", "Micro-Expressions", "Voice Match"],
    features: [
      "Dynamic emotion and gaze tracking for genuine human connection.",
      "Instant script-to-video rendering in dozens of global languages with native accents.",
      "Custom branded virtual studio environments and motion graphics overlays.",
      "Automated batch generation for high-volume YouTube, LinkedIn, and training assets.",
    ],
    useCases: [
      "Corporate training & employee onboarding modules.",
      "Multilingual customer support and onboarding tutorials.",
      "Executive product explainers and brand announcements.",
      "Paid social advertisements on Meta, YouTube, and LinkedIn.",
    ],
  },
  {
    id: "ai-ugc-video",
    slug: "ai-ugc-video",
    title: "AI UGC Video (User-Generated Content)",
    category: "UGC & Ads",
    type: "High-Converting Ads",
    turnaround: "24 - 48 Hours",
    resolution: "1080p / 4K Vertical",
    desc: "Generate authentic, creator-style testimonial and review videos at scale for TikTok, Instagram Reels, and Meta Ads without hiring actors or scheduling shoots.",
    tags: ["TikTok Hooks", "Meta Ad Creative", "Viral Formatting", "Dynamic Captions", "Split-Testing", "E-commerce"],
    features: [
      "Diverse roster of relatable digital creators across various age groups and demographics.",
      "High-engagement viral hook generation tailored for 3-second ad retention.",
      "Trending dynamic captions with animated emojis and highlighted keywords.",
      "Rapid A/B testing matrix: create 20+ hook and angle variations in one run.",
    ],
    useCases: [
      "Direct-to-Consumer (D2C) and e-commerce product launches.",
      "High-ROAS Meta (Facebook/Instagram) paid ad campaigns.",
      "TikTok Spark Ads and organic Reels viral growth strategy.",
      "App store download campaigns and mobile game promotions.",
    ],
  },
  {
    id: "ai-hyper-realistic-video",
    slug: "ai-hyper-realistic-video",
    title: "AI Hyper-Realistic & Cinematic Video",
    category: "Cinematic",
    type: "Studio Cinematic",
    turnaround: "48 - 72 Hours",
    resolution: "4K Cinematic / Dolby",
    desc: "Create breathtaking, photorealistic visual worlds, cinematic product b-roll, and visual storytelling sequences that defy the budget limits of physical film sets.",
    tags: ["Cinematic Lighting", "3D Camera Motion", "Product B-Roll", "Surreal Worlds", "Dolby Sound", "VFX Compositing"],
    features: [
      "Unmatched cinematic lighting, depth-of-field, and physical particle simulation.",
      "Complex 3D camera sweeps, drone perspectives, and physics-accurate motion.",
      "Impossible product placements in futuristic, luxurious, or natural environments.",
      "Full orchestral sound design and spatial audio engineering.",
    ],
    useCases: [
      "Luxury brand storytelling and high-concept launch films.",
      "Futuristic tech and SaaS product vision trailers.",
      "Architectural and real-estate immersive concept fly-throughs.",
      "High-budget TV and digital billboard advertising visuals.",
    ],
  },
  {
    id: "digital-twin-clone-video",
    slug: "digital-twin-clone-video",
    title: "Digital Twin & Executive Clone Video",
    category: "Digital Twins",
    type: "Personal Identity Clone",
    turnaround: "Custom Pipeline",
    resolution: "4K Photorealistic",
    desc: "Capture your authentic likeness, voice nuances, and presentation style into a personal AI Digital Twin to produce executive thought-leadership videos in minutes.",
    tags: ["Voice Cloning", "Facial Geometry", "Executive Branding", "Zero Filming Time", "Thought Leadership", "Personalization"],
    features: [
      "High-fidelity voice cloning preserving your exact timbre, inflection, and cadence.",
      "Precision biometric facial capture matching your personal hand gestures and speech habits.",
      "Type a script or sync with AI agents to speak in your exact voice in 50+ languages.",
      "Enterprise security protocol with strict voice and likeness privacy protection.",
    ],
    useCases: [
      "Founder and CEO weekly thought-leadership videos on LinkedIn.",
      "Personalized VIP client video messages generated programmatically.",
      "Scalable video podcasting and educational course creation.",
      "Global internal communications for enterprise executives.",
    ],
  },
];

const videoPrinciples = [
  {
    num: "01",
    title: "Photorealistic Physics",
    desc: "Micro-expression mapping, realistic eye blinks, and natural lip synchronization that eliminate the uncanny valley.",
  },
  {
    num: "02",
    title: "Multi-Dialect Voice Cloning",
    desc: "Studio-grade neural speech synthesis in 120+ languages with authentic regional accents and emotional cadence.",
  },
  {
    num: "03",
    title: "Dynamic Script Adaptation",
    desc: "Algorithmic script structuring engineered for high retention, immediate hooks, and conversion-focused call-to-actions.",
  },
  {
    num: "04",
    title: "Rapid Batch Production",
    desc: "Render dozens of ad creatives, variations, and translations in 24 hours without scheduling studios or camera crews.",
  },
  {
    num: "05",
    title: "Brand-Aligned Custom Avatars",
    desc: "Tailor presenter wardrobe, studio backdrops, and brand colors to match your enterprise visual guidelines perfectly.",
  },
  {
    num: "06",
    title: "4K Ultra-HD Rendering",
    desc: "Crystal-clear high-definition video pipelines optimized for mobile feeds, desktop screens, and broadcast displays.",
  },
  {
    num: "07",
    title: "End-to-End Post Production",
    desc: "Burnt-in kinetic typography, sound effects, licensed background music, and motion graphics integrated seamlessly.",
  },
  {
    num: "08",
    title: "Automated Multilingual Dubbing",
    desc: "Effortlessly localize one video across Spanish, Japanese, German, Arabic, Hindi, and 50+ global languages.",
  },
  {
    num: "09",
    title: "Omnichannel Aspect Formats",
    desc: "Every video is delivered ready for vertical (9:16 Reels/TikTok), landscape (16:9 YouTube), and square (1:1 Feed).",
  },
];

const videoGallerySamples = [
  "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1576828831022-ae4189f50078?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
];

const videoTestimonials = [
  {
    quote: "Quickupp's AI Avatar videos cut our corporate training production costs by 75% while letting us deploy in 8 languages simultaneously within 48 hours.",
    name: "Elena Rostova",
    role: "Head of Talent Enablement • Global SaaS",
    avatar: "/images/team-img-01.jpg",
  },
  {
    quote: "The AI UGC creatives scaled our TikTok ROAS from 1.8x to 3.4x. We tested 30 hook variations in one week without hiring a single freelance creator.",
    name: "Jason Vance",
    role: "Growth Director • D2C Apparel Brand",
    avatar: "/images/team-img-02.jpg",
  },
  {
    quote: "My digital clone allows me to publish weekly high-production video newsletters on LinkedIn in my exact voice without spending hours setting up lights and cameras.",
    name: "Dr. Aris Thorne",
    role: "Managing Partner • HealthTech Ventures",
    avatar: "/images/team-img-03.jpg",
  },
];

const videoCategories = [
  "All Capabilities",
  "AI Avatars",
  "UGC & Ads",
  "Cinematic",
  "Digital Twins",
];

interface Props {
  category: ServiceCategory;
}

export default function AIVideoCategoryHub({ category }: Props) {
  const [activeCategory, setActiveCategory] = useState("All Capabilities");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCap, setSelectedCap] = useState<VideoCapability | null>(null);

  // Scroll highlight animation for Manifesto Text
  const manifestoRef = useRef<HTMLHeadingElement>(null);
  const [manifestoProgress, setManifestoProgress] = useState(0);

  const manifestoParagraph =
    "At Quickupp Softech, we transform scripts and ideas into studio-grade AI Avatar, UGC, and Clone videos with photorealistic lip-sync, zero filming friction, and global scale.";

  const manifestoWords = useMemo(() => manifestoParagraph.split(" "), [manifestoParagraph]);

  useEffect(() => {
    let ticking = false;
    const calculateProgress = () => {
      if (!manifestoRef.current) return;
      const rect = manifestoRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;

      const startY = windowH * 0.85;
      const endY = windowH * 0.35;
      const currentY = rect.top;

      let p = (startY - currentY) / (startY - endY);
      p = Math.max(0, Math.min(1, p));
      setManifestoProgress(p);
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    calculateProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const filteredCapabilities = useMemo(() => {
    return videoCapabilitiesData.filter((cap) => {
      const matchesCat =
        activeCategory === "All Capabilities" || cap.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        cap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cap.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cap.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="sc-career-page">
      <Header />

      {/* 1. MANIFESTO & CONTINUOUS PHOTO/VIDEO GALLERY STRIP */}
      <section className="sc-manifesto-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="sc-manifesto-center-wrap">
            <span className="sc-manifesto-badge">2026 • STUDIO-GRADE AI VIDEO PRODUCTION &amp; SYNTHESIS</span>
            <h2 ref={manifestoRef} className="sc-manifesto-text-center">
              {manifestoWords.map((word, idx) => {
                const wordThreshold = (idx + 0.3) / manifestoWords.length;
                const isRevealed = manifestoProgress >= wordThreshold;
                return (
                  <span
                    key={idx}
                    className={`sc-scroll-word ${isRevealed ? "is-revealed" : ""}`}
                  >
                    {word}
                  </span>
                );
              })}
            </h2>
          </div>

          {/* 4-Card Perks Grid */}
          <div className="sc-perks-grid">
            <div className="sc-perk-card">
              <div className="sc-perk-icon-wrap">🌐</div>
              <div className="sc-perk-title">120+ Languages</div>
              <p className="sc-perk-desc">Native accent voice synthesis and instant global localization.</p>
            </div>
            <div className="sc-perk-card">
              <div className="sc-perk-icon-wrap">⚡</div>
              <div className="sc-perk-title">24-48h Delivery</div>
              <p className="sc-perk-desc">Rapid turnaround for high-velocity marketing and ad tests.</p>
            </div>
            <div className="sc-perk-card">
              <div className="sc-perk-icon-wrap">🎥</div>
              <div className="sc-perk-title">Zero Studio Costs</div>
              <p className="sc-perk-desc">No actors, no equipment rentals, and zero physical shoot overhead.</p>
            </div>
            <div className="sc-perk-card">
              <div className="sc-perk-icon-wrap">✨</div>
              <div className="sc-perk-title">4K Cinematic Quality</div>
              <p className="sc-perk-desc">Flawless micro-expressions, lip-syncing, and post-production.</p>
            </div>
          </div>
        </div>

        {/* Continuous Video Gallery Strip */}
        <div className="sc-gallery-strip">
          <div className="sc-gallery-track">
            {videoGallerySamples.concat(videoGallerySamples).map((imgSrc, idx) => (
              <div key={idx} className="sc-gallery-card">
                <img src={imgSrc} alt="AI Video Production Showcase" className="sc-gallery-img" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. THE 9 CORE VALUES & PRODUCTION PRINCIPLES */}
      <section id="production-framework" className="sc-values-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="sc-section-header">
            <div className="sc-badge">
              <span className="sc-badge-dot" />
              <span>Production Standard</span>
            </div>
            <h2 className="sc-section-title">The Principles of AI Video Synthesis</h2>
            <p className="sc-section-desc">
              We combine cutting-edge generative video models with professional visual storytelling to deliver engaging, high-ROI video assets.
            </p>
          </div>

          <div className="sc-values-grid">
            {videoPrinciples.map((val, idx) => (
              <div key={idx} className="sc-value-card">
                <div className="sc-value-number">{val.num}</div>
                <div className="sc-value-title">{val.title}</div>
                <p className="sc-value-desc">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. WHY WE ARE THE RIGHT CHOICE (Split Showcase) */}
      <section className="sc-choice-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="sc-section-header">
            <div className="sc-badge">
              <span className="sc-badge-dot" />
              <span>Why Quickupp AI Video</span>
            </div>
            <h2 className="sc-section-title">Why Brands Choose Our Video Stack</h2>
            <p className="sc-section-desc">
              A specialized AI video pipeline built for performance marketing, global scaling, and frictionless content generation.
            </p>
          </div>

          <div className="sc-choice-grid">
            {/* Left Visual Card */}
            <div className="sc-choice-left-visual">
              <img
                src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80"
                alt="AI Video Production Studio"
                className="sc-choice-left-img"
              />
              <div className="sc-choice-badge-overlay">
                <div className="sc-choice-badge-title">Enterprise Video Velocity</div>
                <p className="sc-choice-badge-sub">Generating 1,000+ localized video variations monthly.</p>
              </div>
            </div>

            {/* Right 4-Card Feature Grid */}
            <div className="sc-choice-cards-grid">
              <div className="sc-choice-item-card">
                <div className="sc-choice-item-title">80% Production Cost Reduction</div>
                <p className="sc-choice-item-desc">
                  Eliminate traditional studio booking, talent agency fees, equipment rentals, and travel logistics.
                </p>
              </div>

              <div className="sc-choice-item-card">
                <div className="sc-choice-item-title">10x Creative Testing Velocity</div>
                <p className="sc-choice-item-desc">
                  Rapidly iterate hooks, scripts, and video formats to uncover top-performing advertising creatives.
                </p>
              </div>

              <div className="sc-choice-item-card">
                <div className="sc-choice-item-title">Biometrically Secure Clones</div>
                <p className="sc-choice-item-desc">
                  Strict enterprise privacy protocols ensure your personal likeness and voice models remain 100% confidential.
                </p>
              </div>

              <div className="sc-choice-item-card">
                <div className="sc-choice-item-title">Full Commercial Ownership</div>
                <p className="sc-choice-item-desc">
                  Perpetual global commercial licensing for all broadcast, social media, and digital advertising channels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EXPLORE AI VIDEO CAPABILITIES */}
      <section id="video-capabilities" className="sc-roles-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="sc-section-header">
            <div className="sc-badge">
              <span className="sc-badge-dot" />
              <span>Core Services ({videoCapabilitiesData.length})</span>
            </div>
            <h2 className="sc-section-title">Explore Our Video Capabilities</h2>
            <p className="sc-section-desc">
              Select a specialized video capability below or search for specific formats, avatars, and languages.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="sc-roles-filter-bar">
            {videoCategories.map((cat) => {
              const count =
                cat === "All Capabilities"
                  ? videoCapabilitiesData.length
                  : videoCapabilitiesData.filter((c) => c.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`sc-filter-btn ${activeCategory === cat ? "is-active" : ""}`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="sc-search-wrap">
            <svg className="sc-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search capabilities (e.g. Lip-Sync, UGC Ads, Clone, 4K, Multilingual)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sc-search-input"
            />
          </div>

          {/* Video Capabilities Listing */}
          <div className="sc-roles-list">
            {filteredCapabilities.map((cap) => (
              <div key={cap.id} className="sc-role-card">
                <div className="sc-role-left">
                  <div className="sc-role-top-meta">
                    <span className="sc-dept-badge">{cap.category}</span>
                    <span className="sc-role-meta-pill">{cap.type}</span>
                    <span className="sc-role-meta-pill">{cap.resolution}</span>
                    <span className="sc-role-salary-pill">⚡ {cap.turnaround}</span>
                  </div>

                  <h3 className="sc-role-title">{cap.title}</h3>
                  <p className="sc-role-desc">{cap.desc}</p>

                  <div className="sc-role-tags-wrap">
                    {cap.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="sc-role-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="sc-role-right-actions">
                  <button
                    type="button"
                    onClick={() => setSelectedCap(cap)}
                    className="sc-view-details-btn"
                  >
                    View Specs
                  </button>
                  <Link
                    href={`/services/ai-video-production/${cap.slug}`}
                    className="sc-apply-role-btn"
                  >
                    <span>Explore Service</span>
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                      <path d="M3.75 9L14.25 9M14.25 9L9 3.75M14.25 9L9 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CLIENT & CREATOR TESTIMONIALS */}
      <section className="sc-testimonials-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="sc-section-header">
            <div className="sc-badge">
              <span className="sc-badge-dot" />
              <span>Client Results</span>
            </div>
            <h2 className="sc-section-title">Trusted by Growth Leaders</h2>
            <p className="sc-section-desc">
              Discover how brands and founders scale their video presence and conversion ROAS with our AI video production pipeline.
            </p>
          </div>

          <div className="sc-testimonials-grid">
            {videoTestimonials.map((t, idx) => (
              <div key={idx} className="sc-testimonial-card">
                <div>
                  <div className="sc-stars-wrap">
                    {"★★★★★"}
                  </div>
                  <p className="sc-testimonial-quote">“{t.quote}”</p>
                </div>

                <div className="sc-author-row">
                  <img src={t.avatar} alt={t.name} className="sc-author-avatar" />
                  <div>
                    <div className="sc-author-name">{t.name}</div>
                    <div className="sc-author-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CINEMATIC PARALLAX REVEAL CTA BANNER */}
      <section className="su-cinematic-cta-section">
        <div className="su-cinematic-bg-media" />
        <div className="su-cinematic-dark-overlay" />
        <div className="w-layout-blockcontainer container w-container">
          <div className="su-cinematic-content">
            <p className="su-cinematic-sub">
              <span className="su-cinematic-sub-dot" /> Quickupp Softech® • AI Video Production
            </p>
            <h2 className="su-cinematic-heading">
              Ready to Produce Studio-Grade <span className="su-cinematic-heading-accent">AI Videos at Scale?</span>
            </h2>
            <div className="su-cinematic-action-wrap">
              <Link href="/contact" className="su-flip-button">
                <div className="su-flip-button-texts">
                  <div className="su-flip-button-text _01">Start Your Video Project</div>
                  <div className="su-flip-button-text _02">Start Your Video Project</div>
                </div>
                <div className="su-flip-arrow-box">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 18" fill="none" className="su-flip-arrow _01">
                    <path d="M3.75 9L14.25 9M14.25 9L9 3.75M14.25 9L9 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 18" fill="none" className="su-flip-arrow _02">
                    <path d="M3.75 9L14.25 9M14.25 9L9 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CAPABILITY DETAILS MODAL */}
      {selectedCap && (
        <div className="sc-modal-overlay" onClick={() => setSelectedCap(null)}>
          <div className="sc-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedCap(null)}
              className="sc-modal-close-btn"
              aria-label="Close Modal"
            >
              ✕
            </button>

            <div style={{ marginBottom: "16px" }}>
              <span className="sc-dept-badge" style={{ marginRight: "8px" }}>
                {selectedCap.category}
              </span>
              <span className="sc-role-salary-pill">⚡ {selectedCap.turnaround}</span>
            </div>

            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
              {selectedCap.title}
            </h2>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <span className="sc-role-meta-pill">{selectedCap.type}</span>
              <span className="sc-role-meta-pill">{selectedCap.resolution}</span>
            </div>

            <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, marginBottom: "20px" }}>
              {selectedCap.desc}
            </p>

            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
              Core Technical Features
            </h4>
            <ul style={{ paddingLeft: "20px", marginBottom: "20px", color: "#475569", fontSize: "13.5px", lineHeight: 1.6 }}>
              {selectedCap.features.map((r, i) => (
                <li key={i} style={{ marginBottom: "6px" }}>{r}</li>
              ))}
            </ul>

            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
              Ideal Use-Cases
            </h4>
            <ul style={{ paddingLeft: "20px", marginBottom: "24px", color: "#475569", fontSize: "13.5px", lineHeight: 1.6 }}>
              {selectedCap.useCases.map((req, i) => (
                <li key={i} style={{ marginBottom: "6px" }}>{req}</li>
              ))}
            </ul>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setSelectedCap(null)}
                className="sc-view-details-btn"
              >
                Close
              </button>
              <Link
                href={`/services/ai-video-production/${selectedCap.slug}`}
                className="sc-apply-role-btn"
              >
                View Service Page →
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

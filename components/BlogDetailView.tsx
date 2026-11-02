"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LucideIcon from "@/components/LucideIcon";
import ResourceCtaBanner from "@/components/ResourceCtaBanner";
import "@/app/blog-detail.css";

export interface BlogSection {
  heading: string;
  paragraphs: string[];
}

export interface BlogPostDetail {
  slug: string;
  category: string;
  date: string;
  title: string;
  desc: string;
  author: string;
  authorRole: string;
  readTime: string;
  img: string;
  content: {
    intro: string;
    keyTakeaways: string[];
    sections: BlogSection[];
    conclusion: string;
  };
}

function cleanText(str: string): string {
  if (!str) return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function parseSectionHeading(heading: string, index: number) {
  const cleaned = cleanText(heading).trim();
  const match = cleaned.match(/^(\d+)[\.\)]\s*(.*)$/);
  if (match) {
    const num = String(match[1]).padStart(2, "0");
    return { num, title: match[2] };
  }
  return { num: String(index + 1).padStart(2, "0"), title: cleaned };
}

interface ParsedParagraph {
  type: "prose" | "intro" | "feature" | "bullet";
  title?: string;
  text: string;
}

function parseParagraphs(paragraphs: string[]): ParsedParagraph[] {
  const result: ParsedParagraph[] = [];
  let inListContext = false;

  for (let i = 0; i < paragraphs.length; i++) {
    const raw = cleanText(paragraphs[i]).trim();
    if (!raw) continue;

    // Check if this paragraph ends with a colon introducing a list
    if (raw.endsWith(":") && raw.length < 120) {
      result.push({ type: "intro", text: raw });
      inListContext = true;
      continue;
    }

    // Check for "Key: Value" feature pattern
    const colonIdx = raw.indexOf(":");
    if (colonIdx > 2 && colonIdx < 50 && raw.length > colonIdx + 5) {
      const title = raw.substring(0, colonIdx).trim();
      const text = raw.substring(colonIdx + 1).trim();
      // Ensure title looks like a label (not a full sentence ending in colon)
      if (!title.includes(".") && title.split(" ").length <= 7) {
        result.push({ type: "feature", title, text });
        continue;
      }
    }

    // If we're inside a list context and sentence is short or bullet-like
    if (inListContext) {
      // Long narrative paragraphs (e.g. > 180 chars or 2+ sentences) exit list context
      const sentenceCount = (raw.match(/\.\s/g) || []).length;
      if (raw.length > 200 || sentenceCount >= 2) {
        inListContext = false;
        result.push({ type: "prose", text: raw });
      } else {
        result.push({ type: "bullet", text: raw });
      }
      continue;
    }

    // Regular prose paragraph
    result.push({ type: "prose", text: raw });
  }

  return result;
}

export default function BlogDetailView({
  post,
  relatedPosts,
}: {
  post: BlogPostDetail;
  relatedPosts: BlogPostDetail[];
}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<"yes" | "no" | null>(null);

  // Track scroll reading progress & active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0) {
        const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
        setScrollProgress(progress);
      }

      // Check which section is in view
      const sectionElements = post.content.sections.map((_, idx) =>
        document.getElementById(`section-${idx}`)
      );

      const scrollPos = window.scrollY + 160;
      let currentActive = 0;
      for (let i = 0; i < sectionElements.length; i++) {
        const el = sectionElements[i];
        if (el && el.offsetTop <= scrollPos) {
          currentActive = i;
        }
      }
      setActiveSection(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [post.content.sections]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareUrl = typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "";
  const shareTitle = encodeURIComponent(cleanText(post.title));

  return (
    <div className="bd-article-page">
      {/* Top Reading Progress Bar */}
      <div
        className="bd-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
        aria-hidden="true"
      />

      <div className="bd-hero-ambient" />

      {/* Main Container */}
      <div className="bd-container">
        {/* Article Hero */}
        <section className="bd-hero">
          <div className="bd-hero-top">
            <div className="bd-breadcrumbs">
              <Link href="/">Home</Link>
              <span className="bd-breadcrumbs-sep">/</span>
              <Link href="/resources">Resources</Link>
              <span className="bd-breadcrumbs-sep">/</span>
              <Link href="/blog">Blogs</Link>
              <span className="bd-breadcrumbs-sep">/</span>
              <span className="bd-breadcrumbs-current">{cleanText(post.title)}</span>
            </div>

            <Link href="/blog" className="bd-back-btn">
              <span style={{ transform: "rotate(180deg)", display: "inline-flex" }}>
                <LucideIcon name="arrow-right" size={14} />
              </span>
              <span>All Articles</span>
            </Link>
          </div>

          <div className="bd-category-pill">
            <span className="bd-category-dot" />
            <span>{cleanText(post.category)}</span>
          </div>

          <h1 className="bd-title">
            {cleanText(post.title)}
          </h1>

          <p className="bd-lead-desc">
            {cleanText(post.desc)}
          </p>

          {/* Meta & Social Actions Bar */}
          <div className="bd-meta-bar">
            <div className="bd-author-block">
              <img
                src="/images/home-two-about-p-500.jpg"
                alt={post.author}
                className="bd-author-avatar"
              />
              <div>
                <div className="bd-author-name">{cleanText(post.author)}</div>
                <div className="bd-author-role">{cleanText(post.authorRole)}</div>
              </div>
            </div>

            <div className="bd-article-stats">
              <div className="bd-stat-item">
                <LucideIcon name="book-open" size={15} />
                <span>{cleanText(post.readTime)}</span>
              </div>
              <span>•</span>
              <div className="bd-stat-item">
                <LucideIcon name="target" size={15} />
                <span>{cleanText(post.date)}</span>
              </div>
            </div>

            <div className="bd-share-cluster">
              <button
                type="button"
                onClick={handleCopyLink}
                className={`bd-copy-btn ${copied ? "is-copied" : ""}`}
                title="Copy Article Link"
              >
                <LucideIcon name={copied ? "check" : "share-2"} size={14} />
                <span>{copied ? "Copied!" : "Share Link"}</span>
              </button>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bd-share-btn"
                title="Share on LinkedIn"
                aria-label="Share on LinkedIn"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.95 0-1.72-.78-1.72-1.73s.77-1.72 1.72-1.72c.95 0 1.72.77 1.72 1.72s-.77 1.73-1.72 1.73m1.4 9.74v-8.37H5.06v8.37h2.8Z"/>
                </svg>
              </a>

              <a
                href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bd-share-btn"
                title="Share via WhatsApp"
                aria-label="Share via WhatsApp"
              >
                <LucideIcon name="smartphone" size={16} />
              </a>
            </div>
          </div>

          {/* High-Impact Featured Media */}
          <div className="bd-featured-media">
            <img src={post.img} alt={cleanText(post.title)} />
            <div className="bd-featured-overlay">
              <span className="bd-featured-caption">Quickupp Softech Strategic Insights • {cleanText(post.category)}</span>
              <span className="bd-featured-caption">Verified Editorial Guide</span>
            </div>
          </div>
        </section>

        {/* 2-Column Editorial Grid */}
        <div className="bd-main-grid">
          {/* Main Article Body (Left Column) */}
          <main className="bd-content-col">
            {/* Introduction Lead */}
            <div className="bd-intro-card">
              <p className="bd-intro-text">
                {cleanText(post.content.intro)}
              </p>
            </div>

            {/* Key Takeaways Highlight Box */}
            {post.content.keyTakeaways && post.content.keyTakeaways.length > 0 && (
              <div className="bd-takeaways-card">
                <div className="bd-takeaways-kicker">
                  <LucideIcon name="sparkles" size={13} />
                  <span>EXECUTIVE BRIEFING</span>
                </div>
                <h2 className="bd-takeaways-title">Key Takeaways &amp; Strategic Insights</h2>
                <ul className="bd-takeaways-list">
                  {post.content.keyTakeaways.map((takeaway, tIdx) => (
                    <li key={tIdx} className="bd-takeaway-item">
                      <div className="bd-takeaway-icon">
                        <LucideIcon name="check" size={13} />
                      </div>
                      <span>{cleanText(takeaway)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Article Sections Stream */}
            <div className="bd-sections-stream">
              {post.content.sections.map((sec, sIdx) => {
                const parsedHeader = parseSectionHeading(sec.heading, sIdx);
                const parsedParas = parseParagraphs(sec.paragraphs);

                return (
                  <article
                    key={sIdx}
                    id={`section-${sIdx}`}
                    className="bd-section-block"
                  >
                    <header className="bd-section-header">
                      <div className="bd-section-badge">
                        <span>SECTION {parsedHeader.num}</span>
                      </div>
                      <h2 className="bd-section-title">
                        {parsedHeader.title}
                      </h2>
                    </header>

                    <div className="bd-section-body">
                      {parsedParas.map((item, pIdx) => {
                        if (item.type === "intro") {
                          return (
                            <div key={pIdx} className="bd-list-intro">
                              <span>{item.text}</span>
                            </div>
                          );
                        }

                        if (item.type === "feature") {
                          return (
                            <div key={pIdx} className="bd-feature-card">
                              <div className="bd-feature-card-title">
                                <span className="bd-feature-dot" />
                                <span>{item.title}</span>
                              </div>
                              <p className="bd-feature-card-desc">{item.text}</p>
                            </div>
                          );
                        }

                        if (item.type === "bullet") {
                          return (
                            <div key={pIdx} className="bd-bullet-card">
                              <div className="bd-bullet-check">
                                <LucideIcon name="check" size={12} />
                              </div>
                              <span>{item.text}</span>
                            </div>
                          );
                        }

                        return (
                          <p key={pIdx} className="bd-prose-p">
                            {item.text}
                          </p>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Strategic Conclusion */}
            {post.content.conclusion && (
              <div className="bd-conclusion-box">
                <div className="bd-conclusion-glow" />
                <div className="bd-conclusion-kicker">
                  <LucideIcon name="sparkles" size={13} />
                  <span>THE STRATEGIC BOTTOM LINE</span>
                </div>
                <h3 className="bd-conclusion-title">Conclusion &amp; Recommended Next Steps</h3>
                <p className="bd-conclusion-text">
                  {cleanText(post.content.conclusion)}
                </p>
                <div className="bd-conclusion-cta-row">
                  <Link href="/contact" className="bd-conclusion-btn">
                    <span>Discuss Your Growth Plan</span>
                    <LucideIcon name="arrow-right" size={14} />
                  </Link>
                  <Link
                    href="/case-studies"
                    style={{
                      color: "#94a3b8",
                      fontSize: "13.5px",
                      textDecoration: "underline",
                      fontWeight: 600,
                    }}
                  >
                    View Real Case Studies
                  </Link>
                </div>
              </div>
            )}

            {/* Author Credibility Box */}
            <div className="bd-author-card">
              <img
                src="/images/home-two-about-p-500.jpg"
                alt={post.author}
                className="bd-author-card-avatar"
              />
              <div>
                <div className="bd-author-card-name">{cleanText(post.author)}</div>
                <div className="bd-author-card-title">{cleanText(post.authorRole)} • Quickupp Editorial Team</div>
                <p className="bd-author-card-bio">
                  Specializing in enterprise AI automation, performance paid acquisition, and scalable full-stack engineering for businesses expanding across the United States.
                </p>
              </div>
            </div>

            {/* Interactive Helpful Feedback */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                flexWrap: "wrap",
                gap: "14px",
              }}
            >
              <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#0f172a" }}>
                Did you find this strategic guide helpful?
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {feedbackGiven ? (
                  <span style={{ fontSize: "13.5px", color: "#10b981", fontWeight: 700 }}>
                    ✓ Thank you for your feedback!
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setFeedbackGiven("yes")}
                      style={{
                        padding: "8px 16px",
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#0f172a",
                        cursor: "pointer",
                      }}
                    >
                      👍 Yes, very helpful
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackGiven("no")}
                      style={{
                        padding: "8px 16px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        fontSize: "13px",
                        color: "#64748b",
                        cursor: "pointer",
                      }}
                    >
                      Needs more detail
                    </button>
                  </>
                )}
              </div>
            </div>
          </main>

          {/* Sticky Companion Sidebar (Right Column) */}
          <aside className="bd-sidebar-col">
            <div className="bd-sidebar">
              {/* Table of Contents */}
              <div className="bd-sidebar-card">
                <div className="bd-sidebar-head">
                  <div className="bd-sidebar-title">
                    <LucideIcon name="book-open" size={15} />
                    <span>In This Guide</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                    {post.content.sections.length} Sections
                  </span>
                </div>

                <nav className="bd-toc-nav" aria-label="Table of Contents">
                  {post.content.sections.map((sec, idx) => {
                    const parsed = parseSectionHeading(sec.heading, idx);
                    const isActive = activeSection === idx;

                    return (
                      <a
                        key={idx}
                        href={`#section-${idx}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById(`section-${idx}`);
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                        className={`bd-toc-item ${isActive ? "is-active" : ""}`}
                      >
                        <span className="bd-toc-num">{parsed.num}</span>
                        <span style={{ flex: 1 }}>{parsed.title}</span>
                      </a>
                    );
                  })}
                </nav>
              </div>

              {/* Conversion Strategy Call Card */}
              <div className="bd-sidebar-cta">
                <div className="bd-sidebar-cta-kicker">GROWTH CONSULTATION</div>
                <h3 className="bd-sidebar-cta-title">Want to implement these strategies?</h3>
                <p className="bd-sidebar-cta-desc">
                  Our digital marketing and AI engineers build end-to-end acquisition systems tailored to your industry.
                </p>
                <Link href="/contact" className="bd-sidebar-cta-btn">
                  <span>Schedule Strategy Call</span>
                  <LucideIcon name="arrow-right" size={14} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Articles Grid */}
      <section className="bd-related-section">
        <div className="bd-container">
          <div className="bd-related-head">
            <div className="bd-category-pill" style={{ margin: "0 auto 12px" }}>
              <span className="bd-category-dot" />
              <span>CONTINUE READING</span>
            </div>
            <h2 className="bd-related-title">
              Related Articles &amp; Insights
            </h2>
          </div>

          <div className="res-grid-3">
            {relatedPosts.map((rPost, rIdx) => (
              <Link key={rIdx} href={`/blog/${rPost.slug}`} className="res-card">
                <div className="res-card-img-wrap">
                  <img src={rPost.img} alt={cleanText(rPost.title)} className="res-card-img" />
                  <div className="res-card-pill">
                    <span className="res-card-pill-dot" />
                    {cleanText(rPost.category)}
                  </div>
                </div>
                <div className="res-card-meta">
                  {cleanText(rPost.date)} • {cleanText(rPost.readTime)}
                </div>
                <h3 className="res-card-title">{cleanText(rPost.title)}</h3>
                <p className="res-card-desc">{cleanText(rPost.desc)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <ResourceCtaBanner
        tag="NEXT STEPS"
        title="Ready to Scale Your Brand Presence?"
        titleAccent="Let's Build It"
        primaryHref="/contact"
        primaryLabel="Schedule Strategy Call"
        secondaryHref="/case-studies"
        secondaryLabel="Explore Case Studies"
      />
    </div>
  );
}

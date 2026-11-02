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

type ContentBlock =
  | { type: "prose"; text: string }
  | { type: "intro"; text: string }
  | { type: "list"; items: { title?: string; text: string }[] };

function parseSectionBlocks(paragraphs: string[]): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let currentList: { title?: string; text: string }[] | null = null;
  let expectingList = false;

  for (let i = 0; i < paragraphs.length; i++) {
    const raw = cleanText(paragraphs[i]).trim();
    if (!raw) continue;

    // Check if this is a lead-in sentence ending in a colon
    if (raw.endsWith(":") && raw.length < 140) {
      if (currentList && currentList.length > 0) {
        blocks.push({ type: "list", items: currentList });
        currentList = null;
      }
      blocks.push({ type: "intro", text: raw });
      expectingList = true;
      continue;
    }

    // Check for "Key: Value" pattern (e.g. "Location targeting: Piercing through...")
    const colonIdx = raw.indexOf(":");
    const hasKeyVal =
      colonIdx > 2 &&
      colonIdx < 60 &&
      raw.length > colonIdx + 4 &&
      !raw.substring(0, colonIdx).includes(".") &&
      raw.substring(0, colonIdx).split(" ").length <= 8;

    if (hasKeyVal) {
      const title = raw.substring(0, colonIdx).trim();
      const text = raw.substring(colonIdx + 1).trim();
      if (!currentList) currentList = [];
      currentList.push({ title, text });
      expectingList = true;
      continue;
    }

    // If we are expecting list items after a lead-in:
    if (expectingList) {
      // Sentences that are clearly narrative paragraphs (long or multiple sentences) exit list mode
      const isLongProse = raw.length > 200 || (raw.match(/\.\s/g) || []).length >= 2;
      if (isLongProse) {
        if (currentList && currentList.length > 0) {
          blocks.push({ type: "list", items: currentList });
          currentList = null;
        }
        expectingList = false;
        blocks.push({ type: "prose", text: raw });
      } else {
        if (!currentList) currentList = [];
        currentList.push({ text: raw });
      }
      continue;
    }

    // Regular prose paragraph
    if (currentList && currentList.length > 0) {
      blocks.push({ type: "list", items: currentList });
      currentList = null;
    }
    blocks.push({ type: "prose", text: raw });
  }

  if (currentList && currentList.length > 0) {
    blocks.push({ type: "list", items: currentList });
  }

  return blocks;
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

          {/* Featured Media */}
          <div className="bd-featured-media">
            <img src={post.img} alt={cleanText(post.title)} />
          </div>
        </section>

        {/* 2-Column Natural Editorial Layout */}
        <div className="bd-main-grid">
          {/* Main Article Body (Left Column) */}
          <main className="bd-content-col">
            {/* Introduction Lead */}
            <p className="bd-intro-lead">
              {cleanText(post.content.intro)}
            </p>

            {/* Key Takeaways Highlight Box (Clean Single Callout) */}
            {post.content.keyTakeaways && post.content.keyTakeaways.length > 0 && (
              <div className="bd-takeaways-box">
                <div className="bd-takeaways-kicker">
                  <LucideIcon name="sparkles" size={13} />
                  <span>KEY TAKEAWAYS</span>
                </div>
                <h2 className="bd-takeaways-title">Strategic Summary</h2>
                <ul className="bd-takeaways-list">
                  {post.content.keyTakeaways.map((takeaway, tIdx) => (
                    <li key={tIdx} className="bd-takeaway-item">
                      <span className="bd-takeaway-icon">
                        <LucideIcon name="check" size={16} />
                      </span>
                      <span>{cleanText(takeaway)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Article Sections Stream (NATURAL, NO CARDS) */}
            <div className="bd-sections-stream">
              {post.content.sections.map((sec, sIdx) => {
                const blocks = parseSectionBlocks(sec.paragraphs);

                return (
                  <article
                    key={sIdx}
                    id={`section-${sIdx}`}
                    className="bd-article-section"
                  >
                    <h2 className="bd-section-title">
                      {cleanText(sec.heading)}
                    </h2>

                    <div>
                      {blocks.map((block, bIdx) => {
                        if (block.type === "intro") {
                          return (
                            <p key={bIdx} className="bd-article-intro-p">
                              {block.text}
                            </p>
                          );
                        }

                        if (block.type === "list") {
                          return (
                            <ul key={bIdx} className="bd-article-list">
                              {block.items.map((item, iIdx) => (
                                <li key={iIdx} className="bd-article-li">
                                  {item.title ? (
                                    <>
                                      <strong className="bd-li-title">{item.title}:</strong>{" "}
                                      <span className="bd-li-desc">{item.text}</span>
                                    </>
                                  ) : (
                                    <span className="bd-li-desc">{item.text}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          );
                        }

                        return (
                          <p key={bIdx} className="bd-article-p">
                            {block.text}
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
                <div className="bd-conclusion-kicker">
                  <LucideIcon name="sparkles" size={13} />
                  <span>FINAL THOUGHTS</span>
                </div>
                <h3 className="bd-conclusion-title">Conclusion</h3>
                <p className="bd-conclusion-text">
                  {cleanText(post.content.conclusion)}
                </p>
                <div className="bd-conclusion-cta-row">
                  <Link href="/contact" className="bd-conclusion-btn">
                    <span>Discuss Your Strategy</span>
                    <LucideIcon name="arrow-right" size={14} />
                  </Link>
                  <Link
                    href="/case-studies"
                    style={{
                      color: "#475569",
                      fontSize: "13.5px",
                      textDecoration: "underline",
                      fontWeight: 600,
                    }}
                  >
                    Explore Case Studies
                  </Link>
                </div>
              </div>
            )}

            {/* Author Row */}
            <div className="bd-author-card">
              <img
                src="/images/home-two-about-p-500.jpg"
                alt={post.author}
                className="bd-author-card-avatar"
              />
              <div>
                <div className="bd-author-card-name">{cleanText(post.author)}</div>
                <div className="bd-author-card-title">{cleanText(post.authorRole)}</div>
                <p className="bd-author-card-bio">
                  Quickupp Softech digital growth and engineering team, sharing insights on SEO, AI automation, and scalable marketing architectures.
                </p>
              </div>
            </div>

            {/* Reader Feedback */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                flexWrap: "wrap",
                gap: "12px",
                margin: "24px 0 40px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 650, color: "#0f172a" }}>
                Was this guide helpful?
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {feedbackGiven ? (
                  <span style={{ fontSize: "13px", color: "#10b981", fontWeight: 700 }}>
                    ✓ Thanks for your feedback!
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setFeedbackGiven("yes")}
                      style={{
                        padding: "6px 14px",
                        background: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        color: "#0f172a",
                        cursor: "pointer",
                      }}
                    >
                      👍 Yes, helpful
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackGiven("no")}
                      style={{
                        padding: "6px 14px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "12.5px",
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
                    <LucideIcon name="book-open" size={14} />
                    <span>In This Article</span>
                  </div>
                  <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>
                    {post.content.sections.length} Sections
                  </span>
                </div>

                <nav className="bd-toc-nav" aria-label="Table of Contents">
                  {post.content.sections.map((sec, idx) => {
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
                        <span className="bd-toc-num">{String(idx + 1).padStart(2, "0")}</span>
                        <span style={{ flex: 1 }}>{cleanText(sec.heading).replace(/^\d+[\.\)]\s*/, "")}</span>
                      </a>
                    );
                  })}
                </nav>
              </div>

              {/* Conversion Strategy Card */}
              <div className="bd-sidebar-cta">
                <div className="bd-sidebar-cta-kicker">GROWTH STRATEGY</div>
                <h3 className="bd-sidebar-cta-title">Want to scale this in your business?</h3>
                <p className="bd-sidebar-cta-desc">
                  Our growth strategists build custom digital marketing and automation systems for your team.
                </p>
                <Link href="/contact" className="bd-sidebar-cta-btn">
                  <span>Talk to an Expert</span>
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
            <div className="bd-category-pill" style={{ margin: "0 auto 10px" }}>
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

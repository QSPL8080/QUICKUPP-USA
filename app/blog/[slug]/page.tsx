import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResourceCtaBanner from "@/components/ResourceCtaBanner";
import { blogPosts } from "@/data/blogs";

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Blog Article | Quickupp Softech" };

  return {
    title: `${post.title} | Quickupp Softech Blog`,
    description: post.desc,
  };
}

function renderGradientHeading(text?: string) {
  if (!text) return null;
  const words = text.split(" ");
  if (words.length <= 2) {
    return <span className="qs-gradient-text">{text}</span>;
  }
  const splitIndex = Math.ceil(words.length / 2);
  const firstHalf = words.slice(0, splitIndex).join(" ");
  const secondHalf = words.slice(splitIndex).join(" ");

  return (
    <>
      {firstHalf} <span className="qs-gradient-text">{secondHalf}</span>
    </>
  );
}

export default async function SingleBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="res-page-wrap">
      <Header />

      {/* Article Header & Meta */}
      <section style={{ padding: "48px 0 32px" }}>
        <div className="res-container" style={{ maxWidth: "1060px" }}>
          <div style={{ marginBottom: "20px" }}>
            <Link
              href="/blog"
              style={{
                fontSize: "13.5px",
                fontWeight: 700,
                color: "#64748b",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              ← Back to All Articles
            </Link>
          </div>

          <div className="res-tag">
            <span className="res-tag-dot"></span>
            {post.category}
          </div>

          <h1
            style={{
              fontSize: "clamp(30px, 3.8vw, 46px)",
              fontWeight: 800,
              lineHeight: 1.2,
              color: "#0f172a",
              margin: "12px 0 20px 0",
              letterSpacing: "-0.02em",
            }}
          >
            {renderGradientHeading(post.title)}
          </h1>

          <p
            style={{
              fontSize: "18px",
              lineHeight: "1.65",
              color: "#475569",
              margin: "0 0 28px 0",
            }}
          >
            {post.desc}
          </p>

          <div className="res-author-row" style={{ paddingBottom: "24px", borderBottom: "1px solid #e2e8f0" }}>
            <img
              src="/images/home-two-about-p-500.jpg"
              alt={post.author}
              className="res-author-avatar"
            />
            <div className="res-author-info">
              <div className="res-author-name">{post.author}</div>
              <div className="res-author-meta">
                {post.authorRole} • {post.date} • {post.readTime}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article Image */}
      <section style={{ padding: "0 0 40px" }}>
        <div className="res-container" style={{ maxWidth: "1060px" }}>
          <div
            style={{
              borderRadius: "24px",
              overflow: "hidden",
              aspectRatio: "16/9",
              boxShadow: "0 16px 36px -8px rgba(15, 23, 42, 0.08)",
            }}
          >
            <img
              src={post.img}
              alt={post.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        </div>
      </section>

      {/* Article Body Content */}
      <section style={{ padding: "0 0 60px" }}>
        <div className="res-container" style={{ maxWidth: "940px" }}>
          {/* Article Introduction */}
          <div style={{ marginBottom: "36px" }}>
            <p
              style={{
                fontSize: "18.5px",
                lineHeight: "1.8",
                color: "#1e293b",
                fontWeight: 500,
              }}
            >
              {post.content.intro}
            </p>
          </div>

          {/* Key Takeaways Highlight Box */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderLeft: "4px solid #7c3aed",
              borderRadius: "16px",
              padding: "28px 24px",
              marginBottom: "44px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#7c3aed",
                marginBottom: "8px",
              }}
            >
              EXECUTIVE SUMMARY
            </div>
            <h3 style={{ fontSize: "19px", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>
              Key Takeaways
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {post.content.keyTakeaways.map((item, idx) => (
                <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "15px", color: "#1e293b", lineHeight: "1.6" }}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0, marginTop: "3px" }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Article Body Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: "36px", marginBottom: "48px" }}>
            {post.content.sections.map((sec, sIdx) => (
              <div key={sIdx}>
                <h2
                  style={{
                    fontSize: "clamp(22px, 2.6vw, 28px)",
                    fontWeight: 800,
                    color: "#0f172a",
                    marginBottom: "16px",
                    lineHeight: 1.3,
                  }}
                >
                  {sec.heading}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {sec.paragraphs.map((para, pIdx) => (
                    <p
                      key={pIdx}
                      style={{
                        fontSize: "16.5px",
                        lineHeight: "1.8",
                        color: "#475569",
                      }}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Conclusion */}
          <div
            style={{
              background: "#f1f5f9",
              borderLeft: "4px solid #0f172a",
              borderRadius: "0 16px 16px 0",
              padding: "24px 28px",
              marginBottom: "56px",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "8px" }}>
              FINAL THOUGHTS
            </div>
            <p style={{ fontSize: "16px", lineHeight: "1.75", color: "#0f172a", fontWeight: 600, margin: 0 }}>
              {post.content.conclusion}
            </p>
          </div>
        </div>
      </section>

      {/* Related Articles Section */}
      <section style={{ padding: "40px 0 60px", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
        <div className="res-container">
          <div className="res-section-head">
            <div className="res-tag">
              <span className="res-tag-dot"></span>
              KEEP READING
            </div>
            <h2 className="res-section-title">
              Related Articles &amp; <span className="res-heading-accent">Insights</span>
            </h2>
          </div>

          <div className="res-grid-3">
            {relatedPosts.map((rPost, rIdx) => (
              <Link key={rIdx} href={`/blog/${rPost.slug}`} className="res-card">
                <div className="res-card-img-wrap">
                  <img src={rPost.img} alt={rPost.title} className="res-card-img" />
                  <div className="res-card-pill">
                    <span className="res-card-pill-dot"></span>
                    {rPost.category}
                  </div>
                </div>
                <div className="res-card-meta">
                  {rPost.date} • {rPost.readTime}
                </div>
                <h3 className="res-card-title">{rPost.title}</h3>
                <p className="res-card-desc">{rPost.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <ResourceCtaBanner
        tag="GET STARTED"
        title="Your First Step Toward Scalable Growth"
        titleAccent="Starts Here"
        primaryHref="/contact"
        primaryLabel="Schedule a Strategy Call"
        secondaryHref="/case-studies"
        secondaryLabel="Explore Case Studies"
      />

      <Footer />
    </div>
  );
}


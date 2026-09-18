import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Button from "@/components/Button";
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
    <>
      <Header />
      <PageHero
        title={post.title}
        crumb="Blog"
        description={`By ${post.author} • ${post.date} • ${post.readTime}`}
      />

      {/* Main Single Blog Article Container */}
      <section className="section-gap" style={{ background: "#ffffff", paddingTop: "56px" }}>
        <div className="w-layout-blockcontainer container w-container" style={{ maxWidth: "860px" }}>
          
          {/* Top Meta Bar & Breadcrumbs */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "28px",
              paddingBottom: "20px",
              borderBottom: "1px solid #eaecf0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  background: "rgba(222, 242, 92, 0.4)",
                  color: "#18171c",
                  fontSize: "13px",
                  fontWeight: 700,
                  padding: "5px 14px",
                  borderRadius: "100px",
                }}
              >
                {post.category}
              </span>
              <span style={{ fontSize: "14px", color: "#667085" }}>{post.date}</span>
            </div>

            <Link
              href="/blog"
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#18171c",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              ← Back to All Articles
            </Link>
          </div>

          {/* Featured Image */}
          <div
            style={{
              borderRadius: "24px",
              overflow: "hidden",
              marginBottom: "40px",
              maxHeight: "440px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            }}
          >
            <img
              src={post.img}
              alt={post.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>

          {/* Author Badge Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: "#f8f9fa",
              border: "1px solid #eaecf0",
              borderRadius: "16px",
              padding: "16px 20px",
              marginBottom: "36px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#18171c",
                color: "#def25c",
                fontSize: "18px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {post.author.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#18171c" }}>{post.author}</div>
              <div style={{ fontSize: "13px", color: "#667085" }}>{post.authorRole} • {post.readTime}</div>
            </div>
          </div>

          {/* Article Introduction */}
          <div style={{ marginBottom: "36px" }}>
            <p
              style={{
                fontSize: "18px",
                lineHeight: "1.8",
                color: "#344054",
                fontWeight: 500,
              }}
            >
              {post.content.intro}
            </p>
          </div>

          {/* Key Takeaways Highlight Box */}
          <div
            style={{
              background: "rgba(222, 242, 92, 0.15)",
              border: "1px solid rgba(178, 212, 21, 0.4)",
              borderRadius: "20px",
              padding: "32px 28px",
              marginBottom: "48px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#18171c",
                marginBottom: "12px",
              }}
            >
              Executive Summary
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#18171c", marginBottom: "16px" }}>
              Key Takeaways
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {post.content.keyTakeaways.map((item, idx) => (
                <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "15px", color: "#18171c", lineHeight: "1.6" }}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
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
                    fontSize: "clamp(22px, 3vw, 28px)",
                    fontWeight: 800,
                    color: "#18171c",
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
                        color: "#475467",
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
              background: "#f8f9fa",
              borderLeft: "4px solid #18171c",
              borderRadius: "0 16px 16px 0",
              padding: "24px 28px",
              marginBottom: "56px",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#667085", marginBottom: "8px" }}>
              Final Thoughts
            </div>
            <p style={{ fontSize: "16px", lineHeight: "1.75", color: "#18171c", fontWeight: 600, margin: 0 }}>
              {post.content.conclusion}
            </p>
          </div>

          {/* Inline CTA Box */}
          <div
            style={{
              background: "#102b32",
              borderRadius: "24px",
              padding: "40px 36px",
              color: "#fff",
              textAlign: "center",
              marginBottom: "64px",
              border: "1px solid rgba(222, 242, 92, 0.25)",
            }}
          >
            <h3 style={{ fontSize: "24px", fontWeight: 800, color: "#fff", marginBottom: "12px" }}>
              Ready to Implement These Growth Strategies?
            </h3>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.85)", maxWidth: "560px", margin: "0 auto 24px" }}>
              Let&apos;s build a custom Marketing, AI &amp; Technology roadmap tailored to your business goals.
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button href="/contact" label="Talk to a Growth Strategist" />
            </div>
          </div>

          {/* Related Articles Grid */}
          <div style={{ paddingTop: "40px", borderTop: "1px solid #eaecf0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
              <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#18171c", margin: 0 }}>
                Related Articles
              </h3>
              <Link href="/blog" style={{ fontSize: "14px", fontWeight: 700, color: "#18171c", textDecoration: "none" }}>
                View All →
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "24px",
              }}
            >
              {relatedPosts.map((rPost, rIdx) => (
                <article
                  key={rIdx}
                  style={{
                    background: "#fff",
                    border: "1px solid #eaecf0",
                    borderRadius: "16px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Link href={`/blog/${rPost.slug}`} style={{ height: "160px", overflow: "hidden", display: "block" }}>
                    <img src={rPost.img} alt={rPost.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </Link>
                  <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#667085", textTransform: "uppercase", marginBottom: "6px" }}>
                      {rPost.category}
                    </span>
                    <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#18171c", marginBottom: "8px", lineHeight: 1.4 }}>
                      <Link href={`/blog/${rPost.slug}`} style={{ color: "#18171c", textDecoration: "none" }}>
                        {rPost.title}
                      </Link>
                    </h4>
                    <Link href={`/blog/${rPost.slug}`} style={{ fontSize: "13px", fontWeight: 700, color: "#18171c", marginTop: "auto", textDecoration: "none" }}>
                      Read →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}

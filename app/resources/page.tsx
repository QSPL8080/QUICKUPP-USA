import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResourceCtaBanner from "@/components/ResourceCtaBanner";
import { blogPosts } from "@/data/blogs";

export const metadata: Metadata = {
  title: "Resources & Insights | Quickupp Softech",
  description:
    "Access industry insights, case studies, client testimonials, and featured portfolios from Quickupp Softech.",
};

const hubCategories = [
  {
    title: "Blogs & Insights",
    href: "/blog",
    desc: "Actionable playbooks on AI search visibility, digital marketing trends, SEO, automation, and web development strategies.",
    tag: "THOUGHT LEADERSHIP",
    cta: "Read Articles",
  },
  {
    title: "Case Studies",
    href: "/case-studies",
    desc: "In-depth breakdowns of real client challenges, our custom solutions, and verified ROI metrics across industries.",
    tag: "PROVEN RESULTS",
    cta: "View Case Studies",
  },
  {
    title: "Portfolio",
    href: "/portfolio",
    desc: "Explore featured projects in Web & App Development, SaaS Engineering, AI Video Production, and Performance Marketing.",
    tag: "FEATURED WORK",
    cta: "Explore Portfolio",
  },
  {
    title: "Client Testimonials",
    href: "/testimonials",
    desc: "Hear what founders, CMOs, and enterprise leaders have to say about partnering with Quickupp Softech.",
    tag: "SOCIAL PROOF",
    cta: "Read Reviews",
  },
];

export default function ResourcesPage() {
  const topArticles = blogPosts.slice(0, 3);

  return (
    <div className="res-page-wrap">
      <Header />

      {/* Hero Header */}
      <section style={{ padding: "50px 0 40px" }}>
        <div className="res-container">
          <div className="res-section-head" style={{ maxWidth: "800px" }}>
            <div className="res-tag">
              <span className="res-tag-dot"></span>
              RESOURCE HUB
            </div>
            <h1 className="res-section-title">
              A quiet place to learn and{" "}
              <span className="res-heading-accent">scale</span>
            </h1>
            <p
              style={{
                fontSize: "17px",
                lineHeight: "1.7",
                color: "#475569",
                marginTop: "14px",
              }}
            >
              Explore our strategic insights, verified client case studies, live production portfolio, and founder reviews.
            </p>
          </div>

          {/* 2x2 Hub Categories Grid */}
          <div className="res-hub-grid">
            {hubCategories.map((cat, idx) => (
              <Link key={idx} href={cat.href} className="res-hub-card">
                <div className="res-tag" style={{ marginBottom: "8px" }}>
                  <span className="res-tag-dot"></span>
                  {cat.tag}
                </div>
                <h2 className="res-hub-card-title">{cat.title}</h2>
                <p className="res-hub-card-desc">{cat.desc}</p>
                <div className="res-hub-card-link">
                  {cat.cta}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Insights Section */}
      <section style={{ padding: "30px 0 60px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
        <div className="res-container">
          <div className="res-section-head" style={{ paddingTop: "40px" }}>
            <div className="res-tag">
              <span className="res-tag-dot"></span>
              LATEST ARTICLES
            </div>
            <h2 className="res-section-title">
              Featured Insights &amp; <span className="res-heading-accent">Playbooks</span>
            </h2>
          </div>

          <div className="res-grid-3">
            {topArticles.map((post, idx) => (
              <Link key={idx} href={`/blog/${post.slug}`} className="res-card">
                <div className="res-card-img-wrap">
                  <img src={post.img} alt={post.title} className="res-card-img" />
                  <div className="res-card-pill">
                    <span className="res-card-pill-dot"></span>
                    {post.category}
                  </div>
                </div>
                <div className="res-card-meta">
                  {post.date} • {post.readTime}
                </div>
                <h3 className="res-card-title">{post.title}</h3>
                <p className="res-card-desc">{post.desc}</p>
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


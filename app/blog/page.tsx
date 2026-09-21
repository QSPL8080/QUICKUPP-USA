"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Button from "@/components/Button";
import { blogPosts } from "@/data/blogs";

const categories = [
  "All",
  "AI & Search Visibility",
  "Digital Marketing",
  "AI Automation",
  "Web Engineering",
  "eCommerce",
  "Paid Advertising",
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts =
    selectedCategory === "All"
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

  return (
    <>
      <Header />
      <PageHero
        title="Marketing, AI & Tech Insights"
        crumb="Blog"
        description="Actionable strategies, expert analyses, and growth playbooks from the Quickupp Softech team."
      />

      {/* Main Blog Content Section with Proper Spacing */}
      <section className="qs-blog-section" style={{ background: "#f8f9fa" }}>
        <div className="w-layout-blockcontainer container w-container">
          {/* Section Header */}
          <div
            className="qs-section-center-head"
            style={{
              textAlign: "center",
              maxWidth: "800px",
              margin: "0 auto 40px auto",
            }}
          >
            <div className="subtitle-head-wrap" style={{ justifyContent: "center" }}>
              <div className="subtitle-left-icon"></div>
              <div className="subtitle-head">Articles & Insights</div>
            </div>
            <h2
              className="heading-title qs-section-heading"
              style={{ fontSize: "clamp(26px, 3.2vw, 38px)", marginTop: "8px", marginBottom: "12px" }}
            >
              Latest Strategies, Trends & Playbooks
            </h2>
            <p
              className="paragraph-large"
              style={{ fontSize: "17px", lineHeight: "1.7", color: "#475467" }}
            >
              Practical guides and perspectives on digital marketing, artificial intelligence, software engineering, and search visibility.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "48px",
            }}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "100px",
                    fontSize: "14px",
                    fontWeight: isSelected ? 700 : 600,
                    border: isSelected ? "1px solid #18171c" : "1px solid #e4e7ec",
                    background: isSelected ? "#18171c" : "#ffffff",
                    color: isSelected ? "#7c3aed" : "#475467",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isSelected
                      ? "0 4px 12px rgba(24, 23, 28, 0.15)"
                      : "0 2px 4px rgba(0,0,0,0.02)",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Blog Cards Grid with Fixed Column Widths - Cards NEVER stretch abnormally */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 370px))",
              justifyContent: "center",
              gap: "32px",
              marginBottom: "64px",
            }}
          >
            {filteredPosts.map((post, i) => (
              <article
                key={i}
                className="qs-blog-card"
                style={{
                  background: "#fff",
                  border: "1px solid #eaecf0",
                  borderRadius: "20px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.03)",
                  width: "100%",
                }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="qs-blog-card-img-wrap"
                  style={{ height: "220px", overflow: "hidden", position: "relative", display: "block" }}
                >
                  <img
                    src={post.img}
                    alt={post.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "16px",
                      background: "rgba(24, 23, 28, 0.75)",
                      backdropFilter: "blur(6px)",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    {post.readTime}
                  </div>
                </Link>

                <div
                  style={{
                    padding: "28px 24px",
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "14px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        background: "rgba(222, 242, 92, 0.4)",
                        color: "#18171c",
                        padding: "5px 12px",
                        borderRadius: "8px",
                      }}
                    >
                      {post.category}
                    </span>
                    <span style={{ fontSize: "13px", color: "#98a2b3", fontWeight: 500 }}>
                      {post.date}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "19px",
                      fontWeight: 700,
                      color: "#18171c",
                      marginBottom: "12px",
                      lineHeight: 1.4,
                    }}
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      style={{ color: "#18171c", textDecoration: "none" }}
                    >
                      {post.title}
                    </Link>
                  </h3>

                  <p
                    style={{
                      fontSize: "14.5px",
                      lineHeight: "1.65",
                      color: "#475467",
                      marginBottom: "24px",
                      flexGrow: 1,
                    }}
                  >
                    {post.desc}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "16px",
                      borderTop: "1px solid #f2f4f7",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#667085" }}>
                      By {post.author}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#18171c",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      Read Article →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Bottom Call to Action Box */}
          <div
            style={{
              background: "#18171c",
              borderRadius: "24px",
              padding: "48px 40px",
              textAlign: "center",
              color: "#fff",
              border: "1px solid rgba(222, 242, 92, 0.2)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: "rgba(222, 242, 92, 0.2)",
                color: "#7c3aed",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "4px 14px",
                borderRadius: "100px",
                marginBottom: "16px",
              }}
            >
              Have a Project in Mind?
            </div>
            <h3
              style={{
                fontSize: "clamp(24px, 3.2vw, 36px)",
                fontWeight: 800,
                color: "#fff",
                marginBottom: "12px",
              }}
            >
              Turn These Strategies Into Business Growth
            </h3>
            <p
              style={{
                fontSize: "16px",
                lineHeight: "1.7",
                color: "rgba(255,255,255,0.8)",
                maxWidth: "640px",
                margin: "0 auto 28px auto",
              }}
            >
              Speak with our Marketing, AI, and Software Engineering experts to build a tailored roadmap for your brand.
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button href="/contact" label="Talk to a Growth Strategist" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

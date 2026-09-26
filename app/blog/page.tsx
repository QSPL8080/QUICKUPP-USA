"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResourceCtaBanner from "@/components/ResourceCtaBanner";
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

  const featuredPost = blogPosts[0];

  const gridPosts =
    selectedCategory === "All"
      ? blogPosts.slice(1)
      : blogPosts.filter((post) => post.category === selectedCategory);

  return (
    <div className="res-page-wrap">
      <Header />

      {/* 1. Featured Article Split Hero (Reference Screenshot 1) */}
      <section className="res-featured-hero">
        <div className="res-container">
          <div className="res-featured-grid">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="res-featured-img-wrap"
            >
              <img
                src={featuredPost.img}
                alt={featuredPost.title}
                className="res-featured-img"
              />
            </Link>

            <div className="res-featured-content">
              <div className="res-tag">
                <span className="res-tag-dot"></span>
                {featuredPost.category}
              </div>

              <Link
                href={`/blog/${featuredPost.slug}`}
                className="res-featured-title"
              >
                {featuredPost.title}
              </Link>

              <p className="res-featured-desc">{featuredPost.desc}</p>

              <div className="res-author-row">
                <img
                  src="/images/home-two-about-p-500.jpg"
                  alt={featuredPost.author}
                  className="res-author-avatar"
                />
                <div className="res-author-info">
                  <div className="res-author-name">{featuredPost.author}</div>
                  <div className="res-author-meta">
                    {featuredPost.date} • {featuredPost.readTime}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. All Articles Grid Section (Reference Screenshot 2) */}
      <section style={{ padding: "30px 0 60px" }}>
        <div className="res-container">
          <div className="res-section-head">
            <div className="res-tag">
              <span className="res-tag-dot"></span>
              READ WITH US
            </div>
            <h2 className="res-section-title">
              A quiet place to learn and{" "}
              <span className="qs-gradient-text">reflect</span>
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="res-filter-bar">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`res-filter-btn ${isActive ? "is-active" : ""}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* 3-Column Card Grid */}
          <div className="res-grid-3">
            {gridPosts.map((post, idx) => (
              <Link
                key={idx}
                href={`/blog/${post.slug}`}
                className="res-card"
              >
                <div className="res-card-img-wrap">
                  <img
                    src={post.img}
                    alt={post.title}
                    className="res-card-img"
                  />
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

      {/* 3. Bottom CTA Banner (Reference Screenshot 3) */}
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

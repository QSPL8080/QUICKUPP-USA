"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Footer({ hideCta = false }: { hideCta?: boolean }) {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail("");
    }
  };

  const socialLinks = [
    {
      name: "Facebook",
      href: "https://www.facebook.com/quickupp",
      badgeClass: "qs-soc-fb",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "X (Twitter)",
      href: "https://x.com/quickupp",
      badgeClass: "qs-soc-x",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/quickupp/",
      badgeClass: "qs-soc-insta",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/quickupp",
      badgeClass: "qs-soc-linkedin",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@quickupp",
      badgeClass: "qs-soc-youtube",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className="qs-scalient-footer">
      <div className="w-layout-blockcontainer container w-container qs-scalient-container">
        {/* Main Grid: Newsletter Left + Columns Right */}
        <div className="qs-scalient-main-grid">
          {/* Left Column: Brand Logo + Headline + Newsletter + Quick Contact */}
          <div className="qs-scalient-left-col">
            <Link href="/" className="qs-scalient-logo-link" aria-label="Quickupp Softech Home">
              <img
                src="/images/logo-white.png"
                alt="Quickupp Softech"
                className="qs-scalient-logo-img"
              />
            </Link>

            <h2 className="qs-scalient-heading">
              Sign up for our newsletter today.
            </h2>

            <form onSubmit={handleSubscribe} className="qs-scalient-newsletter-box">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="qs-scalient-input"
              />
              <button type="submit" className="qs-scalient-sub-btn">
                {subscribed ? "Subscribed ✓" : "Subscribe"}
              </button>
            </form>

            <p className="qs-scalient-microcopy">
              No spam, Just valued update.
            </p>

            <div className="qs-scalient-contact-snippet">
              <div className="qs-scalient-contact-chip">
                <span className="qs-scalient-chip-dot"></span>
                <span className="qs-scalient-chip-label">Inquiries:</span>
                <a href="mailto:hello@quickuppsoftech.com" className="qs-scalient-chip-email">
                  hello@quickuppsoftech.com
                </a>
              </div>
              <div className="qs-scalient-chip-location">
                United States • Global Delivery
              </div>
            </div>
          </div>

          {/* Right Columns: Navigation, Services, Industries & Work, Social Media */}
          <div className="qs-scalient-nav-grid">
            {/* 1. Navigation & Company */}
            <div className="qs-scalient-col">
              <h3 className="qs-scalient-col-title">Navigation</h3>
              <ul className="qs-scalient-links">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/about/who-we-are">Who We Are</Link></li>
                <li><Link href="/about/why-choose-us">Why Choose Us</Link></li>
                <li><Link href="/about/why-businesses-choose-us">Why Businesses Choose Us</Link></li>
                <li><Link href="/about/our-approach">Our Approach</Link></li>
                <li>
                  <Link href="/career" className="qs-scalient-career-highlight">
                    Careers ↗
                  </Link>
                </li>
                <li><Link href="/contact">Contact Us</Link></li>
              </ul>
            </div>

            {/* 2. Core Services */}
            <div className="qs-scalient-col">
              <h3 className="qs-scalient-col-title">Services</h3>
              <ul className="qs-scalient-links">
                <li><Link href="/services/ai-powered-digital-marketing-services/seo-ai-search-visibility">AI Search &amp; SEO</Link></li>
                <li><Link href="/services/ai-powered-digital-marketing-services/paid-marketing">Paid Ads &amp; Growth</Link></li>
                <li><Link href="/services/ai-powered-digital-marketing-services/social-media-marketing">Social Media Marketing</Link></li>
                <li><Link href="/services/information-technology-services/web-design-development">Web &amp; App Development</Link></li>
                <li><Link href="/services/ai-video-production/ai-avatar-video">AI Video Production</Link></li>
                <li><Link href="/services/ai-automation-solutions/ai-automation-solutions">AI &amp; Automation</Link></li>
                <li><Link href="/services/staff-augmentation/it-staff-augmentation">Staff Augmentation</Link></li>
                <li><Link href="/services" style={{ color: "#38bdf8", fontWeight: 600 }}>All Services →</Link></li>
              </ul>
            </div>

            {/* 3. Industries & Resources */}
            <div className="qs-scalient-col">
              <h3 className="qs-scalient-col-title">Industries &amp; Work</h3>
              <ul className="qs-scalient-links">
                <li><Link href="/industries/healthcare">Healthcare &amp; Medical</Link></li>
                <li><Link href="/industries/it-saas">IT &amp; SaaS Scale</Link></li>
                <li><Link href="/industries/ecommerce">eCommerce Growth</Link></li>
                <li><Link href="/industries/real-estate">Real Estate Leads</Link></li>
                <li><Link href="/case-studies">Case Studies</Link></li>
                <li><Link href="/portfolio">Portfolio</Link></li>
                <li><Link href="/testimonials">Testimonials</Link></li>
                <li><Link href="/blog">Blogs &amp; Insights</Link></li>
              </ul>
            </div>

            {/* 4. Social Media */}
            <div className="qs-scalient-col">
              <h3 className="qs-scalient-col-title">Social Media</h3>
              <ul className="qs-scalient-links">
                {socialLinks.map((soc, idx) => (
                  <li key={idx}>
                    <a
                      href={soc.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={soc.name}
                      className="qs-scalient-social-item-row"
                    >
                      <span className={`qs-scalient-soc-icon-box ${soc.badgeClass}`}>{soc.icon}</span>
                      <span>{soc.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sub-Footer Bottom Bar */}
        <div className="qs-scalient-bottom-bar">
          <div className="qs-scalient-btm-left">
            <Link href="/contact" className="qs-scalient-btm-link">
              Support &amp; Inquiries
            </Link>
          </div>

          <div className="qs-scalient-btm-center">
            &copy; {year} <strong>Quickupp Softech LLC</strong>. All rights reserved.
          </div>

          <div className="qs-scalient-btm-right">
            <Link href="/about" className="qs-scalient-btm-link">
              About Quickupp
            </Link>
          </div>
        </div>
      </div>

      {/* Giant Watermark Typography at bottom */}
      <div className="qs-scalient-watermark-wrap" aria-hidden="true">
        <span className="qs-scalient-watermark-text">Quickupp</span>
      </div>
    </footer>
  );
}


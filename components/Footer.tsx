"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  const socialLinks = [
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      name: "Twitter / X",
      href: "https://x.com/",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  const marqueeItems = [
    "NEXT-GEN AI ARCHITECTURE",
    "HYPER-GROWTH MARKETING",
    "SCALABLE SOFTWARE PLATFORMS",
    "ENTERPRISE AUTOMATION",
    "24/7 GLOBAL DELIVERY",
    "CONVERSION-OPTIMIZED SYSTEMS",
    "ZERO TECHNICAL DEBT",
  ];

  return (
    <footer className="qs-footer-root">
      {/* 1. Brand Gradient Top Line */}
      <div className="qs-footer-top-gradient-line" />

      {/* 2. Animated Flowing Marquee Ticker */}
      <div className="qs-footer-ticker-bar">
        <div className="qs-footer-ticker-track">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <div key={idx} className="qs-footer-ticker-item">
              <span className="qs-ticker-star">✦</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Subtle Ambient Background Grid & Aura */}
      <div className="qs-footer-bg-graphic" />
      <div className="qs-footer-gradient-aura" />

      {/* 4. Main Footer Content */}
      <div className="w-layout-blockcontainer container w-container qs-footer-main-container">
        <div className="qs-footer-grid">
          {/* Brand Column */}
          <div className="qs-footer-brand-col">
            <Link href="/" className="qs-footer-logo-link">
              <img
                src="/images/logo-white.png"
                alt="Quickupp Softech LLC"
                className="qs-footer-logo-img"
              />
            </Link>
            <p className="qs-footer-brand-desc">
              Marketing. AI. Technology. Built for Exponential Scale. We engineer automated growth engines, high-converting platforms, and custom software for modern enterprises.
            </p>

            {/* Live Operational Status */}
            <div className="qs-footer-status-pill">
              <span className="qs-footer-pulse-dot" />
              <span>99.99% Systems Active • Global Delivery</span>
            </div>

            {/* Social Icons Bar */}
            <div className="qs-footer-social-row">
              {socialLinks.map((soc, idx) => (
                <a
                  key={idx}
                  href={soc.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={soc.name}
                  title={soc.name}
                  className="qs-footer-social-btn"
                >
                  {soc.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Solutions / Services */}
          <div>
            <div className="qs-footer-col-title">
              Solutions
            </div>
            <ul className="qs-footer-nav-list">
              <li>
                <Link href="/services/ai-automation-solutions" className="qs-footer-link">
                  AI Automation
                </Link>
              </li>
              <li>
                <Link href="/services/seo-ai-search-visibility" className="qs-footer-link">
                  SEO &amp; AI Search (AEO)
                </Link>
              </li>
              <li>
                <Link href="/services/paid-marketing" className="qs-footer-link">
                  Performance Paid Ads
                </Link>
              </li>
              <li>
                <Link href="/services/web-design-development" className="qs-footer-link">
                  Web &amp; App Development
                </Link>
              </li>
              <li>
                <Link href="/services/ai-avatar-video" className="qs-footer-link">
                  AI Video &amp; Avatars
                </Link>
              </li>
              <li>
                <Link href="/services/social-media-marketing" className="qs-footer-link">
                  Social Media Growth
                </Link>
              </li>
              <li>
                <Link href="/services" className="qs-footer-link-highlight">
                  All 12 Services →
                </Link>
              </li>
            </ul>
          </div>

          {/* Industries */}
          <div>
            <div className="qs-footer-col-title">
              Industries
            </div>
            <ul className="qs-footer-nav-list">
              <li>
                <Link href="/industries/healthcare-medtech" className="qs-footer-link">
                  Healthcare &amp; MedTech
                </Link>
              </li>
              <li>
                <Link href="/industries/ecommerce-d2c" className="qs-footer-link">
                  E-Commerce &amp; D2C
                </Link>
              </li>
              <li>
                <Link href="/industries/real-estate-proptech" className="qs-footer-link">
                  Real Estate &amp; PropTech
                </Link>
              </li>
              <li>
                <Link href="/industries/b2b-saas-technology" className="qs-footer-link">
                  SaaS &amp; Technology
                </Link>
              </li>
              <li>
                <Link href="/industries/legal-corporate" className="qs-footer-link">
                  Legal &amp; Professional
                </Link>
              </li>
              <li>
                <Link href="/industries/financial-services-fintech" className="qs-footer-link">
                  Finance &amp; FinTech
                </Link>
              </li>
              <li>
                <Link href="/industries" className="qs-footer-link-highlight">
                  All 9 Industries →
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Insights */}
          <div>
            <div className="qs-footer-col-title">
              Company
            </div>
            <ul className="qs-footer-nav-list">
              <li>
                <Link href="/about/who-we-are" className="qs-footer-link">
                  Who We Are
                </Link>
              </li>
              <li>
                <Link href="/about/why-choose-us" className="qs-footer-link">
                  Why Choose Us
                </Link>
              </li>
              <li>
                <Link href="/about/our-approach" className="qs-footer-link">
                  Our Approach
                </Link>
              </li>
              <li>
                <Link href="/about/our-team" className="qs-footer-link">
                  Leadership Team
                </Link>
              </li>
              <li>
                <Link href="/career" className="qs-footer-link">
                  <span>Careers</span>
                  <span className="qs-footer-hiring-gradient-badge">HIRING</span>
                </Link>
              </li>
              <li>
                <Link href="/case-studies" className="qs-footer-link">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="qs-footer-link">
                  Client Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Direct Contact */}
          <div>
            <div className="qs-footer-col-title">
              Stay Connected
            </div>

            <div className="qs-footer-newsletter-box">
              <div className="qs-footer-newsletter-label">
                Growth &amp; AI Intelligence
              </div>
              <p className="qs-footer-newsletter-sub">
                Bi-weekly teardowns on search algorithms, AI agents, and CAC reduction.
              </p>

              {subscribed ? (
                <div style={{ color: "#10b981", fontSize: "12px", fontWeight: 700, padding: "4px 0" }}>
                  ✓ You&apos;re subscribed to insights!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="qs-footer-input-row">
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="qs-footer-newsletter-input"
                  />
                  <button type="submit" className="qs-footer-newsletter-btn">
                    <span>Join</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </form>
              )}
            </div>

            <div className="qs-footer-direct-contact">
              <a href="mailto:hello@quickuppsoftech.com" className="qs-footer-direct-email">
                hello@quickuppsoftech.com ↗
              </a>
              <div>United States HQ • Global 24/7 Delivery</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="qs-footer-bottom-bar">
          <div>
            Copyright &copy; {year}{" "}
            <Link href="/" style={{ color: "#ffffff", fontWeight: 700, textDecoration: "none" }}>
              Quickupp Softech LLC
            </Link>
            . All rights reserved.
          </div>

          <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/services" className="qs-footer-bottom-link">
              Services
            </Link>
            <span style={{ opacity: 0.2 }}>•</span>
            <Link href="/industries" className="qs-footer-bottom-link">
              Industries
            </Link>
            <span style={{ opacity: 0.2 }}>•</span>
            <Link href="/career" className="qs-footer-bottom-link">
              Careers
            </Link>
            <span style={{ opacity: 0.2 }}>•</span>
            <Link href="/contact" className="qs-footer-bottom-link">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

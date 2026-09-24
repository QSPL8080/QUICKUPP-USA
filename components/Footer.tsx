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
      href: "https://www.facebook.com/",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    {
      name: "X (Twitter)",
      href: "https://x.com/",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/",
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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
                      <span className="qs-scalient-soc-icon-box">{soc.icon}</span>
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

        {/* Giant Watermark Typography at bottom */}
        <div className="qs-scalient-watermark-wrap" aria-hidden="true">
          <span className="qs-scalient-watermark-text">Quickupp</span>
        </div>
      </div>
    </footer>
  );
}


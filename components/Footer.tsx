"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  const socialLinks = [
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
      name: "Facebook",
      href: "https://www.facebook.com/",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    {
      name: "Twitter / X",
      href: "https://x.com/",
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/",
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="qs-footer-root">
      <div className="w-layout-blockcontainer container w-container" style={{ position: "relative", zIndex: 1 }}>
        {/* Top Row: Brand Info + 4 Nav Columns */}
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
              Marketing. AI. Technology. Built for Growth. We help ambitious businesses attract high-value customers, automate operations, and scale with custom software.
            </p>

            {/* Social Icons Bar */}
            <div className="qs-footer-social-wrap">
              <div className="qs-footer-social-title">
                Connect With Us
              </div>
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
          </div>

          {/* Quick Links Column: Services */}
          <div>
            <div className="qs-footer-col-title">
              Services
            </div>
            <ul className="qs-footer-nav-list">
              <li>
                <Link href="/services/social-media-marketing" className="qs-footer-link">
                  Social Media Marketing
                </Link>
              </li>
              <li>
                <Link href="/services/seo-ai-search-visibility" className="qs-footer-link">
                  SEO &amp; AI Search Visibility
                </Link>
              </li>
              <li>
                <Link href="/services/paid-marketing" className="qs-footer-link">
                  Paid Advertising (Google &amp; Meta)
                </Link>
              </li>
              <li>
                <Link href="/services/ai-automation-solutions" className="qs-footer-link">
                  AI Automation Solutions
                </Link>
              </li>
              <li>
                <Link href="/services/web-design-development" className="qs-footer-link">
                  Web Design &amp; Development
                </Link>
              </li>
              <li>
                <Link href="/services/ai-avatar-video" className="qs-footer-link">
                  AI Avatar &amp; Video Production
                </Link>
              </li>
              <li>
                <Link href="/services" className="qs-footer-link-highlight">
                  View All Services →
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Column: Company & About */}
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
                  Our Leadership Team
                </Link>
              </li>
              <li>
                <Link href="/career" className="qs-footer-link">
                  Careers &amp; Open Roles
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Column: Resources & Contact */}
          <div>
            <div className="qs-footer-col-title">
              Resources &amp; Contact
            </div>
            <ul className="qs-footer-nav-list" style={{ marginBottom: "20px" }}>
              <li>
                <Link href="/blog" className="qs-footer-link">
                  Blog &amp; Insights
                </Link>
              </li>
              <li>
                <Link href="/case-studies" className="qs-footer-link">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="qs-footer-link">
                  Portfolio &amp; Work
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="qs-footer-link">
                  Client Testimonials
                </Link>
              </li>
              <li>
                <Link href="/faq-page" className="qs-footer-link">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>

            <div className="qs-footer-contact-box">
              <div className="qs-footer-contact-label">
                Direct Contact
              </div>
              <a
                href="mailto:hello@quickuppsoftech.com"
                className="qs-footer-contact-email"
              >
                hello@quickuppsoftech.com
              </a>
              <div className="qs-footer-contact-loc">
                United States • Global Delivery
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal Bar */}
        <div className="qs-footer-bottom-bar">
          <div>
            Copyright &copy; {year}{" "}
            <Link href="/" style={{ color: "#ffffff", fontWeight: 600, textDecoration: "none" }}>
              Quickupp Softech
            </Link>
            . All rights reserved.
          </div>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/services" className="qs-footer-link">
              Services
            </Link>
            <span style={{ opacity: 0.3 }}>|</span>
            <Link href="/industries" className="qs-footer-link">
              Industries
            </Link>
            <span style={{ opacity: 0.3 }}>|</span>
            <Link href="/contact" className="qs-footer-link">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

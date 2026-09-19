"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { serviceGroups, industryItems, aboutItems, resourceItems } from "@/lib/sitemap";

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on route navigation
  useEffect(() => {
    setOpenDropdown(null);
    setIsMobileNavOpen(false);
  }, [pathname]);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setIsMobileNavOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleToggleClick = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const handleMouseEnter = (name: string) => {
    if (typeof window !== "undefined" && window.innerWidth >= 992) {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      setOpenDropdown(name);
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 992) {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = setTimeout(() => {
        setOpenDropdown(null);
      }, 180);
    }
  };

  const handleLinkClick = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setOpenDropdown(null);
    setIsMobileNavOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className={`qs-new-header ${scrolled ? "qs-header-scrolled" : ""}`}
    >
      <div className="qs-header-container">
        <div className="qs-header-inner">
          {/* Brand Logo (Left) */}
          <Link
            href="/"
            className="qs-header-brand-logo"
            onClick={handleLinkClick}
            aria-label="Quickupp Softech Home"
          >
            <img
              src="/images/logo-white.png"
              alt="Quickupp Softech"
              className="qs-header-logo-img"
            />
          </Link>

          {/* Desktop Navigation Links (Center) */}
          <nav
            role="navigation"
            aria-label="Main Navigation"
            className={`qs-desktop-nav-wrap ${isMobileNavOpen ? "qs-mobile-nav-active" : ""}`}
          >
            <ul className="qs-nav-list-ul">
              {/* 1. Services Mega Dropdown */}
              <li
                className="qs-has-dropdown qs-mega-parent"
                onMouseEnter={() => handleMouseEnter("services")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={`qs-nav-item-link ${openDropdown === "services" || pathname.startsWith("/services") ? "is-active" : ""}`}
                  onClick={(e) => handleToggleClick("services", e)}
                  aria-expanded={openDropdown === "services"}
                >
                  <span>Services</span>
                  <svg
                    className={`qs-chevron ${openDropdown === "services" ? "rotate-180" : ""}`}
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                  >
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {openDropdown === "services" && (
                  <div className="qs-dropdown-menu qs-services-mega">
                    <div className="qs-mega-header-row">
                      <div className="qs-mega-header-left">
                        <span className="qs-mega-sparkle">✦</span>
                        <span className="qs-mega-header-title">Our Capabilities &amp; Solutions</span>
                      </div>
                      <Link href="/services" className="qs-mega-view-all" onClick={handleLinkClick}>
                        <span>Explore All Services</span>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 9.5L9.5 2.5M9.5 2.5H3.5M9.5 2.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                    </div>

                    <div className="qs-services-grid-4col">
                      {/* Col 1: AI-Powered Digital Marketing Services */}
                      <div className="qs-mega-col">
                        <div className="qs-mega-col-title">AI-Powered Digital Marketing Services</div>
                        <div className="qs-mega-col-links">
                          {serviceGroups[0]?.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="qs-menu-link"
                              onClick={handleLinkClick}
                            >
                              <span className="qs-menu-link-dot">•</span>
                              <span className="qs-menu-link-label">{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Col 2: AI Video Production & AI & Automation Solutions */}
                      <div className="qs-mega-col">
                        <div className="qs-mega-col-title">AI Video Production</div>
                        <div className="qs-mega-col-links">
                          {serviceGroups[1]?.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="qs-menu-link"
                              onClick={handleLinkClick}
                            >
                              <span className="qs-menu-link-dot">•</span>
                              <span className="qs-menu-link-label">{item.label}</span>
                            </Link>
                          ))}
                        </div>

                        <div className="qs-mega-col-subdivider">
                          <div className="qs-mega-col-title">AI &amp; Automation Solutions</div>
                          <div className="qs-mega-col-links">
                            {serviceGroups[2]?.items.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="qs-menu-link"
                                onClick={handleLinkClick}
                              >
                                <span className="qs-menu-link-dot">•</span>
                                <span className="qs-menu-link-label">{item.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Col 3: Information Technology Services */}
                      <div className="qs-mega-col">
                        <div className="qs-mega-col-title">Information Technology Services</div>
                        <div className="qs-mega-col-links">
                          {serviceGroups[3]?.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="qs-menu-link"
                              onClick={handleLinkClick}
                            >
                              <span className="qs-menu-link-dot">•</span>
                              <span className="qs-menu-link-label">{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Col 4: Staff Augmentation + Action Box */}
                      <div className="qs-mega-col">
                        <div className="qs-mega-col-title">Staff Augmentation</div>
                        <div className="qs-mega-col-links">
                          {serviceGroups[4]?.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="qs-menu-link"
                              onClick={handleLinkClick}
                            >
                              <span className="qs-menu-link-dot">•</span>
                              <span className="qs-menu-link-label">{item.label}</span>
                            </Link>
                          ))}
                        </div>

                        <div className="qs-mega-promo-box">
                          <div className="qs-promo-header">
                            <span className="qs-promo-icon">⚡</span>
                            <span className="qs-promo-tag">Unified Growth Engine</span>
                          </div>
                          <div className="qs-promo-desc">Scale marketing, AI &amp; engineering with zero overhead.</div>
                          <Link href="/contact" className="qs-promo-btn" onClick={handleLinkClick}>
                            <span>Talk to an Expert</span>
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <path d="M2.5 9.5L9.5 2.5M9.5 2.5H3.5M9.5 2.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </li>

              {/* 2. Industries Dropdown */}
              <li
                className="qs-has-dropdown qs-mega-parent"
                onMouseEnter={() => handleMouseEnter("industries")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={`qs-nav-item-link ${openDropdown === "industries" || pathname.startsWith("/industries") ? "is-active" : ""}`}
                  onClick={(e) => handleToggleClick("industries", e)}
                  aria-expanded={openDropdown === "industries"}
                >
                  <span>Industries</span>
                  <svg
                    className={`qs-chevron ${openDropdown === "industries" ? "rotate-180" : ""}`}
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                  >
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {openDropdown === "industries" && (
                  <div className="qs-dropdown-menu qs-industries-clean-menu">
                    <div className="qs-mega-header-row">
                      <div className="qs-mega-header-left">
                        <span className="qs-mega-sparkle">✦</span>
                        <span className="qs-mega-header-title">Industries We Scale</span>
                      </div>
                      <Link href="/industries" className="qs-mega-view-all" onClick={handleLinkClick}>
                        <span>Explore All</span>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 9.5L9.5 2.5M9.5 2.5H3.5M9.5 2.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                    </div>
                    <div className="qs-industries-clean-grid">
                      {industryItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="qs-menu-link"
                          onClick={handleLinkClick}
                        >
                          <span className="qs-menu-link-dot">•</span>
                          <span className="qs-menu-link-label">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>

              {/* 3. About Dropdown */}
              <li
                className="qs-has-dropdown"
                onMouseEnter={() => handleMouseEnter("about")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={`qs-nav-item-link ${openDropdown === "about" || pathname.startsWith("/about") ? "is-active" : ""}`}
                  onClick={(e) => handleToggleClick("about", e)}
                  aria-expanded={openDropdown === "about"}
                >
                  <span>About</span>
                  <svg
                    className={`qs-chevron ${openDropdown === "about" ? "rotate-180" : ""}`}
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                  >
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {openDropdown === "about" && (
                  <div className="qs-dropdown-menu qs-simple-dropdown">
                    <div className="qs-simple-menu-links">
                      {aboutItems.map((item, idx) => (
                        <Link
                          key={`${item.href}-${idx}`}
                          href={item.href}
                          className="qs-menu-link"
                          onClick={handleLinkClick}
                        >
                          <span className="qs-menu-link-dot">•</span>
                          <span className="qs-menu-link-label">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>

              {/* 4. Resources Dropdown */}
              <li
                className="qs-has-dropdown"
                onMouseEnter={() => handleMouseEnter("resources")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={`qs-nav-item-link ${openDropdown === "resources" || pathname.startsWith("/blog") || pathname.startsWith("/case-studies") || pathname.startsWith("/portfolio") || pathname.startsWith("/testimonials") ? "is-active" : ""}`}
                  onClick={(e) => handleToggleClick("resources", e)}
                  aria-expanded={openDropdown === "resources"}
                >
                  <span>Resources</span>
                  <svg
                    className={`qs-chevron ${openDropdown === "resources" ? "rotate-180" : ""}`}
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                  >
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {openDropdown === "resources" && (
                  <div className="qs-dropdown-menu qs-simple-dropdown">
                    <div className="qs-simple-menu-links">
                      {resourceItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="qs-menu-link"
                          onClick={handleLinkClick}
                        >
                          <span className="qs-menu-link-dot">•</span>
                          <span className="qs-menu-link-label">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>

              {/* 5. Careers */}
              <li>
                <Link
                  href="/career"
                  className={`qs-nav-item-link ${pathname === "/career" ? "is-active" : ""}`}
                  onClick={handleLinkClick}
                >
                  <span>Careers</span>
                  <span className="qs-nav-hiring-badge">
                    <span className="qs-hiring-dot" />
                    <span className="qs-hiring-text">Hiring</span>
                  </span>
                </Link>
              </li>

              {/* 6. Contact */}
              <li>
                <Link
                  href="/contact"
                  className={`qs-nav-item-link ${pathname === "/contact" ? "is-active" : ""}`}
                  onClick={handleLinkClick}
                >
                  <span>Contact</span>
                </Link>
              </li>
            </ul>

            {/* Mobile Drawer Action Button */}
            <div className="qs-mobile-drawer-cta">
              <Link
                href="/contact"
                className="qs-new-cta-btn"
                onClick={handleLinkClick}
              >
                <span>Contact Now</span>
              </Link>
            </div>
          </nav>

          {/* 7. Right Header Action Button (Desktop: Contact Now) */}
          <div className="qs-header-right-col">
            <Link
              href="/contact"
              className="qs-new-cta-btn"
              onClick={handleLinkClick}
            >
              <span>Contact Now</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className={`qs-mobile-toggle-btn ${isMobileNavOpen ? "is-active" : ""}`}
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              aria-label="Toggle Navigation Menu"
              aria-expanded={isMobileNavOpen}
            >
              <span className="qs-hamburger-line" />
              <span className="qs-hamburger-line" />
              <span className="qs-hamburger-line" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { serviceGroups, industryItems, aboutItems, resourceItems } from "@/lib/sitemap";
import "@/app/header-mega.css";
import LucideIcon, { type LucideIconName } from "@/components/LucideIcon";
import type { NavItem } from "@/lib/sitemap";

/* Icons for every menu item (keyed by link) and for each service category */
const ITEM_ICONS: Record<string, LucideIconName> = {
  "/services/ai-powered-digital-marketing-services/social-media-marketing": "share-2",
  "/services/ai-powered-digital-marketing-services/seo-ai-search-visibility": "search",
  "/services/ai-powered-digital-marketing-services/paid-marketing": "target",
  "/services/ai-powered-digital-marketing-services/content-marketing": "pen-line",
  "/services/ai-powered-digital-marketing-services/media-production": "clapperboard",
  "/services/ai-powered-digital-marketing-services/online-reputation-management": "shield-check",
  "/services/ai-powered-digital-marketing-services/email-marketing": "mail",
  "/services/ai-powered-digital-marketing-services/sms-marketing": "smartphone",
  "/services/ai-powered-digital-marketing-services/whatsapp-marketing": "message-circle",
  "/services/ai-automation-solutions/ai-automation-solutions": "bot",
  "/services/information-technology-services/web-design-development": "globe",
  "/services/information-technology-services/application-development": "monitor-smartphone",
  "/services/information-technology-services/product-engineering": "layers",
  "/services/information-technology-services/quality-assurance-testing": "bug",
  "/services/information-technology-services/ui-ux-design": "palette",
  "/services/staff-augmentation/marketing-design-staff-augmentation": "users-round",
  "/services/staff-augmentation/it-staff-augmentation": "code-xml",
  "/industries/healthcare": "heart-pulse",
  "/industries/home-services": "house",
  "/industries/professional-services": "scale",
  "/industries/education": "graduation-cap",
  "/industries/it-saas": "cloud",
  "/industries/ecommerce": "shopping-bag",
  "/industries/real-estate": "building",
  "/industries/interior-design": "sofa",
  "/industries/travel-hospitality": "plane",
  "/about/who-we-are": "compass",
  "/about/why-choose-us": "trophy",
  "/about/why-businesses-choose-us": "briefcase",
  "/about/our-approach": "route",
  "/blog": "book-open",
  "/case-studies": "chart-column",
  "/portfolio": "layout-grid",
  "/testimonials": "quote",
};

/* Service categories shown as tabs (index into serviceGroups) */
const SERVICE_TABS: { group: number; icon: LucideIconName; hub: string }[] = [
  { group: 0, icon: "megaphone", hub: "/services/ai-powered-digital-marketing-services" },
  { group: 2, icon: "bot", hub: "/services/ai-automation-solutions" },
  { group: 3, icon: "code-xml", hub: "/services/information-technology-services" },
  { group: 4, icon: "users", hub: "/services/staff-augmentation" },
];

function MenuItem({ item, current, onClick }: { item: NavItem; current: boolean; onClick: () => void }) {
  return (
    <Link href={item.href} className={`nv-item${current ? " is-current" : ""}`} onClick={onClick}>
      <span className="nv-item-icon" aria-hidden="true">
        <LucideIcon name={ITEM_ICONS[item.href] || "arrow-right"} size={18} />
      </span>
      <span className="nv-item-text">
        <span className="nv-item-title">{item.label}</span>
        {item.desc && <span className="nv-item-desc">{item.desc}</span>}
      </span>
    </Link>
  );
}

const YouTubeMark = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size * 0.72} viewBox="0 3.5 24 17" aria-hidden="true">
    <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#ffffff" />
    <path
      fill="#ff0000"
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
    />
  </svg>
);

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [serviceTab, setServiceTab] = useState(0);
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
                  <div className="nv-panel nv-panel-services">
                    {/* Desktop: category tabs + items + featured */}
                    <div className="nv-services">
                      <div className="nv-tabs" role="tablist" aria-label="Service categories">
                        {SERVICE_TABS.map((t, i) => (
                          <button
                            key={t.hub}
                            type="button"
                            role="tab"
                            aria-selected={serviceTab === i}
                            className={`nv-tab${serviceTab === i ? " is-active" : ""}`}
                            onMouseEnter={() => setServiceTab(i)}
                            onFocus={() => setServiceTab(i)}
                            onClick={() => setServiceTab(i)}
                          >
                            <span className="nv-tab-icon" aria-hidden="true">
                              <LucideIcon name={t.icon} size={18} />
                            </span>
                            <span className="nv-tab-label">{serviceGroups[t.group]?.label}</span>
                            <span className="nv-tab-chevron" aria-hidden="true">
                              <LucideIcon name="chevron-right" size={16} />
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="nv-tab-body" key={serviceTab}>
                        <div className="nv-body-head">
                          <span className="nv-kicker">{serviceGroups[SERVICE_TABS[serviceTab].group]?.label}</span>
                          <Link href={SERVICE_TABS[serviceTab].hub} className="nv-head-link" onClick={handleLinkClick}>
                            <span>View all</span>
                            <LucideIcon name="arrow-right" size={14} strokeWidth={2.2} />
                          </Link>
                        </div>
                        <div
                          className={`nv-items${(serviceGroups[SERVICE_TABS[serviceTab].group]?.items.length || 0) > 6 ? " nv-items-3up" : (serviceGroups[SERVICE_TABS[serviceTab].group]?.items.length || 0) > 1 ? " nv-items-2col" : ""}`}
                        >
                          {serviceGroups[SERVICE_TABS[serviceTab].group]?.items.map((item) => (
                            <MenuItem key={item.href} item={item} current={pathname === item.href} onClick={handleLinkClick} />
                          ))}
                        </div>
                      </div>

                      <div className="nv-feature-col">
                        <Link href="/services/youtube-video-promotion" className="nv-feature nv-feature-yt" onClick={handleLinkClick}>
                          <span className="nv-feature-icon" aria-hidden="true">
                            <YouTubeMark size={30} />
                          </span>
                          <span className="nv-feature-title">YouTube Video Promotion</span>
                          <span className="nv-feature-go" aria-hidden="true">
                            <LucideIcon name="arrow-right" size={15} strokeWidth={2.2} />
                          </span>
                        </Link>
                        <a
                          href={serviceGroups[1]?.items[0]?.href || "https://quickuppaistudio.us/"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="nv-feature nv-feature-ai"
                          onClick={handleLinkClick}
                        >
                          <span className="nv-feature-icon" aria-hidden="true">
                            <LucideIcon name="clapperboard" size={22} />
                          </span>
                          <span className="nv-feature-title">AI Video Production</span>
                          <span className="nv-feature-go" aria-hidden="true">
                            <LucideIcon name="arrow-up-right" size={15} strokeWidth={2.2} />
                          </span>
                        </a>
                      </div>
                    </div>

                    {/* Mobile: every category listed */}
                    <div className="nv-mobile-groups">
                      {SERVICE_TABS.map((t) => (
                        <div key={t.hub} className="nv-mobile-group">
                          <span className="nv-kicker">{serviceGroups[t.group]?.label}</span>
                          {serviceGroups[t.group]?.items.map((item) => (
                            <MenuItem key={item.href} item={item} current={pathname === item.href} onClick={handleLinkClick} />
                          ))}
                        </div>
                      ))}
                      <div className="nv-mobile-group">
                        <Link href="/services/youtube-video-promotion" className="nv-item" onClick={handleLinkClick}>
                          <span className="nv-item-icon" aria-hidden="true">
                            <YouTubeMark size={18} />
                          </span>
                          <span className="nv-item-text">
                            <span className="nv-item-title">YouTube Video Promotion</span>
                          </span>
                        </Link>
                        <a
                          href={serviceGroups[1]?.items[0]?.href || "https://quickuppaistudio.us/"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="nv-item"
                          onClick={handleLinkClick}
                        >
                          <span className="nv-item-icon" aria-hidden="true">
                            <LucideIcon name="clapperboard" size={18} />
                          </span>
                          <span className="nv-item-text">
                            <span className="nv-item-title">AI Video Production</span>
                          </span>
                        </a>
                      </div>
                    </div>

                    <div className="nv-panel-foot">
                      <span className="nv-foot-text">Enterprise-grade AI, video production, digital marketing and engineering.</span>
                      <Link href="/contact" className="nv-foot-link" onClick={handleLinkClick}>
                        <span>Talk to an Expert</span>
                        <LucideIcon name="arrow-right" size={14} strokeWidth={2.2} />
                      </Link>
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
                  <div className="nv-panel nv-panel-industries">
                    <div className="nv-body-head">
                      <span className="nv-kicker">Industries We Scale</span>
                      <Link href="/industries" className="nv-head-link" onClick={handleLinkClick}>
                        <span>Explore All Industries</span>
                        <LucideIcon name="arrow-up-right" size={14} strokeWidth={2.2} />
                      </Link>
                    </div>
                    <div className="nv-items nv-items-3col">
                      {industryItems.map((item) => (
                        <MenuItem key={item.href} item={item} current={pathname === item.href} onClick={handleLinkClick} />
                      ))}
                    </div>
                    <div className="nv-panel-foot">
                      <span className="nv-foot-text">Tailored compliance, workflows, and growth architecture for your sector.</span>
                      <Link href="/case-studies" className="nv-foot-link" onClick={handleLinkClick}>
                        <span>View Case Studies</span>
                        <LucideIcon name="arrow-right" size={14} strokeWidth={2.2} />
                      </Link>
                    </div>
                  </div>
                )}
              </li>

              {/* 3. About Dropdown */}
              <li
                className="qs-has-dropdown qs-simple-parent"
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
                  <div className="nv-panel nv-panel-sm">
                    <div className="nv-items">
                      {aboutItems.map((item) => (
                        <MenuItem key={item.href} item={item} current={pathname === item.href} onClick={handleLinkClick} />
                      ))}
                    </div>
                  </div>
                )}
              </li>

              {/* 4. Resources Dropdown */}
              <li
                className="qs-has-dropdown qs-simple-parent"
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
                  <div className="nv-panel nv-panel-sm">
                    <div className="nv-items">
                      {resourceItems.map((item) => (
                        <MenuItem key={item.href} item={item} current={pathname === item.href} onClick={handleLinkClick} />
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
                <span>Get More Info</span>
              </Link>
            </div>
          </nav>

          {/* 7. Right Header Action Button (Desktop: Get More Info) */}
          <div className="qs-header-right-col">
            <Link
              href="/contact"
              className="qs-new-cta-btn"
              onClick={handleLinkClick}
            >
              <span>Get More Info</span>
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

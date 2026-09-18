"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { serviceGroups, industryItems, aboutItems, resourceItems } from "@/lib/sitemap";
import MegaMenuPosition from "@/components/MegaMenuPosition";

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

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
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setOpenDropdown(name);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 350);
  };

  const handleLinkClick = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setOpenDropdown(null);
    setIsMobileNavOpen(false);
  };

  return (
    <header ref={headerRef} className="header header-one">
      <MegaMenuPosition />
      <div className="header-main header-one">
        <div className="w-layout-blockcontainer container w-container">
          <div
            data-animation="default"
            data-collapse="medium"
            data-duration="400"
            data-easing="ease"
            data-easing2="ease"
            role="banner"
            className={`navbar w-nav ${isMobileNavOpen ? "w-nav-open" : ""}`}
          >
            <div className="logo-wrap">
              <Link href="/" className="logo-link header-one w-nav-brand qs-brand-link" onClick={handleLinkClick}>
                <img
                  src="/images/logo-white.png"
                  alt="Quickupp Softech LLC"
                  className="qs-header-logo-img"
                />
              </Link>
              <nav
                role="navigation"
                className={`nav-one-menu w-nav-menu ${isMobileNavOpen ? "w--nav-menu-open" : ""}`}
                style={isMobileNavOpen ? { display: "block", opacity: 1, visibility: "visible" } : undefined}
              >
                <ul role="list" className="nav-menu w-list-unstyled">
                  <li className="nav-list">
                    <Link href="/" className="nav-link w-inline-block" onClick={handleLinkClick}>
                      <div className="nav-text-wrap">
                        <div className="nav-text">Home</div>
                      </div>
                    </Link>
                  </li>

                  {/* Services Dropdown */}
                  <li
                    className="nav-list"
                    onMouseEnter={() => handleMouseEnter("services")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className={`dropdown-nav qs-mega-dd w-dropdown ${openDropdown === "services" ? "qs-open w--open" : ""}`}>
                      <div
                        className="dropdown-toggle w-dropdown-toggle"
                        onClick={(e) => handleToggleClick("services", e)}
                        role="button"
                        tabIndex={0}
                        aria-expanded={openDropdown === "services"}
                      >
                        <div className="nav-link">
                          <div className="nav-text-wrap">
                            <div className="nav-text">Services</div>
                          </div>
                        </div>
                        <div className={`down-icon w-icon-dropdown-toggle ${openDropdown === "services" ? "rotate-180" : ""}`}></div>
                      </div>
                      <nav
                        className={`dropdown-list qs-mega-panel qs-mega-wide w-dropdown-list ${openDropdown === "services" ? "w--open" : ""}`}
                        style={openDropdown === "services" ? { display: "block", opacity: 1, visibility: "visible", pointerEvents: "auto" } : undefined}
                      >
                        <div className="qs-mega-grid">
                          {serviceGroups.map((group) => (
                            <div key={group.label} className="qs-mega-col">
                              <div className="qs-mega-col-title">{group.label}</div>
                              {group.items.map((item) => (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className="dropdown-link w-dropdown-link"
                                  onClick={handleLinkClick}
                                >
                                  {item.label}
                                </Link>
                              ))}
                            </div>
                          ))}
                        </div>
                      </nav>
                    </div>
                  </li>

                  {/* Industries Dropdown */}
                  <li
                    className="nav-list"
                    onMouseEnter={() => handleMouseEnter("industries")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className={`dropdown-nav qs-mega-dd w-dropdown ${openDropdown === "industries" ? "qs-open w--open" : ""}`}>
                      <div
                        className="dropdown-toggle w-dropdown-toggle"
                        onClick={(e) => handleToggleClick("industries", e)}
                        role="button"
                        tabIndex={0}
                        aria-expanded={openDropdown === "industries"}
                      >
                        <div className="nav-link">
                          <div className="nav-text-wrap">
                            <div className="nav-text">Industries</div>
                          </div>
                        </div>
                        <div className={`down-icon w-icon-dropdown-toggle ${openDropdown === "industries" ? "rotate-180" : ""}`}></div>
                      </div>
                      <nav
                        className={`dropdown-list qs-mega-panel qs-industries-wide w-dropdown-list ${openDropdown === "industries" ? "w--open" : ""}`}
                        style={openDropdown === "industries" ? { display: "block", opacity: 1, visibility: "visible", pointerEvents: "auto" } : undefined}
                      >
                        <div className="qs-mega-col-title">Industries We Serve</div>
                        <div className="qs-industries-grid">
                          {industryItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="dropdown-link w-dropdown-link"
                              onClick={handleLinkClick}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </nav>
                    </div>
                  </li>

                  {/* About Dropdown */}
                  <li
                    className="nav-list"
                    onMouseEnter={() => handleMouseEnter("about")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className={`dropdown-nav w-dropdown ${openDropdown === "about" ? "qs-open w--open" : ""}`}>
                      <div
                        className="dropdown-toggle w-dropdown-toggle"
                        onClick={(e) => handleToggleClick("about", e)}
                        role="button"
                        tabIndex={0}
                        aria-expanded={openDropdown === "about"}
                      >
                        <div className="nav-link">
                          <div className="nav-text-wrap">
                            <div className="nav-text">About</div>
                          </div>
                        </div>
                        <div className={`down-icon w-icon-dropdown-toggle ${openDropdown === "about" ? "rotate-180" : ""}`}></div>
                      </div>
                      <nav
                        className={`dropdown-list _w-auto w-dropdown-list ${openDropdown === "about" ? "w--open" : ""}`}
                        style={openDropdown === "about" ? { display: "block", opacity: 1, visibility: "visible", pointerEvents: "auto" } : undefined}
                      >
                        {aboutItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="dropdown-link w-dropdown-link"
                            onClick={handleLinkClick}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </nav>
                    </div>
                  </li>

                  {/* Resources Dropdown */}
                  <li
                    className="nav-list"
                    onMouseEnter={() => handleMouseEnter("resources")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className={`dropdown-nav w-dropdown ${openDropdown === "resources" ? "qs-open w--open" : ""}`}>
                      <div
                        className="dropdown-toggle w-dropdown-toggle"
                        onClick={(e) => handleToggleClick("resources", e)}
                        role="button"
                        tabIndex={0}
                        aria-expanded={openDropdown === "resources"}
                      >
                        <div className="nav-link">
                          <div className="nav-text-wrap">
                            <div className="nav-text">Resources</div>
                          </div>
                        </div>
                        <div className={`down-icon w-icon-dropdown-toggle ${openDropdown === "resources" ? "rotate-180" : ""}`}></div>
                      </div>
                      <nav
                        className={`dropdown-list _w-auto w-dropdown-list ${openDropdown === "resources" ? "w--open" : ""}`}
                        style={openDropdown === "resources" ? { display: "block", opacity: 1, visibility: "visible", pointerEvents: "auto" } : undefined}
                      >
                        {resourceItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="dropdown-link w-dropdown-link"
                            onClick={handleLinkClick}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </nav>
                    </div>
                  </li>

                  <li className="nav-list">
                    <Link href="/career" className="nav-link w-inline-block" onClick={handleLinkClick}>
                      <div className="nav-text-wrap">
                        <div className="nav-text">Careers</div>
                      </div>
                    </Link>
                  </li>
                  <li className="nav-list">
                    <Link href="/contact" className="nav-link w-inline-block" onClick={handleLinkClick}>
                      <div className="nav-text-wrap">
                        <div className="nav-text">Contact</div>
                      </div>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="header-right-content display-none-991">
              <div className="header-social-icons">
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="header-social-link w-inline-block"
                >
                  <div className="header-social-icon"></div>
                </a>
                <a
                  href="https://x.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="header-social-link w-inline-block"
                >
                  <div className="header-social-icon"></div>
                </a>
                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="header-social-link w-inline-block"
                >
                  <div className="header-social-icon"></div>
                </a>
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="header-social-link w-inline-block"
                >
                  <div className="header-social-icon"></div>
                </a>
              </div>
              <div className="header-btn">
                <Link
                  href="/contact"
                  data-wf--button--variant="secondary-bg"
                  className="button-link w-inline-block"
                  onClick={handleLinkClick}
                >
                  <div className="button-hover-overlay"></div>
                  <div className="button-text-wrapper">
                    <div className="button-text-wrap">
                      <div className="button-text">Get More Info</div>
                      <div className="button-text-hover">Get More Info</div>
                    </div>
                  </div>
                  <div className="button-arrow-wrapper">
                    <div className="button-arrow-wrap">
                      <img
                        src="/images/button-arrow.svg"
                        loading="lazy"
                        width="20"
                        height="20"
                        alt="button-arrow"
                        className="button-arrow"
                      />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
            <div
              className="menu-button w-nav-button"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              role="button"
              tabIndex={0}
              aria-label="Toggle Navigation Menu"
            >
              <div className="menu-icon w-icon-nav-menu"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

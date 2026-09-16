import Link from "next/link";
import { serviceGroups, industryItems, aboutItems, resourceItems } from "@/lib/sitemap";
import MegaMenuPosition from "@/components/MegaMenuPosition";

export default function Header() {
  return (
    <header className="header header-one">
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
            className="navbar w-nav"
          >
            <div className="logo-wrap">
              <Link href="/" className="logo-link header-one w-nav-brand qs-brand-link">
                <span className="qs-brand-text">Quickupp Softech</span>
              </Link>
              <aside role="navigation" className="nav-one-menu w-nav-menu">
                <ul role="list" className="nav-menu w-list-unstyled">
                  <li className="nav-list">
                    <Link href="/" className="nav-link w-inline-block">
                      <div className="nav-text-wrap">
                        <div className="nav-text">Home</div>
                      </div>
                    </Link>
                  </li>

                  <li className="nav-list">
                    <div data-delay="500" data-hover="true" className="dropdown-nav qs-mega-dd w-dropdown">
                      <div className="dropdown-toggle w-dropdown-toggle">
                        <div className="nav-link">
                          <div className="nav-text-wrap">
                            <div className="nav-text">Services</div>
                          </div>
                        </div>
                        <div className="down-icon w-icon-dropdown-toggle"></div>
                      </div>
                      <nav className="dropdown-list qs-mega-panel qs-mega-wide w-dropdown-list">
                        <div className="qs-mega-grid">
                          {serviceGroups.map((group) => (
                            <div key={group.label} className="qs-mega-col">
                              <div className="qs-mega-col-title">{group.label}</div>
                              {group.items.map((item) => (
                                <Link key={item.href} href={item.href} className="dropdown-link w-dropdown-link">
                                  {item.label}
                                </Link>
                              ))}
                            </div>
                          ))}
                        </div>
                      </nav>
                    </div>
                  </li>

                  <li className="nav-list">
                    <div data-delay="500" data-hover="true" className="dropdown-nav qs-mega-dd w-dropdown">
                      <div className="dropdown-toggle w-dropdown-toggle">
                        <div className="nav-link">
                          <div className="nav-text-wrap">
                            <div className="nav-text">Industries</div>
                          </div>
                        </div>
                        <div className="down-icon w-icon-dropdown-toggle"></div>
                      </div>
                      <nav className="dropdown-list qs-mega-panel qs-industries-wide w-dropdown-list">
                        <div className="qs-mega-col-title">Industries We Serve</div>
                        <div className="qs-industries-grid">
                          {industryItems.map((item) => (
                            <Link key={item.href} href={item.href} className="dropdown-link w-dropdown-link">
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </nav>
                    </div>
                  </li>

                  <li className="nav-list">
                    <div data-delay="500" data-hover="true" className="dropdown-nav w-dropdown">
                      <div className="dropdown-toggle w-dropdown-toggle">
                        <div className="nav-link">
                          <div className="nav-text-wrap">
                            <div className="nav-text">About</div>
                          </div>
                        </div>
                        <div className="down-icon w-icon-dropdown-toggle"></div>
                      </div>
                      <nav className="dropdown-list _w-auto w-dropdown-list">
                        {aboutItems.map((item) => (
                          <Link key={item.href} href={item.href} className="dropdown-link w-dropdown-link">
                            {item.label}
                          </Link>
                        ))}
                      </nav>
                    </div>
                  </li>

                  <li className="nav-list">
                    <div data-delay="500" data-hover="true" className="dropdown-nav w-dropdown">
                      <div className="dropdown-toggle w-dropdown-toggle">
                        <div className="nav-link">
                          <div className="nav-text-wrap">
                            <div className="nav-text">Resources</div>
                          </div>
                        </div>
                        <div className="down-icon w-icon-dropdown-toggle"></div>
                      </div>
                      <nav className="dropdown-list _w-auto w-dropdown-list">
                        {resourceItems.map((item) => (
                          <Link key={item.href} href={item.href} className="dropdown-link w-dropdown-link">
                            {item.label}
                          </Link>
                        ))}
                      </nav>
                    </div>
                  </li>

                  <li className="nav-list">
                    <Link href="/career" className="nav-link w-inline-block">
                      <div className="nav-text-wrap">
                        <div className="nav-text">Careers</div>
                      </div>
                    </Link>
                  </li>
                  <li className="nav-list">
                    <Link href="/contact" className="nav-link w-inline-block">
                      <div className="nav-text-wrap">
                        <div className="nav-text">Contact</div>
                      </div>
                    </Link>
                  </li>
                </ul>
              </aside>
            </div>
            <div className="header-right-content display-none-991">
              <div className="header-social-icons">
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  className="header-social-link w-inline-block"
                >
                  <div className="header-social-icon"></div>
                </a>
                <a
                  href="https://x.com/"
                  target="_blank"
                  className="header-social-link w-inline-block"
                >
                  <div className="header-social-icon"></div>
                </a>
                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  className="header-social-link w-inline-block"
                >
                  <div className="header-social-icon"></div>
                </a>
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  className="header-social-link w-inline-block"
                >
                  <div className="header-social-icon"></div>
                </a>
              </div>
              <div className="header-btn">
                <Link
                  href="/contact"
                  data-wf--button--variant="secondary-bg"
                  data-w-id="8932a183-40ec-c216-e8b4-670b55f18dc8"
                  className="button-link w-inline-block"
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
            <div className="menu-button w-nav-button">
              <div className="menu-icon w-icon-nav-menu"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

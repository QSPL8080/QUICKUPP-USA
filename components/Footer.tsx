import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-wrap">
        <img
          src="/images/footer-bg.png"
          loading="lazy"
          sizes="(max-width: 673px) 100vw, 673px"
          srcSet="/images/footer-bg-p-500.png 500w, /images/footer-bg.png 673w"
          alt="Footer-bg"
          className="footer-bg"
        />
        <div className="w-layout-blockcontainer container-small w-container">
          <div className="footer-inner">
            <div className="footer-main-wrap">
              <div className="footer-main-link">
                <Link href="/" className="footer-link w-inline-block">
                  <div className="footer-link-text">/Home</div>
                </Link>
                <Link href="/about" className="footer-link w-inline-block">
                  <div className="footer-link-text">/About Us</div>
                </Link>
                <Link href="/services" className="footer-link w-inline-block">
                  <div className="footer-link-text">/Services</div>
                </Link>
                <Link href="/industries" className="footer-link w-inline-block">
                  <div className="footer-link-text">/Industries</div>
                </Link>
                <Link href="/blog" className="footer-link w-inline-block">
                  <div className="footer-link-text">/Blogs</div>
                </Link>
                <Link href="/career" className="footer-link w-inline-block">
                  <div className="footer-link-text">/Careers</div>
                </Link>
                <Link href="/contact" className="footer-link w-inline-block">
                  <div className="footer-link-text">/Contact</div>
                </Link>
              </div>
              <div className="footer-logo-wrap">
                <span className="qs-footer-brand-text">Quickupp Softech</span>
              </div>
              <div className="footer-contact-wrap">
                <a href="mailto:hello@quickuppsoftech.com" className="footer-contact-text">
                  hello@quickuppsoftech.com
                </a>
                <div className="footer-contact-text">United States</div>
                <div className="footer-social-icons">
                  <a
                    href="https://www.facebook.com/"
                    target="_blank"
                    className="footer-social-link w-inline-block"
                  >
                    <div className="icon"></div>
                  </a>
                  <a
                    href="https://x.com/"
                    target="_blank"
                    className="footer-social-link w-inline-block"
                  >
                    <div className="icon"></div>
                  </a>
                  <a
                    href="https://www.youtube.com/"
                    target="_blank"
                    className="footer-social-link w-inline-block"
                  >
                    <div className="icon"></div>
                  </a>
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    className="footer-social-link w-inline-block"
                  >
                    <div className="icon"></div>
                  </a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <div className="footer-bottom-wrap">
                <div className="footer-bottom-link-wrap">
                  <div className="footer-bottom-link-text">
                    Copyright &copy; {year}{" "}
                    <Link href="/" className="footer-bottom-link">
                      Quickupp Softech
                    </Link>
                    . All rights reserved.
                  </div>
                </div>
                <div className="footer-bottom-link-wrap">
                  <div className="footer-bottom-link-text">
                    <Link href="/services" className="footer-bottom-link">
                      Services
                    </Link>{" "}
                    |{" "}
                    <Link href="/industries" className="footer-bottom-link">
                      Industries
                    </Link>{" "}
                    |{" "}
                    <Link href="/faq-page" className="footer-bottom-link">
                      FAQ
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

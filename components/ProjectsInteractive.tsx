"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const projects = [
  {
    num: "01",
    date: "08.2025",
    title: "Content marketing",
    desc: "We don't just design. We build experiences that tell a story and leave a lasting impression.",
    img: "/images/project-01.jpg",
  },
  {
    num: "02",
    date: "10.2025",
    title: "Revenue Optimization",
    desc: "From insight to execution, we design experiences that strengthen brands and deliver value.",
    img: "/images/project-02.jpg",
  },
  {
    num: "03",
    date: "12.2025",
    title: "Campaign management",
    desc: "Smart marketing is more than visuals—it's about influence and performance.",
    img: "/images/project-03.jpg",
  },
  {
    num: "04",
    date: "04.2025",
    title: "Engagement Growth",
    desc: "Great brands are built on meaningful experiences that connect and perform.",
    img: "/images/project-04.jpg",
  },
];

export default function ProjectsInteractive() {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Scrollable distance is total track height minus 1 viewport height
      const totalScrollable = rect.height - windowH;
      if (totalScrollable <= 0) return;

      // Current scrolled distance through the track
      const scrolledDist = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolledDist / totalScrollable));

      // 4 steps (0, 1, 2, 3)
      let index = Math.floor(progress * projects.length);
      if (index >= projects.length) index = projects.length - 1;
      if (index < 0) index = 0;

      setActiveIndex(index);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className="project-section section-gap section-margin">
      <div className="w-layout-blockcontainer container w-container">
        <div ref={trackRef} className="project-height qs-project-track">
          <div className="project-one-sticky qs-project-sticky-box">
            {/* Background Watermark Pattern */}
            <img
              src="/images/footer-bg.png"
              loading="lazy"
              sizes="100vw"
              srcSet="/images/footer-bg-p-500.png 500w, /images/footer-bg.png 673w"
              alt="Footer-bg"
              className="project-one-bg-image qs-project-bg-watermark"
            />

            <div className="project-one-wrap qs-project-inner-wrap">
              {/* Top Header Row */}
              <div className="project-one-heading-wrap">
                <div>
                  <div className="heading-subtitle">
                    <div className="subtitle-head-wrap">
                      <div className="subtitle-left-icon"></div>
                      <div className="subtitle-head white-text">Our projects</div>
                    </div>
                    <div className="heading-title-animation">
                      <h2 className="heading-title big white-text">Latest <span className="qs-gradient-text">work</span></h2>
                    </div>
                  </div>
                </div>

                {/* Animated Date */}
                <div className="project-one-date-wrapper">
                  {projects.map((p, i) => (
                    <div
                      key={i}
                      className={`project-one-date qs-p-date ${i === activeIndex ? "is-active" : ""}`}
                    >
                      {p.date}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3-Column Interactive Layout (Left: Desc, Center: Image, Right: Title + CTA) */}
              <div className="project-one qs-project-layout-grid">
                {/* Left Column: Description */}
                <div className="project-one-left-column">
                  <div className="project-one-desc-wrap qs-p-desc-box">
                    {projects.map((p, i) => (
                      <div
                        key={i}
                        className={`project-one-desc qs-p-desc ${i === activeIndex ? "is-active" : ""}`}
                      >
                        <div className="qs-p-step-badge">
                          <span className="qs-p-step-num">{p.num}</span>
                          <span className="qs-p-step-divider">/</span>
                          <span className="qs-p-step-total">04</span>
                        </div>
                        <p className="qs-p-desc-text">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Center Column: Interactive Project Preview Image */}
                <div className="project-one-center-column">
                  <div className="project-one-image-wrap qs-p-image-box">
                    {projects.map((p, i) => (
                      <img
                        key={i}
                        src={p.img}
                        alt={p.title}
                        className={`project-one-image qs-p-img ${i === activeIndex ? "is-active" : ""}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Right Column: Title + View All Button */}
                <div className="project-one-right-column">
                  <div className="project-one-title-wrap qs-p-title-box">
                    {projects.map((p, i) => (
                      <div
                        key={i}
                        className={`project-one-title qs-p-title ${i === activeIndex ? "is-active" : ""}`}
                      >
                        {p.title}
                      </div>
                    ))}
                  </div>

                  <div className="button-wrap">
                    <Link
                      href="/portfolio"
                      data-wf--button--variant="secondary-bg"
                      className="button-link w-inline-block"
                    >
                      <div className="button-hover-overlay"></div>
                      <div className="button-text-wrapper">
                        <div className="button-text-wrap">
                          <div className="button-text">View all Projects</div>
                          <div className="button-text-hover">View all Projects</div>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

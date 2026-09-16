"use client";

import { useEffect, useRef, useState } from "react";

const PROJECTS = [
  {
    date: "08.2025",
    title: "Content marketing",
    desc: "We don't just design. We build experiences that tell a story and leave a lasting impression.",
    img: "project-01",
  },
  {
    date: "10.2025",
    title: "Revenue Optimization",
    desc: "From insight to execution, we design experiences that strengthen brands and deliver value.",
    img: "project-02",
  },
  {
    date: "12.2025",
    title: "Campaign management",
    desc: "Smart marketing is more than visuals—it's about influence and performance.",
    img: "project-03",
  },
  {
    date: "04.2025",
    title: "Engagement Growth",
    desc: "Great brands are built on meaningful experiences that connect and perform.",
    img: "project-04",
  },
];

export default function ProjectGallery() {
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) {
        setActive((a) => (a + 1) % PROJECTS.length);
      }
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="project-one-wrap"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      <div className="project-one-heading-wrap">
        <div>
          <div className="heading-subtitle">
            <div className="subtitle-head-wrap">
              <div className="subtitle-left-icon"></div>
              <div className="subtitle-head">Our projects</div>
            </div>
            <div className="heading-title-animation">
              <h2 className="heading-title big">Latest work</h2>
            </div>
          </div>
        </div>
        <div className="project-one-date-wrapper display-none-991">
          {PROJECTS.map((p, i) => (
            <div
              key={i}
              className={`project-one-date${i === active ? " qs-proj-active" : ""}`}
              onClick={() => setActive(i)}
            >
              {p.date}
            </div>
          ))}
        </div>
      </div>
      <div className="project-one display-none-991">
        <div className="project-one-left-column">
          <div className="project-one-desc-wrap">
            {PROJECTS.map((p, i) => (
              <div
                key={i}
                className={`project-one-desc${i === active ? " qs-proj-active" : ""}`}
              >
                {p.desc}
              </div>
            ))}
          </div>
        </div>
        <div className="project-one-center-column">
          <div className="project-one-image-wrap">
            {PROJECTS.map((p, i) => (
              <img
                key={i}
                src={`/images/${p.img}.jpg`}
                loading="lazy"
                alt={p.img}
                className={`project-one-image${i === active ? " qs-proj-active" : ""}`}
              />
            ))}
          </div>
        </div>
        <div className="project-one-right-column">
          <div className="project-one-title-wrap">
            {PROJECTS.map((p, i) => (
              <div
                key={i}
                className={`project-one-title${i === active ? " qs-proj-active" : ""}`}
                onClick={() => setActive(i)}
              >
                {p.title}
              </div>
            ))}
          </div>
          <div className="button-wrap">
            <a
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
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

const SERVICES = [
  {
    href: "/service/digital-marketing",
    title: "Digital Marketing",
    num: "{01}",
    img: "service-img-01",
    desc: "To become the most trusted partner for brands seeking digital transformation, brand reputation, and revenue growth.",
  },
  {
    href: "/service/advertising-services",
    title: "Advertising Services",
    num: "{02}",
    img: "service-img-02",
    desc: "Targeted ad campaigns are created and managed across digital platforms to boost visibility, engagement.",
  },
  {
    href: "/service/performance-marketing",
    title: "Performance Marketing",
    num: "{03}",
    img: "service-img-03",
    desc: "Driven by data and analytics, campaigns are continuously optimized to deliver measurable results, improved efficiency.",
  },
  {
    href: "/service/lead-generation",
    title: "Lead Generation",
    num: "{04}",
    img: "service-img-04",
    desc: "Qualified leads are captured through strategic funnels, paid media, and content designed to support business growth.",
  },
  {
    href: "/service/social-management",
    title: "Social Management",
    num: "{05}",
    img: "service-img-05",
    desc: "Social channels are managed with planned content, active engagement to strengthen brand presence",
  },
];

export default function ServiceOfferList() {
  const [active, setActive] = useState(0);

  return (
    <div className="home-one-service-wrapper">
      <div className="home-one-service-wrap">
        <div className="service-one-list-wrap w-dyn-list">
          <div role="list" className="service-one-list w-dyn-items">
            {SERVICES.map((service, i) => (
              <div
                key={i}
                role="listitem"
                className={`service-one w-dyn-item${i === active ? " is-active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                <a href={service.href} className="service-one-wrap w-inline-block">
                  <div className="home-one-service-text-wrap">
                    <div className="home-one-service-text">{service.desc}</div>
                  </div>
                  <div className="service-one-heading-wrap">
                    <div className="service-one-contents">
                      <img
                        src="/images/secondary-left-icon.svg"
                        loading="lazy"
                        alt="secondary-left-icon"
                        className="service-one-icon"
                      />
                      <div className="service-one-title-number-wrap">
                        <div className="service-one-title-wrap">
                          <div className="service-one-title">{service.title}</div>
                          <div className="home-one-service-text two">{service.desc}</div>
                        </div>
                        <div className="service-one-number">{service.num}</div>
                      </div>
                    </div>
                    <div className="service-one-image-wrap">
                      <img
                        src={`/images/${service.img}.jpg`}
                        loading="lazy"
                        alt={service.img}
                        sizes="100vw"
                        srcSet={`/images/${service.img}-p-500.jpg 500w, /images/${service.img}-p-800.jpg 800w, /images/${service.img}-p-1080.jpg 1080w, /images/${service.img}.jpg 1520w`}
                        className="service-one-image"
                      />
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
        <div className="button-wrap service-style-one-button">
          <a
            href="/services"
            data-wf--button--variant="secondary-bg"
            className="button-link w-inline-block"
          >
            <div className="button-hover-overlay"></div>
            <div className="button-text-wrapper">
              <div className="button-text-wrap">
                <div className="button-text">View All Services</div>
                <div className="button-text-hover">View All Services</div>
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
  );
}

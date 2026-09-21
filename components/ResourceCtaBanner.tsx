"use client";

import React from "react";
import Link from "next/link";

interface ResourceCtaBannerProps {
  tag?: string;
  title?: string;
  titleAccent?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export default function ResourceCtaBanner({
  tag = "GET STARTED",
  title = "Your First Step Toward Scalable Growth",
  titleAccent = "Starts Here",
  primaryHref = "/contact",
  primaryLabel = "Schedule a Strategy Call",
  secondaryHref = "/case-studies",
  secondaryLabel = "Explore Case Studies",
}: ResourceCtaBannerProps) {
  return (
    <section className="res-cta-section">
      <div className="res-container">
        <div className="res-cta-box">
          {/* Subtle background tech graphic overlay */}
          <div className="res-cta-bg-graphic" aria-hidden="true">
            <svg
              viewBox="0 0 600 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="res-cta-svg-pattern"
            >
              {/* Tech DNA / Growth Wave Pattern */}
              <path
                d="M50 250 C150 50, 250 280, 350 120 C450 -20, 520 220, 580 80"
                stroke="rgba(124, 58, 237, 0.16)"
                strokeWidth="2.5"
                strokeDasharray="6 6"
              />
              <path
                d="M80 280 C180 90, 280 300, 380 150 C480 20, 540 250, 600 110"
                stroke="rgba(2, 132, 199, 0.16)"
                strokeWidth="2.5"
              />
              <circle cx="350" cy="120" r="6" fill="#7c3aed" fillOpacity="0.25" />
              <circle cx="450" cy="50" r="4" fill="#0284c7" fillOpacity="0.3" />
              <circle cx="520" cy="220" r="5" fill="#10b981" fillOpacity="0.25" />
            </svg>
          </div>

          <div className="res-cta-content">
            <div className="res-tag">
              <span className="res-tag-dot"></span>
              {tag}
            </div>

            <h2 className="res-cta-heading">
              {title} <span className="res-heading-accent">{titleAccent}</span>
            </h2>

            <div className="res-cta-btn-group">
              <Link href={primaryHref} className="res-btn-dark">
                {primaryLabel}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </Link>

              {secondaryHref && secondaryLabel && (
                <Link href={secondaryHref} className="res-btn-ghost">
                  {secondaryLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";

interface CaseStudyDiagramCardProps {
  src: string;
  caption?: string;
  title?: string;
  alt?: string;
}

export default function CaseStudyDiagramCard({
  src,
  caption,
  title,
  alt,
}: CaseStudyDiagramCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <figure className="csd-diagram-card">
        <div className="csd-diagram-header">
          <div className="csd-diagram-header-left">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span className="csd-diagram-header-title">
              {title || "Performance Data Diagram"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="csd-diagram-expand-btn"
            title="Click to expand chart"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            Expand Chart
          </button>
        </div>

        <div
          className="csd-diagram-img-wrap"
          onClick={() => setIsOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsOpen(true);
          }}
          title="Click to view full resolution"
        >
          <img
            src={src}
            alt={alt || caption || "Performance chart"}
            className="csd-diagram-img"
            loading="lazy"
          />
          <div className="csd-diagram-hover-hint">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            Click to expand
          </div>
        </div>

        {caption && (
          <figcaption className="csd-diagram-caption">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: "2px" }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>{caption}</span>
          </figcaption>
        )}
      </figure>

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          className="csd-lightbox-backdrop"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="csd-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="csd-lightbox-header">
              <span className="csd-lightbox-title">
                {title || caption || "Performance Data Diagram"}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="csd-lightbox-close"
                aria-label="Close chart preview"
              >
                &times;
              </button>
            </div>
            <div className="csd-lightbox-body">
              <img
                src={src}
                alt={alt || caption || "Performance chart"}
                className="csd-lightbox-img"
              />
            </div>
            {caption && (
              <div className="csd-lightbox-footer">
                <span>{caption}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

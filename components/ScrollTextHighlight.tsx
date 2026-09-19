"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollTextHighlight() {
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;
    const headingEntries: { el: HTMLElement; words: HTMLElement[]; isDark: boolean }[] = [];

    const processHeading = (heading: HTMLElement) => {
      if (heading.dataset.scrollProcessed === "true") return null;
      heading.dataset.scrollProcessed = "true";

      const text = heading.textContent || "";
      const words = text.trim().split(/\s+/);
      if (words.length === 0 || (words.length === 1 && words[0] === "")) return null;

      const isDark =
        heading.classList.contains("dark") ||
        heading.closest(".dark-section") !== null;

      heading.innerHTML = "";
      const wordElements: HTMLElement[] = [];

      words.forEach((w, idx) => {
        const span = document.createElement("span");
        span.className = "qs-scroll-word";
        span.setAttribute("data-word-idx", String(idx));
        span.textContent = w;
        heading.appendChild(span);
        wordElements.push(span);
      });

      return {
        el: heading,
        words: wordElements,
        isDark,
      };
    };

    const setupHeadings = () => {
      const selectors = [
        // Homepage heading selectors
        ".heading-title-animation .heading-title",
        ".heading-title-animation h2",
        ".home-about-heading .heading-title",
        ".counter-three-heading .heading-title",
        ".service-heading",
        ".blog-section .heading-title",
        ".testimonial-one-heading",
        // ScaleForge about pages (WhyChooseUs, WhoWeAre, OurApproach, OurTeam)
        ".sf-video-heading",
        ".sf-methodology-title",
        ".sf-cta-title",
        // Meridian service pages
        ".ms-section-title",
        ".ms-callout-heading",
        ".ms-ai-title",
        ".ms-closing-title",
        // Adventria service pages
        ".rt-text-style-h2",
        // IT Lifecycle service pages
        ".lc-section-title",
        ".lc-faq-heading",
        ".lc-cta-title",
        // Ritovex service pages (scoped to avoid global matches)
        ".rx-services-section .section-title",
        ".rx-cta-section .cta-title",
        // Generic data attribute opt-in
        "[data-scroll-highlight]",
      ];

      const elements = Array.from(
        document.querySelectorAll<HTMLElement>(selectors.join(", "))
      );

      elements.forEach((el) => {
        // Skip hero sections — they have their own entrance animations
        if (el.closest(".hero-one-title-wrap, .hero-slider, .w-slider, .sf-hero-section, .ms-hero-section, .rt-hero-section, .lc-hero-section, .rx-hero-section")) return;

        const entry = processHeading(el);
        if (entry) {
          headingEntries.push(entry);
        }
      });

      updateScroll();
    };

    // Calculate highlight progress per heading based on scroll position (row-by-row / sentence-by-sentence)
    const updateScroll = () => {
      const windowH = window.innerHeight;

      headingEntries.forEach((item) => {
        const rect = item.el.getBoundingClientRect();

        // If completely below viewport
        if (rect.top > windowH) {
          item.words.forEach((w) => w.classList.remove("is-active"));
          return;
        }

        // Use bottom of element so headings near page bottom still fully reveal
        const refPoint = rect.top + rect.height * 0.5;

        // Trigger start when midpoint reaches 90% down the viewport
        // Trigger end when midpoint reaches 45% down the viewport
        const triggerStart = windowH * 0.90;
        const triggerEnd = windowH * 0.45;
        const totalDistance = triggerStart - triggerEnd;

        let progress = 0;
        if (refPoint <= triggerEnd) {
          progress = 1;
        } else if (refPoint < triggerStart) {
          progress = (triggerStart - refPoint) / totalDistance;
          progress = Math.max(0, Math.min(1, progress));
        }

        // Group words by visual row (offsetTop)
        const rows: HTMLElement[][] = [];
        let currentRow: HTMLElement[] = [];
        let lastTop = -9999;

        item.words.forEach((wordEl) => {
          const top = wordEl.offsetTop;
          if (Math.abs(top - lastTop) > 6) {
            if (currentRow.length > 0) {
              rows.push(currentRow);
            }
            currentRow = [wordEl];
            lastTop = top;
          } else {
            currentRow.push(wordEl);
          }
        });
        if (currentRow.length > 0) {
          rows.push(currentRow);
        }

        const totalRows = rows.length;
        if (totalRows <= 1) {
          // If only 1 row, activate word by word across the row
          const totalWords = item.words.length;
          item.words.forEach((wordEl, idx) => {
            const wordThreshold = (idx + 0.3) / totalWords;
            if (progress >= wordThreshold) {
              wordEl.classList.add("is-active");
            } else {
              wordEl.classList.remove("is-active");
            }
          });
        } else {
          // If multiple rows: activate row by row (and word by word within that active row)
          rows.forEach((rowWords, rowIndex) => {
            const rowStart = rowIndex / totalRows;
            const rowEnd = (rowIndex + 1) / totalRows;

            if (progress >= rowEnd) {
              // Whole row is fully passed -> all words active
              rowWords.forEach((w) => w.classList.add("is-active"));
            } else if (progress < rowStart) {
              // Row has not been reached yet -> all words inactive
              rowWords.forEach((w) => w.classList.remove("is-active"));
            } else {
              // Currently scrolling through this specific row
              const rowProgress = (progress - rowStart) / (rowEnd - rowStart);
              const numWordsInRow = rowWords.length;
              rowWords.forEach((w, wIdx) => {
                const wThresh = (wIdx + 0.3) / numWordsInRow;
                if (rowProgress >= wThresh) {
                  w.classList.add("is-active");
                } else {
                  w.classList.remove("is-active");
                }
              });
            }
          });
        }
      });

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    setupHeadings();
    const t1 = setTimeout(setupHeadings, 100);
    const t2 = setTimeout(setupHeadings, 500);
    const t3 = setTimeout(setupHeadings, 1500);

    const observer = new MutationObserver(() => {
      setupHeadings();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return null;
}

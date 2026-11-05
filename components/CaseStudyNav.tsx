"use client";

import { useEffect, useState } from "react";

/*
 * Case study detail: the reading progress bar along the top, the "on this
 * page" navigator that follows the section you are reading, and the gentle
 * rise of each block as it scrolls into view.
 */
export default function CaseStudyNav({ items, label = "On this page" }: { items: { id: string; label: string }[]; label?: string }) {
  const [active, setActive] = useState(items[0]?.id || "");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>(".cd-article");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (article) {
        const r = article.getBoundingClientRect();
        const total = Math.max(1, r.height - window.innerHeight * 0.6);
        setProgress(Math.min(1, Math.max(0, (window.innerHeight * 0.3 - r.top) / total)));
      }
      // the current section is the last one whose top has passed a line near the top
      let cur = items[0]?.id || "";
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) cur = it.id;
      }
      setActive(cur);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // blocks rise in as they come into view
    const els = Array.from(document.querySelectorAll<HTMLElement>(".cd-page [data-cs-reveal]"));
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-in"));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              io?.unobserve(e.target);
            }
          }
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      );
      els.forEach((el) => io?.observe(el));
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      io?.disconnect();
    };
  }, [items]);

  return (
    <>
      <div className="cd-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
      <nav className="cd-toc" aria-label={label}>
        <p className="cd-toc-label">{label}</p>
        <ol>
          {items.map((it, i) => (
            <li key={it.id}>
              <a href={`#${it.id}`} className={it.id === active ? "is-on" : undefined} aria-current={it.id === active ? "true" : undefined}>
                <span className="cd-toc-n">{String(i + 1).padStart(2, "0")}</span>
                <span>{it.label}</span>
              </a>
            </li>
          ))}
        </ol>
        <span className="cd-toc-meter" aria-hidden="true">
          <span style={{ transform: `scaleY(${progress})` }} />
        </span>
      </nav>
    </>
  );
}

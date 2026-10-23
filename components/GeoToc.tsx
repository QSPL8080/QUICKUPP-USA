"use client";

import { useEffect, useState } from "react";

/*
 * Sticky side navigation for the location pages: lists the page's sections
 * (or service categories), highlights the one being read and fills a thin
 * progress line as you scroll.
 */
export default function GeoToc({
  items,
  title,
}: {
  items: { id: string; label: string; count?: number }[];
  title?: React.ReactNode;
}) {
  const [active, setActive] = useState(items[0]?.id);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.32;
      let current = items[0]?.id;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= line) current = it.id;
      }
      setActive(current);
      const first = document.getElementById(items[0]?.id || "");
      const last = document.getElementById(items[items.length - 1]?.id || "");
      if (first && last) {
        const start = first.getBoundingClientRect().top + window.scrollY - line;
        const end = last.getBoundingClientRect().bottom + window.scrollY - window.innerHeight * 0.6;
        const p = (window.scrollY - start) / Math.max(1, end - start);
        setProgress(Math.min(1, Math.max(0, p)));
      }
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [items]);

  return (
    <nav className="geo-toc" aria-label="On this page">
      {title && <div className="geo-toc-title">{title}</div>}
      <div className="geo-toc-track">
        <span className="geo-toc-fill" style={{ transform: `scaleY(${progress})` }} aria-hidden="true" />
        <ol className="geo-toc-list">
          {items.map((it, i) => (
            <li key={it.id}>
              <a href={`#${it.id}`} className={`geo-toc-link${active === it.id ? " is-active" : ""}`}>
                <span className="geo-toc-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="geo-toc-label">{it.label}</span>
                {typeof it.count === "number" && <span className="geo-toc-count">{it.count}</span>}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

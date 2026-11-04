"use client";

import { useEffect, useRef } from "react";

/*
 * Reading bar across the top of a blog and the "current section" mark in the
 * side list. Works on the server-rendered article; renders only the bar.
 */
export default function BlogReadingAids({ ids }: { ids: string[] }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>(".bld-article");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!article || !barRef.current) return;
      const r = article.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      const done = Math.min(1, Math.max(0, (window.innerHeight * 0.4 - r.top) / Math.max(1, total)));
      barRef.current.style.transform = `scaleX(${done})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!ids.length || typeof IntersectionObserver === "undefined") return;
    const links = new Map<string, HTMLElement>();
    document.querySelectorAll<HTMLElement>("[data-toc]").forEach((a) => links.set(a.dataset.toc || "", a));
    const visible = new Set<string>();
    const mark = () => {
      const current = ids.find((id) => visible.has(id));
      if (!current) return;
      links.forEach((a, id) => a.classList.toggle("is-current", id === current));
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
        mark();
      },
      { rootMargin: "-20% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);

  return (
    <div className="bld-progress" aria-hidden="true">
      <div ref={barRef} className="bld-progress-bar" />
    </div>
  );
}

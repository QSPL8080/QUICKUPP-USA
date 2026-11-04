"use client";

import { useEffect } from "react";

/*
 * Home page motion. Everything on the page is server-rendered and readable
 * without this; it only adds:
 *   [data-hx]          → gets .is-in when it scrolls into view (the CSS decides the effect)
 *   [data-hx-count]    → counts up from 0 to its number once visible
 *   [data-hx-track]    → sets --hx-p (0 → 1) as the element passes through the viewport
 *   [data-hx-tilt]     → follows the pointer a little (desktop only)
 * Reduced-motion users get everything shown at once.
 */
export default function HomeMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".hx-page");
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("hx-js");

    const reveal = Array.from(root.querySelectorAll<HTMLElement>("[data-hx]"));
    const counters = Array.from(root.querySelectorAll<HTMLElement>("[data-hx-count]"));

    const count = (el: HTMLElement) => {
      const end = Number(el.dataset.hxCount || 0);
      if (reduce) {
        el.textContent = end.toLocaleString("en-US");
        return;
      }
      const start = performance.now();
      const dur = 1600;
      const step = (t: number) => {
        const k = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - k, 4);
        el.textContent = Math.round(end * eased).toLocaleString("en-US");
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (reduce || typeof IntersectionObserver === "undefined") {
      reveal.forEach((el) => el.classList.add("is-in"));
      counters.forEach(count);
    }

    const io =
      !reduce && typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((e) => {
                if (!e.isIntersecting) return;
                const el = e.target as HTMLElement;
                if (el.dataset.hxCount !== undefined) count(el);
                else el.classList.add("is-in");
                io?.unobserve(el);
              });
            },
            { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
          )
        : null;
    if (io) {
      reveal.forEach((el) => io.observe(el));
      counters.forEach((el) => io.observe(el));
    }

    // scroll-linked progress (process line, why-us line, section lighting)
    const tracks = Array.from(root.querySelectorAll<HTMLElement>("[data-hx-track]"));
    const sections = Array.from(root.querySelectorAll<HTMLElement>(".hx-section"));
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      tracks.forEach((el) => {
        const r = el.getBoundingClientRect();
        const p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.75 - r.top) / Math.max(1, r.height)));
        el.style.setProperty("--hx-p", p.toFixed(3));
      });
      const line = vh * 0.55;
      sections.forEach((sec) => {
        sec.classList.toggle("is-lit", sec.getBoundingClientRect().top < line);
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // pointer tilt
    const tilts = Array.from(root.querySelectorAll<HTMLElement>("[data-hx-tilt]"));
    const fine = window.matchMedia("(pointer: fine)").matches;
    const moves: [HTMLElement, (e: PointerEvent) => void, () => void][] = [];
    if (fine && !reduce) {
      tilts.forEach((el) => {
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty("--hx-mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
          el.style.setProperty("--hx-my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
        };
        const leave = () => {
          el.style.setProperty("--hx-mx", "0");
          el.style.setProperty("--hx-my", "0");
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        moves.push([el, move, leave]);
      });
    }

    // spotlight on industry cards
    const spot = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>(".hx-ind-card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--hx-sx", `${e.clientX - r.left}px`);
      card.style.setProperty("--hx-sy", `${e.clientY - r.top}px`);
    };
    root.addEventListener("pointermove", spot);

    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      moves.forEach(([el, move, leave]) => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      });
      root.removeEventListener("pointermove", spot);
    };
  }, []);

  return null;
}

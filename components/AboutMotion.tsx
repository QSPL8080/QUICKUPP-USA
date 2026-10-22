"use client";

import { useEffect, useRef } from "react";
import "@/app/about-motion.css";

/*
 * Scroll-in animations for the About subpages.
 * Adds motion only — it never changes content or styling. Each section gets
 * its own entrance (masked headings, image wipes, split slides, cascading
 * cards with a rotating effect), and each page starts the rotation at a
 * different point so no two pages feel the same. Sticky columns and their
 * parents are never transformed. Respects prefers-reduced-motion.
 */

type Anim = "hero-title" | "rise" | "line" | "mask" | "left" | "right" | "tilt" | "flip" | "pop" | "zoom" | "glide";

const ITEM_ANIMS: Anim[] = ["tilt", "flip", "rise", "pop", "zoom", "glide"];
const MAX_TARGETS_PER_SECTION = 40;

function signature(el: Element) {
  return `${el.tagName}.${(el.getAttribute("class") || "").trim().split(/\s+/)[0] || ""}`;
}

/** An element whose children are 3+ repeated items (cards, list rows, chips…) */
function isGroup(el: Element) {
  const kids = Array.from(el.children).filter((k) => !(k instanceof HTMLScriptElement));
  if (kids.length < 3) return false;
  const counts = new Map<string, number>();
  kids.forEach((k) => counts.set(signature(k), (counts.get(signature(k)) || 0) + 1));
  const top = Math.max(...counts.values());
  return top / kids.length >= 0.7;
}

/** Two or more children laid out side by side */
function isSplitRow(el: HTMLElement) {
  const kids = Array.from(el.children) as HTMLElement[];
  if (kids.length < 2 || kids.length > 3) return false;
  const parentW = el.getBoundingClientRect().width;
  const rects = kids.map((k) => k.getBoundingClientRect());
  const sameRow = rects.every((r) => Math.abs(r.top - rects[0].top) < 40);
  const narrow = rects.every((r) => r.width < parentW * 0.75 && r.width > 40);
  return sameRow && narrow;
}

const isMedia = (el: Element) =>
  el.matches("img, picture, video, svg.mx-illustration") ||
  /(^|[\s_-])(img|image|photo|visual|media|thumb)([\s_-]|$)/i.test(el.getAttribute("class") || "");

const isTextBlock = (el: Element) => el.matches("p, a, button, ul, ol, blockquote, h3, h4, h5, h6, span, label, form");

export default function AboutMotion({ seed = 0 }: { seed?: number }) {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = anchorRef.current?.parentElement;
    if (!root) return;

    const sections = Array.from(root.querySelectorAll("section")).filter(
      (s) => !s.closest("header, footer") && !s.parentElement?.closest("section")
    );

    // Elements that hold a sticky column: never transform these or the sticky element
    const blocked = new Set<Element>();
    root.querySelectorAll<HTMLElement>("*").forEach((el) => {
      if (getComputedStyle(el).position === "sticky") {
        let p: Element | null = el;
        while (p && p !== root) {
          blocked.add(p);
          p = p.parentElement;
        }
      }
    });

    const targets: { el: HTMLElement; anim: Anim; delay: number; hero: boolean }[] = [];

    sections.forEach((section, sIdx) => {
      const isHero = sIdx === 0;
      const itemAnim = ITEM_ANIMS[(sIdx + seed) % ITEM_ANIMS.length];
      const list: { el: HTMLElement; anim: Anim; delay: number; hero: boolean }[] = [];
      let groupCount = 0;

      const add = (el: HTMLElement, anim: Anim, delay = 0) => {
        if (list.length >= MAX_TARGETS_PER_SECTION) return;
        if (blocked.has(el)) return;
        list.push({ el, anim, delay, hero: isHero });
      };

      const walk = (el: HTMLElement, depth: number) => {
        if (depth > 7 || list.length >= MAX_TARGETS_PER_SECTION) return;
        for (const child of Array.from(el.children) as HTMLElement[]) {
          const cs = getComputedStyle(child);
          if (cs.position === "absolute" || cs.position === "fixed" || cs.display === "none") continue;
          const rect = child.getBoundingClientRect();
          if (rect.height < 4 || rect.width < 4) continue;
          if (cs.position === "sticky") {
            walk(child, depth + 1);
            continue;
          }

          if (child.matches("h1")) {
            add(child, isHero ? "hero-title" : "line");
            continue;
          }
          if (child.matches("h2")) {
            add(child, "line");
            continue;
          }
          if (isGroup(child) && !blocked.has(child)) {
            const kids = (Array.from(child.children) as HTMLElement[]).filter((k) => k.getBoundingClientRect().height > 4);
            const anim = isHero ? "rise" : ITEM_ANIMS[(sIdx + seed + groupCount) % ITEM_ANIMS.length] || itemAnim;
            groupCount += 1;
            kids.slice(0, 16).forEach((k, i) => add(k, anim, Math.min(i, 10) * 0.08));
            continue;
          }
          if (isGroup(child) && blocked.has(child)) {
            // e.g. a scrolling list next to a sticky column: animate the items themselves
            (Array.from(child.children) as HTMLElement[]).forEach((k) => {
              if (blocked.has(k)) walk(k, depth + 1);
              else add(k, itemAnim, 0);
            });
            continue;
          }
          if (isMedia(child) && rect.height < 1100) {
            add(child, "mask");
            continue;
          }
          if (!blocked.has(child) && depth <= 4 && isSplitRow(child)) {
            const kids = Array.from(child.children) as HTMLElement[];
            kids.forEach((k, i) => {
              if (blocked.has(k)) walk(k, depth + 1);
              else add(k, i === 0 ? "left" : i === kids.length - 1 ? "right" : "rise", i * 0.08);
            });
            continue;
          }
          if (isTextBlock(child) || child.children.length === 0) {
            add(child, "rise");
            continue;
          }
          walk(child, depth + 1);
        }
      };

      walk(section, 0);

      // Hero plays as one timeline on load
      if (isHero) list.forEach((t, i) => (t.delay = 0.1 + i * 0.09));
      targets.push(...list);
    });

    // Hide only what is about to animate (content stays visible without JS)
    targets.forEach((t) => {
      t.el.classList.add("am-pending");
      t.el.dataset.amAnim = t.anim;
      t.el.style.setProperty("--am-delay", `${t.delay}s`);
    });

    const play = (el: HTMLElement) => {
      const anim = el.dataset.amAnim;
      if (!anim) return;
      el.classList.add("am-in", `am-${anim}`);
      const done = (e: AnimationEvent) => {
        if (e.target !== el) return;
        el.classList.remove("am-pending", "am-in", `am-${anim}`);
        el.style.removeProperty("--am-delay");
        delete el.dataset.amAnim;
        el.removeEventListener("animationend", done);
      };
      el.addEventListener("animationend", done);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            play(entry.target as HTMLElement);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach((t) => io.observe(t.el));

    // Safety net: never leave anything hidden (e.g. very tall elements)
    const safety = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>(".am-pending:not(.am-in)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) play(el);
      });
    }, 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(safety);
      targets.forEach((t) => {
        t.el.classList.remove("am-pending", "am-in", `am-${t.anim}`);
        t.el.style.removeProperty("--am-delay");
        delete t.el.dataset.amAnim;
      });
    };
  }, [seed]);

  return <span ref={anchorRef} hidden aria-hidden="true" />;
}

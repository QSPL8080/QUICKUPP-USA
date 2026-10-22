"use client";

import { useEffect, useRef } from "react";
import "@/app/tech-motion.css";
import { setupScrollMotion, type MotionPreset } from "@/lib/scrollMotion";

/*
 * Scroll-in animations for the Information Technology Services subpages
 * (motion only — no content or styling changes). A "code" effect set used
 * nowhere else: headings rise in word by word behind a mask, text scans
 * in from top to bottom, images fade up and settle, split rows slide
 * in on a skew, and cards unfold like doors, step in like loading blocks or
 * skate in at an angle.
 */

const TECH_PRESET: MotionPreset = {
  prefix: "tm",
  heroTitle: "scan",
  hero: "boot",
  heading: "scan",
  text: "scan",
  media: "settle",
  splitFirst: "skew-l",
  splitMiddle: "boot",
  splitLast: "skew-r",
  items: ["fold", "blocks", "skate"],
  stagger: 0.08,
  heroStep: 0.1,
  // Headings and the industries grid get their own reveals below
  skip: "h1, h2, .copora-industries-grid",
};

/**
 * Wraps each word of a heading in a mask so the words can rise in one after
 * another. Words inside gradient text get the same gradient, positioned to
 * match, so colours look identical. restore() puts the original text back.
 */
function splitWords(el: HTMLElement) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) {
    const n = walker.currentNode as Text;
    if (n.nodeValue && n.nodeValue.trim()) texts.push(n);
  }
  const inserted: { original: Text; nodes: Node[] }[] = [];
  const words: HTMLElement[] = [];
  texts.forEach((t) => {
    const frag = document.createDocumentFragment();
    const nodes: Node[] = [];
    (t.nodeValue || "").split(/(\s+)/).forEach((tok) => {
      if (!tok) return;
      if (/^\s+$/.test(tok)) {
        const sp = document.createTextNode(tok);
        nodes.push(sp);
        frag.appendChild(sp);
        return;
      }
      const outer = document.createElement("span");
      outer.className = "tm-w";
      const inner = document.createElement("span");
      inner.className = "tm-wi";
      inner.textContent = tok;
      outer.appendChild(inner);
      nodes.push(outer);
      words.push(inner);
      frag.appendChild(outer);
    });
    t.parentNode?.insertBefore(frag, t);
    t.parentNode?.removeChild(t);
    inserted.push({ original: t, nodes });
  });

  // Gradient text: give each word the parent's gradient at the right offset
  words.forEach((w) => {
    let a: HTMLElement | null = w.parentElement?.parentElement || null;
    while (a && a !== el.parentElement) {
      const cs = getComputedStyle(a);
      const clip = cs.backgroundClip || (cs as unknown as Record<string, string>).webkitBackgroundClip;
      if (clip === "text" && cs.backgroundImage !== "none") break;
      a = a.parentElement;
    }
    if (!a || a === el.parentElement) return;
    const frags = Array.from(a.getClientRects());
    const r = (w.parentElement as HTMLElement).getBoundingClientRect();
    let k = frags.findIndex((f) => r.top + r.height / 2 >= f.top && r.top + r.height / 2 <= f.bottom);
    if (k < 0) k = 0;
    const before = frags.slice(0, k).reduce((sum, f) => sum + f.width, 0);
    const total = frags.reduce((sum, f) => sum + f.width, 0);
    const f = frags[k];
    w.classList.add("tm-wg");
    w.style.backgroundImage = getComputedStyle(a).backgroundImage;
    w.style.backgroundSize = `${total}px ${f.height}px`;
    w.style.backgroundPosition = `${-(before + r.left - f.left)}px ${-(r.top - f.top)}px`;
  });

  words.forEach((w, i) => w.style.setProperty("--tm-wd", `${Math.min(i, 14) * 0.055}s`));

  const restore = () => {
    inserted.forEach(({ original, nodes }) => {
      const first = nodes[0];
      if (first && first.parentNode) first.parentNode.insertBefore(original, first);
      nodes.forEach((n) => n.parentNode?.removeChild(n));
    });
    el.classList.remove("tm-words", "tm-words-in");
  };
  return { restore, count: words.length };
}

export default function TechMotion({ seed = 0 }: { seed?: number }) {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchorRef.current?.parentElement;
    if (!root) return;
    const cleanupMotion = setupScrollMotion(root, TECH_PRESET, seed);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return cleanupMotion;

    // Headings: words rise in one after another as each heading comes into view
    const restores = new Map<HTMLElement, () => void>();
    const timers: number[] = [];
    const headings = Array.from(root.querySelectorAll<HTMLElement>("section h1, section h2")).filter(
      (h) => !h.closest("header, footer")
    );
    const play = (el: HTMLElement) => {
      const entry = restores.get(el);
      if (!entry || el.classList.contains("tm-words-in")) return;
      const count = Number(el.dataset.tmWords || "0");
      const lead = el.tagName === "H1" ? 0.15 : 0;
      el.style.setProperty("--tm-lead", `${lead}s`);
      el.classList.add("tm-words-in");
      const total = (lead + Math.min(count - 1, 14) * 0.055 + 0.95) * 1000 + 80;
      timers.push(
        window.setTimeout(() => {
          entry();
          restores.delete(el);
          delete el.dataset.tmWords;
          el.style.removeProperty("--tm-lead");
        }, total)
      );
    };
    headings.forEach((h) => {
      const { restore, count } = splitWords(h);
      h.dataset.tmWords = String(count);
      h.classList.add("tm-words");
      restores.set(h, restore);
    });
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          play(e.target as HTMLElement);
        }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    headings.forEach((h) => io.observe(h));
    // Industries grid: tiles ripple out from the centre, arrows slide in after
    const grids = Array.from(root.querySelectorAll<HTMLElement>(".copora-industries-grid"));
    const finishGrid = (g: HTMLElement) => {
      g.classList.remove("tm-ind", "tm-ind-in");
      Array.from(g.children).forEach((c) => (c as HTMLElement).style.removeProperty("--tm-d"));
    };
    const playGrid = (g: HTMLElement) => {
      if (!g.classList.contains("tm-ind") || g.classList.contains("tm-ind-in")) return;
      g.classList.add("tm-ind-in");
      timers.push(window.setTimeout(() => finishGrid(g), 1900));
    };
    grids.forEach((g) => {
      const gr = g.getBoundingClientRect();
      const cx = gr.left + gr.width / 2;
      const cy = gr.top + gr.height / 2;
      const tiles = Array.from(g.children) as HTMLElement[];
      const dists = tiles.map((t) => {
        const r = t.getBoundingClientRect();
        return Math.hypot(r.left + r.width / 2 - cx, (r.top + r.height / 2 - cy) * 1.6);
      });
      const max = Math.max(1, ...dists);
      tiles.forEach((t, i) => t.style.setProperty("--tm-d", `${((dists[i] / max) * 0.45).toFixed(3)}s`));
      g.classList.add("tm-ind");
    });
    const gio = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          gio.unobserve(e.target);
          playGrid(e.target as HTMLElement);
        }),
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    grids.forEach((g) => gio.observe(g));

    // Safety net: never leave an on-screen heading hidden
    timers.push(
      window.setTimeout(() => {
        headings.forEach((h) => {
          const r = h.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) play(h);
        });
        grids.forEach((g) => {
          const r = g.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) playGrid(g);
        });
      }, 2500)
    );

    return () => {
      io.disconnect();
      gio.disconnect();
      grids.forEach(finishGrid);
      timers.forEach((t) => window.clearTimeout(t));
      restores.forEach((r) => r());
      cleanupMotion();
    };
  }, [seed]);

  return <span ref={anchorRef} hidden aria-hidden="true" />;
}

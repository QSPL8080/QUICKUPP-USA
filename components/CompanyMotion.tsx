"use client";

import { useEffect, useRef } from "react";
import "@/app/company-motion.css";
import { setupScrollMotion, type MotionPreset } from "@/lib/scrollMotion";

/*
 * Scroll-in animations for the Contact and Careers pages (motion only — no
 * content or styling changes). Its own effect set, different from the About
 * and Industries pages: tracking-in hero title, curtain-open headings,
 * drifting text, diamond image reveals, rows that meet from opposite corners
 * and rotating card motions (fan, stretch, spin, ripple, flip-down).
 */

const COMPANY_PRESET: MotionPreset = {
  prefix: "cm",
  heroTitle: "track",
  hero: "unfold",
  heading: "curtain",
  text: "drift",
  media: "diamond",
  splitFirst: "corner-tl",
  splitMiddle: "unfold",
  splitLast: "corner-br",
  items: ["fan-l|fan-r", "stretch", "spin", "ripple", "flipdown"],
  stagger: 0.075,
  heroStep: 0.08,
  // The careers manifesto already has its own word-by-word scroll highlight
  skip: ".sc-manifesto-text-center",
};

export default function CompanyMotion({ seed = 0 }: { seed?: number }) {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchorRef.current?.parentElement;
    if (!root) return;
    return setupScrollMotion(root, COMPANY_PRESET, seed);
  }, [seed]);

  return <span ref={anchorRef} hidden aria-hidden="true" />;
}

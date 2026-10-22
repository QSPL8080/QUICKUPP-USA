"use client";

import { useEffect, useRef } from "react";
import "@/app/about-motion.css";
import { setupScrollMotion, type MotionPreset } from "@/lib/scrollMotion";

/*
 * Scroll-in animations for the About subpages (motion only — no content or
 * styling changes). Masked headings, image wipes, split slides and cascading
 * cards; each page starts the card-effect rotation at a different point.
 */

const ABOUT_PRESET: MotionPreset = {
  prefix: "am",
  heroTitle: "hero-title",
  hero: "rise",
  heading: "line",
  text: "rise",
  media: "mask",
  splitFirst: "left",
  splitMiddle: "rise",
  splitLast: "right",
  items: ["tilt", "flip", "rise", "pop", "zoom", "glide"],
  stagger: 0.08,
  heroStep: 0.09,
};

export default function AboutMotion({ seed = 0 }: { seed?: number }) {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchorRef.current?.parentElement;
    if (!root) return;
    return setupScrollMotion(root, ABOUT_PRESET, seed);
  }, [seed]);

  return <span ref={anchorRef} hidden aria-hidden="true" />;
}

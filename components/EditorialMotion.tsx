"use client";

import { useEffect, useRef } from "react";
import "@/app/editorial-motion.css";
import { setupScrollMotion, type MotionPreset } from "@/lib/scrollMotion";

/*
 * Scroll-in animations for the AI-Powered Digital Marketing subpages (motion
 * only — no content or styling changes). An editorial set used nowhere else:
 * headings are uncovered by a slanted diagonal edge, photos unveil from right
 * to left, text lifts in gently, side-by-side columns draw in from their outer
 * edges, and cards reveal on the slant, soft-pop or drift up.
 */

const EDITORIAL_PRESET: MotionPreset = {
  prefix: "em",
  heroTitle: "slant-lg",
  hero: "press",
  heading: "slant",
  text: "lift",
  media: "unveil",
  splitFirst: "edge-l",
  splitMiddle: "press",
  splitLast: "edge-r",
  items: ["slant-sm", "pop-soft", "drift-up"],
  stagger: 0.07,
  heroStep: 0.1,
  heroDeep: true,
};

export default function EditorialMotion({ seed = 0 }: { seed?: number }) {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchorRef.current?.parentElement;
    if (!root) return;
    return setupScrollMotion(root, EDITORIAL_PRESET, seed);
  }, [seed]);

  return <span ref={anchorRef} hidden aria-hidden="true" />;
}

"use client";

import { useEffect, useRef } from "react";
import "@/app/legal-motion.css";
import { setupScrollMotion, type MotionPreset } from "@/lib/scrollMotion";

/*
 * Scroll-in animations for the legal pages. Motion only: section titles are
 * drawn in from the left like ink on paper, text settles upward and list
 * rows slide in one after another.
 */

const LEGAL_PRESET: MotionPreset = {
  prefix: "lgm",
  heroTitle: "ink-lg",
  hero: "settle",
  heading: "ink",
  text: "settle",
  media: "lift",
  splitFirst: "lift",
  splitMiddle: "lift",
  splitLast: "lift",
  items: ["row"],
  stagger: 0.05,
  heroStep: 0.1,
  heroDeep: true,
};

export default function LegalMotion() {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchorRef.current?.parentElement;
    if (!root) return;
    return setupScrollMotion(root, LEGAL_PRESET);
  }, []);

  return <span ref={anchorRef} hidden aria-hidden="true" />;
}

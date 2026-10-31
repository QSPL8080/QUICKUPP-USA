"use client";

import { useEffect, useRef } from "react";
import "@/app/career-motion.css";
import { setupScrollMotion, type MotionPreset } from "@/lib/scrollMotion";

/*
 * Scroll-in animations used only on the Careers page. Motion only: the hero
 * title climbs up out of a mask, headings step in on a diagonal like a
 * staircase, text ascends, side-by-side columns launch in from below the
 * corners and groups rise stair by stair or flip up from their base.
 */

const CAREER_PRESET: MotionPreset = {
  prefix: "cvm",
  heroTitle: "climb",
  hero: "ascend",
  heading: "step",
  text: "ascend",
  media: "tilt",
  splitFirst: "launch-l",
  splitMiddle: "ascend",
  splitLast: "launch-r",
  items: ["stair", "flip-up"],
  stagger: 0.07,
  heroStep: 0.1,
  heroDeep: true,
};

export default function CareerMotion() {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchorRef.current?.parentElement;
    if (!root) return;
    return setupScrollMotion(root, CAREER_PRESET);
  }, []);

  return <span ref={anchorRef} hidden aria-hidden="true" />;
}

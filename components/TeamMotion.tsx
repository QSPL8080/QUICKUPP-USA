"use client";

import { useEffect, useRef } from "react";
import "@/app/team-motion.css";
import { setupScrollMotion, type MotionPreset } from "@/lib/scrollMotion";

/*
 * Scroll-in animations for the Staff Augmentation subpages (motion only — no
 * content or styling changes). Its own professional set, used nowhere else:
 * headings drop into place from above behind a top-down mask, text fades in
 * place, images rise up behind a bottom-up curtain, side-by-side rows open
 * out from the seam between them, and cards meet from above and below, grow
 * up from their base or ease down from a slight zoom.
 */

const TEAM_PRESET: MotionPreset = {
  prefix: "sm",
  heroTitle: "descend-lg",
  hero: "materialize",
  heading: "descend",
  text: "fade",
  media: "curtain",
  splitFirst: "seam-l",
  splitMiddle: "materialize",
  splitLast: "seam-r",
  items: ["meet-t|meet-b", "grow", "zoom-out"],
  stagger: 0.075,
  heroStep: 0.1,
  heroDeep: true,
};

export default function TeamMotion({ seed = 0 }: { seed?: number }) {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchorRef.current?.parentElement;
    if (!root) return;
    return setupScrollMotion(root, TEAM_PRESET, seed);
  }, [seed]);

  return <span ref={anchorRef} hidden aria-hidden="true" />;
}

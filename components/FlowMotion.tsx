"use client";

import { useEffect, useRef } from "react";
import "@/app/flow-motion.css";
import { setupScrollMotion, type MotionPreset } from "@/lib/scrollMotion";

/*
 * Scroll-in animations for the AI Automation page (motion only — no content
 * or styling changes). Its own professional set, used nowhere else: headings
 * pull forward into focus from a little depth, text settles down into
 * place, side-by-side columns extend out from the edge they connect to, and
 * cards pop on like workflow nodes, stream in from the left or rise briefly.
 */

const FLOW_PRESET: MotionPreset = {
  prefix: "fx",
  heroTitle: "forward-lg",
  hero: "slide",
  heading: "forward",
  text: "settle",
  media: "focus",
  splitFirst: "link-l",
  splitMiddle: "slide",
  splitLast: "link-r",
  items: ["node", "stream", "rise"],
  stagger: 0.07,
  heroStep: 0.1,
  heroDeep: true,
};

export default function FlowMotion({ seed = 0 }: { seed?: number }) {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchorRef.current?.parentElement;
    if (!root) return;
    return setupScrollMotion(root, FLOW_PRESET, seed);
  }, [seed]);

  return <span ref={anchorRef} hidden aria-hidden="true" />;
}

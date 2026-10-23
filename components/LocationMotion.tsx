"use client";

import { useEffect, useRef } from "react";
import "@/app/location-motion.css";
import { setupScrollMotion, type MotionPreset } from "@/lib/scrollMotion";

/*
 * Scroll-in animations for the location pages (Our Locations, each city and
 * each city service page). Motion only, and a set used nowhere else:
 * headings stand up from their baseline, text rises slowly, side-by-side
 * columns turn in toward the centre, and cards drop in like map pins, glide
 * up or tilt in from the right.
 */

const LOCATION_PRESET: MotionPreset = {
  prefix: "lm",
  heroTitle: "standup-lg",
  hero: "rise",
  heading: "standup",
  text: "rise",
  media: "pin",
  splitFirst: "turn-l",
  splitMiddle: "rise",
  splitLast: "turn-r",
  items: ["pin", "glide", "tilt"],
  stagger: 0.07,
  heroStep: 0.09,
  heroDeep: true,
};

export default function LocationMotion({ seed = 0 }: { seed?: number }) {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchorRef.current?.parentElement;
    if (!root) return;
    return setupScrollMotion(root, LOCATION_PRESET, seed);
  }, [seed]);

  return <span ref={anchorRef} hidden aria-hidden="true" />;
}

"use client";

import { useEffect, useRef } from "react";
import "@/app/industry-motion.css";
import { setupScrollMotion, type MotionPreset } from "@/lib/scrollMotion";

/*
 * Scroll-in animations for the Industries subpages (motion only — no content
 * or styling changes). Its own effect set, different from the About pages:
 * skew-in hero title, 3D hinge headings, left-to-right text wipes, circular
 * image reveals, parallax split rows and rotating card motions (wave, swing,
 * bounce-drop, depth rise, diagonal glide), plus a reading-progress line.
 */

const INDUSTRY_PRESET: MotionPreset = {
  prefix: "im",
  heroTitle: "skew",
  hero: "lift",
  heading: "hinge",
  text: "wipe",
  media: "iris",
  splitFirst: "par-slow",
  splitMiddle: "par-mid",
  splitLast: "par-fast",
  items: ["wave", "swing", "drop", "depth", "diag"],
  stagger: 0.07,
  heroStep: 0.11,
  // Rising step columns run their own grow-in
  skip: ".inx-steps",
};

export default function IndustryMotion({ seed = 0 }: { seed?: number }) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = anchorRef.current?.parentElement;
    if (!root) return;
    const cleanup = setupScrollMotion(root, INDUSTRY_PRESET, seed);

    // Reading progress line
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cleanup();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [seed]);

  return (
    <>
      <span ref={anchorRef} hidden aria-hidden="true" />
      <div className="im-progress" aria-hidden="true">
        <div ref={barRef} className="im-progress-bar" />
      </div>
    </>
  );
}

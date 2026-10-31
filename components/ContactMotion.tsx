"use client";

import { useEffect, useRef } from "react";
import "@/app/contact-motion.css";
import { setupScrollMotion, type MotionPreset } from "@/lib/scrollMotion";

/*
 * Scroll-in animations used only on the Contact page. Motion only: the
 * hero title comes into focus as its letters close in, section headings
 * open out from the centre like a signal, text breezes in, panels open
 * through a rounded aperture, side-by-side columns orbit in from both
 * sides and groups beacon / cascade in.
 */

const CONTACT_PRESET: MotionPreset = {
  prefix: "ctm",
  heroTitle: "letterpress",
  hero: "breeze",
  heading: "signal",
  text: "breeze",
  media: "aperture",
  splitFirst: "orbit-l",
  splitMiddle: "breeze",
  splitLast: "orbit-r",
  items: ["cascade", "beacon"],
  stagger: 0.06,
  heroStep: 0.09,
  heroDeep: true,
};

export default function ContactMotion() {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchorRef.current?.parentElement;
    if (!root) return;
    return setupScrollMotion(root, CONTACT_PRESET);
  }, []);

  return <span ref={anchorRef} hidden aria-hidden="true" />;
}

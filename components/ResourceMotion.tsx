"use client";

import { useEffect, useRef } from "react";
import "@/app/resource-motion.css";
import { setupScrollMotion, type MotionPreset } from "@/lib/scrollMotion";

/*
 * Scroll-in motion for the Resources pages (the Resources hub, Blogs list,
 * Case Studies list, Portfolio and Client Testimonials). Each page has its own
 * set of effects, used nowhere else on the site. Not used on single blog posts
 * or single case studies. Motion only: elements return to their normal styles.
 */

export type ResourceMotionVariant = "hub" | "blog" | "cases" | "portfolio" | "testimonials";

const PRESETS: Record<ResourceMotionVariant, MotionPreset> = {
  // Resources hub: pages unfold toward the viewer, cards are dealt in
  hub: {
    prefix: "rhm",
    heroTitle: "unfold",
    hero: "surface",
    heading: "unfold",
    text: "surface",
    media: "settle-in",
    splitFirst: "hinge-l",
    splitMiddle: "surface",
    splitLast: "hinge-r",
    items: ["deal"],
    stagger: 0.08,
    heroStep: 0.1,
    heroDeep: true,
  },
  // Blogs: type comes into focus, articles cascade like pages
  blog: {
    prefix: "rbm",
    heroTitle: "focus",
    hero: "drift",
    heading: "curtain",
    text: "drift",
    media: "iris",
    splitFirst: "page-l",
    splitMiddle: "drift",
    splitLast: "page-r",
    items: ["cascade"],
    stagger: 0.07,
    heroStep: 0.1,
    heroDeep: true,
  },
  // Case studies: rows are ruled in from the left, like a ledger
  cases: {
    prefix: "rcm",
    heroTitle: "rise",
    hero: "ink",
    heading: "rule",
    text: "ink",
    media: "rule",
    splitFirst: "ink",
    splitMiddle: "ink",
    splitLast: "ink",
    items: ["ledger"],
    stagger: 0.06,
    heroStep: 0.1,
  },
  // Portfolio: work tiles lift off a light table
  portfolio: {
    prefix: "rpm",
    heroTitle: "develop",
    hero: "glide",
    heading: "tip",
    text: "glide",
    media: "lift",
    splitFirst: "orbit-l",
    splitMiddle: "glide",
    splitLast: "orbit-r",
    items: ["tile"],
    stagger: 0.07,
    heroStep: 0.1,
    heroDeep: true,
  },
  // Testimonials: voices open up and cards fan out gently
  testimonials: {
    prefix: "rtm",
    heroTitle: "open",
    hero: "breathe",
    heading: "open",
    text: "breathe",
    media: "round",
    splitFirst: "lean-l",
    splitMiddle: "breathe",
    splitLast: "lean-r",
    items: ["fan-l|fan-r"],
    stagger: 0.08,
    heroStep: 0.1,
    heroDeep: true,
  },
};

export default function ResourceMotion({ variant }: { variant: ResourceMotionVariant }) {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchorRef.current?.parentElement;
    if (!root) return;
    return setupScrollMotion(root, PRESETS[variant]);
  }, [variant]);

  return <span ref={anchorRef} hidden aria-hidden="true" />;
}

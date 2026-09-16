"use client";

import { useEffect } from "react";

/**
 * The nav pill uses backdrop-filter (blur), which makes it the positioning box
 * for its dropdowns. To let the Services/Industries mega menus span the full
 * header width, measure the navbar relative to the pill and expose the offsets
 * as CSS variables that the panels use for left/width.
 */
export default function MegaMenuPosition() {
  useEffect(() => {
    const update = () => {
      const navbar = document.querySelector<HTMLElement>(".header .navbar");
      const menu = document.querySelector<HTMLElement>(".header .nav-one-menu");
      if (!navbar || !menu) return;
      const n = navbar.getBoundingClientRect();
      const m = menu.getBoundingClientRect();
      const root = document.documentElement;
      root.style.setProperty("--qs-mega-left", `${n.left - m.left}px`);
      root.style.setProperty("--qs-mega-width", `${n.width}px`);
    };
    update();
    const t = window.setTimeout(update, 800);
    window.addEventListener("resize", update);
    document.fonts?.ready.then(update).catch(() => {});
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", update);
    };
  }, []);
  return null;
}

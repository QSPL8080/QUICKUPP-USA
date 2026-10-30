"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/*
 * Marks every call-to-action button on the inner pages (never the home page)
 * with its role and the tone of the background it sits on, so
 * app/site-type.css can make it black on light backgrounds and white on dark
 * ones. Tone comes from the text colour around the button: sections are
 * designed with light text on dark backgrounds and dark text on light ones.
 */

const CTA_SELECTOR = [
  'a[class*="btn"]',
  'button[class*="btn"]',
  'a[class*="button"]',
  'button[type="submit"]',
  ".button-link",
  ".cta-button",
  ".su-flip-button",
  ".w-button",
  ".qs-btn",
].join(",");

const EXCLUDE = /filter|tab|pill|close|menu|toggle|arrow|faq|chip|dot|slider|splide|play|icon|nav|social|tag/i;

const luminance = (color: string) => {
  const m = color.match(/[\d.]+/g);
  if (!m) return { l: 1, a: 0 };
  const [r, g, b, a = 1] = m.map(Number);
  return { l: (0.299 * r + 0.587 * g + 0.114 * b) / 255, a };
};

function markButtons() {
  if (document.querySelector(".hero-one-section")) return; // home page: leave untouched
  if (document.querySelector(".crm-root")) return; // CRM has its own buttons
  document.querySelectorAll<HTMLElement>(CTA_SELECTOR).forEach((el) => {
    if (el.closest("header, footer")) return;
    const cls = typeof el.className === "string" ? el.className : "";
    if (EXCLUDE.test(cls) && !/btn-(dark|light|white|primary|outline|ghost|accent)|submit/i.test(cls)) return;
    const r = el.getBoundingClientRect();
    if (r.height < 34 || r.height > 76 || r.width > 560 || !el.textContent?.trim()) return;

    const parent = el.parentElement;
    if (!parent) return;
    const tone = luminance(getComputedStyle(parent).color).l > 0.6 ? "dark" : "light";

    // Read the button's own fill without our overrides
    el.removeAttribute("data-qs-btn");
    el.removeAttribute("data-qs-tone");
    const cs = getComputedStyle(el);
    const bg = luminance(cs.backgroundColor);
    const solid = bg.a > 0.5 || cs.backgroundImage !== "none";
    let kind: "primary" | "secondary";
    if (tone === "dark") kind = solid ? "primary" : "secondary";
    else kind = solid && (cs.backgroundImage !== "none" || bg.l < 0.5) ? "primary" : "secondary";

    el.setAttribute("data-qs-btn", kind);
    el.setAttribute("data-qs-tone", tone);
  });
}

export default function ButtonTone() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") return;
    const timers = [0, 500, 1800].map((t) => window.setTimeout(markButtons, t));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [pathname]);

  return null;
}

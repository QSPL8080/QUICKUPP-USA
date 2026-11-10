"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/*
 * The Meta Pixel in app/layout.tsx counts the first page a visitor opens.
 * Moving to another page in the site doesn't reload it, so this sends a
 * PageView for every later page too (never twice for the same page).
 */
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function MetaPixelPageView() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    // the first page is already counted by the pixel snippet itself
    if (last.current === null) {
      last.current = pathname;
      return;
    }
    if (last.current === pathname) return;
    last.current = pathname;
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}

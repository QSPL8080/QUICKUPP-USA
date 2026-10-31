"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const HOME_PAGE_ID = "6944f1597ac277b25076cc8e";

type QuickuppEngineGlobal = {
  destroy?: () => void;
  ready?: () => void;
  require?: (name: string) => { init?: () => void; destroy?: () => void } | undefined;
};

/**
 * Quickupp interaction engine initializes animations and interactions.
 * Next.js navigates client-side, so when the route changes we update the page id
 * and sync QuickuppEngine so scroll/hover/slider animations run on the new page too.
 */
export default function QuickuppEngineReinit() {
  const pathname = usePathname();
  const isFirstMount = useRef(true);

  useEffect(() => {
    const html = document.documentElement;
    if (pathname === "/") {
      html.setAttribute("data-qs-page", HOME_PAGE_ID);
    } else {
      html.removeAttribute("data-qs-page");
    }

    // On initial mount, let QuickuppEngine initialize naturally from script tag without extra kicks
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // On client-side route transitions, gently sync QuickuppEngine once without spamming repeated timers
    const timer = window.setTimeout(() => {
      const qe = (window as unknown as { QuickuppEngine?: QuickuppEngineGlobal }).QuickuppEngine;
      if (qe) {
        try {
          qe.ready?.();
        } catch {
          /* ignore – content stays visible via CSS */
        }
      }
    }, 80);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}

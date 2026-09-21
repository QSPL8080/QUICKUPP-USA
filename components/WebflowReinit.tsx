"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const HOME_PAGE_ID = "6944f1597ac277b25076cc8e";

type WebflowGlobal = {
  destroy?: () => void;
  ready?: () => void;
  require?: (name: string) => { init?: () => void; destroy?: () => void } | undefined;
};

/**
 * Webflow's interaction engine only initialises once, on the first page load.
 * Next.js navigates client-side, so when the route changes we update the page id
 * and restart Webflow so scroll/hover/slider animations run on the new page too.
 */
export default function WebflowReinit() {
  const pathname = usePathname();
  const isFirstMount = useRef(true);

  useEffect(() => {
    const html = document.documentElement;
    if (pathname === "/") {
      html.setAttribute("data-wf-page", HOME_PAGE_ID);
    } else {
      html.removeAttribute("data-wf-page");
    }

    // On initial mount, let Webflow initialize naturally from script tag without extra kicks
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // On client-side route transitions, gently sync Webflow once without spamming repeated timers
    const timer = window.setTimeout(() => {
      const wf = (window as unknown as { Webflow?: WebflowGlobal }).Webflow;
      if (wf) {
        try {
          wf.ready?.();
        } catch {
          /* ignore – content stays visible via CSS */
        }
      }
    }, 80);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}

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
  const first = useRef(true);

  useEffect(() => {
    const html = document.documentElement;
    if (pathname === "/") html.setAttribute("data-wf-page", HOME_PAGE_ID);
    else html.removeAttribute("data-wf-page");

    const timers: number[] = [];
    // Webflow checks "scroll into view" animations on the browser's load/scroll
    // events. In Next.js the Webflow scripts start after "load" has already fired,
    // so nudge it with scroll/resize events until the first sections animate in.
    const kick = () => {
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));
    };

    if (first.current) {
      first.current = false;
      [300, 900, 1800, 3000].forEach((ms) => timers.push(window.setTimeout(kick, ms)));
    } else {
      const wf = (window as unknown as { Webflow?: WebflowGlobal }).Webflow;
      if (wf) {
        timers.push(
          window.setTimeout(() => {
            try {
              wf.destroy?.();
              wf.ready?.();
              const ix2 = wf.require?.("ix2");
              ix2?.destroy?.();
              ix2?.init?.();
            } catch {
              /* ignore – content stays visible via CSS fallback */
            }
            kick();
          }, 50),
        );
        [400, 1000, 2000].forEach((ms) => timers.push(window.setTimeout(kick, ms)));
      }
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [pathname]);

  return null;
}

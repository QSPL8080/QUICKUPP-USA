"use client";

import { useEffect } from "react";

const VISIBLE_ROWS = 4;

/**
 * Every CRM table shows its first 4 rows; the rest scroll inside the table
 * (header stays on top). Heights are measured, so it fits desktop rows and
 * the stacked cards on phones (kept within the screen) alike.
 */
export default function TableFit() {
  useEffect(() => {
    let frame = 0;
    const fit = () => {
      frame = 0;
      document.querySelectorAll<HTMLElement>(".crm-root .crm-table-wrap").forEach((wrap) => {
        const rows = wrap.querySelectorAll<HTMLElement>(":scope > table > tbody > tr");
        if (rows.length <= VISIBLE_ROWS) {
          wrap.style.maxHeight = "";
          wrap.classList.remove("is-scroll");
          return;
        }
        const top = wrap.getBoundingClientRect().top - wrap.scrollTop;
        let cut = rows[VISIBLE_ROWS].getBoundingClientRect().top - top;
        // phones: 4 cards are taller than the screen, so keep the list within it
        if (window.innerWidth <= 700) cut = Math.min(cut, window.innerHeight * 0.72);
        wrap.style.maxHeight = `${Math.ceil(cut)}px`;
        wrap.classList.add("is-scroll");
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(fit);
    };
    schedule();
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", schedule);
    return () => {
      mo.disconnect();
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}

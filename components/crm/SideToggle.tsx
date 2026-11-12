"use client";

import { useState } from "react";

/*
 * Laptops and desktops: hides or shows the left menu, so lists get the whole
 * width. The choice is kept in the crm_side cookie, so the next page (and the
 * server's first drawing of it) opens the same way. Phones and tablets use the
 * menu button in the top bar instead.
 */
export default function SideToggle({ initialClosed }: { initialClosed: boolean }) {
  const [closed, setClosed] = useState(initialClosed);
  const toggle = () => {
    const next = !closed;
    setClosed(next);
    document.querySelector(".crm-root")?.classList.toggle("crm-side-closed", next);
    document.cookie = `crm_side=${next ? "closed" : "open"}; path=/; max-age=31536000; samesite=lax`;
    // tables re-measure themselves on resize
    window.dispatchEvent(new Event("resize"));
  };
  return (
    <button
      type="button"
      className="crm-side-toggle"
      onClick={toggle}
      aria-label={closed ? "Show the menu" : "Hide the menu"}
      title={closed ? "Show the menu" : "Hide the menu"}
      aria-expanded={!closed}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16" />
        {closed ? <path d="M13 10l2 2-2 2" /> : <path d="M15 10l-2 2 2 2" />}
      </svg>
    </button>
  );
}

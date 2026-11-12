"use client";

import { useEffect, useState } from "react";

/*
 * Laptops and desktops: hides or shows the left menu, so lists get the whole
 * width. Each team member's choice is kept separately (cookie crm_side_u<id>),
 * so the next page — and the next visit — opens the way they left it.
 * Phones and tablets use the menu button in the top bar instead.
 */

const EVENT = "crm:side";

/** Hides (true) or shows (false) the left menu and remembers it for this user */
export function setSideClosed(userId: number, closed: boolean) {
  document.querySelector(".crm-root")?.classList.toggle("crm-side-closed", closed);
  document.cookie = `crm_side_u${userId}=${closed ? "closed" : "open"}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: closed }));
  // tables re-measure themselves on resize
  window.dispatchEvent(new Event("resize"));
}

const PanelIcon = ({ closed }: { closed: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
    {closed ? <path d="M13 10l2 2-2 2" /> : <path d="M15 10l-2 2 2 2" />}
  </svg>
);

/** The button in the top bar: shows the menu when it's hidden, hides it when it's shown */
export default function SideToggle({ userId, initialClosed }: { userId: number; initialClosed: boolean }) {
  const [closed, setClosed] = useState(initialClosed);
  useEffect(() => {
    const on = (e: Event) => setClosed(Boolean((e as CustomEvent<boolean>).detail));
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return (
    <button
      type="button"
      className={`crm-side-toggle${closed ? " is-closed" : ""}`}
      onClick={() => setSideClosed(userId, !closed)}
      aria-label={closed ? "Show the menu" : "Hide the menu"}
      title={closed ? "Show the menu" : "Hide the menu"}
      aria-expanded={!closed}
    >
      <PanelIcon closed={closed} />
      {closed && <span className="crm-side-toggle-text">Menu</span>}
    </button>
  );
}

/** The button inside the menu itself (top right): hides it */
export function SideHide({ userId }: { userId: number }) {
  return (
    <button type="button" className="crm-side-hide" onClick={() => setSideClosed(userId, true)} aria-label="Hide the menu" title="Hide the menu">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
      </svg>
    </button>
  );
}

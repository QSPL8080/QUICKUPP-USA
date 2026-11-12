"use client";

import { createContext, useContext, useEffect } from "react";

/*
 * View-only accounts (the Viewer role) see the whole CRM but no controls that
 * change anything: no add, edit, delete, send, share, export or select, and
 * they can't contact clients, download files or copy text out of the CRM. The
 * server refuses those changes and downloads anyway (proxy.ts); this keeps
 * them off screen.
 */
const Ctx = createContext(false);

/* the viewer's own profile form: typing and pasting there still works */
const ownForm = (t: EventTarget | null) => t instanceof Element && Boolean(t.closest(".crm-profile, form[data-own-profile]"));

export function ViewOnlyProvider({ viewOnly, children }: { viewOnly: boolean; children: React.ReactNode }) {
  useEffect(() => {
    if (!viewOnly) return;
    const block = (e: Event) => {
      if (ownForm(e.target)) return;
      e.preventDefault();
    };
    const events = ["copy", "cut", "contextmenu", "dragstart"] as const;
    events.forEach((ev) => document.addEventListener(ev, block, true));
    return () => events.forEach((ev) => document.removeEventListener(ev, block, true));
  }, [viewOnly]);
  return <Ctx.Provider value={viewOnly}>{children}</Ctx.Provider>;
}

/** true for a view-only account */
export const useViewOnly = () => useContext(Ctx);

/** Shows its contents only to accounts that can make changes */
export function EditOnly({ children }: { children: React.ReactNode }) {
  return useContext(Ctx) ? null : <>{children}</>;
}

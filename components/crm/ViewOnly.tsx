"use client";

import { createContext, useContext } from "react";

/*
 * View-only accounts (the Viewer role) see the whole CRM but no controls that
 * change anything: no add, edit, delete, send, share, export or select. The
 * server refuses those changes anyway (proxy.ts); this keeps them off screen.
 */
const Ctx = createContext(false);

export function ViewOnlyProvider({ viewOnly, children }: { viewOnly: boolean; children: React.ReactNode }) {
  return <Ctx.Provider value={viewOnly}>{children}</Ctx.Provider>;
}

/** true for a view-only account */
export const useViewOnly = () => useContext(Ctx);

/** Shows its contents only to accounts that can make changes */
export function EditOnly({ children }: { children: React.ReactNode }) {
  return useContext(Ctx) ? null : <>{children}</>;
}

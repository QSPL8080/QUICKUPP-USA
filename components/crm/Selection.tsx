"use client";

import { useEffect, useRef, useState } from "react";

/* Checkbox in the CRM style; `mixed` shows a dash (some rows selected) */
export function SelectBox({ checked, mixed = false, onChange, label }: { checked: boolean; mixed?: boolean; onChange: (checked: boolean) => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = mixed;
  }, [mixed]);
  return (
    <label className="crm-check crm-pick" onClick={(e) => e.stopPropagation()}>
      <input ref={ref} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={label} />
      <span className={`crm-check-box${mixed ? " is-mixed" : ""}`} aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          {mixed ? <path d="M6 12h12" /> : <path d="M20 6L9 17l-5-5" />}
        </svg>
      </span>
    </label>
  );
}

/**
 * Row selection for a list. Selected ids that are no longer on screen (after
 * changing page, filters or deleting) simply drop out.
 */
export function useSelection(ids: number[]) {
  const [picked, setPicked] = useState<number[]>([]);
  const selected = picked.filter((id) => ids.includes(id));
  const all = ids.length > 0 && selected.length === ids.length;
  return {
    selected,
    all,
    some: selected.length > 0 && !all,
    has: (id: number) => selected.includes(id),
    toggle: (id: number, on: boolean) => setPicked((p) => (on ? [...p.filter((x) => x !== id), id] : p.filter((x) => x !== id))),
    toggleAll: (on: boolean) => setPicked(on ? [...ids] : []),
    clear: () => setPicked([]),
  };
}

/* Bar above a list: select all, and bulk delete once something is selected */
export function BulkBar({
  sel,
  noun,
  busy,
  onDelete,
  children,
}: {
  sel: ReturnType<typeof useSelection>;
  noun: [string, string];
  busy: boolean;
  onDelete: () => void;
  children?: React.ReactNode;
}) {
  const n = sel.selected.length;
  return (
    <div className={`crm-bulk${n ? " is-active" : ""}`}>
      <div className="crm-bulk-start">
        <SelectBox checked={sel.all} mixed={sel.some} onChange={sel.toggleAll} label="Select all on this page" />
        {n ? (
          <>
            <span className="crm-bulk-count">
              {n} {n === 1 ? noun[0] : noun[1]} selected
            </span>
            <button type="button" className="crm-link-btn" onClick={sel.clear}>
              Clear
            </button>
          </>
        ) : (
          <span className="crm-muted">Select all</span>
        )}
      </div>
      <div className="crm-bulk-end">
        {n > 0 && (
          <button type="button" className="crm-act crm-act-danger crm-act-sm" onClick={onDelete} disabled={busy}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
            </svg>
            {busy ? "Deleting…" : `Delete ${n === 1 ? "" : `${n} `}selected`}
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

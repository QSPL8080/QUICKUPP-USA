"use client";

import { useEffect, useId, useRef, useState } from "react";

/*
 * Category / Scope picker for the CRM payment forms: tick one or more of the
 * service's categories (or all at once), like the website's enquiry forms.
 * The value is the chosen categories joined with ", " (the format the payments
 * tables, exports and the pay page already read), in the service's own order.
 */

export const joinCategories = (list: string[]) => list.join(", ");

/** the categories of `options` that are chosen in a saved value ("A, B") */
export function chosenCategories(value: string, options: string[]): string[] {
  const saved = String(value || "")
    .split(/\s*,\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  // a category name can itself hold a comma, so match whole option names first
  return options.filter((o) => saved.includes(o) || new RegExp(`(^|,\\s*)${o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s*,|$)`).test(value || ""));
}

export default function CategoryMulti({
  options,
  value,
  onChange,
  invalid = false,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const listId = useId();
  const chosen = chosenCategories(value, options);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc, true);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc, true);
    };
  }, [open]);

  const set = (list: string[]) => onChange(joinCategories(options.filter((o) => list.includes(o))));
  const toggle = (o: string) => set(chosen.includes(o) ? chosen.filter((c) => c !== o) : [...chosen, o]);
  const all = chosen.length === options.length;

  const summary =
    chosen.length === 0 ? "Select one or more categories" : chosen.length <= 2 ? chosen.join(", ") : `${chosen.length} categories selected`;

  return (
    <div className={`crm-multi${open ? " is-open" : ""}`} ref={box}>
      <div className="crm-multi-anchor">
        <button
          type="button"
          className={`crm-input crm-select crm-multi-trigger${chosen.length ? "" : " is-empty"}${invalid ? " is-invalid" : ""}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          title={chosen.join(", ")}
          onClick={() => setOpen((v) => !v)}
        >
          {summary}
        </button>

        {open && (
          <div className="crm-multi-panel" id={listId} role="listbox" aria-multiselectable="true">
            <div className="crm-multi-bulk">
              <button type="button" onClick={() => set(all ? [] : options)}>
                {all ? "Clear all" : "Select all"}
              </button>
              {chosen.length > 0 && !all && (
                <button type="button" onClick={() => set([])}>
                  Clear
                </button>
              )}
              <span>
                {chosen.length}/{options.length} selected
              </span>
            </div>
            <ul>
              {options.map((o) => (
                <li key={o}>
                  <label className={chosen.includes(o) ? "is-on" : undefined}>
                    <input type="checkbox" checked={chosen.includes(o)} onChange={() => toggle(o)} />
                    <span>{o}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {chosen.length > 2 && (
        <div className="crm-multi-chips">
          {chosen.map((c) => (
            <span key={c} className="crm-multi-chip">
              {c}
              <button type="button" aria-label={`Remove ${c}`} onClick={() => toggle(c)}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

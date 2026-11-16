"use client";

import { useEffect, useRef, useState } from "react";
import type { EnquiryRow } from "@/lib/crm/data";

/*
 * "From lead": search the leads (a BDM/BDE only finds their own), pick one and
 * get it in full, to fill in a meeting or a payment link.
 */

type Hit = {
  key: string;
  source: string;
  sourceLabel: string;
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string | null;
  clientSince: string | null;
};

export default function LeadPicker({
  picked,
  onPick,
  onClear,
  label = "Import from lead",
}: {
  picked?: { name: string; sourceLabel?: string } | null;
  onPick: (lead: EnquiryRow) => void;
  onClear?: () => void;
  label?: string;
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const box = useRef<HTMLDivElement>(null);

  // search as the user types (and the latest leads when the box is opened empty)
  useEffect(() => {
    if (!open) return;
    let live = true;
    const t = setTimeout(async () => {
      setBusy(true);
      const res = await fetch(`/api/crm/enquiries/search?q=${encodeURIComponent(q.trim())}`, { cache: "no-store" }).catch(() => null);
      const json = res ? await res.json().catch(() => null) : null;
      if (!live) return;
      setBusy(false);
      setHits(Array.isArray(json?.leads) ? json.leads : []);
    }, 250);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [q, open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const pick = async (h: Hit) => {
    setError("");
    setBusy(true);
    const res = await fetch(`/api/crm/enquiries?source=${h.source}&id=${h.id}`, { cache: "no-store" }).catch(() => null);
    const json = res ? await res.json().catch(() => null) : null;
    setBusy(false);
    if (!json?.lead) return setError(json?.error || "Couldn't load this lead. Please try again.");
    setOpen(false);
    setQ("");
    onPick(json.lead as EnquiryRow);
  };

  if (picked) {
    return (
      <div className="crm-leadpick crm-leadpick-picked">
        <span className="crm-from-lead-tag">From lead</span>
        <span className="crm-strong">{picked.name}</span>
        {picked.sourceLabel && <span className="crm-muted">· {picked.sourceLabel}</span>}
        {onClear && (
          <button type="button" className="crm-link-btn" onClick={onClear}>
            Change
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="crm-leadpick" ref={box}>
      <span className="crm-label">{label}</span>
      <input
        className="crm-input"
        type="search"
        value={q}
        placeholder="Search a lead by name, email, phone or company"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        aria-label={label}
      />
      {open && (
        <div className="crm-leadpick-list" role="listbox">
          {busy && !hits.length ? (
            <p className="crm-leadpick-empty">Searching…</p>
          ) : hits.length ? (
            hits.map((h) => (
              <button type="button" key={h.key} className="crm-leadpick-item" onClick={() => pick(h)} role="option" aria-selected="false">
                <span className="crm-strong">
                  {h.name || "Lead"}
                  {h.clientSince && <span className="crm-client-tag">Client</span>}
                </span>
                <span className="crm-cell-sub">
                  {[h.email, h.phone, h.company].filter(Boolean).join(" · ") || "No contact details"}
                </span>
                <span className="crm-cell-sub">{[h.sourceLabel, h.service].filter(Boolean).join(" · ")}</span>
              </button>
            ))
          ) : (
            <p className="crm-leadpick-empty">No leads match.</p>
          )}
        </div>
      )}
      {error && <span className="crm-field-error">{error}</span>}
      <span className="crm-field-hint">Or fill in the details by hand below.</span>
    </div>
  );
}

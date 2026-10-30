"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EnquiryRow, EnquirySource } from "@/lib/crm/data";

const STATUS: Record<string, string> = { new: "New", contacted: "Contacted", closed: "Closed" };

const fmtDate = (iso: string, withTime = false) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });

export default function EnquiryTable({
  source,
  rows,
  interestLabel,
  canDelete,
}: {
  source: EnquirySource;
  rows: EnquiryRow[];
  interestLabel: string;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState<EnquiryRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const setStatus = async (row: EnquiryRow, status: string) => {
    setBusy(true);
    setError("");
    const res = await fetch("/api/crm/enquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, id: row.id, status }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return setError("Couldn't update the status. Please try again.");
    if (open?.id === row.id) setOpen({ ...row, status: status as EnquiryRow["status"] });
    router.refresh();
  };

  const remove = async (row: EnquiryRow) => {
    if (!window.confirm(`Delete the enquiry from ${row.name}? This can't be undone.`)) return;
    setBusy(true);
    const res = await fetch("/api/crm/enquiries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, id: row.id }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return setError("Couldn't delete the enquiry. Please try again.");
    setOpen(null);
    router.refresh();
  };

  if (!rows.length) {
    return (
      <div className="crm-empty">
        <p className="crm-empty-title">No enquiries found</p>
        <p className="crm-muted">New form submissions will appear here.</p>
      </div>
    );
  }

  return (
    <>
      {error && !open && (
        <p className="crm-alert" role="alert">
          {error}
        </p>
      )}
      <div className="crm-table-wrap">
        <table className="crm-table crm-stack">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>{interestLabel}</th>
              <th>Industry</th>
              <th>Budget</th>
              <th>Received</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} onClick={() => setOpen(r)} className="crm-row">
                <td data-label="Name">
                  <span className="crm-strong">{r.name}</span>
                  {r.company && <span className="crm-cell-sub">{r.company}</span>}
                </td>
                <td data-label="Contact">
                  <span>{r.email}</span>
                  {r.phone && <span className="crm-cell-sub">{r.phone}</span>}
                </td>
                <td data-label={interestLabel}>{r.interest}</td>
                <td data-label="Industry">{r.industry === "Other" && r.otherIndustry ? r.otherIndustry : r.industry}</td>
                <td data-label="Budget">{r.budget || <span className="crm-muted">—</span>}</td>
                <td data-label="Received" className="crm-nowrap">{fmtDate(r.createdAt)}</td>
                <td data-label="Status" onClick={(e) => e.stopPropagation()}>
                  <select
                    className={`crm-status crm-status-${r.status}`}
                    value={r.status}
                    disabled={busy}
                    onChange={(e) => setStatus(r, e.target.value)}
                    aria-label={`Status for ${r.name}`}
                  >
                    {Object.entries(STATUS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="crm-drawer-wrap" onClick={() => setOpen(null)}>
          <aside className="crm-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Enquiry from ${open.name}`}>
            <div className="crm-drawer-head">
              <div>
                <p className="crm-drawer-kicker">Enquiry #{open.id}</p>
                <h2 className="crm-drawer-title">{open.name}</h2>
                <p className="crm-muted">{fmtDate(open.createdAt, true)}</p>
              </div>
              <button type="button" className="crm-icon-act" onClick={() => setOpen(null)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="crm-drawer-actions">
              <a className="crm-act crm-act-dark crm-act-sm" href={`mailto:${open.email}`}>
                Email
              </a>
              {open.phone && (
                <a className="crm-act crm-act-ghost crm-act-sm" href={`tel:${open.phone.replace(/[^\d+]/g, "")}`}>
                  Call
                </a>
              )}
              <select
                className={`crm-status crm-status-${open.status}`}
                value={open.status}
                disabled={busy}
                onChange={(e) => setStatus(open, e.target.value)}
                aria-label="Status"
              >
                {Object.entries(STATUS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            {error && (
              <p className="crm-alert" role="alert">
                {error}
              </p>
            )}

            <dl className="crm-details">
              <dt>Email</dt>
              <dd>{open.email}</dd>
              <dt>Phone</dt>
              <dd>{open.phone || "—"}</dd>
              <dt>Company</dt>
              <dd>{open.company || "—"}</dd>
              <dt>Industry</dt>
              <dd>{open.industry === "Other" && open.otherIndustry ? `Other — ${open.otherIndustry}` : open.industry}</dd>
              {open.service && (
                <>
                  <dt>Service</dt>
                  <dd>{open.service}</dd>
                </>
              )}
              <dt>{interestLabel}</dt>
              <dd>{open.interest}</dd>
              <dt>Budget</dt>
              <dd>{open.budget || "—"}</dd>
              {open.sourcePage && (
                <>
                  <dt>Sent from</dt>
                  <dd>{open.sourcePage}</dd>
                </>
              )}
              {open.pageUrl && (
                <>
                  <dt>Page</dt>
                  <dd className="crm-break">{open.pageUrl}</dd>
                </>
              )}
            </dl>

            <div className="crm-message">
              <p className="crm-label">Message</p>
              <p className="crm-message-text">{open.message}</p>
            </div>

            {canDelete && (
              <button type="button" className="crm-act crm-act-danger crm-act-sm" onClick={() => remove(open)} disabled={busy}>
                Delete enquiry
              </button>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

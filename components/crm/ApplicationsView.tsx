"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL, fmtBytes, type ApplicationRow } from "@/lib/applications";
import { BulkBar, SelectBox, useSelection } from "@/components/crm/Selection";

const fmtDate = (iso: string, withTime = false) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });

const resumeHref = (id: number) => `/api/crm/applications/${id}/resume`;

function StatusSelect({ row, busy, onChange }: { row: ApplicationRow; busy: boolean; onChange: (s: string) => void }) {
  return (
    <select
      className={`crm-status crm-app-status crm-app-status-${row.status}`}
      value={row.status}
      disabled={busy}
      onChange={(e) => onChange(e.target.value)}
      aria-label={`Status for ${row.name}`}
    >
      {APPLICATION_STATUSES.map((s) => (
        <option key={s} value={s}>
          {APPLICATION_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

export default function ApplicationsView({ rows }: { rows: ApplicationRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<ApplicationRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const sel = useSelection(rows.map((r) => r.id));

  const setStatus = async (row: ApplicationRow, status: string) => {
    setBusy(true);
    setError("");
    const res = await fetch("/api/crm/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, status }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return setError("Couldn't update the status. Please try again.");
    if (open?.id === row.id) setOpen({ ...row, status: status as ApplicationRow["status"] });
    router.refresh();
  };

  const removeIds = async (ids: number[], what: string) => {
    if (!window.confirm(`Permanently delete ${what}, resume included? This can't be undone.`)) return false;
    setBusy(true);
    setError("");
    const res = await fetch("/api/crm/applications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok && res?.status !== 404) {
      setError("Couldn't delete. Please try again.");
      return false;
    }
    router.refresh();
    return true;
  };

  const removeSelected = async () => {
    const ids = sel.selected;
    if (!ids.length) return;
    if (await removeIds(ids, ids.length === 1 ? "this application" : `these ${ids.length} applications`)) sel.clear();
  };

  if (!rows.length) {
    return (
      <div className="crm-empty">
        <p className="crm-empty-title">No applications found</p>
        <p className="crm-muted">When someone clicks Apply Now on a job opening and sends the form, it will appear here.</p>
      </div>
    );
  }

  return (
    <>
      {error && !open && (
        <p className="crm-alert crm-alert-inset" role="alert">
          {error}
        </p>
      )}
      <BulkBar sel={sel} noun={["application", "applications"]} busy={busy} onDelete={removeSelected} />
      <div className="crm-table-wrap">
        <table className="crm-table crm-stack crm-selectable">
          <thead>
            <tr>
              <th className="crm-col-check">
                <SelectBox checked={sel.all} mixed={sel.some} onChange={sel.toggleAll} label="Select all on this page" />
              </th>
              <th>Candidate</th>
              <th>Contact</th>
              <th>Applied for</th>
              <th>Experience</th>
              <th>Resume</th>
              <th>Received</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} onClick={() => setOpen(r)} className={`crm-row${sel.has(r.id) ? " is-picked" : ""}`}>
                <td className="crm-col-check" onClick={(e) => e.stopPropagation()}>
                  <SelectBox checked={sel.has(r.id)} onChange={(on) => sel.toggle(r.id, on)} label={`Select ${r.name}`} />
                </td>
                <td data-label="Candidate" className="crm-cell-main">
                  <span className="crm-strong">{r.name}</span>
                  <span className="crm-cell-sub">{r.location}</span>
                </td>
                <td data-label="Contact">
                  <span>{r.email}</span>
                  <span className="crm-cell-sub">{r.phone}</span>
                </td>
                <td data-label="Applied for">
                  <span className="crm-strong">{r.jobTitle}</span>
                  {r.department && <span className="crm-cell-sub">{r.department}</span>}
                </td>
                <td data-label="Experience">{r.experience}</td>
                <td data-label="Resume" onClick={(e) => e.stopPropagation()}>
                  <a className="crm-file" href={resumeHref(r.id)} title={r.resumeName}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Download
                  </a>
                </td>
                <td data-label="Received" className="crm-nowrap">
                  {fmtDate(r.createdAt)}
                </td>
                <td data-label="Status" onClick={(e) => e.stopPropagation()}>
                  <StatusSelect row={r} busy={busy} onChange={(s) => setStatus(r, s)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="crm-drawer-wrap" onClick={() => setOpen(null)}>
          <aside className="crm-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Application from ${open.name}`}>
            <div className="crm-drawer-head">
              <div>
                <p className="crm-drawer-kicker">Application #{open.id}</p>
                <h2 className="crm-drawer-title">{open.name}</h2>
                <p className="crm-muted">
                  Applied for <strong>{open.jobTitle}</strong> · {fmtDate(open.createdAt, true)}
                </p>
              </div>
              <button type="button" className="crm-icon-act" onClick={() => setOpen(null)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="crm-drawer-actions">
              <a className="crm-act crm-act-dark crm-act-sm" href={resumeHref(open.id)}>
                Download resume
              </a>
              <a className="crm-act crm-act-ghost crm-act-sm" href={`mailto:${open.email}?subject=${encodeURIComponent(`Your application – ${open.jobTitle}`)}`}>
                Email
              </a>
              <a className="crm-act crm-act-ghost crm-act-sm" href={`tel:${open.phone.replace(/[^\d+]/g, "")}`}>
                Call
              </a>
              <StatusSelect row={open} busy={busy} onChange={(s) => setStatus(open, s)} />
            </div>
            {error && (
              <p className="crm-alert" role="alert">
                {error}
              </p>
            )}

            <dl className="crm-details">
              <dt>Position</dt>
              <dd>{open.jobTitle}</dd>
              <dt>Department</dt>
              <dd>{open.department || "—"}</dd>
              <dt>Email</dt>
              <dd className="crm-break">{open.email}</dd>
              <dt>Phone</dt>
              <dd>{open.phone}</dd>
              <dt>Current location</dt>
              <dd>{open.location}</dd>
              <dt>Total experience</dt>
              <dd>{open.experience}</dd>
              <dt>LinkedIn / Portfolio</dt>
              <dd className="crm-break">
                {open.profileUrl ? (
                  <a href={open.profileUrl} target="_blank" rel="noreferrer noopener">
                    {open.profileUrl}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
              <dt>Resume</dt>
              <dd className="crm-break">
                {open.resumeName} ({fmtBytes(open.resumeSize)})
              </dd>
              <dt>Emailed to HR</dt>
              <dd>{open.mailSent ? "Yes" : "No — check the email (SMTP) settings"}</dd>
            </dl>

            <div className="crm-message">
              <p className="crm-label">Cover note</p>
              <p className="crm-message-text">{open.coverNote || "—"}</p>
            </div>

            <button
              type="button"
              className="crm-act crm-act-danger crm-act-sm"
              disabled={busy}
              onClick={async () => {
                if (await removeIds([open.id], `the application from ${open.name}`)) setOpen(null);
              }}
            >
              Delete application
            </button>
          </aside>
        </div>
      )}
    </>
  );
}

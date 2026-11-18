"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/components/crm/Feedback";
import { useViewOnly } from "@/components/crm/ViewOnly";
import { PAYMENT_STATUS_LABEL, formatFileSize, money } from "@/lib/crm/format";
import { payLinkUrl } from "@/lib/siteUrl";
import { clientCode, enquiryCode } from "@/lib/crm/leadOptions";
import type { ClientDoc, ClientItem } from "@/lib/crm/clients";

/* the kinds of client documents (the server checks the same list) */
const DOC_TYPES: [string, string][] = [
  ["quotation", "Quotation"],
  ["nda", "NDA"],
  ["agreement", "Agreement"],
  ["invoice", "Invoice"],
  ["receipt", "Payment Receipt"],
  ["other", "Other"],
];
const DOC_LABEL = Object.fromEntries(DOC_TYPES);
const ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

const fmtWhen = (iso: string | null, withTime = true) =>
  iso
    ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}) })
    : "—";

export default function ClientsView({
  rows,
  offset,
  canUpload,
  canDeleteDocs = false,
  openKey,
}: {
  rows: ClientItem[];
  offset: number;
  canUpload: boolean;
  /** client documents are deleted only by Admins */
  canDeleteDocs?: boolean;
  openKey?: string;
}) {
  const router = useRouter();
  const { confirm, toast } = useFeedback();
  const viewOnly = useViewOnly();
  const canWork = canUpload && !viewOnly;
  const [openKeyState, setOpenKey] = useState<string | null>(openKey && rows.some((r) => r.key === openKey) ? openKey : null);
  const open = rows.find((r) => r.key === openKeyState) || null;
  const [docs, setDocs] = useState<ClientDoc[]>([]);
  const [docType, setDocType] = useState("quotation");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the open client's documents, from the list
    setDocs(open ? open.docs : []);
  }, [open]);

  // each new file of a kind (a new quotation…) is its next version; older ones stay listed as its history
  const versionOf = (d: ClientDoc) => {
    if (!d.docType) return 0;
    const same = docs.filter((x) => x.docType === d.docType).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return same.length > 1 ? same.findIndex((x) => x.id === d.id) + 1 : 0;
  };

  const copy = (url: string) => {
    navigator.clipboard?.writeText(url).then(
      () => toast("Balance link copied"),
      () => toast("Couldn't copy the link", "error")
    );
  };

  const upload = async (files: FileList | null) => {
    if (!open || !files?.length) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("leadSource", open.source);
    fd.append("leadId", String(open.id));
    fd.append("docType", docType);
    for (const f of Array.from(files)) fd.append("files", f);
    const res = await fetch("/api/crm/enquiries/attachments", { method: "POST", body: fd }).catch(() => null);
    const j = res ? await res.json().catch(() => null) : null;
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (!res?.ok || !j?.ok) return toast(j?.error || "Couldn't upload. Please try again.", "error");
    if (Array.isArray(j.attachments)) setDocs(j.attachments);
    toast(files.length === 1 ? `${DOC_LABEL[docType]} uploaded` : `${files.length} files uploaded`);
    router.refresh();
  };

  const remove = async (d: ClientDoc) => {
    if (!open) return;
    if (!(await confirm({ title: `Delete ${d.fileName}?`, message: "This file will be permanently removed from this client's profile.", confirmLabel: "Delete File" }))) return;
    const res = await fetch(`/api/crm/enquiries/attachments?source=${open.source}&leadId=${open.id}&fileId=${encodeURIComponent(d.id)}`, { method: "DELETE" }).catch(() => null);
    const j = res ? await res.json().catch(() => null) : null;
    if (!res?.ok || !j?.ok) return toast(j?.error || "Couldn't delete the file.", "error");
    setDocs(Array.isArray(j.attachments) ? j.attachments : docs.filter((x) => x.id !== d.id));
    toast("File deleted");
    router.refresh();
  };

  if (!rows.length) {
    return (
      <div className="crm-empty">
        <p className="crm-empty-title">No clients yet</p>
        <p className="crm-empty-sub">A lead shows up here as soon as its first payment comes in (a deposit or the full amount).</p>
      </div>
    );
  }

  return (
    <>
      <div className="crm-table-wrap">
        <table className="crm-table crm-stack">
          <thead>
            <tr>
              <th className="crm-col-num">Sr. No</th>
              <th>Client</th>
              <th>Client since</th>
              <th>Payments</th>
              <th>Paid</th>
              <th>Balance due</th>
              <th>Documents</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c, i) => {
              const balance = c.payments.find((p) => p.balanceToken);
              return (
                <tr key={c.key} className="crm-row" onClick={() => setOpenKey(c.key)}>
                  <td data-label="Sr. No" className="crm-col-num">
                    {offset + i + 1}
                  </td>
                  <td data-label="Client" className="crm-cell-main">
                    <span className="crm-strong">
                      {c.name || c.email}
                      <span className="crm-client-tag">Client</span>
                    </span>
                    {c.company && <span className="crm-cell-sub">{c.company}</span>}
                    <span className="crm-cell-sub">{[c.email, c.phone].filter(Boolean).join(" · ")}</span>
                    <span className="crm-from-lead-tag">{clientCode(c.source, c.id)} · From lead {enquiryCode(c.source, c.id)}</span>
                  </td>
                  <td data-label="Client since" className="crm-nowrap">
                    {/* shown in the viewer's own time zone (the server's may differ) */}
                    <span className="crm-strong" suppressHydrationWarning>
                      {fmtWhen(c.clientSince, false)}
                    </span>
                    <span className="crm-cell-sub" suppressHydrationWarning>
                      {new Date(c.clientSince).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </td>
                  <td data-label="Payments">
                    {c.payments.length} {c.payments.length === 1 ? "payment" : "payments"}
                    {c.payments[0] && <span className="crm-cell-sub">{c.payments[0].service}</span>}
                  </td>
                  <td data-label="Paid" className="crm-nowrap crm-strong">
                    {money(c.totalPaid, c.currency)}
                  </td>
                  <td data-label="Balance due" className="crm-nowrap" onClick={(e) => e.stopPropagation()}>
                    {c.totalDue > 0 ? (
                      <>
                        <span className="crm-strong" style={{ color: "#b45309" }}>
                          {money(c.totalDue, c.currency)}
                        </span>
                        {balance?.balanceToken && (
                          <span className="crm-client-balance-links">
                            <a href={payLinkUrl(balance.balanceToken)} target="_blank" rel="noreferrer" className="crm-att-btn">
                              Balance link
                            </a>
                            {!viewOnly && (
                              <button type="button" className="crm-att-btn" onClick={() => copy(payLinkUrl(balance.balanceToken!))}>
                                Copy
                              </button>
                            )}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="crm-muted">Fully paid</span>
                    )}
                  </td>
                  <td data-label="Documents">
                    {c.docs.length ? (
                      <span>
                        {c.docs.length} {c.docs.length === 1 ? "file" : "files"}
                        <span className="crm-cell-sub">
                          {[...new Set(c.docs.map((d) => (d.docType ? DOC_LABEL[d.docType] : "")).filter(Boolean))].join(", ")}
                        </span>
                      </span>
                    ) : (
                      <span className="crm-muted">None yet</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="crm-drawer-wrap" onClick={() => setOpenKey(null)}>
          <aside className="crm-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Client ${open.name}`}>
            <div className="crm-drawer-head">
              <div>
                <p className="crm-drawer-kicker">
                  Client {clientCode(open.source, open.id)} · Original enquiry {enquiryCode(open.source, open.id)} · {open.sourceLabel}
                </p>
                <h2 className="crm-drawer-title">
                  {open.name || open.email}
                  <span className="crm-client-tag">Client since {fmtWhen(open.clientSince, false)}</span>
                </h2>
                <p className="crm-muted" style={{ marginTop: 4 }}>
                  {[open.company, open.email, open.phone].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button type="button" className="crm-icon-act" onClick={() => setOpenKey(null)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="crm-meet-team crm-client-summary">
              <div className="crm-meet-team-item">
                <span className="crm-mgmt-label">Converted on</span>
                <span className="crm-mgmt-val">{fmtWhen(open.clientSince)}</span>
                {open.clientBy && <span className="crm-mgmt-sub">by {open.clientBy}</span>}
              </div>
              <div className="crm-meet-team-item">
                <span className="crm-mgmt-label">Total amount</span>
                <span className="crm-mgmt-val">{money(open.totalAgreed, open.currency)}</span>
              </div>
              <div className="crm-meet-team-item">
                <span className="crm-mgmt-label">Paid</span>
                <span className="crm-mgmt-val">{money(open.totalPaid, open.currency)}</span>
              </div>
              <div className="crm-meet-team-item">
                <span className="crm-mgmt-label">Balance</span>
                <span className="crm-mgmt-val">{open.totalDue > 0 ? money(open.totalDue, open.currency) : "Nothing due"}</span>
                <span className="crm-mgmt-sub">{open.totalDue > 0 ? "Partially paid" : "Paid"}</span>
              </div>
            </div>
            <p style={{ margin: "10px 0 0" }}>
              <a className="crm-link" style={{ color: "#4f46e5", fontWeight: 700 }} href={`/crm/enquiries?open=${encodeURIComponent(open.key)}`}>
                Open the lead{open.assignedTo ? ` (handled by ${open.assignedTo})` : ""}
              </a>
            </p>

            <div className="crm-drawer-card">
              <div className="crm-drawer-card-head">
                <span className="crm-drawer-card-title">
                  Payments
                  <span className="crm-count-badge">{open.payments.length}</span>
                </span>
              </div>
              {open.payments.length === 0 ? (
                <p className="crm-drawer-card-empty">No payments linked to this lead.</p>
              ) : (
                <div className="crm-lead-link-list">
                  {open.payments.map((p) => (
                    <div key={`${p.table}:${p.id}`} className="crm-lead-link-card">
                      <div className="crm-lead-link-row1">
                        <div className="crm-lead-link-amount">
                          {money(p.total, p.currency)}
                          {p.paymentType === "partial" && <span className="crm-partial-tag">Part payment</span>}
                        </div>
                        <span className={`crm-lead-link-status crm-link-status-${p.status}`}>{PAYMENT_STATUS_LABEL[p.status] || p.status}</span>
                      </div>
                      <div className="crm-lead-link-row2">
                        <span className="crm-lead-link-invoice">Order {p.orderNumber}</span>
                        <span className="crm-lead-link-service">{p.service}</span>
                        {p.category && <span>• {p.category}</span>}
                      </div>
                      <div className="crm-lead-link-row2">
                        <span>Paid {money(p.paid, p.currency)}</span>
                        {p.remaining > 0 && <span>• Due {money(p.remaining, p.currency)}{p.balanceDueDate ? ` by ${fmtWhen(p.balanceDueDate, false)}` : ""}</span>}
                        {p.paidAt && <span>• Last paid {fmtWhen(p.paidAt)}</span>}
                      </div>
                      {p.transactions.length > 0 && (
                        <ol className="crm-client-tx">
                          {p.transactions.map((t, i) => (
                            <li key={i}>
                              <span className="crm-strong">{t.kind === "deposit" ? "Deposit" : t.kind === "balance" ? "Balance" : "Payment"}</span>{" "}
                              {money(t.amount, t.currency)} · {t.status === "paid" ? "verified" : t.status} · <span suppressHydrationWarning>{fmtWhen(t.at)}</span>
                              {t.transactionId && <span className="crm-muted"> · PayPal {t.transactionId}</span>}
                            </li>
                          ))}
                        </ol>
                      )}
                      {p.balanceToken && (
                        <div className="crm-lead-link-actions">
                          <a href={payLinkUrl(p.balanceToken)} target="_blank" rel="noreferrer" className="crm-att-btn">
                            Open balance link
                          </a>
                          {!viewOnly && (
                            <button type="button" className="crm-att-btn" onClick={() => copy(payLinkUrl(p.balanceToken!))}>
                              Copy balance link
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="crm-drawer-card">
              <div className="crm-drawer-card-head">
                <span className="crm-drawer-card-title">
                  Meetings
                  <span className="crm-count-badge">{open.meetings.length}</span>
                </span>
              </div>
              {open.meetings.length === 0 ? (
                <p className="crm-drawer-card-empty">No meetings linked to this client.</p>
              ) : (
                <ul className="crm-client-tx">
                  {open.meetings.map((m) => (
                    <li key={m.id}>
                      <a href={`/crm/meetings?open=${m.id}`} style={{ color: "#4f46e5", fontWeight: 700 }}>
                        {m.title}
                      </a>{" "}
                      · <span suppressHydrationWarning>{m.startTime ? fmtWhen(m.startTime) : "—"}</span> ·{" "}
                      {m.status === "canceled" ? "Cancelled" : m.outcome === "completed" ? "Completed" : m.outcome === "no_show" ? "No Show" : "Scheduled"}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="crm-drawer-card">
              <div className="crm-drawer-card-head">
                <span className="crm-drawer-card-title">
                  Documents (quotation, NDA…)
                  {docs.length > 0 && <span className="crm-count-badge">{docs.length}</span>}
                </span>
              </div>
              {canWork && (
                <div className="crm-client-upload">
                  <select className="crm-input crm-select" value={docType} onChange={(e) => setDocType(e.target.value)} aria-label="Document type">
                    {DOC_TYPES.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <input ref={fileRef} type="file" multiple accept={ACCEPT} style={{ display: "none" }} onChange={(e) => upload(e.target.files)} />
                  <button type="button" className="crm-act crm-act-dark crm-act-sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
                    {uploading ? "Uploading…" : "Upload file"}
                  </button>
                  <span className="crm-muted" style={{ fontSize: 12 }}>
                    PDF, DOC, DOCX, JPG or PNG, up to 15 MB each
                  </span>
                </div>
              )}
              {docs.length === 0 ? (
                <p className="crm-drawer-card-empty">No documents yet.</p>
              ) : (
                <div className="crm-attachment-list">
                  {docs.map((d) => (
                    <div key={d.id} className="crm-attachment-item">
                      <div className="crm-attachment-meta">
                        <span className="crm-attachment-name" title={d.fileName}>
                          {d.docType && (
                            <span className="crm-from-lead-tag" style={{ marginRight: 6 }}>
                              {DOC_LABEL[d.docType] || d.docType}
                              {versionOf(d) ? ` v${versionOf(d)}` : ""}
                            </span>
                          )}
                          {d.fileName}
                        </span>
                        <span className="crm-attachment-sub">
                          {formatFileSize(d.fileSize)} • {d.uploadedByName || "Team"} • {fmtWhen(d.createdAt, false)}
                        </span>
                      </div>
                      <div className="crm-attachment-actions">
                        <a href={`/api/crm/enquiries/attachments?source=${open.source}&leadId=${open.id}&fileId=${encodeURIComponent(d.id)}`} target="_blank" rel="noreferrer" className="crm-att-btn">
                          View
                        </a>
                        <a
                          href={`/api/crm/enquiries/attachments?source=${open.source}&leadId=${open.id}&fileId=${encodeURIComponent(d.id)}&download=1`}
                          download={d.fileName}
                          className="crm-att-btn"
                        >
                          Download
                        </a>
                        {canDeleteDocs && !viewOnly && (
                          <button type="button" className="crm-att-btn crm-att-btn-del" onClick={() => remove(d)} aria-label={`Delete ${d.fileName}`}>
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

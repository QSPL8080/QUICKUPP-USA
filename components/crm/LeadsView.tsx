"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/components/crm/Feedback";
import type { EnquiryRow, LeadRow } from "@/lib/crm/data";
import {
  ENQUIRY_STATUSES,
  ENQUIRY_STATUS_LABEL,
  LEAD_BUDGETS,
  LEAD_CHANNELS,
  LEAD_INDUSTRIES,
  LEAD_SERVICES,
  LEAD_TIMELINES,
  SOURCE_LABEL,
  type EnquiryStatus,
} from "@/lib/crm/leadOptions";
import { BulkBar, SelectBox, useSelection } from "@/components/crm/Selection";

const fmtDate = (iso: string, withTime = false) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });

type LeadForm = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  companyWebsite: string;
  country: string;
  industry: string;
  service: string;
  category: string;
  budget: string;
  timeline: string;
  channel: string;
  assignedTo: string;
  notes: string;
  status: EnquiryStatus;
};

const blankForm = (): LeadForm => ({
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  companyWebsite: "",
  country: "",
  industry: "",
  service: "",
  category: "",
  budget: "",
  timeline: "",
  channel: "Manual",
  assignedTo: "",
  notes: "",
  status: "new",
});

const formFrom = (l: EnquiryRow): LeadForm => ({
  fullName: l.name,
  email: l.email,
  phone: l.phone || "",
  companyName: l.company || "",
  companyWebsite: l.website || "",
  country: l.country || "",
  industry: l.industry || "",
  service: l.service || "",
  category: l.interest || "",
  budget: l.budget || "",
  timeline: l.timeline || "",
  channel: l.channel && (LEAD_CHANNELS as readonly string[]).includes(l.channel) ? l.channel : "Manual",
  assignedTo: l.assignedTo || "",
  notes: l.message || "",
  status: l.status,
});

function StatusSelect({ value, busy, label, onChange }: { value: EnquiryStatus; busy: boolean; label: string; onChange: (s: string) => void }) {
  return (
    <select className={`crm-status crm-lead-status crm-lead-status-${value}`} value={value} disabled={busy} onChange={(e) => onChange(e.target.value)} aria-label={label}>
      {ENQUIRY_STATUSES.map((s) => (
        <option key={s} value={s}>
          {ENQUIRY_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

export default function LeadsView({
  rows,
  offset,
  team,
  currentUser,
  openNew,
}: {
  rows: LeadRow[];
  offset: number;
  team: string[];
  currentUser?: { id?: number; name: string; email: string; role?: string };
  openNew?: boolean;
}) {
  const router = useRouter();
  const { confirm, toast } = useFeedback();
  const [open, setOpen] = useState<EnquiryRow | null>(null);
  const [loading, setLoading] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<"new" | EnquiryRow | null>(openNew ? "new" : null);
  const [form, setForm] = useState<LeadForm>(blankForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const sel = useSelection<string>(rows.map((r) => r.key));

  /* ---- details ---- */
  const show = async (r: LeadRow) => {
    setError("");
    setLoading(r.key);
    const res = await fetch(`/api/crm/enquiries?source=${r.source}&id=${r.id}`).catch(() => null);
    const json = res ? await res.json().catch(() => null) : null;
    setLoading("");
    if (!res?.ok || !json?.lead) {
      setError(json?.error || "Couldn't open this lead. Please try again.");
      if (res?.status === 404) router.refresh();
      return;
    }
    setOpen(json.lead);
  };

  const setStatus = async (source: string, id: number, status: string) => {
    setBusy(true);
    setError("");
    const res = await fetch("/api/crm/enquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, id, status }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return setError("Couldn't update the status. Please try again.");
    toast("Status updated");
    if (open && open.source === source && open.id === id) setOpen({ ...open, status: status as EnquiryStatus });
    router.refresh();
  };

  const setAssignedTo = async (source: string, id: number, assignedTo: string) => {
    setBusy(true);
    setError("");
    const res = await fetch("/api/crm/enquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, id, assignedTo }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return setError("Couldn't update the assigned team member. Please try again.");
    toast(assignedTo ? `Assigned to ${assignedTo}` : "Unassigned");
    if (open && open.source === source && open.id === id) {
      setOpen({ ...open, assignedTo: assignedTo || null });
    }
    router.refresh();
  };

  const removeKeys = async (keys: string[], what: string) => {
    if (!(await confirm({ title: `Delete ${what}?`, message: "It will be permanently removed from the CRM and the database. This can't be undone." }))) return false;
    setBusy(true);
    setError("");
    const res = await fetch("/api/crm/enquiries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok && res?.status !== 404) {
      setError("Couldn't delete. Please try again.");
      toast("Couldn't delete. Please try again.", "error");
      return false;
    }
    toast(keys.length === 1 ? "Lead deleted" : `${keys.length} leads deleted`);
    router.refresh();
    return true;
  };

  const removeSelected = async () => {
    const keys = sel.selected;
    if (!keys.length) return;
    if (await removeKeys(keys, keys.length === 1 ? "this lead" : `these ${keys.length} leads`)) sel.clear();
  };

  /* ---- add / edit leads ---- */
  const openForm = (lead: "new" | EnquiryRow) => {
    if (lead === "new") {
      const bf = blankForm();
      bf.assignedTo = currentUser?.name || team[0] || "";
      setForm(bf);
    } else {
      setForm(formFrom(lead));
    }
    setErrors({});
    setFormError("");
    setEditing(lead);
  };

  const editLead = async (r: LeadRow | EnquiryRow) => {
    if ("source" in r && "detail" in r && !("interest" in r)) {
      setError("");
      setLoading(r.key);
      const res = await fetch(`/api/crm/enquiries?source=${r.source}&id=${r.id}`).catch(() => null);
      const json = res ? await res.json().catch(() => null) : null;
      setLoading("");
      if (json?.lead) {
        openForm(json.lead);
      } else {
        toast("Couldn't open lead for editing", "error");
      }
    } else {
      openForm(r as EnquiryRow);
    }
  };

  const set = (k: keyof LeadForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v, ...(k === "service" ? { category: "" } : {}) }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };
  const err = (k: string) => (errors[k] ? <span className="crm-field-error">{errors[k]}</span> : null);
  const serviceOptions = LEAD_SERVICES.find((s) => s.value === form.service)?.options || [];

  const [isLeadCategoryOpen, setIsLeadCategoryOpen] = useState(false);
  const leadCategoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (leadCategoryRef.current && !leadCategoryRef.current.contains(e.target as Node)) {
        setIsLeadCategoryOpen(false);
      }
    }
    if (isLeadCategoryOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isLeadCategoryOpen]);

  const selectedLeadCategories = form.category
    ? form.category.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const toggleLeadCategory = (cat: string) => {
    const next = selectedLeadCategories.includes(cat)
      ? selectedLeadCategories.filter((c) => c !== cat)
      : [...selectedLeadCategories, cat];
    setForm((f) => ({ ...f, category: next.join(", ") }));
    if (errors.category) setErrors((p) => ({ ...p, category: "" }));
  };

  const selectAllLeadCategories = () => {
    setForm((f) => ({ ...f, category: serviceOptions.join(", ") }));
    if (errors.category) setErrors((p) => ({ ...p, category: "" }));
  };

  const clearLeadCategories = () => {
    setForm((f) => ({ ...f, category: "" }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError("");
    const isNew = editing === "new";
    const editSource = !isNew ? (editing as EnquiryRow).source : undefined;
    const editId = !isNew ? (editing as EnquiryRow).id : undefined;
    const res = await fetch("/api/crm/enquiries", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isNew ? form : { ...form, id: editId, source: editSource }),
    }).catch(() => null);
    setBusy(false);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok || !json.ok) {
      if (json.errors) setErrors(json.errors);
      else setFormError(json.error || "Couldn't save the lead. Please try again.");
      return;
    }
    if (!isNew && open && editSource && editId) {
      const fresh = await fetch(`/api/crm/enquiries?source=${editSource}&id=${editId}`).then((r) => r.json()).catch(() => null);
      if (fresh?.lead) setOpen(fresh.lead);
    }
    setEditing(null);
    toast(isNew ? "Lead added" : "Changes saved");
    router.refresh();
  };

  return (
    <>
      <BulkBar sel={sel} noun={["lead", "leads"]} busy={busy} onDelete={removeSelected} />
      {error && !open && (
        <p className="crm-alert crm-alert-inset" role="alert">
          {error}
        </p>
      )}

      {rows.length ? (
        <div className="crm-table-wrap">
          <table className="crm-table crm-stack crm-selectable">
            <thead>
              <tr>
                <th className="crm-col-check">
                  <SelectBox checked={sel.all} mixed={sel.some} onChange={sel.toggleAll} label="Select all on this page" />
                </th>
                <th className="crm-col-num">Sr. No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Source</th>
                <th>Assigned To</th>
                <th>Received</th>
                <th>Status</th>
                <th style={{ width: "115px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.key} onClick={() => show(r)} className={`crm-row${sel.has(r.key) ? " is-picked" : ""}${loading === r.key ? " is-loading" : ""}`}>
                  <td className="crm-col-check" onClick={(e) => e.stopPropagation()}>
                    <SelectBox checked={sel.has(r.key)} onChange={(on) => sel.toggle(r.key, on)} label={`Select ${r.name}`} />
                  </td>
                  <td data-label="Sr. No" className="crm-col-num">
                    {offset + i + 1}
                  </td>
                  <td data-label="Name" className="crm-cell-main">
                    <span className="crm-strong">{r.name}</span>
                    {r.company && <span className="crm-cell-sub">{r.company}</span>}
                  </td>
                  <td data-label="Email" className="crm-nowrap">
                    {r.email || <span className="crm-muted">—</span>}
                  </td>
                  <td data-label="Phone" className="crm-nowrap">
                    {r.phone || <span className="crm-muted">—</span>}
                  </td>
                  <td data-label="Source">
                    <span className={`crm-src crm-src-${r.source === "contact" ? "contact" : r.source === "manual" ? "manual" : "service"}`}>{SOURCE_LABEL[r.source]}</span>
                    {r.source !== "youtube" && r.detail && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                        {r.detail.split(",").map((cat, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: "11px",
                              lineHeight: "1.25",
                              padding: "2px 6px",
                              background: "#f1f5f9",
                              borderRadius: "4px",
                              color: "#334155",
                              fontWeight: 500,
                            }}
                          >
                            {cat.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td data-label="Assigned To" className="crm-nowrap" onClick={(e) => e.stopPropagation()}>
                    <select
                      className="crm-mgmt-select"
                      style={{ height: "30px", fontSize: "12px", minWidth: "125px" }}
                      value={r.assignedTo || ""}
                      disabled={busy}
                      onChange={(e) => setAssignedTo(r.source, r.id, e.target.value)}
                      aria-label={`Assigned team member for ${r.name}`}
                    >
                      <option value="">Not assigned</option>
                      {team.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                      {r.assignedTo && !team.includes(r.assignedTo) && (
                        <option value={r.assignedTo}>{r.assignedTo}</option>
                      )}
                    </select>
                  </td>
                  <td data-label="Received" className="crm-nowrap">
                    {fmtDate(r.createdAt)}
                  </td>
                  <td data-label="Status" onClick={(e) => e.stopPropagation()}>
                    <StatusSelect value={r.status} busy={busy} label={`Status for ${r.name}`} onChange={(s) => setStatus(r.source, r.id, s)} />
                  </td>
                  <td data-label="Actions" className="crm-nowrap" onClick={(e) => e.stopPropagation()} style={{ textAlign: "center" }}>
                    <div className="crm-tbl-actions">
                      <button
                        type="button"
                        className="crm-tbl-btn crm-tbl-btn-view"
                        title="View details"
                        aria-label={`View details for ${r.name}`}
                        onClick={() => show(r)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="crm-tbl-btn crm-tbl-btn-edit"
                        title="Edit lead"
                        aria-label={`Edit ${r.name}`}
                        onClick={() => editLead(r)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="crm-tbl-btn crm-tbl-btn-del"
                        title="Delete lead"
                        aria-label={`Delete ${r.name}`}
                        onClick={() => removeKeys([r.key], `the lead from ${r.name}`)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="crm-empty">
          <div className="crm-empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="crm-empty-title">No enquiries found</p>
          <p className="crm-empty-sub">Contact form submissions, service requests, and manual leads will appear here.</p>
          <button type="button" className="crm-act crm-act-dark" onClick={() => openForm("new")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add lead
          </button>
        </div>
      )}

      {/* ---- detail drawer ---- */}
      {open && (
        <div className="crm-drawer-wrap" onClick={() => setOpen(null)}>
          <aside className="crm-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Lead from ${open.name}`}>
            {/* Header: Avatar, Name, Source badge, Action buttons */}
            <div className="crm-detail-head">
              <div className="crm-detail-lead-info">
                <div className="crm-lead-avatar">
                  {(open.name || "Lead")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0].toUpperCase())
                    .join("") || "L"}
                </div>
                <div>
                  <div className="crm-lead-title-row">
                    <h2 className="crm-drawer-title" style={{ fontSize: "18px" }}>{open.name}</h2>
                    <span className="crm-lead-badge-pill">{SOURCE_LABEL[open.source]}</span>
                  </div>
                  <p className="crm-muted" style={{ margin: "2px 0 0 0", fontSize: "12px" }}>
                    {open.company ? `${open.company} · ` : ""}{open.service || SOURCE_LABEL[open.source]} • Received {fmtDate(open.createdAt, true)}
                  </p>
                </div>
              </div>

              <div className="crm-detail-btn-row">
                {open.phone && (
                  <a className="crm-head-btn" href={`tel:${open.phone.replace(/[^\d+]/g, "")}`}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    Call
                  </a>
                )}
                {open.phone && (
                  <a
                    className="crm-head-btn crm-head-btn-wa"
                    href={`https://wa.me/${open.phone.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.777.804 2.791.805h.005c3.18 0 5.767-2.586 5.768-5.766 0-1.541-.6-2.99-1.69-4.08-1.09-1.09-2.54-1.691-4.084-1.691zm0-2c4.29 0 7.768 3.477 7.768 7.766 0 2.072-.807 4.02-2.273 5.485-1.467 1.467-3.414 2.275-5.49 2.275h-.005c-1.332 0-2.639-.356-3.784-1.031l-4.247 1.114 1.134-4.143c-.742-1.2-1.133-2.584-1.133-3.966.002-4.289 3.479-7.766 7.77-7.766zm-3.34 4.542c-.183-.408-.376-.416-.55-.424l-.468-.008c-.161 0-.424.061-.646.303-.222.242-.848.828-.848 2.02 0 1.192.868 2.343.989 2.505.121.162 1.676 2.678 4.12 3.633 1.996.779 2.404.624 2.838.584.434-.04 1.393-.57 1.59-1.121.198-.55.198-1.022.139-1.122-.06-.099-.222-.161-.468-.283-.246-.121-1.455-.718-1.68-.8-.226-.081-.39-.122-.555.122-.164.243-.637.8-.781.962-.144.162-.288.182-.534.061-.246-.122-1.038-.383-1.978-1.221-.731-.652-1.225-1.457-1.369-1.703-.144-.246-.015-.379.108-.501.111-.11.246-.283.37-.424.123-.142.164-.243.246-.405.082-.162.041-.304-.02-.425-.062-.122-.55-1.353-.768-1.854z" />
                    </svg>
                    WhatsApp
                  </a>
                )}
                {open.email && (
                  <a className="crm-head-btn" href={`mailto:${open.email}`}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Email
                  </a>
                )}
                <button type="button" className="crm-head-btn" onClick={() => editLead(open)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                  Edit
                </button>
                <button
                  type="button"
                  className="crm-head-btn crm-head-btn-del"
                  title="Delete lead"
                  disabled={busy}
                  onClick={async () => {
                    if (await removeKeys([`${open.source}:${open.id}`], `the lead from ${open.name}`)) setOpen(null);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
                <button type="button" className="crm-head-btn-close" onClick={() => setOpen(null)} aria-label="Close">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 4-Card Top Management Bar */}
            <div className="crm-mgmt-bar">
              <div className="crm-mgmt-card">
                <span className="crm-mgmt-label">Lead Status</span>
                <select
                  className="crm-mgmt-select crm-mgmt-status-select"
                  value={open.status}
                  disabled={busy}
                  onChange={(e) => setStatus(open.source, open.id, e.target.value)}
                  aria-label="Lead status"
                >
                  {ENQUIRY_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {ENQUIRY_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="crm-mgmt-card">
                <span className="crm-mgmt-label">Project Status</span>
                <select
                  className="crm-mgmt-select crm-mgmt-project-select"
                  defaultValue="Not Started"
                  aria-label="Project status"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="Discovery">Discovery</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="crm-mgmt-card">
                <span className="crm-mgmt-label">Handled By</span>
                <select
                  className="crm-mgmt-select"
                  value={open.assignedTo || ""}
                  disabled={busy}
                  onChange={(e) => setAssignedTo(open.source, open.id, e.target.value)}
                  aria-label="Assigned team member"
                >
                  <option value="">Not assigned yet</option>
                  {team.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  {open.assignedTo && !team.includes(open.assignedTo) && (
                    <option value={open.assignedTo}>{open.assignedTo}</option>
                  )}
                </select>
              </div>

              <div className="crm-mgmt-card">
                <span className="crm-mgmt-label">Closed</span>
                <div className="crm-mgmt-val">
                  {open.status === "closed" ? "Closed" : "Not closed"}
                </div>
              </div>
            </div>

            {error && (
              <p className="crm-alert" role="alert">
                {error}
              </p>
            )}

            {/* Notes / Message card */}
            <div className="crm-message" style={{ margin: 0 }}>
              <p className="crm-label">{open.source === "manual" ? "Notes" : "Message / Enquiry details"}</p>
              <div className="crm-message-text">
                {open.message ? open.message : "No details were provided with this enquiry."}
              </div>
            </div>

            {/* Payment Links card */}
            <div className="crm-drawer-card">
              <div className="crm-drawer-card-head">
                <span className="crm-drawer-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Payment Links · Orders &amp; Payments
                </span>
                <a
                  href={`/crm/payments/links?clientName=${encodeURIComponent(open.name)}&clientEmail=${encodeURIComponent(open.email || "")}&phone=${encodeURIComponent(open.phone || "")}`}
                  className="crm-act crm-act-sm"
                  style={{ background: "#7c3aed", color: "#ffffff", padding: "5px 12px", fontSize: "12px", borderRadius: "7px", textDecoration: "none", fontWeight: 600 }}
                >
                  + Generate Payment Link
                </a>
              </div>
              <p className="crm-drawer-card-empty">No payment links for this lead yet.</p>
            </div>

            {/* Attachments card */}
            <div className="crm-drawer-card">
              <div className="crm-drawer-card-head">
                <span className="crm-drawer-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                  Attachments
                </span>
                <button
                  type="button"
                  className="crm-act crm-act-ghost crm-act-sm"
                  style={{ fontSize: "12px", padding: "4px 10px" }}
                  onClick={() => toast("Attachments feature ready for this lead.")}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Add files
                </button>
              </div>
              <p className="crm-drawer-card-empty">No files attached yet. PNG, JPG, PDF, DOC and CSV files up to 10 MB can be added.</p>
            </div>

            {/* Meeting card */}
            <div className="crm-drawer-card">
              <div className="crm-drawer-card-head">
                <span className="crm-drawer-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Meeting Information
                </span>
                <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", background: "#f1f5f9", color: "#475569", borderRadius: "9999px" }}>
                  Not scheduled
                </span>
              </div>
              <p className="crm-drawer-card-empty">No meeting has been scheduled for this lead yet. Call or WhatsApp the client using the buttons at the top to set one up.</p>
            </div>

            {/* Full Details Grid */}
            <div className="crm-drawer-card">
              <div className="crm-drawer-card-head">
                <span className="crm-drawer-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                  Lead Details
                </span>
              </div>

              <dl className="crm-details" style={{ margin: 0 }}>
                <dt>Source</dt>
                <dd>{SOURCE_LABEL[open.source]}</dd>
                {open.channel && (
                  <>
                    <dt>Lead source</dt>
                    <dd>{open.channel}</dd>
                  </>
                )}
                <dt>Email</dt>
                <dd className="crm-break">
                  {open.email ? (
                    <a href={`mailto:${open.email}`} style={{ color: "inherit", textDecoration: "underline" }}>
                      {open.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
                <dt>Phone</dt>
                <dd>
                  {open.phone ? (
                    <a href={`tel:${open.phone}`} style={{ color: "inherit", textDecoration: "underline" }}>
                      {open.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
                <dt>Company</dt>
                <dd>{open.company || "—"}</dd>
                {open.website && (
                  <>
                    <dt>Website</dt>
                    <dd className="crm-break">
                      <a href={open.website} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>
                        {open.website}
                      </a>
                    </dd>
                  </>
                )}
                {open.country && (
                  <>
                    <dt>{open.source === "manual" ? "Location" : "Country"}</dt>
                    <dd>{open.country}</dd>
                  </>
                )}
                {open.industry && (
                  <>
                    <dt>Industry</dt>
                    <dd>{open.industry === "Other" && open.otherIndustry ? `Other — ${open.otherIndustry}` : open.industry}</dd>
                  </>
                )}
                {open.service && (
                  <>
                    <dt>Service</dt>
                    <dd>{open.service}</dd>
                  </>
                )}
                {open.youtubeLink && (
                  <>
                    <dt>YouTube Link</dt>
                    <dd className="crm-break">
                      <a
                        href={open.youtubeLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#ef4444", fontWeight: 700 }}
                      >
                        ▶ {open.youtubeLink}
                      </a>
                    </dd>
                  </>
                )}
                {open.source !== "youtube" && (
                  <>
                    <dt>{open.source === "contact" ? "Service" : "Service Category / Scope"}</dt>
                    <dd>
                      {open.interest ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "2px" }}>
                          {open.interest.split(",").map((cat, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: "12px",
                                lineHeight: "1.3",
                                padding: "3px 9px",
                                background: "#ede9fe",
                                color: "#5b21b6",
                                borderRadius: "5px",
                                fontWeight: 600,
                              }}
                            >
                              {cat.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </>
                )}
                <dt>Budget</dt>
                <dd>{open.budget || "—"}</dd>
                {open.timeline && (
                  <>
                    <dt>Timeline</dt>
                    <dd>{open.timeline}</dd>
                  </>
                )}
                <dt>Handled by</dt>
                <dd><strong>{open.assignedTo || "Not assigned yet"}</strong></dd>
                {open.createdBy && (
                  <>
                    <dt>Added by</dt>
                    <dd>{open.createdBy}</dd>
                  </>
                )}
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
            </div>

            {/* Activity History & Audit Trail */}
            <div className="crm-drawer-card">
              <div className="crm-drawer-card-head">
                <span className="crm-drawer-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Activity History &amp; Audit Trail
                </span>
              </div>
              <div className="crm-timeline">
                <div className="crm-timeline-item">
                  <div className="crm-timeline-dot" />
                  <div className="crm-timeline-body">
                    <div className="crm-timeline-top">
                      <span className="crm-timeline-title">Lead received</span>
                      <span className="crm-timeline-time">{fmtDate(open.createdAt, true)}</span>
                    </div>
                    <p className="crm-timeline-desc">
                      Submitted via {SOURCE_LABEL[open.source]}{open.sourcePage ? ` (${open.sourcePage})` : ""}.
                    </p>
                  </div>
                </div>

                {open.assignedTo && (
                  <div className="crm-timeline-item">
                    <div className="crm-timeline-dot" style={{ background: "#10b981", borderColor: "#d1fae5" }} />
                    <div className="crm-timeline-body">
                      <div className="crm-timeline-top">
                        <span className="crm-timeline-title">Handled by</span>
                      </div>
                      <p className="crm-timeline-desc">
                        Assigned to <strong>{open.assignedTo}</strong>
                      </p>
                    </div>
                  </div>
                )}

                <div className="crm-timeline-item">
                  <div className="crm-timeline-dot" style={{ background: "#3b82f6", borderColor: "#dbeafe" }} />
                  <div className="crm-timeline-body">
                    <div className="crm-timeline-top">
                      <span className="crm-timeline-title">Pipeline Status: {ENQUIRY_STATUS_LABEL[open.status]}</span>
                    </div>
                    <p className="crm-timeline-desc">
                      Lead is currently marked as {ENQUIRY_STATUS_LABEL[open.status]}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ---- add / edit lead ---- */}
      {editing && (
        <div className="crm-modal-wrap" onClick={() => setEditing(null)}>
          <form className="crm-modal crm-modal-wide" onClick={(e) => e.stopPropagation()} onSubmit={save} noValidate role="dialog" aria-label={editing === "new" ? "Add lead" : "Edit lead"}>
            <div className="crm-drawer-head">
              <div>
                <p className="crm-drawer-kicker">{editing === "new" ? "All Enquiries" : `Lead #${editing.id}`}</p>
                <h2 className="crm-drawer-title">{editing === "new" ? "Add new lead" : `Edit lead — ${editing.name}`}</h2>
              </div>
              <button type="button" className="crm-icon-act" onClick={() => setEditing(null)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="crm-form-grid crm-form-grid-3">
              <label className="crm-field">
                <span className="crm-label">Lead source *</span>
                <select className="crm-input crm-select" value={form.channel} onChange={set("channel")}>
                  {LEAD_CHANNELS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {err("channel")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Client full name *</span>
                <input className="crm-input" value={form.fullName} onChange={set("fullName")} placeholder="e.g. John Carter" />
                {err("fullName")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Company / brand</span>
                <input className="crm-input" value={form.companyName} onChange={set("companyName")} placeholder="e.g. Carter Realty" />
                {err("companyName")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Phone / WhatsApp *</span>
                <input className="crm-input" type="tel" value={form.phone} onChange={set("phone")} placeholder="+1 302 555 0147" />
                {err("phone")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Email address</span>
                <input className="crm-input" type="email" value={form.email} onChange={set("email")} placeholder="client@company.com" />
                {err("email")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Website</span>
                <input className="crm-input" value={form.companyWebsite} onChange={set("companyWebsite")} placeholder="https://company.com" />
                {err("companyWebsite")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Service *</span>
                <select className="crm-input crm-select" value={form.service} onChange={set("service")}>
                  <option value="">Select service</option>
                  {LEAD_SERVICES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.value}
                    </option>
                  ))}
                </select>
                {err("service")}
              </label>
              {serviceOptions.length > 0 && (
                <div className="crm-field" ref={leadCategoryRef} style={{ position: "relative" }}>
                  <span className="crm-label">
                    Service Categories * {selectedLeadCategories.length > 0 && <span style={{ color: "#7c3aed", fontWeight: 700 }}>({selectedLeadCategories.length} selected)</span>}
                  </span>

                <button
                  type="button"
                  className={`crm-input crm-select ${errors.category ? "has-error" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    textAlign: "left",
                    cursor: form.service ? "pointer" : "not-allowed",
                    opacity: form.service ? 1 : 0.6,
                    height: "38px",
                    padding: "0 10px",
                  }}
                  disabled={!form.service}
                  onClick={() => setIsLeadCategoryOpen((v) => !v)}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, color: selectedLeadCategories.length ? "#0f172a" : "#94a3b8" }}>
                    {!form.service
                      ? "Choose a service first"
                      : selectedLeadCategories.length === 0
                      ? "Select service categories..."
                      : selectedLeadCategories.length === 1
                      ? selectedLeadCategories[0]
                      : `${selectedLeadCategories[0]} (+${selectedLeadCategories.length - 1} more)`}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ transform: isLeadCategoryOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {isLeadCategoryOpen && form.service && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      left: 0,
                      right: 0,
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                      zIndex: 100,
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                      <span>{serviceOptions.length} Categories</span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button type="button" onClick={selectAllLeadCategories} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontWeight: 600 }}>Select All</button>
                        <span>•</span>
                        <button type="button" onClick={clearLeadCategories} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: 600 }}>Clear</button>
                      </div>
                    </div>
                    <div style={{ maxHeight: "200px", overflowY: "auto", padding: "4px 0" }}>
                      {serviceOptions.map((opt) => {
                        const isChecked = selectedLeadCategories.includes(opt);
                        return (
                          <div
                            key={opt}
                            onClick={() => toggleLeadCategory(opt)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "6px 12px",
                              fontSize: "12.5px",
                              cursor: "pointer",
                              background: isChecked ? "#f5f3ff" : "transparent",
                              fontWeight: isChecked ? 600 : 400,
                              color: isChecked ? "#5b21b6" : "#334155",
                            }}
                          >
                            <input type="checkbox" checked={isChecked} onChange={() => {}} style={{ accentColor: "#7c3aed" }} />
                            <span style={{ flex: 1 }}>{opt}</span>
                            {isChecked && <span style={{ color: "#10b981", fontWeight: 800 }}>✓</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected pills in modal */}
                {selectedLeadCategories.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                    {selectedLeadCategories.map((c) => (
                      <span
                        key={c}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                          padding: "2px 7px",
                          background: "#ede9fe",
                          color: "#5b21b6",
                          borderRadius: "4px",
                          fontWeight: 600,
                        }}
                      >
                        {c}
                        <button
                          type="button"
                          onClick={() => toggleLeadCategory(c)}
                          style={{ background: "none", border: "none", color: "#7c3aed", cursor: "pointer", padding: "0 2px", fontSize: "13px" }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {err("category")}
              </div>
            )}
              <label className="crm-field">
                <span className="crm-label">Industry</span>
                <select className="crm-input crm-select" value={form.industry} onChange={set("industry")}>
                  <option value="">Select industry</option>
                  {LEAD_INDUSTRIES.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                {err("industry")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Location / city</span>
                <input className="crm-input" value={form.country} onChange={set("country")} placeholder="e.g. Dover, Delaware" />
              </label>
              <label className="crm-field">
                <span className="crm-label">Budget</span>
                <select className="crm-input crm-select" value={form.budget} onChange={set("budget")}>
                  <option value="">Select budget</option>
                  {LEAD_BUDGETS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                {err("budget")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Timeline</span>
                <select className="crm-input crm-select" value={form.timeline} onChange={set("timeline")}>
                  <option value="">Select timeline</option>
                  {LEAD_TIMELINES.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                {err("timeline")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Lead status</span>
                <select className="crm-input crm-select" value={form.status} onChange={set("status")}>
                  {ENQUIRY_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {ENQUIRY_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
                {err("status")}
              </label>
              <label className="crm-field crm-span-2">
                <span className="crm-label">Assigned to</span>
                <input className="crm-input" list="crm-team" value={form.assignedTo} onChange={set("assignedTo")} placeholder="Select a team member or type a name" />
                <datalist id="crm-team">
                  {team.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </label>
              <label className="crm-field crm-span-3">
                <span className="crm-label">Notes &amp; requirements</span>
                <textarea className="crm-input crm-textarea" rows={4} value={form.notes} onChange={set("notes")} placeholder="Requirements, deadlines or anything the team should know" />
              </label>
            </div>

            {formError && (
              <p className="crm-alert" role="alert">
                {formError}
              </p>
            )}

            <div className="crm-modal-foot">
              <span />
              <span className="crm-modal-foot-end">
                <button type="button" className="crm-act crm-act-ghost" onClick={() => setEditing(null)}>
                  Cancel
                </button>
                <button type="submit" className="crm-act crm-act-dark" disabled={busy}>
                  {busy ? "Saving…" : editing === "new" ? "Add lead" : "Save changes"}
                </button>
              </span>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

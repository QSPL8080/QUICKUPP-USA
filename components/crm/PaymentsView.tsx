"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/components/crm/Feedback";
import type { PaymentRow } from "@/lib/crm/data";
import { PAYMENT_STATUS_LABEL, money } from "@/lib/crm/format";
import { BulkBar, SelectBox, useSelection } from "@/components/crm/Selection";
import { PageHead, Filters, Pager } from "@/components/crm/ListTools";

const fmtDate = (d: string | null, withTime = false) => {
  if (!d) return "—";
  try {
    const dt = new Date(d.includes("T") ? d : `${d}T00:00:00`);
    return dt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    });
  } catch {
    return d;
  }
};

const today = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
};

type Options = {
  services: readonly string[];
  methods: readonly string[];
  currencies: readonly string[];
  statuses: readonly string[];
};

type FormState = {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  companyName: string;
  service: string;
  category: string;
  description: string;
  amount: string;
  totalAmount: string;
  paymentType: "full" | "partial";
  remainingAmount: string;
  currency: string;
  method: string;
  status: string;
  paidAt: string;
  invoiceNumber: string;
  reference: string;
  notes: string;
};

const blank = (): FormState => ({
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  companyName: "",
  service: "",
  category: "",
  description: "",
  amount: "",
  totalAmount: "",
  paymentType: "full",
  remainingAmount: "",
  currency: "USD",
  method: "PayPal",
  status: "paid",
  paidAt: today(),
  invoiceNumber: "",
  reference: "",
  notes: "",
});

const fromRow = (p: PaymentRow): FormState => ({
  clientName: p.clientName,
  clientEmail: p.clientEmail || "",
  clientPhone: p.clientPhone || "",
  companyName: p.companyName || "",
  service: p.service,
  category: p.category || "",
  description: p.description || "",
  amount: String(p.amount),
  totalAmount: p.totalAmount != null ? String(p.totalAmount) : String(p.amount),
  paymentType: p.paymentType || "full",
  remainingAmount: p.remainingAmount != null ? String(p.remainingAmount) : "0",
  currency: p.currency,
  method: p.method,
  status: p.status,
  paidAt: p.paidAt || "",
  invoiceNumber: p.invoiceNumber || "",
  reference: p.reference || "",
  notes: p.notes || "",
});

export default function PaymentsView({
  rows,
  options,
  openNew,
  q = "",
  status = "",
  currentTab = "website",
  counts,
  total = 0,
  page = 1,
  pages = 1,
  pageSize = 20,
}: {
  rows: PaymentRow[];
  options: Options;
  openNew: boolean;
  q?: string;
  status?: string;
  currentTab?: "website" | "payment_link" | "all";
  counts?: { website: number; paymentLink: number; all: number };
  total?: number;
  page?: number;
  pages?: number;
  pageSize?: number;
}) {
  const router = useRouter();
  const { confirm, toast } = useFeedback();
  const [editing, setEditing] = useState<PaymentRow | "new" | null>(openNew ? "new" : null);
  const [viewing, setViewing] = useState<PaymentRow | null>(null);
  const [form, setForm] = useState<FormState>(blank());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const sel = useSelection(rows.map((p) => p.id));

  const handleTabChange = (t: "website" | "payment_link" | "all") => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", t);
    params.set("page", "1");
    router.push(`/crm/payments?${params.toString()}`);
  };

  const openForm = (p: PaymentRow | "new") => {
    setForm(p === "new" ? blank() : fromRow(p));
    setErrors({});
    setError("");
    setEditing(p);
  };

  const close = () => setEditing(null);

  const set =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setError("");
    const isNew = editing === "new";
    const res = await fetch(isNew ? "/api/crm/payments" : `/api/crm/payments/${(editing as PaymentRow).id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => null);
    setBusy(false);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok || !json.ok) {
      if (json.errors) setErrors(json.errors);
      else setError(json.error || "Couldn't save the payment. Please try again.");
      return;
    }
    close();
    toast(editing === "new" ? "Payment added" : "Changes saved");
    router.refresh();
  };

  const deleteSingle = async (p: PaymentRow) => {
    if (
      !(await confirm({
        title: `Delete payment from ${p.clientName}?`,
        message: "It will be permanently removed from the CRM and the database. This action cannot be undone.",
      }))
    )
      return;
    setBusy(true);
    const res = await fetch(`/api/crm/payments/${p.id}`, { method: "DELETE" }).catch(() => null);
    setBusy(false);
    if (!res?.ok && res?.status !== 404) {
      toast("Couldn't delete payment. Please try again.");
      return;
    }
    if (viewing?.id === p.id) setViewing(null);
    toast("Payment deleted");
    router.refresh();
  };

  const remove = async () => {
    if (editing === "new" || !editing) return;
    deleteSingle(editing as PaymentRow);
    close();
  };

  const removeSelected = async () => {
    const ids = sel.selected;
    if (!ids.length) return;
    const what = ids.length === 1 ? "this payment" : `these ${ids.length} payments`;
    if (
      !(await confirm({
        title: `Delete ${what}?`,
        message: "They will be permanently removed from the CRM and the database. This can't be undone.",
      }))
    )
      return;
    setBusy(true);
    setListError("");
    const res = await fetch("/api/crm/payments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return setListError("Couldn't delete the selected payments. Please try again.");
    sel.clear();
    toast(ids.length === 1 ? "Payment deleted" : `${ids.length} payments deleted`);
    router.refresh();
  };

  const addButton = (
    <button type="button" className="crm-act crm-act-dark" onClick={() => openForm("new")}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
      Add payment
    </button>
  );

  const err = (k: string) => (errors[k] ? <span className="crm-field-error">{errors[k]}</span> : null);

  return (
    <>
      <PageHead title="Payments" sub="Track customer payments, invoices, balance dues, and official receipts.">
        {addButton}
      </PageHead>

      {/* 2 Tabs: Website vs Payment Link */}
      <div className="crm-payments-tabs">
        <button
          type="button"
          className={`crm-payments-tab ${currentTab === "website" ? "is-active" : ""}`}
          onClick={() => handleTabChange("website")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>Website</span>
          <span className="crm-tab-badge">{counts?.website ?? 0}</span>
        </button>

        <button
          type="button"
          className={`crm-payments-tab ${currentTab === "payment_link" ? "is-active" : ""}`}
          onClick={() => handleTabChange("payment_link")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span>Payment Link</span>
          <span className="crm-tab-badge">{counts?.paymentLink ?? 0}</span>
        </button>

        <button
          type="button"
          className={`crm-payments-tab ${currentTab === "all" ? "is-active" : ""}`}
          onClick={() => handleTabChange("all")}
        >
          <span>All Payments</span>
          <span className="crm-tab-badge">{counts?.all ?? 0}</span>
        </button>
      </div>

      <Filters
        q={q}
        status={status}
        placeholder="Search client, email, phone, company, invoice or transaction"
        statuses={options.statuses.map((s) => ({ value: s, label: PAYMENT_STATUS_LABEL[s] || s }))}
      />

      <div className="crm-card crm-card-flush">
        {rows.length > 0 && (
          <BulkBar sel={sel} noun={["payment", "payments"]} busy={busy} onDelete={removeSelected} />
        )}
        {listError && (
          <p className="crm-alert crm-alert-inset" role="alert">
            {listError}
          </p>
        )}

        {rows.length ? (
          <div className="crm-table-wrap">
            <table className="crm-table crm-stack crm-selectable">
              <thead>
                <tr>
                  <th className="crm-col-check">
                    <SelectBox
                      checked={sel.all}
                      mixed={sel.some}
                      onChange={sel.toggleAll}
                      label="Select all on this page"
                    />
                  </th>
                  <th style={{ width: "50px" }}>Sr No</th>
                  <th>Source</th>
                  <th>Timestamp</th>
                  <th>Client &amp; Business</th>
                  <th>Service &amp; Category</th>
                  <th>Amount &amp; Status</th>
                  <th>Invoice / Ref</th>
                  <th style={{ textAlign: "right", paddingRight: "18px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p, idx) => {
                  const srNo = (page - 1) * pageSize + idx + 1;
                  const isPartial = p.paymentType === "partial";
                  const totAmt = p.totalAmount != null ? p.totalAmount : p.amount;
                  const remAmt = p.remainingAmount != null ? p.remainingAmount : Math.max(0, totAmt - p.amount);

                  return (
                    <tr
                      key={p.id}
                      className={`crm-row${sel.has(p.id) ? " is-picked" : ""}`}
                      onClick={() => setViewing(p)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className="crm-col-check" onClick={(e) => e.stopPropagation()}>
                        <SelectBox
                          checked={sel.has(p.id)}
                          onChange={(on) => sel.toggle(p.id, on)}
                          label={`Select payment from ${p.clientName}`}
                        />
                      </td>

                      {/* Sr No */}
                      <td data-label="Sr No" style={{ color: "#64748b", fontWeight: 700, fontSize: "13px" }}>
                        #{srNo}
                      </td>

                      {/* Source */}
                      <td data-label="Source">
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: p.source === "website" ? "#f3e8ff" : "#eff6ff",
                            color: p.source === "website" ? "#7c3aed" : "#2563eb",
                            border: `1px solid ${p.source === "website" ? "#e9d5ff" : "#bfdbfe"}`,
                          }}
                        >
                          {p.source === "website" ? "Website" : p.source === "payment_link" ? "Payment Link" : "Manual"}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td data-label="Timestamp" className="crm-nowrap" style={{ fontSize: "13px" }}>
                        {fmtDate(p.paidAt || p.createdAt, true)}
                      </td>

                      {/* Client, Phone, Email */}
                      <td data-label="Client" className="crm-cell-main">
                        <span className="crm-strong" style={{ fontSize: "14px" }}>
                          {p.clientName}
                        </span>
                        {p.companyName && (
                          <span className="crm-cell-sub" style={{ color: "#475569" }}>
                            {p.companyName}
                          </span>
                        )}
                        <span className="crm-cell-sub" style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "3px" }}>
                          {p.clientEmail && (
                            <span style={{ color: "#2563eb" }}>✉ {p.clientEmail}</span>
                          )}
                          {p.clientPhone && (
                            <span style={{ color: "#0f172a", fontWeight: 500 }}>📞 {p.clientPhone}</span>
                          )}
                        </span>
                      </td>

                      {/* Service & Category */}
                      <td data-label="Service">
                        <span className="crm-strong" style={{ color: "#0f172a", fontSize: "13.5px" }}>
                          {p.service}
                        </span>
                        {p.category && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                            {p.category.split(",").map((cat, idx) => (
                              <span
                                key={idx}
                                className="crm-cell-sub"
                                style={{
                                  display: "inline-block",
                                  color: "#7c3aed",
                                  fontWeight: 600,
                                  background: "#faf5ff",
                                  padding: "2px 7px",
                                  borderRadius: "4px",
                                  fontSize: "11.5px",
                                  border: "1px solid #f3e8ff",
                                  lineHeight: "1.3",
                                }}
                              >
                                {cat.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Amount & Status (Fully Paid vs Partial Paid vs Pending vs Failed) */}
                      <td data-label="Amount" className="crm-nowrap">
                        {p.status === "failed" ? (
                          <>
                            <span
                              className="crm-pill crm-pill-failed"
                              style={{ marginBottom: "4px", display: "inline-block" }}
                            >
                              Failed
                            </span>
                            <span style={{ display: "block", fontSize: "12px", color: "#dc2626", fontWeight: 600 }}>
                              {money(p.amount, p.currency)} attempted
                            </span>
                          </>
                        ) : p.status === "pending" ? (
                          <>
                            <span
                              className="crm-pill crm-pill-pending"
                              style={{ marginBottom: "4px", display: "inline-block" }}
                            >
                              Pending Clearing
                            </span>
                            <span style={{ display: "block", fontSize: "12px", color: "#d97706", fontWeight: 600 }}>
                              {money(p.amount, p.currency)} processing
                            </span>
                          </>
                        ) : isPartial ? (
                          <>
                            <span
                              className="crm-pill crm-pill-partially_paid"
                              style={{ marginBottom: "4px", display: "inline-block" }}
                            >
                              Partially Paid
                            </span>
                            <span style={{ display: "block", fontSize: "12px", color: "#2563eb", fontWeight: 600 }}>
                              {money(p.amount, p.currency)} received · {money(remAmt, p.currency)} due
                            </span>
                          </>
                        ) : (
                          <>
                            <span
                              className="crm-pill crm-pill-paid"
                              style={{ marginBottom: "4px", display: "inline-block" }}
                            >
                              Fully Paid
                            </span>
                            <span style={{ display: "block", fontSize: "12px", color: "#15803d", fontWeight: 600 }}>
                              {money(p.amount, p.currency)} received
                            </span>
                          </>
                        )}
                      </td>

                      {/* Invoice / Ref */}
                      <td data-label="Invoice / Ref">
                        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>
                          {p.invoiceNumber || <span className="crm-muted">—</span>}
                        </span>
                        {p.reference && (
                          <span
                            className="crm-cell-sub"
                            style={{ fontFamily: "monospace", fontSize: "11px", wordBreak: "break-all" }}
                          >
                            {p.reference}
                          </span>
                        )}
                      </td>

                      {/* 3 Action Icons: View, Edit, Delete */}
                      <td
                        data-label="Actions"
                        onClick={(e) => e.stopPropagation()}
                        style={{ textAlign: "right" }}
                      >
                        <div className="crm-row-actions">
                          {/* 1. View Icon */}
                          <button
                            type="button"
                            className="crm-action-btn is-view"
                            title="View complete payment details"
                            onClick={() => setViewing(p)}
                            aria-label="View Details"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>

                          {/* 2. Edit Icon */}
                          <button
                            type="button"
                            className="crm-action-btn is-edit"
                            title="Edit payment"
                            onClick={() => openForm(p)}
                            aria-label="Edit Payment"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              <path d="m15 5 4 4" />
                            </svg>
                          </button>

                          {/* 3. Delete Icon */}
                          <button
                            type="button"
                            className="crm-action-btn is-delete"
                            title="Delete payment permanently"
                            onClick={() => deleteSingle(p)}
                            aria-label="Delete Payment"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="crm-empty">
            <div className="crm-empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <p className="crm-empty-title">
              {currentTab === "website" ? "No website payments found" : "No payment link payments found"}
            </p>
            <p className="crm-empty-sub">
              {currentTab === "website"
                ? "Payments completed via the website Pay Now button will automatically appear here."
                : "Transactions recorded manually or via payment links will appear here."}
            </p>
            <button type="button" className="crm-act crm-act-dark" onClick={() => openForm("new")}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add payment
            </button>
          </div>
        )}
        <Pager page={page} pages={pages} total={total} pageSize={pageSize} q={q} status={status} />
      </div>

      {/* ---- FULL DETAILS VIEW MODAL (Matching Screenshot 4 & 5) ---- */}
      {viewing && (
        <div className="crm-modal-wrap" onClick={() => setViewing(null)}>
          <div className="crm-view-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="crm-view-modal-head">
              <div className="crm-view-modal-head-left">
                <div className="crm-view-avatar">
                  {viewing.clientName
                    .split(" ")
                    .map((w) => w[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "QS"}
                </div>
                <div>
                  <h2 className="crm-view-modal-title">
                    <span>{viewing.clientName}</span>
                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: viewing.source === "website" ? "#f3e8ff" : "#eff6ff",
                        color: viewing.source === "website" ? "#7c3aed" : "#2563eb",
                        border: `1px solid ${viewing.source === "website" ? "#e9d5ff" : "#bfdbfe"}`,
                      }}
                    >
                      {viewing.source === "website" ? "Website Pay Now" : "Payment Link"}
                    </span>
                  </h2>
                  <p className="crm-view-modal-sub">
                    {viewing.companyName || "No Company"} • Received {fmtDate(viewing.paidAt || viewing.createdAt, true)}
                  </p>
                </div>
              </div>

              {/* Action Buttons in Head */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {viewing.clientPhone && (
                  <a
                    href={`tel:${viewing.clientPhone.replace(/[^\d+]/g, "")}`}
                    className="crm-act crm-act-ghost crm-act-sm"
                    title="Call Client"
                  >
                    📞 Call
                  </a>
                )}
                {viewing.clientPhone && (
                  <a
                    href={`https://wa.me/${viewing.clientPhone.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="crm-act crm-act-sm"
                    style={{ background: "#22c55e", color: "#fff", borderColor: "#22c55e" }}
                    title="Chat on WhatsApp"
                  >
                    💬 WhatsApp
                  </a>
                )}
                <a
                  href={`/api/payments/receipt?order=${encodeURIComponent(viewing.invoiceNumber || String(viewing.id))}`}
                  className="crm-act crm-act-ghost crm-act-sm"
                  title="Download Branded PDF Receipt"
                >
                  📄 Receipt PDF
                </a>
                <button
                  type="button"
                  className="crm-act crm-act-ghost crm-act-sm"
                  onClick={() => {
                    openForm(viewing);
                    setViewing(null);
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  type="button"
                  className="crm-icon-act"
                  onClick={() => setViewing(null)}
                  aria-label="Close"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="crm-view-modal-body">
              {/* Grid 1: Client Info & Lead Info */}
              <div className="crm-view-grid">
                {/* Client Information */}
                <div className="crm-view-card">
                  <h3 className="crm-view-card-title">
                    <span>👤</span>
                    <span>Client Information</span>
                  </h3>
                  <div className="crm-view-list">
                    <span className="crm-view-list-label">Client Name:</span>
                    <span className="crm-view-list-val">{viewing.clientName}</span>

                    <span className="crm-view-list-label">Company / Brand:</span>
                    <span className="crm-view-list-val">{viewing.companyName || "—"}</span>

                    <span className="crm-view-list-label">Phone / WhatsApp:</span>
                    <span className="crm-view-list-val">{viewing.clientPhone || "—"}</span>

                    <span className="crm-view-list-label">Email:</span>
                    <span className="crm-view-list-val" style={{ color: "#2563eb" }}>
                      {viewing.clientEmail || "—"}
                    </span>

                    <span className="crm-view-list-label">Billing Period:</span>
                    <span className="crm-view-list-val">
                      {viewing.billingStartDate
                        ? `${viewing.billingStartDate} to ${viewing.billingEndDate || "—"}`
                        : "Active Retainer"}
                    </span>
                  </div>
                </div>

                {/* Lead & Transaction Information */}
                <div className="crm-view-card">
                  <h3 className="crm-view-card-title">
                    <span>💳</span>
                    <span>Payment &amp; Transaction Information</span>
                  </h3>
                  <div className="crm-view-list">
                    <span className="crm-view-list-label">Source:</span>
                    <span className="crm-view-list-val">
                      {viewing.source === "website" ? "Website Pay Now Button" : "Payment Link"}
                    </span>

                    <span className="crm-view-list-label">Order Number:</span>
                    <span className="crm-view-list-val" style={{ fontFamily: "monospace", color: "#7c3aed" }}>
                      {viewing.invoiceNumber || `QS-${viewing.id}`}
                    </span>

                    <span className="crm-view-list-label">Transaction ID:</span>
                    <span className="crm-view-list-val" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                      {viewing.reference || "—"}
                    </span>

                    <span className="crm-view-list-label">PayPal Order ID:</span>
                    <span className="crm-view-list-val" style={{ fontFamily: "monospace" }}>
                      {viewing.paypalOrderId || "—"}
                    </span>

                    <span className="crm-view-list-label">Payment Method:</span>
                    <span className="crm-view-list-val">{viewing.method || "PayPal"}</span>

                    <span className="crm-view-list-label">Payment Date:</span>
                    <span className="crm-view-list-val">{fmtDate(viewing.paidAt || viewing.createdAt, true)}</span>
                  </div>
                </div>
              </div>

              {/* Requirement & Service Scope */}
              <div className="crm-view-card">
                <h3 className="crm-view-card-title">
                  <span>🎯</span>
                  <span>Project &amp; Service Requirement</span>
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "13px" }}>
                  <div>
                    <span style={{ color: "#64748b", display: "block", marginBottom: "2px" }}>Primary Service:</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{viewing.service}</span>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", display: "block", marginBottom: "4px" }}>Category / Package:</span>
                    {viewing.category ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                        {viewing.category.split(",").map((cat, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontWeight: 600,
                              color: "#7c3aed",
                              background: "#faf5ff",
                              border: "1px solid #f3e8ff",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                            }}
                          >
                            {cat.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontWeight: 700, color: "#64748b" }}>Standard</span>
                    )}
                  </div>
                </div>
                {viewing.notes && (
                  <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #e2e8f0" }}>
                    <span style={{ color: "#64748b", fontSize: "12px", display: "block", marginBottom: "4px" }}>
                      Notes / Instructions:
                    </span>
                    <p style={{ margin: 0, fontSize: "13px", color: "#334155" }}>{viewing.notes}</p>
                  </div>
                )}
              </div>

              {/* Financial Summary Card (Matching screenshot) */}
              <div className="crm-fin-summary-box">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6d28d9" }}>
                    Financial Summary (USD)
                  </span>
                  <span
                    className={`crm-pill crm-pill-${
                      viewing.status === "failed"
                        ? "failed"
                        : viewing.status === "pending"
                        ? "pending"
                        : viewing.paymentType === "partial"
                        ? "partially_paid"
                        : "paid"
                    }`}
                  >
                    {viewing.status === "failed"
                      ? "Failed"
                      : viewing.status === "pending"
                      ? "Pending Clearing"
                      : viewing.paymentType === "partial"
                      ? "Partially Paid"
                      : "Fully Paid"}
                  </span>
                </div>

                <div className="crm-fin-grid">
                  <div className="crm-fin-stat">
                    <div className="crm-fin-stat-label">Payment Status</div>
                    <div
                      className="crm-fin-stat-val"
                      style={{
                        fontSize: "14px",
                        color:
                          viewing.status === "failed"
                            ? "#dc2626"
                            : viewing.status === "pending"
                            ? "#d97706"
                            : viewing.paymentType === "partial"
                            ? "#2563eb"
                            : "#15803d",
                      }}
                    >
                      {viewing.status === "failed"
                        ? "Declined / Failed"
                        : viewing.status === "pending"
                        ? "Pending Clearing"
                        : viewing.paymentType === "partial"
                        ? "Deposit Received"
                        : "100% Cleared"}
                    </div>
                  </div>

                  <div className="crm-fin-stat">
                    <div className="crm-fin-stat-label">Deal / Total Amount</div>
                    <div className="crm-fin-stat-val">
                      {money(viewing.totalAmount != null ? viewing.totalAmount : viewing.amount, viewing.currency)}
                    </div>
                  </div>

                  <div className="crm-fin-stat">
                    <div className="crm-fin-stat-label">Amount Received</div>
                    <div className="crm-fin-stat-val" style={{ color: "#16a34a" }}>
                      {money(viewing.amount, viewing.currency)}
                    </div>
                  </div>

                  <div className="crm-fin-stat">
                    <div className="crm-fin-stat-label">Balance Due</div>
                    <div
                      className="crm-fin-stat-val"
                      style={{
                        color:
                          (viewing.remainingAmount || 0) > 0 || (viewing.totalAmount && viewing.totalAmount > viewing.amount)
                            ? "#ef4444"
                            : "#64748b",
                      }}
                    >
                      {money(
                        viewing.remainingAmount != null
                          ? viewing.remainingAmount
                          : Math.max(0, (viewing.totalAmount || viewing.amount) - viewing.amount),
                        viewing.currency
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                <a
                  href={`/api/payments/receipt?order=${encodeURIComponent(viewing.invoiceNumber || String(viewing.id))}`}
                  className="crm-act crm-act-dark"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                  <span>Download Official PDF Receipt</span>
                </a>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="crm-act crm-act-danger"
                    onClick={() => deleteSingle(viewing)}
                  >
                    Delete Payment
                  </button>
                  <button
                    type="button"
                    className="crm-act crm-act-ghost"
                    onClick={() => setViewing(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- ADD / EDIT PAYMENT MODAL ---- */}
      {editing && (
        <div className="crm-modal-wrap" onClick={close}>
          <form
            className="crm-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={save}
            noValidate
            role="dialog"
            aria-label={editing === "new" ? "Add payment" : "Edit payment"}
          >
            <div className="crm-drawer-head">
              <div>
                <p className="crm-drawer-kicker">{editing === "new" ? "Manual entry" : `Payment #${editing.id}`}</p>
                <h2 className="crm-drawer-title">{editing === "new" ? "Add payment" : "Edit payment"}</h2>
              </div>
              <button type="button" className="crm-icon-act" onClick={close} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="crm-form-grid">
              <label className="crm-field">
                <span className="crm-label">Client name *</span>
                <input className="crm-input" value={form.clientName} onChange={set("clientName")} required />
                {err("clientName")}
              </label>

              <label className="crm-field">
                <span className="crm-label">Client email</span>
                <input className="crm-input" type="email" value={form.clientEmail} onChange={set("clientEmail")} />
                {err("clientEmail")}
              </label>

              <label className="crm-field">
                <span className="crm-label">Client phone</span>
                <input className="crm-input" type="tel" value={form.clientPhone} onChange={set("clientPhone")} />
              </label>

              <label className="crm-field">
                <span className="crm-label">Company</span>
                <input className="crm-input" value={form.companyName} onChange={set("companyName")} />
              </label>

              <label className="crm-field">
                <span className="crm-label">Service *</span>
                <input className="crm-input" value={form.service} onChange={set("service")} required placeholder="e.g. AI-Powered Digital Marketing Services" />
                {err("service")}
              </label>

              <label className="crm-field">
                <span className="crm-label">Category / Package (Single or Multiple)</span>
                <input className="crm-input" value={form.category} onChange={set("category")} placeholder="e.g. AI UGC Video, AI Avatar Video (comma-separated)" />
              </label>

              <label className="crm-field">
                <span className="crm-label">Amount paid *</span>
                <input className="crm-input" type="number" step="any" value={form.amount} onChange={set("amount")} required />
                {err("amount")}
              </label>

              <label className="crm-field">
                <span className="crm-label">Total invoice amount</span>
                <input className="crm-input" type="number" step="any" value={form.totalAmount} onChange={set("totalAmount")} />
              </label>

              <label className="crm-field">
                <span className="crm-label">Payment option</span>
                <select className="crm-input crm-select" value={form.paymentType} onChange={set("paymentType")}>
                  <option value="full">Full Payment (100%)</option>
                  <option value="partial">Partial Payment (Deposit)</option>
                </select>
              </label>

              <label className="crm-field">
                <span className="crm-label">Remaining balance</span>
                <input className="crm-input" type="number" step="any" value={form.remainingAmount} onChange={set("remainingAmount")} />
              </label>

              <label className="crm-field">
                <span className="crm-label">Currency</span>
                <select className="crm-input crm-select" value={form.currency} onChange={set("currency")}>
                  {options.currencies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="crm-field">
                <span className="crm-label">Method *</span>
                <input className="crm-input" value={form.method} onChange={set("method")} required placeholder="PayPal, Wire, etc." />
                {err("method")}
              </label>

              <label className="crm-field">
                <span className="crm-label">Status</span>
                <select className="crm-input crm-select" value={form.status} onChange={set("status")}>
                  {options.statuses.map((s) => (
                    <option key={s} value={s}>
                      {PAYMENT_STATUS_LABEL[s] || s}
                    </option>
                  ))}
                </select>
              </label>

              <label className="crm-field">
                <span className="crm-label">Date paid</span>
                <input className="crm-input" type="date" value={form.paidAt} onChange={set("paidAt")} />
              </label>

              <label className="crm-field">
                <span className="crm-label">Invoice number</span>
                <input className="crm-input" value={form.invoiceNumber} onChange={set("invoiceNumber")} placeholder="QS-2026-000127" />
              </label>

              <label className="crm-field">
                <span className="crm-label">Reference / Transaction ID</span>
                <input className="crm-input" value={form.reference} onChange={set("reference")} />
              </label>

              <label className="crm-field" style={{ gridColumn: "1 / -1" }}>
                <span className="crm-label">Notes</span>
                <textarea className="crm-textarea" value={form.notes} onChange={set("notes")} rows={2} />
              </label>
            </div>

            {error && (
              <p className="crm-alert crm-alert-inset" role="alert">
                {error}
              </p>
            )}

            <div className="crm-drawer-foot">
              {editing !== "new" && (
                <button type="button" className="crm-act crm-act-danger" onClick={remove} disabled={busy}>
                  Delete
                </button>
              )}
              <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
                <button type="button" className="crm-act crm-act-ghost" onClick={close} disabled={busy}>
                  Cancel
                </button>
                <button type="submit" className="crm-act crm-act-dark" disabled={busy}>
                  {busy ? "Saving…" : editing === "new" ? "Save payment" : "Save changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

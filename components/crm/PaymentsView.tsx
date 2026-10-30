"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PaymentRow } from "@/lib/crm/data";
import { PAYMENT_STATUS_LABEL, money } from "@/lib/crm/format";

const fmtDate = (d: string | null) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const today = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
};

type Options = { services: readonly string[]; methods: readonly string[]; currencies: readonly string[]; statuses: readonly string[] };

type FormState = {
  clientName: string;
  clientEmail: string;
  companyName: string;
  service: string;
  description: string;
  amount: string;
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
  companyName: "",
  service: "",
  description: "",
  amount: "",
  currency: "USD",
  method: "",
  status: "paid",
  paidAt: today(),
  invoiceNumber: "",
  reference: "",
  notes: "",
});

const fromRow = (p: PaymentRow): FormState => ({
  clientName: p.clientName,
  clientEmail: p.clientEmail || "",
  companyName: p.companyName || "",
  service: p.service,
  description: p.description || "",
  amount: String(p.amount),
  currency: p.currency,
  method: p.method,
  status: p.status,
  paidAt: p.paidAt || "",
  invoiceNumber: p.invoiceNumber || "",
  reference: p.reference || "",
  notes: p.notes || "",
});

export default function PaymentsView({ rows, options, canDelete, openNew }: { rows: PaymentRow[]; options: Options; canDelete: boolean; openNew: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<PaymentRow | "new" | null>(openNew ? "new" : null);
  const [form, setForm] = useState<FormState>(blank());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const openForm = (p: PaymentRow | "new") => {
    setForm(p === "new" ? blank() : fromRow(p));
    setErrors({});
    setError("");
    setEditing(p);
  };
  const close = () => setEditing(null);
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
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
    router.refresh();
  };

  const remove = async () => {
    if (editing === "new" || !editing) return;
    if (!window.confirm(`Delete this payment from ${editing.clientName}? This can't be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/crm/payments/${editing.id}`, { method: "DELETE" }).catch(() => null);
    setBusy(false);
    // 404 = someone already deleted it, so it's gone either way
    if (!res?.ok && res?.status !== 404) return setError("Couldn't delete the payment. Please try again.");
    close();
    router.refresh();
  };

  const err = (k: string) => (errors[k] ? <span className="crm-field-error">{errors[k]}</span> : null);

  return (
    <>
      <div className="crm-toolbar-end">
        <button type="button" className="crm-act crm-act-dark" onClick={() => openForm("new")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add payment
        </button>
      </div>

      {rows.length ? (
        <div className="crm-table-wrap">
          <table className="crm-table crm-stack">
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th className="crm-right">Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Invoice / Ref</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="crm-row" onClick={() => openForm(p)}>
                  <td data-label="Client">
                    <span className="crm-strong">{p.clientName}</span>
                    {(p.companyName || p.clientEmail) && <span className="crm-cell-sub">{p.companyName || p.clientEmail}</span>}
                  </td>
                  <td data-label="Service">
                    {p.service}
                    {p.description && <span className="crm-cell-sub">{p.description}</span>}
                  </td>
                  <td data-label="Amount" className="crm-right crm-strong crm-nowrap">{money(p.amount, p.currency)}</td>
                  <td data-label="Method">
                    {p.method}
                    <span className="crm-cell-sub">{p.source === "manual" ? "Manual entry" : "Online"}</span>
                  </td>
                  <td data-label="Date" className="crm-nowrap">{fmtDate(p.paidAt)}</td>
                  <td data-label="Invoice / Ref">
                    {p.invoiceNumber || <span className="crm-muted">—</span>}
                    {p.reference && <span className="crm-cell-sub">{p.reference}</span>}
                  </td>
                  <td data-label="Status">
                    <span className={`crm-pill crm-pill-${p.status}`}>{PAYMENT_STATUS_LABEL[p.status] || p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="crm-empty">
          <p className="crm-empty-title">No payments yet</p>
          <p className="crm-muted">Use “Add payment” to record a payment you received.</p>
        </div>
      )}

      {editing && (
        <div className="crm-modal-wrap" onClick={close}>
          <form className="crm-modal" onClick={(e) => e.stopPropagation()} onSubmit={save} noValidate role="dialog" aria-label={editing === "new" ? "Add payment" : "Edit payment"}>
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
                <span className="crm-label">Company</span>
                <input className="crm-input" value={form.companyName} onChange={set("companyName")} />
              </label>
              <label className="crm-field">
                <span className="crm-label">Service *</span>
                <select className="crm-input crm-select" value={form.service} onChange={set("service")} required>
                  <option value="">Select service</option>
                  {options.services.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {err("service")}
              </label>
              <label className="crm-field crm-span-2">
                <span className="crm-label">Description</span>
                <input className="crm-input" value={form.description} onChange={set("description")} placeholder="e.g. October retainer, setup fee, milestone 1" />
              </label>
              <label className="crm-field">
                <span className="crm-label">Amount *</span>
                <input className="crm-input" inputMode="decimal" value={form.amount} onChange={set("amount")} placeholder="0.00" required />
                {err("amount")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Currency *</span>
                <select className="crm-input crm-select" value={form.currency} onChange={set("currency")}>
                  {options.currencies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {err("currency")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Payment method *</span>
                <select className="crm-input crm-select" value={form.method} onChange={set("method")} required>
                  <option value="">Select method</option>
                  {options.methods.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {err("method")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Status *</span>
                <select className="crm-input crm-select" value={form.status} onChange={set("status")}>
                  {options.statuses.map((s) => (
                    <option key={s} value={s}>
                      {PAYMENT_STATUS_LABEL[s] || s}
                    </option>
                  ))}
                </select>
                {err("status")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Payment date{form.status === "paid" || form.status === "partially_paid" ? " *" : ""}</span>
                <input className="crm-input" type="date" value={form.paidAt} onChange={set("paidAt")} />
                {err("paidAt")}
              </label>
              <label className="crm-field">
                <span className="crm-label">Invoice number</span>
                <input className="crm-input" value={form.invoiceNumber} onChange={set("invoiceNumber")} />
              </label>
              <label className="crm-field crm-span-2">
                <span className="crm-label">Transaction / reference ID</span>
                <input className="crm-input" value={form.reference} onChange={set("reference")} />
              </label>
              <label className="crm-field crm-span-2">
                <span className="crm-label">Notes</span>
                <textarea className="crm-input crm-textarea" rows={3} value={form.notes} onChange={set("notes")} />
              </label>
            </div>

            {error && (
              <p className="crm-alert" role="alert">
                {error}
              </p>
            )}

            <div className="crm-modal-foot">
              {editing !== "new" && canDelete ? (
                <button type="button" className="crm-act crm-act-danger" onClick={remove} disabled={busy}>
                  Delete
                </button>
              ) : (
                <span />
              )}
              <span className="crm-modal-foot-end">
                <button type="button" className="crm-act crm-act-ghost" onClick={close}>
                  Cancel
                </button>
                <button type="submit" className="crm-act crm-act-dark" disabled={busy}>
                  {busy ? "Saving…" : editing === "new" ? "Save payment" : "Save changes"}
                </button>
              </span>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

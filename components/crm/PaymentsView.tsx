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

export const PAYMENT_LINK_SERVICES = [
  "AI UGC Video",
  "AI Avatar Video",
  "AI Explainer Video",
  "AI Commercial Video",
  "AI-Powered Digital Marketing Services",
  "AI & Automation Solutions",
  "Information Technology Services",
  "Custom Web Development",
  "Staff Augmentation",
  "YouTube Video Promotion",
  "General Consultation / Custom Scope",
] as const;

export const PAYMENT_LINK_QUANTITIES = [
  "Single Reel",
  "1 Video",
  "3 Videos Package",
  "5 Videos Package",
  "10 Videos Package",
  "Monthly Retainer",
  "Starter Scope",
  "Growth Scope",
  "Custom Scope",
] as const;

function getInitialBillingDates() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const due = new Date(lastDay);
  due.setDate(due.getDate() - 10);
  return {
    start: fmt(firstDay),
    end: fmt(lastDay),
    due: fmt(due),
  };
}

export default function PaymentsView({
  rows,
  options,
  openNew,
  userRole = "admin",
  q = "",
  status = "",
  currentTab = "all",
  counts,
  total = 0,
  page = 1,
  pages = 1,
  pageSize = 20,
}: {
  rows: PaymentRow[];
  options: Options;
  openNew: boolean;
  userRole?: "super_admin" | "admin";
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
  const [modalSubtab, setModalSubtab] = useState<"orders" | "payments">("orders");

  // Generate Payment Link State
  const initialDates = getInitialBillingDates();
  const [generatingLink, setGeneratingLink] = useState(false);
  const [createdLink, setCreatedLink] = useState<{ url: string; token: string; orderNumber: string; clientName?: string; clientPhone?: string; service?: string; quantity?: string; totalAmount?: number; paymentOption?: string } | null>(null);
  const [linkForm, setLinkForm] = useState({
    leadSource: "Manual",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    companyName: "",
    service: "AI UGC Video",
    quantity: "Single Reel",
    totalAmount: "",
    paymentOption: "full" as "full" | "partial",
    depositAmount: "",
    billingStartDate: initialDates.start,
    billingEndDate: initialDates.end,
    balanceDueDate: initialDates.due,
    notes: "",
  });

  // Edit Payment Link State
  const [editingLink, setEditingLink] = useState<PaymentRow | null>(null);
  const [editLinkForm, setEditLinkForm] = useState({
    id: 0,
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    companyName: "",
    service: "AI UGC Video",
    quantity: "Single Reel",
    totalAmount: "",
    paymentOption: "full" as "full" | "partial",
    billingStartDate: "",
    billingEndDate: "",
    balanceDueDate: "",
    linkStatus: "active",
    notes: "",
  });

  const [form, setForm] = useState<FormState>(blank());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const sel = useSelection(rows.map((p) => p.id));

  // Toggle tab: Clicking active tab toggles back to default "all"
  const handleTabChange = (t: "website" | "payment_link") => {
    const params = new URLSearchParams(window.location.search);
    if (currentTab === t) {
      params.set("tab", "all");
    } else {
      params.set("tab", t);
    }
    params.set("page", "1");
    router.push(`/crm/payments?${params.toString()}`);
  };

  const copyLink = (tokenOrUrl: string) => {
    const fullUrl = tokenOrUrl.startsWith("http") ? tokenOrUrl : `${window.location.origin}/pay/${tokenOrUrl}`;
    navigator.clipboard.writeText(fullUrl);
    toast("Payment link copied to clipboard!");
  };

  const getWhatsAppMessage = (p: {
    clientName: string;
    clientPhone?: string | null;
    service: string;
    quantity?: string | null;
    category?: string | null;
    amount?: number | null;
    totalAmount?: number | null;
    remainingAmount?: number | null;
    paymentType?: string | null;
    status?: string | null;
    token?: string | null;
    invoiceNumber?: string | null;
    id?: number | null;
    balanceDueDate?: string | null;
    billingEndDate?: string | null;
  }) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://quickuppsoftech.us";
    const payUrl = p.token ? `${origin}/pay/${p.token}` : `${origin}/pay`;
    const tot = Number(p.totalAmount || p.amount || 0);
    const isPartial = p.paymentType === "partial" || (p.remainingAmount != null && p.remainingAmount > 0);
    const deposit = Number(p.amount || 0);
    const remaining = Number(p.remainingAmount != null ? p.remainingAmount : (tot - deposit));

    if (p.status === "partially_paid" && remaining > 0) {
      // Balance notice message
      return `Hello ${p.clientName},

This is a courtesy reminder regarding your outstanding balance for ${p.service} (${p.quantity || p.category || "Deliverables"}) with Quickupp Softech LLC.

• Order / Invoice: ${p.invoiceNumber || (p.id ? `QS-${p.id}` : "")}
• Total Engagement: $${tot.toFixed(2)} USD
• Amount Paid: $${deposit.toFixed(2)} USD
• Remaining Balance Due: $${remaining.toFixed(2)} USD
• Balance Due Date: ${p.balanceDueDate || (p.billingEndDate ? p.billingEndDate.slice(0, 10) : "Due Shortly")}

Please complete your balance payment securely via PayPal or Debit/Credit Card using the link below:
👉 ${payUrl}

If you have any questions, feel free to reply directly or contact us at info@quickuppsoftech.us.

Website: https://quickuppsoftech.us/
Email: info@quickuppsoftech.us

Best regards,
Quickupp Softech LLC`;
    }

    // Initial Payment link message (CRITICAL: 24h expiration is NOT conveyed to client)
    const partialLines = isPartial
      ? `• Initial Deposit Due: $${(tot * 0.5).toFixed(2)} USD (50% Deposit)\n• Remaining Balance: $${(tot * 0.5).toFixed(2)} USD`
      : "";

    return `Hello ${p.clientName},

Thank you for choosing Quickupp Softech LLC!

Here are your custom engagement details:
• Service: ${p.service}
• Scope / Package: ${p.quantity || p.category || "Deliverables"}
• Total Amount: $${tot.toFixed(2)} USD
${partialLines ? `${partialLines}\n` : ""}
Please complete your secure payment via PayPal or Debit/Credit Card using the link below:
👉 ${payUrl}

If you have any questions or need custom assistance, feel free to reply directly or contact us at info@quickuppsoftech.us.

Website: https://quickuppsoftech.us/
Email: info@quickuppsoftech.us

Best regards,
Quickupp Softech LLC`;
  };

  const openWhatsApp = (p: {
    clientName: string;
    clientPhone?: string | null;
    service: string;
    quantity?: string | null;
    category?: string | null;
    amount?: number | null;
    totalAmount?: number | null;
    remainingAmount?: number | null;
    paymentType?: string | null;
    status?: string | null;
    token?: string | null;
    invoiceNumber?: string | null;
    id?: number | null;
    balanceDueDate?: string | null;
    billingEndDate?: string | null;
  }) => {
    const msg = getWhatsAppMessage(p);
    const cleanPhone = (p.clientPhone || "").replace(/[^0-9+]/g, "");
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const cancelLink = async (p: PaymentRow) => {
    if (
      !(await confirm({
        title: "Cancel this payment link?",
        message: "The link will immediately be deactivated and cannot be paid by the customer.",
      }))
    )
      return;
    setBusy(true);
    const res = await fetch("/api/crm/payment-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel", id: p.id }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) {
      toast("Couldn't cancel payment link. Please try again.");
      return;
    }
    toast("Payment link cancelled");
    router.refresh();
  };

  const openEditLink = (p: PaymentRow) => {
    setError("");
    setEditingLink(p);
    setEditLinkForm({
      id: p.id,
      clientName: p.clientName,
      clientPhone: p.clientPhone || "",
      clientEmail: p.clientEmail || "",
      companyName: p.companyName || "",
      service: p.service,
      quantity: p.quantity || "Single Reel",
      totalAmount: String(p.totalAmount || p.amount || ""),
      paymentOption: (p.paymentType as "full" | "partial") || "full",
      billingStartDate: p.billingStartDate || "",
      billingEndDate: p.billingEndDate || "",
      balanceDueDate: p.balanceDueDate || "",
      linkStatus: p.linkStatus || "active",
      notes: p.notes || "",
    });
  };

  const saveEditLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/crm/payment-links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editLinkForm),
    }).catch(() => null);
    setBusy(false);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok || !json.ok) {
      setError(json.error || "Failed to update payment link.");
      return;
    }
    setEditingLink(null);
    toast("Payment link updated!");
    router.refresh();
  };

  const sendBalanceReminder = async (p: PaymentRow) => {
    if (
      !(await confirm({
        title: "Send balance reminder email?",
        message: `An official balance reminder email with direct payment link will be sent to ${p.clientEmail}.`,
      }))
    )
      return;
    setBusy(true);
    const res = await fetch("/api/crm/payments/send-balance-reminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id }),
    }).catch(() => null);
    setBusy(false);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok || !json.ok) {
      toast(json.error || "Couldn't send balance reminder. Please try again.");
      return;
    }
    toast("Balance reminder email sent!");
    router.refresh();
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

  const savePaymentLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/crm/payment-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(linkForm),
    }).catch(() => null);
    setBusy(false);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok || !json.ok) {
      setError(json.error || "Failed to generate payment link.");
      return;
    }
    setGeneratingLink(false);
    setCreatedLink({
      url: `${window.location.origin}${json.url}`,
      token: json.token,
      orderNumber: json.orderNumber,
      clientName: linkForm.clientName,
      clientPhone: linkForm.clientPhone,
      service: linkForm.service,
      quantity: linkForm.quantity,
      totalAmount: Number(linkForm.totalAmount) || 0,
      paymentOption: linkForm.paymentOption,
    });
    toast("Payment link generated!");
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

  const headerActions = (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {currentTab !== "website" && (
        <button
          type="button"
          className="crm-act crm-act-purple"
          onClick={() => {
            setError("");
            setGeneratingLink(true);
          }}
          title="Generate client payment link"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          + Generate Payment Link
        </button>
      )}

      {currentTab !== "website" && currentTab !== "payment_link" && (
        <button type="button" className="crm-act crm-act-dark" onClick={() => openForm("new")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add payment
        </button>
      )}
    </div>
  );

  const err = (k: string) => (errors[k] ? <span className="crm-field-error">{errors[k]}</span> : null);

  return (
    <>
      <PageHead title="Payments" sub="Track customer payments, invoices, balance dues, and official receipts.">
        {headerActions}
      </PageHead>

      {/* Tabs: ONLY Website and Payment Link (All Payments button hidden by user request, default view displays All Payments) */}
      <div className="crm-payments-tabs">
        <button
          type="button"
          className={`crm-payments-tab ${currentTab === "website" ? "is-active" : ""}`}
          onClick={() => handleTabChange("website")}
          title="Filter to website checkout payments"
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
          title="Filter to admin-generated payment links"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span>Payment Link</span>
          <span className="crm-tab-badge">{counts?.paymentLink ?? 0}</span>
        </button>
      </div>

      {/* Payment Link Subheader (Screenshot 2) */}
      {currentTab === "payment_link" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff", padding: "14px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", margin: "10px 0 14px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "22px" }}>🔗</span>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>Payment Links</div>
                <span className="crm-tab-badge" style={{ background: "#f3e8ff", color: "#7c3aed", fontWeight: 700 }}>
                  {counts?.paymentLink ?? 0} links
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                Customer payment links generated by Admins and Super Admin · valid 24 hours · single use
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              className="crm-act crm-act-ghost"
              onClick={() => router.refresh()}
              style={{ fontSize: "13px" }}
            >
              🔄 Refresh
            </button>
            <button
              type="button"
              className="crm-act crm-act-purple"
              onClick={() => {
                setError("");
                setGeneratingLink(true);
              }}
              style={{ fontSize: "13px" }}
            >
              + Generate Payment Link
            </button>
          </div>
        </div>
      )}

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
              {currentTab === "payment_link" ? (
                /* Payment Link Specialized Table Header (Matching Screenshot 2) */
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
                    <th>CUSTOMER &amp; LEAD</th>
                    <th>VIDEO / TOTAL</th>
                    <th>PAYMENT</th>
                    <th>LINK STATUS</th>
                    <th>GENERATED · EXPIRES</th>
                    <th style={{ textAlign: "right", paddingRight: "18px" }}>Actions</th>
                  </tr>
                </thead>
              ) : (
                /* Unified Table Header (Website & All Payments) */
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
              )}

              <tbody>
                {rows.map((p, idx) => {
                  const srNo = (page - 1) * pageSize + idx + 1;
                  const isPartial = p.paymentType === "partial";
                  const totAmt = p.totalAmount != null ? p.totalAmount : p.amount;
                  const remAmt = p.remainingAmount != null ? p.remainingAmount : Math.max(0, totAmt - p.amount);

                  // Link status check
                  const isLinkExpired = p.expiresAt && new Date(p.expiresAt) < new Date() && p.status !== "paid";
                  const linkStatusBadge =
                    p.status === "paid"
                      ? "used"
                      : isLinkExpired
                      ? "expired"
                      : p.linkStatus || "active";

                  if (currentTab === "payment_link") {
                    /* Row Format for Payment Link Tab (Screenshot 2) */
                    return (
                      <tr
                        key={p.id}
                        className={`crm-row${sel.has(p.id) ? " is-picked" : ""}`}
                        onClick={() => {
                          setViewing(p);
                          setModalSubtab("orders");
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <td className="crm-col-check" onClick={(e) => e.stopPropagation()}>
                          <SelectBox
                            checked={sel.has(p.id)}
                            onChange={(on) => sel.toggle(p.id, on)}
                            label={`Select payment link for ${p.clientName}`}
                          />
                        </td>

                        {/* Customer & Lead */}
                        <td data-label="Customer & Lead" className="crm-cell-main">
                          <span className="crm-strong" style={{ fontSize: "14px", color: "#0f172a" }}>
                            {p.clientName}
                          </span>
                          <span className="crm-cell-sub" style={{ color: "#475569", fontWeight: 500 }}>
                            {p.clientPhone || "—"}
                          </span>
                          <span className="crm-cell-sub" style={{ color: "#2563eb" }}>
                            {p.clientEmail || "—"}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                            <span
                              style={{
                                fontSize: "10.5px",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                background: "#f1f5f9",
                                color: "#475569",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              {p.leadSource || "MANUAL"}
                            </span>
                            <span style={{ fontSize: "11px", color: "#7c3aed", fontFamily: "monospace", fontWeight: 700 }}>
                              {p.invoiceNumber || `QAS-${p.id}`}
                            </span>
                          </div>
                        </td>

                        {/* Video / Total */}
                        <td data-label="Video / Total">
                          <span className="crm-strong" style={{ color: "#0f172a", fontSize: "13.5px" }}>
                            {p.service}
                          </span>
                          <span style={{ display: "block", fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                            {p.quantity || p.category || "Single Reel"}
                          </span>
                          <span style={{ display: "block", fontSize: "14px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                            ${totAmt.toFixed(2)}
                          </span>
                        </td>

                        {/* Payment */}
                        <td data-label="Payment">
                          {Number(p.amount) === 0 ? (
                            <span style={{ color: "#64748b", fontWeight: 700, fontSize: "13px" }}>Not Paid</span>
                          ) : p.status === "failed" ? (
                            <div>
                              <span className="crm-pill crm-pill-failed" style={{ marginBottom: "2px", display: "inline-block" }}>
                                Payment Failed
                              </span>
                              <span style={{ display: "block", fontSize: "12px", color: "#dc2626", fontWeight: 700 }}>
                                Failed
                              </span>
                            </div>
                          ) : p.status === "paid" ? (
                            <div>
                              <span className="crm-pill crm-pill-paid" style={{ marginBottom: "2px", display: "inline-block" }}>
                                Fully Paid
                              </span>
                              <span style={{ display: "block", fontSize: "12px", color: "#16a34a", fontWeight: 700 }}>
                                Paid ${p.amount.toFixed(2)}
                              </span>
                            </div>
                          ) : p.status === "partially_paid" || (isPartial && Number(p.amount) > 0 && remAmt > 0) ? (
                            <div>
                              <span className="crm-pill crm-pill-partially_paid" style={{ marginBottom: "2px", display: "inline-block" }}>
                                Partially Paid
                              </span>
                              <span style={{ display: "block", fontSize: "12px", color: "#2563eb", fontWeight: 700 }}>
                                Paid ${p.amount.toFixed(2)} · Due ${remAmt.toFixed(2)}
                              </span>
                            </div>
                          ) : p.status === "pending" && Number(p.amount) > 0 ? (
                            <div>
                              <span className="crm-pill crm-pill-pending" style={{ marginBottom: "2px", display: "inline-block" }}>
                                Pending Clearing
                              </span>
                              <span style={{ display: "block", fontSize: "12px", color: "#d97706", fontWeight: 700 }}>
                                ${p.amount.toFixed(2)} clearing
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: "#64748b", fontWeight: 700, fontSize: "13px" }}>Not Paid</span>
                          )}
                        </td>

                        {/* Link Status */}
                        <td data-label="Link Status">
                          <span
                            className={`crm-link-pill crm-link-pill-${linkStatusBadge}`}
                            style={{ textTransform: "capitalize" }}
                          >
                            {linkStatusBadge}
                          </span>
                          {p.paidAt && p.status === "paid" && (
                            <span style={{ display: "block", fontSize: "11px", color: "#64748b", marginTop: "3px" }}>
                              Paid {fmtDate(p.paidAt, true)}
                            </span>
                          )}
                        </td>

                        {/* Generated · Expires */}
                        <td data-label="Generated · Expires" style={{ fontSize: "12.5px" }}>
                          <span style={{ fontWeight: 700, color: "#0f172a", display: "block" }}>
                            {p.createdBy || "Super Admin"}
                          </span>
                          <span style={{ color: "#64748b", display: "block", fontSize: "11.5px" }}>
                            {fmtDate(p.createdAt, true)}
                          </span>
                          {p.status === "partially_paid" ? (
                            <span style={{ color: "#7c3aed", display: "block", fontSize: "11px", marginTop: "2px", fontWeight: 700 }}>
                              Balance Due {p.balanceDueDate || (p.billingEndDate ? p.billingEndDate.slice(0, 10) : "Pending")}
                            </span>
                          ) : p.expiresAt ? (
                            <span style={{ color: isLinkExpired ? "#dc2626" : "#64748b", display: "block", fontSize: "11px", marginTop: "2px" }}>
                              Expires {fmtDate(p.expiresAt, true)}
                            </span>
                          ) : null}
                        </td>

                        {/* Actions matching screenshot media_1793689282840.png */}
                        <td data-label="Actions" onClick={(e) => e.stopPropagation()} style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "nowrap" }}>
                            {/* Copy Link */}
                            <button
                              type="button"
                              className="crm-act crm-act-ghost crm-act-sm"
                              style={{
                                fontSize: "12px",
                                padding: "4px 10px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                background: "#f8fafc",
                                border: "1px solid #cbd5e1",
                                color: "#0f172a",
                                fontWeight: 600,
                              }}
                              onClick={() => copyLink(p.token || String(p.id))}
                              title="Copy Payment Link"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                              Copy Link
                            </button>

                            {/* WhatsApp (Green Button) */}
                            <button
                              type="button"
                              className="crm-act crm-act-sm"
                              style={{
                                fontSize: "12px",
                                padding: "4px 12px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                background: "#10b981",
                                color: "#ffffff",
                                border: "none",
                                fontWeight: 700,
                                borderRadius: "8px",
                              }}
                              onClick={() => openWhatsApp(p)}
                              title="Share on WhatsApp"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.52 3.48A11.93 11.93 0 0 0 12.06 0C5.46 0 .09 5.37.09 11.97c0 2.11.55 4.17 1.6 6L0 24l6.19-1.62a11.93 11.93 0 0 0 5.87 1.51h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.2-1.25-6.21-3.52-8.44zm-8.46 18.36h-.01a9.92 9.92 0 0 1-5.06-1.39l-.36-.22-3.76.99 1-3.66-.24-.38a9.93 9.93 0 0 1-1.52-5.21c0-5.5 4.47-9.97 9.97-9.97 2.66 0 5.16 1.04 7.05 2.92a9.92 9.92 0 0 1 2.92 7.05c0 5.5-4.48 9.97-9.99 9.97zm5.46-7.46c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.64-.93-2.25-.24-.59-.49-.51-.68-.52h-.58c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.51s1.08 2.91 1.23 3.11c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.13-.27-.2-.57-.35z" />
                              </svg>
                              WhatsApp
                            </button>

                            {/* Details */}
                            <button
                              type="button"
                              className="crm-act crm-act-ghost crm-act-sm"
                              style={{ fontSize: "12px", padding: "4px 10px" }}
                              onClick={() => {
                                setViewing(p);
                                setModalSubtab("orders");
                              }}
                            >
                              Details
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              className="crm-act crm-act-ghost crm-act-sm"
                              style={{ fontSize: "12px", padding: "4px 9px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                              onClick={() => openEditLink(p)}
                              title="Edit Payment Link"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                              </svg>
                              Edit
                            </button>

                            {/* Cancel */}
                            {p.linkStatus !== "cancelled" && p.status !== "paid" && (
                              <button
                                type="button"
                                className="crm-act crm-act-ghost crm-act-sm"
                                style={{ fontSize: "12px", padding: "4px 9px", display: "inline-flex", alignItems: "center", gap: "4px", color: "#64748b" }}
                                onClick={() => cancelLink(p)}
                                title="Cancel Link"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                </svg>
                                Cancel
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              type="button"
                              className="crm-act crm-act-ghost crm-act-sm"
                              style={{ fontSize: "12px", padding: "4px 8px", color: "#ef4444" }}
                              onClick={() => deleteSingle(p)}
                              title="Delete Link"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </button>

                            {/* If partially paid: Send Balance Reminder Email */}
                            {p.status === "partially_paid" && (
                              <button
                                type="button"
                                className="crm-act crm-act-sm"
                                style={{
                                  fontSize: "11px",
                                  padding: "4px 8px",
                                  background: "#faf5ff",
                                  color: "#7c3aed",
                                  border: "1px solid #d8b4fe",
                                  fontWeight: 700,
                                  borderRadius: "6px",
                                }}
                                onClick={() => sendBalanceReminder(p)}
                                title="Send Balance Reminder Email"
                              >
                                📧 Balance
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  /* Unified Table Row Format (Website & All Payments) */
                  return (
                    <tr
                      key={p.id}
                      className={`crm-row${sel.has(p.id) ? " is-picked" : ""}`}
                      onClick={() => {
                        setViewing(p);
                        setModalSubtab("orders");
                      }}
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
                          {p.clientEmail && <span style={{ color: "#2563eb" }}>✉ {p.clientEmail}</span>}
                          {p.clientPhone && <span style={{ color: "#0f172a", fontWeight: 500 }}>📞 {p.clientPhone}</span>}
                        </span>
                      </td>

                      {/* Service & Category */}
                      <td data-label="Service">
                        <span className="crm-strong" style={{ color: "#0f172a", fontSize: "13.5px" }}>
                          {p.service}
                        </span>
                        {(p.quantity || p.category) && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                            <span
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
                              }}
                            >
                              {p.quantity || p.category}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Amount & Status */}
                      <td data-label="Amount" className="crm-nowrap">
                        {p.status === "failed" ? (
                          <>
                            <span className="crm-pill crm-pill-failed" style={{ marginBottom: "4px", display: "inline-block" }}>
                              Payment Failed
                            </span>
                            <span style={{ display: "block", fontSize: "12px", color: "#dc2626", fontWeight: 600 }}>
                              {money(p.amount || totAmt, p.currency)} attempted
                            </span>
                          </>
                        ) : Number(p.amount) === 0 ? (
                          <>
                            <span
                              className="crm-pill"
                              style={{
                                marginBottom: "4px",
                                display: "inline-block",
                                background: "#f1f5f9",
                                color: "#475569",
                                border: "1px solid #cbd5e1",
                                fontWeight: 700,
                              }}
                            >
                              Not Paid
                            </span>
                            <span style={{ display: "block", fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                              $0.00 received · {money(totAmt, p.currency)} due
                            </span>
                          </>
                        ) : p.status === "paid" ? (
                          <>
                            <span className="crm-pill crm-pill-paid" style={{ marginBottom: "4px", display: "inline-block" }}>
                              Fully Paid
                            </span>
                            <span style={{ display: "block", fontSize: "12px", color: "#15803d", fontWeight: 600 }}>
                              {money(p.amount, p.currency)} received
                            </span>
                          </>
                        ) : p.status === "partially_paid" || (isPartial && Number(p.amount) > 0 && remAmt > 0) ? (
                          <>
                            <span className="crm-pill crm-pill-partially_paid" style={{ marginBottom: "4px", display: "inline-block" }}>
                              Partially Paid
                            </span>
                            <span style={{ display: "block", fontSize: "12px", color: "#2563eb", fontWeight: 600 }}>
                              {money(p.amount, p.currency)} received · {money(remAmt, p.currency)} due
                            </span>
                          </>
                        ) : p.status === "pending" && Number(p.amount) > 0 ? (
                          <>
                            <span className="crm-pill crm-pill-pending" style={{ marginBottom: "4px", display: "inline-block" }}>
                              Pending Clearing
                            </span>
                            <span style={{ display: "block", fontSize: "12px", color: "#d97706", fontWeight: 600 }}>
                              {money(p.amount, p.currency)} in PayPal clearing
                            </span>
                          </>
                        ) : (
                          <>
                            <span
                              className="crm-pill"
                              style={{
                                marginBottom: "4px",
                                display: "inline-block",
                                background: "#f1f5f9",
                                color: "#475569",
                                border: "1px solid #cbd5e1",
                                fontWeight: 700,
                              }}
                            >
                              Not Paid
                            </span>
                            <span style={{ display: "block", fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                              $0.00 received · {money(totAmt, p.currency)} due
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

                      {/* Actions */}
                      <td data-label="Actions" onClick={(e) => e.stopPropagation()} style={{ textAlign: "right" }}>
                        <div className="crm-row-actions">
                          <button
                            type="button"
                            className="crm-action-btn is-view"
                            title="View Details"
                            onClick={() => {
                              setViewing(p);
                              setModalSubtab("orders");
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          {p.token && (
                            <button
                              type="button"
                              className="crm-action-btn is-edit"
                              title="Copy Payment Link"
                              onClick={() => copyLink(p.token!)}
                            >
                              📋
                            </button>
                          )}
                          <button
                            type="button"
                            className="crm-action-btn is-delete"
                            title="Delete Payment"
                            onClick={() => deleteSingle(p)}
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
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <p className="crm-empty-title">
              {currentTab === "website" ? "No website payments found" : currentTab === "payment_link" ? "No payment links found" : "No payments found"}
            </p>
            <p className="crm-empty-sub">
              {currentTab === "website"
                ? "Payments completed via the website Pay Now button will automatically appear here."
                : currentTab === "payment_link"
                ? "Generate your first customer payment link using the button below."
                : "All payments and links will appear here."}
            </p>
            {currentTab === "website" ? null : (
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button
                  type="button"
                  className="crm-act crm-act-purple"
                  onClick={() => {
                    setError("");
                    setGeneratingLink(true);
                  }}
                >
                  + Generate Payment Link
                </button>
                {currentTab !== "payment_link" && (
                  <button type="button" className="crm-act crm-act-dark" onClick={() => openForm("new")}>
                    Add payment
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        <Pager page={page} pages={pages} total={total} pageSize={pageSize} q={q} status={status} />
      </div>

      {/* ---- DETAILS MODAL (Matching Screenshot 4 & 5) ---- */}
      {viewing && (
        <div className="crm-modal-wrap" onClick={() => setViewing(null)}>
          <div className="crm-view-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "860px" }}>
            {/* Header */}
            <div className="crm-view-modal-head">
              <div>
                <div
                  className="crm-view-modal-title"
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#0f172a",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                    lineHeight: "1.4",
                  }}
                >
                  <span style={{ color: "#0f172a", fontWeight: 800 }}>{viewing.clientName}</span>
                  <span style={{ color: "#94a3b8" }}>•</span>
                  <span style={{ color: "#334155", fontWeight: 600 }}>{viewing.service}</span>
                  {viewing.quantity && (
                    <span
                      style={{
                        background: "#faf5ff",
                        color: "#7c3aed",
                        border: "1px solid #f3e8ff",
                        padding: "1px 7px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      {viewing.quantity}
                    </span>
                  )}
                  <span style={{ color: "#94a3b8" }}>•</span>
                  <span
                    style={{
                      background: "#f5f3ff",
                      color: "#6d28d9",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "13px",
                    }}
                  >
                    ${(viewing.totalAmount != null ? viewing.totalAmount : viewing.amount).toFixed(2)} USD
                  </span>
                </div>
                <p className="crm-view-modal-sub" style={{ fontSize: "12px", marginTop: "4px" }}>
                  Generated by {viewing.createdBy || "Admin"} on {fmtDate(viewing.createdAt, true)}
                  {viewing.expiresAt && ` · expires ${fmtDate(viewing.expiresAt, true)}`}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {viewing.token && (
                  <button
                    type="button"
                    className="crm-act crm-act-purple crm-act-sm"
                    onClick={() => copyLink(viewing.token!)}
                  >
                    📋 Copy Link
                  </button>
                )}
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

            {/* Modal Subtabs (Orders (1) vs Payments) */}
            <div style={{ padding: "16px 24px 0" }}>
              <div className="crm-modal-subtabs">
                <button
                  type="button"
                  className={`crm-modal-subtab ${modalSubtab === "orders" ? "is-active" : ""}`}
                  onClick={() => setModalSubtab("orders")}
                >
                  Orders (1)
                </button>
                <button
                  type="button"
                  className={`crm-modal-subtab ${modalSubtab === "payments" ? "is-active" : ""}`}
                  onClick={() => setModalSubtab("payments")}
                >
                  Payments ({viewing.amount > 0 ? 1 : 0})
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="crm-view-modal-body" style={{ paddingTop: "10px" }}>
              {modalSubtab === "orders" ? (
                /* Orders Subtab Table (Screenshot 4) */
                <div className="crm-table-wrap" style={{ border: "1px solid #e2e8f0", borderRadius: "10px" }}>
                  <table className="crm-table" style={{ fontSize: "12.5px" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        <th>ORDER</th>
                        <th>CUSTOMER</th>
                        <th>VIDEO</th>
                        <th>AMOUNT</th>
                        <th>PAYMENT STATUS</th>
                        <th>LINK</th>
                        <th style={{ textAlign: "right" }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <span style={{ fontWeight: 800, fontFamily: "monospace", color: "#0f172a" }}>
                            {viewing.invoiceNumber || `QAS-${viewing.id}`}
                          </span>
                          <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>
                            {fmtDate(viewing.createdAt, true)}
                          </span>
                          <span style={{ display: "block", fontSize: "10.5px", color: "#7c3aed", fontWeight: 700 }}>
                            Source: {viewing.leadSource || "Manual"}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: "#0f172a", display: "block" }}>
                            {viewing.clientName}
                          </span>
                          <span style={{ color: "#64748b", fontSize: "11.5px" }}>
                            {viewing.clientPhone || "—"}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: "#0f172a", display: "block" }}>
                            {viewing.service}
                          </span>
                          <span style={{ color: "#64748b", fontSize: "11.5px" }}>
                            Qty {viewing.quantity || "1"}
                          </span>
                        </td>
                        <td>
                          <span style={{ display: "block", fontWeight: 700, color: "#0f172a" }}>
                            Total ${(viewing.totalAmount != null ? viewing.totalAmount : viewing.amount).toFixed(2)}
                          </span>
                          <span style={{ display: "block", color: "#16a34a", fontSize: "11.5px", fontWeight: 600 }}>
                            Paid ${viewing.amount.toFixed(2)}
                          </span>
                          <span style={{ display: "block", color: "#ef4444", fontSize: "11.5px", fontWeight: 600 }}>
                            Remaining ${(viewing.remainingAmount != null ? viewing.remainingAmount : 0).toFixed(2)}
                          </span>
                        </td>
                        <td>
                          {Number(viewing.amount) === 0 ? (
                            <span style={{ color: "#64748b", fontWeight: 700 }}>Not Paid</span>
                          ) : viewing.status === "failed" ? (
                            <span className="crm-pill crm-pill-failed">Payment Failed</span>
                          ) : viewing.status === "paid" ? (
                            <span className="crm-pill crm-pill-paid">Fully Paid</span>
                          ) : viewing.status === "pending" && Number(viewing.amount) > 0 ? (
                            <span className="crm-pill crm-pill-pending">Pending Clearing</span>
                          ) : (
                            <span className="crm-pill crm-pill-partially_paid">Partially Paid</span>
                          )}
                        </td>
                        <td>
                          <span className={`crm-link-pill crm-link-pill-${viewing.status === "paid" ? "used" : viewing.linkStatus || "active"}`}>
                            {viewing.status === "paid" ? "Used" : viewing.linkStatus || "Active"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="crm-act crm-act-danger crm-act-sm"
                            onClick={() => deleteSingle(viewing)}
                            style={{ fontSize: "11.5px", padding: "3px 8px" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Payments Subtab Table (Screenshot 5) */
                viewing.amount > 0 ? (
                  <div className="crm-table-wrap" style={{ border: "1px solid #e2e8f0", borderRadius: "10px" }}>
                    <table className="crm-table" style={{ fontSize: "12.5px" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc" }}>
                          <th>TRANSACTION</th>
                          <th>TYPE</th>
                          <th>AMOUNT</th>
                          <th>PAID SO FAR</th>
                          <th>STATUS</th>
                          <th>DATE · PAYPAL REF</th>
                          <th>RECEIPT</th>
                          <th>OUTSTANDING</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <span style={{ fontWeight: 800, fontFamily: "monospace", color: "#0f172a" }}>
                              {viewing.reference ? viewing.reference.split("|")[0].replace("Initial:", "").trim() : `TX-${viewing.id}`}
                            </span>
                            <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>
                              Order {viewing.invoiceNumber || `QAS-${viewing.id}`}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: "#0f172a", display: "block" }}>
                              {viewing.paymentType === "partial" ? "Deposit payment" : "Full payment"}
                            </span>
                            <span style={{ color: "#64748b", fontSize: "11.5px" }}>
                              PayPal / Payment link
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: "#0f172a", display: "block" }}>
                              ${viewing.amount.toFixed(2)}
                            </span>
                            <span style={{ color: "#64748b", fontSize: "11.5px" }}>
                              of ${(viewing.totalAmount || viewing.amount).toFixed(2)}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: "#16a34a", display: "block" }}>
                              ${viewing.amount.toFixed(2)}
                            </span>
                            <span style={{ color: "#64748b", fontSize: "11.5px" }}>
                              Remaining ${(viewing.remainingAmount || 0).toFixed(2)}
                            </span>
                          </td>
                          <td>
                            <span className={`crm-pill crm-pill-${viewing.status === "paid" ? "paid" : "partially_paid"}`}>
                              {viewing.status === "paid" ? "Fully Paid" : "Partially Paid"}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: "#0f172a", display: "block" }}>
                              {fmtDate(viewing.paidAt, true)}
                            </span>
                            <span style={{ color: "#64748b", fontSize: "11px", fontFamily: "monospace", wordBreak: "break-all" }}>
                              {viewing.reference || viewing.paypalOrderId || "PayPal"}
                            </span>
                          </td>
                          <td>
                            <a
                              href={`/api/payments/receipt?order=${encodeURIComponent(viewing.invoiceNumber || String(viewing.id))}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}
                            >
                              📄 PDF
                            </a>
                            <span style={{ display: "block", fontSize: "10.5px", color: "#16a34a" }}>Email: sent</span>
                          </td>
                          <td style={{ fontWeight: 700, color: viewing.remainingAmount && viewing.remainingAmount > 0 ? "#dc2626" : "#64748b" }}>
                            {viewing.remainingAmount && viewing.remainingAmount > 0
                              ? `$${viewing.remainingAmount.toFixed(2)}`
                              : "—"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: "30px 20px", textAlign: "center", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <p style={{ margin: "0 0 10px", color: "#64748b", fontSize: "14px" }}>
                      No payments recorded yet for this order. Share the link with the client:
                    </p>
                    {viewing.token && (
                      <button
                        type="button"
                        className="crm-act crm-act-purple"
                        onClick={() => copyLink(viewing.token!)}
                      >
                        📋 Copy Payment Link
                      </button>
                    )}
                  </div>
                )
              )}

              {/* Actions in Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #e2e8f0", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {viewing.status === "partially_paid" && (
                    <>
                      <button
                        type="button"
                        className="crm-act crm-act-sm"
                        style={{ background: "#faf5ff", color: "#7c3aed", border: "1px solid #d8b4fe", fontWeight: 700 }}
                        onClick={() => sendBalanceReminder(viewing)}
                      >
                        📧 Send Balance Reminder Email
                      </button>
                      <button
                        type="button"
                        className="crm-act crm-act-sm"
                        style={{ background: "#10b981", color: "#ffffff", border: "none", fontWeight: 700 }}
                        onClick={() => openWhatsApp(viewing)}
                      >
                        WhatsApp Balance Notice
                      </button>
                    </>
                  )}
                  {viewing.token && (
                    <button
                      type="button"
                      className="crm-act crm-act-ghost crm-act-sm"
                      onClick={() => copyLink(viewing.token!)}
                    >
                      📋 Copy Link
                    </button>
                  )}
                </div>
                <button type="button" className="crm-act crm-act-dark" onClick={() => setViewing(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- GENERATE PAYMENT LINK MODAL (Screenshot 3) ---- */}
      {generatingLink && (
        <div className="crm-modal-wrap" onClick={() => setGeneratingLink(false)}>
          <div className="crm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "620px" }}>
            <div className="crm-drawer-head" style={{ padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "24px" }}>🔗</span>
                <div>
                  <div className="crm-drawer-title" style={{ fontSize: "16px", fontWeight: 800 }}>Generate Payment Link</div>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                    The customer pays this custom total through PayPal / Card. Valid for 24 hours, single use, no coupons.
                  </p>
                </div>
              </div>
              <button type="button" className="crm-icon-act" onClick={() => setGeneratingLink(false)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={savePaymentLink} style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Lead Source */}
                <div>
                  <label className="crm-label" style={{ marginBottom: "6px" }}>Lead source *</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {["Manual", "Meta (Facebook / Instagram)", "Direct Referral"].map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setLinkForm((f) => ({ ...f, leadSource: src }))}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: "8px",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                          border: `1.5px solid ${linkForm.leadSource === src ? "#7c3aed" : "#cbd5e1"}`,
                          background: linkForm.leadSource === src ? "#faf5ff" : "#ffffff",
                          color: linkForm.leadSource === src ? "#7c3aed" : "#475569",
                        }}
                      >
                        {src}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Mobile */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label className="crm-field">
                    <span className="crm-label">Customer full name *</span>
                    <input
                      className="crm-input"
                      value={linkForm.clientName}
                      onChange={(e) => setLinkForm((f) => ({ ...f, clientName: e.target.value }))}
                      placeholder="e.g. Michael Smith"
                      required
                    />
                  </label>

                  <label className="crm-field">
                    <span className="crm-label">Mobile number (WhatsApp) *</span>
                    <input
                      className="crm-input"
                      value={linkForm.clientPhone}
                      onChange={(e) => setLinkForm((f) => ({ ...f, clientPhone: e.target.value }))}
                      placeholder="+1 (555) 234-5678"
                      required
                    />
                  </label>
                </div>

                {/* Email & Company */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label className="crm-field">
                    <span className="crm-label">Email address *</span>
                    <input
                      className="crm-input"
                      type="email"
                      value={linkForm.clientEmail}
                      onChange={(e) => setLinkForm((f) => ({ ...f, clientEmail: e.target.value }))}
                      placeholder="customer@example.com"
                      required
                    />
                  </label>

                  <label className="crm-field">
                    <span className="crm-label">Company / brand name</span>
                    <input
                      className="crm-input"
                      value={linkForm.companyName}
                      onChange={(e) => setLinkForm((f) => ({ ...f, companyName: e.target.value }))}
                      placeholder="Optional — customer name is used if blank"
                    />
                  </label>
                </div>

                {/* Service & Quantity */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label className="crm-field">
                    <span className="crm-label">Video / Service type *</span>
                    <select
                      className="crm-input crm-select"
                      value={linkForm.service}
                      onChange={(e) => setLinkForm((f) => ({ ...f, service: e.target.value }))}
                    >
                      {PAYMENT_LINK_SERVICES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>

                  <label className="crm-field">
                    <span className="crm-label">Quantity / Scope *</span>
                    <select
                      className="crm-input crm-select"
                      value={linkForm.quantity}
                      onChange={(e) => setLinkForm((f) => ({ ...f, quantity: e.target.value }))}
                    >
                      {PAYMENT_LINK_QUANTITIES.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Amount ($ USD) */}
                <label className="crm-field">
                  <span className="crm-label">Custom total amount ($ USD) *</span>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: "#64748b" }}>
                      $
                    </span>
                    <input
                      className="crm-input"
                      type="number"
                      step="any"
                      min="1"
                      style={{ paddingLeft: "26px" }}
                      value={linkForm.totalAmount}
                      onChange={(e) => setLinkForm((f) => ({ ...f, totalAmount: e.target.value }))}
                      placeholder="e.g. 999.00"
                      required
                    />
                  </div>
                  <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                    The customer will pay in USD via PayPal or Card.
                  </span>
                </label>

                {/* Payment Option (Full vs 50% Deposit) */}
                <label className="crm-field">
                  <span className="crm-label">Payment option *</span>
                  <select
                    className="crm-input crm-select"
                    value={linkForm.paymentOption}
                    onChange={(e) => {
                      const opt = e.target.value as "full" | "partial";
                      setLinkForm((f) => ({ ...f, paymentOption: opt }));
                    }}
                  >
                    <option value="full">Full Payment (100% upfront)</option>
                    <option value="partial">Allow 50% Deposit / Partial Payment</option>
                  </select>
                </label>

                {/* Billing Coverage Dates */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label className="crm-field">
                    <span className="crm-label">Billing From *</span>
                    <input
                      type="date"
                      className="crm-input"
                      value={linkForm.billingStartDate}
                      onChange={(e) => setLinkForm((f) => ({ ...f, billingStartDate: e.target.value }))}
                      required
                    />
                  </label>
                  <label className="crm-field">
                    <span className="crm-label">Billing To *</span>
                    <input
                      type="date"
                      className="crm-input"
                      value={linkForm.billingEndDate}
                      onChange={(e) => {
                        const newEnd = e.target.value;
                        setLinkForm((f) => {
                          let due = f.balanceDueDate;
                          if (newEnd) {
                            const d = new Date(newEnd);
                            if (!isNaN(d.getTime())) {
                              d.setDate(d.getDate() - 10);
                              due = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                            }
                          }
                          return { ...f, billingEndDate: newEnd, balanceDueDate: due };
                        });
                      }}
                      required
                    />
                  </label>
                </div>

                {/* If Partial: Show Tentative Balance Due Date and Deposit Breakdown */}
                {linkForm.paymentOption === "partial" && (
                  <div style={{ background: "#faf5ff", border: "1.5px solid #d8b4fe", borderRadius: "10px", padding: "14px 16px" }}>
                    <label className="crm-field" style={{ marginBottom: "10px" }}>
                      <span className="crm-label" style={{ color: "#6b21a8", fontWeight: 700 }}>
                        Tentative Balance Due Date (10 days prior to period end) *
                      </span>
                      <input
                        type="date"
                        className="crm-input"
                        value={linkForm.balanceDueDate}
                        onChange={(e) => setLinkForm((f) => ({ ...f, balanceDueDate: e.target.value }))}
                        required
                      />
                    </label>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", color: "#6b21a8", fontWeight: 700, paddingTop: "8px", borderTop: "1px dashed #d8b4fe" }}>
                      <span>Due Today (50% Deposit): ${((Number(linkForm.totalAmount) || 0) * 0.5).toFixed(2)} USD</span>
                      <span>Remaining Balance: ${((Number(linkForm.totalAmount) || 0) * 0.5).toFixed(2)} USD</span>
                    </div>
                  </div>
                )}

                {/* Notes for Team */}
                <label className="crm-field">
                  <span className="crm-label">Notes for the team (not shown to customer)</span>
                  <textarea
                    className="crm-textarea"
                    rows={2}
                    value={linkForm.notes}
                    onChange={(e) => setLinkForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Internal reference, agreed deliverables, etc."
                  />
                </label>
              </div>

              {error && (
                <p className="crm-alert crm-alert-inset" style={{ marginTop: "12px" }}>
                  {error}
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button
                  type="button"
                  className="crm-act crm-act-ghost"
                  onClick={() => setGeneratingLink(false)}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="crm-act crm-act-purple"
                  disabled={busy}
                >
                  {busy ? "Generating…" : "Generate Payment Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- CREATED LINK SUCCESS MODAL ---- */}
      {createdLink && (
        <div className="crm-modal-wrap" onClick={() => setCreatedLink(null)}>
          <div className="crm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px", padding: "28px" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>🎉</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>
                Payment Link Generated!
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                Order <strong style={{ color: "#7c3aed" }}>#{createdLink.orderNumber}</strong> is ready. Share this link with the client:
              </p>
            </div>

            <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", wordBreak: "break-all", fontFamily: "monospace", fontSize: "13px", color: "#2563eb", marginBottom: "18px" }}>
              {createdLink.url}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="crm-act crm-act-purple"
                onClick={() => copyLink(createdLink.url)}
              >
                📋 Copy Link
              </button>
              <button
                type="button"
                className="crm-act"
                style={{ background: "#10b981", color: "#ffffff", fontWeight: 700, border: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                onClick={() =>
                  openWhatsApp({
                    clientName: createdLink.clientName || "Valued Client",
                    clientPhone: createdLink.clientPhone,
                    service: createdLink.service || "Services",
                    quantity: createdLink.quantity,
                    totalAmount: createdLink.totalAmount,
                    paymentType: createdLink.paymentOption,
                    token: createdLink.token,
                    invoiceNumber: createdLink.orderNumber,
                  })
                }
              >
                WhatsApp Share
              </button>
              <a
                href={createdLink.url}
                target="_blank"
                rel="noreferrer"
                className="crm-act crm-act-ghost"
              >
                🔗 Open Link
              </a>
              <button
                type="button"
                className="crm-act crm-act-dark"
                onClick={() => setCreatedLink(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- EDIT PAYMENT LINK MODAL ---- */}
      {editingLink && (
        <div className="crm-modal-wrap" onClick={() => setEditingLink(null)}>
          <div className="crm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "620px" }}>
            <div className="crm-drawer-head" style={{ padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "24px" }}>✏️</span>
                <div>
                  <div className="crm-drawer-title" style={{ fontSize: "16px", fontWeight: 800 }}>Edit Payment Link</div>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                    Order #{editingLink.invoiceNumber || `QS-${editingLink.id}`}
                  </p>
                </div>
              </div>
              <button type="button" className="crm-icon-act" onClick={() => setEditingLink(null)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={saveEditLink} style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label className="crm-field">
                    <span className="crm-label">Customer full name *</span>
                    <input
                      className="crm-input"
                      value={editLinkForm.clientName}
                      onChange={(e) => setEditLinkForm((f) => ({ ...f, clientName: e.target.value }))}
                      required
                    />
                  </label>
                  <label className="crm-field">
                    <span className="crm-label">Mobile number (WhatsApp) *</span>
                    <input
                      className="crm-input"
                      value={editLinkForm.clientPhone}
                      onChange={(e) => setEditLinkForm((f) => ({ ...f, clientPhone: e.target.value }))}
                      required
                    />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label className="crm-field">
                    <span className="crm-label">Email address *</span>
                    <input
                      className="crm-input"
                      type="email"
                      value={editLinkForm.clientEmail}
                      onChange={(e) => setEditLinkForm((f) => ({ ...f, clientEmail: e.target.value }))}
                      required
                    />
                  </label>
                  <label className="crm-field">
                    <span className="crm-label">Company name</span>
                    <input
                      className="crm-input"
                      value={editLinkForm.companyName}
                      onChange={(e) => setEditLinkForm((f) => ({ ...f, companyName: e.target.value }))}
                    />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label className="crm-field">
                    <span className="crm-label">Service *</span>
                    <select
                      className="crm-input crm-select"
                      value={editLinkForm.service}
                      onChange={(e) => setEditLinkForm((f) => ({ ...f, service: e.target.value }))}
                    >
                      {PAYMENT_LINK_SERVICES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="crm-field">
                    <span className="crm-label">Quantity / Scope *</span>
                    <select
                      className="crm-input crm-select"
                      value={editLinkForm.quantity}
                      onChange={(e) => setEditLinkForm((f) => ({ ...f, quantity: e.target.value }))}
                    >
                      {PAYMENT_LINK_QUANTITIES.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Amount ($ USD) */}
                <label className="crm-field">
                  <span className="crm-label">Total amount ($ USD)</span>
                  <input
                    className="crm-input"
                    type="number"
                    step="any"
                    value={editLinkForm.totalAmount}
                    onChange={(e) => setEditLinkForm((f) => ({ ...f, totalAmount: e.target.value }))}
                    disabled={editingLink.status === "paid"}
                  />
                  {editingLink.status === "paid" && (
                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                      Amount cannot be modified after full payment.
                    </span>
                  )}
                </label>

                {/* Billing Dates */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label className="crm-field">
                    <span className="crm-label">Billing From</span>
                    <input
                      type="date"
                      className="crm-input"
                      value={editLinkForm.billingStartDate}
                      onChange={(e) => setEditLinkForm((f) => ({ ...f, billingStartDate: e.target.value }))}
                    />
                  </label>
                  <label className="crm-field">
                    <span className="crm-label">Billing To</span>
                    <input
                      type="date"
                      className="crm-input"
                      value={editLinkForm.billingEndDate}
                      onChange={(e) => {
                        const newEnd = e.target.value;
                        setEditLinkForm((f) => {
                          let due = f.balanceDueDate;
                          if (newEnd) {
                            const d = new Date(newEnd);
                            if (!isNaN(d.getTime())) {
                              d.setDate(d.getDate() - 10);
                              due = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                            }
                          }
                          return { ...f, billingEndDate: newEnd, balanceDueDate: due };
                        });
                      }}
                    />
                  </label>
                </div>

                {/* Balance Due Date */}
                <label className="crm-field">
                  <span className="crm-label">Tentative Balance Due Date</span>
                  <input
                    type="date"
                    className="crm-input"
                    value={editLinkForm.balanceDueDate}
                    onChange={(e) => setEditLinkForm((f) => ({ ...f, balanceDueDate: e.target.value }))}
                  />
                </label>

                {/* Status */}
                <label className="crm-field">
                  <span className="crm-label">Link Status</span>
                  <select
                    className="crm-input crm-select"
                    value={editLinkForm.linkStatus}
                    onChange={(e) => setEditLinkForm((f) => ({ ...f, linkStatus: e.target.value }))}
                  >
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="used">Used</option>
                    <option value="expired">Expired</option>
                  </select>
                </label>

                {/* Notes */}
                <label className="crm-field">
                  <span className="crm-label">Internal notes</span>
                  <textarea
                    className="crm-textarea"
                    rows={2}
                    value={editLinkForm.notes}
                    onChange={(e) => setEditLinkForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                </label>
              </div>

              {error && (
                <p className="crm-alert crm-alert-inset" style={{ marginTop: "12px" }}>
                  {error}
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button
                  type="button"
                  className="crm-act crm-act-ghost"
                  onClick={() => setEditingLink(null)}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="crm-act crm-act-purple"
                  disabled={busy}
                >
                  {busy ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- MANUAL ADD / EDIT PAYMENT MODAL ---- */}
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
                <div className="crm-drawer-title" style={{ fontSize: "16px", fontWeight: 800 }}>{editing === "new" ? "Add payment" : "Edit payment"}</div>
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
                    <option key={c} value={c}>{c}</option>
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
                    <option key={s} value={s}>{PAYMENT_STATUS_LABEL[s] || s}</option>
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/components/crm/Feedback";
import type { PaymentRow } from "@/lib/crm/data";
import { PAYMENT_STATUS_LABEL, money } from "@/lib/crm/format";
import { BulkBar, SelectBox, useSelection } from "@/components/crm/Selection";
import { PageHead, Pager } from "@/components/crm/ListTools";
import { SERVICES_DATA } from "@/components/PayNowModal";
import { SOURCE_LABEL, isEnquirySource } from "@/lib/crm/leadOptions";
import ActivityTimeline, { usePaymentActivity } from "@/components/crm/ActivityTimeline";
import { SITE_URL, payLinkUrl } from "@/lib/siteUrl";
import { payMessage, whatsAppUrl, type PayMessageInput } from "@/lib/payMessages";
import ShareLinkButtons from "@/components/crm/ShareLinkButtons";

/* a payment link made from an enquiry shows which form that enquiry came from */
function EnquiryOrigin({ p }: { p: PaymentRow }) {
  if (!p.leadId || !isEnquirySource(p.leadSource)) return null;
  return (
    <a href={`/crm/enquiries?source=${p.leadSource}`} className="crm-pay-origin" onClick={(e) => e.stopPropagation()} title="Open enquiries from this form">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h16v12H5.2L4 17.2V4z" />
      </svg>
      <span>From enquiry · {SOURCE_LABEL[p.leadSource]}</span>
    </a>
  );
}

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

const pad2 = (v: number) => String(v).padStart(2, "0");

/* the client's pay link (/pay/<token>) on this site */
const payUrlFor = (token: string) => payLinkUrl(token);

/* one PayPal transaction on a payment record (from /api/crm/payments/transactions) */
type Txn = {
  kind: "full" | "deposit" | "balance";
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  transactionId: string | null;
  orderId: string | null;
  at: string;
  note: string | null;
};
const TXN_KIND = { full: "Full payment", deposit: "Deposit (partial payment)", balance: "Balance payment" } as const;
const TXN_STATUS = { paid: "Paid", pending: "Pending clearing", failed: "Failed" } as const;

/* a payment record and a payment link can share an id, so rows are told apart by table too */
const rowKey = (p: PaymentRow) => `${p.table === "payment_links" ? "link" : "pay"}:${p.id}`;

/** A time as the date-and-time box shows it, on this computer's clock: "2026-11-10T20:13" */
const toLocalInput = (iso: string | null | undefined) => {
  if (!iso) return "";
  const n = new Date(iso.includes("T") ? iso : `${iso}T00:00:00`);
  if (Number.isNaN(n.getTime())) return "";
  return `${n.getFullYear()}-${pad2(n.getMonth() + 1)}-${pad2(n.getDate())}T${pad2(n.getHours())}:${pad2(n.getMinutes())}`;
};

const nowLocalInput = () => toLocalInput(new Date().toISOString());

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
  paidAt: nowLocalInput(),
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
  paidAt: toLocalInput(p.paidAt),
  invoiceNumber: p.invoiceNumber || "",
  reference: p.reference || "",
  notes: p.notes || "",
});

export const CRM_INDUSTRIES = [
  "Healthcare & Wellness",
  "E-Commerce & Retail",
  "Real Estate & Construction",
  "IT & SaaS",
  "Education & EdTech",
  "Home Services",
  "Interior Design & Architecture",
  "Professional Services & Legal",
  "Travel, Tourism & Hospitality",
  "Automotive",
  "General / Other",
] as const;

export const PAYMENT_LINK_SERVICES = SERVICES_DATA.map((s) => s.service);
export const PAYMENT_LINK_QUANTITIES = SERVICES_DATA[0].categories;

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
  openId,
  userRole = "admin",
  q = "",
  status = "",
  currentTab = "all",
  from = "",
  to = "",
  monthLabel,
  isWholeMonth,
  prevMonthHref,
  curMonthHref,
  nextMonthHref,
  filtered = false,
  counts,
  total = 0,
  page = 1,
  pages = 1,
  pageSize = 20,
}: {
  rows: PaymentRow[];
  options: Options;
  openNew: boolean;
  /** a payment to show straight away (from a Payments Dashboard link) */
  openId?: number;
  userRole?: "super_admin" | "admin";
  q?: string;
  status?: string;
  currentTab?: "website" | "payment_link" | "all";
  from?: string;
  to?: string;
  monthLabel?: string;
  isWholeMonth?: boolean;
  prevMonthHref?: string;
  curMonthHref?: string;
  nextMonthHref?: string;
  filtered?: boolean;
  counts?: { website: number; paymentLink: number; all: number };
  total?: number;
  page?: number;
  pages?: number;
  pageSize?: number;
}) {
  const router = useRouter();
  const { confirm, toast } = useFeedback();
  const [editing, setEditing] = useState<PaymentRow | "new" | null>(openNew ? "new" : null);
  const [viewing, setViewing] = useState<PaymentRow | null>(() => {
    if (!openId) return null;
    return rows.find((r) => r.id === openId && r.table === "payments") || rows.find((r) => r.id === openId) || (rows.length === 1 ? rows[0] : null);
  });
  // drop ?open= once used, so closing the details and refreshing doesn't reopen them
  useEffect(() => {
    if (!openId) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("open");
    window.history.replaceState(window.history.state, "", url.toString());
  }, [openId]);
  const viewEntity = viewing ? (viewing.table === "payment_links" ? "payment_link" : "payment") : null;
  const { entries: payActivity, loading: payActivityLoading } = usePaymentActivity(
    viewEntity,
    viewing?.id ?? null,
    viewing
      ? [viewing.status, viewing.amount, viewing.totalAmount, viewing.remainingAmount, viewing.linkStatus, viewing.paymentType, viewing.clientName, viewing.clientEmail, viewing.clientPhone, viewing.notes, viewing.paidAt].join("|")
      : ""
  );
  const [, setModalSubtab] = useState<"orders" | "payments">("orders");
  // the PayPal transactions on the record shown in the details (deposit, balance, full)
  const [txns, setTxns] = useState<Txn[]>([]);
  const [txnsLoading, setTxnsLoading] = useState(false);
  const txnKey = viewing ? `${rowKey(viewing)}:${viewing.amount}:${viewing.status}` : "";
  useEffect(() => {
    if (!viewing) return;
    let live = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- shows the loader while the transactions load
    setTxnsLoading(true);
    fetch(`/api/crm/payments/transactions?table=${viewing.table}&id=${viewing.id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (live) setTxns(d?.ok ? d.items : []);
      })
      .catch(() => live && setTxns([]))
      .finally(() => live && setTxnsLoading(false));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- txnKey covers the record and its payments
  }, [txnKey]);

  // Generate Payment Link State
  const initialDates = getInitialBillingDates();
  const [generatingLink, setGeneratingLink] = useState(false);
  const [createdLink, setCreatedLink] = useState<{
    url: string;
    token: string;
    orderNumber: string;
    clientName?: string;
    clientPhone?: string;
    clientEmail?: string;
    service?: string;
    category?: string;
    industry?: string;
    quantity?: string;
    totalAmount?: number;
    paymentOption?: string;
  } | null>(null);
  const [linkForm, setLinkForm] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    companyName: "",
    service: SERVICES_DATA[0].service,
    category: SERVICES_DATA[0].categories[0] || "",
    industry: CRM_INDUSTRIES[0] as string,
    quantity: SERVICES_DATA[0].categories[0] || "",
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
    service: SERVICES_DATA[0].service,
    category: SERVICES_DATA[0].categories[0] || "",
    industry: CRM_INDUSTRIES[0] as string,
    quantity: SERVICES_DATA[0].categories[0] || "",
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
  const sel = useSelection<string>(rows.map(rowKey));

  const handleTabChange = (t: "all" | "website" | "payment_link") => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", t);
    params.set("page", "1");
    router.push(`/crm/payments?${params.toString()}`);
  };

  const copyLink = (tokenOrUrl: string, what = "Payment link") => {
    const fullUrl = tokenOrUrl.startsWith("http") ? tokenOrUrl : payUrlFor(tokenOrUrl);
    navigator.clipboard.writeText(fullUrl).then(
      () => toast(`${what} copied`),
      () => toast("Couldn't copy. Select the link and copy it instead.")
    );
  };

  const isExpiredLink = (p: { expiresAt?: string | null; createdAt?: string | null; status?: string | null; amount?: number | null; linkStatus?: string | null }) => {
    if (p.status === "paid" || p.linkStatus === "used") return false;
    // after a deposit the link is the balance link: it stays open until the balance is paid
    if (Number(p.amount || 0) > 0) return false;
    if (p.linkStatus === "expired") return true;
    if (p.expiresAt && !isNaN(new Date(p.expiresAt).getTime()) && new Date(p.expiresAt) < new Date()) return true;
    if (p.createdAt && !isNaN(new Date(p.createdAt).getTime()) && p.status !== "paid" && (new Date().getTime() - new Date(p.createdAt).getTime() > 24 * 60 * 60 * 1000)) return true;
    return false;
  };

  const getWhatsAppMessage = (p: PayMessageInput) => payMessage(p);

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
    window.open(whatsAppUrl(p.clientPhone, getWhatsAppMessage(p)), "_blank", "noopener");
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
      body: JSON.stringify({ action: "cancel", id: p.id, table: p.table }),
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
    const serviceMatch = SERVICES_DATA.find((s) => s.service === p.service) || SERVICES_DATA[0];
    const initialCategory = p.category || p.quantity || (serviceMatch.categories[0] || "");
    setEditLinkForm({
      id: p.id,
      clientName: p.clientName,
      clientPhone: p.clientPhone || "",
      clientEmail: p.clientEmail || "",
      companyName: p.companyName || "",
      service: p.service || SERVICES_DATA[0].service,
      category: initialCategory,
      industry: p.industry || (CRM_INDUSTRIES[0] as string),
      quantity: initialCategory,
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
    const matchedService = SERVICES_DATA.find((s) => s.service === editLinkForm.service);
    const hasCategories = (matchedService?.categories?.length || 0) > 0;
    const finalCategory = hasCategories ? editLinkForm.category : "Not Applicable";

    const res = await fetch("/api/crm/payment-links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editLinkForm,
        table: editingLink?.table,
        category: finalCategory,
        quantity: finalCategory,
      }),
    }).catch(() => null);
    setBusy(false);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok || !json.ok) {
      setError(json.error || "Failed to update payment link.");
      return;
    }
    if (viewing && editingLink && rowKey(viewing) === rowKey(editingLink)) {
      setViewing((prev) =>
        prev
          ? {
              ...prev,
              clientName: editLinkForm.clientName,
              clientPhone: editLinkForm.clientPhone,
              clientEmail: editLinkForm.clientEmail,
              companyName: editLinkForm.companyName,
              service: editLinkForm.service,
              category: finalCategory,
              quantity: finalCategory,
              industry: editLinkForm.industry,
              totalAmount: Number(editLinkForm.totalAmount) || prev.totalAmount,
              paymentType: editLinkForm.paymentOption,
              billingStartDate: editLinkForm.billingStartDate,
              billingEndDate: editLinkForm.billingEndDate,
              balanceDueDate: editLinkForm.balanceDueDate,
              linkStatus: editLinkForm.linkStatus,
              notes: editLinkForm.notes,
            }
          : null
      );
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
      body: JSON.stringify({ id: p.id, table: p.table }),
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
      // the date-and-time box is on this computer's clock; send it as an exact time
      body: JSON.stringify({ ...form, paidAt: form.paidAt ? new Date(form.paidAt).toISOString() : "" }),
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
    const matchedService = SERVICES_DATA.find((s) => s.service === linkForm.service);
    const hasCategories = (matchedService?.categories?.length || 0) > 0;
    const finalCategory = hasCategories ? linkForm.category : "Not Applicable";

    const res = await fetch("/api/crm/payment-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...linkForm,
        category: finalCategory,
        quantity: finalCategory,
      }),
    }).catch(() => null);
    setBusy(false);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok || !json.ok) {
      setError(json.error || "Failed to generate payment link.");
      return;
    }
    setGeneratingLink(false);
    setCreatedLink({
      url: `${SITE_URL}${json.url}`,
      token: json.token,
      orderNumber: json.orderNumber,
      clientName: linkForm.clientName,
      clientPhone: linkForm.clientPhone,
      clientEmail: linkForm.clientEmail,
      service: linkForm.service,
      category: finalCategory,
      industry: linkForm.industry,
      quantity: finalCategory,
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
    const res = await fetch(`/api/crm/payments/${p.id}?table=${p.table}`, { method: "DELETE" }).catch(() => null);
    setBusy(false);
    if (!res?.ok && res?.status !== 404) {
      toast("Couldn't delete payment. Please try again.");
      return;
    }
    if (viewing && rowKey(viewing) === rowKey(p)) setViewing(null);
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
      body: JSON.stringify({ keys: ids }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return setListError("Couldn't delete the selected payments. Please try again.");
    sel.clear();
    toast(ids.length === 1 ? "Payment deleted" : `${ids.length} payments deleted`);
    router.refresh();
  };

  // export: the payments this view shows (same tab, status, search and month)
  const exportHref = `/api/crm/payments/export?${new URLSearchParams(
    Object.entries({ q, status, tab: currentTab === "all" ? "" : currentTab, from, to }).filter(([, v]) => v) as [string, string][]
  ).toString()}`;

  const headerActions = (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <a href={exportHref} className="crm-act crm-act-ghost" title="Download these payments as a spreadsheet (CSV)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
        Export CSV
      </a>
      {currentTab !== "website" && (
        <button
          type="button"
          className="crm-act crm-act-dark"
          onClick={() => {
            setError("");
            setGeneratingLink(true);
          }}
          title="Generate client payment link"
          style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontWeight: 700 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span>+ Generate Payment Link</span>
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

      <section className="crm-pay-shell">
      {/* Tabs: All Payments, Website Payments, and Payment Links */}
      <div className="crm-pay-tabs" role="tablist" aria-label="Payment type">
        <button
          type="button"
          className={`crm-pay-tab ${!currentTab || currentTab === "all" ? "is-active" : ""}`}
          onClick={() => handleTabChange("all")}
          title="All payments and links"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
          <span>All Payments</span>
          <span className="crm-tab-badge">{counts?.all ?? 0}</span>
        </button>

        <button
          type="button"
          className={`crm-pay-tab ${currentTab === "website" ? "is-active" : ""}`}
          onClick={() => handleTabChange("website")}
          title="Filter to website checkout payments"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>Website Payments</span>
          <span className="crm-tab-badge">{counts?.website ?? 0}</span>
        </button>

        <button
          type="button"
          className={`crm-pay-tab ${currentTab === "payment_link" ? "is-active" : ""}`}
          onClick={() => handleTabChange("payment_link")}
          title="Filter to admin-generated payment links"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span>Payment Links</span>
          <span className="crm-tab-badge">{counts?.paymentLink ?? 0}</span>
        </button>
      </div>

      <form className="crm-filters crm-filters-wrap" method="get">
        {currentTab && currentTab !== "all" && <input type="hidden" name="tab" value={currentTab} />}
        <label className="crm-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input className="crm-input" type="search" name="q" defaultValue={q} placeholder="Search client, email, phone, company, invoice or transaction" aria-label="Search" />
        </label>
        <select className="crm-input crm-select" name="status" defaultValue={status} aria-label="Status">
          <option value="">All statuses</option>
          {options.statuses.map((s) => (
            <option key={s} value={s}>
              {PAYMENT_STATUS_LABEL[s] || s}
            </option>
          ))}
        </select>
        <span className="crm-date-range">
          <input className="crm-input" type="date" name="from" defaultValue={from} aria-label="From date" />
          <span className="crm-muted">to</span>
          <input className="crm-input" type="date" name="to" defaultValue={to} aria-label="To date" />
        </span>
        <button type="submit" className="crm-act crm-act-dark">
          Apply
        </button>
        {filtered && (
          <Link href={currentTab && currentTab !== "all" ? `?tab=${currentTab}` : "?"} className="crm-act crm-act-ghost">
            Clear
          </Link>
        )}
      </form>

      {monthLabel && (
        <div className="crm-period">
          <span className="crm-period-label">Period</span>
          <Link href={prevMonthHref || "#"} className="crm-icon-act crm-period-step" aria-label="Previous month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <Link href={curMonthHref || "#"} className={`crm-period-month${isWholeMonth ? " is-on" : ""}`}>
            {monthLabel}
          </Link>
          <Link href={nextMonthHref || "#"} className="crm-icon-act crm-period-step" aria-label="Next month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
          <span className="crm-muted crm-period-count">
            {total} {total === 1 ? "payment" : "payments"}
            {filtered ? " match the filters" : " in total"}
          </span>
        </div>
      )}

      <div className="crm-pay-table">
        {rows.length > 0 && (
          <BulkBar sel={sel} noun={["payment", "payments"]} busy={busy} onDelete={removeSelected}>
            {sel.selected.length > 0 && (
              <a
                href={`/api/crm/payments/export?${new URLSearchParams({
                  ...(currentTab !== "all" ? { tab: currentTab } : {}),
                  keys: sel.selected.join(","),
                }).toString()}`}
                className="crm-act crm-act-ghost crm-act-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
                Export selected ({sel.selected.length})
              </a>
            )}
          </BulkBar>
        )}
        {listError && (
          <p className="crm-alert crm-alert-inset" role="alert">
            {listError}
          </p>
        )}

        {rows.length ? (
          <div className="crm-table-wrap">
            <table className={`crm-table crm-stack crm-selectable${currentTab === "payment_link" ? " crm-pay-links" : ""}`}>
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
                    <th>CUSTOMER</th>
                    <th>SERVICE &amp; SCOPE / TOTAL</th>
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
                  const isLinkExpired = isExpiredLink(p);
                  const linkStatusBadge =
                    p.status === "paid" || p.linkStatus === "used"
                      ? "used"
                      : isLinkExpired
                      ? "expired"
                      : p.linkStatus || "active";

                  if (currentTab === "payment_link") {
                    /* Row Format for Payment Link Tab (Screenshot 2) */
                    return (
                      <tr
                        key={rowKey(p)}
                        className={`crm-row${sel.has(rowKey(p)) ? " is-picked" : ""}`}
                        onClick={() => {
                          setViewing(p);
                          setModalSubtab("orders");
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <td className="crm-col-check" onClick={(e) => e.stopPropagation()}>
                          <SelectBox
                            checked={sel.has(rowKey(p))}
                            onChange={(on) => sel.toggle(rowKey(p), on)}
                            label={`Select payment link for ${p.clientName}`}
                          />
                        </td>

                        {/* Customer */}
                        <td data-label="Customer" className="crm-cell-main">
                          <span className="crm-strong" style={{ fontSize: "14px", color: "#0f172a" }}>
                            {p.clientName}
                          </span>
                          <EnquiryOrigin p={p} />
                          <span className="crm-cell-sub" style={{ color: "#475569", fontWeight: 500 }}>
                            {p.clientPhone || "—"}
                          </span>
                          <span className="crm-cell-sub" style={{ color: "#2563eb" }}>
                            {p.clientEmail || "—"}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                            {p.companyName && (
                              <span style={{ fontSize: "11px", color: "#475569", fontWeight: 600 }}>
                                {p.companyName}
                              </span>
                            )}
                            <span style={{ fontSize: "11px", color: "#0f172a", fontFamily: "monospace", fontWeight: 700 }}>
                              {p.invoiceNumber || `QAS-${p.id}`}
                            </span>
                          </div>
                        </td>

                        {/* Service / Total */}
                        <td data-label="Service / Total">
                          <span className="crm-strong" style={{ color: "#0f172a", fontSize: "13.5px" }}>
                            {p.service}
                          </span>
                          <span style={{ display: "block", fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                            {p.category || p.quantity || "—"}
                          </span>
                          {p.industry && (
                            <span style={{ display: "inline-block", fontSize: "11px", color: "#475569", background: "#f1f5f9", padding: "1px 6px", borderRadius: "4px", marginTop: "3px", border: "1px solid #e2e8f0" }}>
                              {p.industry}
                            </span>
                          )}
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
                            {/* Copy Link (only when link is active and not paid) */}
                            {!isLinkExpired && p.status !== "paid" && p.linkStatus !== "used" && p.linkStatus !== "cancelled" && (
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
                            )}
                            {/* WhatsApp (Green Button) */}
                            {!isLinkExpired && p.status !== "paid" && p.linkStatus !== "used" && p.linkStatus !== "cancelled" ? (
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
                                title="Share on WhatsApp (valid 24h)"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M20.52 3.48A11.93 11.93 0 0 0 12.06 0C5.46 0 .09 5.37.09 11.97c0 2.11.55 4.17 1.6 6L0 24l6.19-1.62a11.93 11.93 0 0 0 5.87 1.51h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.2-1.25-6.21-3.52-8.44zm-8.46 18.36h-.01a9.92 9.92 0 0 1-5.06-1.39l-.36-.22-3.76.99 1-3.66-.24-.38a9.93 9.93 0 0 1-1.52-5.21c0-5.5 4.47-9.97 9.97-9.97 2.66 0 5.16 1.04 7.05 2.92a9.92 9.92 0 0 1 2.92 7.05c0 5.5-4.48 9.97-9.99 9.97zm5.46-7.46c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.64-.93-2.25-.24-.59-.49-.51-.68-.52h-.58c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.51s1.08 2.91 1.23 3.11c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.13-.27-.2-.57-.35z" />
                                </svg>
                                WhatsApp
                              </button>
                            ) : null}

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
                      key={rowKey(p)}
                      className={`crm-row${sel.has(rowKey(p)) ? " is-picked" : ""}`}
                      onClick={() => {
                        setViewing(p);
                        setModalSubtab("orders");
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <td className="crm-col-check" onClick={(e) => e.stopPropagation()}>
                        <SelectBox
                          checked={sel.has(rowKey(p))}
                          onChange={(on) => sel.toggle(rowKey(p), on)}
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
                        <EnquiryOrigin p={p} />
                        {p.companyName && (
                          <span className="crm-cell-sub" style={{ color: "#475569" }}>
                            {p.companyName}
                          </span>
                        )}
                        <span className="crm-cell-sub" style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "3px" }}>
                          {p.clientEmail && (
                            <span style={{ color: "#2563eb", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                              </svg>
                              <span>{p.clientEmail}</span>
                            </span>
                          )}
                          {p.clientPhone && (
                            <span style={{ color: "#0f172a", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                              </svg>
                              <span>{p.clientPhone}</span>
                            </span>
                          )}
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
                          {p.token && p.status === "partially_paid" && Number(p.remainingAmount || 0) > 0 && p.linkStatus !== "cancelled" && (
                            <button
                              type="button"
                              className="crm-action-btn is-wa"
                              title="Share the balance link on WhatsApp"
                              aria-label="Share the balance link on WhatsApp"
                              onClick={() => openWhatsApp(p)}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M20.52 3.48A11.93 11.93 0 0 0 12.06 0C5.46 0 .09 5.37.09 11.97c0 2.11.55 4.17 1.6 6L0 24l6.19-1.62a11.93 11.93 0 0 0 5.87 1.51h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.2-1.25-6.21-3.52-8.44zm-8.46 18.36h-.01a9.92 9.92 0 0 1-5.06-1.39l-.36-.22-3.76.99 1-3.66-.24-.38a9.93 9.93 0 0 1-1.52-5.21c0-5.5 4.47-9.97 9.97-9.97 2.66 0 5.16 1.04 7.05 2.92a9.92 9.92 0 0 1 2.92 7.05c0 5.5-4.48 9.97-9.99 9.97zm5.46-7.46c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.64-.93-2.25-.24-.59-.49-.51-.68-.52h-.58c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.51s1.08 2.91 1.23 3.11c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.13-.27-.2-.57-.35z" />
                              </svg>
                            </button>
                          )}
                          {p.token && p.status !== "paid" && p.linkStatus !== "used" && !isExpiredLink(p) && (
                            <button
                              type="button"
                              className="crm-action-btn"
                              title={p.status === "partially_paid" ? "Copy the balance link" : "Copy Payment Link"}
                              onClick={() => copyLink(p.token!, p.status === "partially_paid" ? "Balance link" : "Payment link")}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
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
                  className="crm-act crm-act-dark"
                  onClick={() => {
                    setError("");
                    setGeneratingLink(true);
                  }}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 700 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <span>+ Generate Payment Link</span>
                </button>
              </div>
            )}
          </div>
        )}
        <Pager page={page} pages={pages} total={total} pageSize={pageSize} q={q} status={status} extra={{ tab: currentTab && currentTab !== "all" ? currentTab : "", from: from || "", to: to || "" }} />
      </div>
      </section>

      {/* ---- PAYMENT DETAILS: who, how much, every payment with its transaction ID, links, history ---- */}
      {viewing && (() => {
        const isViewingExpired = isExpiredLink(viewing);
        const isViewingPaid = viewing.status === "paid" || viewing.linkStatus === "used";
        const canShareViewing = !isViewingExpired && !isViewingPaid && viewing.linkStatus !== "cancelled";
        const isLink = viewing.table === "payment_links";
        const cur = viewing.currency || "USD";
        const total = viewing.totalAmount != null ? viewing.totalAmount : viewing.amount;
        const paidSoFar = Number(viewing.amount || 0);
        const balanceDue = viewing.status === "partially_paid" ? Number(viewing.remainingAmount || 0) : 0;
        const okTx = txns.filter((t) => t.status !== "failed");
        const failedTx = txns.filter((t) => t.status === "failed");
        const linkOpenUntil = viewing.expiresAt || (viewing.createdAt ? new Date(new Date(viewing.createdAt).getTime() + 24 * 3600_000).toISOString() : null);
        const statusPill =
          viewing.linkStatus === "cancelled" && paidSoFar === 0
            ? ["Cancelled", "failed"]
            : paidSoFar === 0
            ? [isViewingExpired ? "Not paid · link expired" : "Not paid yet", "pending"]
            : viewing.status === "pending"
            ? ["Pending clearing", "pending"]
            : balanceDue > 0
            ? ["Partially paid", "partially_paid"]
            : ["Fully paid", "paid"];
        const linkLine =
          viewing.linkStatus === "cancelled"
            ? "This link was cancelled and can't be paid."
            : balanceDue > 0
            ? "The balance link stays open until the balance is paid."
            : paidSoFar > 0 && okTx.some((t) => t.kind === "balance")
            ? `Balance paid on ${fmtDate(okTx.filter((t) => t.kind === "balance").slice(-1)[0].at, true)}. Order fully paid; no reminder emails will be sent.`
            : paidSoFar > 0
            ? isLink
              ? "The link was used. Nothing more is due."
              : "Paid on the website. Nothing more is due."
            : isViewingExpired
            ? "Not paid within 24 hours, so the link expired. Generate a new link for the client."
            : `The client can pay with this link until ${fmtDate(linkOpenUntil, true)}.`;
        const dueDay = viewing.balanceDueDate ? new Date(`${viewing.balanceDueDate}T00:00:00`) : null;
        // when each automatic reminder goes out (or why it won't: the deposit came after that day)
        const reminderOn = (days: number, sentAt: string | null | undefined) => {
          if (sentAt) return `sent ${fmtDate(sentAt, true)}`;
          if (!dueDay) return "";
          const d = new Date(dueDay);
          d.setDate(d.getDate() - days);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (days === 10 && d < today) return "not needed, the deposit came less than 10 days before the due date";
          if (d < today) return dueDay >= today ? "goes out within the hour" : "the due date has passed";
          return `on ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
        };
        const receiptHref = `/api/payments/receipt?table=${viewing.table}&id=${viewing.id}`;

        return (
          <div className="crm-modal-wrap" onClick={() => setViewing(null)}>
            <div className="crm-view-modal crm-paydetail" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Payment details">
              <div className="crm-paydetail-head">
                <div>
                  <h3>{isLink ? "Payment link" : viewing.source === "website" || viewing.source === "online" ? "Website payment" : "Payment"} · Order {viewing.invoiceNumber || `#${viewing.id}`}</h3>
                  <p>
                    {isLink
                      ? `Link created by ${viewing.createdBy || "Admin"} on ${fmtDate(viewing.createdAt, true)}`
                      : `Received on ${fmtDate(viewing.createdAt, true)} through the website's Pay Now`}
                  </p>
                </div>
                <button type="button" className="crm-detail-close" onClick={() => setViewing(null)} aria-label="Close">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="crm-view-modal-body crm-paydetail-body">
                {/* who and what */}
                <div className="crm-paydetail-client">
                  <div>
                    <strong>{viewing.clientName}</strong>
                    {viewing.companyName && <span className="crm-muted"> · {viewing.companyName}</span>}
                    <div className="crm-muted">
                      {viewing.clientEmail || "—"} · {viewing.clientPhone || "—"}
                    </div>
                  </div>
                  <div className="crm-paydetail-service">
                    <strong>{viewing.service}</strong>
                    <div className="crm-muted">{viewing.category || viewing.quantity || ""}</div>
                  </div>
                </div>

                {/* the money at a glance */}
                <div className="crm-paydetail-figures">
                  <div>
                    <span>Order total</span>
                    <strong>{money(total, cur)}</strong>
                  </div>
                  <div>
                    <span>Paid so far</span>
                    <strong className={paidSoFar > 0 ? "is-green" : undefined}>{money(paidSoFar, cur)}</strong>
                  </div>
                  {balanceDue > 0 && (
                    <div>
                      <span>Balance due</span>
                      <strong className="is-red">{money(balanceDue, cur)}</strong>
                      {dueDay && <small>by {fmtDate(viewing.balanceDueDate || null)}</small>}
                    </div>
                  )}
                  <div>
                    <span>Status</span>
                    <span className={`crm-pill crm-pill-${statusPill[1]}`}>{statusPill[0]}</span>
                  </div>
                </div>
                <p className="crm-paydetail-linkline">{linkLine}</p>

                {/* every payment, with its transaction ID and exact time */}
                <section className="crm-paydetail-section">
                  <div className="crm-paydetail-section-head">
                    <h4>Payments received {okTx.length > 0 && <span className="crm-tab-badge">{okTx.length}</span>}</h4>
                    {paidSoFar > 0 && (
                      <a href={receiptHref} target="_blank" rel="noreferrer" className="crm-link-btn">
                        Receipt (PDF)
                      </a>
                    )}
                  </div>
                  {txnsLoading && !txns.length ? (
                    <p className="crm-muted">Loading payments…</p>
                  ) : okTx.length === 0 ? (
                    <p className="crm-muted">No payment received yet.</p>
                  ) : (
                    <ol className="crm-paylist">
                      {okTx.map((t, i) => {
                        const soFar = okTx.slice(0, i + 1).reduce((a, x) => a + x.amount, 0);
                        return (
                          <li key={`${t.transactionId}-${i}`} className="crm-payitem">
                            <div className="crm-payitem-main">
                              <strong>
                                {i + 1}. {TXN_KIND[t.kind]}
                              </strong>
                              <span className="crm-payitem-when">{fmtDate(t.at, true)}</span>
                              <span className="crm-payitem-id">
                                Transaction ID <code>{t.transactionId || "—"}</code>
                              </span>
                              {t.orderId && t.orderId !== t.transactionId && <span className="crm-muted crm-payitem-sub">PayPal order {t.orderId}</span>}
                            </div>
                            <div className="crm-payitem-side">
                              <strong>{t.amount > 0 ? money(t.amount, t.currency) : "—"}</strong>
                              <span className={`crm-pill crm-pill-${t.status === "pending" ? "pending" : "paid"}`}>{TXN_STATUS[t.status]}</span>
                              {!t.note && soFar > 0 && soFar < total && <small className="crm-muted">{money(total - soFar, cur)} left after this</small>}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                  {failedTx.length > 0 && (
                    <p className="crm-paydetail-failed">
                      {failedTx.length === 1 ? "1 failed attempt" : `${failedTx.length} failed attempts`} (no money taken):{" "}
                      {failedTx.map((t) => `${fmtDate(t.at, true)}${t.note ? `, ${t.note}` : ""}`).join("; ")}
                    </p>
                  )}
                </section>

                {/* the link to share: the payment link before anything is paid, the balance link after a deposit */}
                {viewing.token && viewing.linkStatus !== "cancelled" && (balanceDue > 0 || (paidSoFar === 0 && canShareViewing)) && (
                  <section className="crm-balance-link">
                    <div className="crm-balance-link-head">
                      <strong>{balanceDue > 0 ? "Balance link" : "Payment link"}</strong>
                      <span>
                        {balanceDue > 0
                          ? `${money(balanceDue, cur)} still due. The client pays it with this link.`
                          : `Send this to the client. It can be paid until ${fmtDate(linkOpenUntil, true)}.`}
                      </span>
                    </div>
                    <code className="crm-balance-link-url">{payUrlFor(viewing.token)}</code>
                    <ShareLinkButtons link={viewing} what={balanceDue > 0 ? "Balance link" : "Payment link"} />
                    <div className="crm-balance-link-actions">
                      {balanceDue > 0 && (
                        <button type="button" className="crm-act crm-act-ghost crm-act-sm" onClick={() => sendBalanceReminder(viewing)}>
                          Email the balance reminder now
                        </button>
                      )}
                    </div>
                    {balanceDue > 0 && dueDay && (
                      <p className="crm-paydetail-reminders">
                        Automatic reminder emails to the client: 10 days before the due date ({reminderOn(10, viewing.balanceReminder10dSentAt)}) and 2 days
                        before ({reminderOn(2, viewing.balanceReminder2dSentAt)}). They stop as soon as the balance is paid.
                      </p>
                    )}
                  </section>
                )}

                <ActivityTimeline
                  entries={payActivity}
                  kind="payment"
                  loading={payActivityLoading}
                  emptyText="No activity has been recorded for this payment yet."
                  visibleCount={4}
                  orderTotal={total}
                />
              </div>

              <div className="crm-paydetail-foot">
                <div>
                  <button type="button" className="crm-act crm-act-ghost crm-act-sm" onClick={() => openEditLink(viewing)}>
                    Edit details
                  </button>
                  {isLink && canShareViewing && paidSoFar === 0 && (
                    <button type="button" className="crm-act crm-act-ghost crm-act-sm" onClick={() => cancelLink(viewing)}>
                      Cancel link
                    </button>
                  )}
                  <button type="button" className="crm-act crm-act-ghost crm-act-sm crm-act-danger" onClick={() => deleteSingle(viewing)}>
                    Delete
                  </button>
                </div>
                <button type="button" className="crm-act crm-act-dark" onClick={() => setViewing(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ---- GENERATE PAYMENT LINK MODAL (Screenshot 3) ---- */}
      {generatingLink && (
        <div className="crm-modal-wrap" onClick={() => setGeneratingLink(false)}>
          <div className="crm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "880px", width: "95vw" }}>
            <div className="crm-drawer-head" style={{ padding: "16px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <div>
                  <div className="crm-drawer-title" style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>Generate Payment Link</div>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                    Customer pays this custom total via PayPal or Card · valid 24 hours · single use · no coupons
                  </p>
                </div>
              </div>
              <button type="button" className="crm-icon-act" onClick={() => setGeneratingLink(false)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={savePaymentLink} style={{ padding: "18px 22px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Row 1: Customer Name, Phone, Email */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
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
                </div>

                {/* Row 2: Company, Service, Category */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr 1.25fr", gap: "12px" }}>
                  <label className="crm-field">
                    <span className="crm-label">Company / brand</span>
                    <input
                      className="crm-input"
                      value={linkForm.companyName}
                      onChange={(e) => setLinkForm((f) => ({ ...f, companyName: e.target.value }))}
                      placeholder="Optional"
                    />
                  </label>

                  <label className="crm-field">
                    <span className="crm-label">Service *</span>
                    <select
                      className="crm-input crm-select"
                      value={linkForm.service}
                      onChange={(e) => {
                        const newServ = e.target.value;
                        const match = SERVICES_DATA.find((s) => s.service === newServ);
                        const firstCat = match && match.categories.length > 0 ? match.categories[0] : "";
                        setLinkForm((f) => ({
                          ...f,
                          service: newServ,
                          category: firstCat,
                          quantity: firstCat,
                        }));
                      }}
                    >
                      {SERVICES_DATA.map((s) => (
                        <option key={s.service} value={s.service}>{s.service}</option>
                      ))}
                    </select>
                  </label>

                  <label className="crm-field">
                    <span className="crm-label">Category / Scope *</span>
                    {(() => {
                      const cats = SERVICES_DATA.find((s) => s.service === linkForm.service)?.categories || [];
                      if (cats.length > 0) {
                        return (
                          <select
                            className="crm-input crm-select"
                            value={linkForm.category}
                            onChange={(e) => setLinkForm((f) => ({ ...f, category: e.target.value, quantity: e.target.value }))}
                          >
                            {cats.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        );
                      }
                      return (
                        <input
                          type="text"
                          readOnly
                          disabled
                          value="Not Applicable"
                          className="crm-input is-disabled"
                          style={{
                            background: "rgba(255, 255, 255, 0.04)",
                            color: "#94a3b8",
                            cursor: "not-allowed",
                            border: "1px solid #334155",
                          }}
                          title="This service does not require category selection"
                        />
                      );
                    })()}
                  </label>
                </div>

                {/* Row 3: Industry, Amount, Payment Option */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <label className="crm-field">
                    <span className="crm-label">Industry *</span>
                    <select
                      className="crm-input crm-select"
                      value={linkForm.industry}
                      onChange={(e) => setLinkForm((f) => ({ ...f, industry: e.target.value }))}
                    >
                      {CRM_INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </label>

                  <label className="crm-field">
                    <span className="crm-label">Custom total amount ($ USD) *</span>
                    <div style={{ display: "flex", alignItems: "stretch", width: "100%" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 14px",
                          background: "#1e293b",
                          border: "1px solid #334155",
                          borderRight: "none",
                          borderTopLeftRadius: "6px",
                          borderBottomLeftRadius: "6px",
                          fontWeight: 700,
                          color: "#f8fafc",
                          fontSize: "15px",
                          userSelect: "none",
                        }}
                      >
                        $
                      </span>
                      <input
                        className="crm-input"
                        type="text"
                        inputMode="decimal"
                        style={{
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                        value={linkForm.totalAmount}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/[^0-9.]/g, "");
                          const parts = clean.split(".");
                          const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : clean;
                          setLinkForm((f) => ({ ...f, totalAmount: sanitized }));
                        }}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </label>

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
                      <option value="partial">50% Deposit (Partial Payment)</option>
                    </select>
                  </label>
                </div>

                {/* Row 4: Billing Dates & Balance */}
                {linkForm.paymentOption === "partial" ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
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
                      <label className="crm-field">
                        <span className="crm-label">Tentative Balance Due Date *</span>
                        <input
                          type="date"
                          className="crm-input"
                          value={linkForm.balanceDueDate}
                          onChange={(e) => setLinkForm((f) => ({ ...f, balanceDueDate: e.target.value }))}
                          required
                        />
                      </label>
                    </div>
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 14px", display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                      <span>Due Today (50% Deposit): ${((Number(linkForm.totalAmount) || 0) * 0.5).toFixed(2)} USD</span>
                      <span>Remaining Balance: ${((Number(linkForm.totalAmount) || 0) * 0.5).toFixed(2)} USD</span>
                    </div>
                  </>
                ) : (
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
                        onChange={(e) => setLinkForm((f) => ({ ...f, billingEndDate: e.target.value }))}
                        required
                      />
                    </label>
                  </div>
                )}

                {/* Row 5: Notes */}
                <label className="crm-field">
                  <span className="crm-label">Notes for the team (internal reference, not shown to customer)</span>
                  <input
                    className="crm-input"
                    value={linkForm.notes}
                    onChange={(e) => setLinkForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Deliverables, contract terms, or special instructions"
                  />
                </label>
              </div>

              {error && (
                <p className="crm-alert crm-alert-inset" style={{ marginTop: "10px" }}>
                  {error}
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
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
                  className="crm-act crm-act-dark"
                  disabled={busy}
                  style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontWeight: 700 }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <span>{busy ? "Generating…" : "+ Generate Payment Link"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- CREATED LINK SUCCESS MODAL ---- */}
      {createdLink && (
        <div className="crm-modal-wrap" onClick={() => setCreatedLink(null)}>
          <div className="crm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px", padding: "26px" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#f8fafc", border: "2px solid #0f172a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>
                Payment Link Generated!
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                Order <strong style={{ color: "#0f172a" }}>#{createdLink.orderNumber}</strong> is ready. Share this link with the client:
              </p>
            </div>

            <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", wordBreak: "break-all", fontFamily: "monospace", fontSize: "13px", color: "#0f172a", marginBottom: "18px", fontWeight: 600 }}>
              {createdLink.url}
            </div>

            <ShareLinkButtons
              centered
              link={{
                clientName: createdLink.clientName || "",
                clientPhone: createdLink.clientPhone,
                clientEmail: createdLink.clientEmail,
                service: createdLink.service || "Services",
                quantity: createdLink.quantity,
                totalAmount: createdLink.totalAmount,
                paymentType: createdLink.paymentOption,
                token: createdLink.token,
                invoiceNumber: createdLink.orderNumber,
              }}
            />

            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginTop: "12px" }}>
              <a
                href={createdLink.url}
                target="_blank"
                rel="noreferrer"
                className="crm-act crm-act-ghost"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span>Open Link</span>
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

      {/* ---- EDIT PAYMENT LINK MODAL (Matching LeadsView Edit Panel) ---- */}
      {editingLink && (
        <div className="crm-modal-wrap" style={{ zIndex: 120 }} onClick={() => setEditingLink(null)}>
          <form
            className="crm-modal crm-modal-wide"
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveEditLink}
            noValidate
            role="dialog"
            aria-label={`Edit payment link — ${editingLink.clientName}`}
          >
            <div className="crm-drawer-head">
              <div>
                <p className="crm-drawer-kicker">Payment Link Lead</p>
                <h2 className="crm-drawer-title">Edit payment link — {editingLink.clientName}</h2>
              </div>
              <button type="button" className="crm-icon-act" onClick={() => setEditingLink(null)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="crm-form-grid crm-form-grid-3">
              {/* Row 1: Customer Name, Phone, Email */}
              <label className="crm-field">
                <span className="crm-label">Client full name *</span>
                <input
                  className="crm-input"
                  value={editLinkForm.clientName}
                  onChange={(e) => setEditLinkForm((f) => ({ ...f, clientName: e.target.value }))}
                  placeholder="e.g. John Carter"
                  required
                />
              </label>
              <label className="crm-field">
                <span className="crm-label">Mobile number (WhatsApp) *</span>
                <input
                  className="crm-input"
                  type="tel"
                  value={editLinkForm.clientPhone}
                  onChange={(e) => setEditLinkForm((f) => ({ ...f, clientPhone: e.target.value }))}
                  placeholder="+1 302 555 0147"
                  required
                />
              </label>
              <label className="crm-field">
                <span className="crm-label">Email address *</span>
                <input
                  className="crm-input"
                  type="email"
                  value={editLinkForm.clientEmail}
                  onChange={(e) => setEditLinkForm((f) => ({ ...f, clientEmail: e.target.value }))}
                  placeholder="client@company.com"
                  required
                />
              </label>

              {/* Row 2: Company, Service, Category */}
              <label className="crm-field">
                <span className="crm-label">Company / brand</span>
                <input
                  className="crm-input"
                  value={editLinkForm.companyName}
                  onChange={(e) => setEditLinkForm((f) => ({ ...f, companyName: e.target.value }))}
                  placeholder="e.g. Acme Corp"
                />
              </label>
              <label className="crm-field">
                <span className="crm-label">Service *</span>
                <select
                  className="crm-input crm-select"
                  value={editLinkForm.service}
                  onChange={(e) => {
                    const newServ = e.target.value;
                    const match = SERVICES_DATA.find((s) => s.service === newServ);
                    const firstCat = match && match.categories.length > 0 ? match.categories[0] : "";
                    setEditLinkForm((f) => ({
                      ...f,
                      service: newServ,
                      category: firstCat,
                      quantity: firstCat,
                    }));
                  }}
                >
                  {SERVICES_DATA.map((s) => (
                    <option key={s.service} value={s.service}>{s.service}</option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span className="crm-label">Category / Scope *</span>
                {(() => {
                  const cats = SERVICES_DATA.find((s) => s.service === editLinkForm.service)?.categories || [];
                  if (cats.length > 0) {
                    return (
                      <select
                        className="crm-input crm-select"
                        value={editLinkForm.category}
                        onChange={(e) => setEditLinkForm((f) => ({ ...f, category: e.target.value, quantity: e.target.value }))}
                      >
                        {cats.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    );
                  }
                  return (
                    <input
                      type="text"
                      readOnly
                      disabled
                      value="Not Applicable"
                      className="crm-input is-disabled"
                      style={{
                        background: "#f8fafc",
                        color: "#94a3b8",
                        cursor: "not-allowed",
                        border: "1px solid #e2e8f0",
                      }}
                      title="This service does not require category selection"
                    />
                  );
                })()}
              </label>

              {/* Row 3: Industry, Amount, Payment Option */}
              <label className="crm-field">
                <span className="crm-label">Industry *</span>
                <select
                  className="crm-input crm-select"
                  value={editLinkForm.industry}
                  onChange={(e) => setEditLinkForm((f) => ({ ...f, industry: e.target.value }))}
                >
                  {CRM_INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span className="crm-label">Total amount ($ USD)</span>
                <div style={{ display: "flex", alignItems: "stretch", width: "100%" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 14px",
                      background: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      borderRight: "none",
                      borderTopLeftRadius: "6px",
                      borderBottomLeftRadius: "6px",
                      fontWeight: 700,
                      color: "#334155",
                      fontSize: "14px",
                      userSelect: "none",
                    }}
                  >
                    $
                  </span>
                  <input
                    className="crm-input"
                    type="text"
                    inputMode="decimal"
                    style={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                    value={editLinkForm.totalAmount}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9.]/g, "");
                      const parts = clean.split(".");
                      const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : clean;
                      setEditLinkForm((f) => ({ ...f, totalAmount: sanitized }));
                    }}
                    placeholder="0.00"
                    disabled={editingLink.status === "paid"}
                    required
                  />
                </div>
              </label>
              <label className="crm-field">
                <span className="crm-label">Payment option</span>
                <select
                  className="crm-input crm-select"
                  value={editLinkForm.paymentOption}
                  onChange={(e) => {
                    const opt = e.target.value as "full" | "partial";
                    setEditLinkForm((f) => ({ ...f, paymentOption: opt }));
                  }}
                  disabled={editingLink.status === "paid"}
                >
                  <option value="full">Full Payment (100% upfront)</option>
                  <option value="partial">50% Deposit (Partial Payment)</option>
                </select>
              </label>

              {/* Row 4: Billing Dates & Balance Due Date */}
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
              <label className="crm-field">
                <span className="crm-label">Tentative Balance Due Date</span>
                <input
                  type="date"
                  className="crm-input"
                  value={editLinkForm.balanceDueDate}
                  onChange={(e) => setEditLinkForm((f) => ({ ...f, balanceDueDate: e.target.value }))}
                />
              </label>

              {/* Row 5: Link Status & Notes */}
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
              <label className="crm-field crm-span-2">
                <span className="crm-label">Internal notes</span>
                <input
                  className="crm-input"
                  value={editLinkForm.notes}
                  onChange={(e) => setEditLinkForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Deliverables, agreement terms, or internal team notes"
                />
              </label>
            </div>

            {error && (
              <p className="crm-alert crm-alert-inset" style={{ marginTop: "10px" }}>
                {error}
              </p>
            )}

            <div className="crm-modal-foot">
              <button
                type="button"
                className="crm-act crm-act-ghost"
                onClick={() => setEditingLink(null)}
                disabled={busy}
              >
                Cancel
              </button>
              <span className="crm-modal-foot-end">
                <button
                  type="submit"
                  className="crm-act crm-act-dark"
                  disabled={busy}
                >
                  {busy ? "Saving…" : "Save Changes"}
                </button>
              </span>
            </div>
          </form>
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
                <select
                  className="crm-input crm-select"
                  value={form.service}
                  onChange={(e) => {
                    const srv = e.target.value;
                    const match = SERVICES_DATA.find((s) => s.service === srv);
                    const firstCat = match && match.categories.length > 0 ? match.categories[0] : "";
                    setForm((prev) => ({ ...prev, service: srv, category: firstCat }));
                  }}
                  required
                >
                  <option value="">Select Service...</option>
                  {SERVICES_DATA.map((s) => (
                    <option key={s.service} value={s.service}>{s.service}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                {err("service")}
              </label>

              <label className="crm-field">
                <span className="crm-label">Category / Scope</span>
                {(() => {
                  const match = SERVICES_DATA.find((s) => s.service === form.service);
                  if (match && match.categories.length > 0) {
                    return (
                      <select
                        className="crm-input crm-select"
                        value={form.category}
                        onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      >
                        {match.categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    );
                  }
                  return (
                    <input
                      className="crm-input"
                      value={form.category}
                      onChange={set("category")}
                      placeholder="Category or scope"
                    />
                  );
                })()}
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
                <span className="crm-label">Date &amp; time paid</span>
                <input className="crm-input" type="datetime-local" value={form.paidAt} onChange={set("paidAt")} />
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

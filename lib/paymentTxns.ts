import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { getPool } from "@/lib/db";
import { generateReceiptPdf } from "@/lib/pdfReceipt";
import { paymentDateTime } from "@/lib/paymentTime";
import type { LinkTable } from "@/lib/paymentLink";

/*
 * The PayPal transactions on one payment record (a website payment or a CRM
 * payment link): the deposit, the balance, or one full payment. They come from
 * payment_transactions; payments made before that table existed are read from
 * the record's activity history, or from the record itself.
 */

export type Txn = {
  kind: "full" | "deposit" | "balance";
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  transactionId: string | null;
  orderId: string | null;
  at: string; // ISO time
  note: string | null;
};

const iso = (v: unknown) => {
  const d = v instanceof Date ? v : new Date(String(v));
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export async function getRecord(table: LinkTable, id: number): Promise<RowDataPacket | null> {
  const [rows] = await getPool()
    .query<RowDataPacket[]>(`SELECT * FROM \`${table}\` WHERE id = ? LIMIT 1`, [id])
    .catch(() => [[] as RowDataPacket[]]);
  return rows[0] || null;
}

export async function listTransactions(table: LinkTable, id: number, rec?: RowDataPacket | null): Promise<Txn[]> {
  const pool = getPool();
  const [rows] = await pool
    .query<RowDataPacket[]>(
      "SELECT kind, amount, currency, status, transaction_id, paypal_order_id, note, created_at FROM payment_transactions WHERE record_table = ? AND record_id = ? ORDER BY created_at, id",
      [table, id]
    )
    .catch(() => [[] as RowDataPacket[]]);
  if (rows.length) {
    return rows.map((r) => ({
      kind: r.kind,
      amount: Number(r.amount),
      currency: r.currency || "USD",
      status: r.status,
      transactionId: r.transaction_id || null,
      orderId: r.paypal_order_id || null,
      at: iso(r.created_at),
      note: r.note || null,
    }));
  }

  const record = rec === undefined ? await getRecord(table, id) : rec;
  if (!record) return [];

  // older payments: the PayPal results kept in the record's history
  const entity = table === "payment_links" ? "payment_link" : "payment";
  const [acts] = await pool
    .query<RowDataPacket[]>(
      "SELECT action, new_value, message, meta, created_at FROM crm_activity WHERE entity_type = ? AND entity_source = '' AND entity_id = ? AND action IN ('payment', 'payment_failed') AND actor_type = 'gateway' ORDER BY created_at, id",
      [entity, id]
    )
    .catch(() => [[] as RowDataPacket[]]);
  const total = Number(record.total_amount || record.amount || 0);
  let paidSoFar = 0;
  const fromHistory: Txn[] = acts.map((a) => {
    let meta: Record<string, string> = {};
    try {
      meta = JSON.parse(String(a.meta || "{}"));
    } catch {}
    const amount = Number(String(a.new_value || "").replace(/[^0-9.]/g, "")) || 0;
    const msg = String(a.message || "");
    const status: Txn["status"] = a.action === "payment_failed" ? "failed" : /pending/i.test(msg) ? "pending" : "paid";
    const kind: Txn["kind"] = /^Balance payment/i.test(msg) ? "balance" : status !== "failed" && paidSoFar === 0 && amount < total ? "deposit" : "full";
    if (status !== "failed") paidSoFar += amount;
    return { kind, amount, currency: record.currency || "USD", status, transactionId: meta.captureId || null, orderId: meta.orderId || null, at: iso(a.created_at), note: null };
  });
  if (fromHistory.length) return fromHistory;

  if (Number(record.amount || 0) <= 0) return [];
  // no history either: what the record itself says
  const refs = String(record.reference || "")
    .split("|")
    .map((x) => x.replace(/^(Initial|Balance):/i, "").trim())
    .filter(Boolean);
  const twoPayments = refs.length > 1;
  const out: Txn[] = [];
  if (twoPayments) {
    out.push({ kind: "deposit", amount: 0, currency: record.currency || "USD", status: "paid", transactionId: /^\d+(\.\d+)?$/.test(refs[0]) ? null : refs[0], orderId: null, at: iso(record.created_at), note: "Amount not recorded" });
  }
  out.push({
    kind: twoPayments ? "balance" : record.payment_type === "partial" ? "deposit" : "full",
    amount: twoPayments ? 0 : Number(record.amount),
    currency: record.currency || "USD",
    status: record.status === "pending" ? "pending" : "paid",
    transactionId: refs[refs.length - 1] || record.paypal_order_id || null,
    orderId: record.paypal_order_id || null,
    at: iso(record.paid_at || record.created_at),
    note: twoPayments ? "Amount not recorded" : null,
  });
  return out;
}

/** The order number the client sees */
export const orderNumberOf = (r: RowDataPacket) =>
  r.invoice_number || `QS-${new Date(r.created_at || Date.now()).getFullYear()}-${String(r.id).padStart(6, "0")}`;

/**
 * The PDF receipt for a record as it stands now: a deposit receipt while a
 * balance is due, a balance receipt (deposit + balance) once a part-paid order
 * is complete, otherwise a full-payment receipt.
 */
export async function receiptPdfFor(table: LinkTable, rec: RowDataPacket, txns?: Txn[]): Promise<Buffer> {
  const list = (txns || (await listTransactions(table, Number(rec.id), rec))).filter((t) => t.status !== "failed");
  const last = list[list.length - 1];
  const earlier = list.slice(0, -1);
  const total = Number(rec.total_amount || rec.amount || 0);
  const paidTotal = Number(rec.amount || 0);
  const isPartial = rec.status === "partially_paid";
  const isBalance = !isPartial && earlier.length > 0 && last?.kind === "balance";
  const { date, time } = paymentDateTime(last ? new Date(last.at) : rec.paid_at || rec.created_at);
  const billingPeriod =
    rec.billing_start_date || rec.billing_end_date
      ? `${rec.billing_start_date ? ymd(rec.billing_start_date) : "—"} to ${rec.billing_end_date ? ymd(rec.billing_end_date) : "—"}`
      : null;
  const earlierPaid = earlier.reduce((a, t) => a + t.amount, 0) || (isBalance ? Math.max(0, paidTotal - (last?.amount || 0)) : 0);
  return generateReceiptPdf({
    orderNumber: orderNumberOf(rec),
    clientName: rec.client_name || "Valued Client",
    clientEmail: rec.client_email || "",
    clientPhone: rec.client_phone || null,
    companyName: rec.company_name || null,
    service: rec.service || "Quickupp Softech Services",
    category: rec.category || rec.quantity || null,
    amountPaid: isBalance ? last?.amount || 0 : isPartial ? paidTotal : last?.amount || paidTotal,
    totalAmount: total,
    paymentType: isPartial ? "partial" : "full",
    paymentStatus: rec.status === "pending" ? "pending" : isPartial ? "partially_paid" : "paid",
    remainingAmount: isPartial ? Number(rec.remaining_amount || Math.max(0, total - paidTotal)) : 0,
    earlierPaid: isBalance ? earlierPaid : 0,
    earlierTransactionId: isBalance ? earlier.map((t) => t.transactionId).filter(Boolean).join(", ") || null : null,
    transactionId: last?.transactionId || rec.reference || rec.paypal_order_id || "N/A",
    paymentDate: date,
    paymentTime: time,
    billingPeriod,
  });
}

function ymd(v: unknown) {
  if (v instanceof Date) return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, "0")}-${String(v.getDate()).padStart(2, "0")}`;
  return String(v).slice(0, 10);
}

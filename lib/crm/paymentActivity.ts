import "server-only";
import { getPool } from "@/lib/db";
import { isEnquirySource } from "@/lib/crm/leadOptions";
import { toDateOnly } from "@/lib/crm/data";
import { diffActivities, listActivity, logMany, money, type ActivityEntity, type ActivityInput, type Actor, type FieldDef } from "@/lib/crm/activity";

/* Activity history for payments (payments table) and payment links (payment_links table) */

export type PaymentTable = "payments" | "payment_links";
export const entityOf = (table: string): ActivityEntity => (table === "payment_links" ? "payment_link" : "payment");

export type PaymentSnapshot = {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  companyName: string;
  service: string;
  category: string;
  industry: string;
  description: string;
  totalAmount: string;
  amount: string;
  remainingAmount: string;
  paymentType: string;
  status: string;
  linkStatus: string;
  method: string;
  reference: string;
  invoiceNumber: string;
  paidAt: string;
  billingStartDate: string;
  billingEndDate: string;
  balanceDueDate: string;
  notes: string;
  leadSource: string;
  leadId: string;
};

const s = (v: unknown) => (v === null || v === undefined ? "" : v instanceof Date ? toDateOnly(v) : String(v));
const num = (v: unknown) => (v === null || v === undefined || v === "" ? "" : Number(v).toFixed(2));
const day = (v: unknown) => (v ? toDateOnly(v) : "");

export async function paymentSnapshot(table: PaymentTable, id: number): Promise<PaymentSnapshot | null> {
  try {
    const [rows] = await getPool().query(`SELECT * FROM \`${table}\` WHERE id = ? LIMIT 1`, [id]);
    const r = (rows as Record<string, unknown>[])[0];
    if (!r) return null;
    return {
      clientName: s(r.client_name),
      clientEmail: s(r.client_email),
      clientPhone: s(r.client_phone),
      companyName: s(r.company_name),
      service: s(r.service),
      category: s(r.category || r.quantity),
      industry: s(r.industry),
      description: s(r.description),
      totalAmount: num(r.total_amount ?? r.amount),
      amount: num(r.amount),
      remainingAmount: num(r.remaining_amount),
      paymentType: s(r.payment_type) || "full",
      status: s(r.status),
      linkStatus: s(r.link_status),
      method: s(r.method),
      reference: s(r.reference),
      invoiceNumber: s(r.invoice_number),
      paidAt: day(r.paid_at),
      billingStartDate: day(r.billing_start_date),
      billingEndDate: day(r.billing_end_date),
      balanceDueDate: day(r.balance_due_date),
      notes: s(r.notes),
      leadSource: s(r.lead_source),
      leadId: s(r.lead_id),
    };
  } catch {
    return null;
  }
}

const STATUS: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  partially_paid: "Partially Paid",
  refunded: "Refunded",
  failed: "Failed",
};
export const statusLabel = (v: string) => STATUS[v] || (v ? v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—");
const typeLabel = (v: string) => (v === "partial" ? "Partial" : "Full");
const linkLabel = (v: string) => (v === "cancelled" ? "Deactivated" : v ? v.charAt(0).toUpperCase() + v.slice(1) : "—");

const FIELDS: FieldDef<PaymentSnapshot>[] = [
  { key: "clientName", label: "Customer name" },
  { key: "clientEmail", label: "Customer email" },
  { key: "clientPhone", label: "Customer mobile number" },
  { key: "companyName", label: "Company" },
  { key: "service", label: "Service" },
  { key: "category", label: "Category" },
  { key: "industry", label: "Industry" },
  { key: "method", label: "Payment method" },
  { key: "reference", label: "Transaction reference" },
  { key: "invoiceNumber", label: "Invoice number" },
  { key: "paidAt", label: "Payment date" },
  { key: "billingStartDate", label: "Billing start date" },
  { key: "billingEndDate", label: "Billing end date" },
  { key: "balanceDueDate", label: "Balance due date" },
  { key: "notes", label: "Notes" },
];

/** Status, amounts, type and link status as their own entries, then the other fields */
export async function logPaymentChanges(table: PaymentTable, id: number, before: PaymentSnapshot, after: PaymentSnapshot, actor: Actor) {
  const base = { entity: entityOf(table), id, actor };
  const items: ActivityInput[] = [];
  const subject = table === "payment_links" ? "Payment link" : "Payment";
  if (before.status !== after.status) {
    items.push({ ...base, action: "status", field: "status", oldValue: statusLabel(before.status), newValue: statusLabel(after.status), text: `Payment status changed from ${statusLabel(before.status)} to ${statusLabel(after.status)}` });
  }
  if (before.totalAmount !== after.totalAmount) {
    items.push({ ...base, action: "amount", field: "totalAmount", oldValue: money(before.totalAmount), newValue: money(after.totalAmount), text: `Payment amount changed from ${money(before.totalAmount)} to ${money(after.totalAmount)}` });
  }
  if (before.amount !== after.amount) {
    items.push({ ...base, action: "amount_paid", field: "amount", oldValue: money(before.amount), newValue: money(after.amount), text: `Amount received changed from ${money(before.amount)} to ${money(after.amount)}` });
  }
  if (before.remainingAmount !== after.remainingAmount) {
    items.push({ ...base, action: "balance", field: "remainingAmount", oldValue: money(before.remainingAmount), newValue: money(after.remainingAmount), text: `Remaining balance updated from ${money(before.remainingAmount)} to ${money(after.remainingAmount)}` });
  }
  if (before.paymentType !== after.paymentType) {
    items.push({ ...base, action: "payment_type", field: "paymentType", oldValue: typeLabel(before.paymentType), newValue: typeLabel(after.paymentType), text: `Payment type changed from ${typeLabel(before.paymentType)} to ${typeLabel(after.paymentType)} payment` });
  }
  if (before.linkStatus !== after.linkStatus && (before.linkStatus || after.linkStatus)) {
    items.push({ ...base, action: "link_status", field: "linkStatus", oldValue: linkLabel(before.linkStatus), newValue: linkLabel(after.linkStatus), text: `${subject} status changed from ${linkLabel(before.linkStatus)} to ${linkLabel(after.linkStatus)}` });
  }
  items.push(...diffActivities(before, after, FIELDS, base, subject));
  await logMany(items);
  return items.length;
}

/** Also note it on the lead the payment link was made from, if any */
export function leadEcho(snap: Pick<PaymentSnapshot, "leadSource" | "leadId"> | null, item: Omit<ActivityInput, "entity" | "source" | "id">): ActivityInput | null {
  const id = Number(snap?.leadId);
  if (!snap || !isEnquirySource(snap.leadSource) || !Number.isInteger(id) || id < 1) return null;
  return { ...item, entity: "lead", source: snap.leadSource, id, eventKey: item.eventKey ? `${item.eventKey}:lead` : null };
}

/**
 * A PayPal result (captured, pending or failed) for a payment or payment link.
 * Keyed by the PayPal reference so the same event is never recorded twice.
 */
export async function logGatewayResult(opts: {
  table: PaymentTable;
  id: number;
  before: PaymentSnapshot | null;
  status: "paid" | "partially_paid" | "pending" | "failed";
  amount: number;
  captureId: string;
  orderId: string;
  orderNumber: string;
  isNewWebsitePayment: boolean;
  isBalancePayment: boolean;
  reason?: string;
}) {
  const actor: Actor = { type: "gateway", label: "PayPal" };
  const after = await paymentSnapshot(opts.table, opts.id);
  const base = { entity: entityOf(opts.table), id: opts.id, actor };
  const key = `paypal:${opts.captureId || opts.orderId}`;
  const amt = money(opts.amount);
  const items: ActivityInput[] = [];

  let headline: string;
  if (opts.status === "failed") headline = `Payment of ${amt} through PayPal failed${opts.reason ? `: ${opts.reason}` : ""}`;
  else if (opts.status === "pending") headline = `Payment of ${amt} received through PayPal and is pending clearing (Ref: ${opts.captureId})`;
  else if (opts.isBalancePayment) headline = `Balance payment of ${amt} confirmed through PayPal (Ref: ${opts.captureId})`;
  else if (opts.isNewWebsitePayment) headline = `Website payment of ${amt} confirmed through PayPal (Ref: ${opts.captureId})`;
  else headline = `Payment of ${amt} confirmed through PayPal (Ref: ${opts.captureId})`;

  items.push({ ...base, action: opts.status === "failed" ? "payment_failed" : "payment", newValue: amt, text: headline, eventKey: `${key}:${opts.status}`, meta: { captureId: opts.captureId, orderId: opts.orderId, orderNumber: opts.orderNumber } });

  if (opts.before && after) {
    if (opts.before.status !== after.status) {
      items.push({ ...base, action: "status", field: "status", oldValue: statusLabel(opts.before.status), newValue: statusLabel(after.status), text: `Payment status changed from ${statusLabel(opts.before.status)} to ${statusLabel(after.status)}`, eventKey: `${key}:status` });
    }
    if (opts.before.remainingAmount !== after.remainingAmount) {
      items.push({ ...base, action: "balance", field: "remainingAmount", oldValue: money(opts.before.remainingAmount), newValue: money(after.remainingAmount), text: `Remaining balance updated from ${money(opts.before.remainingAmount)} to ${money(after.remainingAmount)}`, eventKey: `${key}:balance` });
    }
  }

  const echo = leadEcho(after || opts.before, {
    action: opts.status === "failed" ? "payment_failed" : "payment",
    newValue: amt,
    text: opts.status === "failed"
      ? `Payment of ${amt} for ${opts.orderNumber} through PayPal failed`
      : `Payment of ${amt} for ${opts.orderNumber} ${opts.status === "pending" ? "received (pending clearing)" : "confirmed"} through PayPal`,
    actor,
    eventKey: `${key}:${opts.status}`,
  });
  if (echo) items.push(echo);
  await logMany(items);
}

export async function paymentHistory(source: string, id: number) {
  // source: the record's table (payment_link = payment_links). A link and a payment can share an id,
  // so one record's history never falls back to the other table's.
  const table: PaymentTable = source === "payment_link" ? "payment_links" : "payments";
  return listActivity(entityOf(table), id);
}

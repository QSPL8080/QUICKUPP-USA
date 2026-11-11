import "server-only";
import { CURRENCIES, PAYMENT_STATUSES } from "@/lib/crm/data";

/* Validation for manual payment entries (create and edit) */

export type PaymentInput = {
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  companyName: string | null;
  category: string | null;
  service: string;
  description: string | null;
  amount: number;
  totalAmount: number | null;
  paymentType: "full" | "partial";
  remainingAmount: number | null;
  currency: string;
  method: string;
  status: string;
  reference: string | null;
  invoiceNumber: string | null;
  /** when the payment was received (date and time) */
  paidAt: Date | null;
  notes: string | null;
};

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The payment's date and time. The CRM form sends a full time (ISO, from the
 * admin's own clock); a bare "YYYY-MM-DD" from older screens means that day.
 */
function parsePaidAt(raw: string): Date | null {
  if (!raw) return null;
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (day) {
    const d = new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw)) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function validatePayment(body: Record<string, unknown>):
  | { ok: true; data: PaymentInput }
  | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const clientName = text(body.clientName, 150);
  const clientEmail = text(body.clientEmail, 190).toLowerCase();
  const clientPhone = text(body.clientPhone, 50);
  const companyName = text(body.companyName, 190);
  const rawCat = Array.isArray(body.category)
    ? body.category.filter(Boolean).join(", ")
    : body.category;
  const category = text(rawCat, 500);
  const service = text(body.service, 150);
  const description = text(body.description, 255);
  const amountRaw = typeof body.amount === "number" ? String(body.amount) : text(body.amount, 20).replace(/,/g, "");
  const amount = Number(amountRaw);
  const totalAmountRaw = typeof body.totalAmount === "number" ? String(body.totalAmount) : text(body.totalAmount, 20).replace(/,/g, "");
  const totalAmount = totalAmountRaw ? Number(totalAmountRaw) : null;
  const paymentType = body.paymentType === "partial" ? "partial" : "full";
  const remainingAmountRaw = typeof body.remainingAmount === "number" ? String(body.remainingAmount) : text(body.remainingAmount, 20).replace(/,/g, "");
  const remainingAmount = remainingAmountRaw ? Number(remainingAmountRaw) : null;
  const currency = text(body.currency, 3).toUpperCase();
  const method = text(body.method, 40);
  const status = text(body.status, 20);
  const reference = text(body.reference, 120);
  const invoiceNumber = text(body.invoiceNumber, 60);
  const paidAtRaw = text(body.paidAt, 40);
  const paidAt = parsePaidAt(paidAtRaw);
  const notes = text(body.notes, 2000);

  if (!clientName) errors.clientName = "Enter the client's name.";
  if (clientEmail && !EMAIL_RE.test(clientEmail)) errors.clientEmail = "Enter a valid email address.";
  if (!service) errors.service = "Enter or choose a service.";
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(amountRaw) || !(amount > 0)) errors.amount = "Enter an amount greater than 0 (up to 2 decimals).";
  if (!(CURRENCIES as readonly string[]).includes(currency)) errors.currency = "Choose a currency.";
  if (!method) errors.method = "Choose a payment method.";
  if (!(PAYMENT_STATUSES as readonly string[]).includes(status)) errors.status = "Choose a status.";
  if (paidAtRaw && !paidAt) errors.paidAt = "Enter a valid date and time.";
  if ((status === "paid" || status === "partially_paid") && !paidAt) errors.paidAt = "Enter the date and time the payment was received.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      clientName,
      clientEmail: clientEmail || null,
      clientPhone: clientPhone || null,
      companyName: companyName || null,
      category: category || null,
      service,
      description: description || null,
      amount: Math.round(amount * 100) / 100,
      totalAmount: totalAmount != null ? Math.round(totalAmount * 100) / 100 : null,
      paymentType,
      remainingAmount: remainingAmount != null ? Math.round(remainingAmount * 100) / 100 : null,
      currency,
      method,
      status,
      reference: reference || null,
      invoiceNumber: invoiceNumber || null,
      paidAt: paidAt || null,
      notes: notes || null,
    },
  };
}

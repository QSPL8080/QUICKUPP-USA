import "server-only";
import { CURRENCIES, PAYMENT_METHODS, PAYMENT_SERVICES, PAYMENT_STATUSES } from "@/lib/crm/data";

/* Validation for manual payment entries (create and edit) */

export type PaymentInput = {
  clientName: string;
  clientEmail: string | null;
  companyName: string | null;
  service: string;
  description: string | null;
  amount: number;
  currency: string;
  method: string;
  status: string;
  reference: string | null;
  invoiceNumber: string | null;
  paidAt: string | null;
  notes: string | null;
};

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validatePayment(body: Record<string, unknown>):
  | { ok: true; data: PaymentInput }
  | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const clientName = text(body.clientName, 150);
  const clientEmail = text(body.clientEmail, 190).toLowerCase();
  const companyName = text(body.companyName, 190);
  const service = text(body.service, 150);
  const description = text(body.description, 255);
  const amountRaw = typeof body.amount === "number" ? String(body.amount) : text(body.amount, 20).replace(/,/g, "");
  const amount = Number(amountRaw);
  const currency = text(body.currency, 3).toUpperCase();
  const method = text(body.method, 40);
  const status = text(body.status, 20);
  const reference = text(body.reference, 120);
  const invoiceNumber = text(body.invoiceNumber, 60);
  const paidAt = text(body.paidAt, 10);
  const notes = text(body.notes, 2000);

  if (!clientName) errors.clientName = "Enter the client's name.";
  if (clientEmail && !EMAIL_RE.test(clientEmail)) errors.clientEmail = "Enter a valid email address.";
  if (!(PAYMENT_SERVICES as readonly string[]).includes(service)) errors.service = "Choose a service.";
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(amountRaw) || !(amount > 0)) errors.amount = "Enter an amount greater than 0 (up to 2 decimals).";
  if (!(CURRENCIES as readonly string[]).includes(currency)) errors.currency = "Choose a currency.";
  if (!(PAYMENT_METHODS as readonly string[]).includes(method)) errors.method = "Choose a payment method.";
  if (!(PAYMENT_STATUSES as readonly string[]).includes(status)) errors.status = "Choose a status.";
  if (paidAt && (!/^\d{4}-\d{2}-\d{2}$/.test(paidAt) || Number.isNaN(Date.parse(paidAt)))) errors.paidAt = "Enter a valid date.";
  if ((status === "paid" || status === "partially_paid") && !paidAt) errors.paidAt = "Enter the date the payment was received.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      clientName,
      clientEmail: clientEmail || null,
      companyName: companyName || null,
      service,
      description: description || null,
      amount: Math.round(amount * 100) / 100,
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

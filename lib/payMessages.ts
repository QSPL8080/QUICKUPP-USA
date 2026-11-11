import { payLinkUrl } from "@/lib/siteUrl";

/*
 * The WhatsApp messages the CRM sends a client: a new payment link, or (after
 * a deposit) the balance link. Used by the Payments tab and the lead panel,
 * so the client gets the same text from both.
 */

export type PayMessageInput = {
  clientName: string;
  service?: string | null;
  quantity?: string | null;
  category?: string | null;
  amount?: number | null; // paid so far
  totalAmount?: number | null;
  remainingAmount?: number | null;
  paymentType?: string | null; // "partial": the client may pay a 50% deposit first
  status?: string | null;
  token?: string | null;
  invoiceNumber?: string | null;
  id?: number | null;
  balanceDueDate?: string | null;
  billingEndDate?: string | null;
};

const usd = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
const SIGN = `If you have any questions, just reply here or email info@quickuppsoftech.us.

Thank you,
Quickupp Softech LLC
www.quickuppsoftech.us`;

export function payMessage(p: PayMessageInput): string {
  const url = p.token ? payLinkUrl(p.token) : "";
  const first = (p.clientName || "").trim().split(/\s+/)[0] || "there";
  const tot = Number(p.totalAmount || p.amount || 0);
  const paid = Number(p.amount || 0);
  const remaining = Number(p.remainingAmount != null ? p.remainingAmount : tot - paid);
  const order = p.invoiceNumber ? `#${p.invoiceNumber}` : p.id ? `#QS-${p.id}` : "";
  const scope = p.quantity || p.category || "";
  const service = p.service || "your service";

  if (p.status === "partially_paid" && remaining > 0) {
    const dueRaw = p.balanceDueDate || (p.billingEndDate ? p.billingEndDate.slice(0, 10) : "");
    const due = /^\d{4}-\d{2}-\d{2}$/.test(dueRaw)
      ? new Date(`${dueRaw}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "";
    return `Hi ${first},

Thank you for your deposit for ${service}${order ? ` (order ${order})` : ""}.

Total: ${usd(tot)}
Paid so far: ${usd(paid)}
Balance due: ${usd(remaining)}${due ? `\nDue by: ${due}` : ""}

You can pay the balance securely by PayPal or debit/credit card with your balance link:
${url}

${SIGN}`;
  }

  const half = Math.round(tot * 50) / 100;
  return `Hi ${first},

Thank you for choosing Quickupp Softech LLC! Here is your secure payment link.

${order ? `Order: ${order}\n` : ""}Service: ${service}${scope && scope !== "Not Applicable" ? `\nPackage: ${scope}` : ""}
Total: ${usd(tot)}${p.paymentType === "partial" ? `\n\nYou can pay the full amount, or a 50% deposit of ${usd(half)} now and the remaining ${usd(Math.round((tot - half) * 100) / 100)} later.` : ""}

Pay securely by PayPal or debit/credit card:
${url}

${SIGN}`;
}

/** A phone number as WhatsApp wants it: digits with the country code (+1 for a 10-digit US number) */
export function whatsAppNumber(raw?: string | null): string {
  const s = String(raw || "").trim();
  const digits = s.replace(/\D/g, "");
  if (!digits) return "";
  if (s.startsWith("+") || s.startsWith("00")) return digits.replace(/^00/, "");
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

/** The WhatsApp chat with the message filled in (to the client's number when there is one) */
export function whatsAppUrl(phone: string | null | undefined, message: string): string {
  const n = whatsAppNumber(phone);
  return n ? `https://api.whatsapp.com/send?phone=${n}&text=${encodeURIComponent(message)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

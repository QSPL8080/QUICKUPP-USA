import { payLinkUrl } from "@/lib/siteUrl";

/*
 * The messages the CRM sends a client with a payment link, or (after a
 * deposit) the balance link: WhatsApp / text (SMS), and email. Used by the
 * Payments tab and the lead panel, so the client gets the same text from both.
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

/** The client's name as the messages greet them */
const greetName = (p: PayMessageInput) => (p.clientName || "").trim().replace(/\s+/g, " ") || "there";

/** After a deposit: the balance still due (0 when nothing is due) */
function balanceOf(p: PayMessageInput) {
  const tot = Number(p.totalAmount || p.amount || 0);
  const paid = Number(p.amount || 0);
  const remaining = Number(p.remainingAmount != null ? p.remainingAmount : tot - paid);
  if (p.status !== "partially_paid" || remaining <= 0) return null;
  const dueRaw = p.balanceDueDate || (p.billingEndDate ? p.billingEndDate.slice(0, 10) : "");
  const due = /^\d{4}-\d{2}-\d{2}$/.test(dueRaw)
    ? new Date(`${dueRaw}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";
  return { tot, paid, remaining, due };
}

/** WhatsApp and text (SMS) message for a payment link, or the balance link after a deposit */
export function payMessage(p: PayMessageInput): string {
  const url = p.token ? payLinkUrl(p.token) : "";
  const bal = balanceOf(p);
  if (bal) {
    return `Hi ${greetName(p)},
Thank you for your deposit. Please use the secure payment link below to pay the remaining balance:
Total: ${usd(bal.tot)}
Paid so far: ${usd(bal.paid)}
Balance due: ${usd(bal.remaining)}${bal.due ? `\nDue by: ${bal.due}` : ""}
Payment Link:
${url}
Once the payment is successfully processed, it will be automatically reflected in our system, and your payment receipt will be sent to your registered email address.
Thank you for choosing Quickupp Softech. We appreciate your business.
Best regards,
Team Quickupp Softech`;
  }
  return `Hi ${greetName(p)},
Please use the secure payment link below to complete your payment:
Payment Link:
${url}
Once the payment is successfully processed, it will be automatically reflected in our system, and your payment receipt will be sent to your registered email address.
Thank you for choosing Quickupp Softech. We appreciate your business.
Best regards,
Team Quickupp Softech`;
}

/** The email (subject and plain-text body) for sharing a payment link, or the balance link after a deposit */
export function payEmail(p: PayMessageInput): { subject: string; body: string } {
  const url = p.token ? payLinkUrl(p.token) : "";
  const bal = balanceOf(p);
  const sign = `Should you have any questions or require assistance with the payment, please feel free to reach out.
Thank you for choosing Quickupp Softech. We appreciate your business and look forward to working with you.
Best regards,
Finance & Accounts Team
Quickupp Softech LLC`;
  if (bal) {
    return {
      subject: "Balance Payment Link – Quickupp Softech",
      body: `Hi ${greetName(p)},
Thank you for your deposit. Please find below the secure payment link to pay the remaining balance to Quickupp Softech.

Total: ${usd(bal.tot)}
Paid so far: ${usd(bal.paid)}
Balance due: ${usd(bal.remaining)}${bal.due ? `\nDue by: ${bal.due}` : ""}

Payment Link:
${url}

Once the payment has been successfully processed, the transaction will be automatically reflected in our system, and your payment receipt will be sent to your registered email address.
${sign}`,
    };
  }
  return {
    subject: "Payment Link – Quickupp Softech",
    body: `Hi ${greetName(p)},
Please find below the secure payment link to complete your payment to Quickupp Softech.

Payment Link:
${url}

Once the payment has been successfully processed, the transaction will be automatically reflected in our system, and your payment receipt will be sent to your registered email address.
${sign}`,
  };
}

/** A text message (SMS) to the client with the message filled in */
export function smsUrl(phone: string | null | undefined, message: string): string {
  const n = whatsAppNumber(phone);
  return `sms:${n ? `+${n}` : ""}?body=${encodeURIComponent(message)}`;
}

/** The client's email app with the subject and message filled in */
export function mailtoUrl(email: string | null | undefined, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(String(email || "").trim()).replace(/%40/g, "@")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\r?\n/g, "\r\n"))}`;
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

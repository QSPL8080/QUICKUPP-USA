import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { sendMailDetailed } from "@/lib/mailer";
import { logActivity, type Actor } from "@/lib/crm/activity";
import { entityOf } from "@/lib/crm/paymentActivity";
import { clientEmail, type PaymentCase, type PaymentMailContext } from "@/lib/paymentEmails";
import type { LinkTable } from "@/lib/paymentLink";
import { listTransactions, orderNumberOf, receiptPdfFor, type Txn } from "@/lib/paymentTxns";
import { SITE_URL } from "@/lib/siteUrl";

/*
 * The client's payment email with the PDF receipt, for every payment: website
 * Pay Now, CRM payment links and balance links alike. If the PDF can't be made
 * the email still goes, with the download button. The outcome is written on the
 * payment's history in the CRM, with the reason when it could not be sent.
 */

const WHAT: Record<PaymentCase, string> = {
  full: "Payment receipt",
  deposit: "Deposit receipt",
  balance: "Balance receipt",
  pending: "Payment-processing notice",
  failed: "Payment notice",
};

export async function sendClientReceipt(o: {
  table: LinkTable;
  ctx: PaymentMailContext;
  actor: Actor;
  /** one history entry per transaction for the automatic email */
  eventKey?: string;
}): Promise<{ ok: boolean; to: string; error?: string }> {
  const { table, ctx, actor } = o;
  const rec = ctx.rec;
  const id = Number(rec.id);
  const to = String(rec.client_email || "").trim();
  const what = WHAT[ctx.kind];
  const amount = `$${ctx.amount.toFixed(2)} ${ctx.currency}`;
  const log = (action: string, text: string) =>
    logActivity({ entity: entityOf(table), id, action, text, actor, eventKey: o.eventKey ? `${o.eventKey}:${action}` : null }).catch(() => undefined);

  if (!to.includes("@")) {
    await log("receipt_email_failed", `${what} for ${amount} could not be emailed: there is no client email address on this payment`);
    return { ok: false, to, error: "There is no client email address on this payment." };
  }

  let pdf: Buffer | null = null;
  let pdfError = "";
  try {
    pdf = await receiptPdfFor(table, rec, ctx.txns);
  } catch (err) {
    pdfError = err instanceof Error ? err.message : String(err);
    console.error("[payments] receipt PDF failed:", err);
  }

  let sent: { ok: boolean; error?: string };
  try {
    const c = clientEmail(ctx);
    sent = await sendMailDetailed({
      channel: "info",
      to,
      fromName: "Quickupp Softech LLC",
      subject: c.subject,
      html: c.html,
      text: c.text,
      attachments: pdf ? [{ filename: `Quickupp-Receipt-${orderNumberOf(rec)}.pdf`, content: pdf, contentType: "application/pdf" }] : [],
    });
  } catch (err) {
    sent = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  if (sent.ok) {
    await log(
      "receipt_email",
      pdf
        ? `${what} for ${amount} emailed to ${to} with the PDF receipt`
        : `${what} for ${amount} emailed to ${to} without the PDF attached (the PDF could not be made: ${pdfError.slice(0, 200)}); the email has the download button`,
    );
    return { ok: true, to };
  }
  await log("receipt_email_failed", `${what} for ${amount} could not be emailed to ${to}: ${sent.error || "unknown error"}`);
  return { ok: false, to, error: sent.error };
}

/** The email for the latest payment on a record, rebuilt from its saved transactions (for "Email receipt to client" in the CRM) */
export async function receiptContextFor(table: LinkTable, rec: RowDataPacket): Promise<PaymentMailContext | null> {
  const txns: Txn[] = await listTransactions(table, Number(rec.id), rec);
  const ok = txns.filter((t) => t.status !== "failed");
  const last = ok[ok.length - 1];
  if (!last) return null;
  const kind: PaymentCase = last.status === "pending" ? "pending" : last.kind;
  const token = String(rec.token || "");
  return {
    kind,
    rec,
    txns: ok,
    amount: last.amount,
    currency: last.currency || String(rec.currency || "USD"),
    transactionId: last.transactionId || String(rec.reference || rec.paypal_order_id || ""),
    source: table === "payment_links" ? (kind === "balance" ? "balance-link" : "link") : "website",
    balanceUrl: token && rec.status === "partially_paid" ? `${SITE_URL}/pay/${token}` : null,
    notes: null,
  };
}

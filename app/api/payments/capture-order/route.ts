import { NextResponse, after } from "next/server";
import { randomBytes } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { capturePayPalOrder } from "@/lib/paypal";
import { getPool } from "@/lib/db";
import { sendMail, LEADS_NOTIFICATION_EMAIL } from "@/lib/mailer";
import { entityOf, logGatewayResult, paymentSnapshot, type PaymentSnapshot } from "@/lib/crm/paymentActivity";
import { logActivity } from "@/lib/crm/activity";
import { errMessage } from "@/lib/err";
import { LINK_MESSAGES, chargeFor, findByToken, linkState, recordTransaction, type LinkTable } from "@/lib/paymentLink";
import { getRecord, listTransactions, orderNumberOf, receiptPdfFor } from "@/lib/paymentTxns";
import { clientEmail as clientEmailFor, teamEmail, type PaymentCase } from "@/lib/paymentEmails";
import { SITE_URL } from "@/lib/siteUrl";

/*
 * PayPal approved a payment: take the money (capture), save it on the
 * payment record, keep the transaction, and send the emails.
 *
 * - Pay link (/pay/<token>, a CRM payment link or a balance link): the
 *   record already exists. The first payment is the full amount or a 50%
 *   deposit; after a deposit the next one is the balance.
 * - Website Pay Now (/checkout): a new payment record.
 *
 * The same PayPal order is never saved twice (a double click or a retry gets
 * the first result back), and a failed attempt never changes a record.
 */

const SITE = SITE_URL;
const round2 = (v: number) => Math.round(v * 100) / 100;
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** A website deposit's balance due date: 10 days before the billing period ends, and at least 3 days away */
function websiteDueDate(billingEndDate: unknown): string {
  const soonest = new Date();
  soonest.setDate(soonest.getDate() + 3);
  const end = typeof billingEndDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(billingEndDate) ? new Date(`${billingEndDate}T00:00:00`) : null;
  if (end && !isNaN(end.getTime())) {
    end.setDate(end.getDate() - 10);
    if (end >= soonest) return ymd(end);
  }
  const twoWeeks = new Date();
  twoWeeks.setDate(twoWeeks.getDate() + 14);
  return ymd(twoWeeks);
}

/** The answer the pay pages get; the confirmation page is opened with the transaction ID */
async function answer(table: LinkTable, id: number, status: string, txnId: string) {
  const rec = await getRecord(table, id);
  return NextResponse.json({
    success: true,
    status,
    orderNumber: rec ? orderNumberOf(rec) : "",
    txn: txnId,
    captureID: txnId,
    remainingAmount: rec && rec.status === "partially_paid" ? Number(rec.remaining_amount || 0) : 0,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const orderID = body?.orderID ? String(body.orderID).slice(0, 64) : "";
    if (!orderID) return NextResponse.json({ error: "Missing orderID in request" }, { status: 400 });
    const pool = getPool();

    // 0. this PayPal order was already saved (double click, retry): give the same result back
    const [seen] = await pool
      .query<RowDataPacket[]>("SELECT record_table, record_id, status, transaction_id FROM payment_transactions WHERE paypal_order_id = ? AND status <> 'failed' LIMIT 1", [orderID])
      .catch(() => [[] as RowDataPacket[]]);
    if (seen.length) return answer(seen[0].record_table, Number(seen[0].record_id), seen[0].status, seen[0].transaction_id);

    // 1. a pay link: stop before taking money if it can no longer be paid; the amount comes from the record
    const token = body.token ? String(body.token) : "";
    const linked = token ? await findByToken(token) : null;
    if (token && !linked) return NextResponse.json({ error: "This payment link was not found." }, { status: 404 });
    let charge: ReturnType<typeof chargeFor> = null;
    if (linked) {
      const state = linkState(linked.row);
      if (state === "paid" || state === "expired" || state === "cancelled") {
        return NextResponse.json({ error: LINK_MESSAGES[state], state }, { status: 409 });
      }
      charge = chargeFor(linked.row, body.paymentType);
      if (!charge) return NextResponse.json({ error: "Nothing is due on this payment link." }, { status: 409 });
    }

    // 2. capture with PayPal
    let captureData: Awaited<ReturnType<typeof capturePayPalOrder>> | null = null;
    let captureError: unknown = null;
    try {
      captureData = await capturePayPalOrder(orderID);
    } catch (err) {
      captureError = err;
    }
    const capture = captureData?.purchase_units?.[0]?.payments?.captures?.[0];
    const txnId = String(capture?.id || orderID);
    const currency = String(capture?.amount?.currency_code || "USD");
    let status: "paid" | "pending" | "failed" = "failed";
    let failureReason = "";
    let pendingReason = "";
    if (captureError) {
      failureReason = errMessage(captureError) || "PayPal could not take the payment.";
    } else if (captureData?.status === "COMPLETED") {
      status = "paid";
    } else if (captureData?.status === "PENDING") {
      status = "pending";
      pendingReason = capture?.status_details?.reason || "Funds pending clearing in PayPal";
    } else {
      failureReason = captureData?.status_details?.reason || captureData?.message || `PayPal returned status: ${captureData?.status || "DECLINED"}`;
    }

    // what the client paid: PayPal's figure; the planned figure if PayPal sent none
    const website = !linked;
    const planned = charge ? charge.amount : Math.max(0, Number(body.amount) || 0);
    const paid = round2(Number(capture?.amount?.value) || planned);

    // 3. save it
    let table: LinkTable = linked ? linked.table : "payments";
    let id = linked ? Number(linked.row.id) : 0;
    let kind: "full" | "deposit" | "balance" = charge
      ? charge.type === "balance"
        ? "balance"
        : charge.type === "partial"
        ? "deposit"
        : "full"
      : body.paymentType === "partial"
      ? "deposit"
      : "full";
    let before: PaymentSnapshot | null = null;
    let balanceToken = linked ? String(linked.row.token || token) : "";

    if (linked && status !== "failed") {
      before = await paymentSnapshot(table, id);
      const r = linked.row;
      const total = round2(Number(r.total_amount) || charge!.total);
      if (kind === "balance") {
        const newPaid = round2(Number(r.amount || 0) + paid);
        const remaining = round2(Math.max(0, total - newPaid));
        await pool.query(
          `UPDATE \`${table}\` SET amount = ?, total_amount = ?, remaining_amount = ?, payment_type = ?, status = ?, link_status = ?,
             reference = CONCAT_WS(' | ', NULLIF(reference, ''), ?), paypal_order_id = ?, method = 'PayPal', paid_at = NOW() WHERE id = ?`,
          [
            newPaid,
            total,
            remaining,
            remaining > 0 ? "partial" : "full",
            status === "pending" ? "pending" : remaining > 0 ? "partially_paid" : "paid",
            remaining > 0 ? "active" : "used",
            txnId,
            orderID,
            id,
          ]
        );
      } else {
        const remaining = kind === "deposit" ? round2(Math.max(0, total - paid)) : 0;
        await pool.query(
          `UPDATE \`${table}\` SET amount = ?, total_amount = ?, remaining_amount = ?, payment_type = ?, status = ?, link_status = ?,
             reference = ?, paypal_order_id = ?, method = 'PayPal', paid_at = NOW() WHERE id = ?`,
          [
            paid,
            total,
            remaining,
            kind === "deposit" ? "partial" : "full",
            status === "pending" ? "pending" : kind === "deposit" ? "partially_paid" : "paid",
            kind === "deposit" ? "active" : "used",
            txnId,
            orderID,
            id,
          ]
        );
      }
    } else if (website && status !== "failed") {
      // a new website payment
      const isPartial = body.paymentType === "partial";
      const total = round2(Math.max(paid, Number(body.totalAmount) || paid));
      const remaining = isPartial ? round2(Math.max(0, total - paid)) : 0;
      kind = isPartial && remaining > 0 ? "deposit" : "full";
      const category = Array.isArray(body.category) ? body.category.filter(Boolean).join(", ") : String(body.category || "");
      const service = String(body.service || "Quickupp Softech Service").slice(0, 150);
      let desc = `Website PayPal Payment (${kind === "deposit" ? "Partial Deposit" : "Full Payment"}) - ${service}${category ? ` (${category})` : ""}`;
      if (desc.length > 255) desc = `${desc.slice(0, 252)}...`;
      balanceToken = kind === "deposit" ? randomBytes(16).toString("hex") : "";
      const [ins] = await pool.query<ResultSetHeader>(
        `INSERT INTO payments (client_name, client_email, client_phone, company_name, category, service, description, amount, total_amount, payment_type,
           remaining_amount, currency, method, status, link_status, source, reference, paypal_order_id, billing_start_date, billing_end_date,
           balance_due_date, token, paid_at, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PayPal', ?, ?, 'website', ?, ?, ?, ?, ?, ?, NOW(), ?)`,
        [
          String(body.clientName || "Valued Client").slice(0, 150),
          String(body.clientEmail || "").slice(0, 190) || null,
          String(body.clientPhone || "").slice(0, 50) || null,
          String(body.companyName || "").slice(0, 190) || null,
          category.slice(0, 1000) || null,
          service,
          desc,
          paid,
          total,
          kind === "deposit" ? "partial" : "full",
          remaining,
          currency,
          status === "pending" ? "pending" : kind === "deposit" ? "partially_paid" : "paid",
          kind === "deposit" ? "active" : "used",
          txnId,
          orderID,
          /^\d{4}-\d{2}-\d{2}$/.test(String(body.billingStartDate || "")) ? body.billingStartDate : null,
          /^\d{4}-\d{2}-\d{2}$/.test(String(body.billingEndDate || "")) ? body.billingEndDate : null,
          kind === "deposit" ? websiteDueDate(body.billingEndDate) : null,
          balanceToken || null,
          String(body.notes || "").slice(0, 2000) || null,
        ]
      );
      id = ins.insertId;
      table = "payments";
      await pool.query("UPDATE payments SET invoice_number = ? WHERE id = ?", [`QS-${new Date().getFullYear()}-${String(id).padStart(6, "0")}`, id]);
    }

    // the transaction and the history (a failed attempt on a pay link is kept on that link; a failed
    // website attempt has no record, the team is told by email)
    if (id) {
      await recordTransaction({ table, id, kind, amount: paid, currency, status, transactionId: txnId, orderId: orderID, note: failureReason || pendingReason || undefined });
      await logGatewayResult({
        table,
        id,
        before,
        status: status === "paid" ? (kind === "deposit" ? "partially_paid" : "paid") : status,
        amount: paid,
        captureId: txnId,
        orderId: orderID,
        orderNumber: linked ? orderNumberOf(linked.row) : `QS-${new Date().getFullYear()}-${String(id).padStart(6, "0")}`,
        isNewWebsitePayment: website,
        isBalancePayment: kind === "balance",
        reason: failureReason || pendingReason || undefined,
      });
    }

    // 4. emails (sent after the answer)
    const rec = id ? await getRecord(table, id) : null;
    const txns = rec ? await listTransactions(table, id, rec) : [];
    const mailCase: PaymentCase = status === "failed" ? "failed" : status === "pending" ? "pending" : kind;
    const source: "website" | "link" | "balance-link" = website ? "website" : kind === "balance" ? "balance-link" : "link";
    const balanceUrl = balanceToken && rec?.status === "partially_paid" ? `${SITE}/pay/${balanceToken}` : null;
    const attempted = {
      id: 0,
      client_name: body.clientName || "",
      client_email: body.clientEmail || "",
      client_phone: body.clientPhone || "",
      company_name: body.companyName || "",
      service: body.service || "",
      category: Array.isArray(body.category) ? body.category.join(", ") : body.category || "",
      total_amount: Number(body.totalAmount) || paid,
      amount: 0,
      status: "failed",
      invoice_number: "not created (payment failed)",
      created_at: new Date(),
    } as unknown as RowDataPacket;
    const ctx = {
      kind: mailCase,
      rec: rec || attempted,
      txns,
      amount: paid,
      currency,
      transactionId: txnId,
      source,
      balanceUrl,
      failureReason: failureReason || undefined,
      notes: website ? String(body.notes || "") || null : null,
    };

    after(async () => {
      try {
        const t = teamEmail(ctx);
        await sendMail({ channel: "info", to: LEADS_NOTIFICATION_EMAIL, subject: t.subject, html: t.html, text: t.text, replyTo: ctx.rec.client_email || undefined });
      } catch (err) {
        console.error("[payments] team email failed:", err);
      }
      const to = String(ctx.rec.client_email || "");
      if (!rec || status === "failed" || !to.includes("@")) return;
      try {
        const c = clientEmailFor(ctx);
        const pdf = await receiptPdfFor(table, rec, txns);
        const sent = await sendMail({
          channel: "info",
          to,
          fromName: "Quickupp Softech LLC",
          subject: c.subject,
          html: c.html,
          text: c.text,
          attachments: [{ filename: `Quickupp-Receipt-${orderNumberOf(rec)}.pdf`, content: pdf, contentType: "application/pdf" }],
        });
        const what = mailCase === "deposit" ? "Deposit receipt" : mailCase === "balance" ? "Balance receipt" : mailCase === "pending" ? "Payment-processing notice" : "Payment receipt";
        await logActivity({
          entity: entityOf(table),
          id,
          action: sent ? "receipt_email" : "receipt_email_failed",
          text: sent
            ? `${what} for $${paid.toFixed(2)} ${currency} emailed to ${to} with the PDF receipt`
            : `${what} for $${paid.toFixed(2)} ${currency} could not be emailed to ${to} (mail server not available)`,
          actor: { type: "system", label: "Email" },
          eventKey: `receipt:${txnId}`,
        });
      } catch (err) {
        console.error("[payments] client email failed:", err);
      }
    });

    // 5. answer the pay page
    if (status === "failed") {
      return NextResponse.json({
        success: false,
        status: "failed",
        error: "The payment was declined or could not be completed. No money was taken. Please try again or use a different card or PayPal account.",
      });
    }
    return answer(table, id, status, txnId);
  } catch (err) {
    console.error("[Capture Order API Fatal Error]", err);
    return NextResponse.json({ error: errMessage(err) || "An unexpected error occurred while capturing payment." }, { status: 500 });
  }
}

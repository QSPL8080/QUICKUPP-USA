import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { verifyPayUCallbackHash } from "@/lib/payu";
import { findByToken, recordTransaction, type LinkTable } from "@/lib/paymentLink";
import { getRecord, listTransactions, orderNumberOf } from "@/lib/paymentTxns";
import { teamEmail, type PaymentCase } from "@/lib/paymentEmails";
import { sendClientReceipt } from "@/lib/clientReceipt";
import { sendMail, LEADS_NOTIFICATION_EMAIL } from "@/lib/mailer";
import { convertLeadToClient } from "@/lib/crm/clients";
import { SITE_URL } from "@/lib/siteUrl";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((val, key) => {
      data[key] = String(val);
    });

    const txnid = (data.txnid || "").trim();
    const status = (data.status || "").trim().toLowerCase();
    const amount = Number(data.amount || 0);
    const mihpayid = data.mihpayid || txnid;
    const errorMessage = data.error_Message || data.unmappedstatus || "Payment could not be processed by PayU.";

    const isValidHash = verifyPayUCallbackHash(data);
    if (!isValidHash) {
      console.error("[PayU Callback Hash Mismatch]", { data });
      return NextResponse.redirect(
        `${SITE_URL}/payment-confirmation?status=failed&error=${encodeURIComponent("Payment signature verification failed.")}`,
        303
      );
    }

    const token = data.udf1 && data.udf1 !== "website" ? data.udf1.trim() : "";
    const paymentType = data.udf2 === "partial" ? "partial" : "full";
    const totalAmount = Number(data.udf3) || amount;
    const isSuccess = status === "success";

    const pool = getPool();

    // Prevent duplicate processing
    const [seen] = await pool.query<RowDataPacket[]>(
      "SELECT record_table, record_id, status, transaction_id FROM payment_transactions WHERE transaction_id = ? AND status <> 'failed' LIMIT 1",
      [txnid]
    );
    if (seen.length) {
      const rec = await getRecord(seen[0].record_table as LinkTable, Number(seen[0].record_id));
      const orderNum = rec ? orderNumberOf(rec) : "";
      return NextResponse.redirect(
        `${SITE_URL}/payment-confirmation?txn=${txnid}&orderNumber=${orderNum}&status=paid`,
        303
      );
    }

    let table: LinkTable = "payments";
    let id = 0;
    let orderNumber = "";
    let kind: "full" | "deposit" | "balance" = paymentType === "partial" ? "deposit" : "full";

    if (token) {
      const linked = await findByToken(token);
      if (linked) {
        table = linked.table;
        id = Number(linked.row.id);
        const r = linked.row;
        const total = Number(r.total_amount) || totalAmount;
        orderNumber = orderNumberOf(r);

        if (isSuccess) {
          const isBalance = r.status === "partially_paid" || Number(r.remaining_amount) > 0;
          if (isBalance) {
            kind = "balance";
            const newPaid = Number(r.amount || 0) + amount;
            const remaining = Math.max(0, total - newPaid);
            await pool.query(
              `UPDATE \`${table}\` SET amount = ?, total_amount = ?, remaining_amount = ?, payment_type = ?, status = ?, link_status = ?,
                 reference = CONCAT_WS(' | ', NULLIF(reference, ''), ?), method = 'PayU', paid_at = NOW() WHERE id = ?`,
              [newPaid, total, remaining, remaining > 0 ? "partial" : "full", remaining > 0 ? "partially_paid" : "paid", remaining > 0 ? "active" : "used", mihpayid, id]
            );
          } else {
            const remaining = paymentType === "partial" ? Math.max(0, total - amount) : 0;
            kind = remaining > 0 ? "deposit" : "full";
            await pool.query(
              `UPDATE \`${table}\` SET amount = ?, total_amount = ?, remaining_amount = ?, payment_type = ?, status = ?, link_status = ?,
                 reference = ?, method = 'PayU', paid_at = NOW() WHERE id = ?`,
              [amount, total, remaining, remaining > 0 ? "partial" : "full", remaining > 0 ? "partially_paid" : "paid", remaining > 0 ? "active" : "used", mihpayid, id]
            );
          }
        }
      }
    } else {
      // Website checkout payment
      if (isSuccess) {
        const remaining = paymentType === "partial" ? Math.max(0, totalAmount - amount) : 0;
        kind = remaining > 0 ? "deposit" : "full";
        const service = String(data.udf4 || data.productinfo || "Quickupp Softech Service").slice(0, 150);
        const desc = `Website PayU Payment (${kind === "deposit" ? "Partial Deposit" : "Full Payment"}) - ${service}`;

        const [ins] = await pool.query<ResultSetHeader>(
          `INSERT INTO payments (client_name, client_email, client_phone, service, description, amount, total_amount, payment_type,
             remaining_amount, currency, method, status, link_status, source, reference, paid_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', 'PayU', ?, ?, 'website', ?, NOW())`,
          [
            data.firstname || "Valued Client",
            data.email || null,
            data.phone || null,
            service,
            desc,
            amount,
            totalAmount,
            kind === "deposit" ? "partial" : "full",
            remaining,
            kind === "deposit" ? "partially_paid" : "paid",
            kind === "deposit" ? "active" : "used",
            mihpayid,
          ]
        );
        id = ins.insertId;
        table = "payments";
        orderNumber = `QS-${new Date().getFullYear()}-${String(id).padStart(6, "0")}`;
        await pool.query("UPDATE payments SET invoice_number = ? WHERE id = ?", [orderNumber, id]);
      }
    }

    if (id) {
      await recordTransaction({
        table,
        id,
        kind,
        amount,
        currency: "INR",
        status: isSuccess ? "paid" : "failed",
        transactionId: mihpayid,
        orderId: txnid,
        note: isSuccess ? undefined : errorMessage,
      });

      if (isSuccess) {
        const rec = await getRecord(table, id);
        if (rec) {
          const txns = await listTransactions(table, id, rec);
          const mailCase: PaymentCase = kind;
          const ctx = {
            kind: mailCase,
            rec,
            txns,
            amount,
            currency: String(rec.currency || "INR"),
            transactionId: mihpayid,
            source: (token ? (kind === "balance" ? "balance-link" : "link") : "website") as "website" | "link" | "balance-link",
            balanceUrl: rec.token && rec.status === "partially_paid" ? `${SITE_URL}/pay/${rec.token}` : null,
          };

          // Send client receipt and team email asynchronously
          void sendClientReceipt({
            table,
            ctx,
            actor: { type: "system", label: "Email" },
            eventKey: `receipt:${mihpayid}`,
          }).catch((err) => console.error("[PayU Receipt Error]", err));

          try {
            const t = teamEmail(ctx);
            void sendMail({
              channel: "info",
              to: LEADS_NOTIFICATION_EMAIL,
              subject: t.subject,
              html: t.html,
              text: t.text,
              replyTo: ctx.rec.client_email || undefined,
            });
          } catch (e) {
            console.error("[PayU Team Mail Error]", e);
          }

          // Automatic Client Conversion
          if (rec.client_email) {
            void convertLeadToClient({
              leadSource: rec.lead_source || null,
              leadId: rec.lead_id ? Number(rec.lead_id) : null,
              clientName: String(rec.client_name || data.firstname || "Valued Client"),
              clientEmail: String(rec.client_email),
              clientPhone: rec.client_phone ? String(rec.client_phone) : null,
              companyName: rec.company_name ? String(rec.company_name) : null,
              service: rec.service ? String(rec.service) : null,
              amountPaid: amount,
              totalAmount: Number(rec.total_amount || amount),
              currency: String(rec.currency || "INR"),
            }).catch((err) => console.error("[PayU Client Conversion Error]", err));
          }
        }
      }
    }

    if (!isSuccess) {
      return NextResponse.redirect(
        `${SITE_URL}/payment-confirmation?status=failed&txn=${txnid}&error=${encodeURIComponent(errorMessage)}`,
        303
      );
    }

    return NextResponse.redirect(
      `${SITE_URL}/payment-confirmation?txn=${mihpayid}&orderNumber=${orderNumber}&status=paid`,
      303
    );
  } catch (err: unknown) {
    console.error("[PayU Callback Fatal Error]", err);
    return NextResponse.redirect(
      `${SITE_URL}/payment-confirmation?status=failed&error=${encodeURIComponent(err instanceof Error ? err.message : "Unexpected callback error")}`,
      303
    );
  }
}

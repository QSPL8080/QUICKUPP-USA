import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getPool } from "@/lib/db";
import { getCurrentUser } from "@/lib/crm/auth";
import { sendMail } from "@/lib/mailer";
import { readJson } from "@/lib/enquiry";
import { toDateOnly } from "@/lib/crm/data";
import { actorOf, logActivity, money } from "@/lib/crm/activity";
import { entityOf } from "@/lib/crm/paymentActivity";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Please sign in again." }, { status: 401 });
    }

    const body = await readJson(req);
    if (!body || !body.id) {
      return NextResponse.json({ ok: false, error: "Payment ID is required." }, { status: 400 });
    }

    const id = Number(body.id);
    const pool = getPool();
    let [rows] = await pool.query("SELECT * FROM payment_links WHERE id = ? LIMIT 1", [id]).catch(() => [[]]);
    let targetTable = "payment_links";
    if (!Array.isArray(rows) || !rows.length) {
      [rows] = await pool.query("SELECT * FROM payments WHERE id = ? LIMIT 1", [id]).catch(() => [[]]);
      targetTable = "payments";
    }
    const p = (rows as any[])?.[0];

    if (!p) {
      return NextResponse.json({ ok: false, error: "Payment record not found." }, { status: 404 });
    }

    if (p.status !== "partially_paid" || Number(p.remaining_amount || 0) <= 0) {
      return NextResponse.json({
        ok: false,
        error: "This order does not have an outstanding balance. Balance reminders can only be sent for partially paid orders.",
      }, { status: 400 });
    }

    let token = p.token;
    if (!token) {
      token = randomBytes(16).toString("hex");
      await pool.query(`UPDATE \`${targetTable}\` SET token = ?, link_status = 'active' WHERE id = ?`, [token, id]);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.quickuppsoftech.us";
    const balanceUrl = `${siteUrl}/pay/${token}`;

    const clientName = p.client_name || "Valued Client";
    const firstName = clientName.trim().split(" ")[0] || "Valued Client";
    const clientEmail = p.client_email;
    const clientPhone = p.client_phone || "";
    const service = p.service || "Quickupp Softech Services";
    const quantity = p.category || p.quantity || "Standard Scope";
    const totalAmount = Number(p.total_amount || p.amount || 0);
    const paidAmount = Number(p.amount || 0);
    const remainingAmount = Number(p.remaining_amount || totalAmount - paidAmount);
    const orderNumber = p.invoice_number || `QS-${p.id}`;
    const dueDate = p.balance_due_date ? toDateOnly(p.balance_due_date) : p.billing_end_date ? toDateOnly(p.billing_end_date) : "Due Shortly";

    const whatsappMessage = `Hello ${clientName},

This is a courtesy reminder regarding your outstanding balance for ${service} (${quantity}) with Quickupp Softech LLC.

• Order / Invoice: ${orderNumber}
• Total Engagement: $${totalAmount.toFixed(2)} USD
• Amount Paid: $${paidAmount.toFixed(2)} USD
• Remaining Balance Due: $${remainingAmount.toFixed(2)} USD
• Due Date: ${dueDate}

Please complete your balance payment securely via PayPal or Debit/Credit Card using the link below:
Pay here: ${balanceUrl}

If you have any questions, feel free to reply directly or contact us at info@quickuppsoftech.us.

Website: https://www.quickuppsoftech.us/
Email: info@quickuppsoftech.us

Best regards,
Quickupp Softech LLC`;

    if (!clientEmail || !clientEmail.includes("@")) {
      return NextResponse.json({
        ok: true,
        emailSent: false,
        message: "No valid email found on record. WhatsApp message generated.",
        balanceUrl,
        whatsappMessage,
      });
    }

    const currentYear = new Date().getFullYear();
    const subject = `Balance Payment Due Notice — Quickupp Softech LLC | Order #${orderNumber}`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px 12px; background-color: #f1f5f9; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
    <!-- Header -->
    <div style="background: #0b0f17; padding: 28px 32px; text-align: center; border-bottom: 2px solid #3b82f6;">
      <img src="${siteUrl}/images/logo-white.png" alt="Quickupp Softech LLC" width="170" style="display: block; margin: 0 auto; max-width: 170px; height: auto;" />
      <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0; letter-spacing: 0.05em; text-transform: uppercase;">Enterprise Marketing • AI • Technology</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px 32px 28px;">
      <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px;">Hi ${firstName},</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px;">
        This is a friendly reminder from <strong>Quickupp Softech LLC</strong> regarding the remaining balance for your ongoing project.
      </p>

      <!-- Status Banner -->
      <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; text-align: center;">
        <span style="font-size: 12px; font-weight: 800; letter-spacing: 0.08em; color: #b45309; text-transform: uppercase; display: block; margin-bottom: 4px;">OUTSTANDING BALANCE DUE</span>
        <span style="font-size: 24px; font-weight: 800; color: #b45309;">$${remainingAmount.toFixed(2)} USD</span>
      </div>

      <!-- Order Details Table -->
      <h2 style="font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 10px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0;">
        Account Summary
      </h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 44%;">Order / Invoice No:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #0f172a; font-family: monospace;">${orderNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Service:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${service}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Scope / Deliverables:</td>
          <td style="padding: 8px 0; color: #0f172a;">${quantity}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Total Project Fee:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #475569;">$${totalAmount.toFixed(2)} USD</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Deposit Paid So Far:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #16a34a;">$${paidAmount.toFixed(2)} USD${totalAmount > 0 ? ` (${Math.round((paidAmount / totalAmount) * 100)}%)` : ""}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Remaining Balance Due:</td>
          <td style="padding: 8px 0; font-weight: 800; color: #dc2626; font-size: 15px;">$${remainingAmount.toFixed(2)} USD</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Balance Due Date:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${dueDate}</td>
        </tr>
      </table>

      <!-- Pay Button -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
        <p style="font-size: 14px; color: #334155; margin: 0 0 16px; font-weight: 600;">
          Click the secure link below to clear your remaining balance via PayPal or Debit/Credit Card:
        </p>
        <a href="${balanceUrl}" style="display: inline-block; background: #7c3aed; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 13px 32px; border-radius: 8px; letter-spacing: 0.02em;">
          PAY REMAINING BALANCE ($${remainingAmount.toFixed(2)} USD)
        </a>
      </div>

      <p style="font-size: 13.5px; color: #475569; line-height: 1.6; margin: 0 0 16px;">
        If you have any questions or have already initiated this transfer, please contact us at <a href="mailto:info@quickuppsoftech.us" style="color: #4f46e5; text-decoration: none;">info@quickuppsoftech.us</a>.
      </p>

      <p style="font-size: 14px; color: #1e293b; line-height: 1.5; margin: 0;">
        Best regards,<br />
        <strong>Quickupp Softech LLC</strong><br />
        <span style="font-size: 12px; color: #64748b;">8 The Green, Suite A, Dover, Delaware - 19901, USA</span>
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
      © ${currentYear} Quickupp Softech LLC. All rights reserved.
    </div>
  </div>
</body>
</html>`;

    const sent = await sendMail({
      channel: "info",
      to: clientEmail,
      subject,
      html,
      text: `Hi ${firstName}, this is a reminder regarding your remaining balance of $${remainingAmount.toFixed(2)} USD for order #${orderNumber}. Pay here: ${balanceUrl}`,
    });

    await pool.query(`UPDATE \`${targetTable}\` SET balance_reminder_sent_at = NOW() WHERE id = ?`, [id]).catch(() => {});

    await logActivity({
      entity: entityOf(targetTable),
      id,
      action: "reminder",
      newValue: money(remainingAmount),
      text: sent
        ? `Balance reminder for ${money(remainingAmount)} emailed to ${clientEmail}`
        : `Balance reminder for ${money(remainingAmount)} could not be emailed to ${clientEmail} (mail server not available)`,
      actor: actorOf(user),
    });

    return NextResponse.json({
      ok: true,
      emailSent: sent,
      message: sent ? `Balance reminder email sent to ${clientEmail}.` : `The reminder could not be emailed right now. Share the link on WhatsApp instead.`,
      balanceUrl,
      whatsappMessage,
    });
  } catch (err: any) {
    console.error("[Send Balance Reminder Error]", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to send balance reminder." },
      { status: 500 }
    );
  }
}

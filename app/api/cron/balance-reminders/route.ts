import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getPool } from "@/lib/db";
import { sendMail, EMAIL_LOGO_SRC } from "@/lib/mailer";
import { logActivity, money } from "@/lib/crm/activity";
import { entityOf } from "@/lib/crm/paymentActivity";

export async function GET(req: Request) {
  return handleBalanceReminders(req);
}

export async function POST(req: Request) {
  return handleBalanceReminders(req);
}

/** a date as YYYY-MM-DD in the server's own calendar (DATE columns arrive as local midnight) */
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

async function handleBalanceReminders(req: Request) {
  try {
    const pool = getPool();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.quickuppsoftech.us";

    const [plRows] = await pool.query(`
      SELECT *, 'payment_links' AS _table FROM payment_links 
      WHERE status = 'partially_paid' 
        AND remaining_amount > 0 
        AND client_email IS NOT NULL 
        AND client_email != ''
    `).catch(() => [[]]);

    const [pRows] = await pool.query(`
      SELECT *, 'payments' AS _table FROM payments 
      WHERE status = 'partially_paid' 
        AND remaining_amount > 0 
        AND client_email IS NOT NULL 
        AND client_email != ''
    `).catch(() => [[]]);

    const payments = [...(plRows as any[]), ...(pRows as any[])];
    const now = new Date();
    const todayStr = ymd(now);
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let sentCount = 0;
    const details: any[] = [];

    for (const p of payments) {
      // Check when reminder was last sent (skip if already reminded today)
      if (p.balance_reminder_sent_at) {
        const lastSentDate = ymd(new Date(p.balance_reminder_sent_at));
        if (lastSentDate === todayStr) {
          continue;
        }
      }

      // Determine tentative balance due date
      let dueDate: Date | null = null;
      if (p.balance_due_date) {
        dueDate = new Date(p.balance_due_date);
      } else if (p.billing_end_date) {
        dueDate = new Date(p.billing_end_date);
        dueDate.setDate(dueDate.getDate() - 10);
      } else {
        // Fallback: 10 days before end of current month
        dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        dueDate.setDate(dueDate.getDate() - 10);
      }

      const diffDays = Math.round((dueDate.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));

      // Trigger if 10 days before due date (or month end) OR 2 days before due date
      const isTenDaysBefore = diffDays === 10 || (diffDays < 10 && diffDays >= 8 && !p.balance_reminder_sent_at);
      const isTwoDaysBefore = diffDays === 2 || diffDays === 1;

      if (!isTenDaysBefore && !isTwoDaysBefore) {
        continue;
      }

      // Ensure token exists
      let token = p.token;
      if (!token) {
        token = randomBytes(16).toString("hex");
        await pool.query("UPDATE payments SET token = ?, link_status = 'active' WHERE id = ?", [token, p.id]);
      }

      const balanceUrl = `${siteUrl}/pay/${token}`;
      const clientName = p.client_name || "Valued Client";
      const firstName = clientName.trim().split(" ")[0] || "Valued Client";
      const clientEmail = p.client_email;
      const service = p.service || "Quickupp Softech Services";
      const quantity = p.quantity || p.category || "Standard Scope";
      const totalAmount = Number(p.total_amount || p.amount || 0);
      const paidAmount = Number(p.amount || 0);
      const remainingAmount = Number(p.remaining_amount || totalAmount - paidAmount);
      const orderNumber = p.invoice_number || `QS-${p.id}`;
      const dueDateFormatted = ymd(dueDate);

      const reminderType = isTwoDaysBefore ? "Urgent Balance Reminder (2 Days Remaining)" : "Tentative Balance Due Reminder (10 Days Notice)";
      const subject = `${isTwoDaysBefore ? "Urgent: " : ""}Balance Payment Due — Quickupp Softech LLC | Order #${orderNumber}`;

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px 12px; background-color: #f1f5f9; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
    <div style="background: #0b0f17; padding: 28px 32px; text-align: center; border-bottom: 2px solid #3b82f6;">
      <img src="${EMAIL_LOGO_SRC}" alt="Quickupp Softech LLC" width="170" style="display: block; margin: 0 auto; max-width: 170px; height: auto;" />
      <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0; letter-spacing: 0.05em; text-transform: uppercase;">Enterprise Marketing • AI • Technology</p>
    </div>

    <div style="padding: 32px 32px 28px;">
      <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px;">Hi ${firstName},</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px;">
        This is an automated balance notice from <strong>Quickupp Softech LLC</strong> for your engagement.
      </p>

      <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; text-align: center;">
        <span style="font-size: 12px; font-weight: 800; letter-spacing: 0.08em; color: #b45309; text-transform: uppercase; display: block; margin-bottom: 4px;">${reminderType}</span>
        <span style="font-size: 24px; font-weight: 800; color: #b45309;">$${remainingAmount.toFixed(2)} USD</span>
      </div>

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
          <td style="padding: 8px 0; color: #64748b;">Total Fee:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #475569;">$${totalAmount.toFixed(2)} USD</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Deposit Paid:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #16a34a;">$${paidAmount.toFixed(2)} USD</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Remaining Due:</td>
          <td style="padding: 8px 0; font-weight: 800; color: #dc2626; font-size: 15px;">$${remainingAmount.toFixed(2)} USD</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Balance Due Date:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${dueDateFormatted}</td>
        </tr>
      </table>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
        <a href="${balanceUrl}" style="display: inline-block; background: #7c3aed; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 13px 32px; border-radius: 8px; letter-spacing: 0.02em;">
          PAY REMAINING BALANCE ($${remainingAmount.toFixed(2)} USD)
        </a>
      </div>

      <p style="font-size: 13.5px; color: #475569; line-height: 1.6; margin: 0 0 16px;">
        Questions or need assistance? Reply directly to this email or reach us at <a href="mailto:info@quickuppsoftech.us" style="color: #4f46e5; text-decoration: none;">info@quickuppsoftech.us</a>.
      </p>

      <p style="font-size: 14px; color: #1e293b; line-height: 1.5; margin: 0;">
        Best regards,<br />
        <strong>Quickupp Softech LLC</strong><br />
        <span style="font-size: 12px; color: #64748b;">8 The Green, Suite A, Dover, Delaware - 19901, USA</span>
      </p>
    </div>

    <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
      © ${now.getFullYear()} Quickupp Softech LLC. All rights reserved.
    </div>
  </div>
</body>
</html>`;

      try {
        await sendMail({
          channel: "info",
          to: clientEmail,
          subject,
          html,
          text: `Hi ${firstName}, balance payment reminder for order #${orderNumber}. Outstanding balance: $${remainingAmount.toFixed(2)} USD. Due: ${dueDateFormatted}. Pay here: ${balanceUrl}`,
        });

        await pool.query(`UPDATE \`${p._table || "payments"}\` SET balance_reminder_sent_at = NOW() WHERE id = ?`, [p.id]).catch(() => {});
        await logActivity({
          entity: entityOf(p._table || "payments"),
          id: Number(p.id),
          action: "reminder",
          newValue: money(remainingAmount),
          text: `Automatic balance reminder for ${money(remainingAmount)} emailed to ${clientEmail}`,
          actor: { type: "system", label: "System (scheduled reminder)" },
        });
        sentCount++;
        details.push({ id: p.id, orderNumber, clientEmail, diffDays, status: "sent" });
      } catch (sendErr: any) {
        console.error(`[Cron Reminder Error for order #${orderNumber}]`, sendErr);
        details.push({ id: p.id, orderNumber, clientEmail, error: sendErr.message });
      }
    }

    return NextResponse.json({
      ok: true,
      remindersSent: sentCount,
      totalChecked: payments.length,
      details,
    });
  } catch (err: any) {
    console.error("[Cron Balance Reminders Failure]", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

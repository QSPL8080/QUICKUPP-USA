import "server-only";
import { randomBytes } from "node:crypto";
import { getPool } from "@/lib/db";
import { sendMail, EMAIL_LOGO_SRC } from "@/lib/mailer";
import { logActivity, money } from "@/lib/crm/activity";
import { entityOf } from "@/lib/crm/paymentActivity";
import { SITE_URL } from "@/lib/siteUrl";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Parse any date or MySQL string into a local midnight Date */
function parseToMidnight(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : new Date(val.getFullYear(), val.getMonth(), val.getDate());
  }
  if (typeof val === "string") {
    const s = val.trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const y = parseInt(m[1], 10);
      const mo = parseInt(m[2], 10) - 1;
      const d = parseInt(m[3], 10);
      return new Date(y, mo, d);
    }
    const parsed = new Date(s);
    return isNaN(parsed.getTime()) ? null : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }
  return null;
}

/** Formats a Date as YYYY-MM-DD */
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export type ReminderRun = {
  ok: boolean;
  remindersSent: number;
  totalChecked: number;
  details: Record<string, unknown>[];
  error?: string;
};

/**
 * Ensures reminder milestone tracking columns exist in MySQL so queries never fail.
 */
async function ensureReminderColumns() {
  const pool = getPool();
  for (const table of ["payment_links", "payments"]) {
    try {
      await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN balance_reminder_sent_at DATETIME NULL`);
    } catch {}
    try {
      await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN balance_reminder_10d_sent_at DATETIME NULL`);
    } catch {}
    try {
      await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN balance_reminder_2d_sent_at DATETIME NULL`);
    } catch {}
  }
}

/**
 * Emails clients whose balance is due:
 * - Exactly ONE reminder 10 days before due date.
 * - Exactly ONE reminder 2 days before due date.
 *
 * Each milestone is tracked in dedicated columns (balance_reminder_10d_sent_at and
 * balance_reminder_2d_sent_at). Once a milestone is sent, it is never sent again.
 * This ensures clients NEVER receive reminder emails every hour or duplicate emails.
 */
export async function runBalanceReminders(): Promise<ReminderRun> {
  try {
    const pool = getPool();
    await ensureReminderColumns();

    const siteUrl = SITE_URL;

    // Query partially paid orders from both payment_links and payments tables
    const [plRows] = await pool.query(`
      SELECT *, 'payment_links' AS _table FROM payment_links 
      WHERE status = 'partially_paid' 
        AND remaining_amount > 0 
        AND COALESCE(link_status, 'active') <> 'cancelled'
        AND client_email IS NOT NULL 
        AND client_email != ''
    `).catch(() => [[]]);

    const [pRows] = await pool.query(`
      SELECT *, 'payments' AS _table FROM payments 
      WHERE status = 'partially_paid' 
        AND remaining_amount > 0 
        AND COALESCE(link_status, 'active') <> 'cancelled'
        AND client_email IS NOT NULL 
        AND client_email != ''
    `).catch(() => [[]]);

    // Deduplicate between payment_links and payments to prevent duplicate processing
    const rawList = [...(plRows as any[]), ...(pRows as any[])];
    const seenTokens = new Set<string>();
    const seenInvoices = new Set<string>();
    const payments: any[] = [];

    for (const p of rawList) {
      const tok = (p.token || "").trim();
      const inv = (p.invoice_number || "").trim();
      if (tok && seenTokens.has(tok)) continue;
      if (inv && seenInvoices.has(inv)) continue;
      if (tok) seenTokens.add(tok);
      if (inv) seenInvoices.add(inv);
      payments.push(p);
    }

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let sentCount = 0;
    const details: any[] = [];

    for (const p of payments) {
      // Determine tentative balance due date
      let dueDate: Date | null = null;
      if (p.balance_due_date) {
        dueDate = parseToMidnight(p.balance_due_date);
      } else if (p.billing_end_date) {
        const bed = parseToMidnight(p.billing_end_date);
        if (bed) {
          dueDate = new Date(bed.getFullYear(), bed.getMonth(), bed.getDate() - 10);
        }
      }

      if (!dueDate) {
        // Fallback: 10 days before end of current month
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        dueDate = new Date(endOfMonth.getFullYear(), endOfMonth.getMonth(), endOfMonth.getDate() - 10);
      }

      const diffDays = Math.round((dueDate.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));

      let targetMilestone: "10d" | "2d" | null = null;

      // 10 days before (or up to 2 days late if the site was down); 2 days before (or up to the due day)
      // (a deposit made in the last 2 days already came with the balance link, so it skips the 10-day one)
      const depositAt = p.paid_at ? new Date(p.paid_at).getTime() : 0;
      const justPaid = depositAt > 0 && Date.now() - depositAt < 2 * 24 * 3600 * 1000;
      if (diffDays <= 10 && diffDays >= 8) {
        if (!p.balance_reminder_10d_sent_at && !justPaid) {
          targetMilestone = "10d";
        }
      } else if (diffDays === 2 || (diffDays < 2 && diffDays >= 0 && !p.balance_reminder_2d_sent_at)) {
        if (!p.balance_reminder_2d_sent_at) {
          targetMilestone = "2d";
        }
      }

      // If neither milestone applies, or if this milestone was already sent, skip immediately!
      if (!targetMilestone) {
        continue;
      }

      // Ensure token exists for direct balance link
      let token = p.token;
      if (!token) {
        token = randomBytes(16).toString("hex");
        // only in the record's own table: a payment and a payment link can share an id
        const ownTable = p._table === "payment_links" ? "payment_links" : "payments";
        await pool.query(`UPDATE \`${ownTable}\` SET token = ?, link_status = 'active' WHERE id = ?`, [token, p.id]).catch(() => {});
      }

      const balanceUrl = `${siteUrl}/pay/${token}`;
      const clientName = p.client_name || "Valued Client";
      const firstName = clientName.trim().split(" ")[0] || "Valued Client";
      const clientEmail = p.client_email;
      const service = p.service || "Quickupp Softech Services";
      const quantity = p.category || p.quantity || "Standard Scope";
      const totalAmount = Number(p.total_amount || p.amount || 0);
      const paidAmount = Number(p.amount || 0);
      const remainingAmount = Number(p.remaining_amount || totalAmount - paidAmount);
      const orderNumber = p.invoice_number || `QS-${p.id}`;
      const dueDateFormatted = ymd(dueDate);

      const isTwoDays = targetMilestone === "2d";
      const reminderType = isTwoDays ? "Urgent Balance Reminder (2 Days Remaining)" : "Tentative Balance Due Reminder (10 Days Notice)";
      const subject = `${isTwoDays ? "Urgent: " : ""}Balance Payment Due Notice — Quickupp Softech LLC | Order #${orderNumber}`;

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
      <img src="${EMAIL_LOGO_SRC}" alt="Quickupp Softech" width="170" style="display: block; margin: 0 auto; max-width: 170px; height: auto;" />
      <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0; letter-spacing: 0.05em; text-transform: uppercase;">Enterprise Marketing • AI • Technology</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px 32px 28px;">
      <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px;">Hi ${firstName},</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px;">
        This is an official ${isTwoDays ? "urgent" : "courtesy"} reminder from <strong>Quickupp Softech LLC</strong> regarding the remaining balance for your ongoing project.
      </p>

      <!-- Amount Banner -->
      <div style="background: ${isTwoDays ? "#fee2e2" : "#fef3c7"}; border: 1px solid ${isTwoDays ? "#fca5a5" : "#fde68a"}; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px; text-align: center;">
        <span style="font-size: 12px; font-weight: 800; letter-spacing: 0.08em; color: ${isTwoDays ? "#991b1b" : "#b45309"}; text-transform: uppercase; display: block; margin-bottom: 4px;">${reminderType}</span>
        <span style="font-size: 26px; font-weight: 800; color: ${isTwoDays ? "#991b1b" : "#b45309"};">$${remainingAmount.toFixed(2)} USD</span>
      </div>

      <!-- Account Details Table -->
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
          <td style="padding: 8px 0; color: #64748b;">Deposit Paid:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #16a34a;">$${paidAmount.toFixed(2)} USD</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Remaining Balance Due:</td>
          <td style="padding: 8px 0; font-weight: 800; color: #dc2626; font-size: 15px;">$${remainingAmount.toFixed(2)} USD</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Balance Due Date:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${dueDateFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Direct Balance Link:</td>
          <td style="padding: 8px 0; font-weight: 700;">
            <a href="${balanceUrl}" style="color: #2563eb; text-decoration: underline;">Pay Online &rarr;</a>
          </td>
        </tr>
      </table>

      <!-- Prominent Direct Payment Action Box -->
      <div style="background: #f8fafc; border: 2px solid #3b82f6; border-radius: 14px; padding: 26px 20px; text-align: center; margin: 26px 0; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.08);">
        <p style="font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 14px;">
          Click below to clear your remaining balance via PayPal or Debit / Credit Card:
        </p>
        <a href="${balanceUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 34px; border-radius: 8px; letter-spacing: 0.03em; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
          PAY REMAINING BALANCE ($${remainingAmount.toFixed(2)} USD) &rarr;
        </a>
        <div style="margin-top: 18px; padding-top: 14px; border-top: 1px dashed #cbd5e1; text-align: center;">
          <p style="font-size: 12px; color: #64748b; margin: 0 0 6px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">
            Or copy &amp; paste this direct payment link:
          </p>
          <a href="${balanceUrl}" style="color: #2563eb; font-size: 13px; font-weight: 600; text-decoration: underline; word-break: break-all;">
            ${balanceUrl}
          </a>
        </div>
      </div>

      <p style="font-size: 13.5px; color: #475569; line-height: 1.6; margin: 0 0 16px;">
        Questions or need assistance? Reply directly to this email or reach us at <a href="mailto:info@quickuppsoftech.us" style="color: #4f46e5; text-decoration: none;">info@quickuppsoftech.us</a>.
      </p>

      <p style="font-size: 14px; color: #1e293b; line-height: 1.5; margin: 0;">
        Best regards,<br />
        <strong>Quickupp Softech LLC</strong><br />
        <span style="font-size: 12px; color: #64748b;">167 Princeton Street, Bridgeport, Connecticut - 06605, USA</span>
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
      © ${now.getFullYear()} Quickupp Softech LLC. All rights reserved.
    </div>
  </div>
</body>
</html>`;

      const plainText = `Hi ${firstName},

This is an automated ${isTwoDays ? "urgent " : ""}balance payment reminder from Quickupp Softech LLC.
Order / Invoice: #${orderNumber}
Service: ${service}
Scope: ${quantity}
Total Amount: $${totalAmount.toFixed(2)} USD
Deposit Paid: $${paidAmount.toFixed(2)} USD
Remaining Balance Due: $${remainingAmount.toFixed(2)} USD
Due Date: ${dueDateFormatted}

Please use your secure direct balance payment link to complete payment:
Direct Payment Link: ${balanceUrl}

If you have any questions, please contact info@quickuppsoftech.us.

Best regards,
Quickupp Softech LLC
167 Princeton Street, Bridgeport, Connecticut - 06605, USA`;

      // check again just before sending: if the balance was paid meanwhile, no reminder goes out
      const ownTbl = p._table === "payment_links" ? "payment_links" : "payments";
      const [fresh] = await pool.query(`SELECT status, remaining_amount FROM \`${ownTbl}\` WHERE id = ?`, [p.id]).catch(() => [[]]);
      const now0 = (fresh as any[])[0];
      if (!now0 || now0.status !== "partially_paid" || Number(now0.remaining_amount || 0) <= 0) continue;

      try {
        const sent = await sendMail({
          channel: "info",
          to: clientEmail,
          subject,
          html,
          text: plainText,
        });

        if (!sent) {
          details.push({ id: p.id, orderNumber, clientEmail, milestone: targetMilestone, diffDays, status: "email not sent (check SMTP settings)" });
          continue;
        }

        // Dedicated milestone update: mark milestone sent in both tables to guarantee no duplicate sends
        const milestoneCol = targetMilestone === "10d" ? "balance_reminder_10d_sent_at" : "balance_reminder_2d_sent_at";

        // this record (ids repeat across the two tables, so only in its own table), and any copy sharing its token
        const ownTable = p._table === "payment_links" ? "payment_links" : "payments";
        await pool.query(`UPDATE \`${ownTable}\` SET ${milestoneCol} = NOW(), balance_reminder_sent_at = NOW() WHERE id = ?`, [p.id]).catch(() => {});
        if (token) {
          await pool.query(`UPDATE payment_links SET ${milestoneCol} = NOW(), balance_reminder_sent_at = NOW() WHERE token = ?`, [token]).catch(() => {});
          await pool.query(`UPDATE payments SET ${milestoneCol} = NOW(), balance_reminder_sent_at = NOW() WHERE token = ?`, [token]).catch(() => {});
        }

        await logActivity({
          entity: entityOf(p._table || "payments"),
          id: Number(p.id),
          action: "reminder",
          newValue: money(remainingAmount),
          text: `Automated ${targetMilestone} balance reminder for ${money(remainingAmount)} emailed to ${clientEmail} with balance link (${balanceUrl})`,
          actor: { type: "system", label: `System (${targetMilestone} reminder)` },
        });

        sentCount++;
        details.push({ id: p.id, orderNumber, clientEmail, milestone: targetMilestone, diffDays, status: "sent", balanceUrl });
      } catch (sendErr: any) {
        console.error(`[Cron Reminder Error for order #${orderNumber}]`, sendErr);
        details.push({ id: p.id, orderNumber, clientEmail, error: sendErr.message });
      }
    }

    return { ok: true, remindersSent: sentCount, totalChecked: payments.length, details };
  } catch (err: any) {
    console.error("[Cron Balance Reminders Failure]", err);
    return { ok: false, remindersSent: 0, totalChecked: 0, details: [], error: err?.message || String(err) };
  }
}

/* ---------------------------------------------------------------- the hourly run */
declare global {
  var __qsReminderTimer: ReturnType<typeof setInterval> | undefined;
}

/** Runs the reminders once, on one server at a time */
async function runOnce() {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [[lock]] = (await conn.query("SELECT GET_LOCK('qs_balance_reminders', 0) AS ok")) as unknown as [[{ ok: number }]];
    if (Number(lock?.ok) !== 1) return;
    try {
      const r = await runBalanceReminders();
      if (r.remindersSent || !r.ok) {
        console.log(`[reminders] checked ${r.totalChecked}, sent ${r.remindersSent}${r.error ? `, error: ${r.error}` : ""}`);
      }
    } finally {
      await conn.query("SELECT RELEASE_LOCK('qs_balance_reminders')").catch(() => {});
    }
  } finally {
    conn.release();
  }
}

/** Starts the hourly balance reminder check (called once when the server starts) */
export function startBalanceReminderSchedule() {
  if (globalThis.__qsReminderTimer || process.env.BALANCE_REMINDERS === "off") return;
  const tick = () => void runOnce().catch((err) => console.error("[reminders] run failed:", err));
  setTimeout(tick, 2 * 60 * 1000); // first check a couple of minutes after start
  globalThis.__qsReminderTimer = setInterval(tick, 60 * 60 * 1000);
}

import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { after } from "next/server";
import { getPool } from "@/lib/db";
import { actorOf, logActivity, roleLabel } from "@/lib/crm/activity";
import { SUPER_ADMIN_EMAIL, type CrmUser } from "@/lib/crm/auth";
import { escapeHtml, sendMail } from "@/lib/mailer";
import { SITE_URL } from "@/lib/siteUrl";

/*
 * Deleting a payment or a payment link from the CRM removes it from the
 * database for good — the record and its PayPal transaction rows. What was
 * deleted, by whom and when is kept in the CRM history (crm_activity, action
 * "deleted") and emailed to the super admin (info@quickuppsoftech.us), so a
 * deletion can always be traced.
 */

type Table = "payments" | "payment_links";

const money = (v: unknown, cur = "USD") => `${cur === "USD" ? "$" : `${cur} `}${Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function describe(table: Table, r: RowDataPacket) {
  const order = r.invoice_number || `#${r.id}`;
  const kind = table === "payment_links" ? "Payment link" : r.source === "website" || !r.source ? "Website payment" : "Payment";
  const paid = Number(r.amount || 0);
  const total = Number(r.total_amount || r.amount || 0);
  return {
    kind,
    order: String(order),
    client: String(r.client_name || r.client_email || "Unknown client"),
    email: String(r.client_email || ""),
    service: String(r.service || ""),
    amounts: `${money(paid, r.currency)} paid of ${money(total, r.currency)}`,
    status: String(r.status || ""),
  };
}

/** Deletes these records (all in one table) for good; returns how many were removed */
export async function deletePayments(table: Table, ids: number[], user: CrmUser): Promise<number> {
  if (!ids.length) return 0;
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM \`${table}\` WHERE id IN (?)`, [ids]);
  if (!rows.length) return 0;
  const found = rows.map((r) => Number(r.id));
  const [res] = await pool.query(`DELETE FROM \`${table}\` WHERE id IN (?)`, [found]);
  const deleted = Number((res as { affectedRows: number }).affectedRows || 0);
  if (!deleted) return 0;
  // the PayPal transaction rows of these records go too
  await pool.query("DELETE FROM payment_transactions WHERE record_table = ? AND record_id IN (?)", [table, found]).catch(() => {});

  const items = rows.map((r) => ({ id: Number(r.id), ...describe(table, r) }));
  const when = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST";
  for (const it of items) {
    await logActivity({
      entity: table === "payment_links" ? "payment_link" : "payment",
      id: it.id,
      action: "deleted",
      text: `${it.kind} ${it.order} from ${it.client} (${it.service || "no service"}, ${it.amounts}, ${it.status || "no status"}) was deleted`,
      actor: actorOf(user),
      meta: { order: it.order, client: it.client, email: it.email, service: it.service, amounts: it.amounts, status: it.status },
    });
  }

  after(async () => {
    const who = `${user.name} (${roleLabel(user.role)}, ${user.email})`;
    const subject = items.length === 1 ? `Payment deleted from the CRM: ${items[0].order} · ${items[0].client}` : `${items.length} payments deleted from the CRM`;
    const rowsHtml = items
      .map(
        (it) =>
          `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-weight:700">${escapeHtml(it.order)}</td><td style="padding:8px 8px;border-bottom:1px solid #f1f5f9">${escapeHtml(it.kind)}</td><td style="padding:8px 8px;border-bottom:1px solid #f1f5f9">${escapeHtml(it.client)}${it.email ? `<br/><span style="color:#64748b">${escapeHtml(it.email)}</span>` : ""}</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9">${escapeHtml(it.amounts)}<br/><span style="color:#64748b">${escapeHtml(it.status)}</span></td></tr>`
      )
      .join("");
    const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px 12px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
  <div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
    <div style="background:#0b0f17;padding:20px 26px;color:#fff">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8">Quickupp CRM · Payments</div>
      <div style="font-size:18px;font-weight:800;margin-top:6px">${items.length === 1 ? "A payment was deleted" : `${items.length} payments were deleted`}</div>
    </div>
    <div style="padding:22px 26px">
      <p style="margin:0 0 14px;font-size:14.5px;line-height:1.6">Deleted by <strong>${escapeHtml(who)}</strong> on ${escapeHtml(when)}. They have been removed from the database.</p>
      <table style="width:100%;border-collapse:collapse;font-size:13.5px">
        <tr><th align="left" style="padding:8px 0;color:#64748b;border-bottom:1px solid #e2e8f0">Order</th><th align="left" style="padding:8px;color:#64748b;border-bottom:1px solid #e2e8f0">Type</th><th align="left" style="padding:8px;color:#64748b;border-bottom:1px solid #e2e8f0">Client</th><th align="left" style="padding:8px 0;color:#64748b;border-bottom:1px solid #e2e8f0">Amount</th></tr>
        ${rowsHtml}
      </table>
      <p style="margin:18px 0 0"><a href="${SITE_URL}/crm/payments" style="display:inline-block;background:#0b0f17;color:#fff;text-decoration:none;font-weight:700;font-size:13.5px;padding:11px 20px;border-radius:8px">Open Payments</a></p>
    </div>
  </div></body></html>`;
    const text = `${subject}\n\nDeleted by ${who} on ${when}. They have been removed from the database.\n\n${items
      .map((it) => `${it.order} · ${it.kind} · ${it.client}${it.email ? ` (${it.email})` : ""} · ${it.amounts} · ${it.status}`)
      .join("\n")}\n\n${SITE_URL}/crm/payments`;
    await sendMail({ channel: "info", to: SUPER_ADMIN_EMAIL, subject, html, text }).catch((err) => console.error("[payments] deletion email failed:", err));
  });
  return deleted;
}

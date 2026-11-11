import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { getPool } from "@/lib/db";

/*
 * Rules for a pay link (/pay/<token>), the same for links made in the CRM and
 * for the balance link a website deposit gets:
 *
 * - A new link can be paid for 24 hours. Once paid in full it is used up; if
 *   nothing is paid within 24 hours it expires.
 * - After a deposit (partial payment) the same link becomes the balance link.
 *   It stays open until the balance is paid, then it is used up.
 * - A cancelled link can't be paid.
 *
 * The amount is always worked out here from the record, never taken from the
 * browser: the full total, a 50% deposit, or the remaining balance.
 */

export type LinkTable = "payments" | "payment_links";
export type LinkState = "open" | "balance" | "paid" | "expired" | "cancelled";

export const LINK_HOURS = 24;

const n = (v: unknown) => Number(v || 0);
const round2 = (v: number) => Math.round(v * 100) / 100;

/** What a payment record's link is now (see the rules above) */
export function linkState(r: RowDataPacket | Record<string, unknown>): LinkState {
  if (r.link_status === "cancelled") return "cancelled";
  const paid = n(r.amount);
  const total = n(r.total_amount) || paid;
  const remaining = r.remaining_amount != null ? n(r.remaining_amount) : Math.max(0, total - paid);
  if (r.status === "paid" || r.link_status === "used" || (paid > 0 && remaining <= 0)) return "paid";
  if (paid > 0 && remaining > 0 && (r.status === "partially_paid" || r.status === "pending")) return "balance";
  // nothing paid yet: 24 hours from when the link was made
  if (r.link_status === "expired") return "expired";
  const created = r.created_at ? new Date(String(r.created_at)).getTime() : NaN;
  const ends = r.expires_at ? new Date(String(r.expires_at)).getTime() : created + LINK_HOURS * 3600_000;
  if (!isNaN(ends) && Date.now() > ends) return "expired";
  return "open";
}

/** The record behind a pay link token, and which table it is in */
export async function findByToken(token: string): Promise<{ table: LinkTable; row: RowDataPacket } | null> {
  if (!token || token.length > 80) return null;
  const pool = getPool();
  const [links] = await pool.query<RowDataPacket[]>("SELECT * FROM payment_links WHERE token = ? LIMIT 1", [token]).catch(() => [[] as RowDataPacket[]]);
  if (links.length) return { table: "payment_links", row: links[0] };
  const [pays] = await pool.query<RowDataPacket[]>("SELECT * FROM payments WHERE token = ? LIMIT 1", [token]).catch(() => [[] as RowDataPacket[]]);
  if (pays.length) return { table: "payments", row: pays[0] };
  return null;
}

/** Marks an unpaid link expired in its own table */
export async function markExpired(table: LinkTable, id: number) {
  await getPool()
    .query(`UPDATE \`${table}\` SET link_status = 'expired' WHERE id = ? AND COALESCE(amount, 0) = 0 AND status NOT IN ('paid', 'partially_paid')`, [id])
    .catch(() => {});
}

/** Marks every CRM link that passed its 24 hours unpaid as expired (run before the CRM lists payments) */
export async function expireStaleLinks() {
  await getPool()
    .query(
      `UPDATE payment_links SET link_status = 'expired'
        WHERE link_status = 'active' AND COALESCE(amount, 0) = 0 AND status NOT IN ('paid', 'partially_paid')
          AND COALESCE(expires_at, created_at + INTERVAL ${LINK_HOURS} HOUR) < NOW()`
    )
    .catch(() => {});
}

export const LINK_MESSAGES: Record<Exclude<LinkState, "open" | "balance">, string> = {
  paid: "This payment link has already been used and the order is fully paid. Thank you!",
  expired: "This payment link has expired (links are valid for 24 hours). Please contact Quickupp Softech for a new link.",
  cancelled: "This payment link has been cancelled. Please contact Quickupp Softech for help.",
};

/**
 * What the client pays now on this link. choice: "partial" asks for the 50%
 * deposit, which is only offered on a link made for part payment.
 */
export function chargeFor(r: RowDataPacket | Record<string, unknown>, choice: unknown): { amount: number; type: "full" | "partial" | "balance"; total: number; remaining: number } | null {
  const state = linkState(r);
  const paid = n(r.amount);
  const total = round2(n(r.total_amount) || paid);
  if (state === "balance") {
    const remaining = round2(r.remaining_amount != null ? n(r.remaining_amount) : total - paid);
    return remaining > 0 ? { amount: remaining, type: "balance", total, remaining: 0 } : null;
  }
  if (state !== "open" || total <= 0) return null;
  if (choice === "partial" && r.payment_type === "partial") {
    const deposit = round2(total * 0.5);
    return { amount: deposit, type: "partial", total, remaining: round2(total - deposit) };
  }
  return { amount: total, type: "full", total, remaining: 0 };
}

/** Keeps one row per PayPal transaction, so each transaction ID shows in the CRM */
export async function recordTransaction(t: {
  table: LinkTable;
  id: number;
  kind: "full" | "deposit" | "balance";
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  transactionId: string;
  orderId: string;
  note?: string;
}) {
  if (!t.id) return;
  await getPool()
    .query(
      `INSERT IGNORE INTO payment_transactions (record_table, record_id, kind, amount, currency, status, transaction_id, paypal_order_id, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.table, t.id, t.kind, round2(t.amount), t.currency || "USD", t.status, t.transactionId || null, t.orderId || null, (t.note || "").slice(0, 255) || null]
    )
    .catch((err) => console.error("[payments] could not record the transaction:", err));
}

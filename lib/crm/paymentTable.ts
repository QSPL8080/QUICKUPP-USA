import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { getPool } from "@/lib/db";

export type PayTable = "payments" | "payment_links";

/*
 * A payment record (payments) and a payment link (payment_links) can have the
 * same id, so the CRM says which table it means. Requests without it (a page
 * opened before this change) are only served when the id exists in just one
 * of the two tables; otherwise the caller is asked to refresh.
 */
export async function resolvePayTable(id: number, hint: unknown): Promise<{ table: PayTable } | { error: string; status: number }> {
  if (hint === "payments" || hint === "payment_links") return { table: hint };
  const pool = getPool();
  const has = async (t: PayTable) => {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT id FROM \`${t}\` WHERE id = ? LIMIT 1`, [id]).catch(() => [[] as RowDataPacket[]]);
    return rows.length > 0;
  };
  const [inLinks, inPayments] = await Promise.all([has("payment_links"), has("payments")]);
  if (inLinks && inPayments) return { error: "Please refresh the page and try again.", status: 409 };
  if (inLinks) return { table: "payment_links" };
  if (inPayments) return { table: "payments" };
  return { error: "This payment was deleted.", status: 404 };
}

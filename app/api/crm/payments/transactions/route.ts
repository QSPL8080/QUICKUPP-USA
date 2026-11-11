import type { RowDataPacket } from "mysql2/promise";
import { getPool } from "@/lib/db";
import { getUserFor } from "@/lib/crm/auth";

/*
 * GET ?table=payments|payment_links&id= → every PayPal transaction on one
 * payment record (deposit, balance or full), oldest first, with its
 * transaction ID. Records paid before transactions were kept one by one are
 * read from their activity history, or from the record itself.
 */

export type TransactionItem = {
  kind: "full" | "deposit" | "balance";
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  transactionId: string | null;
  orderId: string | null;
  at: string;
  note: string | null;
};

const iso = (v: unknown) => {
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export async function GET(request: Request) {
  if (!(await getUserFor("payments"))) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const sp = new URL(request.url).searchParams;
  const table = sp.get("table") === "payment_links" ? "payment_links" : "payments";
  const id = Number(sp.get("id"));
  if (!Number.isInteger(id) || id <= 0) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const pool = getPool();

  const [rows] = await pool
    .query<RowDataPacket[]>(
      "SELECT kind, amount, currency, status, transaction_id, paypal_order_id, note, created_at FROM payment_transactions WHERE record_table = ? AND record_id = ? ORDER BY created_at, id",
      [table, id]
    )
    .catch(() => [[] as RowDataPacket[]]);
  let items: TransactionItem[] = rows.map((r) => ({
    kind: r.kind,
    amount: Number(r.amount),
    currency: r.currency || "USD",
    status: r.status,
    transactionId: r.transaction_id || null,
    orderId: r.paypal_order_id || null,
    at: iso(r.created_at),
    note: r.note || null,
  }));

  const [recs] = await pool.query<RowDataPacket[]>(`SELECT * FROM \`${table}\` WHERE id = ? LIMIT 1`, [id]).catch(() => [[] as RowDataPacket[]]);
  const rec = recs[0];
  if (!rec) return Response.json({ ok: false, error: "This payment was deleted." }, { status: 404 });

  if (!items.length) {
    // older payments: the PayPal results in the record's history
    const entity = table === "payment_links" ? "payment_link" : "payment";
    const [acts] = await pool
      .query<RowDataPacket[]>(
        "SELECT action, new_value, message, meta, created_at FROM crm_activity WHERE entity_type = ? AND entity_source = '' AND entity_id = ? AND action IN ('payment', 'payment_failed') AND actor_type = 'gateway' ORDER BY created_at, id",
        [entity, id]
      )
      .catch(() => [[] as RowDataPacket[]]);
    let paidSoFar = 0;
    const total = Number(rec.total_amount || rec.amount || 0);
    items = acts.map((a) => {
      let meta: Record<string, string> = {};
      try {
        meta = JSON.parse(String(a.meta || "{}"));
      } catch {}
      const amount = Number(String(a.new_value || "").replace(/[^0-9.]/g, "")) || 0;
      const msg = String(a.message || "");
      const status: TransactionItem["status"] = a.action === "payment_failed" ? "failed" : /pending/i.test(msg) ? "pending" : "paid";
      const kind: TransactionItem["kind"] = /^Balance payment/i.test(msg) ? "balance" : status !== "failed" && paidSoFar === 0 && amount < total ? "deposit" : "full";
      if (status !== "failed") paidSoFar += amount;
      return { kind, amount, currency: rec.currency || "USD", status, transactionId: meta.captureId || null, orderId: meta.orderId || null, at: iso(a.created_at), note: null };
    });
  }

  if (!items.length && Number(rec.amount || 0) > 0) {
    // a payment recorded without history: what the record itself says
    const refs = String(rec.reference || "").split("|").map((x) => x.replace(/^(Initial|Balance):/i, "").trim()).filter(Boolean);
    const balance = refs.length > 1;
    if (balance) {
      items.push({ kind: "deposit", amount: 0, currency: rec.currency || "USD", status: "paid", transactionId: /^\d+(\.\d+)?$/.test(refs[0]) ? null : refs[0], orderId: null, at: iso(rec.created_at), note: "Amount not recorded" });
    }
    items.push({
      kind: balance ? "balance" : rec.payment_type === "partial" ? "deposit" : "full",
      amount: balance ? 0 : Number(rec.amount),
      currency: rec.currency || "USD",
      status: rec.status === "pending" ? "pending" : "paid",
      transactionId: refs[refs.length - 1] || null,
      orderId: rec.paypal_order_id || null,
      at: iso(rec.paid_at || rec.created_at),
      note: balance ? "Amount not recorded" : null,
    });
  }

  return Response.json({ ok: true, items });
}

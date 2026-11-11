import type { RowDataPacket } from "mysql2/promise";
import { getPool } from "@/lib/db";
import { getUserFor } from "@/lib/crm/auth";
import { getRecord, orderNumberOf, receiptPdfFor } from "@/lib/paymentTxns";
import type { LinkTable } from "@/lib/paymentLink";

/*
 * The PDF receipt for a payment, as it stands now (deposit, balance or full).
 *
 * - CRM (signed in): ?table=payments|payment_links&id=
 * - The client: ?txn=<PayPal transaction ID> or ?token=<their pay link token>.
 *   Order numbers are sequential, so they alone never open a receipt.
 */
export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;
    const pool = getPool();
    let table: LinkTable | null = null;
    let rec: RowDataPacket | null = null;

    const id = Number(sp.get("id"));
    if (Number.isInteger(id) && id > 0 && (await getUserFor("payments"))) {
      table = sp.get("table") === "payment_links" ? "payment_links" : "payments";
      rec = await getRecord(table, id);
    } else if (sp.get("txn")) {
      const [rows] = await pool
        .query<RowDataPacket[]>("SELECT record_table, record_id FROM payment_transactions WHERE transaction_id = ? AND status <> 'failed' LIMIT 1", [String(sp.get("txn")).slice(0, 64)])
        .catch(() => [[] as RowDataPacket[]]);
      if (rows.length) {
        table = rows[0].record_table === "payment_links" ? "payment_links" : "payments";
        rec = await getRecord(table, Number(rows[0].record_id));
      }
    } else if (sp.get("token")) {
      const token = String(sp.get("token")).slice(0, 80);
      for (const t of ["payment_links", "payments"] as const) {
        const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM \`${t}\` WHERE token = ? LIMIT 1`, [token]).catch(() => [[] as RowDataPacket[]]);
        if (rows.length) {
          table = t;
          rec = rows[0];
          break;
        }
      }
    }

    if (!table || !rec) return Response.json({ error: "Receipt not found." }, { status: 404 });
    if (Number(rec.amount || 0) <= 0) return Response.json({ error: "Nothing has been paid on this order yet." }, { status: 404 });

    const pdf = await receiptPdfFor(table, rec);
    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Quickupp-Receipt-${orderNumberOf(rec)}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[Receipt API Error]", err);
    return Response.json({ error: "Unable to generate the receipt. Please contact support." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { getPool } from "@/lib/db";
import { getUserFor } from "@/lib/crm/auth";
import { actorOf } from "@/lib/crm/activity";
import { resolvePayTable } from "@/lib/crm/paymentTable";
import { readJson } from "@/lib/enquiry";
import { errMessage } from "@/lib/err";
import { receiptContextFor, sendClientReceipt } from "@/lib/clientReceipt";

/*
 * "Email receipt to client" in the CRM: sends the client the payment email with
 * the PDF receipt for the latest payment on a record (website payment, payment
 * link or balance link) again, e.g. when the first one didn't arrive.
 */
export async function POST(req: Request) {
  try {
    const user = await getUserFor("payments");
    if (!user) return NextResponse.json({ ok: false, error: "Please sign in again." }, { status: 401 });
    const body = await readJson(req);
    const id = Number(body?.id);
    if (!id) return NextResponse.json({ ok: false, error: "Payment ID is required." }, { status: 400 });

    const picked = await resolvePayTable(id, body?.table);
    if ("error" in picked) return NextResponse.json({ ok: false, error: picked.error }, { status: picked.status });
    const [rows] = await getPool().query<RowDataPacket[]>(`SELECT * FROM \`${picked.table}\` WHERE id = ? LIMIT 1`, [id]);
    const rec = rows[0];
    if (!rec) return NextResponse.json({ ok: false, error: "Payment record not found." }, { status: 404 });

    const ctx = await receiptContextFor(picked.table, rec);
    if (!ctx) return NextResponse.json({ ok: false, error: "No payment has been received on this record yet, so there is no receipt to send." }, { status: 409 });

    const sent = await sendClientReceipt({ table: picked.table, ctx, actor: actorOf(user) });
    if (!sent.ok) return NextResponse.json({ ok: false, error: `The receipt could not be emailed: ${sent.error}` }, { status: 502 });
    return NextResponse.json({ ok: true, to: sent.to });
  } catch (err) {
    return NextResponse.json({ ok: false, error: errMessage(err) || "Couldn't send the receipt." }, { status: 500 });
  }
}

import { getUserFor } from "@/lib/crm/auth";
import { getRecord, listTransactions } from "@/lib/paymentTxns";

/*
 * GET ?table=payments|payment_links&id= → every PayPal transaction on one
 * payment record (deposit, balance or full), oldest first, each with its
 * transaction ID and time. See lib/paymentTxns.
 */
export async function GET(request: Request) {
  if (!(await getUserFor("payments"))) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const sp = new URL(request.url).searchParams;
  const table = sp.get("table") === "payment_links" ? "payment_links" : "payments";
  const id = Number(sp.get("id"));
  if (!Number.isInteger(id) || id <= 0) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const rec = await getRecord(table, id);
  if (!rec) return Response.json({ ok: false, error: "This payment was deleted." }, { status: 404 });
  return Response.json({ ok: true, items: await listTransactions(table, id, rec) });
}

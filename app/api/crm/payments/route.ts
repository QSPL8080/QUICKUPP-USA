import { getPool } from "@/lib/db";
import { getUserFor } from "@/lib/crm/auth";
import { validatePayment } from "@/lib/crm/payments";
import { readJson } from "@/lib/enquiry";
import { parseIds } from "@/lib/crm/ids";
import { actorOf, logActivity, money } from "@/lib/crm/activity";
import { statusLabel } from "@/lib/crm/paymentActivity";

/* POST → add a payment entered by hand */
export async function POST(request: Request) {
  const user = await getUserFor("payments");
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const result = validatePayment(body);
  if (!result.ok) return Response.json({ ok: false, errors: result.errors }, { status: 400 });
  const d = result.data;
  const [res] = await getPool().execute(
    `INSERT INTO payments (client_name, client_email, client_phone, company_name, category, service, description, amount, total_amount, payment_type, remaining_amount, currency, method, status,
       source, reference, invoice_number, paid_at, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual', ?, ?, ?, ?, ?)`,
    [d.clientName, d.clientEmail, d.clientPhone, d.companyName, d.category, d.service, d.description, d.amount, d.totalAmount, d.paymentType, d.remainingAmount, d.currency, d.method, d.status,
      d.reference, d.invoiceNumber, d.paidAt, d.notes, user.id]
  );
  const newId = (res as { insertId: number }).insertId;
  await logActivity({
    entity: "payment",
    id: newId,
    action: "created",
    newValue: money(d.amount),
    text: `Payment of ${money(d.amount)}${Number(d.totalAmount) > Number(d.amount) ? ` (of ${money(d.totalAmount)})` : ""} recorded manually via ${d.method} — ${statusLabel(d.status)}`,
    actor: actorOf(user),
  });
  return Response.json({ ok: true, id: newId });
}

/*
 * DELETE { keys: ["pay:5", "link:3"] } → permanently remove several payment
 * records (pay) and payment links (link). A payment and a link can share an
 * id, so each key names its table. { ids: [...] } still removes payment records.
 */
export async function DELETE(request: Request) {
  const user = await getUserFor("payments");
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const body = await readJson(request);
  const pay: number[] = [];
  const link: number[] = [];
  if (Array.isArray(body?.keys)) {
    if (!body.keys.length || body.keys.length > 400) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
    for (const k of body.keys) {
      const m = /^(pay|link):(\d{1,10})$/.exec(String(k));
      if (!m) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
      (m[1] === "link" ? link : pay).push(Number(m[2]));
    }
  } else {
    const ids = parseIds(body?.ids);
    if (!ids) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
    pay.push(...ids);
  }
  const pool = getPool();
  let deleted = 0;
  if (pay.length) {
    const [res] = await pool.query("DELETE FROM payments WHERE id IN (?)", [pay]);
    deleted += (res as { affectedRows: number }).affectedRows;
  }
  if (link.length) {
    const [res] = await pool.query("DELETE FROM payment_links WHERE id IN (?)", [link]).catch(() => [{ affectedRows: 0 }]);
    deleted += (res as { affectedRows: number }).affectedRows;
  }
  if (!deleted) return Response.json({ ok: false, error: "These payments were already deleted." }, { status: 404 });
  return Response.json({ ok: true, deleted });
}

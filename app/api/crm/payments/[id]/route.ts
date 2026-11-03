import { getPool } from "@/lib/db";
import { getCurrentUser } from "@/lib/crm/auth";
import { validatePayment } from "@/lib/crm/payments";
import { readJson } from "@/lib/enquiry";

type Ctx = { params: Promise<{ id: string }> };

const parseId = async (ctx: Ctx) => {
  const id = Number((await ctx.params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
};

/* PATCH → edit a payment */
export async function PATCH(request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const id = await parseId(ctx);
  const body = await readJson(request);
  if (!id || !body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const result = validatePayment(body);
  if (!result.ok) return Response.json({ ok: false, errors: result.errors }, { status: 400 });
  const d = result.data;
  await getPool().execute(
    `UPDATE payments SET client_name = ?, client_email = ?, client_phone = ?, company_name = ?, category = ?, service = ?, description = ?, amount = ?,
       total_amount = ?, payment_type = ?, remaining_amount = ?, currency = ?, method = ?, status = ?, reference = ?, invoice_number = ?, paid_at = ?, notes = ?
     WHERE id = ?`,
    [d.clientName, d.clientEmail, d.clientPhone, d.companyName, d.category, d.service, d.description, d.amount,
      d.totalAmount, d.paymentType, d.remainingAmount, d.currency, d.method, d.status,
      d.reference, d.invoiceNumber, d.paidAt, d.notes, id]
  );
  return Response.json({ ok: true });
}

/* DELETE → permanently remove a payment (any CRM user) */
export async function DELETE(_request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const id = await parseId(ctx);
  if (!id) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  // permanently removed from the database (no hidden "deleted" copies are kept)
  const pool = getPool();
  const [res1] = await pool.execute("DELETE FROM payment_links WHERE id = ?", [id]).catch(() => [{ affectedRows: 0 }]);
  const [res2] = await pool.execute("DELETE FROM payments WHERE id = ?", [id]).catch(() => [{ affectedRows: 0 }]);
  const totalDeleted = Number((res1 as any)?.affectedRows || 0) + Number((res2 as any)?.affectedRows || 0);
  if (!totalDeleted) {
    return Response.json({ ok: false, error: "This payment was already deleted." }, { status: 404 });
  }
  return Response.json({ ok: true });
}

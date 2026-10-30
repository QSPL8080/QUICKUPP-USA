import { getPool } from "@/lib/db";
import { getCurrentUser, isSuperAdmin } from "@/lib/crm/auth";
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
    `UPDATE payments SET client_name = ?, client_email = ?, company_name = ?, service = ?, description = ?, amount = ?,
       currency = ?, method = ?, status = ?, reference = ?, invoice_number = ?, paid_at = ?, notes = ?
     WHERE id = ?`,
    [d.clientName, d.clientEmail, d.companyName, d.service, d.description, d.amount, d.currency, d.method, d.status,
      d.reference, d.invoiceNumber, d.paidAt, d.notes, id]
  );
  return Response.json({ ok: true });
}

/* DELETE → remove a payment (super admin only) */
export async function DELETE(_request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  if (!isSuperAdmin(user)) return Response.json({ ok: false, error: "Only the super admin can delete payments." }, { status: 403 });
  const id = await parseId(ctx);
  if (!id) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  await getPool().execute("DELETE FROM payments WHERE id = ?", [id]);
  return Response.json({ ok: true });
}

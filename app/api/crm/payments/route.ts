import { getPool } from "@/lib/db";
import { getCurrentUser } from "@/lib/crm/auth";
import { validatePayment } from "@/lib/crm/payments";
import { readJson } from "@/lib/enquiry";

/* POST → add a payment entered by hand */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const result = validatePayment(body);
  if (!result.ok) return Response.json({ ok: false, errors: result.errors }, { status: 400 });
  const d = result.data;
  const [res] = await getPool().execute(
    `INSERT INTO payments (client_name, client_email, company_name, service, description, amount, currency, method, status,
       source, reference, invoice_number, paid_at, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual', ?, ?, ?, ?, ?)`,
    [d.clientName, d.clientEmail, d.companyName, d.service, d.description, d.amount, d.currency, d.method, d.status,
      d.reference, d.invoiceNumber, d.paidAt, d.notes, user.id]
  );
  return Response.json({ ok: true, id: (res as { insertId: number }).insertId });
}

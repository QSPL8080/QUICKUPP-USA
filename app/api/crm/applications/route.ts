import { getPool } from "@/lib/db";
import { getCurrentUser } from "@/lib/crm/auth";
import { parseIds } from "@/lib/crm/ids";
import { APPLICATION_STATUSES } from "@/lib/applications";
import { readJson } from "@/lib/enquiry";

/* PATCH { id, status } → change an application's status (any CRM user) */
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const body = await readJson(request);
  const id = Number(body?.id);
  if (!Number.isInteger(id) || id < 1 || !(APPLICATION_STATUSES as readonly string[]).includes(String(body?.status))) {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  await getPool().execute("UPDATE job_applications SET status = ? WHERE id = ?", [String(body?.status), id]);
  return Response.json({ ok: true });
}

/* DELETE { ids: [...] } → permanently remove applications, resumes included (any CRM user) */
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const body = await readJson(request);
  const ids = body?.ids !== undefined ? parseIds(body.ids) : parseIds([body?.id]);
  if (!ids) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const [res] = await getPool().query("DELETE FROM job_applications WHERE id IN (?)", [ids]);
  const deleted = (res as { affectedRows: number }).affectedRows;
  if (!deleted) return Response.json({ ok: false, error: "Already deleted." }, { status: 404 });
  return Response.json({ ok: true, deleted });
}

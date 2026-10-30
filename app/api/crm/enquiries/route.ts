import { getPool } from "@/lib/db";
import { getCurrentUser, isSuperAdmin } from "@/lib/crm/auth";
import { ENQUIRY_STATUSES, SOURCES, isEnquirySource } from "@/lib/crm/data";
import { readJson } from "@/lib/enquiry";

/* PATCH { source, id, status } → change an enquiry's status (any CRM user) */
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const body = await readJson(request);
  const id = Number(body?.id);
  if (!isEnquirySource(body?.source) || !Number.isInteger(id) || id < 1 || !(ENQUIRY_STATUSES as readonly string[]).includes(String(body?.status))) {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  await getPool().execute(`UPDATE \`${SOURCES[body.source].table}\` SET status = ? WHERE id = ?`, [String(body.status), id]);
  return Response.json({ ok: true });
}

/* DELETE { source, id } → remove an enquiry (super admin only) */
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  if (!isSuperAdmin(user)) return Response.json({ ok: false, error: "Only the super admin can delete enquiries." }, { status: 403 });
  const body = await readJson(request);
  const id = Number(body?.id);
  if (!isEnquirySource(body?.source) || !Number.isInteger(id) || id < 1) {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  // permanently removed from the database (no hidden "deleted" copies are kept)
  const [res] = await getPool().execute(`DELETE FROM \`${SOURCES[body.source].table}\` WHERE id = ?`, [id]);
  if (!(res as { affectedRows: number }).affectedRows) {
    return Response.json({ ok: false, error: "This enquiry was already deleted." }, { status: 404 });
  }
  return Response.json({ ok: true });
}

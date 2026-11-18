import { getPool } from "@/lib/db";
import { deleteOrTrash } from "@/lib/crm/trash";
import { getUserFor } from "@/lib/crm/auth";
import { parseIds } from "@/lib/crm/ids";
import { APPLICATION_STATUSES } from "@/lib/applications";
import { readJson } from "@/lib/enquiry";

/* PATCH { id, status } → change an application's status (any CRM user) */
export async function PATCH(request: Request) {
  const user = await getUserFor("applications");
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const body = await readJson(request);
  const id = Number(body?.id);
  if (!Number.isInteger(id) || id < 1 || !(APPLICATION_STATUSES as readonly string[]).includes(String(body?.status))) {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  await getPool().execute("UPDATE job_applications SET status = ? WHERE id = ?", [String(body?.status), id]);
  return Response.json({ ok: true });
}

/* DELETE { ids: [...] } → the Super Admin removes applications for good (resumes included); anyone else moves them to the Bin */
export async function DELETE(request: Request) {
  const user = await getUserFor("applications");
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const body = await readJson(request);
  const ids = body?.ids !== undefined ? parseIds(body.ids) : parseIds([body?.id]);
  if (!ids) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const { count: deleted, trashed } = await deleteOrTrash({
    entity: "application",
    table: "job_applications",
    ids,
    user,
    describe: (r) => ({ label: String(r.full_name || "Applicant"), detail: `Application · ${String(r.job_title || "")}` }),
    forGood: async (list) => {
      const [res] = await getPool().query("DELETE FROM job_applications WHERE id IN (?)", [list]);
      return (res as { affectedRows: number }).affectedRows;
    },
  });
  if (!deleted) return Response.json({ ok: false, error: "Already deleted." }, { status: 404 });
  return Response.json({ ok: true, deleted, trashed });
}

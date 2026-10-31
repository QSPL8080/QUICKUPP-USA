import { getPool } from "@/lib/db";
import { getCurrentUser } from "@/lib/crm/auth";
import { parseIds } from "@/lib/crm/ids";
import { readJson } from "@/lib/enquiry";
import { validateJob } from "@/lib/jobs";

/* POST → add a job opening */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const result = validateJob(body);
  if (!result.ok) return Response.json({ ok: false, errors: result.errors }, { status: 400 });
  const d = result.data;
  const [res] = await getPool().execute(
    `INSERT INTO job_openings (title, department, employment_type, location, experience, responsibilities, skills, deadline, is_open, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [d.title, d.department, d.employmentType, d.location, d.experience, d.responsibilities, d.skills, d.deadline, d.isOpen ? 1 : 0, user.id]
  );
  return Response.json({ ok: true, id: (res as { insertId: number }).insertId });
}

/* DELETE { ids: [...] } → permanently remove several job openings */
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const body = await readJson(request);
  const ids = parseIds(body?.ids);
  if (!ids) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const [res] = await getPool().query("DELETE FROM job_openings WHERE id IN (?)", [ids]);
  const deleted = (res as { affectedRows: number }).affectedRows;
  if (!deleted) return Response.json({ ok: false, error: "These job openings were already deleted." }, { status: 404 });
  return Response.json({ ok: true, deleted });
}

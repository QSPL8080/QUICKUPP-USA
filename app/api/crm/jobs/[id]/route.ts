import { getPool } from "@/lib/db";
import { getCurrentUser } from "@/lib/crm/auth";
import { readJson } from "@/lib/enquiry";
import { validateJob } from "@/lib/jobs";

type Ctx = { params: Promise<{ id: string }> };

const parseId = async (ctx: Ctx) => {
  const id = Number((await ctx.params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
};

/* PATCH → edit a job opening, or { isOpen } alone to open / close it */
export async function PATCH(request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const id = await parseId(ctx);
  const body = await readJson(request);
  if (!id || !body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });

  if (Object.keys(body).length === 1 && typeof body.isOpen === "boolean") {
    await getPool().execute("UPDATE job_openings SET is_open = ? WHERE id = ?", [body.isOpen ? 1 : 0, id]);
    return Response.json({ ok: true });
  }

  const result = validateJob(body);
  if (!result.ok) return Response.json({ ok: false, errors: result.errors }, { status: 400 });
  const d = result.data;
  const [res] = await getPool().execute(
    `UPDATE job_openings SET title = ?, department = ?, employment_type = ?, location = ?, experience = ?,
       responsibilities = ?, skills = ?, deadline = ?, is_open = ? WHERE id = ?`,
    [d.title, d.department, d.employmentType, d.location, d.experience, d.responsibilities, d.skills, d.deadline, d.isOpen ? 1 : 0, id]
  );
  if (!(res as { affectedRows: number }).affectedRows) return Response.json({ ok: false, error: "This job opening no longer exists." }, { status: 404 });
  return Response.json({ ok: true });
}

/* DELETE → permanently remove a job opening */
export async function DELETE(_request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const id = await parseId(ctx);
  if (!id) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const [res] = await getPool().execute("DELETE FROM job_openings WHERE id = ?", [id]);
  if (!(res as { affectedRows: number }).affectedRows) return Response.json({ ok: false, error: "This job opening was already deleted." }, { status: 404 });
  return Response.json({ ok: true });
}

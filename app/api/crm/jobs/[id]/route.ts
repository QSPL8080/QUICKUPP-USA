import { getPool } from "@/lib/db";
import { deleteOrTrash } from "@/lib/crm/trash";
import { getUserFor } from "@/lib/crm/auth";
import { readJson } from "@/lib/enquiry";
import { validateJob } from "@/lib/jobs";

type Ctx = { params: Promise<{ id: string }> };

const parseId = async (ctx: Ctx) => {
  const id = Number((await ctx.params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
};

/* PATCH → edit a job opening, or { isOpen } alone to open / close it */
export async function PATCH(request: Request, ctx: Ctx) {
  const user = await getUserFor("jobs");
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

/* DELETE → moves a job opening to the Bin (the Super Admin restores or removes it for good there) */
export async function DELETE(_request: Request, ctx: Ctx) {
  const user = await getUserFor("jobs");
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const id = await parseId(ctx);
  if (!id) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const { count, trashed } = await deleteOrTrash({
    entity: "job",
    table: "job_openings",
    ids: [id],
    user,
    describe: (r) => ({ label: String(r.title || "Job opening"), detail: `Job opening · ${String(r.department || "")}` }),
    links: async (list, db) => {
      // its applications are kept; on restore they point at it again
      const [apps] = await db.query("SELECT id, job_id FROM job_applications WHERE job_id IN (?)", [list]);
      const out: Record<number, { applications: number[] }> = {};
      for (const a of apps as { id: number; job_id: number }[]) (out[Number(a.job_id)] ||= { applications: [] }).applications.push(Number(a.id));
      return out;
    },
    forGood: async (list) => {
      const [res] = await getPool().query("DELETE FROM job_openings WHERE id IN (?)", [list]);
      return (res as { affectedRows: number }).affectedRows;
    },
  });
  if (!count) return Response.json({ ok: false, error: "This job opening was already deleted." }, { status: 404 });
  return Response.json({ ok: true, trashed });
}

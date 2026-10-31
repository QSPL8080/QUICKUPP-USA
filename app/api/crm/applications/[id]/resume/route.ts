import { getPool } from "@/lib/db";
import { getCurrentUser } from "@/lib/crm/auth";

/* GET → download a candidate's resume (signed-in CRM users only) */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Please sign in again.", { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return new Response("Not found", { status: 404 });
  const [rows] = await getPool().query("SELECT resume_name, resume_type, resume_data FROM job_applications WHERE id = ?", [id]);
  const r = (rows as Record<string, unknown>[])[0];
  if (!r) return new Response("Not found", { status: 404 });
  const data = r.resume_data as Buffer;
  const name = String(r.resume_name);
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": String(r.resume_type),
      "Content-Length": String(data.length),
      "Content-Disposition": `attachment; filename="${name.replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

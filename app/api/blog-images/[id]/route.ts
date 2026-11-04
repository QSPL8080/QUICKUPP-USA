import { getPool } from "@/lib/db";

/* GET → a blog image uploaded from the CRM (public, cached) */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return new Response("Not found", { status: 404 });
  try {
    const [rows] = await getPool().query("SELECT mime, data FROM blog_images WHERE id = ?", [id]);
    const r = (rows as Record<string, unknown>[])[0];
    if (!r) return new Response("Not found", { status: 404 });
    const data = r.data as Buffer;
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": String(r.mime),
        "Content-Length": String(data.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

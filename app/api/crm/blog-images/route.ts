import { getPool } from "@/lib/db";
import { getCurrentUser } from "@/lib/crm/auth";

/*
 * POST (multipart, field "files") → store blog images in the database.
 * Returns the public URL of each: /api/blog-images/<id>
 */
const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export async function POST(request: Request) {
  const me = await getCurrentUser();
  if (!me) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "Invalid upload." }, { status: 400 });
  }
  const files = form.getAll("files").filter((f): f is File => typeof f === "object" && f !== null && "arrayBuffer" in f);
  if (!files.length) return Response.json({ ok: false, error: "Please choose an image." }, { status: 400 });
  if (files.length > 12) return Response.json({ ok: false, error: "Please upload up to 12 images at a time." }, { status: 400 });

  for (const f of files) {
    if (!TYPES.includes(f.type)) return Response.json({ ok: false, error: `${f.name}: please use a JPG, PNG, WebP, GIF or AVIF image.` }, { status: 400 });
    if (f.size > MAX_BYTES) return Response.json({ ok: false, error: `${f.name} is larger than 4 MB.` }, { status: 400 });
  }

  const images: { url: string; name: string }[] = [];
  try {
    for (const f of files) {
      const buf = Buffer.from(await f.arrayBuffer());
      const [res] = await getPool().query("INSERT INTO blog_images (name, mime, size, data, created_by) VALUES (?, ?, ?, ?, ?)", [
        f.name.slice(0, 255),
        f.type,
        buf.length,
        buf,
        me.id,
      ]);
      images.push({ url: `/api/blog-images/${(res as { insertId: number }).insertId}`, name: f.name });
    }
  } catch (err) {
    console.error("[blog-images] upload failed:", err);
    return Response.json({ ok: false, error: "Could not save the image. Please try again." }, { status: 500 });
  }
  return Response.json({ ok: true, images });
}

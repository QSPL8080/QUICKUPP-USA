import { getPool } from "@/lib/db";
import { getCurrentUser } from "@/lib/crm/auth";
import { type BlogDbRow, rowToCrmBlog, validateBlog } from "@/lib/blogs";
import { readJson } from "@/lib/enquiry";

type Ctx = { params: Promise<{ id: string }> };

async function parseId(ctx: Ctx): Promise<number | null> {
  const raw = (await ctx.params).id;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });

  const id = await parseId(ctx);
  if (!id) return Response.json({ ok: false, error: "Blog not found." }, { status: 404 });

  const [rows] = await getPool().query("SELECT * FROM blogs WHERE id = ? LIMIT 1", [id]);
  const blog = (rows as BlogDbRow[])[0];
  if (!blog) return Response.json({ ok: false, error: "Blog not found." }, { status: 404 });

  return Response.json({ ok: true, blog: rowToCrmBlog(blog) });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });

  const id = await parseId(ctx);
  if (!id) return Response.json({ ok: false, error: "Blog not found." }, { status: 404 });

  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });

  // Quick toggle: just switching is_published on or off
  if (Object.keys(body).length === 1 && typeof body.isPublished === "boolean") {
    await getPool().execute("UPDATE blogs SET is_published = ? WHERE id = ?", [body.isPublished ? 1 : 0, id]);
    return Response.json({ ok: true });
  }

  const result = await validateBlog(body, id);
  if (!result.ok) return Response.json({ ok: false, errors: result.errors }, { status: 400 });

  const d = result.data;

  try {
    await getPool().execute(
      `UPDATE blogs
       SET slug = ?, category = ?, title = ?, \`desc\` = ?, author = ?, author_role = ?, read_time = ?, img = ?, content = ?, is_published = ?
       WHERE id = ?`,
      [
        d.slug,
        d.category,
        d.title,
        d.desc,
        d.author,
        d.authorRole,
        d.readTime,
        d.img,
        JSON.stringify(d.content),
        d.isPublished ? 1 : 0,
        id,
      ]
    );

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[api/crm/blogs/[id]] update failed:", err);
    return Response.json({ ok: false, error: "Couldn't update the blog. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });

  const id = await parseId(ctx);
  if (!id) return Response.json({ ok: false, error: "Blog not found." }, { status: 404 });

  await getPool().execute("DELETE FROM blogs WHERE id = ?", [id]);
  return Response.json({ ok: true });
}

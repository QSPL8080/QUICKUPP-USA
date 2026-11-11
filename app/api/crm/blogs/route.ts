import { revalidatePath } from "next/cache";
import { getPool } from "@/lib/db";
import { getUserFor } from "@/lib/crm/auth";
import { getCrmBlogs, validateBlog } from "@/lib/blogs";
import { readJson } from "@/lib/enquiry";

export async function GET() {
  const me = await getUserFor("blogs");
  if (!me) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });

  // Ensure legacy blog_images table is dropped if still present on Hostinger
  getPool().query("DROP TABLE IF EXISTS blog_images").catch(() => {});

  const rows = await getCrmBlogs();
  return Response.json({ ok: true, rows });
}

export async function POST(request: Request) {
  const me = await getUserFor("blogs");
  if (!me) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });

  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });

  const result = await validateBlog(body);
  if (!result.ok) return Response.json({ ok: false, errors: result.errors }, { status: 400 });

  const d = result.data;

  try {
    const [res] = await getPool().execute(
      `INSERT INTO blogs (slug, category, title, \`desc\`, author, author_role, read_time, img, content, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ]
    );

    revalidatePath("/blog", "layout");
    revalidatePath("/resources");
    return Response.json({ ok: true, id: (res as { insertId: number }).insertId });
  } catch (err) {
    console.error("[api/crm/blogs] insert failed:", err);
    return Response.json({ ok: false, error: "Couldn't save the blog. Please try again." }, { status: 500 });
  }
}

import { getUserFor } from "@/lib/crm/auth";
import { getPool } from "@/lib/db";
import { rowToCrmBlog, type BlogDbRow } from "@/lib/blogs";
import { csvFile } from "@/lib/crm/csv";
import { exportStamp, exportZone, viewerTimeZone } from "@/lib/crm/crmTime";
import { SITE_URL } from "@/lib/siteUrl";

/*
 * GET ?q=&category=&ids= → the blogs the Website Blogs list shows (same search
 * and category), every detail including the article text, as a CSV file.
 */
const IMG = /!\[[^\]]*\]\([^)]*\)/g; // pictures inside the article

export async function GET(request: Request) {
  if (!(await getUserFor("blogs"))) return new Response("Please sign in again.", { status: 401 });
  const sp = new URL(request.url).searchParams;
  const q = (sp.get("q") || "").trim().toLowerCase();
  const category = sp.get("category") || "";
  const ids = new Set((sp.get("ids") || "").split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0));
  const [rows] = await getPool().query("SELECT * FROM blogs ORDER BY id DESC");
  const blogs = (rows as BlogDbRow[]).map(rowToCrmBlog).filter((b) => {
    if (ids.size) return ids.has(b.id);
    if (category && category !== "All" && b.category !== category) return false;
    return !q || b.title.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q) || b.category.toLowerCase().includes(q);
  });
  const tz = await viewerTimeZone();
  const zone = exportZone(tz);

  const head = [
    "Sr. No", "Blog ID", "Title", "Status", "Website Link", "Slug", "Category", "Meta Title", "Summary (meta description)",
    "Author", "Author Role", "Read Time", "Words", "Sections", "Section Headings", "Key Takeaways", "Pictures in Article",
    "Cover Image", "Article Text", `Published (${zone})`, `Created (${zone})`, `Last Updated (${zone})`,
  ];
  const lines = blogs.map((b, i) => {
    const c = b.content;
    const parts = [c.intro, ...c.sections.flatMap((s) => [s.heading, ...s.paragraphs]), c.conclusion];
    const all = parts.join("\n");
    const textOnly = parts.map((x) => x.replace(IMG, "[picture]").trim()).filter(Boolean).join("\n\n");
    const words = all.replace(IMG, " ").split(/\s+/).filter(Boolean).length;
    return [
      i + 1,
      b.id,
      b.title,
      b.isPublished ? "Published (on the website)" : "Draft (not on the website)",
      b.isPublished ? `${SITE_URL}/blog/${b.slug}` : "",
      b.slug,
      b.category,
      c.metaTitle || "",
      b.desc,
      b.author,
      b.authorRole,
      b.readTime,
      words,
      c.sections.length,
      c.sections.map((s) => s.heading).filter(Boolean).join(" | "),
      (c.keyTakeaways || []).join(" | "),
      (all.match(IMG) || []).length,
      b.img.startsWith("data:") ? "Uploaded picture" : b.img.startsWith("/") ? `${SITE_URL}${b.img}` : b.img,
      textOnly.length > 30000 ? `${textOnly.slice(0, 30000)}…` : textOnly,
      exportStamp(b.publishedAt, tz),
      exportStamp(b.createdAt, tz),
      exportStamp(b.updatedAt, tz),
    ];
  });
  return csvFile(`quickupp-blogs-${new Date().toISOString().slice(0, 10)}.csv`, head, lines);
}

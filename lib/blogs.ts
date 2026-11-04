import { getPool } from "@/lib/db";
import { blogPosts as fallbackPosts, type BlogPost } from "@/data/blogs";

export type { BlogPost };

export type BlogDbRow = {
  id: number;
  slug: string;
  category: string;
  title: string;
  desc: string;
  author: string;
  author_role: string;
  read_time: string;
  img: string;
  content: string;
  is_published: number;
  created_at: Date | string;
  updated_at: Date | string;
};

export type CrmBlog = {
  id: number;
  slug: string;
  category: string;
  title: string;
  desc: string;
  author: string;
  authorRole: string;
  readTime: string;
  img: string;
  content: BlogPost["content"];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BlogInput = {
  slug: string;
  category: string;
  title: string;
  desc: string;
  author: string;
  authorRole: string;
  readTime: string;
  img: string;
  content: BlogPost["content"];
  isPublished: boolean;
};

function parseContent(raw: unknown): BlogPost["content"] {
  if (typeof raw === "object" && raw !== null) {
    const c = raw as Record<string, unknown>;
    return {
      ...(typeof c.metaTitle === "string" && c.metaTitle ? { metaTitle: c.metaTitle } : {}),
      intro: typeof c.intro === "string" ? c.intro : "",
      keyTakeaways: Array.isArray(c.keyTakeaways) ? c.keyTakeaways.filter((x) => typeof x === "string") : [],
      sections: Array.isArray(c.sections)
        ? c.sections.map((s: Record<string, unknown>) => ({
            heading: typeof s.heading === "string" ? s.heading : "",
            paragraphs: Array.isArray(s.paragraphs) ? s.paragraphs.filter((p) => typeof p === "string") : [],
          }))
        : [],
      conclusion: typeof c.conclusion === "string" ? c.conclusion : "",
    };
  }
  if (typeof raw === "string") {
    try {
      return parseContent(JSON.parse(raw));
    } catch {
      return { intro: raw, keyTakeaways: [], sections: [], conclusion: "" };
    }
  }
  return { intro: "", keyTakeaways: [], sections: [], conclusion: "" };
}

export function rowToBlog(r: BlogDbRow): BlogPost {
  const d = new Date(r.created_at);
  const dateFormatted = isNaN(d.getTime())
    ? "October 2026"
    : d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

  return {
    slug: r.slug,
    category: r.category,
    date: dateFormatted,
    title: r.title,
    desc: r.desc,
    author: r.author,
    authorRole: r.author_role,
    readTime: r.read_time,
    img: r.img || "/images/blog-img-01.jpg",
    content: parseContent(r.content),
  };
}

export function rowToCrmBlog(r: BlogDbRow): CrmBlog {
  return {
    id: r.id,
    slug: r.slug,
    category: r.category,
    title: r.title,
    desc: r.desc,
    author: r.author,
    authorRole: r.author_role,
    readTime: r.read_time,
    img: r.img || "/images/blog-img-01.jpg",
    content: parseContent(r.content),
    isPublished: Boolean(r.is_published),
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

/** Fetches all published blogs for the public website. Falls back to static blogs on DB failure. */
export async function getPublishedBlogs(): Promise<BlogPost[]> {
  try {
    const [rows] = await getPool().query("SELECT * FROM blogs WHERE is_published = 1 ORDER BY id ASC");
    const list = rows as BlogDbRow[];
    if (list && list.length > 0) {
      return list.map(rowToBlog);
    }
  } catch (err) {
    console.warn("[blogs] DB query failed, falling back to static posts:", err);
  }
  return fallbackPosts;
}

/** Fetches a single published blog by slug for the website. Falls back to static. */
export async function getPublishedBlogBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const [rows] = await getPool().query("SELECT * FROM blogs WHERE slug = ? AND is_published = 1 LIMIT 1", [slug]);
    const list = rows as BlogDbRow[];
    if (list && list.length > 0) {
      return rowToBlog(list[0]);
    }
  } catch (err) {
    console.warn(`[blogs] DB query for ${slug} failed, falling back to static:`, err);
  }
  return fallbackPosts.find((p) => p.slug === slug) || null;
}

/** Returns all published slugs for static paths and sitemaps. */
export async function getAllBlogSlugs(): Promise<string[]> {
  try {
    const [rows] = await getPool().query("SELECT slug FROM blogs WHERE is_published = 1");
    const list = rows as { slug: string }[];
    if (list && list.length > 0) {
      return list.map((r) => r.slug);
    }
  } catch (err) {
    console.warn("[blogs] Failed to fetch slugs from DB, falling back:", err);
  }
  return fallbackPosts.map((p) => p.slug);
}

/** Fetches all blogs for CRM management (including unpublished / drafts). */
export async function getCrmBlogs(): Promise<CrmBlog[]> {
  try {
    const [rows] = await getPool().query("SELECT * FROM blogs ORDER BY id DESC");
    return (rows as BlogDbRow[]).map(rowToCrmBlog);
  } catch (err) {
    console.error("[blogs] getCrmBlogs query failed:", err);
    return [];
  }
}

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function validateBlog(
  body: Record<string, unknown>,
  currentId?: number
): Promise<{ ok: true; data: BlogInput } | { ok: false; errors: Record<string, string> }> {
  const errors: Record<string, string> = {};

  const title = text(body.title, 255);
  let slug = text(body.slug, 190).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  const category = text(body.category, 100);
  const desc = text(body.desc, 2000);
  const author = text(body.author, 150) || "Quickupp Team";
  const authorRole = text(body.authorRole, 150) || "Strategy Lead";
  const readTime = text(body.readTime, 50) || "5 min read";
  const img = text(body.img, 255) || "/images/blog-img-01.jpg";
  const isPublished = body.isPublished !== false;

  if (!title) errors.title = "Please enter a blog title.";

  if (!slug && title) {
    slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 190);
  }
  if (!slug) errors.slug = "Please enter a valid URL slug.";

  if (!category) errors.category = "Please select or enter a category.";
  if (!desc) errors.desc = "Please enter a short description/summary.";

  // Check unique slug in DB
  if (slug) {
    try {
      const [existing] = currentId
        ? await getPool().query("SELECT id FROM blogs WHERE slug = ? AND id != ? LIMIT 1", [slug, currentId])
        : await getPool().query("SELECT id FROM blogs WHERE slug = ? LIMIT 1", [slug]);
      if ((existing as { id: number }[]).length > 0) {
        errors.slug = "This URL slug is already used by another blog. Please choose a unique slug.";
      }
    } catch {}
  }

  const content = parseContent(body.content);
  if (!content.intro && !desc) {
    errors.content = "Please enter the article introduction or body content.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      slug,
      category,
      title,
      desc,
      author,
      authorRole,
      readTime,
      img,
      content,
      isPublished,
    },
  };
}

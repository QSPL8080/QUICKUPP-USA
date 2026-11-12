import { getPool } from "@/lib/db";
import type { BlogPost } from "@/data/blogs";
import { plainDashesDeep } from "@/lib/dashes";

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
  published_at?: Date | string | null;
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
  publishedAt: string;
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
  /** when the blog was (or is shown as) published */
  publishedAt: Date;
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

const DEFAULT_COVER = "/images/blog-img-01.jpg";

/*
 * An uploaded picture cut off by a too-small database column (exactly 255,
 * 65,535 or 16,777,215 characters long) can't be shown; use the default cover
 * until someone uploads it again.
 */
const CUT_LENGTHS = new Set([255, 65535, 16777215]);
function coverOf(img: string | null | undefined): string {
  if (!img) return DEFAULT_COVER;
  if (img.startsWith("data:") && CUT_LENGTHS.has(img.length)) return DEFAULT_COVER;
  return img;
}

/*
 * Pictures uploaded in the CRM are stored inside the blog itself (cover in
 * `img`, article pictures inside `content`), so both columns must be able to
 * hold several megabytes. A database whose blogs table was made before this
 * (img VARCHAR(255) and/or a TEXT content) cuts uploads off without an error;
 * widen the columns before the first save. Runs once per server start.
 */
let columnsReady: Promise<void> | null = null;
export function ensureBlogColumns(): Promise<void> {
  if (!columnsReady) {
    columnsReady = (async () => {
      const [rows] = await getPool().query(
        "SELECT COLUMN_NAME AS name, LOWER(DATA_TYPE) AS type FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'blogs' AND COLUMN_NAME IN ('img', 'content')"
      );
      for (const r of rows as { name: string; type: string }[]) {
        if (r.type !== "longtext") await getPool().query(`ALTER TABLE blogs MODIFY COLUMN \`${r.name}\` LONGTEXT NOT NULL`);
      }
    })().catch((err) => {
      columnsReady = null; // try again on the next save
      throw err;
    });
  }
  return columnsReady;
}

/** After a save: true when the database kept the whole cover and article (nothing cut off). */
export async function blogStoredInFull(id: number, img: string, content: string): Promise<boolean> {
  const [rows] = await getPool().query("SELECT CHAR_LENGTH(img) AS i, CHAR_LENGTH(content) AS c FROM blogs WHERE id = ?", [id]);
  const r = (rows as { i: number; c: number }[])[0];
  if (!r) return false;
  return Number(r.i) >= Array.from(img).length && Number(r.c) >= Array.from(content).length;
}

/** When a blog was published (blogs saved before there was a published date: when it was created) */
const publishedOf = (r: BlogDbRow) => {
  const d = new Date((r.published_at || r.created_at) as string);
  return isNaN(d.getTime()) ? null : d;
};

/** The website's audience is in the US, so blogs show US Eastern time: "November 12, 2026 · 9:30 AM EST" */
export function blogDateTime(d: Date): string {
  const day = d.toLocaleDateString("en-US", { timeZone: "America/New_York", day: "numeric", month: "long", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  return `${day} · ${time}`;
}

/* the website shows plain hyphens; long dashes and "--" typed in the CRM become "-" (lib/dashes) */
const KEEP_AS_TYPED = new Set(["slug", "img", "src", "url", "href", "date", "publishedAt"]);

export function rowToBlog(r: BlogDbRow): BlogPost {
  return plainDashesDeep(blogFromRow(r), KEEP_AS_TYPED);
}

function blogFromRow(r: BlogDbRow): BlogPost {
  const d = publishedOf(r);

  return {
    slug: r.slug,
    category: r.category,
    date: d ? blogDateTime(d) : "",
    publishedAt: d ? d.toISOString() : undefined,
    title: r.title,
    desc: r.desc,
    author: r.author,
    authorRole: r.author_role,
    readTime: r.read_time,
    img: coverOf(r.img),
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
    img: coverOf(r.img),
    content: parseContent(r.content),
    isPublished: Boolean(r.is_published),
    publishedAt: (publishedOf(r) || new Date(r.created_at)).toISOString(),
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

/*
 * The website reads blogs from the database only: every blog the CRM marks
 * "Published / show on website" appears, newest first, however many there
 * are. Unpublished (draft) and deleted blogs never appear.
 */

/** All published blogs for the website, newest first. */
export async function getPublishedBlogs(): Promise<BlogPost[]> {
  try {
    const [rows] = await getPool().query("SELECT * FROM blogs WHERE is_published = 1 ORDER BY COALESCE(published_at, created_at) DESC, id DESC");
    return (rows as BlogDbRow[]).map(rowToBlog);
  } catch (err) {
    console.error("[blogs] couldn't read the blogs from the database:", err);
    return [];
  }
}

/** One published blog by its slug, or null when there is none. */
export async function getPublishedBlogBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const [rows] = await getPool().query("SELECT * FROM blogs WHERE slug = ? AND is_published = 1 LIMIT 1", [slug]);
    const list = rows as BlogDbRow[];
    return list.length ? rowToBlog(list[0]) : null;
  } catch (err) {
    console.error(`[blogs] couldn't read blog ${slug} from the database:`, err);
    return null;
  }
}

/**
 * All blogs for the CRM list (drafts included), without the article content:
 * articles can hold many images, and the list only needs titles, covers and
 * status. The editor loads one whole blog when it is opened.
 */
export async function getCrmBlogs(): Promise<CrmBlog[]> {
  try {
    const [rows] = await getPool().query(
      "SELECT id, slug, category, title, `desc`, author, author_role, read_time, img, '' AS content, is_published, published_at, created_at, updated_at FROM blogs ORDER BY id DESC"
    );
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
  const img = typeof body.img === "string" && body.img.trim() ? body.img.trim() : "/images/blog-img-01.jpg";
  const isPublished = body.isPublished !== false;
  const publishedRaw = typeof body.publishedAt === "string" ? body.publishedAt.trim() : "";
  const publishedAt = new Date(publishedRaw);

  if (!title) errors.title = "Please enter a blog title.";
  if (!publishedRaw || isNaN(publishedAt.getTime()) || publishedAt.getFullYear() < 2000 || publishedAt.getFullYear() > 2100) {
    errors.publishedAt = "Please choose the published date and time.";
  }

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
      publishedAt,
    },
  };
}

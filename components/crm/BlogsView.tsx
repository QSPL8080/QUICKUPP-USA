"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHead } from "@/components/crm/ListTools";
import { useFeedback } from "@/components/crm/Feedback";
import type { CrmBlog } from "@/lib/blogs";
import LocalDateTime from "@/components/crm/LocalDateTime";
import BlogTextField, { BlogImageLibrary, uploadBlogImages } from "@/components/crm/BlogTextField";
import { useViewOnly } from "@/components/crm/ViewOnly";

const INDUSTRIES = [
  "Healthcare",
  "Education",
  "Real Estate",
  "Home Services",
  "IT & SaaS",
  "Interior Design",
  "Professional Services",
  "eCommerce",
  "Travel & Hospitality",
];

const PRESET_IMAGES = [
  { label: "Image 1", value: "/images/blog-img-01.jpg" },
  { label: "Image 2", value: "/images/blog-img-02.jpg" },
  { label: "Image 3", value: "/images/blog-img-03.jpg" },
  { label: "Image 4", value: "/images/blog-img-04.jpg" },
  { label: "Image 5", value: "/images/blog-img-05.jpg" },
  { label: "Image 6", value: "/images/blog-img-06.jpg" },
];

type SectionForm = {
  heading: string;
  paragraphs: string;
};

type FormState = {
  title: string;
  metaTitle: string;
  slug: string;
  category: string;
  desc: string;
  author: string;
  authorRole: string;
  readTime: string;
  /** "YYYY-MM-DDTHH:MM" in the editor's own time zone (a datetime-local field) */
  publishedAt: string;
  img: string;
  intro: string;
  keyTakeaways: string;
  sections: SectionForm[];
  conclusion: string;
  isPublished: boolean;
};

/** a moment as a datetime-local value, in this browser's time zone */
const localInput = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const showDateTime = (v: string) => {
  const d = new Date(v);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
};

const blankForm = (): FormState => ({
  title: "",
  metaTitle: "",
  slug: "",
  category: "Healthcare",
  desc: "",
  author: "Quickupp Team",
  authorRole: "Industry Research Lead",
  readTime: "6 min read",
  publishedAt: localInput(new Date()),
  img: "/images/blog-img-01.jpg",
  intro: "",
  keyTakeaways: "",
  sections: [
    { heading: "1. Key Industry Insights", paragraphs: "" },
    { heading: "2. Strategic Implementation", paragraphs: "" },
  ],
  conclusion: "",
  isPublished: true,
});

const fromBlog = (b: CrmBlog): FormState => ({
  title: b.title,
  metaTitle: b.content.metaTitle || "",
  slug: b.slug,
  category: b.category,
  desc: b.desc,
  author: b.author,
  authorRole: b.authorRole,
  readTime: b.readTime,
  publishedAt: localInput(new Date(b.publishedAt || b.createdAt)),
  img: b.img || "/images/blog-img-01.jpg",
  intro: b.content.intro || "",
  keyTakeaways: (b.content.keyTakeaways || []).join("\n"),
  sections: (b.content.sections || []).map((s) => ({
    heading: s.heading,
    paragraphs: (s.paragraphs || []).join("\n\n"),
  })),
  conclusion: b.content.conclusion || "",
  isPublished: b.isPublished,
});

/* the editor's steps, in order */
const STEPS = [
  { key: "basics", title: "Basics", sub: "Title, link, category and the short summary" },
  { key: "details", title: "Author & cover", sub: "Who wrote it, read time and the cover photo" },
  { key: "intro", title: "Introduction", sub: "Opening paragraphs and the key takeaways" },
  { key: "sections", title: "Sections", sub: "The body of the article, one section at a time" },
  { key: "finish", title: "Conclusion & images", sub: "Closing words and the pictures in the article" },
  { key: "review", title: "Review & publish", sub: "Check everything, then publish or save as a draft" },
] as const;
const LAST = STEPS.length - 1;

/* which step a field (or server error) belongs to */
const STEP_OF: Record<string, number> = { title: 0, metaTitle: 0, slug: 0, category: 0, desc: 0, author: 1, authorRole: 1, readTime: 1, publishedAt: 1, img: 1, content: 2 };

const words = (s: string) => s.replace(/!\[[^\]]*\]\([^)]*\)/g, " ").split(/\s+/).filter(Boolean).length;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 190);

export default function BlogsView({ rows }: { rows: CrmBlog[] }) {
  const router = useRouter();
  const { confirm, toast } = useFeedback();
  const viewOnly = useViewOnly();

  const [editing, setEditing] = useState<CrmBlog | "new" | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());
  const [slugLocked, setSlugLocked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0); // furthest step opened so far

  const [opening, setOpening] = useState<number | null>(null);

  /* an existing blog: load the whole blog (article and images) before editing */
  const openForm = async (b: CrmBlog | "new") => {
    if (b !== "new") {
      setOpening(b.id);
      const res = await fetch(`/api/crm/blogs/${b.id}`).catch(() => null);
      const json = res ? await res.json().catch(() => ({})) : {};
      setOpening(null);
      if (!res?.ok || !json.ok || !json.blog) {
        toast(json.error || "Couldn't open this blog. Please try again.", "error");
        return;
      }
      b = json.blog as CrmBlog;
    }
    setForm(b === "new" ? blankForm() : fromBlog(b));
    setSlugLocked(b !== "new");
    setErrors({});
    setError("");
    setStep(0);
    // an existing blog can jump to any step
    setReached(b === "new" ? 0 : LAST);
    setEditing(b);
  };

  const close = () => setEditing(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((f) => ({
      ...f,
      title: val,
      slug: !slugLocked ? slugify(val) : f.slug,
    }));
    if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
  };

  const set = (k: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    if (k === "slug") setSlugLocked(true);
    setForm((f) => ({ ...f, [k]: val }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const setSection = (index: number, key: keyof SectionForm, val: string) => {
    setForm((f) => {
      const next = [...f.sections];
      next[index] = { ...next[index], [key]: val };
      return { ...f, sections: next };
    });
  };

  const addSection = () => {
    setForm((f) => ({
      ...f,
      sections: [...f.sections, { heading: `${f.sections.length + 1}. New Section Heading`, paragraphs: "" }],
    }));
  };

  const removeSection = (index: number) => {
    setForm((f) => ({
      ...f,
      sections: f.sections.filter((_, i) => i !== index),
    }));
  };

  const handleReplaceImage = (oldUrl: string, newUrl: string) => {
    const swap = (text: string) => text.split(`](${oldUrl})`).join(`](${newUrl})`);
    setForm((f) => ({
      ...f,
      img: f.img === oldUrl ? newUrl : f.img,
      intro: swap(f.intro),
      sections: f.sections.map((sec) => ({ ...sec, paragraphs: swap(sec.paragraphs) })),
      conclusion: swap(f.conclusion),
    }));
  };

  const handleRemoveImage = (url: string) => {
    const strip = (text: string) => {
      const lines = text.split("\n");
      const filtered = lines.filter((l) => {
        const trimmed = l.trim();
        return !(trimmed.startsWith("![") && trimmed.includes(`](${url})`));
      });
      return filtered.join("\n").replace(/\n{3,}/g, "\n\n").replace(/^\n+|\n+$/g, "");
    };
    setForm((f) => ({
      ...f,
      img: f.img === url ? "" : f.img,
      intro: strip(f.intro),
      sections: f.sections.map((sec) => ({ ...sec, paragraphs: strip(sec.paragraphs) })),
      conclusion: strip(f.conclusion),
    }));
  };

  /* the required fields of one step; shows their messages and says if the step is complete */
  const checkStep = (i: number) => {
    const errs: Record<string, string> = {};
    if (i === 0) {
      if (!form.title.trim()) errs.title = "Please enter a blog title.";
      if (!slugify(form.slug)) errs.slug = "Please enter a valid URL slug.";
      if (!form.category.trim()) errs.category = "Please select or enter a category.";
      if (!form.desc.trim()) errs.desc = "Please enter a short description/summary.";
    }
    if (i === 1) {
      if (!form.publishedAt || isNaN(new Date(form.publishedAt).getTime())) errs.publishedAt = "Please choose the published date and time.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goTo = (i: number) => {
    if (i === step) return;
    // forward only through complete steps
    for (let s = step; s < i; s++) {
      if (!checkStep(s)) {
        setStep(s);
        return;
      }
    }
    setError("");
    setStep(i);
    setReached((r) => Math.max(r, i));
  };

  const takeaways = form.keyTakeaways
    .split("\n")
    .map((s) => s.replace(/^[-•*\s]+/, "").trim())
    .filter(Boolean);
  const imageCount = [form.intro, ...form.sections.map((s) => s.paragraphs), form.conclusion].join("\n").split("![](").length - 1;

  // Enter or the main button: next step, and on the last step save
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < LAST) goTo(step + 1);
    else if (!viewOnly) save();
  };

  const save = async () => {
    for (const s of [0, 1]) {
      if (!checkStep(s)) {
        setStep(s);
        return;
      }
    }
    setBusy(true);
    setErrors({});
    setError("");

    const isNew = editing === "new";
    const payload = {
      title: form.title,
      slug: form.slug,
      category: form.category,
      desc: form.desc,
      author: form.author,
      authorRole: form.authorRole,
      readTime: form.readTime,
      // the field is in this browser's time zone; the server gets the exact moment
      publishedAt: new Date(form.publishedAt).toISOString(),
      img: form.img,
      isPublished: form.isPublished,
      content: {
        metaTitle: form.metaTitle.trim(),
        intro: form.intro,
        keyTakeaways: form.keyTakeaways
          .split("\n")
          .map((s) => s.replace(/^[-•*\s]+/, "").trim())
          .filter(Boolean),
        sections: form.sections.map((s) => ({
          heading: s.heading,
          paragraphs: s.paragraphs
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean),
        })),
        conclusion: form.conclusion,
      },
    };

    const res = await fetch(isNew ? "/api/crm/blogs" : `/api/crm/blogs/${(editing as CrmBlog).id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    setBusy(false);
    const json = res ? await res.json().catch(() => ({})) : {};

    if (!res?.ok || !json.ok) {
      if (json.errors) {
        setErrors(json.errors);
        // open the step that holds the first problem
        const first = Object.keys(json.errors).map((k) => STEP_OF[k] ?? LAST);
        setStep(Math.min(...first));
        if (json.errors.content) setError(json.errors.content);
      } else setError(json.error || "Couldn't save the blog. Please try again.");
      return;
    }

    close();
    toast(isNew ? "Blog article published" : "Blog updated successfully");
    router.refresh();
  };

  const togglePublished = async (b: CrmBlog) => {
    const nextStatus = !b.isPublished;
    const res = await fetch(`/api/crm/blogs/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: nextStatus }),
    }).catch(() => null);

    if (res?.ok) {
      toast(nextStatus ? `"${b.title}" is now published on the website` : `"${b.title}" moved to drafts`);
      router.refresh();
    } else {
      toast("Couldn't update publish status", "error");
    }
  };

  const removeBlog = async (b: CrmBlog) => {
    const ok = await confirm({
      title: `Delete "${b.title}"?`,
      message: "This will remove this article from the database and website permanently.",
      confirmLabel: "Delete blog",
      tone: "danger",
    });
    if (!ok) return;

    const res = await fetch(`/api/crm/blogs/${b.id}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) {
      toast("Blog deleted");
      router.refresh();
    } else {
      toast("Couldn't delete blog", "error");
    }
  };

  // Filtered rows
  const filtered = rows.filter((r) => {
    const matchesSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.slug.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...Array.from(new Set(rows.map((r) => r.category)))];
  const publishedCount = rows.filter((r) => r.isPublished).length;
  const draftCount = rows.length - publishedCount;

  return (
    <>
      <PageHead
        title="Website Blogs"
        sub={`${rows.length} total articles (${publishedCount} published, ${draftCount} drafts) — synced live with MySQL database and website.`}
      >
        <a
          href={`/api/crm/blogs/export?${new URLSearchParams({ ...(search ? { q: search } : {}), ...(categoryFilter !== "All" ? { category: categoryFilter } : {}) }).toString()}`}
          className="crm-act crm-act-ghost"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export CSV
        </a>
        {!viewOnly && (
        <button type="button" className="crm-act crm-act-dark" onClick={() => openForm("new")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Blog Article
        </button>
        )}
      </PageHead>

      {/* Filter / Search Bar */}
      <div className="crm-filters" style={{ marginBottom: "20px" }}>
        <label className="crm-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            className="crm-input"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blogs by title, slug, or industry…"
            aria-label="Search blogs"
          />
        </label>
        <select
          className="crm-input crm-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by industry category"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All Categories" : c}
            </option>
          ))}
        </select>
        {(search || categoryFilter !== "All") && (
          <button
            type="button"
            className="crm-act crm-act-ghost"
            onClick={() => {
              setSearch("");
              setCategoryFilter("All");
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Blogs Table */}
      {/* columns drop out as the screen narrows (their details move under the title); phones get cards */}
      <div className="crm-card crm-card-flush">
        <div className="crm-table-wrap">
          <table className="crm-table crm-stack crm-blogs-table">
            <thead>
              <tr>
                <th className="crm-col-article">Article</th>
                <th className="crm-col-cat">Category</th>
                <th className="crm-col-author">Author</th>
                <th className="crm-col-read">Published on</th>
                <th className="crm-col-status">Status</th>
                <th className="crm-col-acts">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="crm-empty">
                    No blogs found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="crm-row" onClick={() => openForm(b)} aria-busy={opening === b.id || undefined} style={opening === b.id ? { opacity: 0.55, cursor: "progress" } : undefined}>
                    <td data-label="Article" className="crm-cell-main crm-col-article">
                      <div className="crm-blog-cell">
                        {b.img ? <img src={b.img} alt="" className="crm-blog-thumb" /> : <span className="crm-blog-thumb" aria-hidden="true" />}
                        <div className="crm-blog-text">
                          <span className="crm-blog-title" title={b.title}>
                            {b.title}
                          </span>
                          <span className="crm-blog-slug">/blog/{b.slug}</span>
                          <span className="crm-blog-meta">
                            <span className="crm-blog-meta-author">{b.author}</span>
                            <span className="crm-blog-meta-read">
                              <LocalDateTime iso={b.publishedAt} /> · {b.readTime}
                            </span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Category" className="crm-col-cat">
                      <span className="crm-pill crm-pill-pending">{b.category}</span>
                      {/* the status sits under the category when the screen is too narrow for its own column */}
                      <span className={`crm-pill crm-blog-status-inline ${b.isPublished ? "crm-pill-paid" : "crm-pill-failed"}`}>
                        {b.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td data-label="Author" className="crm-col-author">
                      <span className="crm-blog-author">{b.author}</span>
                      <span className="crm-cell-sub">{b.authorRole}</span>
                    </td>
                    <td data-label="Published on" className="crm-col-read crm-nowrap">
                      <LocalDateTime iso={b.publishedAt} />
                      <span className="crm-cell-sub">{b.readTime}</span>
                    </td>
                    <td data-label="Status" className="crm-col-status">
                      <span className={`crm-pill ${b.isPublished ? "crm-pill-paid" : "crm-pill-failed"}`}>
                        {b.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td data-label="Actions" className="crm-col-acts" onClick={(e) => e.stopPropagation()}>
                      <span className="crm-row-acts">
                        <Link
                          href={`/blog/${b.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="crm-act-btn"
                          title="View on public website"
                          aria-label="View on website"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </Link>
                        {!viewOnly && (
                        <button
                          type="button"
                          className="crm-act-btn crm-act-edit"
                          title="Edit blog"
                          aria-label="Edit blog"
                          onClick={() => openForm(b)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                        </button>
                        )}
                        {!viewOnly && (
                        <button
                          type="button"
                          className={`crm-act-btn ${b.isPublished ? "crm-act-deactivate" : "crm-act-activate"}`}
                          title={b.isPublished ? "Unpublish (Move to draft)" : "Publish on website"}
                          aria-label={b.isPublished ? "Unpublish" : "Publish"}
                          onClick={() => togglePublished(b)}
                        >
                          {b.isPublished ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <line x1="9" y1="9" x2="15" y2="15" />
                              <line x1="15" y1="9" x2="9" y2="15" />
                            </svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                        )}
                        {!viewOnly && (
                        <button
                          type="button"
                          className="crm-act-btn crm-act-delete"
                          title="Delete blog permanently"
                          aria-label="Delete blog"
                          onClick={() => removeBlog(b)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blog Editor: one step at a time (Basics → Author & cover → Introduction → Sections → Conclusion & images → Review) */}
      {editing && (
        <div className="crm-modal-wrap" onClick={close}>
          <form
            className="crm-modal crm-wiz"
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            noValidate
            role="dialog"
            aria-label={editing === "new" ? "Add new blog" : "Edit blog"}
          >
            <div className="crm-drawer-head">
              <div>
                <p className="crm-drawer-kicker">
                  {editing === "new" ? "Create New Blog Article" : `${viewOnly ? "View" : "Edit"}: ${form.title || "Blog"}`} · Step {step + 1} of {STEPS.length}
                </p>
                <h2 className="crm-drawer-title">{STEPS[step].title}</h2>
                <p className="crm-wiz-sub">{STEPS[step].sub}</p>
              </div>
              <button type="button" className="crm-icon-act" onClick={close} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ol className="crm-wiz-steps" aria-label="Steps">
              {STEPS.map((s, i) => (
                <li key={s.key}>
                  <button
                    type="button"
                    className={`crm-wiz-step${i === step ? " is-on" : ""}${i < step || (i <= reached && i !== step) ? " is-done" : ""}`}
                    onClick={() => goTo(i)}
                    disabled={i > reached + 1}
                    aria-current={i === step ? "step" : undefined}
                  >
                    <span className="crm-wiz-num">{i < step || (i <= reached && i !== step) ? "✓" : i + 1}</span>
                    <span className="crm-wiz-name">{s.title}</span>
                  </button>
                </li>
              ))}
            </ol>

            <fieldset className="crm-wiz-body crm-viewonly-fieldset" key={step} disabled={viewOnly}>
              {step === 0 && (
                <div className="crm-form-grid">
                  <label className="crm-field crm-span-2">
                    <span className="crm-label">Blog Title *</span>
                    <input
                      className="crm-input"
                      value={form.title}
                      onChange={handleTitleChange}
                      placeholder="e.g. The Growing Role of AI in Healthcare Marketing"
                      required
                    />
                    {errors.title && <span className="crm-field-error">{errors.title}</span>}
                  </label>

                  <label className="crm-field crm-span-2">
                    <span className="crm-label">Meta Title (browser tab &amp; Google)</span>
                    <input
                      className="crm-input"
                      value={form.metaTitle}
                      onChange={set("metaTitle")}
                      placeholder={`Leave empty to use: ${form.title || "Blog Title"} | Quickupp Softech`}
                      maxLength={255}
                    />
                  </label>

                  <label className="crm-field">
                    <span className="crm-label">URL Slug *</span>
                    <input
                      className="crm-input"
                      value={form.slug}
                      onChange={set("slug")}
                      placeholder="e.g. role-of-ai-in-healthcare-marketing"
                      required
                    />
                    <span className="crm-cell-sub">Live URL: /blog/{form.slug || "..."}</span>
                    {errors.slug && <span className="crm-field-error">{errors.slug}</span>}
                  </label>

                  <label className="crm-field">
                    <span className="crm-label">Industry Category *</span>
                    <input
                      className="crm-input"
                      list="industry-options"
                      value={form.category}
                      onChange={set("category")}
                      placeholder="Select or enter category"
                      required
                    />
                    <datalist id="industry-options">
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind} />
                      ))}
                    </datalist>
                    {errors.category && <span className="crm-field-error">{errors.category}</span>}
                  </label>

                  <label className="crm-field crm-span-2">
                    <span className="crm-label">Short Description / Meta Summary *</span>
                    <textarea
                      className="crm-input"
                      rows={2}
                      value={form.desc}
                      onChange={set("desc")}
                      placeholder="Brief 1-2 sentence overview shown on blog cards and Google search results"
                      required
                    />
                    {errors.desc && <span className="crm-field-error">{errors.desc}</span>}
                  </label>

                </div>
              )}

              {step === 1 && (
                <div className="crm-form-grid">
                  <label className="crm-field">
                    <span className="crm-label">Author Name</span>
                    <input className="crm-input" value={form.author} onChange={set("author")} placeholder="e.g. Healthcare Strategy Team" />
                  </label>

                  <label className="crm-field">
                    <span className="crm-label">Author Role</span>
                    <input className="crm-input" value={form.authorRole} onChange={set("authorRole")} placeholder="e.g. HealthTech Lead" />
                  </label>

                  <label className="crm-field">
                    <span className="crm-label">Estimated Read Time</span>
                    <input className="crm-input" value={form.readTime} onChange={set("readTime")} placeholder="e.g. 6 min read" />
                  </label>

                  <label className="crm-field">
                    <span className="crm-label">Published Date &amp; Time *</span>
                    <input
                      type="datetime-local"
                      className="crm-input"
                      value={form.publishedAt}
                      onChange={set("publishedAt")}
                      required
                    />
                    <span className="crm-cell-sub">Your time. The website shows it in US Eastern time.</span>
                    {errors.publishedAt && <span className="crm-field-error">{errors.publishedAt}</span>}
                  </label>

                  <div className="crm-field crm-span-2">
                    <span className="crm-label">Cover Image</span>
                    <div className="crm-btf-cover">
                      {form.img && <img src={form.img} alt="" />}
                      <div className="crm-btf-cover-side">
                        <label className="crm-btf-add">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                          </svg>
                          <span>{coverBusy ? "Processing…" : form.img ? "Replace cover" : "Upload cover"}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                            hidden
                            disabled={coverBusy}
                            onChange={async (e) => {
                              const files = e.target.files;
                              if (!files?.length) return;
                              setCoverBusy(true);
                              const r = await uploadBlogImages(files);
                              setCoverBusy(false);
                              e.target.value = "";
                              if (r.ok) setForm((f) => ({ ...f, img: r.urls[0] }));
                              else setError(r.error);
                            }}
                          />
                        </label>
                        <span className="crm-btf-hint">JPG, PNG, WebP, GIF or AVIF · up to 4 MB. Saved directly on this specific blog.</span>
                        {form.img && (
                          <button type="button" className="crm-btf-add" onClick={() => setForm((f) => ({ ...f, img: "" }))}>
                            Remove cover
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          className="crm-act crm-act-ghost crm-act-sm"
                          onClick={() => setForm((f) => ({ ...f, img: preset.value }))}
                          style={{ fontSize: "11.5px", padding: "4px 8px" }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {step === 2 && (
                <div className="crm-form-grid">
                                <p className="crm-span-2 crm-btf-help">
                    Writing tips: leave an empty line between paragraphs · start a line with <code>- </code> for a bullet · <code>**text**</code> for bold ·{" "}
                    <code>[text](/page-link)</code> for a link · <strong>Add images</strong> under a text box puts pictures exactly where your cursor is, and each image can be moved by cutting and pasting its <code>![](…)</code> line.
                  </p>

                  <div className="crm-field crm-span-2">
                    <span className="crm-label">Introduction Paragraphs</span>
                    <BlogTextField
                      rows={5}
                      value={form.intro}
                      onChange={(v) => setForm((f) => ({ ...f, intro: v }))}
                      onError={setError}
                      placeholder="Opening paragraphs. Leave an empty line between paragraphs."
                    />
                  </div>

                  {/* Content: Key Takeaways */}
                  <label className="crm-field crm-span-2">
                    <span className="crm-label">Executive Summary / Key Takeaways (one per line)</span>
                    <textarea
                      className="crm-input"
                      rows={3}
                      value={form.keyTakeaways}
                      onChange={set("keyTakeaways")}
                      placeholder="Customized Communication with Patients&#10;AI Chatbots for Nonstop Patient Help&#10;Enhanced Medical Promotion with AI"
                    />
                  </label>

                </div>
              )}

              {step === 3 && (
                <div className="crm-form-grid">
                  <p className="crm-span-2 crm-btf-help">
                    Each section is a heading with its paragraphs. Leave an empty line between paragraphs · <code>- </code> for a bullet · <code>**text**</code> for bold.
                  </p>
                  {/* Dynamic Sections */}
                  <div className="crm-span-2">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Article Sub-Sections ({form.sections.length})</h3>
                      <button type="button" className="crm-act crm-act-ghost crm-act-sm" onClick={addSection}>
                        + Add Section
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {form.sections.map((sec, idx) => (
                        <div key={idx} style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b" }}>#{idx + 1}</span>
                            <input
                              className="crm-input"
                              style={{ fontWeight: 600 }}
                              value={sec.heading}
                              onChange={(e) => setSection(idx, "heading", e.target.value)}
                              placeholder="Section Heading (e.g. 1. Customized Communication)"
                            />
                            {form.sections.length > 1 && (
                              <button
                                type="button"
                                className="crm-act-btn crm-act-delete"
                                title="Remove section"
                                onClick={() => removeSection(idx)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <BlogTextField
                            rows={5}
                            value={sec.paragraphs}
                            onChange={(v) => setSection(idx, "paragraphs", v)}
                            onError={setError}
                            placeholder="Paragraphs and bullet points for this section. Leave an empty line between paragraphs."
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {step === 4 && (
                <div className="crm-form-grid">
                  {/* Conclusion */}
                  <div className="crm-field crm-span-2">
                    <span className="crm-label">Final Thoughts / Conclusion (optional)</span>
                    <BlogTextField
                      rows={3}
                      value={form.conclusion}
                      onChange={(v) => setForm((f) => ({ ...f, conclusion: v }))}
                      onError={setError}
                      placeholder="Closing paragraphs, if not written as a section above."
                    />
                  </div>

                  <div className="crm-span-2">
                    <BlogImageLibrary
                      cover={form.img}
                      onCover={(url) => setForm((f) => ({ ...f, img: url }))}
                      onReplace={handleReplaceImage}
                      onRemove={handleRemoveImage}
                      onError={setError}
                      targets={[
                        { key: "intro", label: "Introduction", text: form.intro },
                        ...form.sections.map((sec, i) => ({
                          key: `s${i}`,
                          label: `Section ${i + 1}: ${sec.heading.replace(/^\d+\.\s*/, "").slice(0, 48) || "Untitled"}`,
                          text: sec.paragraphs,
                        })),
                        { key: "conclusion", label: "Conclusion", text: form.conclusion },
                      ]}
                      onPlace={(key, url) => {
                        const add = (t: string) => `${t.replace(/\s+$/, "")}${t.trim() ? "\n\n" : ""}![](${url})`;
                        setForm((f) => {
                          if (key === "intro") return { ...f, intro: add(f.intro) };
                          if (key === "conclusion") return { ...f, conclusion: add(f.conclusion) };
                          const i = Number(key.slice(1));
                          const sections = f.sections.map((sec, j) => (j === i ? { ...sec, paragraphs: add(sec.paragraphs) } : sec));
                          return { ...f, sections };
                        });
                      }}
                    />
                  </div>

                </div>
              )}

              {step === 5 && (
                <div className="crm-wiz-review">
                  <div className="crm-wiz-card">
                    <div className="crm-wiz-card-head">
                      <span className="crm-label">Basics</span>
                      <button type="button" className="crm-wiz-edit" onClick={() => goTo(0)}>Edit</button>
                    </div>
                    <p className="crm-wiz-title">{form.title || "—"}</p>
                    <p className="crm-cell-sub">/blog/{form.slug || "…"} · {form.category || "No category"}</p>
                    <p className="crm-cell-sub">Meta title: {form.metaTitle.trim() || `${form.title || "Blog Title"} | Quickupp Softech`}</p>
                    <p className="crm-wiz-text">{form.desc || "—"}</p>
                  </div>

                  <div className="crm-wiz-card crm-wiz-card-row">
                    {form.img ? <img src={form.img} alt="" className="crm-wiz-cover" /> : <span className="crm-wiz-cover crm-wiz-cover-none">No cover</span>}
                    <div>
                      <div className="crm-wiz-card-head">
                        <span className="crm-label">Author &amp; cover</span>
                        <button type="button" className="crm-wiz-edit" onClick={() => goTo(1)}>Edit</button>
                      </div>
                      <p className="crm-wiz-text">
                        {form.author || "—"}
                        {form.authorRole ? ` · ${form.authorRole}` : ""}
                        {form.readTime ? ` · ${form.readTime}` : ""}
                      </p>
                      <p className="crm-cell-sub">Published {showDateTime(form.publishedAt)}</p>
                    </div>
                  </div>

                  <div className="crm-wiz-card">
                    <div className="crm-wiz-card-head">
                      <span className="crm-label">Introduction</span>
                      <button type="button" className="crm-wiz-edit" onClick={() => goTo(2)}>Edit</button>
                    </div>
                    <p className="crm-wiz-text">
                      {words(form.intro)} words · {takeaways.length} key takeaway{takeaways.length === 1 ? "" : "s"}
                    </p>
                    {takeaways.length > 0 && (
                      <ul className="crm-wiz-list">
                        {takeaways.map((k) => (
                          <li key={k}>{k}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="crm-wiz-card">
                    <div className="crm-wiz-card-head">
                      <span className="crm-label">Sections ({form.sections.length})</span>
                      <button type="button" className="crm-wiz-edit" onClick={() => goTo(3)}>Edit</button>
                    </div>
                    <ol className="crm-wiz-list">
                      {form.sections.map((s, i) => (
                        <li key={i}>
                          {s.heading || "Untitled section"} <span className="crm-cell-sub">· {words(s.paragraphs)} words</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="crm-wiz-card">
                    <div className="crm-wiz-card-head">
                      <span className="crm-label">Conclusion &amp; images</span>
                      <button type="button" className="crm-wiz-edit" onClick={() => goTo(4)}>Edit</button>
                    </div>
                    <p className="crm-wiz-text">
                      {form.conclusion.trim() ? `${words(form.conclusion)} words of conclusion` : "No separate conclusion"} · {imageCount} image
                      {imageCount === 1 ? "" : "s"} in the article
                    </p>
                  </div>

                {/* Publish Toggle */}
                <label className="crm-check crm-check-row crm-span-2">
                  <input type="checkbox" checked={form.isPublished} onChange={set("isPublished")} />
                  <span className="crm-check-box" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="crm-check-text">
                    <span className="crm-strong">Published on website</span>
                    <span className="crm-cell-sub">
                      {form.isPublished ? "This article is live and visible to visitors." : "Saved as a draft; hidden from the public website."}
                    </span>
                  </span>
                </label>
                </div>
              )}
            </fieldset>

            {error && (
              <p className="crm-alert" role="alert">
                {error}
              </p>
            )}

            <div className="crm-modal-foot">
              {editing !== "new" && !viewOnly ? (
                <button type="button" className="crm-act crm-act-danger" onClick={() => removeBlog(editing as CrmBlog)} disabled={busy}>
                  Delete article
                </button>
              ) : (
                <span />
              )}
              <span className="crm-modal-foot-end">
                {step > 0 ? (
                  <button type="button" className="crm-act crm-act-ghost" onClick={() => setStep(step - 1)} disabled={busy}>
                    ← Back
                  </button>
                ) : (
                  <button type="button" className="crm-act crm-act-ghost" onClick={close}>
                    Cancel
                  </button>
                )}
                {!viewOnly && editing !== "new" && step < LAST && (
                  <button type="button" className="crm-act crm-act-ghost" onClick={() => save()} disabled={busy}>
                    {busy ? "Saving…" : "Save Changes"}
                  </button>
                )}
                {!(viewOnly && step === LAST) && (
                <button type="submit" className="crm-act crm-act-dark" disabled={busy}>
                  {step < LAST ? "Next →" : busy ? "Saving…" : editing !== "new" ? "Save Changes" : form.isPublished ? "Publish Blog" : "Save as Draft"}
                </button>
                )}
              </span>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

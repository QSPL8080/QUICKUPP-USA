"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHead } from "@/components/crm/ListTools";
import { useFeedback } from "@/components/crm/Feedback";
import type { CrmBlog } from "@/lib/blogs";
import BlogTextField, { uploadBlogImages } from "@/components/crm/BlogTextField";

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
  slug: string;
  category: string;
  desc: string;
  author: string;
  authorRole: string;
  readTime: string;
  img: string;
  intro: string;
  keyTakeaways: string;
  sections: SectionForm[];
  conclusion: string;
  isPublished: boolean;
};

const blankForm = (): FormState => ({
  title: "",
  slug: "",
  category: "Healthcare",
  desc: "",
  author: "Quickupp Team",
  authorRole: "Industry Research Lead",
  readTime: "6 min read",
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
  slug: b.slug,
  category: b.category,
  desc: b.desc,
  author: b.author,
  authorRole: b.authorRole,
  readTime: b.readTime,
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

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 190);

export default function BlogsView({ rows }: { rows: CrmBlog[] }) {
  const router = useRouter();
  const { confirm, toast } = useFeedback();

  const [editing, setEditing] = useState<CrmBlog | "new" | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());
  const [slugLocked, setSlugLocked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const openForm = (b: CrmBlog | "new") => {
    setForm(b === "new" ? blankForm() : fromBlog(b));
    setSlugLocked(b !== "new");
    setErrors({});
    setError("");
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

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
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
      img: form.img,
      isPublished: form.isPublished,
      content: {
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
      if (json.errors) setErrors(json.errors);
      else setError(json.error || "Couldn't save the blog. Please try again.");
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
        <button type="button" className="crm-act crm-act-dark" onClick={() => openForm("new")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Blog Article
        </button>
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
      <div className="crm-card crm-table-card">
        <div className="crm-scroll">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Category</th>
                <th>Author</th>
                <th>Read Time</th>
                <th>Status</th>
                <th>Actions</th>
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
                  <tr key={b.id} className="crm-row" onClick={() => openForm(b)}>
                    <td data-label="Article" className="crm-cell-main">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img
                          src={b.img}
                          alt=""
                          style={{
                            width: "48px",
                            height: "36px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            flexShrink: 0,
                            border: "1px solid #e2e8f0",
                          }}
                        />
                        <div>
                          <span className="crm-strong" style={{ display: "block", fontSize: "14.5px" }}>
                            {b.title}
                          </span>
                          <span className="crm-cell-sub" style={{ fontFamily: "monospace", fontSize: "12px" }}>
                            /blog/{b.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Category">
                      <span className="crm-pill crm-pill-pending">{b.category}</span>
                    </td>
                    <td data-label="Author" className="crm-nowrap">
                      <div>{b.author}</div>
                      <span className="crm-cell-sub">{b.authorRole}</span>
                    </td>
                    <td data-label="Read Time" className="crm-nowrap">
                      {b.readTime}
                    </td>
                    <td data-label="Status">
                      <span className={`crm-pill ${b.isPublished ? "crm-pill-paid" : "crm-pill-failed"}`}>
                        {b.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
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
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blog Editor Modal Drawer */}
      {editing && (
        <div className="crm-modal-wrap" onClick={close}>
          <form
            className="crm-modal"
            style={{ maxWidth: "860px", width: "95%" }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={save}
            noValidate
            role="dialog"
            aria-label={editing === "new" ? "Add new blog" : "Edit blog"}
          >
            <div className="crm-drawer-head">
              <div>
                <p className="crm-drawer-kicker">Content &amp; Blogs</p>
                <h2 className="crm-drawer-title">{editing === "new" ? "Create New Blog Article" : `Edit: ${form.title}`}</h2>
              </div>
              <button type="button" className="crm-icon-act" onClick={close} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="crm-form-grid" style={{ maxHeight: "calc(88vh - 140px)", overflowY: "auto", paddingRight: "6px" }}>
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

              <div className="crm-field">
                <span className="crm-label">Cover Image</span>
                <div className="crm-btf-cover">
                  {form.img && <img src={form.img} alt="" />}
                  <div className="crm-btf-cover-side">
                    <label className="crm-btf-add">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                      </svg>
                      <span>{coverBusy ? "Uploading…" : "Upload cover"}</span>
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
                    <span className="crm-btf-hint">JPG, PNG, WebP, GIF or AVIF · up to 4 MB. Shown at the top of the blog and on the Blogs page.</span>
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

              {/* Content: Introduction */}
              <p className="crm-span-2 crm-btf-help">
                Writing tips: leave an empty line between paragraphs · start a line with <code>- </code> for a bullet · <code>**text**</code> for bold ·{" "}
                <code>[text](/page-link)</code> for a link · use <strong>Add images</strong> to place pictures between paragraphs.
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

              {/* Dynamic Sections */}
              <div className="crm-span-2" style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px", marginTop: "8px" }}>
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

            {error && (
              <p className="crm-alert" role="alert" style={{ margin: "12px 24px 0" }}>
                {error}
              </p>
            )}

            <div className="crm-modal-foot">
              {editing !== "new" ? (
                <button type="button" className="crm-act crm-act-danger" onClick={() => removeBlog(editing as CrmBlog)} disabled={busy}>
                  Delete article
                </button>
              ) : (
                <span />
              )}
              <span className="crm-modal-foot-end">
                <button type="button" className="crm-act crm-act-ghost" onClick={close}>
                  Cancel
                </button>
                <button type="submit" className="crm-act crm-act-dark" disabled={busy}>
                  {busy ? "Saving…" : editing === "new" ? "Publish Blog" : "Save Changes"}
                </button>
              </span>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

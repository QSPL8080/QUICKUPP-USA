"use client";

import { useRef, useState } from "react";
import BlogRichText from "@/components/BlogRichText";

/*
 * A blog text box with image upload. Uploaded images are placed where the
 * cursor is as their own line, "![caption](url)", so they show up between
 * the paragraphs on the blog page. Images next to each other form a gallery.
 */

export async function uploadBlogImages(files: FileList | File[]): Promise<{ ok: true; urls: string[] } | { ok: false; error: string }> {
  const fd = new FormData();
  Array.from(files).forEach((f) => fd.append("files", f));
  const res = await fetch("/api/crm/blog-images", { method: "POST", body: fd }).catch(() => null);
  const data = res ? await res.json().catch(() => null) : null;
  if (!res || !res.ok || !data?.ok) return { ok: false, error: data?.error || "Could not upload the image. Please try again." };
  return { ok: true, urls: (data.images as { url: string }[]).map((i) => i.url) };
}

const IMG_LINE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;

export default function BlogTextField({
  value,
  onChange,
  rows = 4,
  placeholder,
  onError,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  onError?: (msg: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);

  const remember = () => {
    if (ref.current) caret.current = ref.current.selectionStart;
  };

  const tidy = (s: string) => s.replace(/\n{3,}/g, "\n\n").replace(/^\n+/, "");

  const insertImages = (urls: string[]) => {
    const at = caret.current ?? value.length;
    // place the images at the end of the paragraph the cursor is in
    const nextBreak = value.indexOf("\n\n", at);
    const pos = nextBreak === -1 ? value.length : nextBreak;
    const block = urls.map((u) => `![](${u})`).join("\n\n");
    const next = tidy(`${value.slice(0, pos)}\n\n${block}\n\n${value.slice(pos)}`).replace(/\n+$/, "");
    onChange(next);
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setBusy(true);
    const r = await uploadBlogImages(files);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    if (!r.ok) {
      onError?.(r.error);
      return;
    }
    insertImages(r.urls);
  };

  // images already in the text, with their captions
  const lines = value.split("\n");
  const images = lines
    .map((l, i) => ({ i, m: l.trim().match(IMG_LINE) }))
    .filter((x): x is { i: number; m: RegExpMatchArray } => Boolean(x.m))
    .map((x) => ({ line: x.i, caption: x.m[1], url: x.m[2] }));

  const setCaption = (line: number, url: string, caption: string) => {
    const next = [...lines];
    next[line] = `![${caption.replace(/[\[\]]/g, "")}](${url})`;
    onChange(next.join("\n"));
  };

  const removeImage = (line: number) => {
    const next = lines.filter((_, i) => i !== line);
    onChange(tidy(next.join("\n")).replace(/\n+$/, ""));
  };

  return (
    <div className="crm-btf">
      <textarea
        ref={ref}
        className="crm-input"
        rows={rows}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          caret.current = e.target.selectionStart;
        }}
        onSelect={remember}
        onClick={remember}
        onKeyUp={remember}
        placeholder={placeholder}
      />
      <div className="crm-btf-bar">
        <button type="button" className="crm-btf-add" onClick={() => fileRef.current?.click()} disabled={busy}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span>{busy ? "Uploading…" : "Add images"}</span>
        </button>
        <button type="button" className={`crm-btf-add crm-btf-preview-btn${preview ? " is-on" : ""}`} onClick={() => setPreview((p) => !p)} aria-pressed={preview}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>{preview ? "Hide preview" : "Preview"}</span>
        </button>
        <span className="crm-btf-hint">Images go after the paragraph your cursor is in. Several together show as a gallery.</span>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      </div>
      {preview && (
        <div className="crm-btf-preview bld-rich">
          {value.trim() ? <BlogRichText lines={value.split(/\n\s*\n/)} /> : <p className="crm-muted">Nothing written yet.</p>}
        </div>
      )}
      {images.length > 0 && (
        <ul className="crm-btf-thumbs">
          {images.map((im) => (
            <li key={`${im.line}-${im.url}`}>
              <img src={im.url} alt="" />
              <input
                className="crm-input"
                value={im.caption}
                onChange={(e) => setCaption(im.line, im.url, e.target.value)}
                placeholder="Caption (optional)"
                aria-label="Image caption"
              />
              <button type="button" className="crm-btf-remove" onClick={() => removeImage(im.line)} aria-label="Remove image" title="Remove image">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import BlogRichText from "@/components/BlogRichText";

/*
 * Reads and optimizes an image file directly in the browser into a compact,
 * web-optimized Base64 data URL (max 1400px width/height, WebP/JPEG quality 0.82).
 * This eliminates the need for any separate server database table!
 */
export async function fileToDataUrl(file: File, maxDim = 1400, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith("image/")) {
      reject(new Error(`${file.name}: please select a valid image file (JPG, PNG, WebP, GIF, AVIF).`));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error(`Failed to decode ${file.name}`));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const webp = canvas.toDataURL("image/webp", quality);
          if (webp.startsWith("data:image/webp")) {
            resolve(webp);
            return;
          }
        } catch {}
        const jpeg = canvas.toDataURL("image/jpeg", quality);
        resolve(jpeg);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload helper that converts uploaded image files directly into lightweight data URLs.
 * Stores directly on the specific blog record without creating any separate database table.
 */
export async function uploadBlogImages(files: FileList | File[]): Promise<{ ok: true; urls: string[] } | { ok: false; error: string }> {
  try {
    const list = Array.from(files);
    if (!list.length) return { ok: false, error: "Please choose an image." };
    const urls: string[] = [];
    for (const f of list) {
      const url = await fileToDataUrl(f);
      urls.push(url);
    }
    return { ok: true, urls };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Could not process image.";
    return { ok: false, error: msg };
  }
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
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingLine, setReplacingLine] = useState<number | null>(null);
  const caret = useRef<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);

  const remember = () => {
    if (ref.current) caret.current = ref.current.selectionStart;
  };

  const tidy = (s: string) => s.replace(/\n{3,}/g, "\n\n").replace(/^\n+/, "");

  const insertImages = (urls: string[]) => {
    const at = caret.current ?? value.length;
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

  const triggerReplace = (line: number) => {
    setReplacingLine(line);
    replaceInputRef.current?.click();
  };

  const onReplaceFile = async (files: FileList | null) => {
    if (!files || !files.length || replacingLine === null) return;
    setBusy(true);
    const r = await uploadBlogImages(files);
    setBusy(false);
    if (replaceInputRef.current) replaceInputRef.current.value = "";
    if (!r.ok) {
      onError?.(r.error);
      setReplacingLine(null);
      return;
    }
    const targetImg = images.find((im) => im.line === replacingLine);
    if (targetImg) {
      setCaption(replacingLine, r.urls[0], targetImg.caption);
    }
    setReplacingLine(null);
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
          <span>{busy ? "Processing…" : "Add images"}</span>
        </button>
        <button type="button" className={`crm-btf-add crm-btf-preview-btn${preview ? " is-on" : ""}`} onClick={() => setPreview((p) => !p)} aria-pressed={preview}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>{preview ? "Hide preview" : "Preview"}</span>
        </button>
        <span className="crm-btf-hint">Images are saved directly on this specific blog. Leave an empty line before and after.</span>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple hidden onChange={(e) => onFiles(e.target.files)} />
        <input ref={replaceInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden onChange={(e) => onReplaceFile(e.target.files)} />
      </div>

      {preview && (
        <div className="crm-btf-preview bld-rich">
          {value.trim() ? <BlogRichText lines={value.split(/\n\s*\n/)} /> : <p className="crm-muted">Nothing written yet.</p>}
        </div>
      )}

      {images.length > 0 && (
        <ul className="crm-btf-thumbs">
          {images.map((im) => (
            <li key={`${im.line}-${im.url.slice(0, 32)}`}>
              <img src={im.url} alt="" />
              <input
                className="crm-input"
                value={im.caption}
                onChange={(e) => setCaption(im.line, im.url, e.target.value)}
                placeholder="Caption (optional)"
                aria-label="Image caption"
              />
              <button
                type="button"
                className="crm-act crm-act-ghost crm-act-sm"
                onClick={() => triggerReplace(im.line)}
                title="Replace with another image"
                style={{ padding: "4px 8px", fontSize: "11px", whiteSpace: "nowrap" }}
              >
                Replace
              </button>
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

export type ImageTarget = { key: string; label: string; text: string };

export function BlogImageLibrary({
  cover,
  targets,
  onCover,
  onPlace,
  onReplace,
  onRemove,
  onError,
}: {
  cover: string;
  targets: ImageTarget[];
  onCover: (url: string) => void;
  onPlace: (targetKey: string, url: string) => void;
  onReplace?: (oldUrl: string, newUrl: string) => void;
  onRemove?: (url: string) => void;
  onError?: (msg: string) => void;
}) {
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [targetReplaceUrl, setTargetReplaceUrl] = useState<string | null>(null);

  // All images belonging to this specific blog
  const inText = targets.flatMap((t) => Array.from(t.text.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)).map((m) => m[1]));
  const all = Array.from(new Set([...inText, ...uploaded, ...(cover ? [cover] : [])]));

  const usedIn = (url: string) => targets.filter((t) => t.text.includes(`](${url})`)).map((t) => t.label.split(":")[0]);

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
    setUploaded((u) => [...u, ...r.urls]);
  };

  const handleStartReplace = (url: string) => {
    setTargetReplaceUrl(url);
    replaceRef.current?.click();
  };

  const handleDoReplace = async (files: FileList | null) => {
    if (!files || !files.length || !targetReplaceUrl) return;
    setBusy(true);
    const r = await uploadBlogImages(files);
    setBusy(false);
    if (replaceRef.current) replaceRef.current.value = "";
    if (!r.ok) {
      onError?.(r.error);
      setTargetReplaceUrl(null);
      return;
    }
    const newUrl = r.urls[0];
    onReplace?.(targetReplaceUrl, newUrl);
    setUploaded((u) => u.map((x) => (x === targetReplaceUrl ? newUrl : x)));
    setTargetReplaceUrl(null);
  };

  const handleRemove = (url: string) => {
    onRemove?.(url);
    setUploaded((u) => u.filter((x) => x !== url));
  };

  return (
    <div className="crm-bil">
      <div className="crm-bil-head">
        <div>
          <span className="crm-label">Blog Images (Saved in this Blog)</span>
          <span className="crm-btf-hint">
            Images belong specifically to this blog. No separate table is used. Deleting or replacing images updates this blog and database dynamically.
          </span>
        </div>
        <button type="button" className="crm-btf-add" onClick={() => fileRef.current?.click()} disabled={busy}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <span>{busy ? "Processing…" : "Add Blog Image"}</span>
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple hidden onChange={(e) => onFiles(e.target.files)} />
        <input ref={replaceRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden onChange={(e) => handleDoReplace(e.target.files)} />
      </div>

      {all.length ? (
        <ul className="crm-bil-grid">
          {all.map((url) => {
            const where = usedIn(url);
            const isCover = cover === url;
            return (
              <li key={url} className={isCover ? "is-cover" : undefined}>
                <span className="crm-bil-img">
                  <img src={url} alt="" />
                  {isCover && <span className="crm-bil-badge">Cover</span>}
                </span>
                <span className="crm-bil-where">{where.length ? `In: ${Array.from(new Set(where)).join(", ")}` : isCover ? "Used as cover" : "In library (not placed)"}</span>
                <select
                  className="crm-input crm-select"
                  value=""
                  aria-label="Place this image in"
                  onChange={(e) => {
                    if (e.target.value) onPlace(e.target.value, url);
                  }}
                >
                  <option value="">Place in…</option>
                  {targets.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                  <button
                    type="button"
                    className="crm-act crm-act-ghost crm-act-sm"
                    style={{ fontSize: "11px", padding: "4px 8px", flex: 1 }}
                    onClick={() => onCover(isCover ? "" : url)}
                  >
                    {isCover ? "Unset cover" : "Set cover"}
                  </button>
                  <button
                    type="button"
                    className="crm-act crm-act-ghost crm-act-sm"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                    onClick={() => handleStartReplace(url)}
                    title="Replace this image with a new file"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    className="crm-act crm-act-ghost crm-act-sm"
                    style={{ fontSize: "11px", padding: "4px 8px", color: "#ef4444" }}
                    onClick={() => handleRemove(url)}
                    title="Remove this image from blog"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="crm-bil-empty">No images uploaded for this blog yet. Add images above or place them in article paragraphs.</p>
      )}
    </div>
  );
}

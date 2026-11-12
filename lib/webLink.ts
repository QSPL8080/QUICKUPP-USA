/*
 * Website and profile links typed into the site's forms. People type them the
 * way they say them — "www.example.com", "example.com/page", "youtube.com/@me" —
 * not with "https://" in front, so the forms use plain text fields (the
 * browser's own URL field refuses anything without a scheme) and the link is
 * completed here: "https://" is added when missing.
 *
 * Shared by the forms (to check before sending) and the server (to check again
 * and store the completed link).
 */

/** The link with "https://" added when it has no scheme; "" for nothing typed */
export function normalizeLink(value: unknown): string {
  let v = String(value ?? "").trim();
  if (!v) return "";
  if (v.startsWith("//")) v = `https:${v}`;
  else if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) v = `https://${v}`;
  return v;
}

/** Whether the value (completed as above) is a web address: http(s) with a dotted host */
export function isWebLink(value: unknown): boolean {
  const v = normalizeLink(value);
  if (!v || v.length > 500) return false;
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname;
    return /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(host) || /^xn--/i.test(host.split(".").pop() || "");
  } catch {
    return false;
  }
}

export const LINK_ERROR = "Please enter a valid website, e.g. www.example.com.";

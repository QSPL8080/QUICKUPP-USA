/*
 * The website uses a plain hyphen "-" for dashes. Long dashes ("—", "–") and
 * typed double hyphens ("--") become "-": between words as " - ", inside a
 * number range ("3–30") as "3-30", and on their own (an empty value) as "-".
 * Used for text that comes from the CRM (blogs, job openings), so it reads the
 * same as the rest of the site.
 */
export function plainDashes(text: string): string {
  if (!text) return text;
  // links and image addresses are left exactly as they are
  return text
    .split(/(\]\([^)\s]*\)|https?:\/\/[^\s)"'<>]+)/)
    .map((part, i) => (i % 2 ? part : dashes(part)))
    .join("");
}

function dashes(text: string): string {
  return text
    .replace(/(\S?)([ \t]*)(?:—|–|(?<!<!)-{2,}(?!>))([ \t]*)(?=(\S?))/g, (_m, before: string, lead: string, space: string, after: string) => {
      if (!before) return lead + (after ? "- " : `-${space}`); // starts a line or stands alone
      if (!after) return `${before} -${space}`;
      return /\d/.test(before) && /\d/.test(after) ? `${before}-` : `${before} - `;
    });
}

/** plainDashes on every string inside a value (objects and arrays included), except the keys listed */
export function plainDashesDeep<T>(value: T, skip: ReadonlySet<string> = new Set()): T {
  if (typeof value === "string") return plainDashes(value) as T;
  if (Array.isArray(value)) return value.map((v) => plainDashesDeep(v, skip)) as T;
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = skip.has(k) ? v : plainDashesDeep(v, skip);
    return out as T;
  }
  return value;
}

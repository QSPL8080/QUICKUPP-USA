/** A list of row ids from a request body ({ ids: [...] }), or null if invalid. */
export function parseIds(value: unknown, max = 200): number[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > max) return null;
  const ids = [...new Set(value.map(Number))];
  return ids.every((n) => Number.isInteger(n) && n > 0) ? ids : null;
}

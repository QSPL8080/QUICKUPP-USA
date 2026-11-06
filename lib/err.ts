/*
 * Reading a caught error safely. A `catch` hands over `unknown`; these read
 * the message or code from it the same way `err.message` / `err.code` did,
 * returning "" / undefined when there is none.
 */
export function errMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null && "message" in err) {
    const m = (err as { message?: unknown }).message;
    return m == null ? "" : String(m);
  }
  return "";
}

export function errCode(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null && "code" in err) {
    const c = (err as { code?: unknown }).code;
    return c == null ? undefined : String(c);
  }
  return undefined;
}

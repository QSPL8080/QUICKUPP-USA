import { revalidatePath } from "next/cache";
import { getPool } from "@/lib/db";
import { getUserFor, type CrmUser } from "@/lib/crm/auth";
import { readJson } from "@/lib/enquiry";
import { listTrash, purgeFromTrash, restoreFromTrash } from "@/lib/crm/trash";
import { audit } from "@/lib/crm/audit";

export const dynamic = "force-dynamic";

/*
 * The Bin (Super Admin only).
 * GET                → everything in the Bin
 * POST   { key } or { keys: [...] }  → put it (them) back where it was
 * DELETE { key } or { keys: [...] }, confirm: "DELETE" → remove for good (the
 *                      typed confirmation is checked here too). Payments that
 *                      received money and leads that became clients are kept,
 *                      never removed.
 * Every restore and removal is written to the audit log, one entry per item.
 * Keys: "t:<id>" (leads, payments, payment links, blogs, jobs, applications),
 * "user:<id>" (team accounts) and "meeting:<id>" (meetings).
 * With `keys`, each item is done on its own: the reply lists what was done and
 * what couldn't be (with the reason), so one locked item doesn't stop the rest.
 */

const MAX_BULK = 200;
const GONE = "This item is no longer in the Bin.";

const refuse = () => Response.json({ ok: false, error: "Only the Super Admin can use the Bin." }, { status: 403 });

type Key = { kind: "t" | "user" | "meeting"; id: number; raw: string };
type One = { ok: true; entity: string } | { ok: false; error: string; status: number };

function parseKey(raw: unknown): Key | null {
  const m = /^(t|user|meeting):(\d{1,10})$/.exec(String(raw || ""));
  if (!m) return null;
  const id = Number(m[2]);
  return id > 0 ? { kind: m[1] as Key["kind"], id, raw: m[0] } : null;
}

/** The keys in the request: one `key`, or a list in `keys` (no repeats) */
function parseKeys(body: Record<string, unknown> | null): Key[] | null {
  if (Array.isArray(body?.keys)) {
    if (!body.keys.length || body.keys.length > MAX_BULK) return null;
    const out = new Map<string, Key>();
    for (const raw of body.keys) {
      const k = parseKey(raw);
      if (!k) return null;
      out.set(k.raw, k);
    }
    return [...out.values()];
  }
  const k = parseKey(body?.key);
  return k ? [k] : null;
}

/* the website pages that show blogs and job openings */
function refreshWebsite(entities: Set<string>) {
  if (entities.has("blog")) {
    revalidatePath("/blog", "layout");
    revalidatePath("/resources");
  }
  if (entities.has("job")) revalidatePath("/career", "layout");
}

async function restoreOne(me: CrmUser, key: Key): Promise<One> {
  const pool = getPool();
  if (key.kind === "user") {
    // the account is back and can sign in again
    const [res] = await pool.query("UPDATE crm_users SET deleted_at = NULL, deleted_by = NULL, is_active = 1 WHERE id = ? AND deleted_at IS NOT NULL", [key.id]);
    if (!(res as { affectedRows: number }).affectedRows) return { ok: false, error: GONE, status: 404 };
    await audit(me, "restore", "user", key.id, "Team account restored from the Bin");
    return { ok: true, entity: "user" };
  }
  if (key.kind === "meeting") {
    const [res] = await pool.query("UPDATE crm_meetings SET deleted_at = NULL, deleted_by = NULL WHERE id = ? AND deleted_at IS NOT NULL AND purged_at IS NULL", [key.id]);
    if (!(res as { affectedRows: number }).affectedRows) return { ok: false, error: GONE, status: 404 };
    await audit(me, "restore", "meeting", key.id, "Meeting restored from the Bin");
    return { ok: true, entity: "meeting" };
  }
  const r = await restoreFromTrash(key.id);
  if (!r.ok) return { ok: false, error: r.error, status: 409 };
  await audit(me, "restore", r.entity, `bin:${key.id}`, "Restored from the Bin");
  return { ok: true, entity: r.entity };
}

async function purgeOne(me: CrmUser, key: Key): Promise<One> {
  const pool = getPool();
  if (key.kind === "user") {
    const [found] = await pool.query("SELECT id, name, email, role FROM crm_users WHERE id = ? AND deleted_at IS NOT NULL AND role <> 'super_admin'", [key.id]);
    const u = (found as Record<string, unknown>[])[0];
    if (!u) return { ok: false, error: GONE, status: 404 };
    await pool.query("DELETE FROM crm_users WHERE id = ?", [key.id]);
    await audit(me, "hard_delete", "user", key.id, `Team account ${u.name} (${u.email}, ${u.role}) permanently deleted`, { before: u });
    return { ok: true, entity: "user" };
  }
  if (key.kind === "meeting") {
    // kept as a marked row so the Calendly sync doesn't bring the meeting back
    const [res] = await pool.query("UPDATE crm_meetings SET purged_at = UTC_TIMESTAMP() WHERE id = ? AND deleted_at IS NOT NULL AND purged_at IS NULL", [key.id]);
    if (!(res as { affectedRows: number }).affectedRows) return { ok: false, error: GONE, status: 404 };
    await audit(me, "hard_delete", "meeting", key.id, "Meeting permanently deleted from the Bin");
    return { ok: true, entity: "meeting" };
  }
  const r = await purgeFromTrash(key.id);
  if (!r.ok) {
    await audit(me, "hard_delete_refused", "bin", key.id, r.error);
    return { ok: false, error: r.error, status: 409 };
  }
  await audit(me, "hard_delete", r.entity, `bin:${key.id}`, `${r.label} permanently deleted from the Bin`);
  return { ok: true, entity: r.entity };
}

/** Runs one action over the keys, one item at a time, and builds the reply */
async function run(me: CrmUser, keys: Key[], bulk: boolean, fn: (me: CrmUser, k: Key) => Promise<One>) {
  const entities = new Set<string>();
  const failed: { key: string; error: string }[] = [];
  let done = 0;
  let last: One | null = null;
  for (const k of keys) {
    let r: One;
    try {
      r = await fn(me, k);
    } catch (err) {
      console.error("[bin] could not process", k.raw, err);
      r = { ok: false, error: "Couldn't do that. Please try again.", status: 500 };
    }
    last = r;
    if (r.ok) {
      done++;
      entities.add(r.entity);
    } else failed.push({ key: k.raw, error: r.error });
  }
  refreshWebsite(entities);
  if (!bulk && last) {
    return last.ok ? Response.json({ ok: true, entity: last.entity }) : Response.json({ ok: false, error: last.error }, { status: last.status });
  }
  // bulk: ok when at least one item went through; the rest are listed with the reason
  if (!done) return Response.json({ ok: false, done, failed, error: failed[0]?.error || "Nothing was changed." }, { status: 409 });
  return Response.json({ ok: true, done, failed });
}

export async function GET() {
  if (!(await getUserFor("trash"))) return refuse();
  return Response.json({ ok: true, items: await listTrash() });
}

export async function POST(request: Request) {
  const me = await getUserFor("trash");
  if (!me) return refuse();
  const body = await readJson(request);
  const keys = parseKeys(body);
  if (!keys) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  return run(me, keys, Array.isArray(body?.keys), restoreOne);
}

export async function DELETE(request: Request) {
  const me = await getUserFor("trash");
  if (!me) return refuse();
  const body = await readJson(request);
  const keys = parseKeys(body);
  if (!keys) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  // the confirmation: permanent deletion must be typed out
  if (body?.confirm !== "DELETE") return Response.json({ ok: false, error: "Type DELETE to confirm permanent deletion." }, { status: 400 });
  return run(me, keys, Array.isArray(body?.keys), purgeOne);
}

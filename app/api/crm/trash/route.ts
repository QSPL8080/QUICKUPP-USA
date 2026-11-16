import { revalidatePath } from "next/cache";
import { getPool } from "@/lib/db";
import { getUserFor } from "@/lib/crm/auth";
import { readJson } from "@/lib/enquiry";
import { listTrash, purgeFromTrash, restoreFromTrash } from "@/lib/crm/trash";
import { audit } from "@/lib/crm/audit";

export const dynamic = "force-dynamic";

/*
 * The Deleted bin (Super Admin only).
 * GET                → everything in the bin
 * POST   { key }     → put it back where it was
 * DELETE { key, confirm: "DELETE" } → remove it for good (the second, typed
 *                      confirmation is checked here too). Payments that received
 *                      money and leads that became clients are kept, never removed.
 * Every restore and removal is written to the audit log.
 * Keys: "t:<id>" (leads, payments, payment links, blogs, jobs, applications),
 * "user:<id>" (team accounts) and "meeting:<id>" (meetings).
 */

const refuse = () => Response.json({ ok: false, error: "Only the Super Admin can use the Deleted bin." }, { status: 403 });
const gone = () => Response.json({ ok: false, error: "This item is no longer in the Deleted bin." }, { status: 404 });

function parseKey(raw: unknown): { kind: "t" | "user" | "meeting"; id: number } | null {
  const m = /^(t|user|meeting):(\d{1,10})$/.exec(String(raw || ""));
  if (!m) return null;
  const id = Number(m[2]);
  return id > 0 ? { kind: m[1] as "t" | "user" | "meeting", id } : null;
}

/* the website pages that show blogs and job openings */
function refreshWebsite(entity: string) {
  if (entity === "blog") {
    revalidatePath("/blog", "layout");
    revalidatePath("/resources");
  }
  if (entity === "job") revalidatePath("/career", "layout");
}

export async function GET() {
  if (!(await getUserFor("trash"))) return refuse();
  return Response.json({ ok: true, items: await listTrash() });
}

export async function POST(request: Request) {
  const me = await getUserFor("trash");
  if (!me) return refuse();
  const key = parseKey((await readJson(request))?.key);
  if (!key) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const pool = getPool();
  if (key.kind === "user") {
    // the account is back and can sign in again
    const [res] = await pool.query("UPDATE crm_users SET deleted_at = NULL, deleted_by = NULL, is_active = 1 WHERE id = ? AND deleted_at IS NOT NULL", [key.id]);
    if (!(res as { affectedRows: number }).affectedRows) return gone();
    await audit(me, "restore", "user", key.id, "Team account restored from the Deleted bin");
    return Response.json({ ok: true, entity: "user" });
  }
  if (key.kind === "meeting") {
    const [res] = await pool.query("UPDATE crm_meetings SET deleted_at = NULL, deleted_by = NULL WHERE id = ? AND deleted_at IS NOT NULL AND purged_at IS NULL", [key.id]);
    if (!(res as { affectedRows: number }).affectedRows) return gone();
    await audit(me, "restore", "meeting", key.id, "Meeting restored from the Deleted bin");
    return Response.json({ ok: true, entity: "meeting" });
  }
  const r = await restoreFromTrash(key.id);
  if (!r.ok) return Response.json({ ok: false, error: r.error }, { status: 409 });
  await audit(me, "restore", r.entity, `bin:${key.id}`, "Restored from the Deleted bin");
  refreshWebsite(r.entity);
  return Response.json({ ok: true, entity: r.entity });
}

export async function DELETE(request: Request) {
  const me = await getUserFor("trash");
  if (!me) return refuse();
  const body = await readJson(request);
  const key = parseKey(body?.key);
  if (!key) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  // the second confirmation: removing for good must be typed out
  if (body?.confirm !== "DELETE") return Response.json({ ok: false, error: 'Type DELETE to confirm removing it for good.' }, { status: 400 });
  const pool = getPool();
  if (key.kind === "user") {
    const [found] = await pool.query("SELECT id, name, email, role FROM crm_users WHERE id = ? AND deleted_at IS NOT NULL AND role <> 'super_admin'", [key.id]);
    const u = (found as Record<string, unknown>[])[0];
    if (!u) return gone();
    await pool.query("DELETE FROM crm_users WHERE id = ?", [key.id]);
    await audit(me, "hard_delete", "user", key.id, `Team account ${u.name} (${u.email}, ${u.role}) removed for good`, { before: u });
    return Response.json({ ok: true, entity: "user" });
  }
  if (key.kind === "meeting") {
    // kept as a marked row so the Calendly sync doesn't bring the meeting back
    const [res] = await pool.query("UPDATE crm_meetings SET purged_at = UTC_TIMESTAMP() WHERE id = ? AND deleted_at IS NOT NULL AND purged_at IS NULL", [key.id]);
    if (!(res as { affectedRows: number }).affectedRows) return gone();
    await audit(me, "hard_delete", "meeting", key.id, "Meeting removed for good from the Deleted bin");
    return Response.json({ ok: true, entity: "meeting" });
  }
  const r = await purgeFromTrash(key.id);
  if (!r.ok) {
    await audit(me, "hard_delete_refused", "bin", key.id, r.error);
    return Response.json({ ok: false, error: r.error }, { status: 409 });
  }
  await audit(me, "hard_delete", r.entity, `bin:${key.id}`, `${r.label} removed for good from the Deleted bin`);
  return Response.json({ ok: true, entity: r.entity });
}

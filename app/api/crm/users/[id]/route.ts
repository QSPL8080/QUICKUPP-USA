import { after } from "next/server";
import { getPool } from "@/lib/db";
import { endUserSessions, getUserFor, isSuperAdmin } from "@/lib/crm/auth";
import { audit } from "@/lib/crm/audit";
import { EMAIL_RE, USERNAME_RE, getAccount, readAccountFields, renameAssignee, savePassword, uniqueErrors } from "@/lib/crm/users";
import { notifyAccountChange } from "@/lib/crm/accountMail";
import { readJson } from "@/lib/enquiry";

type Ctx = { params: Promise<{ id: string }> };

async function target(ctx: Ctx) {
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id) || id < 1) return null;
  const [rows] = await getPool().query("SELECT id, name, role FROM crm_users WHERE id = ? AND deleted_at IS NULL", [id]);
  const r = (rows as { id: number; name: string; role: string }[])[0];
  return r ? { id: Number(r.id), name: String(r.name), role: r.role } : null;
}

/*
 * PATCH → the Super Admin or an Admin edits an account.
 *  - another team member: name, username, email, role, new password (optional), active
 *  - the Super Admin account: only the Super Admin edits it
 */
export async function PATCH(request: Request, ctx: Ctx) {
  const me = await getUserFor("users");
  if (!me) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const t = await target(ctx);
  if (!t) return Response.json({ ok: false, error: "This account no longer exists." }, { status: 404 });
  if (t.role === "super_admin" && !isSuperAdmin(me)) return Response.json({ ok: false, error: "Only the Super Admin can change the Super Admin account." }, { status: 403 });
  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });

  // just switching an admin on or off
  if (Object.keys(body).length === 1 && typeof body.isActive === "boolean") {
    if (t.role === "super_admin") return Response.json({ ok: false, error: "The super admin account can't be deactivated." }, { status: 400 });
    await getPool().execute("UPDATE crm_users SET is_active = ? WHERE id = ?", [body.isActive ? 1 : 0, t.id]);
    if (!body.isActive) await endUserSessions(t.id);
    return Response.json({ ok: true });
  }

  const f = readAccountFields(body);
  const self = t.role === "super_admin";
  // nobody changes their own role or switches themselves off
  const own = t.id === me.id;
  const role = own ? t.role : f.role;
  const active = own ? 1 : body.isActive === false ? 0 : 1;
  const errors: Record<string, string> = {};
  if (!f.name) errors.name = "Please enter a name.";
  if (!USERNAME_RE.test(f.username)) errors.username = "3–30 characters: letters, numbers, dot, dash or underscore.";
  if (!EMAIL_RE.test(f.email)) errors.email = "Please enter a valid email address.";
  if (f.password && f.password.length < 8) errors.password = "Password must be at least 8 characters.";

  Object.assign(errors, await uniqueErrors({ username: errors.username ? "" : f.username, email: errors.email ? "" : f.email }, t.id));
  if (Object.keys(errors).length) return Response.json({ ok: false, errors }, { status: 400 });

  const before = await getAccount(t.id);
  if (self) {
    await getPool().execute("UPDATE crm_users SET name = ?, username = ?, email = ? WHERE id = ?", [f.name, f.username, f.email, t.id]);
    if (f.password) await savePassword(t.id, f.password);
  } else {
    await getPool().execute("UPDATE crm_users SET name = ?, username = ?, email = ?, role = ?, is_active = ? WHERE id = ?", [
      f.name,
      f.username,
      f.email,
      role,
      active,
      t.id,
    ]);
    if (f.password) await savePassword(t.id, f.password);
    // a new password, deactivation or a new role signs them out everywhere (not yourself)
    if (!own && (f.password || !active || role !== t.role)) await endUserSessions(t.id);
  }
  if (before) await renameAssignee(before.name, f.name);

  // email info@quickuppsoftech.us about changes to an admin account
  const afterAcc = await getAccount(t.id);
  if (before && afterAcc && !self) {
    after(async () => {
      await notifyAccountChange({ before, after: afterAcc, passwordChanged: Boolean(f.password), changedBy: me }).catch((err) =>
        console.error("[crm-users] change email failed:", err)
      );
    });
  }
  return Response.json({ ok: true });
}

/*
 * DELETE { reason? } → signs the person out, switches the account off and moves
 * it to the Deleted bin (the Super Admin can restore it or remove it for good).
 * The Super Admin account, and your own, can't be deleted.
 */
export async function DELETE(request: Request, ctx: Ctx) {
  const me = await getUserFor("users");
  if (!me) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const t = await target(ctx);
  if (!t) return Response.json({ ok: false, error: "This account was already deleted." }, { status: 404 });
  if (t.role === "super_admin" || t.id === me.id) {
    return Response.json({ ok: false, error: t.id === me.id ? "You can't delete your own account." : "The Super Admin account can't be deleted." }, { status: 400 });
  }
  // a soft delete (the Deleted bin), whoever does it: the Super Admin removes accounts for good from the bin
  const body = await request.json().catch(() => null);
  const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 255) || null : null;
  await getPool()
    .execute("UPDATE crm_users SET deleted_at = UTC_TIMESTAMP(), deleted_by = ?, deleted_reason = ?, is_active = 0 WHERE id = ?", [me.id, reason, t.id])
    .catch(async (err) => {
      if ((err as { code?: string }).code !== "ER_BAD_FIELD_ERROR") throw err;
      return getPool().execute("UPDATE crm_users SET deleted_at = UTC_TIMESTAMP(), deleted_by = ?, is_active = 0 WHERE id = ?", [me.id, t.id]);
    });
  await audit(me, "soft_delete", "user", t.id, `Team account ${t.name} (${t.role}) moved to the Deleted bin${reason ? ` (reason: ${reason})` : ""}`);
  await endUserSessions(t.id);
  return Response.json({ ok: true, trashed: true });
}

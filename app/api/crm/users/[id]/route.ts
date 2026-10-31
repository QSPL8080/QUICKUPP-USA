import { getPool } from "@/lib/db";
import { endUserSessions, getCurrentUser, hashPassword, isSuperAdmin } from "@/lib/crm/auth";
import { EMAIL_RE, USERNAME_RE, readAccountFields, uniqueErrors } from "@/lib/crm/users";
import { readJson } from "@/lib/enquiry";

type Ctx = { params: Promise<{ id: string }> };

async function target(ctx: Ctx) {
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id) || id < 1) return null;
  const [rows] = await getPool().query("SELECT id, role FROM crm_users WHERE id = ?", [id]);
  const r = (rows as { id: number; role: string }[])[0];
  return r ? { id: Number(r.id), role: r.role } : null;
}

/*
 * PATCH → super admin edits an account.
 *  - another admin: name, username, email, new password (optional), active
 *  - their own account: name and username only (email and password stay as they are)
 */
export async function PATCH(request: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  if (!isSuperAdmin(me)) return Response.json({ ok: false, error: "Only the super admin can edit users." }, { status: 403 });
  const t = await target(ctx);
  if (!t) return Response.json({ ok: false, error: "This account no longer exists." }, { status: 404 });
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
  const errors: Record<string, string> = {};
  if (!f.name) errors.name = "Please enter a name.";
  if (!USERNAME_RE.test(f.username)) errors.username = "3–30 characters: letters, numbers, dot, dash or underscore.";
  if (!self) {
    if (!EMAIL_RE.test(f.email)) errors.email = "Please enter a valid email address.";
    if (f.password && f.password.length < 8) errors.password = "At least 8 characters.";
  }
  Object.assign(errors, await uniqueErrors({ username: errors.username ? "" : f.username, email: self || errors.email ? "" : f.email }, t.id));
  if (Object.keys(errors).length) return Response.json({ ok: false, errors }, { status: 400 });

  if (self) {
    await getPool().execute("UPDATE crm_users SET name = ?, username = ? WHERE id = ?", [f.name, f.username, t.id]);
  } else {
    await getPool().execute("UPDATE crm_users SET name = ?, username = ?, email = ?, is_active = ? WHERE id = ?", [
      f.name,
      f.username,
      f.email,
      body.isActive === false ? 0 : 1,
      t.id,
    ]);
    if (f.password) {
      await getPool().execute("UPDATE crm_users SET password_hash = ?, failed_attempts = 0 WHERE id = ?", [await hashPassword(f.password), t.id]);
    }
    if (f.password || body.isActive === false) await endUserSessions(t.id);
  }
  return Response.json({ ok: true });
}

/* DELETE → super admin removes an admin account (their own account is locked) */
export async function DELETE(_request: Request, ctx: Ctx) {
  const me = await getCurrentUser();
  if (!me) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  if (!isSuperAdmin(me)) return Response.json({ ok: false, error: "Only the super admin can delete users." }, { status: 403 });
  const t = await target(ctx);
  if (!t) return Response.json({ ok: false, error: "This account was already deleted." }, { status: 404 });
  if (t.role === "super_admin" || t.id === me.id) {
    return Response.json({ ok: false, error: "The super admin account is locked and can't be deleted." }, { status: 400 });
  }
  await getPool().execute("DELETE FROM crm_users WHERE id = ?", [t.id]);
  return Response.json({ ok: true });
}

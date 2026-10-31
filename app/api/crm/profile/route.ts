import { getPool } from "@/lib/db";
import { getCurrentUser, isSuperAdmin } from "@/lib/crm/auth";
import { EMAIL_RE, USERNAME_RE, readAccountFields, uniqueErrors } from "@/lib/crm/users";
import { readJson } from "@/lib/enquiry";

/*
 * PATCH → the signed-in user edits their own profile.
 * Admins: name, username and email. Super admin: name and username (the
 * sign-in email stays info@quickuppsoftech.us). Passwords are never changed
 * here: admins ask the super admin.
 */
export async function PATCH(request: Request) {
  const me = await getCurrentUser();
  if (!me) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });

  const f = readAccountFields(body);
  const sa = isSuperAdmin(me);
  const errors: Record<string, string> = {};
  if (!f.name) errors.name = "Please enter your name.";
  if (!USERNAME_RE.test(f.username)) errors.username = "3–30 characters: letters, numbers, dot, dash or underscore.";
  if (!sa && !EMAIL_RE.test(f.email)) errors.email = "Please enter a valid email address.";
  Object.assign(errors, await uniqueErrors({ username: errors.username ? "" : f.username, email: sa || errors.email ? "" : f.email }, me.id));
  if (Object.keys(errors).length) return Response.json({ ok: false, errors }, { status: 400 });

  if (sa) await getPool().execute("UPDATE crm_users SET name = ?, username = ? WHERE id = ?", [f.name, f.username, me.id]);
  else await getPool().execute("UPDATE crm_users SET name = ?, username = ?, email = ? WHERE id = ?", [f.name, f.username, f.email, me.id]);
  return Response.json({ ok: true });
}

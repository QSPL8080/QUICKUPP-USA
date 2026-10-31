import { getPool } from "@/lib/db";
import { getCurrentUser, hashPassword, isSuperAdmin } from "@/lib/crm/auth";
import { EMAIL_RE, USERNAME_RE, readAccountFields, uniqueErrors } from "@/lib/crm/users";
import { readJson } from "@/lib/enquiry";

/* POST { name, username, email, password } → super admin adds an admin account */
export async function POST(request: Request) {
  const me = await getCurrentUser();
  if (!me) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  if (!isSuperAdmin(me)) return Response.json({ ok: false, error: "Only the super admin can add users." }, { status: 403 });
  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });

  const f = readAccountFields(body);
  const errors: Record<string, string> = {};
  if (!f.name) errors.name = "Please enter a name.";
  if (!USERNAME_RE.test(f.username)) errors.username = "3–30 characters: letters, numbers, dot, dash or underscore.";
  if (!EMAIL_RE.test(f.email)) errors.email = "Please enter a valid email address.";
  if (f.password.length < 8) errors.password = "At least 8 characters.";
  Object.assign(errors, await uniqueErrors({ username: errors.username ? "" : f.username, email: errors.email ? "" : f.email }));
  if (Object.keys(errors).length) return Response.json({ ok: false, errors }, { status: 400 });

  const [res] = await getPool().execute(
    "INSERT INTO crm_users (name, username, email, password_hash, role, is_active, notified_at) VALUES (?, ?, ?, ?, 'admin', ?, NOW())",
    [f.name, f.username, f.email, await hashPassword(f.password), body.isActive === false ? 0 : 1]
  );
  return Response.json({ ok: true, id: (res as { insertId: number }).insertId });
}

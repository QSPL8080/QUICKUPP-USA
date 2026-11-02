import { getPool } from "@/lib/db";
import { getCurrentUser, hashPassword } from "@/lib/crm/auth";
import { EMAIL_RE, USERNAME_RE, readAccountFields, uniqueErrors } from "@/lib/crm/users";
import { readJson } from "@/lib/enquiry";

/*
 * PATCH → the signed-in user edits their own profile.
 * Both Super Admin and Admin can update their name, username, email, and password.
 * When password is provided, it is securely hashed and stored in crm_users.
 */
export async function PATCH(request: Request) {
  const me = await getCurrentUser();
  if (!me) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });

  const f = readAccountFields(body);
  const errors: Record<string, string> = {};
  if (!f.name) errors.name = "Please enter your name.";
  if (!USERNAME_RE.test(f.username)) errors.username = "3–30 characters: letters, numbers, dot, dash or underscore.";
  if (!EMAIL_RE.test(f.email)) errors.email = "Please enter a valid email address.";
  if (f.password && f.password.length < 8) errors.password = "Password must be at least 8 characters.";
  Object.assign(errors, await uniqueErrors({ username: errors.username ? "" : f.username, email: errors.email ? "" : f.email }, me.id));
  if (Object.keys(errors).length) return Response.json({ ok: false, errors }, { status: 400 });

  if (f.password) {
    const passwordHash = await hashPassword(f.password);
    await getPool().execute(
      "UPDATE crm_users SET name = ?, username = ?, email = ?, password_hash = ?, failed_attempts = 0 WHERE id = ?",
      [f.name, f.username, f.email, passwordHash, me.id]
    );
  } else {
    await getPool().execute(
      "UPDATE crm_users SET name = ?, username = ?, email = ? WHERE id = ?",
      [f.name, f.username, f.email, me.id]
    );
  }
  return Response.json({ ok: true });
}

import { after } from "next/server";
import { getPool } from "@/lib/db";
import { getCurrentUser } from "@/lib/crm/auth";
import { EMAIL_RE, USERNAME_RE, getAccount, readAccountFields, renameAssignee, savePassword, uniqueErrors } from "@/lib/crm/users";
import { notifyAccountChange } from "@/lib/crm/accountMail";
import { readJson } from "@/lib/enquiry";

/*
 * PATCH → the signed-in user edits their own profile.
 * Both Super Admin and Admin can update their name, username, email and
 * password. The database is updated straight away (the CRM shows the new
 * details on the next page load), a new password is stored as a hash for
 * sign-in plus an encrypted copy the super admin can view, a new name follows
 * through to the leads assigned to this person, and info@quickuppsoftech.us
 * is emailed about the change.
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

  const before = await getAccount(me.id);
  if (!before) return Response.json({ ok: false, error: "This account no longer exists." }, { status: 404 });

  await getPool().execute("UPDATE crm_users SET name = ?, username = ?, email = ? WHERE id = ?", [f.name, f.username, f.email, me.id]);
  if (f.password) await savePassword(me.id, f.password);
  await renameAssignee(before.name, f.name);

  const afterAcc = await getAccount(me.id);
  if (afterAcc) {
    // the super admin's own changes are not emailed back to them
    if (me.role !== "super_admin") {
      after(async () => {
        await notifyAccountChange({ before, after: afterAcc, passwordChanged: Boolean(f.password), changedBy: me }).catch((err) =>
          console.error("[crm-profile] change email failed:", err)
        );
      });
    }
  }
  return Response.json({ ok: true });
}

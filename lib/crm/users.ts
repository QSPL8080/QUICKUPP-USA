import "server-only";
import { getPool } from "@/lib/db";
import { hashPassword } from "@/lib/crm/auth";
import { decryptSecret, encryptSecret } from "@/lib/crm/secret.mjs";
import { SOURCES } from "@/lib/crm/data";

/* CRM team accounts (Team & Users page, profile, Assigned to lists) */

export type TeamUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: "super_admin" | "admin" | "seo" | "viewer" | "hr";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  /** current password — only filled in for the super admin's Team & Users page */
  password?: string | null;
  passwordChangedAt?: string | null;
};

export async function listUsers(opts: { withPasswords?: boolean } = {}): Promise<TeamUser[]> {
  let rows: unknown;
  try {
    [rows] = await getPool().query(
      "SELECT id, name, username, email, role, is_active, last_login_at, created_at, password_view, password_changed_at FROM crm_users ORDER BY role = 'super_admin' DESC, name"
    );
  } catch {
    // before the password columns exist
    [rows] = await getPool().query(
      "SELECT id, name, username, email, role, is_active, last_login_at, created_at FROM crm_users ORDER BY role = 'super_admin' DESC, name"
    );
  }
  return (rows as Record<string, unknown>[]).map((r) => ({
    id: Number(r.id),
    name: String(r.name ?? ""),
    username: String(r.username ?? ""),
    email: String(r.email ?? ""),
    role: r.role === "super_admin" ? "super_admin" : r.role === "seo" ? "seo" : r.role === "viewer" ? "viewer" : r.role === "hr" ? "hr" : "admin",
    isActive: Number(r.is_active) === 1,
    lastLoginAt: r.last_login_at ? new Date(r.last_login_at as string).toISOString() : null,
    createdAt: new Date(r.created_at as string).toISOString(),
    ...(opts.withPasswords
      ? {
          password: decryptSecret(r.password_view),
          passwordChangedAt: r.password_changed_at ? new Date(r.password_changed_at as string).toISOString() : null,
        }
      : {}),
  }));
}

/** Account as stored now (for comparing before / after an edit) */
export async function getAccount(id: number) {
  const [rows] = await getPool().query("SELECT id, name, username, email, role FROM crm_users WHERE id = ?", [id]);
  const r = (rows as Record<string, unknown>[])[0];
  return r ? { id: Number(r.id), name: String(r.name ?? ""), username: String(r.username ?? ""), email: String(r.email ?? ""), role: String(r.role) } : null;
}

/**
 * Sets a new password: the scrypt hash used for sign-in, plus an encrypted
 * copy the super admin can view on Team & Users.
 */
export async function savePassword(userId: number, password: string) {
  const hash = await hashPassword(password);
  try {
    await getPool().execute(
      "UPDATE crm_users SET password_hash = ?, password_view = ?, password_changed_at = NOW(), failed_attempts = 0 WHERE id = ?",
      [hash, encryptSecret(password), userId]
    );
  } catch {
    await getPool().execute("UPDATE crm_users SET password_hash = ?, failed_attempts = 0 WHERE id = ?", [hash, userId]);
  }
}

/** A renamed team member keeps their leads: "Assigned to" follows the new name */
export async function renameAssignee(oldName: string, newName: string) {
  if (!oldName || !newName || oldName === newName) return;
  for (const { table } of Object.values(SOURCES)) {
    await getPool().execute(`UPDATE \`${table}\` SET assigned_to = ? WHERE assigned_to = ?`, [newName, oldName]).catch(() => {});
  }
}

/** Names of active team members who work on leads, for "Assigned to" (not the SEO, Viewer or HR roles) */
export async function listTeamNames(): Promise<string[]> {
  const [rows] = await getPool().query("SELECT name FROM crm_users WHERE is_active = 1 AND role NOT IN ('seo', 'viewer', 'hr') ORDER BY name");
  return (rows as { name: string }[]).map((r) => r.name);
}

/* shared checks for account fields */
export const USERNAME_RE = /^[a-z0-9._-]{3,30}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function readAccountFields(body: Record<string, unknown>) {
  return {
    name: text(body.name, 120),
    username: text(body.username, 30).toLowerCase(),
    email: text(body.email, 190).toLowerCase(),
    password: typeof body.password === "string" ? body.password.slice(0, 200) : "",
    // the role a super admin gives a team member (never super admin)
    role: body.role === "seo" ? ("seo" as const) : body.role === "viewer" ? ("viewer" as const) : body.role === "hr" ? ("hr" as const) : ("admin" as const),
  };
}

/** Checks that a username / email isn't used by another account; returns field errors */
export async function uniqueErrors(fields: { username?: string; email?: string }, exceptId = 0) {
  const errors: Record<string, string> = {};
  const pool = getPool();
  if (fields.username) {
    const [r] = await pool.query("SELECT id FROM crm_users WHERE username = ? AND id <> ?", [fields.username, exceptId]);
    if ((r as unknown[]).length) errors.username = "This username is already taken.";
  }
  if (fields.email) {
    const [r] = await pool.query("SELECT id FROM crm_users WHERE email = ? AND id <> ?", [fields.email, exceptId]);
    if ((r as unknown[]).length) errors.email = "This email is already used by another account.";
  }
  return errors;
}

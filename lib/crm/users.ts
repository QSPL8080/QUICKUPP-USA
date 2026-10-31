import "server-only";
import { getPool } from "@/lib/db";

/* CRM team accounts (Team & Users page, profile, Assigned to lists) */

export type TeamUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: "super_admin" | "admin";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export async function listUsers(): Promise<TeamUser[]> {
  const [rows] = await getPool().query(
    "SELECT id, name, username, email, role, is_active, last_login_at, created_at FROM crm_users ORDER BY role = 'super_admin' DESC, name"
  );
  return (rows as Record<string, unknown>[]).map((r) => ({
    id: Number(r.id),
    name: String(r.name ?? ""),
    username: String(r.username ?? ""),
    email: String(r.email ?? ""),
    role: r.role === "super_admin" ? "super_admin" : "admin",
    isActive: Number(r.is_active) === 1,
    lastLoginAt: r.last_login_at ? new Date(r.last_login_at as string).toISOString() : null,
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
}

/** Names of active team members, for "Assigned to" */
export async function listTeamNames(): Promise<string[]> {
  const [rows] = await getPool().query("SELECT name FROM crm_users WHERE is_active = 1 ORDER BY name");
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

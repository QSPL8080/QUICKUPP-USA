import "server-only";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPool } from "@/lib/db";

/*
 * CRM sign-in. Passwords are stored as scrypt hashes; a signed-in browser
 * holds a random session token in an http-only cookie, and only a SHA-256 of
 * that token is kept in the crm_sessions table.
 */

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;

export const SESSION_COOKIE = "qs_crm";
/** Signed out after this many minutes with no activity */
export const IDLE_MINUTES = 15;
/** Signed out after this many hours even when active (sign in again) */
const MAX_SESSION_HOURS = 12;

export type CrmRole = "super_admin" | "admin";
export type CrmUser = { id: number; name: string; username: string; email: string; role: CrmRole };

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$8$1$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, n, r, p, saltB64, hashB64] = stored.split("$");
  if (algo !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length, { N: Number(n), r: Number(r), p: Number(p) });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

/** Starts a session for the user and sets the cookie (route handlers only). */
export async function startSession(userId: number, ip: string | null, userAgent: string | null) {
  const token = randomBytes(32).toString("hex");
  // times are worked out by MySQL itself, so server time zones can't shift them
  await getPool().execute(
    "INSERT INTO crm_sessions (token_hash, user_id, expires_at, ip_address, user_agent) VALUES (?, ?, NOW() + INTERVAL ? MINUTE, ?, ?)",
    [sha256(token), userId, IDLE_MINUTES, ip, userAgent]
  );
  await removeExpiredSessions();
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_SESSION_HOURS * 3600,
  });
}

/** Deletes ended sessions so the table never fills up with old sign-ins. */
export async function removeExpiredSessions() {
  await getPool().execute(
    "DELETE FROM crm_sessions WHERE expires_at < NOW() OR created_at < NOW() - INTERVAL ? HOUR",
    [MAX_SESSION_HOURS]
  );
}

/** Ends the current session and clears the cookie (route handlers only). */
export async function endSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await getPool().execute("DELETE FROM crm_sessions WHERE token_hash = ?", [sha256(token)]);
  store.delete(SESSION_COOKIE);
}

/**
 * Pushes the session's idle deadline forward (any CRM page, action or activity
 * ping counts). Returns false when the session has already expired.
 */
async function touchSession(tokenHash: string): Promise<boolean> {
  const [res] = await getPool().execute(
    `UPDATE crm_sessions
        SET expires_at = NOW() + INTERVAL ? MINUTE
      WHERE token_hash = ? AND expires_at > NOW() AND created_at > NOW() - INTERVAL ? HOUR`,
    [IDLE_MINUTES, tokenHash, MAX_SESSION_HOURS]
  );
  return (res as { affectedRows: number }).affectedRows > 0;
}

/** The signed-in CRM user, or null. Being signed in also counts as activity. */
export async function getCurrentUser(): Promise<CrmUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const hash = sha256(token);
  if (!(await touchSession(hash))) return null;
  const [rows] = await getPool().execute(
    `SELECT u.id, u.name, u.username, u.email, u.role
       FROM crm_sessions s JOIN crm_users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND u.is_active = 1
      LIMIT 1`,
    [hash]
  );
  const row = (rows as CrmUser[])[0];
  return row ? { id: Number(row.id), name: row.name, username: row.username || "", email: row.email, role: row.role } : null;
}

/** For CRM pages: the signed-in user, or a redirect to /login. */
export async function requireUser(): Promise<CrmUser> {
  const user = await getCurrentUser();
  if (!user) {
    // only mention an ended session when there was one
    const hadSession = (await cookies()).has(SESSION_COOKIE);
    redirect(hadSession ? "/login?reason=expired" : "/login");
  }
  return user;
}

export const isSuperAdmin = (u: CrmUser | null) => u?.role === "super_admin";

/** The super admin's sign-in email, where password requests and sign-in alerts go */
export const SUPER_ADMIN_EMAIL = "info@quickuppsoftech.us";

/** Signs a user out everywhere (after deactivation or a password change) */
export async function endUserSessions(userId: number) {
  await getPool().execute("DELETE FROM crm_sessions WHERE user_id = ?", [userId]);
}

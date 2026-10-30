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
const SESSION_DAYS = 7;

export type CrmRole = "super_admin" | "admin";
export type CrmUser = { id: number; name: string; email: string; role: CrmRole };

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
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await getPool().execute(
    "INSERT INTO crm_sessions (token_hash, user_id, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)",
    [sha256(token), userId, expires, ip, userAgent]
  );
  // tidy up expired sessions now and then
  await getPool().execute("DELETE FROM crm_sessions WHERE expires_at < NOW()");
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

/** Ends the current session and clears the cookie (route handlers only). */
export async function endSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await getPool().execute("DELETE FROM crm_sessions WHERE token_hash = ?", [sha256(token)]);
  store.delete(SESSION_COOKIE);
}

/** The signed-in CRM user, or null. */
export async function getCurrentUser(): Promise<CrmUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const [rows] = await getPool().execute(
    `SELECT u.id, u.name, u.email, u.role
       FROM crm_sessions s JOIN crm_users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > NOW() AND u.is_active = 1
      LIMIT 1`,
    [sha256(token)]
  );
  const row = (rows as CrmUser[])[0];
  return row ? { id: Number(row.id), name: row.name, email: row.email, role: row.role } : null;
}

/** For CRM pages: the signed-in user, or a redirect to /login. */
export async function requireUser(): Promise<CrmUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export const isSuperAdmin = (u: CrmUser | null) => u?.role === "super_admin";

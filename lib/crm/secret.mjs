/*
 * Reversible encryption for the one thing the CRM must be able to show back:
 * a team member's current password, which only the super admin can view on
 * Team & Users. Sign-in never uses this — passwords are still checked against
 * the scrypt hash in crm_users.password_hash.
 *
 * AES-256-GCM. The key comes from CRM_SECRET_KEY when it is set; otherwise it
 * is derived from the database settings the server already has, so it stays
 * the same across restarts and deploys. Plain JavaScript so the migration
 * runner can use it too.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function keyFrom(env) {
  const base =
    env.CRM_SECRET_KEY ||
    `${env.DB_PASSWORD || ""}|${env.DB_USER || ""}|${env.DB_NAME || ""}|${env.DB_HOST || ""}|quickupp-crm-secret-v1`;
  return createHash("sha256").update(base).digest();
}

/** @returns {string} "v1:<iv>:<tag>:<data>" (base64 parts) */
export function encryptSecret(plain, env = process.env) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFrom(env), iv);
  const data = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${data.toString("base64")}`;
}

/** @returns {string | null} the plain text, or null when it can't be read */
export function decryptSecret(stored, env = process.env) {
  if (typeof stored !== "string" || !stored.startsWith("v1:")) return null;
  try {
    const [, ivB64, tagB64, dataB64] = stored.split(":");
    const decipher = createDecipheriv("aes-256-gcm", keyFrom(env), Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

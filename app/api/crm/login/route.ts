import { getPool } from "@/lib/db";
import { SUPER_ADMIN_EMAIL, startSession, verifyPassword } from "@/lib/crm/auth";
import { readJson, requestMeta } from "@/lib/enquiry";
import { decryptSecret, encryptSecret } from "@/lib/crm/secret.mjs";
import { escapeHtml, sendMail } from "@/lib/mailer";

/* every 3rd wrong password in a row on an account emails the super admin */
const ALERT_EVERY = 3;

type Row = { id: number; name: string; username: string | null; email: string; role: string; password_hash: string; is_active: number; failed_attempts: number };

/* POST { email (or username), password } → starts a CRM session */
export async function POST(request: Request) {
  const body = await readJson(request);
  const login = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 190) : "";
  const password = typeof body?.password === "string" ? body.password.slice(0, 200) : "";
  if (!login || !password) return Response.json({ ok: false, error: "Enter your email or username and password." }, { status: 400 });

  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT id, name, username, email, role, password_hash, is_active, failed_attempts FROM crm_users WHERE email = ? OR username = ? LIMIT 1",
      [login, login]
    );
    const user = (rows as Row[])[0];
    const passwordOk = user ? await verifyPassword(password, user.password_hash) : false;

    if (!user || !passwordOk) {
      await new Promise((r) => setTimeout(r, 600)); // slow down guessing
      if (user) {
        const attempts = Number(user.failed_attempts) + 1;
        await pool.execute("UPDATE crm_users SET failed_attempts = ? WHERE id = ?", [attempts, user.id]);
        if (attempts % ALERT_EVERY === 0) {
          const meta = requestMeta(request, null);
          const when = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
          const lines: [string, string][] = [
            ["Name", user.name],
            ["Username", user.username || "—"],
            ["Email", user.email],
            ["Role", user.role === "super_admin" ? "Super Admin" : user.role === "seo" ? "SEO" : user.role === "viewer" ? "Viewer (view only)" : user.role === "hr" ? "HR" : "Admin"],
            ["Failed attempts in a row", String(attempts)],
            ["Time (IST)", when],
            ["IP address", meta.ip || "—"],
            ["Browser", meta.userAgent || "—"],
          ];
          // sent in the background; the sign-in answer doesn't wait for it
          void sendMail({
            to: SUPER_ADMIN_EMAIL,
            fromName: "Quickupp CRM",
            subject: `CRM sign-in alert: ${attempts} failed attempts for ${user.name}`,
            text: `${attempts} wrong passwords in a row were entered for this CRM account.\n\n${lines.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nIf this was the team member, reset their password in CRM > Team & Users. If not, consider deactivating the account.`,
            html: `<p>${attempts} wrong passwords in a row were entered for this CRM account.</p><p>${lines
              .map(([k, v]) => `<b>${escapeHtml(k)}:</b> ${escapeHtml(v)}`)
              .join("<br>")}</p><p>If this was the team member, reset their password in CRM &gt; Team &amp; Users. If not, consider deactivating the account.</p>`,
          });
        }
        if (attempts >= ALERT_EVERY) {
          return Response.json(
            { ok: false, error: `Incorrect password. After ${ALERT_EVERY} failed attempts the super admin has been informed — email ${SUPER_ADMIN_EMAIL} if you need your password reset.` },
            { status: 401 }
          );
        }
      }
      return Response.json({ ok: false, error: "Incorrect email/username or password." }, { status: 401 });
    }

    if (user.is_active !== 1) {
      return Response.json({ ok: false, error: `This account has been deactivated. Please contact the super admin at ${SUPER_ADMIN_EMAIL}.` }, { status: 403 });
    }

    const meta = requestMeta(request, null);
    await startSession(Number(user.id), meta.ip, meta.userAgent);
    await pool.execute("UPDATE crm_users SET last_login_at = NOW(), failed_attempts = 0 WHERE id = ?", [user.id]);
    await keepPasswordView(Number(user.id), password);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[api/crm/login] failed:", err);
    return Response.json({ ok: false, error: "Sign-in is unavailable right now. Please try again." }, { status: 500 });
  }
}

/*
 * The super admin can see every team member's current password on Team &
 * Users. An account whose password was set without that viewable copy (made
 * by the start-up setup, or before the feature existed) gets it the first time
 * its owner signs in with the right password. Never stops a sign-in.
 */
async function keepPasswordView(userId: number, password: string) {
  try {
    const [rows] = await getPool().execute("SELECT password_view FROM crm_users WHERE id = ?", [userId]);
    const stored = (rows as { password_view: string | null }[])[0]?.password_view ?? null;
    if (decryptSecret(stored) === password) return;
    await getPool().execute("UPDATE crm_users SET password_view = ? WHERE id = ?", [encryptSecret(password), userId]);
  } catch (err) {
    console.error("[api/crm/login] could not keep the viewable password:", err);
  }
}

import { getPool } from "@/lib/db";
import { startSession, verifyPassword } from "@/lib/crm/auth";
import { readJson, requestMeta } from "@/lib/enquiry";

/* POST { email, password } → starts a CRM session */
export async function POST(request: Request) {
  const body = await readJson(request);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 190) : "";
  const password = typeof body?.password === "string" ? body.password.slice(0, 200) : "";
  if (!email || !password) return Response.json({ ok: false, error: "Enter your email and password." }, { status: 400 });

  try {
    const [rows] = await getPool().execute(
      "SELECT id, password_hash, is_active FROM crm_users WHERE email = ? LIMIT 1",
      [email]
    );
    const user = (rows as { id: number; password_hash: string; is_active: number }[])[0];
    const ok = user && user.is_active === 1 && (await verifyPassword(password, user.password_hash));
    if (!ok) {
      await new Promise((r) => setTimeout(r, 600)); // slow down guessing
      return Response.json({ ok: false, error: "Incorrect email or password." }, { status: 401 });
    }
    const meta = requestMeta(request, null);
    await startSession(Number(user.id), meta.ip, meta.userAgent);
    await getPool().execute("UPDATE crm_users SET last_login_at = NOW() WHERE id = ?", [user.id]);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[api/crm/login] failed:", err);
    return Response.json({ ok: false, error: "Sign-in is unavailable right now. Please try again." }, { status: 500 });
  }
}

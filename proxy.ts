import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { getPool } from "@/lib/db";

/*
 * View-only CRM accounts (the Viewer role): every request that would change
 * something in the CRM, and the CSV exports, are refused here, in one place,
 * whatever screen or tool sends them. A viewer may still sign in and out, keep
 * the session alive, mark their own notifications read, and change their own
 * profile and password.
 */

const SESSION_COOKIE = "qs_crm"; // same as lib/crm/auth
const ALLOWED_FOR_VIEWERS = ["/api/crm/login", "/api/crm/logout", "/api/crm/ping", "/api/crm/profile", "/api/crm/notifications"];
const READS = new Set(["GET", "HEAD", "OPTIONS"]);

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isExport = /\/export\/?$/.test(path);
  if (READS.has(request.method) && !isExport) return NextResponse.next();
  if (ALLOWED_FOR_VIEWERS.some((p) => path === p || path.startsWith(`${p}/`))) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value || "";
  if (!/^[a-f0-9]{64}$/.test(token)) return NextResponse.next(); // not signed in: the route itself answers

  try {
    const [rows] = await getPool().execute(
      `SELECT u.role FROM crm_sessions s JOIN crm_users u ON u.id = s.user_id
        WHERE s.token_hash = ? AND s.expires_at > NOW() LIMIT 1`,
      [createHash("sha256").update(token).digest("hex")]
    );
    const role = (rows as { role: string }[])[0]?.role;
    if (role === "viewer") {
      return NextResponse.json(
        { ok: false, viewOnly: true, error: isExport ? "Your account is view-only: exports aren't available." : "Your account is view-only: you can look at everything but can't make changes." },
        { status: 403 }
      );
    }
  } catch (err) {
    // can't tell who this is: refuse rather than let a change through
    console.error("[proxy] couldn't check the CRM account:", err);
    return NextResponse.json({ ok: false, error: "Please try again in a moment." }, { status: 503 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/crm/:path*"],
};

import { NextResponse } from "next/server";
import { getCurrentUser, isViewOnly } from "@/lib/crm/auth";
import { runBalanceReminders } from "@/lib/crm/balanceReminders";

/*
 * Balance reminders (10 days and 2 days before the due date). The site runs
 * them by itself every hour; this address runs them on demand. Allowed for a
 * signed-in CRM user, or with ?key=<CRON_SECRET> for an outside cron job.
 */
async function allowed(req: Request) {
  const secret = (process.env.CRON_SECRET || "").trim();
  const key = new URL(req.url).searchParams.get("key") || req.headers.get("x-cron-key") || "";
  if (secret && key === secret) return true;
  const user = await getCurrentUser();
  // sending reminder emails is a change: not for view-only accounts
  return Boolean(user) && !isViewOnly(user);
}

async function handle(req: Request) {
  if (!(await allowed(req))) return NextResponse.json({ ok: false, error: "Not allowed." }, { status: 401 });
  const r = await runBalanceReminders();
  return NextResponse.json(r, { status: r.ok ? 200 : 500 });
}

export const GET = handle;
export const POST = handle;

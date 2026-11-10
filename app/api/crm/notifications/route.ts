import { getCurrentUser } from "@/lib/crm/auth";
import { clearAll, getNotifications, markAllRead, markOneRead } from "@/lib/crm/notifications";
import { readJson } from "@/lib/enquiry";

const TIME_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

/* GET → fetch latest unread count and notification items for polling */
export async function GET() {
  const me = await getCurrentUser();
  if (!me) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  // the SEO role gets no lead, payment or application alerts
  if (me.role === "seo") return Response.json({ ok: true, asOf: "", unread: 0, items: [] });
  const data = await getNotifications(me.id);
  return Response.json({ ok: true, ...data });
}

/*
 * POST { action: "read", key }          → one notification read
 * POST { action: "read-all", asOf }     → everything up to asOf read
 * POST { action: "clear", asOf }        → clear all up to asOf (never shown again)
 */
export async function POST(request: Request) {
  const me = await getCurrentUser();
  if (!me) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const body = await readJson(request);
  const action = String(body?.action || "read-all");
  const asOf = typeof body?.asOf === "string" ? body.asOf : "";
  const key = typeof body?.key === "string" ? body.key.slice(0, 80) : "";

  if (action === "read" && /^[a-z-]+:\d+$/.test(key)) await markOneRead(me.id, key);
  else if (action === "read-all" && TIME_RE.test(asOf)) await markAllRead(me.id, asOf);
  else if (action === "clear" && TIME_RE.test(asOf)) await clearAll(me.id, asOf);
  else return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  return Response.json({ ok: true });
}

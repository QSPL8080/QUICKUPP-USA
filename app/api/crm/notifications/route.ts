import { getCurrentUser } from "@/lib/crm/auth";
import { markSeen } from "@/lib/crm/notifications";
import { readJson } from "@/lib/enquiry";

/* POST { asOf } → the signed-in user has seen everything up to asOf */
export async function POST(request: Request) {
  const me = await getCurrentUser();
  if (!me) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const body = await readJson(request);
  const asOf = typeof body?.asOf === "string" ? body.asOf : "";
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(asOf)) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  await markSeen(me.id, asOf);
  return Response.json({ ok: true });
}

import { getCurrentUser } from "@/lib/crm/auth";
import { parseIds } from "@/lib/crm/ids";
import { readJson } from "@/lib/enquiry";
import { deleteMeetings, meetingsVersion, syncMeetings } from "@/lib/crm/calendly";

export const dynamic = "force-dynamic";

/* GET → read new and changed meetings from Calendly, then report the list's
   version so an open Meetings page knows when to refresh (any CRM user) */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const sync = await syncMeetings();
  const version = await meetingsVersion().catch(() => "");
  return Response.json({ ok: sync.ok, configured: sync.configured, error: sync.error ? "Couldn't reach Calendly right now." : undefined, version });
}

/* DELETE { ids: [...] } → remove meetings from the CRM list only; Calendly is not changed (any CRM user) */
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const body = await readJson(request);
  const ids = body?.ids !== undefined ? parseIds(body.ids) : parseIds([body?.id]);
  if (!ids) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const deleted = await deleteMeetings(ids);
  if (!deleted) return Response.json({ ok: false, error: "Already deleted." }, { status: 404 });
  return Response.json({ ok: true, deleted });
}

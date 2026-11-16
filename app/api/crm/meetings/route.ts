import { getUserFor, canSoftDelete, canPermanentlyDelete } from "@/lib/crm/auth";
import { parseIds } from "@/lib/crm/ids";
import { readJson } from "@/lib/enquiry";
import { deleteMeetings, meetingsVersion, syncMeetings } from "@/lib/crm/calendly";

export const dynamic = "force-dynamic";

/* GET → read new and changed meetings from Calendly, then report the list's
   version so an open Meetings page knows when to refresh */
export async function GET(request: Request) {
  const user = await getUserFor("leads");
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1" || url.searchParams.get("sync") === "1";
  const sync = await syncMeetings({ maxAgeMs: force ? 0 : 5_000, force });
  const version = await meetingsVersion().catch(() => "");
  return Response.json({ ok: sync.ok, configured: sync.configured, error: sync.error ? "Couldn't reach Calendly right now." : undefined, version });
}

/* DELETE { ids: [...], permanent?: boolean } → remove meetings from CRM list (soft delete to Deleted Bin or Super Admin permanent delete) */
export async function DELETE(request: Request) {
  const user = await getUserFor("leads");
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  if (!canSoftDelete(user)) {
    return Response.json({ ok: false, error: "You do not have permission to delete meetings." }, { status: 403 });
  }
  const body = await readJson(request);
  const ids = body?.ids !== undefined ? parseIds(body.ids) : parseIds([body?.id]);
  if (!ids) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const isPermanent = Boolean(body?.permanent);
  if (isPermanent && !canPermanentlyDelete(user)) {
    return Response.json({ ok: false, error: "Only Super Admin can permanently delete records." }, { status: 403 });
  }
  const deleted = await deleteMeetings(ids, user, isPermanent);
  if (!deleted) return Response.json({ ok: false, error: "Already deleted." }, { status: 404 });
  return Response.json({ ok: true, deleted, permanent: isPermanent });
}

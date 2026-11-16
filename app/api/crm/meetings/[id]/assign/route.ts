import { getUserFor, isAdminLike } from "@/lib/crm/auth";
import { readJson } from "@/lib/enquiry";
import { assignMeetingBdm } from "@/lib/crm/meetingTeam";

export const dynamic = "force-dynamic";

/*
 * POST { bdmId } → assign the meeting to a BDM (Admins and the Super Admin), or
 * { bdmId: null } to nobody. The BDM gets an email and a CRM notification; a BDM
 * it is moved away from is told it went to someone else.
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getUserFor("meetings");
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  if (!isAdminLike(user)) return Response.json({ ok: false, error: "Only an Admin can assign meetings." }, { status: 403 });
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return Response.json({ ok: false, error: "Invalid meeting." }, { status: 400 });
  const body = await readJson(request);
  if (!body || body.bdmId === undefined) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const bdmId = body.bdmId ? Number(body.bdmId) : null;
  if (bdmId !== null && (!Number.isInteger(bdmId) || bdmId < 1)) return Response.json({ ok: false, error: "Choose an active BDM." }, { status: 400 });
  const res = await assignMeetingBdm(id, bdmId, user);
  if (!res.ok) return Response.json({ ok: false, error: res.error }, { status: res.status });
  return Response.json({ ok: true, bdm: res.bdm });
}

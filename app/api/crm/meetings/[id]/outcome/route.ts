import { getUserFor } from "@/lib/crm/auth";
import { canAddMeetingNotes, setMeetingOutcome } from "@/lib/crm/meetingTeam";

export const dynamic = "force-dynamic";

/*
 * POST { outcome: "completed" | "no_show" | null } → the meeting's outcome, set
 * after it (Admins, and the BDM taking it). Completed needs notes first, and
 * tells the Admins and the Super Admin.
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getUserFor("meetings");
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return Response.json({ ok: false, error: "Invalid meeting." }, { status: 400 });
  if (!(await canAddMeetingNotes(user, id))) return Response.json({ ok: false, error: "Only the BDM taking this meeting or an Admin sets its outcome." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const outcome = body?.outcome === "completed" || body?.outcome === "no_show" ? body.outcome : body?.outcome === null ? null : undefined;
  if (outcome === undefined) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const res = await setMeetingOutcome(id, outcome, user);
  if (!res.ok) return Response.json({ ok: false, error: res.error }, { status: res.status });
  return Response.json({ ok: true });
}

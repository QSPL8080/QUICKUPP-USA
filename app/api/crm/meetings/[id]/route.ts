import { getUserFor } from "@/lib/crm/auth";
import { readJson } from "@/lib/enquiry";
import { rescheduleMeetingDetails, updateMeetingDetails } from "@/lib/crm/calendly";

export const dynamic = "force-dynamic";

/*
 * PATCH /api/crm/meetings/:id
 * Updates meeting details, notes, or reschedules time.
 */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getUserFor("leads");
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });

  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!id || id < 1) {
    return Response.json({ ok: false, error: "Invalid meeting ID." }, { status: 400 });
  }

  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Missing body." }, { status: 400 });

  try {
    // If reschedule time provided, handle rescheduling
    if (body.startTime && body.endTime) {
      const res = await rescheduleMeetingDetails({
        id,
        startTime: String(body.startTime),
        endTime: String(body.endTime),
        reason: typeof body.reason === "string" ? body.reason : undefined,
        user,
      });
      return Response.json({ ok: true, rescheduleCount: res.rescheduleCount });
    }

    // Otherwise, handle regular details & notes update
    await updateMeetingDetails({
      id,
      data: {
        name: body.name !== undefined ? String(body.name) : undefined,
        email: body.email !== undefined ? String(body.email) : undefined,
        phone: body.phone !== undefined ? String(body.phone) : undefined,
        eventName: body.eventName !== undefined ? String(body.eventName) : undefined,
        locationText: body.locationText !== undefined ? String(body.locationText) : undefined,
        joinUrl: body.joinUrl !== undefined ? String(body.joinUrl) : undefined,
        notes: body.notes !== undefined ? String(body.notes) : undefined,
        hostName: body.hostName !== undefined ? String(body.hostName) : undefined,
        hostEmail: body.hostEmail !== undefined ? String(body.hostEmail) : undefined,
      },
      user,
    });
    return Response.json({ ok: true });
  } catch (err: unknown) {
    console.error("[crm] update meeting error:", err);
    return Response.json({ ok: false, error: err instanceof Error ? err.message : "Couldn't update meeting." }, { status: 500 });
  }
}

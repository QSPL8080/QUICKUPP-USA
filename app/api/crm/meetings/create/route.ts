import { getUserFor } from "@/lib/crm/auth";
import { readJson } from "@/lib/enquiry";
import { createCrmMeeting } from "@/lib/crm/calendly";

export const dynamic = "force-dynamic";

/*
 * POST { name, email, phone, eventName, startTime, endTime, locationType, locationText, joinUrl, notes, leadId }
 * Creates/arranges a meeting directly from the CRM.
 */
export async function POST(request: Request) {
  const user = await getUserFor("leads");
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });

  const body = await readJson(request);
  if (!body?.name || !body?.email || !body?.startTime || !body?.endTime) {
    return Response.json({ ok: false, error: "Name, email, start time, and end time are required." }, { status: 400 });
  }

  try {
    const res = await createCrmMeeting({
      data: {
        name: String(body.name),
        email: String(body.email),
        phone: body.phone ? String(body.phone) : undefined,
        eventName: body.eventName ? String(body.eventName) : "Strategy Call",
        startTime: String(body.startTime),
        endTime: String(body.endTime),
        locationType: body.locationType ? String(body.locationType) : undefined,
        locationText: body.locationText ? String(body.locationText) : undefined,
        joinUrl: body.joinUrl ? String(body.joinUrl) : undefined,
        notes: body.notes ? String(body.notes) : undefined,
        hostName: body.hostName ? String(body.hostName) : undefined,
        hostEmail: body.hostEmail ? String(body.hostEmail) : undefined,
        leadId: body.leadId ? Number(body.leadId) : undefined,
      },
      user,
    });
    return Response.json({ ok: true, id: res.id });
  } catch (err: unknown) {
    console.error("[crm] create meeting error:", err);
    return Response.json({ ok: false, error: err instanceof Error ? err.message : "Couldn't create meeting." }, { status: 500 });
  }
}

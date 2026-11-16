import { meetingFor, syncSingleEvent } from "@/lib/crm/calendly";
import { canAccess, canEditLeads, getCurrentUser } from "@/lib/crm/auth";
import { announceScheduled, claimMeeting } from "@/lib/crm/meetingTeam";
import { canOpenLead } from "@/lib/crm/leadAccess";
import { isEnquirySource } from "@/lib/crm/leadOptions";

export const dynamic = "force-dynamic";

/*
 * Client-Side Calendly Sync.
 * When a visitor books on the website (Contact page, Home, Services, etc.),
 * the Calendly iframe emits a "calendly.event_scheduled" window message.
 * The browser immediately posts the payload here to sync the meeting into
 * crm_meetings in real-time without delay.
 *
 * From the CRM's Arrange Meeting ({ crm: true, leadSource, leadId }), the
 * signed-in team member is recorded as the one who scheduled it, for that lead,
 * and the scheduling notices go out (see lib/crm/meetingTeam).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const eventUri = body?.event?.uri || body?.uri || body?.eventUri;
    const inviteeUri = body?.invitee?.uri || body?.inviteeUri;
    const meetingId = body?.meetingId ? Number(body.meetingId) : undefined;

    if (!eventUri || !inviteeUri) {
      return Response.json({ ok: false, error: "Missing event or invitee URI" }, { status: 400 });
    }

    const res = await syncSingleEvent(eventUri, inviteeUri, meetingId);

    if (body?.crm === true && !meetingId) {
      const user = await getCurrentUser();
      if (user && canAccess(user, "meetings") && canEditLeads(user)) {
        const id = await meetingFor(String(inviteeUri));
        if (id) {
          const leadId = Number(body.leadId);
          const lead =
            isEnquirySource(body.leadSource) && Number.isInteger(leadId) && leadId > 0 && (await canOpenLead(user, body.leadSource, leadId))
              ? { source: body.leadSource, id: leadId }
              : undefined;
          if (await claimMeeting(id, user, lead)) await announceScheduled(id, user);
        }
      }
    }
    return Response.json({ ok: res.ok });
  } catch (err: unknown) {
    console.error("[calendly] client-scheduled sync error:", err);
    return Response.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

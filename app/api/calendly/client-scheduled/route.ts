import { syncSingleEvent } from "@/lib/crm/calendly";

export const dynamic = "force-dynamic";

/*
 * Client-Side Calendly Sync.
 * When a visitor books on the website (Contact page, Home, Services, etc.),
 * the Calendly iframe emits a "calendly.event_scheduled" window message.
 * The browser immediately posts the payload here to sync the meeting into
 * crm_meetings in real-time without delay.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const eventUri = body?.event?.uri || body?.uri || body?.eventUri;
    const inviteeUri = body?.invitee?.uri || body?.inviteeUri;

    if (!eventUri || !inviteeUri) {
      return Response.json({ ok: false, error: "Missing event or invitee URI" }, { status: 400 });
    }

    const res = await syncSingleEvent(eventUri, inviteeUri);
    return Response.json({ ok: res.ok });
  } catch (err: unknown) {
    console.error("[calendly] client-scheduled sync error:", err);
    return Response.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

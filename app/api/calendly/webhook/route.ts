import { applyInvitee, verifyWebhook, type CalInvitee } from "@/lib/crm/calendly";

export const dynamic = "force-dynamic";

/*
 * Calendly webhook (invitee.created / invitee.canceled). Optional: it needs a
 * paid Calendly plan and CALENDLY_WEBHOOK_SIGNING_KEY. Without it the CRM still
 * reads Calendly whenever the Meetings page is open.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyWebhook(raw, request.headers.get("calendly-webhook-signature"))) {
    return Response.json({ ok: false }, { status: 401 });
  }
  let body: { event?: string; payload?: CalInvitee } | null = null;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const inv = body?.payload;
  if ((body?.event === "invitee.created" || body?.event === "invitee.canceled") && inv?.scheduled_event) {
    try {
      await applyInvitee(inv, inv.scheduled_event);
    } catch (err) {
      console.error("[calendly] webhook failed:", err);
      return Response.json({ ok: false }, { status: 500 });
    }
  }
  return Response.json({ ok: true });
}

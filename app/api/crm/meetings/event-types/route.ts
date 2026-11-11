import { getUserFor } from "@/lib/crm/auth";
import { fetchCalendlyEventTypes } from "@/lib/crm/calendly";

export const dynamic = "force-dynamic";

/*
 * GET /api/crm/meetings/event-types
 * Returns active event types configured in Calendly.
 */
export async function GET() {
  const user = await getUserFor("leads");
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });

  try {
    const res = await fetchCalendlyEventTypes();
    return Response.json(res);
  } catch (err: unknown) {
    console.error("[crm] fetch event types error:", err);
    return Response.json({ ok: false, types: [] }, { status: 500 });
  }
}

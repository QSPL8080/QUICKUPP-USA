import { getUserFor } from "@/lib/crm/auth";
import { readJson } from "@/lib/enquiry";
import { cancelCalendlyMeeting } from "@/lib/crm/calendly";

export const dynamic = "force-dynamic";

/*
 * POST { id: number, reason?: string, cancelInCalendly?: boolean }
 * Cancels a meeting directly from the CRM:
 * - Cancels via Calendly API if configured & applicable
 * - Marks status = 'canceled' in crm_meetings
 * - Logs to CRM activity audit trail
 */
export async function POST(request: Request) {
  const user = await getUserFor("leads");
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });

  const body = await readJson(request);
  const id = Number(body?.id);
  if (!id || id < 1) {
    return Response.json({ ok: false, error: "Invalid meeting ID." }, { status: 400 });
  }

  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
  const cancelInCalendly = body?.cancelInCalendly !== false;

  try {
    const res = await cancelCalendlyMeeting({ id, reason, user, cancelInCalendly });
    return Response.json({ ok: true, calendlyCanceled: res.calendlyCanceled });
  } catch (err: unknown) {
    console.error("[crm] cancel meeting error:", err);
    return Response.json({ ok: false, error: err instanceof Error ? err.message : "Couldn't cancel meeting." }, { status: 500 });
  }
}

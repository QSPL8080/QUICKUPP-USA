import { getUserFor } from "@/lib/crm/auth";
import { readJson } from "@/lib/enquiry";
import { generateCalendlySchedulingLink } from "@/lib/crm/calendly";

export const dynamic = "force-dynamic";

/*
 * POST { eventTypeUri?: string }
 * Generates a dynamic single-use Calendly scheduling link.
 */
export async function POST(request: Request) {
  const user = await getUserFor("leads");
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });

  const body = await readJson(request);
  const eventTypeUri = typeof body?.eventTypeUri === "string" ? body.eventTypeUri : undefined;

  try {
    const res = await generateCalendlySchedulingLink(eventTypeUri);
    return Response.json(res);
  } catch (err: unknown) {
    console.error("[crm] generate scheduling link error:", err);
    return Response.json(
      { ok: false, booking_url: "https://calendly.com/quickuppsoftechmeet/strategy-call", error: err instanceof Error ? err.message : "Failed to generate link" },
      { status: 500 }
    );
  }
}

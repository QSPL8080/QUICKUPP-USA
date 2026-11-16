import { canAccess, getCurrentUser } from "@/lib/crm/auth";
import { listActivity } from "@/lib/crm/activity";
import { isEnquirySource } from "@/lib/crm/leadOptions";
import { paymentHistory } from "@/lib/crm/paymentActivity";
import { canOpenLead } from "@/lib/crm/leadAccess";

/*
 * GET ?entity=payment|payment_link|lead&id=&source= → the record's activity
 * history, newest first (read only: history is never edited from the CRM).
 * Payments need the Payments tab; a lead needs All Enquiries (a BDM/BDE: their own lead).
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const url = new URL(request.url);
  const entity = url.searchParams.get("entity");
  const id = Number(url.searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const notAllowed = () => Response.json({ ok: false, error: "Not available for your role." }, { status: 403 });
  if (entity === "payment" || entity === "payment_link") {
    if (!canAccess(user, "payments")) return notAllowed();
    return Response.json({ ok: true, activity: await paymentHistory(entity, id) });
  }
  const source = url.searchParams.get("source");
  if (entity === "lead" && isEnquirySource(source)) {
    if (!canAccess(user, "leads") || !(await canOpenLead(user, source, id))) return notAllowed();
    return Response.json({ ok: true, activity: await listActivity("lead", id, source) });
  }
  return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
}

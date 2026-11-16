import { canAccess, getCurrentUser, leadPermsFor } from "@/lib/crm/auth";
import { listLeads } from "@/lib/crm/data";
import { SOURCE_LABEL } from "@/lib/crm/leadOptions";

/*
 * GET ?q= → up to 12 leads matching a name, email, phone or company: the
 * "From lead" pickers (scheduling a meeting, making a payment link). A BDM/BDE
 * finds only the leads assigned to them. Pick one, then load it in full with
 * GET /api/crm/enquiries?source=&id=.
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !canAccess(user, "leads")) return Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const q = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 100);
  const perms = leadPermsFor(user);
  const data = await listLeads({
    q,
    source: "",
    status: "",
    projectStatus: "",
    channel: "",
    from: "",
    to: "",
    assignedUserId: perms.ownOnly ? user.id : undefined,
    page: 1,
  });
  const leads = data.items.slice(0, 12).map((l) => ({
    key: l.key,
    source: l.source,
    sourceLabel: SOURCE_LABEL[l.source],
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    company: l.company,
    service: l.service,
    clientSince: l.clientSince || null,
    assignedTo: l.assignedTo || null,
    createdAt: l.createdAt,
  }));
  return Response.json({ ok: true, leads });
}

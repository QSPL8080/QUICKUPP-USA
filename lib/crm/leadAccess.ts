import "server-only";
import { getPool } from "@/lib/db";
import { SOURCES, type EnquirySource } from "@/lib/crm/data";
import { SOURCE_LABEL } from "@/lib/crm/leadOptions";
import { isSalesRole, roleName, type CrmUser } from "@/lib/crm/auth";
import { addAlerts, emailTeam, membersById, type TeamMember } from "@/lib/crm/alerts";

/*
 * Who may open a lead, and the alert a BDM/BDE gets when a lead is assigned
 * to them. A BDM or BDE only sees the leads assigned to them; everyone else
 * with All Enquiries sees every lead.
 */

/** The account a lead is assigned to: null when nobody, undefined when the lead is gone */
export async function leadAssigneeId(source: EnquirySource, id: number): Promise<number | null | undefined> {
  const [rows] = await getPool()
    .query(`SELECT assigned_user_id FROM \`${SOURCES[source].table}\` WHERE id = ?`, [id])
    .catch(() => [[]] as unknown as [Record<string, unknown>[]]);
  const r = (rows as Record<string, unknown>[])[0];
  if (!r) return undefined;
  return r.assigned_user_id ? Number(r.assigned_user_id) : null;
}

/** Whether this user may open (and, with edit rights, change) this lead */
export async function canOpenLead(user: Pick<CrmUser, "id" | "role">, source: EnquirySource, id: number) {
  if (!isSalesRole(user)) return true;
  return (await leadAssigneeId(source, id)) === user.id;
}

export const leadHref = (source: string, id: number) => `/crm/enquiries?open=${encodeURIComponent(`${source}:${id}`)}`;

/** The team member a lead can be assigned to (an active BDM or BDE), or null */
export async function assignableMember(userId: unknown): Promise<TeamMember | null> {
  const id = Number(userId);
  if (!Number.isInteger(id) || id < 1) return null;
  const [m] = await membersById([id]);
  return m && (m.role === "bdm" || m.role === "bde") ? m : null;
}

/** Tells a BDM/BDE a lead is now theirs: a CRM notification and an email */
export async function notifyLeadAssigned(
  lead: { source: EnquirySource; id: number; name: string; email?: string | null; phone?: string | null; company?: string | null; service?: string | null },
  to: TeamMember,
  by: Pick<CrmUser, "name" | "role">
) {
  const href = leadHref(lead.source, lead.id);
  const source = SOURCE_LABEL[lead.source] || "Lead";
  await addAlerts([to.id], {
    kind: "lead_assigned",
    title: `New lead assigned: ${lead.name || "Lead"}`,
    sub: `${source}${lead.company ? ` · ${lead.company}` : ""} · by ${by.name}`,
    href,
  });
  await emailTeam([to], {
    subject: `New lead assigned to you: ${lead.name || "Lead"}`,
    tag: "LEAD ASSIGNED",
    color: "#4f46e5",
    heading: `A lead is now yours, ${to.name.split(" ")[0] || to.name}`,
    intro: `${by.name} (${roleName(by.role)}) assigned this enquiry to you in the CRM. Open it to see every detail and follow up.`,
    rows: [
      ["Lead", lead.name || ""],
      ["Company", lead.company || ""],
      ["Email", lead.email || ""],
      ["Phone", lead.phone || ""],
      ["Service", lead.service || ""],
      ["Source", source],
      ["Assigned by", `${by.name} (${roleName(by.role)})`],
    ],
    cta: { label: "Open the lead", href },
  });
}

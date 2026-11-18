import "server-only";
import { getPool } from "@/lib/db";
import { SOURCES, type EnquirySource } from "@/lib/crm/data";
import { SOURCE_LABEL, enquiryCode } from "@/lib/crm/leadOptions";
import { audit } from "@/lib/crm/audit";
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

type LeadInfo = { source: EnquirySource; id: number; name: string; email?: string | null; phone?: string | null; company?: string | null; service?: string | null };

const istNow = () => new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST";

/** Tells a BDM/BDE a lead is now theirs: a CRM notification and an email */
export async function notifyLeadAssigned(lead: LeadInfo, to: TeamMember, by: Pick<CrmUser, "name" | "role">) {
  const href = leadHref(lead.source, lead.id);
  const source = SOURCE_LABEL[lead.source] || "Lead";
  const code = enquiryCode(lead.source, lead.id);
  await addAlerts([to.id], {
    kind: "lead_assigned",
    title: `New enquiry assigned: ${lead.name || "Lead"}`,
    sub: `${code} · ${source}${lead.company ? ` · ${lead.company}` : ""} · by ${by.name}`,
    href,
  });
  await emailTeam([to], {
    subject: "New Enquiry Assigned to You | Quickupp CRM",
    tag: "ENQUIRY ASSIGNED",
    color: "#4f46e5",
    heading: `A new enquiry is yours, ${to.name.split(" ")[0] || to.name}`,
    intro: `${by.name} (${roleName(by.role)}) assigned this enquiry to you in the CRM. Open it to see every detail and follow up.`,
    rows: [
      ["Lead ID", code],
      ["Lead", lead.name || ""],
      ["Company", lead.company || ""],
      ["Email", lead.email || ""],
      ["Phone", lead.phone || ""],
      ["Service", lead.service || ""],
      ["Source", source],
      ["Assigned by", `${by.name} (${roleName(by.role)})`],
      ["Assigned on", istNow()],
    ],
    cta: { label: "Open the enquiry", href },
  });
}

/** Tells the previous BDM/BDE an enquiry is no longer theirs (moved to someone else, or unassigned) */
async function notifyLeadMoved(lead: LeadInfo, to: TeamMember, next: TeamMember | null, by: Pick<CrmUser, "name" | "role">) {
  const code = enquiryCode(lead.source, lead.id);
  const where = next ? `moved to ${next.name} (${roleName(next.role)})` : "unassigned";
  await addAlerts([to.id], {
    kind: "lead_assigned",
    title: `Enquiry ${where}: ${lead.name || "Lead"}`,
    sub: `${code} · by ${by.name}`,
    href: "/crm/enquiries",
  });
  await emailTeam([to], {
    subject: `Enquiry Reassigned: ${lead.name || code} | Quickupp CRM`,
    tag: "ENQUIRY REASSIGNED",
    color: "#d97706",
    heading: next ? `This enquiry is now with ${next.name}` : "This enquiry is no longer assigned to you",
    intro: `${by.name} (${roleName(by.role)}) ${next ? `moved this enquiry to ${next.name}` : "took this enquiry off your list"}. It no longer shows in your enquiries.`,
    rows: [
      ["Lead ID", code],
      ["Lead", lead.name || ""],
      ["Company", lead.company || ""],
      ["Changed by", `${by.name} (${roleName(by.role)})`],
      ["Changed on", istNow()],
    ],
    cta: { label: "Open My Enquiries", href: "/crm/enquiries" },
  });
}

/**
 * Records an assignment change on a lead: who assigned it and when, a row in the
 * assignment history, the audit log, and the notices (the new BDM/BDE, and the
 * one it was taken from). Never throws.
 */
export async function recordLeadAssignment(lead: LeadInfo, previousId: number | null, nextId: number | null, by: Pick<CrmUser, "id" | "name" | "role">) {
  if ((previousId ?? null) === (nextId ?? null)) return;
  const table = SOURCES[lead.source].table;
  const pool = getPool();
  try {
    await pool
      .query(`UPDATE \`${table}\` SET assigned_by = ?, assigned_at = IF(? IS NULL, NULL, UTC_TIMESTAMP()) WHERE id = ?`, [nextId ? by.id : null, nextId, lead.id])
      .catch(() => {});
    await pool
      .query("INSERT INTO crm_lead_assignments (lead_source, lead_id, previous_user_id, new_user_id, changed_by) VALUES (?, ?, ?, ?, ?)", [
        lead.source,
        lead.id,
        previousId,
        nextId,
        by.id,
      ])
      .catch((err) => console.error("[enquiries] could not save the assignment history:", err?.message || err));
    const [next, previous] = await Promise.all([nextId ? membersById([nextId]) : Promise.resolve([]), previousId ? membersById([previousId]) : Promise.resolve([])]);
    const nextMember = next[0] || null;
    await audit(by, "assign_lead", "lead", `${lead.source}:${lead.id}`, `${enquiryCode(lead.source, lead.id)} ${lead.name}: ${previous[0]?.name || "nobody"} → ${nextMember?.name || "nobody"}`, {
      before: { assignedUserId: previousId },
      after: { assignedUserId: nextId },
    });
    if (nextMember && nextMember.id !== by.id) await notifyLeadAssigned(lead, nextMember, by);
    if (previous[0] && previous[0].id !== nextId) await notifyLeadMoved(lead, previous[0], nextMember, by);
  } catch (err) {
    console.error("[enquiries] could not record the assignment:", err);
  }
}

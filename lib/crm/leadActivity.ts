import "server-only";
import { getPool } from "@/lib/db";
import { SOURCES } from "@/lib/crm/data";
import { ENQUIRY_STATUS_LABEL, SOURCE_LABEL, type EnquirySource, type EnquiryStatus } from "@/lib/crm/leadOptions";
import { diffActivities, listActivity, logMany, roleLabel, type ActivityInput, type ActivityItem, type Actor, type FieldDef } from "@/lib/crm/activity";

/* Activity history for leads (all sources): snapshots, comparisons, and the details panel */

export type LeadSnapshot = {
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  country: string;
  industry: string;
  service: string;
  category: string;
  budget: string;
  timeline: string;
  channel: string;
  notes: string;
  assignedTo: string;
  status: string;
  projectStatus: string;
};

const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));

/** The editable fields of a lead as stored right now (null when it doesn't exist) */
export async function leadSnapshot(source: EnquirySource, id: number): Promise<LeadSnapshot | null> {
  try {
    const [rows] = await getPool().query(`SELECT * FROM \`${SOURCES[source].table}\` WHERE id = ?`, [id]);
    const r = (rows as Record<string, unknown>[])[0];
    if (!r) return null;
    return {
      name: s(r.full_name),
      email: s(r.email),
      phone: s(r.phone),
      company: s(r.company_name),
      website: s(r.company_website),
      country: s(r.country),
      industry: s(r.industry),
      service: source === "contact" ? s(r.project_type) : source === "youtube" ? "" : s(r.service),
      category: source === "youtube" ? "" : s(r.category),
      budget: s(r.budget),
      timeline: s(r.timeline),
      channel: source === "manual" ? s(r.lead_channel) : "",
      notes: s(r.message),
      assignedTo: s(r.assigned_to),
      status: s(r.status),
      projectStatus: s(r.project_status) || "Not Started",
    };
  } catch {
    return null;
  }
}

const FIELDS: FieldDef<LeadSnapshot>[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Mobile number" },
  { key: "company", label: "Company" },
  { key: "website", label: "Company website" },
  { key: "country", label: "Location" },
  { key: "industry", label: "Industry" },
  { key: "service", label: "Service" },
  { key: "category", label: "Service requirement" },
  { key: "budget", label: "Budget" },
  { key: "timeline", label: "Timeline" },
  { key: "channel", label: "Lead channel" },
  { key: "notes", label: "Notes" },
];

const statusText = (v: string) => ENQUIRY_STATUS_LABEL[v as EnquiryStatus] || v || "—";

/** "Admin (Amit)" when the name belongs to a team account, otherwise the name as typed */
export async function personLabel(name: string): Promise<string> {
  if (!name) return "";
  try {
    const [rows] = await getPool().query("SELECT role FROM crm_users WHERE name = ? LIMIT 1", [name]);
    const r = (rows as { role: string }[])[0];
    return r ? `${roleLabel(r.role)} (${name})` : name;
  } catch {
    return name;
  }
}

async function assignmentActivity(base: Omit<ActivityInput, "action" | "text" | "field" | "oldValue" | "newValue">, before: string, after: string): Promise<ActivityInput | null> {
  if (before.trim() === after.trim()) return null;
  const [b, a] = await Promise.all([personLabel(before.trim()), personLabel(after.trim())]);
  const text = !before.trim()
    ? `Lead assigned to ${a}`
    : !after.trim()
      ? `Lead unassigned from ${b}`
      : `Lead reassigned from ${b} to ${a}`;
  return { ...base, action: before.trim() ? (after.trim() ? "reassigned" : "unassigned") : "assigned", field: "assignedTo", oldValue: before || null, newValue: after || null, text };
}

/**
 * Logs what changed between two snapshots of one lead: status, project status
 * and assignment as their own entries, then every other field. Nothing is
 * logged when nothing changed.
 */
export async function logLeadChanges(source: EnquirySource, id: number, before: LeadSnapshot, after: LeadSnapshot, actor: Actor) {
  const base = { entity: "lead" as const, source, id, actor };
  const items: ActivityInput[] = [];
  if (before.status !== after.status) {
    items.push({ ...base, action: "status", field: "status", oldValue: statusText(before.status), newValue: statusText(after.status), text: `Lead status changed from ${statusText(before.status)} to ${statusText(after.status)}` });
  }
  if ((before.projectStatus || "Not Started") !== (after.projectStatus || "Not Started")) {
    items.push({ ...base, action: "project_status", field: "projectStatus", oldValue: before.projectStatus || "Not Started", newValue: after.projectStatus || "Not Started", text: `Project status changed from ${before.projectStatus || "Not Started"} to ${after.projectStatus || "Not Started"}` });
  }
  const assign = await assignmentActivity(base, before.assignedTo, after.assignedTo);
  if (assign) items.push(assign);
  items.push(...diffActivities(before, after, FIELDS, base, "Lead"));
  await logMany(items);
  return items.length;
}

/** A lead added in the CRM: created, then (separately) assigned when someone was chosen */
export async function logLeadCreated(id: number, actor: Actor, assignedTo: string, channel: string) {
  const base = { entity: "lead" as const, source: "manual", id, actor };
  const items: ActivityInput[] = [
    { ...base, action: "created", text: `New lead created${channel && channel !== "Manual" ? ` (channel: ${channel})` : ""}`, meta: { channel } },
  ];
  const assign = await assignmentActivity(base, "", assignedTo);
  if (assign) items.push(assign);
  await logMany(items);
}

/** A lead that came in through a website form */
export async function logLeadReceived(source: EnquirySource, id: number, sourcePage?: string | null) {
  const formName = source === "contact" ? "Website Contact Form" : `Website ${SOURCE_LABEL[source].replace("Service Form · ", "")} Form`;
  await logMany([
    {
      entity: "lead",
      source,
      id,
      action: "created",
      text: `New enquiry received from ${formName}${sourcePage ? ` (${sourcePage})` : ""}`,
      actor: { type: "website", label: formName },
      meta: { source, sourcePage: sourcePage || null },
    },
  ]);
}

/** Lead details panel: who created, assigned and last updated it */
export type LeadAudit = {
  createdBy: string;
  createdAt: string | null;
  assignedTo: string;
  assignedBy: string;
  assignedAt: string | null;
  lastUpdatedBy: string;
  lastUpdatedAt: string | null;
};

export async function leadHistory(source: EnquirySource, id: number, lead: { createdAt: string; createdBy: string | null; assignedTo: string | null }) {
  const activity: ActivityItem[] = await listActivity("lead", id, source);
  const created = [...activity].reverse().find((a) => a.action === "created");
  const assigned = activity.find((a) => a.action === "assigned" || a.action === "reassigned");
  const latest = activity[0];
  const fallbackCreator =
    source === "manual" ? (lead.createdBy ? `${lead.createdBy}` : "CRM") : `Website ${source === "contact" ? "Contact" : SOURCE_LABEL[source].replace("Service Form · ", "")} Form`;
  const audit: LeadAudit = {
    createdBy: created ? created.by : fallbackCreator,
    createdAt: lead.createdAt,
    assignedTo: lead.assignedTo ? await personLabel(lead.assignedTo) : "Not Assigned",
    // the latest assignment is the current one (a renamed team member keeps it)
    assignedBy: lead.assignedTo && assigned ? assigned.by : "—",
    assignedAt: lead.assignedTo && assigned ? assigned.createdAt : null,
    lastUpdatedBy: latest ? latest.by : created ? created.by : fallbackCreator,
    lastUpdatedAt: latest ? latest.createdAt : lead.createdAt,
  };
  return { activity, audit };
}

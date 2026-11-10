import "server-only";
import { getPool } from "@/lib/db";
import type { CrmUser } from "@/lib/crm/auth";

/*
 * CRM activity history (crm_activity). Every meaningful change to a lead,
 * a payment or a payment link is written here by the server, after the change
 * itself succeeded, with who did it taken from the signed-in session (never
 * from the browser): their name and role are stored as they were at that
 * moment, so the history stays true even if the account changes later.
 * Website forms are recorded as the website, PayPal events as PayPal.
 * Rows are never edited or deleted by the CRM.
 */

export type ActivityEntity = "lead" | "payment" | "payment_link";

export type Actor =
  | { type: "user"; user: Pick<CrmUser, "id" | "name" | "role"> }
  | { type: "website"; label: string }
  | { type: "gateway"; label: string }
  | { type: "system"; label?: string };

export type ActivityItem = {
  id: number;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  message: string;
  actorType: string;
  actorName: string | null;
  actorRole: string | null;
  by: string;
  createdAt: string;
};

export const roleLabel = (role: string | null | undefined) =>
  role === "super_admin" ? "Super Admin" : role === "admin" ? "Admin" : role === "seo" ? "SEO" : role ? role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

/** "Admin (Priya)", "Website — Contact Form", "PayPal", "System" */
export function actorText(a: { actorType: string; actorName: string | null; actorRole: string | null }) {
  if (a.actorType === "user") return `${roleLabel(a.actorRole) || "User"} (${a.actorName || "Unknown"})`;
  if (a.actorType === "website") return a.actorName ? (/^website/i.test(a.actorName) ? a.actorName : `Website — ${a.actorName}`) : "Website";
  if (a.actorType === "gateway") return a.actorName || "Payment gateway";
  return a.actorName || "System";
}

export const actorOf = (user: Pick<CrmUser, "id" | "name" | "role">): Actor => ({ type: "user", user });

/** " by Admin (Priya)" — or nothing for automated events whose message says the source */
const bySuffix = (actor: Actor) =>
  actor.type === "user" ? ` by ${roleLabel(actor.user.role)} (${actor.user.name})` : "";

export type ActivityInput = {
  entity: ActivityEntity;
  source?: string;
  id: number;
  action: string;
  field?: string | null;
  oldValue?: string | number | null;
  newValue?: string | number | null;
  /** sentence without the actor, e.g. "Status changed from New to Started" */
  text: string;
  actor: Actor;
  eventKey?: string | null;
  meta?: Record<string, unknown> | null;
};

const str = (v: unknown) => (v === null || v === undefined || v === "" ? null : String(v).slice(0, 5000));

/** Records one activity. Never throws: a logging problem must not undo the change itself. */
export async function logActivity(a: ActivityInput): Promise<void> {
  if (!Number.isInteger(a.id) || a.id < 1) return;
  const actorName =
    a.actor.type === "user" ? a.actor.user.name : a.actor.type === "system" ? a.actor.label || "System" : a.actor.label;
  const actorRole = a.actor.type === "user" ? a.actor.user.role : null;
  const message = `${a.text}${bySuffix(a.actor)}.`.replace(/\.\.$/, ".");
  try {
    await getPool().execute(
      `INSERT IGNORE INTO crm_activity
         (entity_type, entity_source, entity_id, action, field_name, old_value, new_value, message, actor_type, actor_id, actor_name, actor_role, event_key, meta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        a.entity,
        a.source || "",
        a.id,
        a.action.slice(0, 40),
        a.field ? a.field.slice(0, 60) : null,
        str(a.oldValue),
        str(a.newValue),
        message.slice(0, 600),
        a.actor.type,
        a.actor.type === "user" ? a.actor.user.id : null,
        actorName ? actorName.slice(0, 120) : null,
        actorRole,
        a.eventKey ? a.eventKey.slice(0, 190) : null,
        a.meta ? JSON.stringify(a.meta).slice(0, 5000) : null,
      ]
    );
  } catch (err) {
    console.warn("[crm-activity] could not record activity:", err);
  }
}

export async function logMany(items: ActivityInput[]) {
  for (const it of items) await logActivity(it);
}

/** History of one record, newest first (ties broken by the order they were written) */
export async function listActivity(entity: ActivityEntity, id: number, source = ""): Promise<ActivityItem[]> {
  try {
    const [rows] = await getPool().query(
      `SELECT id, action, field_name, old_value, new_value, message, actor_type, actor_name, actor_role, created_at
         FROM crm_activity
        WHERE entity_type = ? AND entity_source = ? AND entity_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 500`,
      [entity, source, id]
    );
    return (rows as Record<string, unknown>[]).map((r) => {
      const item = {
        id: Number(r.id),
        action: String(r.action),
        field: (r.field_name as string) || null,
        oldValue: (r.old_value as string) ?? null,
        newValue: (r.new_value as string) ?? null,
        message: String(r.message),
        actorType: String(r.actor_type),
        actorName: (r.actor_name as string) || null,
        actorRole: (r.actor_role as string) || null,
        createdAt: new Date(r.created_at as string).toISOString(),
      };
      return { ...item, by: actorText(item) };
    });
  } catch {
    return [];
  }
}

/* ---- comparing a record before and after an edit --------------------------- */

export type FieldDef<T> = { key: keyof T & string; label: string; format?: (v: unknown) => string };

const norm = (v: unknown) => (v === null || v === undefined ? "" : String(v).trim());

/**
 * One "updated" activity per field that really changed; nothing when nothing
 * changed. Values are shown as given (or through format).
 */
export function diffActivities<T extends Record<string, unknown>>(
  before: T,
  after: T,
  fields: FieldDef<T>[],
  base: Omit<ActivityInput, "action" | "field" | "oldValue" | "newValue" | "text">,
  subject: string
): ActivityInput[] {
  const out: ActivityInput[] = [];
  for (const f of fields) {
    const a = norm(before[f.key]);
    const b = norm(after[f.key]);
    if (a === b) continue;
    const show = (v: string) => (f.format ? f.format(v) : v);
    const long = a.length > 80 || b.length > 80;
    out.push({
      ...base,
      action: "updated",
      field: f.key,
      oldValue: a || null,
      newValue: b || null,
      text: long || !a
        ? `${subject} ${f.label.toLowerCase()} ${a ? "updated" : "added"}`
        : !b
          ? `${subject} ${f.label.toLowerCase()} removed (was ${show(a)})`
          : `${subject} ${f.label.toLowerCase()} changed from ${show(a)} to ${show(b)}`,
    });
  }
  return out;
}

export const money = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : String(v ?? "");
};

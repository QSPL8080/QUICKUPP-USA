import "server-only";
import { getPool } from "@/lib/db";

/*
 * The CRM audit log (crm_audit_log): every delete, restore and removal for good,
 * every assignment, and what Viewers open in the sensitive tabs (payments,
 * clients, team accounts). Rows are only ever added, never changed or removed
 * by the CRM. Writing never throws: an audit failure is logged and the action
 * itself goes on.
 */

export type AuditAction =
  | "soft_delete"
  | "restore"
  | "hard_delete"
  | "hard_delete_refused"
  | "assign_lead"
  | "assign_meeting"
  | "meeting_outcome"
  | "client_converted"
  | "document_upload"
  | "document_download"
  | "document_delete"
  | "view";

type Actor = { id?: number | null; name?: string | null; role?: string | null } | null | undefined;

const clip = (v: unknown, n: number) => (v === undefined || v === null ? null : String(typeof v === "string" ? v : JSON.stringify(v)).slice(0, n));

export async function audit(
  actor: Actor,
  action: AuditAction,
  entityType: string,
  entityId: string | number | null,
  detail = "",
  values?: { before?: unknown; after?: unknown }
) {
  await getPool()
    .query(
      "INSERT INTO crm_audit_log (actor_user_id, actor_name, actor_role, action, entity_type, entity_id, detail, previous_values, new_values) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        actor?.id ?? null,
        String(actor?.name || "System").slice(0, 190),
        String(actor?.role || "").slice(0, 20),
        action,
        entityType.slice(0, 40),
        entityId === null ? null : String(entityId).slice(0, 64),
        detail.slice(0, 500),
        clip(values?.before, 60000),
        clip(values?.after, 60000),
      ]
    )
    .catch((err) => console.error("[audit] could not record", action, entityType, entityId, err?.message || err));
}

/** A Viewer opening a sensitive tab (payments, clients, team accounts) or record is recorded */
export async function auditViewerView(user: { id: number; name: string; role: string }, what: string, id: string | number | null = null) {
  if (user.role !== "viewer") return;
  await audit(user, "view", what, id, `Viewed ${what}${id !== null ? ` ${id}` : ""}`);
}

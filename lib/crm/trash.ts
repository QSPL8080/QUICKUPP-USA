import "server-only";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { audit } from "@/lib/crm/audit";
import { getPool } from "@/lib/db";
import type { CrmUser } from "@/lib/crm/auth";

/*
 * The Bin. When anyone but the Super Admin deletes a lead, payment,
 * payment link, blog, job opening or job application, the record is moved out
 * of its table into an exact copy of that table ("<table>__deleted") and listed
 * in crm_trash. Every list, count, export and website page therefore stops
 * showing it without any change to how they read their table.
 *
 * The Super Admin can restore it (put back with the same id, so its history,
 * files and payment links still belong to it) or remove it for good.
 *
 * Team accounts and meetings are not moved: other records point at accounts,
 * and Calendly would bring a moved meeting back. They carry deleted_at instead
 * and are listed in the bin too (see listTrash).
 */

export type TrashEntity = "lead" | "payment" | "payment_link" | "blog" | "job" | "application";

export type TrashItem = {
  key: string; // "t:<crm_trash id>", "user:<id>" or "meeting:<id>"
  entity: TrashEntity | "user" | "meeting";
  label: string;
  detail: string;
  deletedBy: string;
  deletedAt: string;
  /** a payment with money received (or a lead that became a client): kept for the records, never deleted for good */
  locked?: boolean;
  /** why it was deleted, when given */
  reason?: string;
};

/*
 * Financial records are kept: a payment or payment link that has received money
 * (paid in part or in full, or with a completed PayPal transaction) is never
 * removed from the database. Deleting it only archives it in the Bin.
 */
export const PROTECTED_CLIENT_MESSAGE =
  "This lead became a client (it has paid), so it is kept with its payment records and cannot be permanently deleted. It stays archived in the Bin.";
export const PROTECTED_PAYMENT_MESSAGE =
  "Payments that have received money are kept for your records, so they cannot be permanently deleted. They stay archived in the Bin.";

/** Which of these payment records (in their live table, or archived in the bin) have received money */
export async function protectedPaymentIds(table: "payments" | "payment_links", ids: number[], db?: PoolConnection): Promise<Set<number>> {
  const out = new Set<number>();
  if (!ids.length) return out;
  const q = db || getPool();
  for (const t of [table, trashTable(table)]) {
    const [rows] = await q
      .query<RowDataPacket[]>(`SELECT id FROM \`${t}\` WHERE id IN (?) AND status IN ('paid', 'partially_paid', 'refunded')`, [ids])
      .catch(() => [[] as RowDataPacket[]]);
    for (const r of rows) out.add(Number(r.id));
  }
  const [tx] = await q
    .query<RowDataPacket[]>("SELECT DISTINCT record_id FROM payment_transactions WHERE record_table = ? AND record_id IN (?) AND status = 'paid'", [table, ids])
    .catch(() => [[] as RowDataPacket[]]);
  for (const r of tx) out.add(Number(r.record_id));
  return out;
}

const SAFE_TABLE = /^[a-z0-9_]{1,54}$/;
const trashTable = (table: string) => {
  if (!SAFE_TABLE.test(table)) throw new Error("bad table name");
  return `${table}__deleted`;
};

async function columnsOf(db: PoolConnection | ReturnType<typeof getPool>, table: string) {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT COLUMN_NAME AS c, COLUMN_TYPE AS t FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION",
    [table]
  );
  return rows.map((r) => ({ name: String(r.c), type: String(r.t) }));
}

/** The "<table>__deleted" copy exists and has every column the table has (tables gain columns over time) */
async function ensureCopy(db: PoolConnection, table: string) {
  const copy = trashTable(table);
  await db.query(`CREATE TABLE IF NOT EXISTS \`${copy}\` LIKE \`${table}\``);
  // the copy keeps no unique keys but the id: two deleted records may share a slug or token
  const [uniq] = await db.query<RowDataPacket[]>(
    "SELECT DISTINCT INDEX_NAME AS i FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND NON_UNIQUE = 0 AND INDEX_NAME <> 'PRIMARY'",
    [copy]
  );
  for (const u of uniq) await db.query(`ALTER TABLE \`${copy}\` DROP INDEX \`${String(u.i).replace(/`/g, "")}\``);
  const [main, have] = await Promise.all([columnsOf(db, table), columnsOf(db, copy)]);
  const haveType = new Map(have.map((c) => [c.name, c.type]));
  for (const c of main) {
    if (!haveType.has(c.name)) await db.query(`ALTER TABLE \`${copy}\` ADD COLUMN \`${c.name}\` ${c.type} NULL`);
    // a column whose type changed since the copy was made (e.g. a new list of lead statuses):
    // the copy follows, so the record can be copied in. If saved copies hold values the new
    // type can't take, it is left as it was (a migration moves those values first).
    else if (haveType.get(c.name) !== c.type)
      await db
        .query(`ALTER TABLE \`${copy}\` MODIFY COLUMN \`${c.name}\` ${c.type} NULL`)
        .catch((err) => console.error(`[bin] could not update ${copy}.${c.name} to ${c.type}:`, err?.message || err));
  }
  const copyCols = new Set((await columnsOf(db, copy)).map((c) => c.name));
  return { copy, cols: main.map((c) => c.name).filter((n) => copyCols.has(n)) };
}

const colList = (cols: string[]) => cols.map((c) => `\`${c}\``).join(", ");

/**
 * Moves these records (all in one table) into the Bin. `describe` gives
 * the name and detail shown in the bin; `links` saves what to put back on
 * restore (e.g. the job applications of a job opening). Returns how many moved.
 */
export async function moveToTrash(o: {
  entity: TrashEntity;
  table: string;
  ids: number[];
  user: Pick<CrmUser, "id" | "name"> & { role?: string };
  describe: (row: RowDataPacket) => { label: string; detail?: string };
  links?: (ids: number[], db: PoolConnection) => Promise<Record<number, unknown>>;
  /** why it was deleted (optional, shown in the bin and kept in the audit log) */
  reason?: string;
}): Promise<number> {
  const ids = [...new Set(o.ids.filter((n) => Number.isInteger(n) && n > 0))];
  if (!ids.length) return 0;
  const db = await getPool().getConnection();
  try {
    const { copy, cols } = await ensureCopy(db, o.table);
    await db.beginTransaction();
    const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM \`${o.table}\` WHERE id IN (?) FOR UPDATE`, [ids]);
    if (!rows.length) {
      await db.rollback();
      return 0;
    }
    const found = rows.map((r) => Number(r.id));
    const extra = o.links ? await o.links(found, db) : {};
    // a record deleted, restored and deleted again: the old copy makes way
    await db.query(`DELETE FROM \`${copy}\` WHERE id IN (?)`, [found]);
    await db.query(`DELETE FROM crm_trash WHERE source_table = ? AND record_id IN (?)`, [o.table, found]);
    await db.query(`INSERT INTO \`${copy}\` (${colList(cols)}) SELECT ${colList(cols)} FROM \`${o.table}\` WHERE id IN (?)`, [found]);
    const reason = (o.reason || "").trim().slice(0, 255) || null;
    const binRows = rows.map((r) => {
      const d = o.describe(r);
      const id = Number(r.id);
      return [o.entity, o.table, id, d.label.slice(0, 255), (d.detail || "").slice(0, 255), extra[id] ? JSON.stringify(extra[id]) : null, o.user.id, o.user.name.slice(0, 190), reason];
    });
    await db
      .query("INSERT INTO crm_trash (entity, source_table, record_id, label, detail, extra, deleted_by, deleted_by_name, reason) VALUES ?", [binRows])
      .catch(async (err) => {
        // the reason column comes with a later database update: without it, the bin still works
        if ((err as { code?: string }).code !== "ER_BAD_FIELD_ERROR") throw err;
        await db.query("INSERT INTO crm_trash (entity, source_table, record_id, label, detail, extra, deleted_by, deleted_by_name) VALUES ?", [binRows.map((r) => r.slice(0, 8))]);
      });
    const [res] = await db.query(`DELETE FROM \`${o.table}\` WHERE id IN (?)`, [found]);
    await db.commit();
    for (const r of rows) {
      const d = o.describe(r);
      await audit(o.user, "soft_delete", o.entity, `${o.table}:${Number(r.id)}`, `${d.label}${d.detail ? ` · ${d.detail}` : ""}${reason ? ` (reason: ${reason})` : ""}`, { before: r });
    }
    return Number((res as { affectedRows: number }).affectedRows || 0);
  } catch (err) {
    await db.rollback().catch(() => {});
    throw err;
  } finally {
    db.release();
  }
}

/* what happens to an entity's related records when it is restored or removed for good */
type Hooks = {
  restore?: (id: number, extra: unknown, db: PoolConnection) => Promise<void>;
  purge?: (id: number, row: RowDataPacket, db: PoolConnection) => Promise<void>;
};

const LEAD_SOURCE_OF_TABLE: Record<string, string> = {
  contact_enquiries: "contact",
  service_digital_marketing: "digital-marketing",
  service_ai_automation: "ai-automation",
  service_it_services: "it-services",
  service_staff_augmentation: "staff-augmentation",
  service_youtube_promotion: "youtube",
  industry_enquiries: "industries",
  manual_leads: "manual",
};

const HOOKS: Record<TrashEntity, Hooks> = {
  lead: {
    purge: async (id, _row, db) => {
      const src = LEAD_SOURCE_OF_TABLE[String(_row.__table)] || "";
      if (!src) return;
      await db.query("DELETE FROM crm_activity WHERE entity_type = 'lead' AND entity_source = ? AND entity_id = ?", [src, id]).catch(() => {});
      await db.query("DELETE FROM crm_notification_reads WHERE item_key = ?", [`${src}:${id}`]).catch(() => {});
      for (const t of ["payment_links", "payments"]) {
        await db.query(`UPDATE \`${t}\` SET lead_id = NULL, lead_source = NULL WHERE lead_source = ? AND lead_id = ?`, [src, id]).catch(() => {});
      }
      await db.query("UPDATE crm_meetings SET lead_id = NULL, lead_source = NULL WHERE lead_source = ? AND lead_id = ?", [src, id]).catch(() => {});
    },
  },
  payment: {
    purge: async (id, _row, db) => {
      await db.query("DELETE FROM payment_transactions WHERE record_table = 'payments' AND record_id = ?", [id]).catch(() => {});
    },
  },
  payment_link: {
    purge: async (id, _row, db) => {
      await db.query("DELETE FROM payment_transactions WHERE record_table = 'payment_links' AND record_id = ?", [id]).catch(() => {});
    },
  },
  blog: {},
  job: {
    // the applications to this opening point at it again
    restore: async (id, extra, db) => {
      const apps = Array.isArray((extra as { applications?: unknown })?.applications) ? ((extra as { applications: number[] }).applications as number[]) : [];
      if (apps.length) await db.query("UPDATE job_applications SET job_id = ? WHERE id IN (?) AND job_id IS NULL", [id, apps]);
    },
  },
  application: {},
};

async function trashRow(db: PoolConnection, trashId: number) {
  const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM crm_trash WHERE id = ? FOR UPDATE", [trashId]);
  return rows[0] || null;
}

/** Puts a deleted record back where it was, with the same id */
export async function restoreFromTrash(trashId: number): Promise<{ ok: true; entity: string } | { ok: false; error: string }> {
  const db = await getPool().getConnection();
  try {
    await db.beginTransaction();
    const t = await trashRow(db, trashId);
    if (!t) {
      await db.rollback();
      return { ok: false, error: "This item is no longer in the Bin." };
    }
    const table = String(t.source_table);
    const id = Number(t.record_id);
    await db.commit();
    const { copy, cols } = await ensureCopy(db, table);
    await db.beginTransaction();
    const [taken] = await db.query<RowDataPacket[]>(`SELECT id FROM \`${table}\` WHERE id = ? LIMIT 1`, [id]);
    if (taken.length) {
      await db.rollback();
      return { ok: false, error: "A record with the same number exists again, so this one can't be put back." };
    }
    const [ins] = await db.query(`INSERT INTO \`${table}\` (${colList(cols)}) SELECT ${colList(cols)} FROM \`${copy}\` WHERE id = ?`, [id]);
    if (!(ins as { affectedRows: number }).affectedRows) {
      await db.rollback();
      return { ok: false, error: "The saved copy of this record is missing, so it can't be restored." };
    }
    await db.query(`DELETE FROM \`${copy}\` WHERE id = ?`, [id]);
    await db.query("DELETE FROM crm_trash WHERE id = ?", [trashId]);
    let extra: unknown = null;
    try {
      extra = t.extra ? JSON.parse(String(t.extra)) : null;
    } catch {}
    await HOOKS[t.entity as TrashEntity]?.restore?.(id, extra, db);
    await db.commit();
    return { ok: true, entity: String(t.entity) };
  } catch (err) {
    await db.rollback().catch(() => {});
    throw err;
  } finally {
    db.release();
  }
}

/** Removes a deleted record for good (Super Admin) */
export async function purgeFromTrash(trashId: number): Promise<{ ok: true; entity: string; label: string } | { ok: false; error: string }> {
  const db = await getPool().getConnection();
  try {
    await db.beginTransaction();
    const t = await trashRow(db, trashId);
    if (!t) {
      await db.rollback();
      return { ok: false, error: "This item is no longer in the Bin." };
    }
    const table = String(t.source_table);
    const copy = trashTable(table);
    const id = Number(t.record_id);
    const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM \`${copy}\` WHERE id = ?`, [id]).catch(() => [[] as RowDataPacket[]]);
    const row = (rows as RowDataPacket[])[0] || ({} as RowDataPacket);
    (row as Record<string, unknown>).__table = table;
    // money received: kept for the records (a payment that received money, or a lead that became a client)
    if ((table === "payments" || table === "payment_links") && (await protectedPaymentIds(table, [id], db)).size) {
      await db.rollback();
      return { ok: false, error: PROTECTED_PAYMENT_MESSAGE };
    }
    if (t.entity === "lead" && row.client_since) {
      await db.rollback();
      return { ok: false, error: PROTECTED_CLIENT_MESSAGE };
    }
    await HOOKS[t.entity as TrashEntity]?.purge?.(id, row, db);
    await db.query(`DELETE FROM \`${copy}\` WHERE id = ?`, [id]).catch(() => {});
    await db.query("DELETE FROM crm_trash WHERE id = ?", [trashId]);
    await db.commit();
    return { ok: true, entity: String(t.entity), label: String(t.label) };
  } catch (err) {
    await db.rollback().catch(() => {});
    throw err;
  } finally {
    db.release();
  }
}

const iso = (v: unknown) => {
  const d = v instanceof Date ? v : new Date(String(v));
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

/** Everything in the Bin, newest first */
export async function listTrash(): Promise<TrashItem[]> {
  const pool = getPool();
  const [t] = await pool
    .query<RowDataPacket[]>("SELECT * FROM crm_trash ORDER BY deleted_at DESC, id DESC LIMIT 1000")
    .catch(() => [[] as RowDataPacket[]]);
  // payments that have received money can't be deleted for good
  const locked = new Set<string>();
  for (const table of ["payments", "payment_links"] as const) {
    const ids = t.filter((r) => r.source_table === table).map((r) => Number(r.record_id));
    for (const id of await protectedPaymentIds(table, ids)) locked.add(`${table}:${id}`);
  }
  // and leads that became clients
  for (const table of Object.keys(LEAD_SOURCE_OF_TABLE)) {
    const ids = t.filter((r) => r.source_table === table).map((r) => Number(r.record_id));
    if (!ids.length) continue;
    const [c] = await pool
      .query<RowDataPacket[]>(`SELECT id FROM \`${trashTable(table)}\` WHERE id IN (?) AND client_since IS NOT NULL`, [ids])
      .catch(() => [[] as RowDataPacket[]]);
    for (const r of c) locked.add(`${table}:${Number(r.id)}`);
  }
  const [u] = await pool
    .query<RowDataPacket[]>(
      `SELECT u.*, d.name AS by_name
         FROM crm_users u LEFT JOIN crm_users d ON d.id = u.deleted_by
        WHERE u.deleted_at IS NOT NULL ORDER BY u.deleted_at DESC LIMIT 500`
    )
    .catch(() => [[] as RowDataPacket[]]);
  const [m] = await pool
    .query<RowDataPacket[]>(
      `SELECT m.*, d.name AS by_name
         FROM crm_meetings m LEFT JOIN crm_users d ON d.id = m.deleted_by
        WHERE m.deleted_at IS NOT NULL AND m.purged_at IS NULL ORDER BY m.deleted_at DESC LIMIT 500`
    )
    .catch(() => [[] as RowDataPacket[]]);
  const items: TrashItem[] = [
    ...t.map((r) => ({
      key: `t:${r.id}`,
      entity: String(r.entity) as TrashEntity,
      label: String(r.label || ""),
      detail: String(r.detail || ""),
      deletedBy: String(r.deleted_by_name || ""),
      deletedAt: iso(r.deleted_at),
      locked: locked.has(`${r.source_table}:${r.record_id}`),
      reason: r.reason ? String(r.reason) : "",
    })),
    ...u.map((r) => ({
      key: `user:${r.id}`,
      entity: "user" as const,
      label: String(r.name || ""),
      detail: `${String(r.email || "")} · ${String(r.role || "")}`,
      deletedBy: String(r.by_name || ""),
      deletedAt: iso(r.deleted_at),
      reason: r.deleted_reason ? String(r.deleted_reason) : "",
    })),
    ...m.map((r) => ({
      key: `meeting:${r.id}`,
      entity: "meeting" as const,
      label: String(r.invitee_name || "Meeting"),
      detail: `${String(r.event_name || "Meeting")} · ${iso(r.start_time).slice(0, 10)}`,
      deletedBy: String(r.by_name || ""),
      deletedAt: iso(r.deleted_at),
      reason: r.deleted_reason ? String(r.deleted_reason) : "",
    })),
  ];
  return items.sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
}

export async function trashCount(): Promise<number> {
  const [rows] = await getPool()
    .query<RowDataPacket[]>(
      `SELECT (SELECT COUNT(*) FROM crm_trash)
            + (SELECT COUNT(*) FROM crm_users WHERE deleted_at IS NOT NULL)
            + (SELECT COUNT(*) FROM crm_meetings WHERE deleted_at IS NOT NULL AND purged_at IS NULL) AS n`
    )
    .catch(() => [[{ n: 0 }] as unknown as RowDataPacket[]]);
  return Number(rows[0]?.n || 0);
}

/**
 * The CRM's delete: for the Super Admin it removes for good (`forGood`), for
 * anyone else it moves the records to the Bin. Returns how many went
 * and whether they are in the bin.
 */
export async function deleteOrTrash(
  o: Parameters<typeof moveToTrash>[0] & { user: Pick<CrmUser, "id" | "name" | "role">; forGood?: (ids: number[]) => Promise<number> }
): Promise<{ count: number; trashed: boolean }> {
  // every delete (Admin or Super Admin) is a soft delete into the Bin; removing
  // something for good is a separate, confirmed step the Super Admin takes from the bin
  return { count: await moveToTrash(o), trashed: true };
}

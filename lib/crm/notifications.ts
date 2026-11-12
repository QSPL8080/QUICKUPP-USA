import "server-only";
import { getPool } from "@/lib/db";
import { SOURCES } from "@/lib/crm/data";
import { ensureLeadTables } from "@/lib/crm/ensureTables";
import { type EnquirySource } from "@/lib/crm/leadOptions";

/*
 * CRM notifications for new leads, payments and job applications.
 * Per team member:
 *   - cleared_at:  "Clear all" — anything older is no longer listed
 *   - notified_at: everything older is read ("Mark all as read", or closing the popup)
 *   - crm_notification_reads: items marked as read one by one
 * Things a member did themselves (a lead or payment they added) never notify them.
 */

export type NotifyKind = "lead" | "payment" | "application";
export type NotifyItem = {
  key: string;
  kind: NotifyKind;
  title: string;
  sub: string;
  at: string;
  href: string;
  unread: boolean;
  categoryLabel?: string;
  clientName?: string;
  detail?: string;
};
export type Notifications = { asOf: string; unread: number; items: NotifyItem[] };

/** The alerts a role gets: none for SEO, only job applications for HR, everything for the rest */
export async function notificationsForRole(userId: number, role: string): Promise<Notifications> {
  if (role === "seo") return { asOf: "", unread: 0, items: [] };
  const all = await getNotifications(userId);
  if (role !== "hr") return all;
  const items = all.items.filter((i) => i.kind === "application");
  return { asOf: all.asOf, unread: items.filter((i) => i.unread).length, items };
}

const LIST = 40;

function unionSql() {
  const parts: string[] = [];
  const args = (since: string, asOf: string, userId: number) => {
    const a: (string | number)[] = [];
    for (const k of Object.keys(SOURCES) as EnquirySource[]) a.push(since, asOf, ...(k === "manual" ? [userId] : []));
    a.push(since, asOf, userId); // payments
    a.push(since, asOf); // applications
    return a;
  };
  for (const k of Object.keys(SOURCES) as EnquirySource[]) {
    const mine = k === "manual" ? " AND (created_by IS NULL OR created_by <> ?)" : "";
    const detail =
      k === "contact"
        ? "COALESCE(NULLIF(category, ''), NULLIF(project_type, ''), 'Contact Form')"
        : k === "youtube"
          ? "'YouTube Video Promotion'"
          : k === "industries"
            ? "CONCAT(industry, ' · ', COALESCE(NULLIF(category, ''), NULLIF(service, ''), 'Industry Page'))"
            : "COALESCE(NULLIF(category, ''), NULLIF(service, ''), 'Service Form')";
    parts.push(
      `SELECT 'lead' AS kind, CONCAT('${k}:', id) AS item_key, '${k}' AS src, full_name AS title, ${detail} AS extra, created_at FROM \`${SOURCES[k].table}\` WHERE created_at > ? AND created_at <= ?${mine}`
    );
  }
  parts.push(
    "SELECT 'payment', CONCAT('payment:', id), NULL, client_name, CONCAT(currency, ' ', amount, ' · ', status), created_at FROM payments WHERE created_at > ? AND created_at <= ? AND (created_by IS NULL OR created_by <> ?)"
  );
  parts.push("SELECT 'application', CONCAT('application:', id), NULL, full_name, job_title, created_at FROM job_applications WHERE created_at > ? AND created_at <= ?");
  return { sql: parts.map((p) => `(${p})`).join(" UNION ALL "), args };
}

const money = (extra: string) => {
  const [cur, amount, ...rest] = extra.split(" ");
  const value = Number(amount);
  const formatted = Number.isFinite(value) ? value.toLocaleString("en-US", { style: "currency", currency: cur || "USD" }) : amount;
  return `${formatted} ${rest.join(" ").replace("_", " ")}`.trim();
};

export async function getNotifications(userId: number): Promise<Notifications> {
  await ensureLeadTables();
  const pool = getPool();
  const [[u]] = (await pool.query(
    `SELECT DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') AS now,
            DATE_FORMAT(COALESCE(cleared_at, NOW()), '%Y-%m-%d %H:%i:%s') AS cleared,
            DATE_FORMAT(GREATEST(COALESCE(notified_at, NOW()), COALESCE(cleared_at, NOW())), '%Y-%m-%d %H:%i:%s') AS readUntil
       FROM crm_users WHERE id = ?`,
    [userId]
  )) as unknown as [{ now: string; cleared: string; readUntil: string }[]];
  const asOf = u?.now || "";
  if (!u) return { asOf, unread: 0, items: [] };

  const { sql, args } = unionSql();
  const [listRows] = await pool.query(`SELECT * FROM (${sql}) t ORDER BY created_at DESC LIMIT ${LIST}`, args(u.cleared, asOf, userId));
  const [newRows] = await pool.query(`SELECT item_key FROM (${sql}) t LIMIT 1000`, args(u.readUntil, asOf, userId));
  const [readRows] = await pool.query("SELECT item_key FROM crm_notification_reads WHERE user_id = ?", [userId]);

  const read = new Set((readRows as { item_key: string }[]).map((r) => r.item_key));
  const fresh = new Set((newRows as { item_key: string }[]).map((r) => r.item_key).filter((k) => !read.has(k)));

  const items: NotifyItem[] = (listRows as Record<string, unknown>[]).map((r) => {
    const kind = r.kind as NotifyKind;
    const key = String(r.item_key);
    const src = r.src as EnquirySource | null;
    const clientName = String(r.title ?? "Client");
    const detail = String(r.extra ?? "");
    let title = "New notification";
    let sub = "";
    let categoryLabel = "NEW NOTIFICATION";

    if (kind === "lead") {
      title = src === "contact" ? "New website enquiry" : src === "youtube" ? "New YouTube order" : src === "industries" ? "New industry enquiry" : "New website order";
      categoryLabel = src === "contact" ? "NEW WEBSITE ENQUIRY" : src === "youtube" ? "NEW YOUTUBE ORDER" : src === "industries" ? "NEW INDUSTRY ENQUIRY" : "NEW WEBSITE ORDER";
      sub = detail ? `${clientName} ordered ${detail}` : `${clientName} submitted an enquiry`;
    } else if (kind === "payment") {
      title = "Payment received";
      categoryLabel = "PAYMENT RECEIVED";
      sub = `${clientName} - ${money(detail)}`;
    } else if (kind === "application") {
      title = "Job application";
      categoryLabel = "JOB APPLICATION";
      sub = `${clientName} applied for ${detail || "Open Position"}`;
    }

    return {
      key,
      kind,
      title,
      sub,
      at: new Date(r.created_at as string).toISOString(),
      href: kind === "lead" ? `/crm/enquiries${src ? `?source=${src}` : ""}` : kind === "payment" ? "/crm/payments" : "/crm/applications",
      unread: fresh.has(key),
      categoryLabel,
      clientName,
      detail,
    };
  });

  return { asOf, unread: fresh.size, items };
}

/** One notification marked as read */
export async function markOneRead(userId: number, key: string) {
  await getPool().execute("INSERT IGNORE INTO crm_notification_reads (user_id, item_key) VALUES (?, ?)", [userId, key]);
}

/** Everything up to asOf is read (it stays in the list until cleared) */
export async function markAllRead(userId: number, asOf: string) {
  const pool = getPool();
  await pool.execute("UPDATE crm_users SET notified_at = GREATEST(COALESCE(notified_at, '1970-01-02'), ?) WHERE id = ?", [asOf, userId]);
  await pool.execute("DELETE FROM crm_notification_reads WHERE user_id = ?", [userId]);
}

/** Clear all: nothing up to asOf is listed again */
export async function clearAll(userId: number, asOf: string) {
  const pool = getPool();
  await pool.execute(
    "UPDATE crm_users SET cleared_at = GREATEST(COALESCE(cleared_at, '1970-01-02'), ?), notified_at = GREATEST(COALESCE(notified_at, '1970-01-02'), ?) WHERE id = ?",
    [asOf, asOf, userId]
  );
  await pool.execute("DELETE FROM crm_notification_reads WHERE user_id = ?", [userId]);
}

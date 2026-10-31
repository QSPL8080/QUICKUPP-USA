import "server-only";
import { getPool } from "@/lib/db";
import { SOURCES } from "@/lib/crm/data";
import { SOURCE_LABEL, type EnquirySource } from "@/lib/crm/leadOptions";

/*
 * "Since your last visit" notifications. Each team member has their own
 * notified_at time; everything that arrived after it (and wasn't done by
 * them) is new for them. Marking as seen moves notified_at forward.
 */

export type NotifyItem = { title: string; sub: string; at: string; href: string };
export type NotifyGroup = { key: "leads" | "payments" | "applications"; label: string; count: number; href: string; items: NotifyItem[] };
export type Notifications = { asOf: string; total: number; groups: NotifyGroup[] };

const SHOW = 5;

export async function getNotifications(userId: number): Promise<Notifications> {
  const pool = getPool();
  const [[meta]] = (await pool.query(
    "SELECT DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') AS now, DATE_FORMAT(COALESCE(notified_at, NOW()), '%Y-%m-%d %H:%i:%s') AS since FROM crm_users WHERE id = ?",
    [userId]
  )) as unknown as [{ now: string; since: string }[]];
  const asOf = meta?.now || "";
  const since = meta?.since || asOf;

  // leads from every form, plus manual ones added by someone else
  const leadSql = (Object.keys(SOURCES) as EnquirySource[])
    .map((k) => {
      const mine = k === "manual" ? " AND (created_by IS NULL OR created_by <> ?)" : "";
      return `(SELECT '${k}' AS src, id, full_name, created_at FROM \`${SOURCES[k].table}\` WHERE created_at > ? AND created_at <= ?${mine})`;
    })
    .join(" UNION ALL ");
  const leadArgs = (Object.keys(SOURCES) as EnquirySource[]).flatMap((k) => (k === "manual" ? [since, asOf, userId] : [since, asOf]));
  const [leadCount] = await pool.query(`SELECT COUNT(*) AS n FROM (${leadSql}) t`, leadArgs);
  const [leadRows] = await pool.query(`SELECT * FROM (${leadSql}) t ORDER BY created_at DESC LIMIT ${SHOW}`, leadArgs);

  const [payCount] = await pool.query(
    "SELECT COUNT(*) AS n FROM payments WHERE created_at > ? AND created_at <= ? AND (created_by IS NULL OR created_by <> ?)",
    [since, asOf, userId]
  );
  const [payRows] = await pool.query(
    `SELECT client_name, amount, currency, status, created_at FROM payments
      WHERE created_at > ? AND created_at <= ? AND (created_by IS NULL OR created_by <> ?) ORDER BY created_at DESC LIMIT ${SHOW}`,
    [since, asOf, userId]
  );

  let appCount: unknown = [{ n: 0 }];
  let appRows: unknown = [];
  try {
    [appCount] = await pool.query("SELECT COUNT(*) AS n FROM job_applications WHERE created_at > ? AND created_at <= ?", [since, asOf]);
    [appRows] = await pool.query(
      `SELECT full_name, job_title, created_at FROM job_applications WHERE created_at > ? AND created_at <= ? ORDER BY created_at DESC LIMIT ${SHOW}`,
      [since, asOf]
    );
  } catch {
    /* applications table not created yet */
  }

  const n = (rows: unknown) => Number((rows as { n: number }[])[0]?.n || 0);
  const iso = (v: unknown) => new Date(v as string).toISOString();

  const groups: NotifyGroup[] = [
    {
      key: "leads",
      label: "New leads",
      count: n(leadCount),
      href: "/crm/enquiries",
      items: (leadRows as Record<string, unknown>[]).map((r) => ({
        title: String(r.full_name),
        sub: SOURCE_LABEL[r.src as EnquirySource] || "Lead",
        at: iso(r.created_at),
        href: `/crm/enquiries?source=${r.src}`,
      })),
    },
    {
      key: "payments",
      label: "New payments",
      count: n(payCount),
      href: "/crm/payments",
      items: (payRows as Record<string, unknown>[]).map((r) => ({
        title: String(r.client_name),
        sub: `${Number(r.amount).toLocaleString("en-US", { style: "currency", currency: String(r.currency || "USD") })} · ${String(r.status).replace("_", " ")}`,
        at: iso(r.created_at),
        href: "/crm/payments",
      })),
    },
    {
      key: "applications",
      label: "New job applications",
      count: n(appCount),
      href: "/crm/applications",
      items: (appRows as Record<string, unknown>[]).map((r) => ({
        title: String(r.full_name),
        sub: `Applied for ${String(r.job_title)}`,
        at: iso(r.created_at),
        href: "/crm/applications",
      })),
    },
  ];
  return { asOf, total: groups.reduce((a, g) => a + g.count, 0), groups };
}

/** Everything up to asOf has been seen by this user */
export async function markSeen(userId: number, asOf: string) {
  await getPool().execute("UPDATE crm_users SET notified_at = GREATEST(COALESCE(notified_at, '1970-01-02'), ?) WHERE id = ?", [asOf, userId]);
}

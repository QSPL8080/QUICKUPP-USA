import { getUserFor, roleName } from "@/lib/crm/auth";
import { ROLE_ACCESS } from "@/lib/crm/roles";
import { listUsers } from "@/lib/crm/users";
import { getPool } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";
import { csvFile } from "@/lib/crm/csv";
import { SOURCES } from "@/lib/crm/data";
import { exportStamp, exportZone, viewerTimeZone } from "@/lib/crm/crmTime";

/*
 * GET → the CRM team (Super Admin and Admin) as a CSV file. Passwords are never
 * exported; the file only says when each one was last changed.
 */
export async function GET() {
  const me = await getUserFor("users");
  if (!me) return new Response("Please sign in again.", { status: 401 });
  const users = await listUsers({ withPasswords: false });
  const [extra] = await getPool()
    .query<RowDataPacket[]>("SELECT id, password_changed_at FROM crm_users")
    .catch(() => [[] as RowDataPacket[]]);
  const changed = new Map(extra.map((r) => [Number(r.id), r.password_changed_at ? new Date(r.password_changed_at).toISOString() : null]));
  // leads handled by each person, across every form and manual leads
  const leads = new Map<string, number>();
  for (const { table } of Object.values(SOURCES)) {
    const [assigned] = await getPool()
      .query<RowDataPacket[]>(`SELECT assigned_to AS name, COUNT(*) AS n FROM \`${table}\` WHERE assigned_to IS NOT NULL AND assigned_to <> '' GROUP BY assigned_to`)
      .catch(() => [[] as RowDataPacket[]]);
    for (const r of assigned) leads.set(String(r.name), (leads.get(String(r.name)) || 0) + Number(r.n));
  }
  const tz = await viewerTimeZone();
  const zone = exportZone(tz);

  const head = ["Sr. No", "User ID", "Name", "Username", "Email", "Role", "Access", "Account", "Leads Handled", `Last Sign-in (${zone})`, `Password Last Changed (${zone})`, `Added (${zone})`];
  const lines = users.map((u, i) => [
    i + 1,
    u.id,
    u.name,
    u.username,
    u.email,
    roleName(u.role),
    ROLE_ACCESS[u.role],
    u.isActive ? "Active" : "Turned off",
    leads.get(u.name) || 0,
    exportStamp(u.lastLoginAt, tz) || "Never",
    exportStamp(changed.get(u.id) || null, tz),
    exportStamp(u.createdAt, tz),
  ]);
  return csvFile(`quickupp-crm-team-${new Date().toISOString().slice(0, 10)}.csv`, head, lines);
}

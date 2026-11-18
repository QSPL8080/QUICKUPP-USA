import "server-only";
import { getPool } from "@/lib/db";
import { EMAIL_LOGO_SRC, escapeHtml, sendMail } from "@/lib/mailer";
import { SITE_URL } from "@/lib/siteUrl";
import { roleName } from "@/lib/crm/roles";

/*
 * Alerts for one team member: a lead or a meeting assigned to them, a meeting
 * moved to another BDM, a meeting a BDM/BDE booked. Each alert is a CRM
 * notification (crm_user_alerts, shown in the bell) and, where asked, an email
 * to the member's own address.
 */

export type AlertKind =
  | "lead_assigned"
  | "meeting_assigned"
  | "meeting_transferred"
  | "meeting_booked"
  | "meeting_note"
  | "meeting_changed"
  | "meeting_completed"
  | "client_converted"
  | "payment_received"
  | "balance_paid";

export type TeamMember = { id: number; name: string; email: string; role: string };

/** Active team members by id (deleted and switched-off accounts are left out) */
export async function membersById(ids: number[]): Promise<TeamMember[]> {
  const list = [...new Set(ids.filter((n) => Number.isInteger(n) && n > 0))];
  if (!list.length) return [];
  const [rows] = await getPool().query(
    "SELECT id, name, email, role FROM crm_users WHERE id IN (?) AND is_active = 1 AND deleted_at IS NULL",
    [list]
  );
  return (rows as TeamMember[]).map((r) => ({ id: Number(r.id), name: String(r.name), email: String(r.email || ""), role: String(r.role) }));
}

/** The Super Admin and every active Admin */
export async function adminMembers(): Promise<TeamMember[]> {
  const [rows] = await getPool().query(
    "SELECT id, name, email, role FROM crm_users WHERE role IN ('super_admin', 'admin') AND is_active = 1 AND deleted_at IS NULL"
  );
  return (rows as TeamMember[]).map((r) => ({ id: Number(r.id), name: String(r.name), email: String(r.email || ""), role: String(r.role) }));
}

/** Adds a CRM notification for each of these team members */
export async function addAlerts(userIds: number[], a: { kind: AlertKind; title: string; sub: string; href: string }) {
  const ids = [...new Set(userIds.filter((n) => Number.isInteger(n) && n > 0))];
  if (!ids.length) return;
  await getPool()
    .query("INSERT INTO crm_user_alerts (user_id, kind, title, sub, href) VALUES ?", [
      ids.map((id) => [id, a.kind, a.title.slice(0, 190), a.sub.slice(0, 500), a.href.slice(0, 255)]),
    ])
    .catch((err) => console.error("[alerts] could not save the notification:", err));
}

/** A short email to team members, in the CRM's email style (never throws) */
export async function emailTeam(
  to: TeamMember[],
  m: { subject: string; tag: string; color?: string; heading: string; intro: string; rows: [string, string][]; cta: { label: string; href: string } }
) {
  const addresses = [...new Set(to.map((t) => t.email.trim().toLowerCase()).filter((e) => e.includes("@")))];
  if (!addresses.length) return;
  const url = m.cta.href.startsWith("http") ? m.cta.href : `${SITE_URL}${m.cta.href}`;
  const cell = "padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:14px;vertical-align:top";
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px 12px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
    <div style="background:#0b0f17;padding:20px 26px;text-align:center">
      <img src="${EMAIL_LOGO_SRC}" alt="Quickupp Softech" width="160" style="display:block;margin:0 auto;max-width:160px;height:auto"/>
    </div>
    <div style="padding:22px 26px 6px">
      <span style="display:inline-block;background:${m.color || "#4f46e5"};color:#fff;font-size:11px;font-weight:800;letter-spacing:.1em;padding:5px 10px;border-radius:999px">${escapeHtml(m.tag)}</span>
      <h1 style="font-size:20px;margin:12px 0 4px">${escapeHtml(m.heading)}</h1>
      <p style="margin:0;color:#475569;font-size:14px;line-height:1.6">${escapeHtml(m.intro)}</p>
    </div>
    <div style="padding:8px 26px 22px">
      <table style="width:100%;border-collapse:collapse">
        ${m.rows
          .filter(([, v]) => v)
          .map(
            ([k, v]) =>
              `<tr><td style="${cell};width:150px;color:#64748b;font-weight:600;padding-right:12px">${escapeHtml(k)}</td><td style="${cell};font-weight:600">${escapeHtml(v).replace(/\n/g, "<br/>")}</td></tr>`
          )
          .join("")}
      </table>
      <p style="margin:20px 0 0"><a href="${escapeHtml(url)}" style="display:inline-block;background:#0b0f17;color:#fff;text-decoration:none;font-weight:700;font-size:13.5px;padding:11px 20px;border-radius:8px">${escapeHtml(m.cta.label)}</a></p>
    </div>
  </div></body></html>`;
  const text = `${m.heading}\n\n${m.intro}\n\n${m.rows
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v.replace(/\n/g, " | ")}`)
    .join("\n")}\n\n${m.cta.label}: ${url}`;
  // one email per person, so nobody sees the others' addresses; a failed send is tried once more, then logged
  for (const address of addresses) {
    let ok = await sendMail({ channel: "info", to: address, subject: m.subject, html, text }).catch(() => false);
    if (!ok) {
      await new Promise((r) => setTimeout(r, 2000));
      ok = await sendMail({ channel: "info", to: address, subject: m.subject, html, text }).catch(() => false);
    }
    if (!ok) console.error(`[alerts] email not delivered after a retry: "${m.subject}" to ${address.replace(/^(.).*@/, "$1***@")}`);
  }
}

export const memberLabel = (m: { name: string; role: string }) => `${m.name} (${roleName(m.role)})`;

import "server-only";
import { SUPER_ADMIN_EMAIL, type CrmUser } from "@/lib/crm/auth";
import { escapeHtml, sendMail } from "@/lib/mailer";
import { roleLabel } from "@/lib/crm/activity";

/*
 * Emails the super admin (info@quickuppsoftech.us) whenever a team account's
 * name, username, email or password is changed. The new password itself is
 * never put in an email: the super admin can see it in the CRM under
 * Team & Users.
 */

type Account = { id: number; name: string; username: string; email: string; role: string };

export async function notifyAccountChange(opts: { before: Account; after: Account; passwordChanged: boolean; changedBy: CrmUser }) {
  const { before, after, passwordChanged, changedBy } = opts;
  const rows: [string, string, string][] = [];
  if (before.name !== after.name) rows.push(["Name", before.name, after.name]);
  if (before.username !== after.username) rows.push(["Username", `@${before.username}`, `@${after.username}`]);
  if (before.email !== after.email) rows.push(["Email", before.email, after.email]);
  if (passwordChanged) rows.push(["Password", "—", "Changed"]);
  if (!rows.length) return false;

  const self = changedBy.id === after.id;
  const who = `${roleLabel(changedBy.role)} (${changedBy.name})`;
  const account = `${roleLabel(after.role)} account “${after.name}”`;
  const subject = passwordChanged
    ? `CRM password changed: ${after.name} (${roleLabel(after.role)})`
    : `CRM account details changed: ${after.name} (${roleLabel(after.role)})`;
  const when = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.quickuppsoftech.us";

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px 12px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
    <div style="background:#0b0f17;padding:20px 26px;color:#fff">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8">Quickupp CRM · Security notice</div>
      <div style="font-size:18px;font-weight:800;margin-top:6px">${escapeHtml(passwordChanged ? "A password was changed" : "Account details were changed")}</div>
    </div>
    <div style="padding:22px 26px">
      <p style="margin:0 0 14px;font-size:14.5px;line-height:1.6">The ${escapeHtml(account)} was updated ${self ? "by the account owner" : `by ${escapeHtml(who)}`} on ${escapeHtml(when)}.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><th align="left" style="padding:8px 0;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0">Field</th><th align="left" style="padding:8px 0;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0">Before</th><th align="left" style="padding:8px 0;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0">Now</th></tr>
        ${rows
          .map(
            ([f, a, b]) =>
              `<tr><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-weight:600">${escapeHtml(f)}</td><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;color:#64748b">${escapeHtml(a)}</td><td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-weight:700">${escapeHtml(b)}</td></tr>`
          )
          .join("")}
      </table>
      ${passwordChanged ? `<p style="margin:16px 0 0;font-size:13.5px;line-height:1.6;color:#334155">For security the new password is not included in this email. You can view it in the CRM under <strong>Team &amp; Users</strong>.</p>` : ""}
      <p style="margin:18px 0 0"><a href="${siteUrl}/crm/users" style="display:inline-block;background:#0b0f17;color:#fff;text-decoration:none;font-weight:700;font-size:13.5px;padding:11px 20px;border-radius:8px">Open Team &amp; Users</a></p>
      <p style="margin:16px 0 0;font-size:12.5px;color:#94a3b8">If you didn't expect this change, deactivate the account from Team &amp; Users and set a new password.</p>
    </div>
  </div></body></html>`;

  const text = `${subject}\n\nThe ${account} was updated ${self ? "by the account owner" : `by ${who}`} on ${when}.\n\n${rows
    .map(([f, a, b]) => `${f}: ${a} -> ${b}`)
    .join("\n")}\n\n${passwordChanged ? "The new password is not included in this email; view it in the CRM under Team & Users.\n" : ""}${siteUrl}/crm/users`;

  return sendMail({ channel: "info", to: SUPER_ADMIN_EMAIL, subject, html, text });
}

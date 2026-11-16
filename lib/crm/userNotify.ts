import "server-only";
import { getPool } from "@/lib/db";
import { sendMail, EMAIL_LOGO_SRC } from "@/lib/mailer";
import { SITE_URL } from "@/lib/siteUrl";

export type UserNotificationParams = {
  userId: number;
  title: string;
  message: string;
  link?: string;
  kind?: "lead_assigned" | "meeting_reassigned" | "client_converted" | "payment_received" | "general";
  sendEmail?: boolean;
};

export async function notifyUser(params: UserNotificationParams): Promise<boolean> {
  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT id, name, email, is_active FROM crm_users WHERE id = ? LIMIT 1",
    [params.userId]
  );
  const user = (rows as { id: number; name: string; email: string; is_active: number }[])[0];
  if (!user || Number(user.is_active) !== 1) return false;

  await pool.query(
    "INSERT INTO crm_user_notifications (user_id, title, message, link, kind) VALUES (?, ?, ?, ?, ?)",
    [params.userId, params.title, params.message, params.link || null, params.kind || "general"]
  );

  if (params.sendEmail !== false && user.email) {
    const actionUrl = params.link ? (params.link.startsWith("http") ? params.link : `${SITE_URL}${params.link}`) : `${SITE_URL}/crm`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
        <div style="background: #0f172a; padding: 20px 24px; text-align: center;">
          <img src="${EMAIL_LOGO_SRC}" alt="Quickupp Softech" style="height: 32px; max-width: 180px; object-fit: contain;" />
        </div>
        <div style="padding: 28px 24px; color: #1e293b; line-height: 1.6;">
          <h2 style="margin: 0 0 12px; font-size: 19px; font-weight: 700; color: #0f172a;">${params.title}</h2>
          <p style="margin: 0 0 16px; font-size: 14.5px; color: #334155;">Hello <strong>${user.name}</strong>,</p>
          <div style="background: #f8fafc; border-left: 4px solid #4f46e5; padding: 14px 18px; border-radius: 4px; margin-bottom: 24px; font-size: 14px; color: #1e293b;">
            ${params.message}
          </div>
          <div style="text-align: center; margin: 24px 0 16px;">
            <a href="${actionUrl}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 11px 24px; border-radius: 6px;">
              Open in CRM &rarr;
            </a>
          </div>
        </div>
        <div style="background: #f1f5f9; padding: 14px 24px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0;">
          This is an automated notification from Quickupp Softech CRM.
        </div>
      </div>
    `;

    const text = `Quickupp Softech CRM Notification\n\n${params.title}\n\nHello ${user.name},\n\n${params.message}\n\nView details: ${actionUrl}\n`;

    void sendMail({
      channel: "info",
      to: user.email,
      subject: `[CRM] ${params.title}`,
      html,
      text,
    }).catch((err) => console.error(`[userNotify] Email to ${user.email} failed:`, err));
  }

  return true;
}

export async function notifyLeadAssigned(opts: {
  leadName: string;
  leadEmail?: string | null;
  leadSource: string;
  leadId: number;
  assignedToName: string;
  assignedByName: string;
}) {
  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT id, name, email FROM crm_users WHERE name = ? AND is_active = 1 LIMIT 1",
    [opts.assignedToName]
  );
  const user = (rows as { id: number; name: string; email: string }[])[0];
  if (!user) return;

  const leadTitle = opts.leadName || opts.leadEmail || `Lead #${opts.leadId}`;
  await notifyUser({
    userId: user.id,
    title: `New Lead Assigned to You: ${leadTitle}`,
    message: `<strong>${opts.assignedByName}</strong> has assigned lead <strong>${leadTitle}</strong> (${opts.leadSource}) to you. Please review the requirements and follow up with the client.`,
    link: `/crm/enquiries?q=${encodeURIComponent(opts.leadEmail || opts.leadName || "")}`,
    kind: "lead_assigned",
    sendEmail: true,
  });
}

export async function notifyMeetingAssigned(opts: {
  meetingId: number;
  inviteeName: string;
  inviteeEmail: string;
  startTime: string;
  assignedBdmName: string;
  assignedByName: string;
}) {
  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT id, name, email FROM crm_users WHERE name = ? AND is_active = 1 LIMIT 1",
    [opts.assignedBdmName]
  );
  const user = (rows as { id: number; name: string; email: string }[])[0];
  if (!user) return;

  const whenStr = new Date(opts.startTime).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  await notifyUser({
    userId: user.id,
    title: `Calendly Meeting Assigned to You: ${opts.inviteeName}`,
    message: `You have been assigned as the BDM for the discovery call with <strong>${opts.inviteeName}</strong> (${opts.inviteeEmail}) scheduled for <strong>${whenStr}</strong> by ${opts.assignedByName}.`,
    link: "/crm/meetings",
    kind: "meeting_reassigned",
    sendEmail: true,
  });
}

export async function notifyClientConverted(opts: {
  clientName: string;
  clientEmail: string;
  service: string;
  amountPaid: number;
  currency: string;
  assignedBdmName?: string | null;
}) {
  const pool = getPool();
  let targetUsers: { id: number; name: string; email: string }[] = [];

  if (opts.assignedBdmName) {
    const [rows] = await pool.query(
      "SELECT id, name, email FROM crm_users WHERE name = ? AND is_active = 1 LIMIT 1",
      [opts.assignedBdmName]
    );
    targetUsers = rows as { id: number; name: string; email: string }[];
  }

  const [saRows] = await pool.query(
    "SELECT id, name, email FROM crm_users WHERE role = 'super_admin' AND is_active = 1"
  );
  const allUsers = [...targetUsers, ...(saRows as { id: number; name: string; email: string }[])];
  const seenIds = new Set<number>();

  for (const u of allUsers) {
    if (seenIds.has(u.id)) continue;
    seenIds.add(u.id);

    await notifyUser({
      userId: u.id,
      title: `🎉 Lead Converted to Client: ${opts.clientName}`,
      message: `Lead <strong>${opts.clientName}</strong> (${opts.clientEmail}) has successfully made a verified payment of <strong>${opts.currency} ${opts.amountPaid.toFixed(2)}</strong> for <strong>${opts.service}</strong> and has been automatically converted into an active Client account.`,
      link: "/crm/clients",
      kind: "client_converted",
      sendEmail: true,
    });
  }
}

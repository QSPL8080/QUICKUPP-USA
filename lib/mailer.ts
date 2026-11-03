import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/*
 * Outgoing email (server side only). Uses the SMTP mailbox set in the
 * environment variables — on Hostinger: SMTP_HOST=smtp.hostinger.com,
 * SMTP_PORT=465, SMTP_USER=<a mailbox on quickuppsoftech.us>, SMTP_PASS=<its
 * password>. Without them, nothing is sent and the caller is told so.
 */

declare global {
  var __quickuppMailers: Record<string, Transporter> | undefined;
}

export const HR_EMAIL = process.env.HR_EMAIL || "hr@quickuppsoftech.us";
export const LEADS_NOTIFICATION_EMAIL = process.env.LEADS_EMAIL || "info@quickuppsoftech.us";
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@quickuppsoftech.us";
export const CALENDLY_MEETING_EMAIL = "quickuppsoftechmeet@gmail.com";

export type MailChannel = "info" | "hr" | "default";

export type Mail = {
  to: string;
  channel?: MailChannel;
  fromName?: string;
  fromAddress?: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer; contentType: string }[];
};

export const mailConfigured = (channel: MailChannel = "default") => {
  const host = process.env.SMTP_HOST;
  if (!host) return false;
  if (channel === "hr") {
    return Boolean((process.env.HR_SMTP_USER || process.env.SMTP_USER) && (process.env.HR_SMTP_PASS || process.env.SMTP_PASS));
  }
  if (channel === "info") {
    return Boolean((process.env.INFO_SMTP_USER || process.env.SMTP_USER) && (process.env.INFO_SMTP_PASS || process.env.SMTP_PASS));
  }
  return Boolean((process.env.INFO_SMTP_USER || process.env.SMTP_USER) && (process.env.INFO_SMTP_PASS || process.env.SMTP_PASS));
};

function getTransporter(channel: MailChannel = "default"): { transporter: Transporter; fromAddress: string } | null {
  const host = process.env.SMTP_HOST || "smtp.hostinger.com";
  const port = Number(process.env.SMTP_PORT || 465);

  let user = "";
  let pass = "";

  if (channel === "hr") {
    user = process.env.HR_SMTP_USER || process.env.SMTP_USER || "";
    pass = process.env.HR_SMTP_PASS || process.env.SMTP_PASS || "";
  } else if (channel === "info") {
    user = process.env.INFO_SMTP_USER || process.env.SMTP_USER || "";
    pass = process.env.INFO_SMTP_PASS || process.env.SMTP_PASS || "";
  } else {
    user = process.env.INFO_SMTP_USER || process.env.SMTP_USER || "";
    pass = process.env.INFO_SMTP_PASS || process.env.SMTP_PASS || "";
  }

  if (!user || !pass) return null;

  if (!globalThis.__quickuppMailers) {
    globalThis.__quickuppMailers = {};
  }

  const key = `${host}:${port}:${user}`;
  if (!globalThis.__quickuppMailers[key]) {
    globalThis.__quickuppMailers[key] = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }

  return { transporter: globalThis.__quickuppMailers[key], fromAddress: user };
}

/** Sends an email; resolves true when the mail server accepted it */
export async function sendMail(mail: Mail): Promise<boolean> {
  const channel = mail.channel || "default";
  const mailer = getTransporter(channel);
  if (!mailer) {
    console.warn(`[mail] not sent: no SMTP credentials configured for channel "${channel}"`);
    return false;
  }
  try {
    const { fromName, fromAddress, channel: _ch, ...rest } = mail;
    await mailer.transporter.sendMail({
      from: {
        name: fromName || (channel === "hr" ? "Quickupp Careers" : "Quickupp Softech LLC"),
        address: fromAddress || mailer.fromAddress,
      },
      ...rest,
    });
    return true;
  } catch (err) {
    console.error(`[mail:${channel}] sending failed:`, err);
    return false;
  }
}

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

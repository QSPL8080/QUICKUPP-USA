import "server-only";
import fs from "node:fs";
import path from "node:path";
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

/*
 * The logo in email headers is sent inside the email itself (an inline
 * attachment), so it shows in every inbox without loading anything from the
 * website. Templates use EMAIL_LOGO_SRC as the <img> src.
 * email-logo.png has the dark header colour built into the image: the site's
 * logo is white lettering on a transparent background, which disappears in
 * mail apps that drop the header's background colour (Outlook, dark mode).
 */
const LOGO_CID = "qs-logo";
export const EMAIL_LOGO_SRC = `cid:${LOGO_CID}`;
let logoBytes: Buffer | null | undefined;
function emailLogo(): Buffer | null {
  if (logoBytes !== undefined) return logoBytes;
  try {
    logoBytes = fs.readFileSync(path.join(process.cwd(), "public", "images", "email-logo.png"));
  } catch {
    logoBytes = null;
  }
  return logoBytes;
}

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
    const attachments: Record<string, unknown>[] = [...(rest.attachments || [])];
    if (rest.html.includes(EMAIL_LOGO_SRC)) {
      const logo = emailLogo();
      if (logo) {
        attachments.push({ filename: "quickupp-logo.png", content: logo, contentType: "image/png", cid: LOGO_CID, contentDisposition: "inline" });
      } else {
        // no logo file on this server: fall back to the website copy
        const site = process.env.NEXT_PUBLIC_SITE_URL || "https://www.quickuppsoftech.us";
        rest.html = rest.html.split(EMAIL_LOGO_SRC).join(`${site}/images/email-logo.png`);
      }
    }
    await mailer.transporter.sendMail({
      from: {
        name: fromName || (channel === "hr" ? "Quickupp Careers" : "Quickupp Softech LLC"),
        address: fromAddress || mailer.fromAddress,
      },
      ...rest,
      attachments,
    });
    return true;
  } catch (err) {
    console.error(`[mail:${channel}] sending failed:`, err);
    return false;
  }
}

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/*
 * Outgoing email (server side only). Uses the SMTP mailbox set in the
 * environment variables — on Hostinger: SMTP_HOST=smtp.hostinger.com,
 * SMTP_PORT=465, SMTP_USER=<a mailbox on quickuppsoftech.us>, SMTP_PASS=<its
 * password>. Without them, nothing is sent and the caller is told so.
 */

declare global {
  var __quickuppMailer: Transporter | undefined;
}

export const HR_EMAIL = process.env.HR_EMAIL || "hr@quickuppsoftech.us";

export const mailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

function transporter(): Transporter {
  if (globalThis.__quickuppMailer) return globalThis.__quickuppMailer;
  const port = Number(process.env.SMTP_PORT || 465);
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  globalThis.__quickuppMailer = t;
  return t;
}

export type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer; contentType: string }[];
};

/** Sends an email; resolves true when the mail server accepted it */
export async function sendMail(mail: Mail): Promise<boolean> {
  if (!mailConfigured()) {
    console.warn("[mail] not sent: set SMTP_HOST, SMTP_USER and SMTP_PASS to send email");
    return false;
  }
  try {
    await transporter().sendMail({
      from: { name: "Quickupp Softech Careers", address: process.env.SMTP_FROM || (process.env.SMTP_USER as string) },
      ...mail,
    });
    return true;
  } catch (err) {
    console.error("[mail] sending failed:", err);
    return false;
  }
}

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

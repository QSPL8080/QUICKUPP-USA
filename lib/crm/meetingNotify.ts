import "server-only";
import { getPool } from "@/lib/db";
import { CALENDLY_MEETING_EMAIL, EMAIL_LOGO_SRC, LEADS_NOTIFICATION_EMAIL, escapeHtml, sendMail } from "@/lib/mailer";
import { SITE_URL } from "@/lib/siteUrl";

/*
 * Team email for every discovery / Calendly meeting that is booked, rescheduled
 * or canceled — whether the client did it on Calendly or the website, or a team
 * member did it in the CRM. It goes to quickuppsoftechmeet@gmail.com and
 * info@quickuppsoftech.us.
 *
 * Each change is emailed once: the crm_meeting_notices table remembers what was
 * sent, because Calendly reports the same change more than once (webhook,
 * website embed and the regular sync).
 */

export const MEETING_NOTIFY_TO = Array.from(new Set([CALENDLY_MEETING_EMAIL, LEADS_NOTIFICATION_EMAIL, "info@quickuppsoftech.us"]));

export type MeetingNoticeKind = "booked" | "rescheduled" | "canceled";

type Opts = {
  /** what makes this change unique (a new invitee, a new time, …) */
  key: string;
  /** when the change happened; changes older than 2 days (an old meeting read for the first time) are not emailed */
  at?: string | null;
  /** who made the change, when it was made in the CRM */
  by?: string | null;
  reason?: string | null;
};

const RECENT_MS = 2 * 24 * 3600 * 1000;
const PLACEHOLDER_EMAIL = "client@booking";

type Row = {
  id: number;
  event_name: string | null;
  status: string;
  start_time: string | null;
  end_time: string | null;
  previous_start_time: string | null;
  invitee_name: string | null;
  invitee_email: string | null;
  invitee_phone: string | null;
  invitee_timezone: string | null;
  location_type: string | null;
  location_text: string | null;
  join_url: string | null;
  reschedule_url: string | null;
  answers: string | null;
  guests: string | null;
  host_name: string | null;
  canceled_by: string | null;
  cancel_reason: string | null;
  reschedule_count: number;
  source: string | null;
};

const iso = (col: string) => `IF(${col} IS NULL, NULL, DATE_FORMAT(${col}, '%Y-%m-%dT%H:%i:%sZ'))`;

/** Emails the team about a meeting change (never throws; runs in the background) */
export function notifyMeeting(meetingId: number, kind: MeetingNoticeKind, opts: Opts) {
  void send(meetingId, kind, opts).catch((err) => console.error("[meetings] team email failed:", err));
}

async function send(meetingId: number, kind: MeetingNoticeKind, opts: Opts) {
  if (!meetingId) return;
  if (opts.at) {
    const t = new Date(opts.at).getTime();
    if (!isNaN(t) && Date.now() - t > RECENT_MS) return;
  }
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, event_name, status, ${iso("start_time")} AS start_time, ${iso("end_time")} AS end_time, ${iso("previous_start_time")} AS previous_start_time,
            invitee_name, invitee_email, invitee_phone, invitee_timezone, location_type, location_text, join_url, reschedule_url,
            answers, guests, host_name, canceled_by, cancel_reason, reschedule_count, source
       FROM crm_meetings WHERE id = ? LIMIT 1`,
    [meetingId]
  );
  const m = (rows as Row[])[0];
  if (!m || m.invitee_email === PLACEHOLDER_EMAIL) return;
  // a booking or new time that has already passed is old news
  if (kind !== "canceled" && m.start_time && new Date(m.start_time).getTime() < Date.now() - 3600_000) return;

  // once per change
  const [res] = await pool.query("INSERT IGNORE INTO crm_meeting_notices (meeting_id, kind, notice_key) VALUES (?, ?, ?)", [meetingId, kind, opts.key.slice(0, 255)]);
  if (!(res as { affectedRows: number }).affectedRows) return;

  const { subject, html, text } = compose(m, kind, opts);
  const ok = await sendMail({ channel: "info", to: MEETING_NOTIFY_TO.join(", "), subject, html, text, replyTo: m.invitee_email || undefined });
  if (!ok) {
    // not sent (mail not set up or the server refused): allow a later try
    await pool.query("DELETE FROM crm_meeting_notices WHERE meeting_id = ? AND kind = ? AND notice_key = ?", [meetingId, kind, opts.key.slice(0, 255)]).catch(() => {});
  }
}

/* ---------------------------------------------------------------- the email */

function when(isoTime: string | null, tz: string) {
  if (!isoTime) return "—";
  const d = new Date(isoTime);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
}

function times(isoTime: string | null, clientTz: string | null) {
  const out = [`${when(isoTime, "Asia/Kolkata")}`.replace(/GMT\+5:30/, "IST"), when(isoTime, "America/New_York")];
  if (clientTz && clientTz !== "Asia/Kolkata" && clientTz !== "Asia/Calcutta" && clientTz !== "America/New_York") {
    try {
      out.push(`${when(isoTime, clientTz)} (client's time)`);
    } catch {}
  }
  return out;
}

function minutes(a: string | null, b: string | null) {
  if (!a || !b) return null;
  const n = Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
  return n > 0 ? `${n} min` : null;
}

function locationLabel(m: Row) {
  const t = (m.location_type || "").toLowerCase();
  const kind = t.includes("google") ? "Google Meet" : t.includes("zoom") ? "Zoom" : t.includes("teams") ? "Microsoft Teams" : t.includes("phone") ? "Phone call" : t ? t.replace(/_/g, " ") : "";
  return [kind, m.location_text].filter(Boolean).join(" · ") || null;
}

function parseList<T>(v: string | null): T[] {
  try {
    const x = v ? JSON.parse(v) : [];
    return Array.isArray(x) ? x : [];
  } catch {
    return [];
  }
}

const HEAD: Record<MeetingNoticeKind, { title: string; tag: string; color: string; subject: string }> = {
  booked: { title: "New meeting booked", tag: "BOOKED", color: "#16a34a", subject: "New meeting booked" },
  rescheduled: { title: "Meeting rescheduled", tag: "RESCHEDULED", color: "#d97706", subject: "Meeting rescheduled" },
  canceled: { title: "Meeting canceled", tag: "CANCELED", color: "#dc2626", subject: "Meeting canceled" },
};

function compose(m: Row, kind: MeetingNoticeKind, opts: Opts) {
  const h = HEAD[kind];
  const name = m.invitee_name || m.invitee_email || "A client";
  const event = m.event_name || "Discovery call";
  const startEt = when(m.start_time, "America/New_York");
  const subject = `${h.subject}: ${name} — ${event}, ${startEt}`;

  const rows: [string, string, boolean?][] = [];
  rows.push(["Client", name]);
  if (m.invitee_email) rows.push(["Email", m.invitee_email]);
  if (m.invitee_phone) rows.push(["Phone", m.invitee_phone]);
  rows.push(["Meeting", event]);
  rows.push([kind === "rescheduled" ? "New time" : kind === "canceled" ? "Was booked for" : "Time", times(m.start_time, m.invitee_timezone).join("\n")]);
  if (kind === "rescheduled" && m.previous_start_time) rows.push(["Previous time", times(m.previous_start_time, m.invitee_timezone).join("\n")]);
  const dur = minutes(m.start_time, m.end_time);
  if (dur) rows.push(["Duration", dur]);
  const loc = locationLabel(m);
  if (loc) rows.push(["Location", loc]);
  if (m.join_url && kind !== "canceled") rows.push(["Join link", m.join_url, true]);
  if (m.host_name) rows.push(["Host", m.host_name]);
  const guests = parseList<string>(m.guests);
  if (guests.length) rows.push(["Guests", guests.join(", ")]);
  if (kind === "canceled") {
    const by = opts.by || m.canceled_by;
    if (by) rows.push(["Canceled by", by]);
    const reason = opts.reason ?? m.cancel_reason;
    if (reason) rows.push(["Reason", reason]);
  } else {
    if (opts.by) rows.push([kind === "booked" ? "Booked by" : "Rescheduled by", opts.by]);
    if (opts.reason) rows.push(["Reason", opts.reason]);
  }
  if (m.source) rows.push(["Booked from", m.source === "crm" ? "CRM" : m.source.charAt(0).toUpperCase() + m.source.slice(1)]);
  const answers = parseList<{ question?: string; answer?: string }>(m.answers).filter((a) => a.answer);

  const crmUrl = `${SITE_URL}/crm/meetings`;
  const cell = "padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:14px;vertical-align:top";
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px 12px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
    <div style="background:#0b0f17;padding:20px 26px;text-align:center">
      <img src="${EMAIL_LOGO_SRC}" alt="Quickupp Softech" width="160" style="display:block;margin:0 auto;max-width:160px;height:auto"/>
    </div>
    <div style="padding:22px 26px 6px">
      <span style="display:inline-block;background:${h.color};color:#fff;font-size:11px;font-weight:800;letter-spacing:.1em;padding:5px 10px;border-radius:999px">${h.tag}</span>
      <h1 style="font-size:20px;margin:12px 0 4px">${escapeHtml(h.title)}</h1>
      <p style="margin:0;color:#475569;font-size:14px;line-height:1.6">${escapeHtml(name)} · ${escapeHtml(event)}</p>
    </div>
    <div style="padding:8px 26px 22px">
      <table style="width:100%;border-collapse:collapse">
        ${rows
          .map(
            ([k, v, link]) =>
              `<tr><td style="${cell};width:150px;color:#64748b;font-weight:600;padding-right:12px">${escapeHtml(k)}</td><td style="${cell};font-weight:600">${
                link ? `<a href="${escapeHtml(v)}" style="color:#4f46e5">${escapeHtml(v)}</a>` : escapeHtml(v).replace(/\n/g, "<br/>")
              }</td></tr>`
          )
          .join("")}
      </table>
      ${
        answers.length
          ? `<h2 style="font-size:14px;margin:20px 0 6px;color:#334155">Client's answers</h2>${answers
              .map((a) => `<p style="margin:0 0 10px;font-size:13.5px;line-height:1.55"><span style="color:#64748b">${escapeHtml(a.question || "")}</span><br/><strong>${escapeHtml(a.answer || "")}</strong></p>`)
              .join("")}`
          : ""
      }
      <p style="margin:20px 0 0"><a href="${crmUrl}" style="display:inline-block;background:#0b0f17;color:#fff;text-decoration:none;font-weight:700;font-size:13.5px;padding:11px 20px;border-radius:8px">Open Meetings in CRM</a></p>
    </div>
  </div></body></html>`;

  const text = `${h.title}\n\n${rows.map(([k, v]) => `${k}: ${v.replace(/\n/g, " | ")}`).join("\n")}${
    answers.length ? `\n\nClient's answers:\n${answers.map((a) => `- ${a.question}: ${a.answer}`).join("\n")}` : ""
  }\n\nOpen Meetings in CRM: ${crmUrl}`;
  return { subject, html, text };
}

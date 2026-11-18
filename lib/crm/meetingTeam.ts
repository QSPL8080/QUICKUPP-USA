import "server-only";
import { getPool } from "@/lib/db";
import { EMAIL_LOGO_SRC, escapeHtml, sendMail } from "@/lib/mailer";
import { isAdminLike, isSalesRole, roleName, type CrmUser } from "@/lib/crm/auth";
import { addAlerts, adminMembers, emailTeam, membersById } from "@/lib/crm/alerts";
import { isEnquirySource } from "@/lib/crm/leadOptions";
import { logActivity } from "@/lib/crm/activity";
import type { HistoryItem } from "@/lib/crm/calendly";
import { audit } from "@/lib/crm/audit";

/*
 * The team side of meetings:
 * - who sees a meeting (a BDM/BDE: the ones they scheduled or that are assigned to them)
 * - a meeting a team member schedules: the Admins and the Super Admin get an
 *   email and a CRM notification (when a BDM/BDE scheduled it), and the client
 *   gets an email
 * - assigning a meeting to a BDM, and moving it to another BDM
 */

type U = Pick<CrmUser, "id" | "name" | "role">;
const PLACEHOLDER_EMAIL = "client@booking";
const iso = (col: string) => `IF(${col} IS NULL, NULL, DATE_FORMAT(${col}, '%Y-%m-%dT%H:%i:%sZ'))`;
export const meetingHref = (id: number) => `/crm/meetings?open=${id}`;

type Basics = {
  id: number;
  event_name: string | null;
  status: string;
  start_time: string | null;
  end_time: string | null;
  invitee_name: string | null;
  invitee_email: string | null;
  invitee_phone: string | null;
  invitee_timezone: string | null;
  location_type: string | null;
  location_text: string | null;
  join_url: string | null;
  reschedule_url: string | null;
  cancel_url: string | null;
  host_name: string | null;
  created_by: number | null;
  assigned_bdm_id: number | null;
  history: string | null;
  lead_id: number | null;
  lead_source: string | null;
};

async function basics(id: number): Promise<Basics | null> {
  const [rows] = await getPool().query(
    `SELECT id, event_name, status, ${iso("start_time")} AS start_time, ${iso("end_time")} AS end_time, invitee_name, invitee_email, invitee_phone,
            invitee_timezone, location_type, location_text, join_url, reschedule_url, cancel_url, host_name, created_by, assigned_bdm_id, history, lead_id, lead_source
       FROM crm_meetings WHERE id = ? AND deleted_at IS NULL`,
    [id]
  );
  const r = (rows as Basics[])[0];
  return r ? { ...r, created_by: r.created_by ? Number(r.created_by) : null, assigned_bdm_id: r.assigned_bdm_id ? Number(r.assigned_bdm_id) : null } : null;
}

/** Whether this user may open this meeting (a BDM/BDE: only theirs) */
export async function canSeeMeeting(user: Pick<CrmUser, "id" | "role">, id: number) {
  if (!isSalesRole(user)) return true;
  const m = await basics(id);
  return Boolean(m && (m.created_by === user.id || m.assigned_bdm_id === user.id));
}

/** Whether this user may change this meeting (edit, reschedule, cancel, notes): Admins, or the BDM/BDE whose meeting it is */
export async function canWorkOnMeeting(user: Pick<CrmUser, "id" | "role">, id: number) {
  if (isAdminLike(user)) return true;
  if (!isSalesRole(user)) return false;
  return canSeeMeeting(user, id);
}

const when = (isoTime: string | null, tz: string) => {
  if (!isoTime) return "";
  try {
    return new Date(isoTime).toLocaleString("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  } catch {
    return new Date(isoTime).toUTCString();
  }
};
const location = (m: Basics) => {
  const t = (m.location_type || "").toLowerCase();
  const kind = t.includes("google") ? "Google Meet" : t.includes("zoom") ? "Zoom" : t.includes("teams") ? "Microsoft Teams" : t.includes("phone") || t.includes("call") ? "Phone call" : t === "physical" ? "In person" : "";
  return [kind, m.location_text].filter(Boolean).join(" · ");
};
/* the client's own time zone (when known; a meeting made in the CRM has the server's, which says nothing), and US Eastern */
const clientZone = (m: Basics) => (m.invitee_timezone && !/^(UTC|Etc\/|GMT)/i.test(m.invitee_timezone) ? m.invitee_timezone : null);
const timeRows = (m: Basics): string => {
  const tz = clientZone(m);
  return [tz ? when(m.start_time, tz) : "", tz !== "America/New_York" ? when(m.start_time, "America/New_York") : ""].filter(Boolean).join("\n");
};

/**
 * Records that a team member scheduled this meeting in the CRM (for a lead, when
 * one was picked). Returns true the first time, so the notices go out once.
 */
export async function claimMeeting(id: number, user: U, lead?: { source?: unknown; id?: unknown }) {
  const leadId = Number(lead?.id);
  const leadSource = isEnquirySource(lead?.source) && Number.isInteger(leadId) && leadId > 0 ? (lead!.source as string) : null;
  const [res] = await getPool().query("UPDATE crm_meetings SET created_by = ? WHERE id = ? AND created_by IS NULL AND deleted_at IS NULL", [user.id, id]);
  if (leadSource) {
    await getPool().query("UPDATE crm_meetings SET lead_source = ?, lead_id = ? WHERE id = ?", [leadSource, leadId, id]).catch(() => {});
  }
  return (res as { affectedRows: number }).affectedRows > 0;
}

/**
 * A meeting a team member scheduled: the client gets an email, and when a BDM/BDE
 * scheduled it, the Admins and the Super Admin get an email and a CRM notification.
 * Never throws.
 */
export async function announceScheduled(id: number, user: U, opts: { emailClient?: boolean } = {}) {
  try {
    const m = await basics(id);
    if (!m) return;
    if (isSalesRole(user)) {
      const admins = await adminMembers();
      const who = `${user.name} (${roleName(user.role)})`;
      const client = m.invitee_name || m.invitee_email || "a client";
      await addAlerts(
        admins.map((a) => a.id),
        { kind: "meeting_booked", title: `${who} scheduled a meeting`, sub: `With ${client} · ${when(m.start_time, "America/New_York")}`, href: meetingHref(id) }
      );
      await emailTeam(admins, {
        subject: `${who} scheduled a meeting with ${client}`,
        tag: "MEETING SCHEDULED",
        color: "#16a34a",
        heading: "A meeting was scheduled",
        intro: `${who} scheduled this meeting in the CRM.`,
        rows: [
          ["Client", m.invitee_name || ""],
          ["Email", m.invitee_email && m.invitee_email !== PLACEHOLDER_EMAIL ? m.invitee_email : ""],
          ["Phone", m.invitee_phone || ""],
          ["Meeting", m.event_name || "Strategy Call"],
          ["Time", timeRows(m)],
          ["Location", location(m)],
          ["Join link", m.join_url || ""],
          ["Scheduled by", who],
        ],
        cta: { label: "Open the meeting", href: meetingHref(id) },
      });
    }
    // one confirmation for the client: ours for meetings made in the CRM; a booking made through
    // Calendly already has Calendly's own confirmation, so ours is not sent again
    if (opts.emailClient !== false) await emailClient(m, user);
  } catch (err) {
    console.error("[meetings] could not send the scheduling notices:", err);
  }
}

/* the client's confirmation from us (Calendly sends its own as well when booked there) */
async function emailClient(m: Basics, user: U) {
  const to = (m.invitee_email || "").trim();
  if (!to.includes("@") || to === PLACEHOLDER_EMAIL) return;
  const name = (m.invitee_name || "").split(" ")[0] || "there";
  const rows: [string, string][] = [
    ["Meeting", m.event_name || "Strategy Call"],
    ["When", timeRows(m)],
    ["Where", location(m)],
    ["Join link", m.join_url || ""],
    ["With", `${user.name}, Quickupp Softech`],
  ];
  const cell = "padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:14px;vertical-align:top";
  const links = [
    m.reschedule_url ? `<a href="${escapeHtml(m.reschedule_url)}" style="color:#4f46e5;font-weight:600">Reschedule</a>` : "",
    m.cancel_url ? `<a href="${escapeHtml(m.cancel_url)}" style="color:#64748b;font-weight:600">Cancel</a>` : "",
  ].filter(Boolean);
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px 12px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
    <div style="background:#0b0f17;padding:20px 26px;text-align:center">
      <img src="${EMAIL_LOGO_SRC}" alt="Quickupp Softech" width="160" style="display:block;margin:0 auto;max-width:160px;height:auto"/>
    </div>
    <div style="padding:22px 26px 6px">
      <span style="display:inline-block;background:#16a34a;color:#fff;font-size:11px;font-weight:800;letter-spacing:.1em;padding:5px 10px;border-radius:999px">CONFIRMED</span>
      <h1 style="font-size:20px;margin:12px 0 4px">Your meeting is scheduled</h1>
      <p style="margin:0;color:#475569;font-size:14px;line-height:1.6">Hi ${escapeHtml(name)}, thank you for your time. Here are the details of your meeting with Quickupp Softech.</p>
    </div>
    <div style="padding:8px 26px 22px">
      <table style="width:100%;border-collapse:collapse">
        ${rows
          .filter(([, v]) => v)
          .map(
            ([k, v]) =>
              `<tr><td style="${cell};width:120px;color:#64748b;font-weight:600;padding-right:12px">${escapeHtml(k)}</td><td style="${cell};font-weight:600">${
                k === "Join link" ? `<a href="${escapeHtml(v)}" style="color:#4f46e5">${escapeHtml(v)}</a>` : escapeHtml(v).replace(/\n/g, "<br/>")
              }</td></tr>`
          )
          .join("")}
      </table>
      ${links.length ? `<p style="margin:16px 0 0;font-size:13.5px">Need a different time? ${links.join(" &middot; ")}</p>` : ""}
      <p style="margin:18px 0 0;color:#475569;font-size:13.5px;line-height:1.6">Reply to this email if you have any questions before the meeting.</p>
    </div>
  </div></body></html>`;
  const text = `Your meeting is scheduled\n\nHi ${name}, here are the details of your meeting with Quickupp Softech.\n\n${rows
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v.replace(/\n/g, " | ")}`)
    .join("\n")}${m.reschedule_url ? `\n\nReschedule: ${m.reschedule_url}` : ""}`;
  await sendMail({ channel: "info", to, subject: `Your meeting with Quickupp Softech: ${when(m.start_time, clientZone(m) || "America/New_York")}`, html, text }).catch(() => false);
}

/**
 * Assigns a meeting to a BDM (or to nobody). The new BDM gets an email and a CRM
 * notification; a BDM it is taken from is told it moved to someone else.
 */
export async function assignMeetingBdm(id: number, bdmId: number | null, by: U): Promise<{ ok: true; bdm: string | null } | { ok: false; error: string; status: number }> {
  const m = await basics(id);
  if (!m) return { ok: false, error: "This meeting was deleted.", status: 404 };
  let bdm: { id: number; name: string; email: string; role: string } | null = null;
  if (bdmId) {
    [bdm] = await membersById([bdmId]);
    if (!bdm || bdm.role !== "bdm") return { ok: false, error: "Choose an active BDM.", status: 400 };
  }
  const previousId = m.assigned_bdm_id;
  if ((bdm?.id ?? null) === previousId) return { ok: true, bdm: bdm?.name ?? null };
  const [previous] = previousId ? await membersById([previousId]) : [];
  // the previous BDM may have been switched off since: still named in the history
  const prevName =
    previous?.name ||
    (previousId
      ? String(((await getPool().query("SELECT name FROM crm_users WHERE id = ?", [previousId]))[0] as { name: string }[])[0]?.name || "")
      : "");

  let history: HistoryItem[] = [];
  try {
    history = m.history ? JSON.parse(m.history) : [];
  } catch {}
  history.push({ kind: "assigned", at: new Date().toISOString(), by: `${by.name} (${roleName(by.role)})`, bdm: bdm?.name || "", prevBdm: prevName || undefined });
  // only if nobody changed it in the meantime (two Admins assigning at once: the second is told to retry)
  const [upd] = await getPool().query(
    "UPDATE crm_meetings SET assigned_bdm_id = ?, assigned_at = IF(? IS NULL, NULL, UTC_TIMESTAMP()), history = ? WHERE id = ? AND assigned_bdm_id <=> ?",
    [bdm?.id ?? null, bdm?.id ?? null, JSON.stringify(history), id, previousId]
  );
  if (!(upd as { affectedRows: number }).affectedRows) return { ok: false, error: "Someone else just changed this meeting's BDM. Refresh and try again.", status: 409 };
  // who assigned it, and the assignment history (kept separately from the creator, which never changes)
  await getPool().query("UPDATE crm_meetings SET assigned_by = ? WHERE id = ?", [bdm ? by.id : null, id]).catch(() => {});
  await getPool()
    .query("INSERT INTO crm_meeting_assignments (meeting_id, previous_bdm_id, new_bdm_id, changed_by) VALUES (?, ?, ?, ?)", [id, previousId, bdm?.id ?? null, by.id])
    .catch((err) => console.error("[meetings] could not save the assignment history:", err?.message || err));
  await audit(by, "assign_meeting", "meeting", id, `${prevName || "nobody"} → ${bdm?.name || "nobody"}`, { before: { bdmId: previousId }, after: { bdmId: bdm?.id ?? null } });

  const client = m.invitee_name || m.invitee_email || "a client";
  const whenEt = when(m.start_time, "America/New_York");
  const details: [string, string][] = [
    ["Client", m.invitee_name || ""],
    ["Email", m.invitee_email && m.invitee_email !== PLACEHOLDER_EMAIL ? m.invitee_email : ""],
    ["Phone", m.invitee_phone || ""],
    ["Meeting", m.event_name || "Strategy Call"],
    ["Time", timeRows(m)],
    ["Location", location(m)],
    ["Join link", m.join_url || ""],
  ];
  const byText = `${by.name} (${roleName(by.role)})`;
  if (bdm) {
    await addAlerts([bdm.id], {
      kind: "meeting_assigned",
      title: `Meeting assigned to you: ${client}`,
      sub: `${whenEt} · by ${by.name}`,
      href: meetingHref(id),
    });
    await emailTeam([bdm], {
      subject: `Meeting assigned to you: ${client}, ${whenEt}`,
      tag: "MEETING ASSIGNED",
      color: "#4f46e5",
      heading: `You're taking this meeting, ${bdm.name.split(" ")[0] || bdm.name}`,
      intro: `${byText} assigned this meeting to you${prevName ? ` (it was with ${prevName})` : ""}. After the meeting, add your notes or the minutes in the CRM.`,
      rows: [...details, ["Assigned by", byText]],
      cta: { label: "Open the meeting", href: meetingHref(id) },
    });
  }
  if (previous && previous.id !== bdm?.id) {
    await addAlerts([previous.id], {
      kind: "meeting_transferred",
      title: `Meeting moved ${bdm ? `to ${bdm.name}` : "off your list"}: ${client}`,
      sub: `${whenEt} · by ${by.name}`,
      href: "/crm/meetings",
    });
    await emailTeam([previous], {
      subject: `Meeting with ${client} ${bdm ? `moved to ${bdm.name}` : "is no longer assigned to you"}`,
      tag: "MEETING TRANSFERRED",
      color: "#d97706",
      heading: bdm ? `This meeting is now with ${bdm.name}` : "This meeting is no longer assigned to you",
      intro: `${byText} ${bdm ? `moved this meeting to ${bdm.name} (BDM)` : "took this meeting off your list"}. You don't need to attend it.`,
      rows: [...details, ["Changed by", byText]],
      cta: { label: "Open Meetings", href: "/crm/meetings" },
    });
  }
  await logActivity({
    entity: "lead",
    id: Number(m.lead_id) || id,
    action: "meeting_assigned",
    text: bdm
      ? `Meeting with ${client} assigned to ${bdm.name} (BDM)${prevName ? `, moved from ${prevName}` : ""}`
      : `Meeting with ${client} unassigned${prevName ? ` (was ${prevName})` : ""}`,
    actor: { type: "user", user: by },
  }).catch(() => {});
  return { ok: true, bdm: bdm?.name ?? null };
}

/* ---------------------------------------------------------------- notes after the meeting */

/** The structured parts of a meeting note (all optional) */
export const NOTE_FIELDS = [
  ["summary", "Meeting summary"],
  ["requirements", "Client requirements"],
  ["discussion", "Discussion points"],
  ["budget", "Budget discussion"],
  ["serviceInterest", "Service interest"],
  ["nextSteps", "Next steps"],
  ["followUpDate", "Follow-up date"],
  ["remarks", "Additional remarks"],
] as const;
export type NoteDetails = Partial<Record<(typeof NOTE_FIELDS)[number][0], string>>;

export function readNoteDetails(raw: unknown): NoteDetails {
  const out: NoteDetails = {};
  let o: Record<string, unknown> = {};
  try {
    o = typeof raw === "string" ? JSON.parse(raw) : (raw as Record<string, unknown>) || {};
  } catch {}
  for (const [k] of NOTE_FIELDS) {
    const v = typeof o?.[k] === "string" ? (o[k] as string).trim() : "";
    if (!v) continue;
    out[k] = k === "followUpDate" ? (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "") : v.slice(0, 5000);
    if (!out[k]) delete out[k];
  }
  return out;
}

export type MeetingNote = {
  id: number;
  userId: number | null;
  userName: string;
  note: string;
  details: NoteDetails;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string | null;
};

/**
 * The notes of a meeting this user may read: Admins, the Super Admin and Viewers
 * read them all, and so does a BDM on the meeting; a BDE reads only their own
 * notes (never the confidential notes a BDM wrote).
 */
export async function listMeetingNotes(meetingId: number, viewer?: Pick<CrmUser, "id" | "role">): Promise<MeetingNote[]> {
  const onlyOwn = viewer?.role === "bde";
  const [rows] = await getPool()
    .query(
      `SELECT * FROM crm_meeting_notes WHERE meeting_id = ?${onlyOwn ? " AND user_id = ?" : ""} ORDER BY created_at DESC, id DESC`,
      onlyOwn ? [meetingId, viewer!.id] : [meetingId]
    )
    .catch(() => [[]] as unknown as [Record<string, unknown>[]]);
  const isoOf = (v: unknown) => (v ? new Date(v as string).toISOString() : null);
  return (rows as Record<string, unknown>[]).map((r) => ({
    id: Number(r.id),
    userId: r.user_id ? Number(r.user_id) : null,
    userName: String(r.user_name || ""),
    note: String(r.note || ""),
    details: readNoteDetails(r.details),
    fileName: r.file_name ? String(r.file_name) : null,
    fileType: r.file_type ? String(r.file_type) : null,
    fileSize: r.file_size ? Number(r.file_size) : null,
    createdAt: isoOf(r.created_at) || "",
    updatedAt: isoOf(r.updated_at),
  }));
}

/**
 * Who adds notes and sets the outcome: Admins and the Super Admin, and the BDM
 * taking the meeting (or a BDM who scheduled it). A BDE doesn't, by default.
 */
export async function canAddMeetingNotes(user: Pick<CrmUser, "id" | "role">, id: number) {
  if (isAdminLike(user)) return true;
  if (user.role !== "bdm") return false;
  const m = await basics(id);
  return Boolean(m && (m.assigned_bdm_id === user.id || m.created_by === user.id));
}

/**
 * After the meeting: Completed (needs notes, typed or a file) or No Show, or
 * cleared. Completed tells the Admins and the Super Admin. Never throws.
 */
export async function setMeetingOutcome(id: number, outcome: "completed" | "no_show" | null, by: U): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const m = await basics(id);
  if (!m) return { ok: false, error: "This meeting was deleted.", status: 404 };
  if (outcome === "completed") {
    const [n] = await getPool().query("SELECT COUNT(*) AS n FROM crm_meeting_notes WHERE meeting_id = ?", [id]);
    if (!Number((n as { n: number }[])[0]?.n)) return { ok: false, error: "Add the meeting notes (typed or a file) before marking it Completed.", status: 400 };
  }
  await getPool().query("UPDATE crm_meetings SET outcome = ?, outcome_at = IF(? IS NULL, NULL, UTC_TIMESTAMP()), outcome_by = ? WHERE id = ?", [outcome, outcome, outcome ? by.id : null, id]);
  await audit(by, "meeting_outcome", "meeting", id, `Outcome: ${outcome || "cleared"}`);
  if (outcome === "completed") {
    const admins = await adminMembers();
    await addAlerts(
      admins.map((a) => a.id).filter((a) => a !== by.id),
      {
        kind: "meeting_completed",
        title: `Meeting completed: ${m.invitee_name || m.invitee_email || "client"}`,
        sub: `By ${by.name} (${roleName(by.role)}) · notes added`,
        href: meetingHref(id),
      }
    );
  }
  return { ok: true };
}

/** Tells the Admins a BDM/BDE added notes after a meeting (CRM notification only) */
export async function announceNote(meetingId: number, user: U) {
  if (!isSalesRole(user)) return;
  const m = await basics(meetingId);
  if (!m) return;
  const admins = await adminMembers();
  await addAlerts(
    admins.map((a) => a.id),
    {
      kind: "meeting_note",
      title: `${user.name} (${roleName(user.role)}) added meeting notes`,
      sub: `Meeting with ${m.invitee_name || m.invitee_email || "a client"}`,
      href: meetingHref(meetingId),
    }
  );
}

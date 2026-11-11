import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getPool } from "@/lib/db";

/*
 * Calendly → CRM. Meetings booked on the website's Calendly page are read from
 * the Calendly API (and, when a webhook is set up, pushed by Calendly) and kept
 * in crm_meetings: one row per meeting. A reschedule moves the same row to the
 * new time; a cancellation marks it canceled. The CRM never changes anything in
 * Calendly; deleting only hides the row in the CRM.
 *
 * Settings: CALENDLY_TOKEN (a Calendly personal access token) and, for the
 * optional webhook, CALENDLY_WEBHOOK_SIGNING_KEY.
 */

const API = (process.env.CALENDLY_API_BASE || "https://api.calendly.com").replace(/\/$/, "");
const token = () => (process.env.CALENDLY_TOKEN || process.env.CALENDLY_PERSONAL_ACCESS_TOKEN || "").trim();
export const calendlyConfigured = () => Boolean(token());

/* ---------------------------------------------------------------- Calendly shapes */
type CalLocation = { type?: string; location?: string | null; join_url?: string | null; status?: string | null; data?: Record<string, unknown> | null };
export type CalEvent = {
  uri: string;
  name?: string;
  status?: string;
  start_time: string;
  end_time: string;
  location?: CalLocation | null;
  created_at?: string;
  updated_at?: string;
  event_memberships?: { user?: string; user_email?: string; user_name?: string }[];
  event_guests?: { email?: string }[];
};
export type CalInvitee = {
  uri: string;
  name?: string;
  email?: string;
  status?: string;
  timezone?: string | null;
  event?: string;
  created_at?: string;
  updated_at?: string;
  rescheduled?: boolean;
  old_invitee?: string | null;
  new_invitee?: string | null;
  text_reminder_number?: string | null;
  questions_and_answers?: { question?: string; answer?: string; position?: number }[];
  cancellation?: { canceled_by?: string; reason?: string | null; canceler_type?: string; created_at?: string } | null;
  scheduled_event?: CalEvent;
};

async function cal<T>(pathOrUrl: string, signal?: AbortSignal): Promise<T> {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${API}${pathOrUrl}`;
  // only ever send the token to Calendly's API (or the configured base)
  if (!url.startsWith(API)) throw new Error("unexpected Calendly address");
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, cache: "no-store", signal });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Calendly ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/* ---------------------------------------------------------------- time helpers */
/** ISO time → "YYYY-MM-DD HH:MM:SS" in UTC for a DATETIME column */
const sqlTime = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 19).replace("T", " ");
};
/** SELECT expression that reads a UTC DATETIME back as ISO text */
const iso = (col: string) => `IF(${col} IS NULL, NULL, DATE_FORMAT(${col}, '%Y-%m-%dT%H:%i:%sZ'))`;

/* ---------------------------------------------------------------- the row */
type HistoryItem = { kind: "booked" | "rescheduled" | "canceled"; at: string; start?: string; from?: string; to?: string; by?: string; reason?: string };

type MeetingRow = {
  id: number;
  invitee_uri: string;
  status: string;
  start_time: string;
  reschedule_count: number;
  previous_start_time: string | null;
  history: string | null;
};

function locationOf(ev: CalEvent) {
  const l = ev.location || {};
  const type = l.type || null;
  const join = l.join_url || (typeof l.data?.join_url === "string" ? (l.data.join_url as string) : null) || (l.location && /^https?:\/\//i.test(l.location) ? l.location : null);
  const text = l.location && !/^https?:\/\//i.test(l.location) ? l.location : null;
  return { type, join, text };
}

function fieldsOf(inv: CalInvitee, ev: CalEvent) {
  const loc = locationOf(ev);
  const host = ev.event_memberships?.[0];
  const answers = (inv.questions_and_answers || [])
    .filter((q) => q && (q.question || q.answer))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((q) => ({ question: String(q.question || ""), answer: String(q.answer || "") }));
  const guests = (ev.event_guests || []).map((g) => g.email).filter(Boolean);
  return {
    invitee_uri: inv.uri,
    event_uri: ev.uri,
    event_name: String(ev.name || "Meeting").slice(0, 255),
    start_time: sqlTime(ev.start_time),
    end_time: sqlTime(ev.end_time),
    invitee_timezone: inv.timezone || null,
    invitee_name: String(inv.name || "").slice(0, 190),
    invitee_email: String(inv.email || "").slice(0, 190),
    invitee_phone: inv.text_reminder_number || null,
    location_type: loc.type,
    location_text: loc.text ? loc.text.slice(0, 500) : null,
    join_url: loc.join ? loc.join.slice(0, 700) : null,
    answers: answers.length ? JSON.stringify(answers) : null,
    guests: guests.length ? JSON.stringify(guests) : null,
    host_name: host?.user_name || null,
    host_email: host?.user_email || null,
  };
}

const isCanceled = (inv: CalInvitee) => inv.status === "canceled" && !inv.rescheduled;
const cancelFields = (inv: CalInvitee) => ({
  canceled_by: inv.cancellation?.canceled_by ? String(inv.cancellation.canceled_by).slice(0, 190) : null,
  cancel_reason: inv.cancellation?.reason || null,
  canceled_at: sqlTime(inv.cancellation?.created_at || inv.updated_at || new Date().toISOString()),
});

const parseHistory = (h: string | null): HistoryItem[] => {
  try {
    const v = h ? JSON.parse(h) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

async function mapInvitee(invitee: string | null | undefined, meetingId: number, eventUri?: string | null, eventUpdatedAt?: string | null) {
  if (!invitee) return;
  await getPool().query(
    `INSERT INTO crm_meeting_invitees (invitee_uri, meeting_id, event_uri, event_updated_at) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE meeting_id = VALUES(meeting_id),
       event_uri = COALESCE(VALUES(event_uri), event_uri),
       event_updated_at = COALESCE(VALUES(event_updated_at), event_updated_at)`,
    [invitee, meetingId, eventUri || null, eventUpdatedAt || null]
  );
}

async function meetingFor(uri: string | null | undefined): Promise<number | null> {
  if (!uri) return null;
  const [rows] = await getPool().query("SELECT meeting_id FROM crm_meeting_invitees WHERE invitee_uri = ?", [uri]);
  const r = (rows as { meeting_id: number }[])[0];
  return r ? Number(r.meeting_id) : null;
}

async function loadRow(id: number): Promise<MeetingRow | null> {
  const [rows] = await getPool().query(
    `SELECT id, invitee_uri, status, ${iso("start_time")} AS start_time, reschedule_count, ${iso("previous_start_time")} AS previous_start_time, history FROM crm_meetings WHERE id = ?`,
    [id]
  );
  const r = (rows as MeetingRow[])[0];
  return r ? { ...r, reschedule_count: Number(r.reschedule_count) } : null;
}

async function updateRow(id: number, set: Record<string, unknown>) {
  const keys = Object.keys(set);
  if (!keys.length) return;
  await getPool().query(`UPDATE crm_meetings SET ${keys.map((k) => `\`${k}\` = ?`).join(", ")}, synced_at = NOW() WHERE id = ?`, [...keys.map((k) => set[k]), id]);
}

/** The start time of an earlier invitee's meeting (for a reschedule seen before the original) */
async function startOfInvitee(uri: string): Promise<string | null> {
  try {
    const { resource } = await cal<{ resource: CalInvitee }>(uri);
    if (!resource?.event) return null;
    const ev = await cal<{ resource: CalEvent }>(resource.event);
    return ev.resource?.start_time || null;
  } catch {
    return null;
  }
}

/**
 * Brings one Calendly invitee into the CRM: a new booking adds a row, a
 * reschedule moves the existing row to the new time, a cancellation marks the
 * row canceled. Seeing the same thing twice changes nothing.
 */
export async function applyInvitee(inv: CalInvitee, ev: CalEvent) {
  if (!inv?.uri || !ev?.uri || !ev.start_time || !ev.end_time) return;
  const pool = getPool();
  const f = fieldsOf(inv, ev);

  let id = await meetingFor(inv.uri);
  if (!id && inv.old_invitee) id = await meetingFor(inv.old_invitee);

  if (!id) {
    // a meeting not seen before
    const history: HistoryItem[] = [];
    let rescheduleCount = 0;
    let previous: string | null = null;
    if (inv.old_invitee) {
      // a reschedule whose original booking was never read (e.g. older than the sync window)
      rescheduleCount = 1;
      previous = await startOfInvitee(inv.old_invitee);
      history.push({ kind: "rescheduled", at: inv.created_at || new Date().toISOString(), from: previous || undefined, to: ev.start_time });
    } else {
      history.push({ kind: "booked", at: inv.created_at || new Date().toISOString(), start: ev.start_time });
    }
    const canceled = isCanceled(inv);
    if (canceled) {
      const c = inv.cancellation || {};
      history.push({ kind: "canceled", at: c.created_at || inv.updated_at || new Date().toISOString(), by: c.canceled_by || undefined, reason: c.reason || undefined });
    }
    const row = {
      ...f,
      status: canceled ? "canceled" : rescheduleCount ? "rescheduled" : "scheduled",
      reschedule_count: rescheduleCount,
      previous_start_time: sqlTime(previous),
      ...(canceled ? cancelFields(inv) : {}),
      history: JSON.stringify(history),
      booked_at: sqlTime(inv.created_at),
    };
    const keys = Object.keys(row);
    try {
      const [res] = await pool.query(
        `INSERT INTO crm_meetings (${keys.map((k) => `\`${k}\``).join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`,
        keys.map((k) => (row as Record<string, unknown>)[k])
      );
      id = Number((res as { insertId: number }).insertId);
    } catch (err) {
      // two syncs at once: the other one added it first
      if ((err as { code?: string }).code !== "ER_DUP_ENTRY") throw err;
      const [rows] = await pool.query("SELECT id FROM crm_meetings WHERE invitee_uri = ?", [inv.uri]);
      id = Number((rows as { id: number }[])[0]?.id);
      if (!id) return;
    }
    await mapInvitee(inv.uri, id, ev.uri, ev.updated_at);
    await mapInvitee(inv.old_invitee, id);
    await mapInvitee(inv.new_invitee, id);
    return;
  }

  const row = await loadRow(id);
  if (!row) return;
  const history = parseHistory(row.history);

  if (row.invitee_uri === inv.uri) {
    // the meeting's current booking: keep its details in step; mark a cancellation
    const set: Record<string, unknown> = { ...f };
    if (isCanceled(inv)) {
      if (row.status !== "canceled") {
        const c = inv.cancellation || {};
        history.push({ kind: "canceled", at: c.created_at || inv.updated_at || new Date().toISOString(), by: c.canceled_by || undefined, reason: c.reason || undefined });
        Object.assign(set, { status: "canceled", ...cancelFields(inv), history: JSON.stringify(history) });
      }
    } else if (inv.status !== "canceled") {
      // (a booking canceled because it was rescheduled waits for its new booking)
      set.status = row.reschedule_count > 0 ? "rescheduled" : "scheduled";
    } else {
      // canceled by a reschedule: the time shown stays until the new booking is read
      delete set.start_time;
      delete set.end_time;
      delete set.event_uri;
      delete set.join_url;
      delete set.location_text;
      delete set.location_type;
    }
    await updateRow(id, set);
  } else if (inv.old_invitee && row.invitee_uri === inv.old_invitee) {
    // rescheduled: the same row moves to the new booking
    history.push({ kind: "rescheduled", at: inv.created_at || new Date().toISOString(), from: row.start_time, to: ev.start_time });
    const canceled = isCanceled(inv);
    if (canceled) {
      const c = inv.cancellation || {};
      history.push({ kind: "canceled", at: c.created_at || inv.updated_at || new Date().toISOString(), by: c.canceled_by || undefined, reason: c.reason || undefined });
    }
    await updateRow(id, {
      ...f,
      status: canceled ? "canceled" : "rescheduled",
      reschedule_count: row.reschedule_count + 1,
      previous_start_time: sqlTime(row.start_time),
      ...(canceled ? cancelFields(inv) : { canceled_by: null, cancel_reason: null, canceled_at: null }),
      history: JSON.stringify(history),
    });
  } else if (inv.new_invitee && row.invitee_uri === inv.new_invitee && !row.previous_start_time) {
    // the original booking, read after its reschedule: fill in the earlier time
    const fixed = history.map((h) => (h.kind === "rescheduled" && !h.from ? { ...h, from: ev.start_time } : h));
    if (!fixed.some((h) => h.kind === "booked")) fixed.unshift({ kind: "booked", at: inv.created_at || ev.start_time, start: ev.start_time });
    await updateRow(id, { previous_start_time: sqlTime(ev.start_time), history: JSON.stringify(fixed), booked_at: sqlTime(inv.created_at) });
  }
  // (anything else is an older booking of a meeting that has since moved on)

  await mapInvitee(inv.uri, id, ev.uri, ev.updated_at);
  await mapInvitee(inv.old_invitee, id);
  await mapInvitee(inv.new_invitee, id);
}

/* ---------------------------------------------------------------- sync from the API */
let lastSync = 0;
let running: Promise<SyncResult> | null = null;
let meUri: string | null = null;
export type SyncResult = { ok: boolean; configured: boolean; changed?: number; error?: string; at?: string };

async function runSync(): Promise<SyncResult> {
  const signal = AbortSignal.timeout(25_000);
  if (!meUri) {
    const me = await cal<{ resource: { uri: string } }>("/users/me", signal);
    meUri = me.resource.uri;
  }
  // meetings from the last 60 days onwards (both active and canceled)
  const since = new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString();
  const events: CalEvent[] = [];
  let next: string | null = `/scheduled_events?user=${encodeURIComponent(meUri)}&min_start_time=${encodeURIComponent(since)}&count=100&sort=start_time:asc`;
  for (let page = 0; next && page < 20; page++) {
    const res: { collection: CalEvent[]; pagination?: { next_page?: string | null } } = await cal(next, signal);
    events.push(...(res.collection || []));
    next = res.pagination?.next_page || null;
  }

  // only events that are new or changed since they were last read
  const [seenRows] = events.length
    ? await getPool().query("SELECT event_uri, event_updated_at FROM crm_meeting_invitees WHERE event_uri IN (?)", [events.map((e) => e.uri)])
    : [[]];
  const seen = new Map<string, string | null>();
  for (const r of seenRows as { event_uri: string; event_updated_at: string | null }[]) seen.set(r.event_uri, r.event_updated_at);
  const changed = events
    .filter((e) => !seen.has(e.uri) || seen.get(e.uri) !== (e.updated_at || null))
    .sort((a, b) => String(a.created_at || "").localeCompare(String(b.created_at || "")));

  for (const ev of changed) {
    let nextInv: string | null = `${ev.uri}/invitees?count=100`;
    const invitees: CalInvitee[] = [];
    for (let page = 0; nextInv && page < 5; page++) {
      const res: { collection: CalInvitee[]; pagination?: { next_page?: string | null } } = await cal(nextInv, signal);
      invitees.push(...(res.collection || []));
      nextInv = res.pagination?.next_page || null;
    }
    for (const inv of invitees.sort((a, b) => String(a.created_at || "").localeCompare(String(b.created_at || "")))) {
      await applyInvitee(inv, ev);
    }
  }
  return { ok: true, configured: true, changed: changed.length, at: new Date().toISOString() };
}

/**
 * Reads new and changed meetings from Calendly. At most once every
 * `maxAgeMs`; calls made while one is running share it.
 */
export async function syncMeetings({ maxAgeMs = 30_000 }: { maxAgeMs?: number } = {}): Promise<SyncResult> {
  if (!calendlyConfigured()) return { ok: false, configured: false };
  if (running) return running;
  if (Date.now() - lastSync < maxAgeMs) return { ok: true, configured: true, changed: 0 };
  running = runSync()
    .catch((err: unknown) => {
      console.error("[calendly] sync failed:", err);
      meUri = null;
      return { ok: false, configured: true, error: err instanceof Error ? err.message : String(err) } as SyncResult;
    })
    .finally(() => {
      lastSync = Date.now();
      running = null;
    });
  return running;
}

/* ---------------------------------------------------------------- webhook */
/** Checks the Calendly-Webhook-Signature header ("t=...,v1=...") */
export function verifyWebhook(raw: string, header: string | null): boolean {
  const key = (process.env.CALENDLY_WEBHOOK_SIGNING_KEY || "").trim();
  if (!key || !header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.trim().split("=", 2) as [string, string]));
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  // reject old deliveries (replays)
  if (Math.abs(Date.now() / 1000 - Number(t)) > 3 * 60) return false;
  const expected = createHmac("sha256", key).update(`${t}.${raw}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  return a.length === b.length && timingSafeEqual(a, b);
}

/* ---------------------------------------------------------------- reading for the CRM */
export const MEETING_STATUSES = ["upcoming", "rescheduled", "completed", "canceled"] as const;
/** How many meetings each status filter holds (for the chips above the list) */
export async function meetingCounts(): Promise<Record<string, number>> {
  try {
    const [rows] = await getPool().query(
      `SELECT COUNT(*) AS total,
              SUM(status = 'scheduled' AND (reschedule_count IS NULL OR reschedule_count = 0) AND end_time >= UTC_TIMESTAMP()) AS upcoming,
              SUM(status <> 'canceled' AND reschedule_count > 0 AND end_time >= UTC_TIMESTAMP()) AS rescheduled,
              SUM(status <> 'canceled' AND end_time < UTC_TIMESTAMP()) AS completed,
              SUM(status = 'canceled') AS canceled
         FROM crm_meetings WHERE deleted_at IS NULL`
    );
    const r = (rows as Record<string, unknown>[])[0] || {};
    return Object.fromEntries(["total", "upcoming", "rescheduled", "completed", "canceled"].map((k) => [k, Number(r[k] || 0)]));
  } catch {
    return { total: 0, upcoming: 0, rescheduled: 0, completed: 0, canceled: 0 };
  }
}

export const MEETING_STATUS_LABEL: Record<string, string> = {
  upcoming: "Scheduled",
  rescheduled: "Rescheduled",
  completed: "Completed",
  canceled: "Canceled",
};

export type MeetingItem = {
  id: number;
  eventName: string;
  status: "scheduled" | "rescheduled" | "canceled";
  view: "upcoming" | "rescheduled" | "completed" | "canceled";
  startTime: string;
  endTime: string;
  inviteeTimezone: string | null;
  name: string;
  email: string;
  phone: string | null;
  locationType: string | null;
  locationText: string | null;
  joinUrl: string | null;
  answers: { question: string; answer: string }[];
  guests: string[];
  hostName: string | null;
  hostEmail: string | null;
  rescheduleCount: number;
  previousStartTime: string | null;
  canceledBy: string | null;
  cancelReason: string | null;
  canceledAt: string | null;
  history: HistoryItem[];
  bookedAt: string | null;
};

const PAGE_SIZE = 25;
const json = <T,>(v: unknown, fallback: T): T => {
  try {
    return v ? (JSON.parse(String(v)) as T) : fallback;
  } catch {
    return fallback;
  }
};

export async function listMeetings(opts: { q?: string; status?: string; when?: string; page?: number }) {
  const where = ["deleted_at IS NULL"];
  const args: (string | number)[] = [];
  const q = (opts.q || "").trim().slice(0, 100);
  if (q) {
    const like = `%${q}%`;
    where.push("(invitee_name LIKE ? OR invitee_email LIKE ? OR event_name LIKE ? OR answers LIKE ?)");
    args.push(like, like, like, like);
  }
  if (opts.status === "canceled") where.push("status = 'canceled'");
  else if (opts.status === "completed") where.push("status <> 'canceled' AND end_time < UTC_TIMESTAMP()");
  else if (opts.status === "rescheduled") where.push("status <> 'canceled' AND reschedule_count > 0 AND end_time >= UTC_TIMESTAMP()");
  else if (opts.status === "upcoming") where.push("status = 'scheduled' AND (reschedule_count IS NULL OR reschedule_count = 0) AND end_time >= UTC_TIMESTAMP()");
  if (opts.when === "upcoming") where.push("end_time >= UTC_TIMESTAMP()");
  else if (opts.when === "past") where.push("end_time < UTC_TIMESTAMP()");
  const whereSql = `WHERE ${where.join(" AND ")}`;
  const page = Math.max(1, Math.floor(opts.page || 1));

  const pool = getPool();
  const [countRows] = await pool.query(`SELECT COUNT(*) AS n FROM crm_meetings ${whereSql}`, args);
  const total = Number((countRows as { n: number }[])[0]?.n || 0);
  // coming meetings first (soonest on top), then the rest (latest on top)
  const [rows] = await pool.query(
    `SELECT id, event_name, status, ${iso("start_time")} AS start_time, ${iso("end_time")} AS end_time, invitee_timezone, invitee_name, invitee_email, invitee_phone,
            location_type, location_text, join_url, answers, guests, host_name, host_email, reschedule_count, ${iso("previous_start_time")} AS previous_start_time,
            canceled_by, cancel_reason, ${iso("canceled_at")} AS canceled_at, history, ${iso("booked_at")} AS booked_at,
            (status <> 'canceled' AND end_time >= UTC_TIMESTAMP()) AS ahead
       FROM crm_meetings ${whereSql}
      ORDER BY ahead DESC, IF(ahead = 1, start_time, NULL) ASC, start_time DESC, id DESC
      LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
    args
  );
  const now = Date.now();
  const items: MeetingItem[] = (rows as Record<string, unknown>[]).map((r) => {
    const status = String(r.status) as MeetingItem["status"];
    const ended = new Date(String(r.end_time)).getTime() < now;
    return {
      id: Number(r.id),
      eventName: String(r.event_name || ""),
      status,
      view: status === "canceled" ? "canceled" : ended ? "completed" : status === "rescheduled" || Number(r.reschedule_count || 0) > 0 ? "rescheduled" : "upcoming",
      startTime: String(r.start_time),
      endTime: String(r.end_time),
      inviteeTimezone: r.invitee_timezone ? String(r.invitee_timezone) : null,
      name: String(r.invitee_name || ""),
      email: String(r.invitee_email || ""),
      phone: r.invitee_phone ? String(r.invitee_phone) : null,
      locationType: r.location_type ? String(r.location_type) : null,
      locationText: r.location_text ? String(r.location_text) : null,
      joinUrl: r.join_url ? String(r.join_url) : null,
      answers: json(r.answers, []),
      guests: json(r.guests, []),
      hostName: r.host_name ? String(r.host_name) : null,
      hostEmail: r.host_email ? String(r.host_email) : null,
      rescheduleCount: Number(r.reschedule_count || 0),
      previousStartTime: r.previous_start_time ? String(r.previous_start_time) : null,
      canceledBy: r.canceled_by ? String(r.canceled_by) : null,
      cancelReason: r.cancel_reason ? String(r.cancel_reason) : null,
      canceledAt: r.canceled_at ? String(r.canceled_at) : null,
      history: json(r.history, []),
      bookedAt: r.booked_at ? String(r.booked_at) : null,
    };
  });
  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), pageSize: PAGE_SIZE };
}

/** A fingerprint of the list, so an open page can tell when something changed */
export async function meetingsVersion(): Promise<string> {
  const [rows] = await getPool().query("SELECT COUNT(*) AS n, COALESCE(MAX(updated_at), '') AS u FROM crm_meetings WHERE deleted_at IS NULL");
  const r = (rows as { n: number; u: unknown }[])[0];
  return `${r?.n || 0}:${r?.u instanceof Date ? r.u.toISOString() : String(r?.u || "")}`;
}

/** Hides meetings from the CRM (nothing is changed in Calendly) */
export async function deleteMeetings(ids: number[]) {
  const [res] = await getPool().query("UPDATE crm_meetings SET deleted_at = UTC_TIMESTAMP() WHERE id IN (?) AND deleted_at IS NULL", [ids]);
  return (res as { affectedRows: number }).affectedRows;
}

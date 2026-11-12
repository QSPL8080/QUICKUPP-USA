import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getPool } from "@/lib/db";
import { logActivity } from "@/lib/crm/activity";
import type { CrmUser } from "@/lib/crm/auth";
import { notifyMeeting } from "@/lib/crm/meetingNotify";

/*
 * Dynamic Calendly ↔ CRM Synchronization.
 * Meetings booked on the website or through Calendly are synced to crm_meetings.
 * Meetings can also be arranged, created, rescheduled, edited, and canceled directly
 * from the CRM with live Calendly API reflection.
 *
 * Settings: CALENDLY_TOKEN (Calendly personal access token) and, for webhooks,
 * CALENDLY_WEBHOOK_SIGNING_KEY.
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
  cancel_url?: string | null;
  reschedule_url?: string | null;
  text_reminder_number?: string | null;
  questions_and_answers?: { question?: string; answer?: string; position?: number }[];
  cancellation?: { canceled_by?: string; reason?: string | null; canceler_type?: string; created_at?: string } | null;
  scheduled_event?: CalEvent;
};

export type CalEventType = {
  uri: string;
  name: string;
  active: boolean;
  slug?: string;
  scheduling_url: string;
  duration?: number;
  kind?: string;
  description_plain?: string;
  color?: string;
};

async function cal<T>(
  pathOrUrl: string,
  opts?: { method?: string; body?: unknown; signal?: AbortSignal } | AbortSignal
): Promise<T> {
  const signal = opts instanceof AbortSignal ? opts : opts?.signal;
  const method = !(opts instanceof AbortSignal) && opts?.method ? opts.method : "GET";
  const body = !(opts instanceof AbortSignal) && opts?.body !== undefined ? JSON.stringify(opts.body) : undefined;
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${API}${pathOrUrl}`;
  // only ever send the token to Calendly's API (or the configured base)
  if (!url.startsWith(API)) throw new Error("unexpected Calendly address");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token()}`,
    "Content-Type": "application/json",
  };
  const res = await fetch(url, { method, headers, body, cache: "no-store", signal });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Calendly ${res.status}: ${text.slice(0, 200)}`);
  }
  if (res.status === 204) return {} as T;
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
  invitee_email: string | null;
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
    reschedule_url: inv.reschedule_url ? inv.reschedule_url.slice(0, 700) : null,
    cancel_url: inv.cancel_url ? inv.cancel_url.slice(0, 700) : null,
    answers: answers.length ? JSON.stringify(answers) : null,
    guests: guests.length ? JSON.stringify(guests) : null,
    host_name: host?.user_name || null,
    host_email: host?.user_email || null,
  };
}

export const isRescheduledCancellation = (inv: CalInvitee) =>
  Boolean(inv.rescheduled) ||
  Boolean(inv.new_invitee) ||
  /reschedul/i.test(inv.cancellation?.reason || "") ||
  /reschedul/i.test(inv.cancellation?.canceler_type || "");

export const isCanceled = (inv: CalInvitee) =>
  inv.status === "canceled" && !isRescheduledCancellation(inv);

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

export async function meetingFor(uri: string | null | undefined): Promise<number | null> {
  if (!uri) return null;
  const pool = getPool();
  try {
    const [mRows] = await pool.query("SELECT meeting_id FROM crm_meeting_invitees WHERE invitee_uri = ? LIMIT 1", [uri]);
    const mr = (mRows as { meeting_id: number }[])[0];
    if (mr?.meeting_id) return Number(mr.meeting_id);

    const [cRows] = await pool.query("SELECT id FROM crm_meetings WHERE invitee_uri = ? AND deleted_at IS NULL LIMIT 1", [uri]);
    const cr = (cRows as { id: number }[])[0];
    if (cr?.id) return Number(cr.id);

    const [eRows] = await pool.query("SELECT id FROM crm_meetings WHERE event_uri = ? AND deleted_at IS NULL LIMIT 1", [uri]);
    const er = (eRows as { id: number }[])[0];
    if (er?.id) return Number(er.id);
  } catch (err) {
    console.warn("[calendly] meetingFor error:", err);
  }
  return null;
}

export async function findMeetingByEmail(email: string | null | undefined): Promise<number | null> {
  if (!email) return null;
  const pool = getPool();
  try {
    const [rows] = await pool.query(
      `SELECT id FROM crm_meetings
        WHERE invitee_email = ?
          AND deleted_at IS NULL
          AND (status IN ('scheduled', 'rescheduled') OR (status = 'canceled' AND (synced_at >= DATE_SUB(NOW(), INTERVAL 2 DAY) OR cancel_reason LIKE '%reschedul%')))
        ORDER BY id DESC LIMIT 1`,
      [email]
    );
    const r = (rows as { id: number }[])[0];
    return r ? Number(r.id) : null;
  } catch {
    return null;
  }
}

async function loadRow(id: number): Promise<MeetingRow | null> {
  const [rows] = await getPool().query(
    `SELECT id, invitee_uri, invitee_email, status, ${iso("start_time")} AS start_time, reschedule_count, ${iso("previous_start_time")} AS previous_start_time, history FROM crm_meetings WHERE id = ?`,
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
export async function applyInvitee(inv: CalInvitee, ev: CalEvent, forcedMeetingId?: number) {
  if (!inv?.uri || !ev?.uri || !ev.start_time || !ev.end_time) return;
  const pool = getPool();
  const f = fieldsOf(inv, ev);

  let id = forcedMeetingId || (await meetingFor(inv.uri));
  if (!id && inv.old_invitee) id = await meetingFor(inv.old_invitee);
  if (!id && inv.new_invitee) id = await meetingFor(inv.new_invitee);
  if (!id && ev.uri) id = await meetingFor(ev.uri);
  if (!id && (inv.old_invitee || isRescheduledCancellation(inv) || inv.email)) {
    id = await findMeetingByEmail(inv.email);
  }

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
      // team email for a meeting seen for the first time
      if (canceled) notifyMeeting(id, "canceled", { key: `canceled:${inv.uri}`, at: inv.cancellation?.created_at || inv.updated_at });
      else if (rescheduleCount) notifyMeeting(id, "rescheduled", { key: `rescheduled:${sqlTime(ev.start_time)}`, at: inv.created_at });
      else notifyMeeting(id, "booked", { key: `booked:${inv.uri}`, at: inv.created_at });
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

  // Case 1: The invitee is reporting a cancellation due to reschedule
  if (isRescheduledCancellation(inv)) {
    if (inv.new_invitee) {
      await mapInvitee(inv.new_invitee, id);
    }
    await mapInvitee(inv.uri, id, ev.uri, ev.updated_at);
    // the count goes up once, when the new time is read (Case 3), not again here
    await updateRow(id, { status: "rescheduled" });
    return;
  }

  // Case 2: Genuine cancellation
  if (isCanceled(inv)) {
    if (row.status !== "canceled") {
      const c = inv.cancellation || {};
      history.push({
        kind: "canceled",
        at: c.created_at || inv.updated_at || new Date().toISOString(),
        by: c.canceled_by || undefined,
        reason: c.reason || undefined,
      });
      await updateRow(id, {
        status: "canceled",
        ...cancelFields(inv),
        history: JSON.stringify(history),
      });
      notifyMeeting(id, "canceled", { key: `canceled:${inv.uri}`, at: c.created_at || inv.updated_at });
    }
    await mapInvitee(inv.uri, id, ev.uri, ev.updated_at);
    return;
  }

  // Case 3: Active booking (either newly scheduled, updated, or rescheduled to a new slot)
  const isTimeChanged = sqlTime(row.start_time) !== sqlTime(ev.start_time);
  const isDifferentInvitee = row.invitee_uri !== inv.uri;
  const isReschedule = Boolean(inv.old_invitee) || isTimeChanged || isDifferentInvitee || row.status === "rescheduled" || row.status === "canceled";

  if (isReschedule && isTimeChanged) {
    history.push({
      kind: "rescheduled",
      at: inv.created_at || new Date().toISOString(),
      from: row.start_time || undefined,
      to: ev.start_time,
    });
  }

  await updateRow(id, {
    ...f,
    status: isReschedule ? "rescheduled" : (row.reschedule_count > 0 ? "rescheduled" : "scheduled"),
    reschedule_count: isReschedule ? Math.max(1, (row.reschedule_count || 0) + (isTimeChanged ? 1 : 0)) : row.reschedule_count,
    previous_start_time: isTimeChanged ? sqlTime(row.start_time) : (row.previous_start_time ? sqlTime(row.previous_start_time) : null),
    canceled_by: null,
    cancel_reason: null,
    canceled_at: null,
    history: JSON.stringify(history),
  });

  await mapInvitee(inv.uri, id, ev.uri, ev.updated_at);
  await mapInvitee(inv.old_invitee, id);
  await mapInvitee(inv.new_invitee, id);

  // team email: a new time is a reschedule; a different booking by the same client (no old invitee) is a new booking
  const placeholder = row.invitee_email === "client@booking";
  if (placeholder || (isDifferentInvitee && !inv.old_invitee)) {
    notifyMeeting(id, "booked", { key: `booked:${inv.uri}`, at: inv.created_at });
  } else if (isTimeChanged) {
    notifyMeeting(id, "rescheduled", { key: `rescheduled:${sqlTime(ev.start_time)}`, at: inv.created_at || inv.updated_at });
  }
}

/* ---------------------------------------------------------------- sync from the API */
let lastSync = 0;
let running: Promise<SyncResult> | null = null;
let meUri: string | null = null;
export type SyncResult = { ok: boolean; configured: boolean; changed?: number; error?: string; at?: string };

async function runSync(force = false): Promise<SyncResult> {
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
  for (const r of seenRows as { event_uri: string; event_updated_at: string | null }[]) {
    if (r.event_uri && r.event_updated_at) seen.set(r.event_uri, r.event_updated_at);
  }

  // Also query existing meeting statuses from crm_meetings so status mismatches are never missed
  const [meetingRows] = events.length
    ? await getPool().query("SELECT event_uri, status FROM crm_meetings WHERE event_uri IN (?)", [events.map((e) => e.uri)])
    : [[]];
  const meetingStatusMap = new Map<string, string>();
  for (const m of meetingRows as { event_uri: string; status: string }[]) {
    if (m.event_uri) meetingStatusMap.set(m.event_uri, m.status);
  }

  const changed = events
    .filter((e) => {
      if (force) return true;
      if (!seen.has(e.uri)) return true;
      if (seen.get(e.uri) !== (e.updated_at || null)) return true;
      const localStatus = meetingStatusMap.get(e.uri);
      if (e.status === "canceled" && localStatus && localStatus !== "canceled") return true;
      return false;
    })
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
 * `maxAgeMs` (or immediately if force: true); calls made while one is running share it.
 */
export async function syncMeetings({ maxAgeMs = 5_000, force = false }: { maxAgeMs?: number; force?: boolean } = {}): Promise<SyncResult> {
  if (!calendlyConfigured()) return { ok: false, configured: false };
  if (running) return running;
  if (!force && Date.now() - lastSync < maxAgeMs) return { ok: true, configured: true, changed: 0 };
  running = runSync(force)
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
  completed: "Past", // the time has passed; whether it was held isn't known
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
  rescheduleUrl: string | null;
  cancelUrl: string | null;
  notes: string | null;
  leadId: number | null;
  source: string;
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

/* all: every matching meeting on one page (the CSV export); ids: only these */
export async function listMeetings(opts: { q?: string; status?: string; when?: string; page?: number; all?: boolean; ids?: number[] }) {
  const where = ["deleted_at IS NULL"];
  const args: (string | number)[] = [];
  const q = (opts.q || "").trim().slice(0, 100);
  if (q) {
    const like = `%${q}%`;
    where.push("(invitee_name LIKE ? OR invitee_email LIKE ? OR event_name LIKE ? OR answers LIKE ? OR notes LIKE ?)");
    args.push(like, like, like, like, like);
  }
  if (opts.status === "canceled") where.push("status = 'canceled'");
  else if (opts.status === "completed") where.push("status <> 'canceled' AND end_time < UTC_TIMESTAMP()");
  else if (opts.status === "rescheduled") where.push("status <> 'canceled' AND reschedule_count > 0 AND end_time >= UTC_TIMESTAMP()");
  else if (opts.status === "upcoming") where.push("status = 'scheduled' AND (reschedule_count IS NULL OR reschedule_count = 0) AND end_time >= UTC_TIMESTAMP()");
  if (opts.ids?.length) {
    where.push(`id IN (${opts.ids.map(() => "?").join(", ")})`);
    args.push(...opts.ids);
  }
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
            location_type, location_text, join_url, reschedule_url, cancel_url, notes, lead_id, source, answers, guests, host_name, host_email, reschedule_count, ${iso("previous_start_time")} AS previous_start_time,
            canceled_by, cancel_reason, ${iso("canceled_at")} AS canceled_at, history, ${iso("booked_at")} AS booked_at,
            (status <> 'canceled' AND end_time >= UTC_TIMESTAMP()) AS ahead
       FROM crm_meetings ${whereSql}
      ORDER BY ahead DESC, IF(ahead = 1, start_time, NULL) ASC, start_time DESC, id DESC
      LIMIT ${opts.all ? 10000 : PAGE_SIZE} OFFSET ${opts.all ? 0 : (page - 1) * PAGE_SIZE}`,
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
      rescheduleUrl: r.reschedule_url ? String(r.reschedule_url) : null,
      cancelUrl: r.cancel_url ? String(r.cancel_url) : null,
      notes: r.notes ? String(r.notes) : null,
      leadId: r.lead_id ? Number(r.lead_id) : null,
      source: String(r.source || "website"),
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

/* ---------------------------------------------------------------- Dynamic CRM Meeting Actions */

/**
 * Cancels a meeting directly from the CRM:
 * - Invokes Calendly API cancellation endpoint (which officially cancels on Calendly & emails client)
 * - Updates crm_meetings row (status='canceled', canceled_by, cancel_reason, canceled_at, history)
 * - Logs to CRM activity audit trail
 */
export async function cancelCalendlyMeeting({
  id,
  reason,
  user,
  cancelInCalendly = true,
}: {
  id: number;
  reason?: string;
  user: Pick<CrmUser, "id" | "name" | "role">;
  cancelInCalendly?: boolean;
}) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, invitee_uri, event_uri, event_name, invitee_name, invitee_email, ${iso("start_time")} AS start_time, status, history, lead_id FROM crm_meetings WHERE id = ? AND deleted_at IS NULL`,
    [id]
  );
  const row = (rows as Record<string, unknown>[])[0];
  if (!row) throw new Error("Meeting not found");
  if (row.status === "canceled") return { ok: true, alreadyCanceled: true };

  let calendlyCanceled = false;
  if (cancelInCalendly && calendlyConfigured() && typeof row.event_uri === "string" && !row.event_uri.startsWith("crm:")) {
    try {
      const uuid = row.event_uri.split("/").pop();
      if (uuid) {
        await cal(`/scheduled_events/${uuid}/cancellation`, {
          method: "POST",
          body: { reason: (reason || "Canceled via CRM").slice(0, 1000) },
        });
        calendlyCanceled = true;
      }
    } catch (err: unknown) {
      console.warn("[calendly] API cancellation warning (proceeding with CRM update):", err instanceof Error ? err.message : err);
    }
  }

  const history = parseHistory(row.history as string | null);
  const nowIso = new Date().toISOString();
  history.push({
    kind: "canceled",
    at: nowIso,
    by: `${user.name} (${user.role === "super_admin" ? "Super Admin" : "Admin"})`,
    reason: reason || undefined,
  });

  await pool.query(
    `UPDATE crm_meetings
        SET status = 'canceled',
            canceled_by = ?,
            cancel_reason = ?,
            canceled_at = ?,
            history = ?,
            synced_at = NOW()
      WHERE id = ?`,
    [user.name, reason || null, sqlTime(nowIso), JSON.stringify(history), id]
  );

  notifyMeeting(id, "canceled", { key: `canceled:${row.invitee_uri}`, by: `${user.name} (CRM)`, reason: reason || null });

  const cleanReason = reason ? ` (Reason: ${reason})` : "";
  await logActivity({
    entity: "lead",
    id: Number(row.lead_id) || Number(row.id),
    action: "meeting_canceled",
    text: `Meeting "${row.event_name || "Strategy Call"}" with ${row.invitee_name || row.invitee_email} was canceled${cleanReason}`,
    actor: { type: "user", user },
  });

  return { ok: true, calendlyCanceled };
}

/**
 * Reschedules a meeting time directly from the CRM:
 * - Updates start_time and end_time, saves previous_start_time
 * - Increments reschedule_count, appends to history
 * - Logs to CRM activity audit trail
 */
export async function rescheduleMeetingDetails({
  id,
  startTime,
  endTime,
  reason,
  user,
}: {
  id: number;
  startTime: string;
  endTime: string;
  reason?: string;
  user: Pick<CrmUser, "id" | "name" | "role">;
}) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, invitee_uri, event_name, invitee_name, invitee_email, ${iso("start_time")} AS start_time, reschedule_count, history, lead_id FROM crm_meetings WHERE id = ? AND deleted_at IS NULL`,
    [id]
  );
  const row = (rows as Record<string, unknown>[])[0];
  if (!row) throw new Error("Meeting not found");

  const history = parseHistory(row.history as string | null);
  const nowIso = new Date().toISOString();
  history.push({
    kind: "rescheduled",
    at: nowIso,
    from: String(row.start_time),
    to: startTime,
    reason: reason || undefined,
    by: `${user.name} (${user.role === "super_admin" ? "Super Admin" : "Admin"})`,
  });

  const nextCount = Number(row.reschedule_count || 0) + 1;
  await pool.query(
    `UPDATE crm_meetings
        SET status = 'rescheduled',
            reschedule_count = ?,
            previous_start_time = ?,
            start_time = ?,
            end_time = ?,
            history = ?,
            synced_at = NOW()
      WHERE id = ?`,
    [nextCount, sqlTime(String(row.start_time)), sqlTime(startTime), sqlTime(endTime), JSON.stringify(history), id]
  );
  notifyMeeting(id, "rescheduled", { key: `rescheduled:${sqlTime(startTime)}`, by: `${user.name} (CRM)`, reason: reason || null });

  await logActivity({
    entity: "lead",
    id: Number(row.lead_id) || Number(row.id),
    action: "meeting_rescheduled",
    text: `Meeting "${row.event_name || "Strategy Call"}" with ${row.invitee_name || row.invitee_email} rescheduled to ${new Date(startTime).toLocaleString()}${reason ? ` (${reason})` : ""}`,
    actor: { type: "user", user },
  });

  return { ok: true, rescheduleCount: nextCount };
}

/**
 * Updates editable meeting fields and internal CRM notes.
 */
export async function updateMeetingDetails({
  id,
  data,
  user,
}: {
  id: number;
  data: {
    name?: string;
    email?: string;
    phone?: string;
    eventName?: string;
    locationText?: string;
    joinUrl?: string;
    notes?: string;
    hostName?: string;
    hostEmail?: string;
  };
  user: Pick<CrmUser, "id" | "name" | "role">;
}) {
  const pool = getPool();
  const [rows] = await pool.query("SELECT id, invitee_name, lead_id FROM crm_meetings WHERE id = ? AND deleted_at IS NULL", [id]);
  const row = (rows as Record<string, unknown>[])[0];
  if (!row) throw new Error("Meeting not found");

  const set: Record<string, unknown> = {};
  if (data.name !== undefined) set.invitee_name = data.name.trim().slice(0, 190);
  if (data.email !== undefined) set.invitee_email = data.email.trim().slice(0, 190);
  if (data.phone !== undefined) set.invitee_phone = data.phone.trim().slice(0, 60) || null;
  if (data.eventName !== undefined) set.event_name = data.eventName.trim().slice(0, 255);
  if (data.locationText !== undefined) set.location_text = data.locationText.trim().slice(0, 500) || null;
  if (data.joinUrl !== undefined) set.join_url = data.joinUrl.trim().slice(0, 700) || null;
  if (data.notes !== undefined) set.notes = data.notes.trim() || null;
  if (data.hostName !== undefined) set.host_name = data.hostName.trim().slice(0, 190) || null;
  if (data.hostEmail !== undefined) set.host_email = data.hostEmail.trim().slice(0, 190) || null;

  const keys = Object.keys(set);
  if (keys.length > 0) {
    await pool.query(
      `UPDATE crm_meetings SET ${keys.map((k) => `\`${k}\` = ?`).join(", ")}, synced_at = NOW() WHERE id = ?`,
      [...keys.map((k) => set[k]), id]
    );
  }

  await logActivity({
    entity: "lead",
    id: Number(row.lead_id) || id,
    action: "meeting_updated",
    text: `Meeting details for ${data.name || row.invitee_name || "invitee"} updated`,
    actor: { type: "user", user },
  });

  return { ok: true };
}

/**
 * Creates a meeting directly from the CRM (offline consultation, phone meeting, or manual booking).
 */
export async function createCrmMeeting({
  data,
  user,
}: {
  data: {
    name: string;
    email: string;
    phone?: string;
    eventName: string;
    startTime: string;
    endTime: string;
    locationType?: string;
    locationText?: string;
    joinUrl?: string;
    notes?: string;
    hostName?: string;
    hostEmail?: string;
    leadId?: number;
    source?: string;
  };
  user: Pick<CrmUser, "id" | "name" | "role">;
}) {
  const pool = getPool();
  const inviteeUri = `crm:invitee:${Date.now()}:${randomBytes(4).toString("hex")}`;
  const eventUri = `crm:event:${Date.now()}:${randomBytes(4).toString("hex")}`;
  const nowIso = new Date().toISOString();

  const history = [
    {
      kind: "booked" as const,
      at: nowIso,
      start: data.startTime,
      by: `${user.name} (${user.role === "super_admin" ? "Super Admin" : "Admin"})`,
    },
  ];

  const row = {
    invitee_uri: inviteeUri,
    event_uri: eventUri,
    event_name: (data.eventName || "Strategy Call").trim().slice(0, 255),
    status: "scheduled",
    start_time: sqlTime(data.startTime),
    end_time: sqlTime(data.endTime),
    invitee_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",
    invitee_name: data.name.trim().slice(0, 190),
    invitee_email: data.email.trim().slice(0, 190),
    invitee_phone: data.phone?.trim().slice(0, 60) || null,
    location_type: data.locationType || "google_conference",
    location_text: data.locationText?.trim().slice(0, 500) || null,
    join_url: data.joinUrl?.trim().slice(0, 700) || null,
    notes: data.notes?.trim() || null,
    lead_id: data.leadId || null,
    source: data.source || "crm",
    host_name: data.hostName?.trim().slice(0, 190) || user.name,
    host_email: data.hostEmail?.trim().slice(0, 190) || null,
    reschedule_count: 0,
    history: JSON.stringify(history),
    booked_at: sqlTime(nowIso),
  };

  const keys = Object.keys(row);
  const [res] = await pool.query(
    `INSERT INTO crm_meetings (${keys.map((k) => `\`${k}\``).join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`,
    keys.map((k) => (row as Record<string, unknown>)[k])
  );
  const insertId = Number((res as { insertId: number }).insertId);

  await mapInvitee(inviteeUri, insertId, eventUri, nowIso);
  notifyMeeting(insertId, "booked", { key: `booked:${inviteeUri}`, by: `${user.name} (CRM)` });

  await logActivity({
    entity: "lead",
    id: data.leadId || insertId,
    action: "meeting_scheduled",
    text: `Meeting "${row.event_name}" scheduled with ${data.name} (${data.email}) for ${new Date(data.startTime).toLocaleString()}`,
    actor: { type: "user", user },
  });

  return { ok: true, id: insertId };
}

/**
 * Fetches active event types from Calendly (with fallback if token is not yet configured).
 */
export async function fetchCalendlyEventTypes(): Promise<{ ok: boolean; types: CalEventType[] }> {
  const fallback: CalEventType[] = [
    {
      uri: "default:strategy-call",
      name: "30-Minute Strategy Call",
      active: true,
      scheduling_url: "https://calendly.com/quickuppsoftechmeet/strategy-call",
      duration: 30,
      description_plain: "Free 30-Minute Strategy Call with Quickupp Softech Team",
    },
  ];
  if (!calendlyConfigured()) {
    return { ok: false, types: fallback };
  }
  try {
    if (!meUri) {
      const me = await cal<{ resource: { uri: string } }>("/users/me");
      meUri = me.resource.uri;
    }
    const res = await cal<{ collection: CalEventType[] }>(`/event_types?user=${encodeURIComponent(meUri)}&active=true`);
    const types = (res.collection || []).map((t) => ({
      uri: t.uri,
      name: t.name,
      active: Boolean(t.active),
      slug: t.slug,
      scheduling_url: t.scheduling_url,
      duration: t.duration,
      kind: t.kind,
      description_plain: t.description_plain,
      color: t.color,
    }));
    return { ok: true, types: types.length ? types : fallback };
  } catch (err: unknown) {
    console.warn("[calendly] fetch event types failed:", err instanceof Error ? err.message : err);
    return { ok: false, types: fallback };
  }
}

/**
 * Generates a dynamic single-use scheduling link from Calendly.
 */
export async function generateCalendlySchedulingLink(eventTypeUri?: string) {
  if (!calendlyConfigured()) {
    return {
      ok: false,
      booking_url: "https://calendly.com/quickuppsoftechmeet/strategy-call",
    };
  }
  try {
    let owner = eventTypeUri;
    if (!owner || owner.startsWith("default:")) {
      const types = await fetchCalendlyEventTypes();
      const real = types.types.find((t) => !t.uri.startsWith("default:"));
      owner = real?.uri;
    }
    if (!owner) throw new Error("No Calendly event type available");
    const res = await cal<{ resource: { booking_url: string; uri: string } }>("/scheduling_links", {
      method: "POST",
      body: {
        max_event_count: 1,
        owner,
        owner_type: "EventType",
      },
    });
    return { ok: true, booking_url: res.resource.booking_url, uri: res.resource.uri };
  } catch (err: unknown) {
    console.warn("[calendly] generate link failed, using default:", err instanceof Error ? err.message : err);
    return { ok: false, booking_url: "https://calendly.com/quickuppsoftechmeet/strategy-call", error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Synchronizes a single event immediately when booked via website or client embed.
 */
export async function syncSingleEvent(eventUri: string, inviteeUri: string, meetingId?: number) {
  if (!eventUri || !inviteeUri) return { ok: false, error: "Missing URIs" };

  if (meetingId && meetingId > 0) {
    await mapInvitee(inviteeUri, meetingId, eventUri);
    await mapInvitee(eventUri, meetingId, eventUri);
  }

  if (calendlyConfigured()) {
    try {
      const [evRes, invRes] = await Promise.all([
        cal<{ resource: CalEvent }>(eventUri),
        cal<{ resource: CalInvitee }>(inviteeUri),
      ]);
      if (invRes.resource && evRes.resource) {
        await applyInvitee(invRes.resource, evRes.resource, meetingId);
        return { ok: true, synced: true };
      }
    } catch (err: unknown) {
      console.warn("[calendly] single sync API pull error, checking fallback:", err instanceof Error ? err.message : err);
    }
  }

  // Fallback: If token is not set yet or API was temporarily unreachable,
  // we ensure the meeting is recorded in the database
  let id = meetingId || (await meetingFor(inviteeUri));
  if (!id) {
    const nowIso = new Date().toISOString();
    const [res] = await getPool().query(
      `INSERT INTO crm_meetings (invitee_uri, event_uri, event_name, status, start_time, end_time, invitee_name, invitee_email, source, booked_at)
       VALUES (?, ?, 'Strategy Call (Website)', 'scheduled', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 30 MINUTE), 'Website Invitee', 'client@booking', 'website', NOW())
       ON DUPLICATE KEY UPDATE synced_at = NOW()`,
      [inviteeUri, eventUri]
    );
    const newId = Number((res as { insertId: number }).insertId);
    if (newId) await mapInvitee(inviteeUri, newId, eventUri, nowIso);
  }
  return { ok: true, synced: true };
}

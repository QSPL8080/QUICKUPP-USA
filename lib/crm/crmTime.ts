import "server-only";
import { cookies } from "next/headers";

/*
 * Days in the CRM's date filters mean days in the viewer's own time zone — the
 * same clock the tables show times in. The browser reports its zone in the
 * crm_tz cookie (components/crm/TimeZoneCookie); until it has, India time is
 * used, where the team works.
 *
 * A filter day is turned into the exact moment it starts and ends, and those
 * moments are passed to MySQL as Date values (mysql2 writes them in the same
 * clock it reads stored times in), so a lead received at 12:30 AM on the 12th
 * is found under the 12th.
 */

export const TZ_COOKIE = "crm_tz";
export const DEFAULT_TZ = "Asia/Kolkata";

const validZone = (tz: string) => {
  if (!tz || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

/** The viewer's time zone (from the crm_tz cookie), or India time */
export async function viewerTimeZone(): Promise<string> {
  try {
    const raw = (await cookies()).get(TZ_COOKIE)?.value || "";
    const tz = decodeURIComponent(raw);
    return validZone(tz) ? tz : DEFAULT_TZ;
  } catch {
    return DEFAULT_TZ;
  }
}

/** How far the zone's clock is ahead of UTC at that moment, in ms */
function zoneOffset(tz: string, at: Date): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(at)
      .map((x) => [x.type, x.value])
  );
  return Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second)) - Math.floor(at.getTime() / 1000) * 1000;
}

/** The moment a YYYY-MM-DD day starts in the zone */
export function dayStart(ymd: string, tz: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  const wall = Date.UTC(y, m - 1, d);
  let t = wall - zoneOffset(tz, new Date(wall));
  const again = zoneOffset(tz, new Date(t)); // daylight-saving change that day
  if (wall - again !== t) t = wall - again;
  return new Date(t);
}

/** The moment the day after a YYYY-MM-DD day starts in the zone (exclusive end) */
export function dayEnd(ymd: string, tz: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  return dayStart(next.toISOString().slice(0, 10), tz);
}

/** Today's date in the zone, as YYYY-MM-DD */
export function todayIn(tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The Period strip under the filters: the month the date filter starts in (or
 * this month), whether the filter is exactly that month, and the first and last
 * day of the month `offset` months away.
 */
export function monthPeriod(from: string, to: string, tz: string) {
  const [y, m] = (from || todayIn(tz)).split("-").map(Number);
  const range = (offset: number) => {
    const first = new Date(Date.UTC(y, m - 1 + offset, 1));
    const last = new Date(Date.UTC(y, m + offset, 0));
    const f = `${first.getUTCFullYear()}-${pad(first.getUTCMonth() + 1)}-01`;
    const l = `${last.getUTCFullYear()}-${pad(last.getUTCMonth() + 1)}-${pad(last.getUTCDate())}`;
    return { from: f, to: l };
  };
  const cur = range(0);
  const label = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  return { label, isWholeMonth: from === cur.from && to === cur.to, range };
}

/** "2026-11-11 16:22" in the zone, for CSV exports (empty for no date) */
export function exportStamp(v: string | Date | null | undefined, tz: string): string {
  if (!v) return "";
  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d.getTime())) return "";
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      .formatToParts(d)
      .map((x) => [x.type, x.value])
  );
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
}

/** The zone named in export column headings, e.g. "India time (Asia/Kolkata)" */
export function exportZone(tz: string): string {
  return tz === "Asia/Kolkata" || tz === "Asia/Calcutta" ? "India time" : tz === "America/New_York" ? "US Eastern time" : tz;
}

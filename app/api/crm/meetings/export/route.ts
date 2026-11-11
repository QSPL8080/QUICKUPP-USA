import { getUserFor } from "@/lib/crm/auth";
import { listMeetings, MEETING_STATUSES, MEETING_STATUS_LABEL } from "@/lib/crm/calendly";
import { csvFile } from "@/lib/crm/csv";
import { exportStamp, exportZone, viewerTimeZone } from "@/lib/crm/crmTime";
import { parseIds } from "@/lib/crm/ids";

/* GET ?q=&status=&when=&ids= → the Calendly meetings the list shows, every detail, as a CSV file */
export async function GET(request: Request) {
  if (!(await getUserFor("leads"))) return new Response("Please sign in again.", { status: 401 });
  const sp = new URL(request.url).searchParams;
  const rawIds = sp.get("ids");
  const ids = rawIds ? parseIds(rawIds.split(","), 5000) || undefined : undefined;
  const status = (MEETING_STATUSES as readonly string[]).includes(sp.get("status") || "") ? String(sp.get("status")) : "";
  const when = sp.get("when") === "upcoming" || sp.get("when") === "past" ? String(sp.get("when")) : "";
  const { items } = await listMeetings({ q: sp.get("q") || "", status, when, all: true, ids });
  const tz = await viewerTimeZone();
  const zone = exportZone(tz);
  const at = (v: string | null) => exportStamp(v, tz);
  const minutes = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);

  const head = [
    "Sr. No", "Meeting ID", "Status", "Meeting", `Starts (${zone})`, `Ends (${zone})`, "Length (minutes)", "Client's Time Zone",
    "Client Name", "Client Email", "Client Phone", "Guests", "Answers to Booking Questions", "Location", "Join Link",
    "Host", "Host Email", `Booked (${zone})`, "Times Rescheduled", `Previous Start (${zone})`, `Cancelled (${zone})`,
    "Cancelled By", "Cancel Reason", "History",
  ];
  const lines = items.map((m, i) => [
    i + 1,
    m.id,
    MEETING_STATUS_LABEL[m.view] || m.view,
    m.eventName,
    at(m.startTime),
    at(m.endTime),
    minutes(m.startTime, m.endTime),
    m.inviteeTimezone,
    m.name,
    m.email,
    m.phone,
    m.guests.join("; "),
    m.answers.map((a) => `${a.question}: ${a.answer}`).join(" | "),
    [m.locationType, m.locationText].filter(Boolean).join(": "),
    m.joinUrl,
    m.hostName,
    m.hostEmail,
    at(m.bookedAt),
    m.rescheduleCount,
    at(m.previousStartTime),
    at(m.canceledAt),
    m.canceledBy,
    m.cancelReason,
    m.history
      .map((h) =>
        h.kind === "booked"
          ? `Booked ${at(h.at)}${h.start ? ` for ${at(h.start)}` : ""}`
          : h.kind === "rescheduled"
          ? `Rescheduled ${at(h.at)}${h.from ? ` from ${at(h.from)}` : ""}${h.to ? ` to ${at(h.to)}` : ""}`
          : `Cancelled ${at(h.at)}${h.by ? ` by ${h.by}` : ""}${h.reason ? ` (${h.reason})` : ""}`
      )
      .join(" | "),
  ]);
  return csvFile(`quickupp-calendly-meetings-${new Date().toISOString().slice(0, 10)}.csv`, head, lines);
}

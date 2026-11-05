"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/components/crm/Feedback";
import { BulkBar, SelectBox, useSelection } from "@/components/crm/Selection";
import type { MeetingItem } from "@/lib/crm/calendly";

/*
 * Calendly meetings in the CRM: view only. A meeting can be joined and removed
 * from the CRM list, never changed (that happens in Calendly). The list checks
 * Calendly every minute while it is open and refreshes when anything changed.
 */

const LABEL: Record<MeetingItem["view"], string> = {
  upcoming: "Scheduled",
  rescheduled: "Rescheduled",
  completed: "Completed",
  canceled: "Canceled",
};

const POLL_MS = 60_000;

const fmtDay = (iso: string) => new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const fmtWhen = (iso: string) => `${fmtDay(iso)}, ${fmtTime(iso)}`;
const minutes = (a: string, b: string) => Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000));
/** the meeting time as the invitee sees it */
const inZone = (iso: string, tz: string | null) => {
  if (!tz) return null;
  try {
    return new Date(iso).toLocaleString("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return null;
  }
};

const LOCATION: Record<string, string> = {
  google_conference: "Google Meet",
  zoom: "Zoom",
  zoom_conference: "Zoom",
  microsoft_teams_conference: "Microsoft Teams",
  webex_conference: "Webex",
  gotomeeting: "GoTo Meeting",
  physical: "In person",
  outbound_call: "Phone call (we call)",
  inbound_call: "Phone call (they call)",
  ask_invitee: "Invitee's choice",
  custom: "Custom",
};
const locationName = (m: MeetingItem) => (m.locationType ? LOCATION[m.locationType] || m.locationType.replace(/_/g, " ") : "—");

function JoinButton({ m, small = true }: { m: MeetingItem; small?: boolean }) {
  if (!m.joinUrl || m.view === "canceled" || m.view === "completed") return null;
  return (
    <a className={`crm-act crm-act-dark${small ? " crm-act-sm" : ""} crm-meet-join`} href={m.joinUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
      Join
    </a>
  );
}

function StatusPill({ m }: { m: MeetingItem }) {
  return (
    <span className="crm-meet-status">
      <span className={`crm-pill crm-meet-pill crm-meet-pill-${m.view}`}>{LABEL[m.view]}</span>
      {/* a meeting that was moved keeps showing it, even once canceled or completed */}
      {m.rescheduleCount > 0 && m.view !== "rescheduled" && (
        <span className="crm-pill crm-meet-pill crm-meet-pill-rescheduled crm-meet-pill-sub">Rescheduled{m.rescheduleCount > 1 ? ` ×${m.rescheduleCount}` : ""}</span>
      )}
      {m.rescheduleCount > 1 && m.view === "rescheduled" && <span className="crm-meet-times">×{m.rescheduleCount}</span>}
    </span>
  );
}

/** true when two times are the same minute (a reschedule back to the same slot) */
const sameTime = (a: string | null | undefined, b: string | null | undefined) => Boolean(a && b && Math.abs(new Date(a).getTime() - new Date(b).getTime()) < 60000);

function historyText(h: MeetingItem["history"][number]) {
  if (h.kind === "booked") return { title: "Meeting booked", text: h.start ? `For ${fmtWhen(h.start)}` : "" };
  if (h.kind === "rescheduled")
    return {
      title: "Meeting rescheduled",
      text: h.from && h.to ? (sameTime(h.from, h.to) ? `Rebooked for the same time, ${fmtWhen(h.to)}` : `From ${fmtWhen(h.from)} to ${fmtWhen(h.to)}`) : h.to ? `New time ${fmtWhen(h.to)}` : "",
    };
  return { title: "Meeting canceled", text: [h.by ? `By ${h.by}` : "", h.reason ? `Reason: ${h.reason}` : ""].filter(Boolean).join(" · ") };
}

export default function MeetingsView({ rows, version, live }: { rows: MeetingItem[]; version: string; live: boolean }) {
  const router = useRouter();
  const { confirm, toast } = useFeedback();
  const [openId, setOpenId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const sel = useSelection(rows.map((r) => r.id));
  const versionRef = useRef(version);
  useEffect(() => {
    versionRef.current = version;
  }, [version]);
  const open = openId === null ? null : rows.find((r) => r.id === openId) || null;

  // check Calendly every minute while the page is open; refresh when something changed
  useEffect(() => {
    if (!live) return;
    let stop = false;
    const check = async () => {
      if (document.hidden) return;
      const res = await fetch("/api/crm/meetings", { cache: "no-store" }).catch(() => null);
      const j = res?.ok ? await res.json().catch(() => null) : null;
      if (!stop && j?.version && j.version !== versionRef.current) router.refresh();
    };
    const t = window.setInterval(check, POLL_MS);
    const onShow = () => !document.hidden && check();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      stop = true;
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, [live, router]);

  const removeIds = async (ids: number[], what: string) => {
    if (
      !(await confirm({
        title: `Delete ${what}?`,
        message: "It will be removed from the CRM only. Nothing changes in Calendly, and the invitee is not told.",
      }))
    )
      return false;
    setBusy(true);
    const res = await fetch("/api/crm/meetings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok && res?.status !== 404) {
      toast("Couldn't delete. Please try again.", "error");
      return false;
    }
    toast(ids.length === 1 ? "Meeting deleted" : `${ids.length} meetings deleted`);
    router.refresh();
    return true;
  };

  const removeSelected = async () => {
    const ids = sel.selected;
    if (!ids.length) return;
    if (await removeIds(ids, ids.length === 1 ? "this meeting" : `these ${ids.length} meetings`)) sel.clear();
  };

  if (!rows.length) {
    return (
      <div className="crm-empty">
        <p className="crm-empty-title">No meetings found</p>
        <p className="crm-muted">When someone books a call through Calendly on the website, it will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <BulkBar sel={sel} noun={["meeting", "meetings"]} busy={busy} onDelete={removeSelected} />
      <div className="crm-table-wrap">
        <table className="crm-table crm-stack crm-selectable">
          <thead>
            <tr>
              <th className="crm-col-check">
                <SelectBox checked={sel.all} mixed={sel.some} onChange={sel.toggleAll} label="Select all on this page" />
              </th>
              <th>Invitee</th>
              <th>Meeting</th>
              <th>Date &amp; time</th>
              <th>Location</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} onClick={() => setOpenId(m.id)} className={`crm-row${sel.has(m.id) ? " is-picked" : ""}${m.view === "canceled" ? " crm-meet-row-off" : ""}`}>
                <td className="crm-col-check" onClick={(e) => e.stopPropagation()}>
                  <SelectBox checked={sel.has(m.id)} onChange={(on) => sel.toggle(m.id, on)} label={`Select ${m.name}`} />
                </td>
                <td data-label="Invitee" className="crm-cell-main">
                  <span className="crm-strong">{m.name || "—"}</span>
                  <span className="crm-cell-sub">{m.email}</span>
                </td>
                <td data-label="Meeting">
                  <span className="crm-strong">{m.eventName}</span>
                  {m.hostName && <span className="crm-cell-sub">With {m.hostName}</span>}
                </td>
                <td data-label="Date & time" className="crm-nowrap">
                  <span className={`crm-strong${m.view === "canceled" ? " crm-meet-struck" : ""}`}>{fmtDay(m.startTime)}</span>
                  <span className="crm-cell-sub">
                    {fmtTime(m.startTime)} – {fmtTime(m.endTime)} ({minutes(m.startTime, m.endTime)} min)
                  </span>
                  {m.previousStartTime && m.rescheduleCount > 0 && (
                    <span className="crm-cell-sub crm-meet-was">{sameTime(m.previousStartTime, m.startTime) ? "Rebooked for the same time" : `Was ${fmtWhen(m.previousStartTime)}`}</span>
                  )}
                </td>
                <td data-label="Location">{locationName(m)}</td>
                <td data-label="Status">
                  <StatusPill m={m} />
                </td>
                <td data-label="" onClick={(e) => e.stopPropagation()}>
                  <span className="crm-meet-actions">
                    <JoinButton m={m} />
                    <button
                      type="button"
                      className="crm-act-btn crm-act-delete"
                      title="Delete from CRM"
                      aria-label={`Delete the meeting with ${m.name || m.email}`}
                      disabled={busy}
                      onClick={() => removeIds([m.id], `the meeting with ${m.name || m.email}`)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="crm-drawer-wrap" onClick={() => setOpenId(null)}>
          <aside className="crm-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Meeting with ${open.name}`}>
            <div className="crm-drawer-head">
              <div>
                <p className="crm-drawer-kicker">{open.eventName}</p>
                <h2 className="crm-drawer-title">{open.name || open.email}</h2>
                <p className="crm-muted">
                  <StatusPill m={open} /> <span className="crm-meet-head-when">{fmtWhen(open.startTime)}</span>
                </p>
              </div>
              <button type="button" className="crm-icon-act" onClick={() => setOpenId(null)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="crm-drawer-actions">
              <JoinButton m={open} />
              {open.email && (
                <a className="crm-act crm-act-ghost crm-act-sm" href={`mailto:${open.email}`}>
                  Email
                </a>
              )}
              {open.phone && (
                <a className="crm-act crm-act-ghost crm-act-sm" href={`tel:${open.phone.replace(/[^\d+]/g, "")}`}>
                  Call
                </a>
              )}
            </div>

            {open.view === "canceled" && (
              <p className="crm-alert crm-meet-cancel" role="status">
                Canceled{open.canceledBy ? ` by ${open.canceledBy}` : ""}
                {open.canceledAt ? ` on ${fmtWhen(open.canceledAt)}` : ""}.{open.cancelReason ? ` Reason: ${open.cancelReason}` : ""}
              </p>
            )}

            <dl className="crm-details">
              <dt>Date</dt>
              <dd>{fmtDay(open.startTime)}</dd>
              <dt>Time</dt>
              <dd>
                {fmtTime(open.startTime)} – {fmtTime(open.endTime)} ({minutes(open.startTime, open.endTime)} min)
              </dd>
              {open.inviteeTimezone && (
                <>
                  <dt>Invitee&apos;s time</dt>
                  <dd>
                    {inZone(open.startTime, open.inviteeTimezone) || "—"} <span className="crm-muted">({open.inviteeTimezone})</span>
                  </dd>
                </>
              )}
              {open.rescheduleCount > 0 && (
                <>
                  <dt>Rescheduled</dt>
                  <dd>
                    {open.rescheduleCount === 1 ? "Once" : `${open.rescheduleCount} times`}
                    {open.previousStartTime ? (sameTime(open.previousStartTime, open.startTime) ? " · rebooked for the same time" : ` · was ${fmtWhen(open.previousStartTime)}`) : ""}
                  </dd>
                </>
              )}
              <dt>Location</dt>
              <dd className="crm-break">
                {locationName(open)}
                {open.locationText ? ` · ${open.locationText}` : ""}
              </dd>
              {open.joinUrl && (
                <>
                  <dt>Meeting link</dt>
                  <dd className="crm-break">
                    <a href={open.joinUrl} target="_blank" rel="noopener noreferrer">
                      {open.joinUrl}
                    </a>
                  </dd>
                </>
              )}
              <dt>Email</dt>
              <dd className="crm-break">{open.email || "—"}</dd>
              {open.phone && (
                <>
                  <dt>Phone</dt>
                  <dd>{open.phone}</dd>
                </>
              )}
              {open.guests.length > 0 && (
                <>
                  <dt>Guests</dt>
                  <dd className="crm-break">{open.guests.join(", ")}</dd>
                </>
              )}
              <dt>Host</dt>
              <dd className="crm-break">{[open.hostName, open.hostEmail].filter(Boolean).join(" · ") || "—"}</dd>
              <dt>Booked</dt>
              <dd>{open.bookedAt ? fmtWhen(open.bookedAt) : "—"}</dd>
            </dl>

            {open.answers.length > 0 && (
              <div className="crm-message crm-meet-answers">
                <p className="crm-label">Booking form answers</p>
                {open.answers.map((a, i) => (
                  <div key={i} className="crm-meet-qa">
                    <p className="crm-meet-q">{a.question}</p>
                    <p className="crm-message-text">{a.answer || "—"}</p>
                  </div>
                ))}
              </div>
            )}

            {open.history.length > 0 && (
              <div className="crm-drawer-card crm-activity-card">
                <div className="crm-drawer-card-head">
                  <span className="crm-drawer-card-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Meeting history (from Calendly)
                  </span>
                </div>
                <div className="crm-timeline crm-activity-list">
                  {[...open.history].reverse().map((h, i) => {
                    const t = historyText(h);
                    return (
                      <div key={i} className="crm-timeline-item">
                        <div className={`crm-timeline-dot crm-meet-dot-${h.kind}`} />
                        <div className="crm-timeline-body">
                          <div className="crm-timeline-top">
                            <span className="crm-timeline-title">{t.title}</span>
                            <span className="crm-timeline-time">{fmtWhen(h.at)}</span>
                          </div>
                          {t.text && <p className="crm-timeline-desc">{t.text}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="crm-muted crm-meet-readonly">Meeting details come from Calendly and can only be changed there.</p>

            <button
              type="button"
              className="crm-act crm-act-danger crm-meet-delete"
              disabled={busy}
              onClick={async () => {
                if (await removeIds([open.id], `the meeting with ${open.name || open.email}`)) setOpenId(null);
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete from CRM
            </button>
          </aside>
        </div>
      )}
    </>
  );
}

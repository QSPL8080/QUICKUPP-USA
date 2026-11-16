"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFeedback } from "@/components/crm/Feedback";
import { BulkBar, SelectBox, useSelection } from "@/components/crm/Selection";
import type { MeetingItem } from "@/lib/crm/calendly";
import { useViewOnly } from "@/components/crm/ViewOnly";

/*
 * Dynamic Calendly ↔ CRM Meetings.
 * Meetings can be arranged, scheduled, rescheduled, edited, and canceled
 * with live bi-directional sync across CRM, Calendly, and the Website.
 */

const LABEL: Record<MeetingItem["view"], string> = {
  upcoming: "Scheduled",
  rescheduled: "Rescheduled",
  // the meeting time has passed; the CRM doesn't know whether it was held
  completed: "Past",
  canceled: "Canceled",
};

const POLL_MS = 10_000;
const CALENDLY_BASE_URL = "https://calendly.com/quickuppsoftechmeet/strategy-call";

const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const fmtWhen = (iso: string) => `${fmtDay(iso)}, ${fmtTime(iso)}`;
const minutes = (a: string, b: string) => Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000));

/** the meeting time as the invitee sees it */
const inZone = (iso: string, tz: string | null) => {
  if (!tz) return null;
  try {
    return new Date(iso).toLocaleString("en-US", {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
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
    <a
      className={`crm-act crm-act-dark${small ? " crm-act-sm" : ""} crm-meet-join`}
      href={m.joinUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
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
      {m.rescheduleCount > 0 && m.view !== "rescheduled" && m.view !== "canceled" && (
        <span className="crm-pill crm-meet-pill crm-meet-pill-rescheduled crm-meet-pill-sub">
          Rescheduled{m.rescheduleCount > 1 ? ` ×${m.rescheduleCount}` : ""}
        </span>
      )}
      {m.rescheduleCount > 1 && m.view === "rescheduled" && <span className="crm-meet-times">×{m.rescheduleCount}</span>}
    </span>
  );
}

/** true when two times are the same minute */
const sameTime = (a: string | null | undefined, b: string | null | undefined) =>
  Boolean(a && b && Math.abs(new Date(a).getTime() - new Date(b).getTime()) < 60000);

function historyText(h: MeetingItem["history"][number]) {
  if (h.kind === "booked") return { title: "Meeting booked", text: h.start ? `For ${fmtWhen(h.start)}` : "" };
  if (h.kind === "rescheduled")
    return {
      title: "Meeting rescheduled",
      text: h.from && h.to
        ? sameTime(h.from, h.to)
          ? `Rebooked for the same time, ${fmtWhen(h.to)}`
          : `From ${fmtWhen(h.from)} to ${fmtWhen(h.to)}`
        : h.to
          ? `New time ${fmtWhen(h.to)}`
          : "",
    };
  return { title: "Meeting canceled", text: [h.by ? `By ${h.by}` : "", h.reason ? `Reason: ${h.reason}` : ""].filter(Boolean).join(" · ") };
}

export default function MeetingsView({ rows, version, live }: { rows: MeetingItem[]; version: string; live: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirm, toast } = useFeedback();
  const viewOnly = useViewOnly();

  const [openId, setOpenId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const sel = useSelection(rows.map((r) => r.id));
  const versionRef = useRef(version);

  // Modals & Action States
  const [showArrange, setShowArrange] = useState(false);
  const [liveRound, setLiveRound] = useState(0);
  const [liveSuccess, setLiveSuccess] = useState(false);

  // Cancellation Modal
  const [cancelingMeeting, setCancelingMeeting] = useState<MeetingItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelInCalendly, setCancelInCalendly] = useState(true);
  const [cancelingBusy, setCancelingBusy] = useState(false);

  // Reschedule Modal
  const [reschedulingMeeting, setReschedulingMeeting] = useState<MeetingItem | null>(null);
  const reschedulingMeetingRef = useRef<MeetingItem | null>(null);

  // Edit Modal
  const [editingMeeting, setEditingMeeting] = useState<MeetingItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventName: "",
    locationText: "",
    joinUrl: "",
    hostName: "",
    hostEmail: "",
  });
  const [editingBusy, setEditingBusy] = useState(false);

  // Inline notes in drawer
  const [inlineNotes, setInlineNotes] = useState<Record<number, string>>({});
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    versionRef.current = version;
  }, [version]);

  useEffect(() => {
    reschedulingMeetingRef.current = reschedulingMeeting;
  }, [reschedulingMeeting]);

  // Open meeting if selected in list
  const open = openId === null ? null : rows.find((r) => r.id === openId) || null;

  // Auto-open Arrange modal if arrived with ?arrange=1 or action=arrange
  useEffect(() => {
    if (!viewOnly && (searchParams.get("arrange") === "1" || searchParams.get("action") === "arrange")) {
      setShowArrange(true);
    }
  }, [searchParams, viewOnly]);

  const check = useCallback(
    async (force = false) => {
      if (document.hidden && !force) return;
      if (force) setSyncing(true);
      try {
        const res = await fetch(`/api/crm/meetings${force ? "?force=1" : ""}`, { cache: "no-store" }).catch(() => null);
        const j = res?.ok ? await res.json().catch(() => null) : null;
        if (force || (j?.version && j.version !== versionRef.current)) {
          router.refresh();
        }
      } finally {
        if (force) setSyncing(false);
      }
    },
    [router]
  );

  // Catch postMessage from Calendly iframe inside the modal or drawer
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== "https://calendly.com" || !e.data) return;
      if (e.data.event === "calendly.event_scheduled") {
        const activeReschedule = reschedulingMeetingRef.current;
        if (e.data.payload) {
          fetch("/api/calendly/client-scheduled", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...e.data.payload,
              meetingId: activeReschedule ? activeReschedule.id : undefined,
            }),
          }).catch(() => {});
        }
        setLiveSuccess(true);
        toast(activeReschedule ? "Meeting successfully rescheduled & updated in CRM!" : "Meeting successfully scheduled & synced with CRM!");
        setTimeout(() => {
          setShowArrange(false);
          setReschedulingMeeting(null);
          reschedulingMeetingRef.current = null;
          setLiveSuccess(false);
          void check(true);
        }, 2200);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [toast, check]);

  // Background check every 10 seconds while open
  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(() => void check(false), POLL_MS);
    const onShow = () => !document.hidden && void check(true);
    document.addEventListener("visibilitychange", onShow);
    return () => {
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, [live, check]);

  // Delete from CRM list (soft delete)
  const removeIds = async (ids: number[], what: string) => {
    if (
      !(await confirm({
        title: `Delete ${what}?`,
        message: "It will be removed from the CRM list view. (To officially cancel a meeting on Calendly, use the 'Cancel Meeting' button).",
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
    toast(ids.length === 1 ? "Meeting deleted from list" : `${ids.length} meetings deleted`);
    router.refresh();
    return true;
  };

  const removeSelected = async () => {
    const ids = sel.selected;
    if (!ids.length) return;
    if (await removeIds(ids, ids.length === 1 ? "this meeting" : `these ${ids.length} meetings`)) sel.clear();
  };

  // Copy Link to Clipboard
  const copyLink = (url: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast("Link copied to clipboard!");
    }
  };

  // Execute Cancellation
  const executeCancel = async () => {
    if (!cancelingMeeting) return;
    setCancelingBusy(true);
    try {
      const res = await fetch("/api/crm/meetings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cancelingMeeting.id,
          reason: cancelReason,
          cancelInCalendly,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to cancel meeting");
      toast(data.calendlyCanceled ? "Meeting canceled on Calendly & CRM (invitee notified)" : "Meeting marked as canceled in CRM");
      setCancelingMeeting(null);
      setCancelReason("");
      router.refresh();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Cancellation failed", "error");
    } finally {
      setCancelingBusy(false);
    }
  };

  // Open Reschedule Modal
  const openRescheduleModal = (m: MeetingItem) => {
    reschedulingMeetingRef.current = m;
    setReschedulingMeeting(m);
  };

  // Open Edit Modal
  const openEditModal = (m: MeetingItem) => {
    setEditingMeeting(m);
    setEditForm({
      name: m.name,
      email: m.email,
      phone: m.phone || "",
      eventName: m.eventName,
      locationText: m.locationText || "",
      joinUrl: m.joinUrl || "",
      hostName: m.hostName || "",
      hostEmail: m.hostEmail || "",
    });
  };

  // Execute Details Edit
  const executeEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting) return;
    setEditingBusy(true);
    try {
      const res = await fetch(`/api/crm/meetings/${editingMeeting.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to update");
      toast("Meeting details updated!");
      setEditingMeeting(null);
      router.refresh();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      setEditingBusy(false);
    }
  };

  // Save Inline Notes
  const saveInlineNotes = async (meetingId: number) => {
    setSavingNotes(true);
    try {
      const notes = inlineNotes[meetingId] ?? "";
      const res = await fetch(`/api/crm/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to save notes");
      toast("Internal notes saved!");
      router.refresh();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to save notes", "error");
    } finally {
      setSavingNotes(false);
    }
  };

  // Live Calendly embed source URL with optional prefilled client details from URL query params
  const getLiveBookingUrl = () => {
    const params = new URLSearchParams({
      hide_gdpr_banner: "1",
      background_color: "ffffff",
      text_color: "0b0f17",
      primary_color: "6366f1",
      embed_domain: typeof window !== "undefined" ? window.location.host : "quickuppsoftech.us",
      embed_type: "Inline",
    });
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    if (name) params.set("name", name);
    if (email) params.set("email", email);
    return `${CALENDLY_BASE_URL}?${params.toString()}`;
  };

  return (
    <>
      {/* Top Bar with Arrange Meeting & Live Sync */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 18px",
          borderBottom: "1px solid #e2e8f0",
          background: "#f8fafc",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {!viewOnly && (
          <button
            type="button"
            className="crm-act crm-act-dark"
            onClick={() => setShowArrange(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 700 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Arrange Meeting</span>
          </button>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#64748b", marginLeft: "6px" }}>
            <span
              className="crm-live-dot"
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: syncing ? "#f59e0b" : "#10b981",
                display: "inline-block",
              }}
            />
            <span>{syncing ? "Syncing with Calendly..." : "Live Calendly Sync • Auto-checking every 10s"}</span>
          </div>
        </div>

        <button
          type="button"
          className="crm-act crm-act-ghost crm-act-sm"
          disabled={syncing}
          onClick={() => void check(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "12px",
            padding: "5px 12px",
            borderRadius: "6px",
            fontWeight: 600,
            background: "#ffffff",
            borderColor: "#cbd5e1",
            color: "#0f172a",
          }}
          title="Fetch latest updates from Calendly immediately"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={syncing ? "is-spinning" : ""}
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
          </svg>
          <span>{syncing ? "Syncing..." : "Sync Calendly Now"}</span>
        </button>
      </div>

      {/* Bulk actions */}
      <BulkBar sel={sel} noun={["meeting", "meetings"]} busy={busy} onDelete={removeSelected}>
        {sel.selected.length > 0 && (
          <a href={`/api/crm/meetings/export?ids=${sel.selected.join(",")}`} className="crm-act crm-act-ghost crm-act-sm">
            Export selected ({sel.selected.length})
          </a>
        )}
      </BulkBar>

      {/* Table view */}
      {!rows.length ? (
        <div className="crm-empty" style={{ padding: "48px 20px", textAlign: "center" }}>
          <p className="crm-empty-title">No meetings found</p>
          <p className="crm-muted">
            Bookings from the website, Calendly, or arranged in the CRM will appear here automatically.
          </p>
          <div style={{ marginTop: "18px" }}>
            {!viewOnly && (
            <button type="button" className="crm-act crm-act-dark" onClick={() => setShowArrange(true)}>
              + Arrange a Meeting Now
            </button>
            )}
          </div>
        </div>
      ) : (
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
                <tr
                  key={m.id}
                  onClick={() => setOpenId(m.id)}
                  className={`crm-row${sel.has(m.id) ? " is-picked" : ""}${m.view === "canceled" ? " crm-meet-row-off" : ""}`}
                >
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
                    {m.view !== "canceled" && m.previousStartTime && m.rescheduleCount > 0 && (
                      <span className="crm-cell-sub crm-meet-was">
                        {sameTime(m.previousStartTime, m.startTime) ? "Rebooked for the same time" : `Was ${fmtWhen(m.previousStartTime)}`}
                      </span>
                    )}
                  </td>
                  <td data-label="Location">{locationName(m)}</td>
                  <td data-label="Status">
                    <StatusPill m={m} />
                  </td>
                  <td data-label="" onClick={(e) => e.stopPropagation()}>
                    <span className="crm-meet-actions">
                      <JoinButton m={m} />
                      {!viewOnly && (
                      <button
                        type="button"
                        className="crm-act-btn crm-act-delete"
                        title="Remove from CRM list"
                        aria-label={`Remove meeting with ${m.name || m.email}`}
                        disabled={busy}
                        onClick={() => removeIds([m.id], `the meeting with ${m.name || m.email}`)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-over Meeting Drawer */}
      {open && (
        <div className="crm-drawer-wrap" onClick={() => setOpenId(null)}>
          <aside className="crm-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Meeting with ${open.name}`}>
            <div className="crm-drawer-head">
              <div>
                <p className="crm-drawer-kicker">{open.eventName}</p>
                <h2 className="crm-drawer-title">{open.name || open.email}</h2>
                <p className="crm-muted" style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <StatusPill m={open} />
                  <span className="crm-meet-head-when">{fmtWhen(open.startTime)}</span>
                  <span className="crm-pill" style={{ fontSize: "11px", background: "#f1f5f9", color: "#475569" }}>
                    {open.source === "crm" ? "CRM Arranged" : "Website Booking"}
                  </span>
                </p>
              </div>
              <button type="button" className="crm-icon-act" onClick={() => setOpenId(null)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Dynamic Action Buttons */}
            <div className="crm-drawer-actions" style={{ flexWrap: "wrap", gap: "8px" }}>
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
              {!viewOnly && open.view !== "canceled" && open.view !== "completed" && (
                <button
                  type="button"
                  className="crm-act crm-act-ghost crm-act-sm"
                  onClick={() => openRescheduleModal(open)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 16h5v5" />
                  </svg>
                  Reschedule
                </button>
              )}
              {!viewOnly && (
              <button
                type="button"
                className="crm-act crm-act-ghost crm-act-sm"
                onClick={() => openEditModal(open)}
                style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
                Edit
              </button>
              )}
              {!viewOnly && open.view !== "canceled" && (
                <button
                  type="button"
                  className="crm-act crm-act-ghost crm-act-sm"
                  style={{ color: "#dc2626", borderColor: "#fecaca" }}
                  onClick={() => {
                    setCancelingMeeting(open);
                    setCancelReason("");
                    setCancelInCalendly(true);
                  }}
                >
                  Cancel Meeting
                </button>
              )}
            </div>

            {open.view === "canceled" && (
              <p className="crm-alert crm-meet-cancel" role="status">
                Canceled{open.canceledBy ? ` by ${open.canceledBy}` : ""}
                {open.canceledAt ? ` on ${fmtWhen(open.canceledAt)}` : ""}.{open.cancelReason ? ` Reason: ${open.cancelReason}` : ""}
              </p>
            )}

            {/* Internal CRM Notes Card */}
            <div className="crm-drawer-card" style={{ padding: "14px 16px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", marginTop: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Internal CRM Meeting Notes
                </span>
                {!viewOnly && (
                <button
                  type="button"
                  className="crm-act crm-act-dark crm-act-sm"
                  disabled={savingNotes}
                  onClick={() => saveInlineNotes(open.id)}
                  style={{ padding: "3px 10px", fontSize: "11.5px" }}
                >
                  {savingNotes ? "Saving..." : "Save Notes"}
                </button>
                )}
              </div>
              <textarea
                className="crm-input"
                rows={3}
                value={inlineNotes[open.id] !== undefined ? inlineNotes[open.id] : open.notes || ""}
                onChange={(e) => setInlineNotes((prev) => ({ ...prev, [open.id]: e.target.value }))}
                readOnly={viewOnly}
                placeholder="Add internal discussion points, customer requirements, action items, or followup notes..."
                style={{ width: "100%", fontSize: "13px", resize: "vertical" }}
              />
            </div>

            <dl className="crm-details" style={{ marginTop: "16px" }}>
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
              {open.rescheduleUrl && open.view !== "canceled" && (
                <>
                  <dt>Calendly Reschedule</dt>
                  <dd className="crm-break">
                    <a href={open.rescheduleUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5", fontWeight: 600 }}>
                      Open Calendly Reschedule Link ↗
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
                    Meeting history (Live Sync)
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

            {!viewOnly && (
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
              Delete from CRM List
            </button>
            )}
          </aside>
        </div>
      )}

      {/* Arrange / Schedule Meeting Modal */}
      {showArrange && (
        <div className="crm-modal-wrap" onClick={() => setShowArrange(false)}>
          <div className="crm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", width: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="crm-drawer-head" style={{ padding: "16px 22px", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <h2 className="crm-drawer-title" style={{ fontSize: "17px", fontWeight: 800 }}>Arrange Calendly Meeting</h2>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                    Select a date and time slot below to schedule via Calendly.
                  </p>
                </div>
              </div>
              <button type="button" className="crm-icon-act" onClick={() => setShowArrange(false)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={{ padding: "20px 22px" }}>
              {liveSuccess ? (
                <div style={{ padding: "40px 20px", textAlign: "center", background: "#f0fdf4", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#22c55e", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                    ✓
                  </div>
                  <h3 style={{ margin: "12px 0 4px", fontSize: "16px", color: "#166534" }}>Meeting Successfully Scheduled!</h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#15803d" }}>The meeting was synced to CRM and an invitation email was sent.</p>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                      Select an available date and time slot below:
                    </span>
                    <button
                      type="button"
                      className="crm-act crm-act-ghost crm-act-sm"
                      onClick={() => setLiveRound((r) => r + 1)}
                      style={{ fontSize: "11px", padding: "2px 8px" }}
                    >
                      Reload Calendar
                    </button>
                  </div>
                  <div style={{ height: "600px", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", background: "#ffffff" }}>
                    <iframe
                      key={liveRound}
                      src={getLiveBookingUrl()}
                      style={{ width: "100%", height: "100%", border: "none" }}
                      title="Calendly Scheduler"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingMeeting && (
        <div className="crm-modal-wrap" onClick={() => setReschedulingMeeting(null)}>
          <div className="crm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "820px", width: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="crm-drawer-head" style={{ padding: "16px 22px", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 16h5v5" />
                  </svg>
                </div>
                <div>
                  <h2 className="crm-drawer-title" style={{ fontSize: "16px", fontWeight: 800 }}>
                    Reschedule: {reschedulingMeeting.name || reschedulingMeeting.email}
                  </h2>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                    Current Time: <strong>{fmtWhen(reschedulingMeeting.startTime)}</strong> {reschedulingMeeting.rescheduleCount > 0 ? `(Rescheduled ×${reschedulingMeeting.rescheduleCount})` : ""}
                  </p>
                </div>
              </div>
              <button type="button" className="crm-icon-act" onClick={() => setReschedulingMeeting(null)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={{ padding: "20px 22px" }}>
              {liveSuccess ? (
                <div style={{ padding: "40px 20px", textAlign: "center", background: "#f0fdf4", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#22c55e", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                    ✓
                  </div>
                  <h3 style={{ margin: "12px 0 4px", fontSize: "16px", color: "#166534" }}>Meeting Successfully Rescheduled!</h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#15803d" }}>
                    The meeting record in CRM has been updated with the new date &amp; time. Updated confirmation emails were sent by Calendly.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                    <span style={{ fontSize: "12.5px", color: "#475569" }}>
                      Pick an available time slot below to reschedule:
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {reschedulingMeeting.rescheduleUrl && (
                        <a
                          className="crm-act crm-act-ghost crm-act-sm"
                          href={reschedulingMeeting.rescheduleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: "12px", padding: "3px 10px" }}
                        >
                          Open in New Tab ↗
                        </a>
                      )}
                      <button
                        type="button"
                        className="crm-act crm-act-ghost crm-act-sm"
                        onClick={() => copyLink(reschedulingMeeting.rescheduleUrl || CALENDLY_BASE_URL)}
                        style={{ fontSize: "12px", padding: "3px 10px" }}
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                  <div style={{ height: "600px", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", background: "#ffffff" }}>
                    <iframe
                      src={reschedulingMeeting.rescheduleUrl || `${CALENDLY_BASE_URL}?email=${encodeURIComponent(reschedulingMeeting.email || "")}`}
                      style={{ width: "100%", height: "100%", border: "none" }}
                      title="Calendly Rescheduler"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Meeting Modal */}
      {cancelingMeeting && (
        <div className="crm-modal-wrap" onClick={() => setCancelingMeeting(null)}>
          <div className="crm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px", width: "95vw" }}>
            <div className="crm-drawer-head" style={{ padding: "16px 20px", borderBottom: "1px solid #fee2e2", background: "#fef2f2" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#fee2e2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <div>
                  <h2 className="crm-drawer-title" style={{ fontSize: "16px", color: "#991b1b" }}>Cancel Meeting</h2>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#b91c1c" }}>
                    With {cancelingMeeting.name || cancelingMeeting.email} ({fmtWhen(cancelingMeeting.startTime)})
                  </p>
                </div>
              </div>
              <button type="button" className="crm-icon-act" onClick={() => setCancelingMeeting(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <label className="crm-field">
                <span className="crm-label">Cancellation Reason (Sent to Invitee)</span>
                <textarea
                  className="crm-input"
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Scheduling conflict, client requested cancellation..."
                />
              </label>

              <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", color: "#475569", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={cancelInCalendly}
                  onChange={(e) => setCancelInCalendly(e.target.checked)}
                  style={{ marginTop: "2px" }}
                />
                <span>
                  <strong>Cancel on Calendly:</strong> Frees calendar slot and triggers Calendly&apos;s cancellation email to the client.
                </span>
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button type="button" className="crm-act crm-act-ghost" onClick={() => setCancelingMeeting(null)}>
                  Keep Meeting
                </button>
                <button
                  type="button"
                  className="crm-act crm-act-danger"
                  disabled={cancelingBusy}
                  onClick={executeCancel}
                  style={{ background: "#dc2626", color: "#fff", borderColor: "#dc2626" }}
                >
                  {cancelingBusy ? "Canceling..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {editingMeeting && (
        <div className="crm-modal-wrap" onClick={() => setEditingMeeting(null)}>
          <div className="crm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", width: "95vw" }}>
            <div className="crm-drawer-head" style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
              <h2 className="crm-drawer-title" style={{ fontSize: "16px" }}>Edit Meeting Details</h2>
              <button type="button" className="crm-icon-act" onClick={() => setEditingMeeting(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={executeEdit} style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label className="crm-field">
                  <span className="crm-label">Invitee Name</span>
                  <input
                    className="crm-input"
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </label>
                <label className="crm-field">
                  <span className="crm-label">Invitee Email</span>
                  <input
                    className="crm-input"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label className="crm-field">
                  <span className="crm-label">Invitee Phone</span>
                  <input
                    className="crm-input"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </label>
                <label className="crm-field">
                  <span className="crm-label">Event Name</span>
                  <input
                    className="crm-input"
                    value={editForm.eventName}
                    onChange={(e) => setEditForm((f) => ({ ...f, eventName: e.target.value }))}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label className="crm-field">
                  <span className="crm-label">Location Text</span>
                  <input
                    className="crm-input"
                    value={editForm.locationText}
                    onChange={(e) => setEditForm((f) => ({ ...f, locationText: e.target.value }))}
                    placeholder="e.g. Bridgeport Office or Online"
                  />
                </label>
                <label className="crm-field">
                  <span className="crm-label">Join / Video Link</span>
                  <input
                    className="crm-input"
                    value={editForm.joinUrl}
                    onChange={(e) => setEditForm((f) => ({ ...f, joinUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label className="crm-field">
                  <span className="crm-label">Host Name</span>
                  <input
                    className="crm-input"
                    value={editForm.hostName}
                    onChange={(e) => setEditForm((f) => ({ ...f, hostName: e.target.value }))}
                  />
                </label>
                <label className="crm-field">
                  <span className="crm-label">Host Email</span>
                  <input
                    className="crm-input"
                    type="email"
                    value={editForm.hostEmail}
                    onChange={(e) => setEditForm((f) => ({ ...f, hostEmail: e.target.value }))}
                  />
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button type="button" className="crm-act crm-act-ghost" onClick={() => setEditingMeeting(null)}>
                  Cancel
                </button>
                <button type="submit" className="crm-act crm-act-dark" disabled={editingBusy}>
                  {editingBusy ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/*
 * Activity History & Audit Trail: one timeline used on the lead details and
 * the payment details. Newest first. Entries come from the server
 * (crm_activity); this component only shows them.
 */

export type ActivityEntry = {
  id: number;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  message: string;
  actorType: string;
  actorName: string | null;
  actorRole: string | null;
  by: string;
  createdAt: string;
};

const TITLES: Record<string, string> = {
  created: "Created",
  status: "Status Updated",
  project_status: "Project Status Updated",
  assigned: "Lead Assigned",
  reassigned: "Lead Reassigned",
  unassigned: "Lead Unassigned",
  attachment: "Attachment",
  payment_link: "Payment Link Created",
  payment: "Payment Received",
  payment_failed: "Payment Failed",
  amount: "Payment Amount Updated",
  amount_paid: "Amount Received Updated",
  balance: "Remaining Balance Updated",
  payment_type: "Payment Type Updated",
  link_status: "Link Status Updated",
  reminder: "Balance Reminder",
  receipt_email: "Receipt Emailed to Client",
  receipt_email_failed: "Receipt Email Not Sent",
};

const FIELD_TITLES: Record<string, string> = {
  name: "Name Updated",
  email: "Email Updated",
  phone: "Mobile Number Updated",
  company: "Company Updated",
  website: "Website Updated",
  country: "Location Updated",
  industry: "Industry Updated",
  service: "Service Updated",
  category: "Service Requirement Updated",
  budget: "Budget Updated",
  timeline: "Timeline Updated",
  channel: "Lead Channel Updated",
  notes: "Notes Updated",
  clientName: "Customer Name Updated",
  clientEmail: "Customer Email Updated",
  clientPhone: "Customer Mobile Updated",
  companyName: "Company Updated",
  method: "Payment Method Updated",
  reference: "Transaction Reference Updated",
  invoiceNumber: "Invoice Number Updated",
  paidAt: "Payment Date Updated",
  billingStartDate: "Billing Start Updated",
  billingEndDate: "Billing End Updated",
  balanceDueDate: "Balance Due Date Updated",
};

function titleOf(a: ActivityEntry, kind: "lead" | "payment") {
  if (a.action === "created") {
    if (a.actorType === "website") return kind === "lead" ? "Lead Received" : "Payment Received";
    return kind === "lead" ? "Lead Created" : a.message.startsWith("Payment link") ? "Payment Link Created" : "Payment Recorded";
  }
  if (a.action === "status") return kind === "lead" ? "Lead Status Updated" : "Payment Status Updated";
  if (a.action === "updated" && a.field && FIELD_TITLES[a.field]) return FIELD_TITLES[a.field];
  return TITLES[a.action] || "Updated";
}

const DOTS: Record<string, { bg: string; ring: string }> = {
  user: { bg: "#8b5cf6", ring: "#ede9fe" },
  website: { bg: "#94a3b8", ring: "#e2e8f0" },
  gateway: { bg: "#10b981", ring: "#d1fae5" },
  system: { bg: "#f59e0b", ring: "#fef3c7" },
};

export function fmtWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const now = new Date();
  const sameDay = (x: Date, y: Date) => x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
  if (sameDay(d, now)) return `Today, ${time}`;
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (sameDay(d, y)) return `Yesterday, ${time}`;
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return `${date}, ${time}`;
}

/** the sentence without its trailing "by Admin (Priya)." — shown separately */
function sentence(a: ActivityEntry) {
  const tail = ` by ${a.by}.`;
  return a.message.endsWith(tail) ? `${a.message.slice(0, -tail.length)}.` : a.message;
}

const short = (v: string | null) => v !== null && v.length <= 60;

export default function ActivityTimeline({
  entries,
  kind,
  loading = false,
  emptyText = "No activity recorded yet.",
  visibleCount = 2,
}: {
  entries: ActivityEntry[];
  kind: "lead" | "payment";
  loading?: boolean;
  emptyText?: string;
  visibleCount?: number;
}) {
  // the latest 2 entries are shown; older ones are reached by scrolling the list
  const VISIBLE = visibleCount;
  const listRef = useRef<HTMLDivElement>(null);
  const [maxH, setMaxH] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const measure = () => {
      const items = el.querySelectorAll<HTMLElement>(":scope > .crm-timeline-item");
      if (items.length <= VISIBLE) return setMaxH(null);
      const cut = items[VISIBLE];
      const offset = cut.offsetParent === el ? cut.offsetTop : cut.offsetTop - el.offsetTop;
      setMaxH(Math.max(0, offset - 2));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [entries, VISIBLE]);
  const list = entries;

  return (
    <div className="crm-drawer-card crm-activity-card">
      <div className="crm-drawer-card-head">
        <span className="crm-drawer-card-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Activity History &amp; Audit Trail
        </span>
        {entries.length > 0 && <span className="crm-activity-count">{entries.length}</span>}
      </div>

      {loading ? (
        <p className="crm-timeline-desc">Loading activity…</p>
      ) : entries.length === 0 ? (
        <p className="crm-timeline-desc">{emptyText}</p>
      ) : (
        <div
          ref={listRef}
          className={`crm-timeline crm-activity-list${maxH ? " is-scroll" : ""}`}
          style={maxH ? { maxHeight: `${maxH}px` } : undefined}
          tabIndex={maxH ? 0 : undefined}
          aria-label={maxH ? "Activity history (scroll for older entries)" : undefined}
        >
          {list.map((a) => {
            const dot = DOTS[a.actorType] || DOTS.user;
            const showChange = (a.oldValue || a.newValue) && short(a.oldValue) && short(a.newValue) && a.action !== "created" && a.action !== "payment" && a.action !== "payment_failed" && a.action !== "reminder" && a.action !== "receipt_email" && a.action !== "receipt_email_failed" && a.action !== "payment_link" && a.action !== "attachment";
            return (
              <div key={a.id} className="crm-timeline-item">
                <div className="crm-timeline-dot" style={{ background: dot.bg, borderColor: dot.ring }} />
                <div className="crm-timeline-body">
                  <div className="crm-timeline-top">
                    <span className="crm-timeline-title">{titleOf(a, kind)}</span>
                    <span className="crm-timeline-time" title={new Date(a.createdAt).toLocaleString()}>
                      {fmtWhen(a.createdAt)}
                    </span>
                  </div>
                  {showChange && (
                    <p className="crm-activity-change">
                      <span className="crm-activity-old">{a.oldValue || "—"}</span>
                      <span className="crm-activity-arrow" aria-label="changed to">→</span>
                      <span className="crm-activity-new">{a.newValue || "—"}</span>
                    </p>
                  )}
                  <p className="crm-timeline-desc">{sentence(a)}</p>
                  <p className="crm-activity-by">
                    {a.actorType === "user" ? "By " : "Source: "}
                    <strong>{a.by}</strong>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {maxH !== null && entries.length > VISIBLE && (
        <p className="crm-activity-hint">Scroll for {entries.length - VISIBLE} older {entries.length - VISIBLE === 1 ? "entry" : "entries"}</p>
      )}
    </div>
  );
}

/** true when two histories hold the same entries (nothing new to show) */
export function sameEntries(a: ActivityEntry[], b: ActivityEntry[]) {
  return a.length === b.length && a.every((x, i) => x.id === b[i].id);
}

/** Loads a payment's / payment link's history when the details open */
export function usePaymentActivity(entity: "payment" | "payment_link" | null, id: number | null, refreshKey: string | number = 0) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!entity || !id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear the list when nothing is selected
      setEntries([]);
      return;
    }
    let live = true;
    setLoading(true);
    fetch(`/api/crm/activity?entity=${entity}&id=${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!live) return;
        const next: ActivityEntry[] = Array.isArray(j?.activity) ? j.activity : [];
        setEntries((cur) => (sameEntries(cur, next) ? cur : next));
      })
      .catch(() => live && setEntries([]))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [entity, id, refreshKey]);
  return { entries, loading };
}

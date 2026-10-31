"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Notifications } from "@/lib/crm/notifications";

const ago = (iso: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const ICON: Record<string, string> = {
  leads: "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",
  payments: "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM2 10h20M6 15h4",
  applications: "M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM2 12h20",
};

/**
 * "Since your last visit": opens by itself once when something new arrived
 * (leads, payments, job applications). Closing it or opening an item marks
 * everything as seen for this user, so it doesn't come back.
 */
export default function NotifyCenter({ data }: { data: Notifications }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const total = seen ? 0 : data.total;

  // new things arrived → show them once
  useEffect(() => {
    setSeen(false);
    if (data.total > 0) setOpen(true);
  }, [data.asOf, data.total]);

  const markSeen = async () => {
    if (seen || data.total === 0) return;
    setSeen(true);
    await fetch("/api/crm/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asOf: data.asOf }),
    }).catch(() => null);
  };

  const close = () => {
    setOpen(false);
    void markSeen();
  };

  const go = (href: string) => {
    setOpen(false);
    void markSeen();
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        className={`crm-bell${total ? " has-new" : ""}`}
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={total ? `${total} new notifications` : "Notifications"}
        aria-expanded={open}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {total > 0 && <span className="crm-bell-count">{total > 99 ? "99+" : total}</span>}
      </button>

      {open && (
        <div className="crm-notify-wrap" onClick={close}>
          <section className="crm-notify" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Notifications">
            <div className="crm-notify-head">
              <div>
                <h2 className="crm-card-title">{total ? "Since your last visit" : "Notifications"}</h2>
                <p className="crm-muted">{total ? `${total} new ${total === 1 ? "update" : "updates"}` : "You're all caught up."}</p>
              </div>
              <button type="button" className="crm-icon-act" onClick={close} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {total > 0 ? (
              <div className="crm-notify-body">
                {data.groups
                  .filter((g) => g.count > 0)
                  .map((g) => (
                    <div key={g.key} className="crm-notify-group">
                      <button type="button" className="crm-notify-group-head" onClick={() => go(g.href)}>
                        <span className={`crm-notify-icon crm-notify-${g.key}`} aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d={ICON[g.key]} />
                          </svg>
                        </span>
                        <span className="crm-strong">{g.label}</span>
                        <span className="crm-nav-badge">{g.count}</span>
                      </button>
                      <ul className="crm-notify-list">
                        {g.items.map((it, i) => (
                          <li key={i}>
                            <button type="button" className="crm-notify-item" onClick={() => go(it.href)}>
                              <span className="crm-notify-text">
                                <span className="crm-strong">{it.title}</span>
                                <span className="crm-cell-sub">{it.sub}</span>
                              </span>
                              <span className="crm-muted crm-nowrap">{ago(it.at)}</span>
                            </button>
                          </li>
                        ))}
                        {g.count > g.items.length && (
                          <li>
                            <button type="button" className="crm-link-btn crm-notify-more" onClick={() => go(g.href)}>
                              +{g.count - g.items.length} more
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="crm-notify-empty crm-muted">New leads, payments and job applications will show up here the next time you open the CRM.</p>
            )}

            {total > 0 && (
              <div className="crm-notify-foot">
                <button type="button" className="crm-act crm-act-dark crm-act-sm" onClick={close}>
                  Mark all as seen
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { NotifyItem, Notifications } from "@/lib/crm/notifications";
import { useFeedback } from "@/components/crm/Feedback";

const ago = (iso: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const ICON: Record<NotifyItem["kind"], string> = {
  lead: "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",
  payment: "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM2 10h20M6 15h4",
  application: "M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM2 12h20",
};

const send = (body: object) =>
  fetch("/api/crm/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);

/**
 * Bell + panel. New leads, payments and job applications pop up once; closing
 * the popup (or "Mark all as read") marks them read but keeps them listed.
 * Each one can be marked read on its own, and "Clear all" empties the list
 * for good — only things that arrive afterwards show up again.
 */
export default function NotifyCenter({ data }: { data: Notifications }) {
  const router = useRouter();
  const { confirm, toast } = useFeedback();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotifyItem[]>(data.items);
  const unread = items.filter((i) => i.unread).length;

  // fresh data from the server: show it, and pop up if something is unread
  useEffect(() => {
    setItems(data.items);
    if (data.unread > 0) setOpen(true);
  }, [data.asOf, data.items, data.unread]);

  const readAll = () => {
    if (!items.some((i) => i.unread)) return;
    setItems((list) => list.map((i) => ({ ...i, unread: false })));
    void send({ action: "read-all", asOf: data.asOf });
  };

  const readOne = (key: string) => {
    setItems((list) => list.map((i) => (i.key === key ? { ...i, unread: false } : i)));
    void send({ action: "read", key });
  };

  const clear = async () => {
    if (!items.length) return;
    const ok = await confirm({
      title: "Clear all notifications?",
      message: "The list will be emptied. Only new leads, payments and job applications that arrive after this will show up.",
      confirmLabel: "Clear all",
      tone: "default",
    });
    if (!ok) return;
    setItems([]);
    await send({ action: "clear", asOf: data.asOf });
    toast("Notifications cleared");
  };

  // closing the panel counts as having seen what's in it
  const close = () => {
    setOpen(false);
    readAll();
  };

  const go = (it: NotifyItem) => {
    if (it.unread) readOne(it.key);
    setOpen(false);
    router.push(it.href);
  };

  return (
    <>
      <button
        type="button"
        className={`crm-bell${unread ? " has-new" : ""}`}
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={unread ? `${unread} unread notifications` : "Notifications"}
        aria-expanded={open}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && <span className="crm-bell-count">{unread > 99 ? "99+" : unread}</span>}
      </button>

      {open && (
        <div className="crm-notify-wrap" onClick={close}>
          <section className="crm-notify" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Notifications">
            <div className="crm-notify-head">
              <div>
                <h2 className="crm-card-title">Notifications</h2>
                <p className="crm-muted">{unread ? `${unread} unread` : items.length ? "All caught up" : "Nothing new"}</p>
              </div>
              <button type="button" className="crm-icon-act" onClick={close} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {items.length > 0 && (
              <div className="crm-notify-tools">
                <button type="button" className="crm-link-btn" onClick={readAll} disabled={!unread}>
                  Mark all as read
                </button>
                <button type="button" className="crm-link-btn crm-link-danger" onClick={clear}>
                  Clear all
                </button>
              </div>
            )}

            {items.length ? (
              <ul className="crm-notify-feed">
                {items.map((it) => (
                  <li key={it.key} className={`crm-notify-row${it.unread ? " is-unread" : ""}`}>
                    <button type="button" className="crm-notify-item" onClick={() => go(it)}>
                      <span className={`crm-notify-icon crm-notify-${it.kind}`} aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                          <path d={ICON[it.kind]} />
                        </svg>
                      </span>
                      <span className="crm-notify-text">
                        <span className="crm-strong">{it.title}</span>
                        <span className="crm-cell-sub">{it.sub}</span>
                        <span className="crm-notify-time">{ago(it.at)}</span>
                      </span>
                    </button>
                    {it.unread ? (
                      <button type="button" className="crm-notify-mark" onClick={() => readOne(it.key)} aria-label={`Mark ${it.title} as read`} title="Mark as read">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </button>
                    ) : (
                      <span className="crm-notify-read" aria-label="Read" title="Read">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M18 7L9.5 15.5 6 12M22 7l-8.5 8.5" />
                        </svg>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="crm-notify-empty">
                <p className="crm-strong">No notifications</p>
                <p className="crm-muted">New leads, payments and job applications will show up here.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

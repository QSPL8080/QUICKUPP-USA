"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFeedback } from "@/components/crm/Feedback";
import type { TrashItem } from "@/lib/crm/trash";

const KIND: Record<TrashItem["entity"], string> = {
  lead: "Lead",
  payment: "Payment",
  payment_link: "Payment link",
  blog: "Blog",
  job: "Job opening",
  application: "Job application",
  user: "Team account",
  meeting: "Meeting",
};

const fmtWhen = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

export default function TrashView({ items }: { items: TrashItem[] }) {
  const router = useRouter();
  const { confirm, ask, toast } = useFeedback();
  const [kind, setKind] = useState<string>("");
  const [busy, setBusy] = useState("");
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const i of items) c[i.entity] = (c[i.entity] || 0) + 1;
    return c;
  }, [items]);
  const shown = kind ? items.filter((i) => i.entity === kind) : items;

  const act = async (item: TrashItem, how: "restore" | "purge") => {
    let typed = "";
    if (how === "purge") {
      const entityLabel = KIND[item.entity] || "Item";
      const targetName = item.label || "this item";

      const t = await ask({
        title: `Permanently Delete ${entityLabel}`,
        message: (
          <div className="crm-confirm-message-wrap">
            <p className="crm-confirm-desc">
              Are you sure you want to permanently delete <strong className="crm-confirm-highlight">{targetName}</strong>?
            </p>
            <div className="crm-confirm-warning-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>
                This action <strong>cannot be undone</strong>. This record will be permanently deleted from the database and recorded in the audit log.
              </span>
            </div>
          </div>
        ),
        input: {
          label: (
            <span>
              Type <strong style={{ color: "#dc2626", letterSpacing: "0.5px" }}>DELETE</strong> to confirm permanent deletion:
            </span>
          ),
          placeholder: "DELETE",
          mustType: "DELETE",
        },
        confirmLabel: "Delete Permanently",
        tone: "danger",
      });
      if (t !== "DELETE") return;
      typed = t;
    }
    setBusy(item.key);
    const res = await fetch("/api/crm/trash", {
      method: how === "restore" ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(how === "purge" ? { key: item.key, confirm: typed } : { key: item.key }),
    }).catch(() => null);
    const j = res ? await res.json().catch(() => null) : null;
    setBusy("");
    if (!res?.ok || !j?.ok) {
      toast(j?.error || "Couldn't do that. Please try again.", "error");
      router.refresh();
      return;
    }
    toast(how === "restore" ? `${KIND[item.entity]} restored successfully` : `${KIND[item.entity]} permanently deleted`);
    router.refresh();
  };

  if (!items.length) {
    return (
      <div className="crm-empty">
        <p className="crm-empty-title">The Deleted bin is empty</p>
        <p className="crm-empty-sub">Leads, payments, meetings, blogs, jobs, applications and team accounts an Admin deletes will wait here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="crm-meet-chips" style={{ padding: "12px 16px 0" }}>
        <button type="button" className={`crm-meet-chip${!kind ? " is-on" : ""}`} onClick={() => setKind("")}>
          All <span className="crm-meet-chip-n">{items.length}</span>
        </button>
        {(Object.keys(KIND) as TrashItem["entity"][])
          .filter((k) => counts[k])
          .map((k) => (
            <button key={k} type="button" className={`crm-meet-chip${kind === k ? " is-on" : ""}`} onClick={() => setKind(k)}>
              {KIND[k]} <span className="crm-meet-chip-n">{counts[k]}</span>
            </button>
          ))}
      </div>
      <div className="crm-table-wrap">
        <table className="crm-table crm-stack">
          <thead>
            <tr>
              <th>What</th>
              <th>Name</th>
              <th>Deleted by</th>
              <th>Deleted</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((i) => (
              <tr key={i.key}>
                <td data-label="What">
                  <span className="crm-pill">{KIND[i.entity]}</span>
                </td>
                <td data-label="Name" className="crm-cell-main">
                  <span className="crm-strong">{i.label || "—"}</span>
                  {i.detail && <span className="crm-cell-sub">{i.detail}</span>}
                  {i.reason && <span className="crm-cell-sub">Reason: {i.reason}</span>}
                </td>
                <td data-label="Deleted by">{i.deletedBy || "—"}</td>
                <td data-label="Deleted" className="crm-nowrap">
                  {fmtWhen(i.deletedAt)}
                </td>
                <td data-label="Actions" className="crm-nowrap" style={{ textAlign: "right" }}>
                  <span style={{ display: "inline-flex", gap: 8 }}>
                    <button type="button" className="crm-act crm-act-ghost crm-act-sm" disabled={busy === i.key} onClick={() => act(i, "restore")}>
                      Restore
                    </button>
                    {i.locked ? (
                      <span
                        className="crm-manual-tag"
                        style={{ alignSelf: "center" }}
                        title={i.entity === "lead" ? "This lead became a client: it is kept with its payment records." : "Money was received on it: it is kept for your records."}
                      >
                        Kept for records
                      </span>
                    ) : (
                      <button type="button" className="crm-act crm-act-danger crm-act-sm" disabled={busy === i.key} onClick={() => act(i, "purge")}>
                        Delete permanently
                      </button>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

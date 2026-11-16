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
      // two steps: are you sure, then type DELETE
      if (
        !(await confirm({
          title: `Delete ${item.label || "this item"} forever?`,
          message: "It is removed from the CRM and the database for good. This can't be undone.",
          confirmLabel: "Continue",
        }))
      )
        return;
      const t = await ask({
        title: "Confirm removing it for good",
        message: `${KIND[item.entity]}: ${item.label || "this item"}. This is permanent and is recorded in the audit log.`,
        input: { label: "Type DELETE to confirm", placeholder: "DELETE", mustType: "DELETE" },
        confirmLabel: "Delete forever",
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
    toast(how === "restore" ? `${KIND[item.entity]} restored` : `${KIND[item.entity]} deleted forever`);
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
                        Delete forever
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

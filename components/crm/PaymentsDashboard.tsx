import Link from "next/link";
import { PAYMENT_STATUS_LABEL, money } from "@/lib/crm/format";
import type { PaymentStats } from "@/lib/crm/stats";
import { ColumnChart, StackBar, shortMoney } from "@/components/crm/DashCharts";

/*
 * Payments dashboard (its own page under Payments in the sidebar). Covers
 * website payments and payment links. Totals are in the main currency.
 */

const STATUS_PARTS: Record<string, { label: string; color: string }> = {
  paid: { label: "Paid", color: "#10b981" },
  partially_paid: { label: "Partially paid", color: "#3b82f6" },
  pending: { label: "Pending", color: "#f59e0b" },
  failed: { label: "Failed", color: "#ef4444" },
  refunded: { label: "Refunded", color: "#94a3b8" },
};

const day = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

function dueLabel(iso: string | null) {
  if (!iso) return { text: "No due date", late: false };
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const days = Math.round((new Date(iso).getTime() - today.getTime()) / 86400000);
  if (days < 0) return { text: `Overdue · ${day(iso)}`, late: true };
  if (days === 0) return { text: "Due today", late: true };
  return { text: `Due ${day(iso)}`, late: false };
}

export default function PaymentsDashboard({ s }: { s: PaymentStats }) {
  const cur = s.currency;
  const m = (v: number) => money(v, cur);
  const delta = s.lastMonth > 0 ? Math.round(((s.month - s.lastMonth) / s.lastMonth) * 100) : null;
  const others = s.byCurrency.slice(1);

  return (
    <div className="crm-pdash">
      {/* four plain numbers */}
      <section className="crm-pdash-strip">
        <div className="crm-pdash-cell">
          <p className="crm-pdash-label">Total collected</p>
          <p className="crm-pdash-value">{m(s.received)}</p>
          <p className="crm-pdash-note">
            {s.paidCount} {s.paidCount === 1 ? "payment" : "payments"} received
          </p>
        </div>
        <div className="crm-pdash-cell">
          <p className="crm-pdash-label">This month</p>
          <p className="crm-pdash-value">{m(s.month)}</p>
          <p className="crm-pdash-note">
            {delta === null ? (
              <>Last month {m(s.lastMonth)}</>
            ) : (
              <span className={`crm-pdash-delta ${delta >= 0 ? "is-up" : "is-down"}`}>
                {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs last month
              </span>
            )}
          </p>
        </div>
        <div className="crm-pdash-cell">
          <p className="crm-pdash-label">Still to collect</p>
          <p className="crm-pdash-value">{m(s.due)}</p>
          <p className="crm-pdash-note">
            {s.openCount} unpaid or part-paid
          </p>
        </div>
        <div className="crm-pdash-cell">
          <p className="crm-pdash-label">Payment links</p>
          <p className="crm-pdash-value">{s.links.total}</p>
          <p className="crm-pdash-note crm-pdash-chips">
            <span className="crm-pdash-chip is-active">{s.links.active} active</span>
            <span className="crm-pdash-chip is-paid">{s.links.paid} paid</span>
            <span className="crm-pdash-chip is-expired">{s.links.expired} expired</span>
          </p>
        </div>
      </section>

      <section className="crm-pdash-row">
        <div className="crm-card">
          <div className="crm-card-head">
            <h2 className="crm-card-title">Money collected · last 6 months</h2>
            <span className="crm-muted">{m(s.trend.reduce((a, t) => a + t.value, 0))}</span>
          </div>
          <ColumnChart data={s.trend} format={(v) => shortMoney(v, cur)} empty="No payments collected in the last 6 months." />
        </div>
        <div className="crm-card">
          <div className="crm-card-head">
            <h2 className="crm-card-title">Payments by status</h2>
            <span className="crm-muted">{s.count} total</span>
          </div>
          <StackBar
            parts={s.byStatus.map((b) => ({
              key: b.status,
              label: STATUS_PARTS[b.status].label,
              color: STATUS_PARTS[b.status].color,
              count: b.count,
              href: `/crm/payments?status=${b.status}`,
            }))}
          />
        </div>
      </section>

      <section className="crm-pdash-row crm-pdash-row-even">
        <div className="crm-card">
          <div className="crm-card-head">
            <h2 className="crm-card-title">Waiting for payment</h2>
            <span className="crm-muted">{m(s.due)}</span>
          </div>
          {s.dueSoon.length ? (
            <ul className="crm-pdash-list">
              {s.dueSoon.map((d) => {
                const due = dueLabel(d.dueDate);
                return (
                  <li key={d.key}>
                    <span className="crm-pdash-list-text">
                      <span className="crm-strong">{d.client}</span>
                      <span className={`crm-cell-sub${due.late ? " crm-pdash-overdue" : ""}`}>{[d.invoice, due.text].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span className="crm-pdash-list-amt">{m(d.due)}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="crm-muted">Nothing waiting for payment.</p>
          )}
        </div>

        <div className="crm-card">
          <div className="crm-card-head">
            <h2 className="crm-card-title">Latest payments</h2>
            <Link href="/crm/payments" className="crm-dash-more">
              View all
            </Link>
          </div>
          {s.recent.length ? (
            <ul className="crm-pdash-list">
              {s.recent.map((r) => (
                <li key={r.key}>
                  <span className="crm-pdash-list-text">
                    <span className="crm-strong">{r.client}</span>
                    <span className="crm-cell-sub">
                      {r.kind === "link" ? "Payment link" : "Website"}
                      {r.service ? ` · ${r.service}` : ""} · {day(r.at)}
                    </span>
                  </span>
                  <span className="crm-pdash-list-side">
                    <span className="crm-pdash-list-amt">{m(r.amount)}</span>
                    <span className={`crm-pill crm-pill-${r.status}`}>{PAYMENT_STATUS_LABEL[r.status] || r.status}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="crm-muted">No payments yet.</p>
          )}
        </div>
      </section>

      {others.length > 0 && (
        <p className="crm-pdash-foot">
          Figures above are in {cur}. Other currencies:{" "}
          {others.map((o, i) => (
            <span key={o.currency}>
              {i > 0 && " · "}
              {o.currency} {money(o.received, o.currency)} collected, {money(o.due, o.currency)} to collect
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

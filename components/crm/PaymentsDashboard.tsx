import { money } from "@/lib/crm/format";
import type { PaymentStats } from "@/lib/crm/stats";
import { ColumnChart, RankList, Ring, StackBar, shortMoney } from "@/components/crm/DashCharts";

/*
 * Payments overview, shown above the Payments list. Covers website checkout
 * payments and payment links only. Totals are in the main currency.
 */

const STATUS_PARTS: Record<string, { label: string; color: string }> = {
  paid: { label: "Paid", color: "#10b981" },
  partially_paid: { label: "Partially paid", color: "#3b82f6" },
  pending: { label: "Pending", color: "#f59e0b" },
  failed: { label: "Failed", color: "#ef4444" },
  refunded: { label: "Refunded", color: "#94a3b8" },
};

const fmtDue = (iso: string | null) => {
  if (!iso) return "No due date";
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((d.getTime() - today.getTime()) / 86400000);
  const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  if (days < 0) return `Overdue · ${label}`;
  if (days === 0) return "Due today";
  return `Due ${label}`;
};

export default function PaymentsDashboard({ s }: { s: PaymentStats }) {
  const cur = s.currency;
  const m = (v: number) => money(v, cur);
  const delta = s.lastMonth > 0 ? Math.round(((s.month - s.lastMonth) / s.lastMonth) * 100) : null;
  const others = s.byCurrency.slice(1);
  const channelTotal = s.byChannel.website.count + s.byChannel.link.count;

  return (
    <details className="crm-pdash" open>
      <summary className="crm-pdash-summary">
        <span className="crm-pdash-summary-title">Payments overview</span>
        <span className="crm-pdash-summary-note">
          {s.count} {s.count === 1 ? "record" : "records"} · figures in {cur}
        </span>
        <span className="crm-pdash-toggle" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </summary>

      <div className="crm-pdash-body">
        {/* headline numbers in one panel */}
        <section className="crm-pdash-strip">
          <div className="crm-pdash-cell">
            <p className="crm-pdash-label">Collected</p>
            <p className="crm-pdash-value">{m(s.received)}</p>
            <p className="crm-pdash-note">
              {m(s.month)} this month
              {delta !== null && (
                <span className={`crm-pdash-delta ${delta >= 0 ? "is-up" : "is-down"}`}>
                  {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs last month
                </span>
              )}
            </p>
          </div>
          <div className="crm-pdash-cell">
            <p className="crm-pdash-label">Outstanding balance</p>
            <p className="crm-pdash-value">{m(s.due)}</p>
            <p className="crm-pdash-note">
              {s.openCount} open {s.openCount === 1 ? "invoice" : "invoices"}
            </p>
          </div>
          <div className="crm-pdash-cell crm-pdash-cell-ring">
            <div>
              <p className="crm-pdash-label">Collection rate</p>
              <p className="crm-pdash-note">
                {m(s.received)} of {m(s.invoiced)} invoiced
              </p>
            </div>
            <Ring value={s.collectionRate} label="Collection rate" tone="green" />
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
              <h2 className="crm-card-title">Collections · last 6 months</h2>
              <span className="crm-muted">{m(s.trend.reduce((a, t) => a + t.value, 0))}</span>
            </div>
            <ColumnChart data={s.trend} format={(v) => shortMoney(v, cur)} empty="No payments collected in the last 6 months." />
          </div>
          <div className="crm-card">
            <div className="crm-card-head">
              <h2 className="crm-card-title">Payment status</h2>
              <span className="crm-muted">{s.count} total</span>
            </div>
            <StackBar
              parts={s.byStatus.map((b) => ({
                key: b.status,
                label: STATUS_PARTS[b.status].label,
                color: STATUS_PARTS[b.status].color,
                count: b.count,
                note: b.value ? shortMoney(b.value, cur) : undefined,
                href: `/crm/payments?status=${b.status}`,
              }))}
            />
          </div>
        </section>

        <section className="crm-pdash-row crm-pdash-row-3">
          <div className="crm-card">
            <div className="crm-card-head">
              <h2 className="crm-card-title">Top services</h2>
              <span className="crm-muted">by amount collected</span>
            </div>
            <RankList
              items={s.byService.map((x) => ({ label: x.label, value: x.value, note: `${x.count}` }))}
              format={m}
              empty="No services recorded yet."
            />
          </div>

          <div className="crm-card">
            <div className="crm-card-head">
              <h2 className="crm-card-title">Methods &amp; channels</h2>
            </div>
            <RankList items={s.byMethod.map((x) => ({ label: x.label, value: x.value, note: `${x.count}` }))} format={m} empty="No payment methods yet." />
            <div className="crm-pdash-split">
              <div className="crm-pdash-split-bar" aria-hidden="true">
                <span style={{ flexGrow: channelTotal ? s.byChannel.website.count : 1 }} className="is-web" />
                <span style={{ flexGrow: channelTotal ? s.byChannel.link.count : 1 }} className="is-link" />
              </div>
              <div className="crm-pdash-split-legend">
                <span>
                  <i className="is-web" /> Website · {s.byChannel.website.count} · {m(s.byChannel.website.value)}
                </span>
                <span>
                  <i className="is-link" /> Payment links · {s.byChannel.link.count} · {m(s.byChannel.link.value)}
                </span>
              </div>
            </div>
          </div>

          <div className="crm-card">
            <div className="crm-card-head">
              <h2 className="crm-card-title">Open balances</h2>
              <span className="crm-muted">{m(s.due)}</span>
            </div>
            {s.dueSoon.length ? (
              <ul className="crm-pdash-due">
                {s.dueSoon.map((d) => (
                  <li key={d.key}>
                    <span className="crm-pdash-due-text">
                      <span className="crm-strong">{d.client}</span>
                      <span className={`crm-cell-sub${d.dueDate && new Date(d.dueDate) < new Date(new Date().toDateString()) ? " crm-pdash-overdue" : ""}`}>
                        {[d.invoice, fmtDue(d.dueDate)].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className="crm-pdash-due-amt">{m(d.due)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="crm-muted">No open balances.</p>
            )}
          </div>
        </section>

        {others.length > 0 && (
          <p className="crm-pdash-foot">
            Other currencies:{" "}
            {others.map((o, i) => (
              <span key={o.currency}>
                {i > 0 && " · "}
                {o.currency} {money(o.received, o.currency)} collected, {money(o.due, o.currency)} due ({o.count})
              </span>
            ))}
          </p>
        )}
      </div>
    </details>
  );
}

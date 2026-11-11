import Link from "next/link";
import { PAYMENT_STATUS_LABEL, money } from "@/lib/crm/format";
import type { PaymentStats } from "@/lib/crm/stats";
import { ColumnChart, StackBar, shortMoney } from "@/components/crm/DashCharts";
import LocalDateTime from "@/components/crm/LocalDateTime";

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

/** "2026-11" -> the whole month as a Payments-tab date filter */
function monthRange(key: string) {
  const [y, m] = key.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return `from=${key}-01&to=${key}-${String(last).padStart(2, "0")}`;
}

function dueLabel(iso: string | null) {
  if (!iso) return { text: "No due date", late: false };
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const days = Math.round((new Date(iso).getTime() - today.getTime()) / 86400000);
  if (days < 0) return { text: `Overdue · ${day(iso)}`, late: true };
  if (days === 0) return { text: "Due today", late: true };
  return { text: `Due ${day(iso)}`, late: false };
}

export default function PaymentsDashboard({
  s,
  monthLabel,
  isCurrentMonth,
  prevMonthHref,
  curMonthHref,
  nextMonthHref,
}: {
  s: PaymentStats;
  monthLabel?: string;
  isCurrentMonth?: boolean;
  prevMonthHref?: string;
  curMonthHref?: string;
  nextMonthHref?: string;
}) {
  const cur = s.currency;
  const m = (v: number) => money(v, cur);
  const delta = s.lastMonth > 0 ? Math.round(((s.month - s.lastMonth) / s.lastMonth) * 100) : null;
  const others = s.byCurrency.slice(1);
  const activeMonthName = monthLabel || s.selectedMonthLabel || "This Month";

  return (
    <div className="crm-pdash">
      {prevMonthHref && (
        <div className="crm-period" style={{ marginBottom: "1.25rem" }}>
          <span className="crm-period-label">Period</span>
          <Link href={prevMonthHref} className="crm-icon-act crm-period-step" aria-label="Previous month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <Link href={curMonthHref || "#"} className={`crm-period-month${isCurrentMonth ? " is-on" : ""}`}>
            {activeMonthName}
          </Link>
          <Link href={nextMonthHref || "#"} className="crm-icon-act crm-period-step" aria-label="Next month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
          <span className="crm-muted crm-period-count">
            {s.monthPaymentsCount ?? 0} {(s.monthPaymentsCount ?? 0) === 1 ? "payment" : "payments"} in {activeMonthName} ({m(s.month)} collected)
          </span>
        </div>
      )}

      {/* four plain numbers */}
      <section className="crm-pdash-strip">
        <Link
          href="/crm/payments?status=paid"
          className="crm-pdash-cell crm-pdash-cell-link"
          title={`Click to view all paid payments (${m(s.received)} collected)`}
        >
          <p className="crm-pdash-label">Total collected</p>
          <p className="crm-pdash-value">{m(s.received)}</p>
          <p className="crm-pdash-note">
            {s.paidCount} {s.paidCount === 1 ? "payment" : "payments"} received overall &rarr;
          </p>
        </Link>
        <Link
          href={`/crm/payments?status=paid&${monthRange(s.selectedMonthKey)}`}
          className="crm-pdash-cell crm-pdash-cell-link"
          title={`Click to view payments collected in ${activeMonthName}`}
        >
          <p className="crm-pdash-label">{isCurrentMonth ? "This month" : activeMonthName}</p>
          <p className="crm-pdash-value">{m(s.month)}</p>
          <p className="crm-pdash-note">
            {delta === null ? (
              <>Previous month {m(s.lastMonth)} &rarr;</>
            ) : (
              <span className={`crm-pdash-delta ${delta >= 0 ? "is-up" : "is-down"}`}>
                {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs previous month &rarr;
              </span>
            )}
          </p>
        </Link>
        <Link
          href="/crm/payments?status=partially_paid"
          className="crm-pdash-cell crm-pdash-cell-link"
          title={`Click to view all unpaid or partially paid orders (${m(s.due)} due)`}
        >
          <p className="crm-pdash-label">Still to collect</p>
          <p className="crm-pdash-value">{m(s.due)}</p>
          <p className="crm-pdash-note">
            {s.openCount} unpaid or part-paid &rarr;
          </p>
        </Link>
        <div className="crm-pdash-cell">
          <Link
            href="/crm/payments?tab=payment_link"
            className="crm-pdash-cell-link"
            style={{ display: "flex", flexDirection: "column", gap: "6px", textDecoration: "none", color: "inherit" }}
            title="Click to view all payment links"
          >
            <p className="crm-pdash-label">Payment links</p>
            <p className="crm-pdash-value">{s.links.total}</p>
          </Link>
          <p className="crm-pdash-note crm-pdash-chips">
            <Link href="/crm/payments?tab=payment_link&status=pending" className="crm-pdash-chip is-active" title="View active payment links">
              {s.links.active} active
            </Link>
            <Link href="/crm/payments?tab=payment_link&status=paid" className="crm-pdash-chip is-paid" title="View paid payment links">
              {s.links.paid} paid
            </Link>
            <Link href="/crm/payments?tab=payment_link&status=failed" className="crm-pdash-chip is-expired" title="View expired payment links">
              {s.links.expired} expired
            </Link>
          </p>
        </div>
      </section>

      <section className="crm-pdash-row">
        <div className="crm-card">
          <div className="crm-card-head">
            <h2 className="crm-card-title">Money collected · 6-month trend</h2>
            <Link href={`/crm/payments?status=paid&${monthRange(s.selectedMonthKey)}`} className="crm-dash-more" title="View this month's payments">
              {m(s.trend.reduce((a, t) => a + t.value, 0))} total
            </Link>
          </div>
          <ColumnChart
            data={s.trend.map((t) => ({
              ...t,
              href: `?month=${t.key}&${monthRange(t.key)}`,
            }))}
            format={(v) => shortMoney(v, cur)}
            empty="No payments collected in this period."
          />
        </div>
        <div className="crm-card">
          <div className="crm-card-head">
            <h2 className="crm-card-title">Payments by status · {activeMonthName}</h2>
            <span className="crm-muted">{s.monthPaymentsCount ?? s.count} in period</span>
          </div>
          <StackBar
            parts={s.byStatus.map((b) => ({
              key: b.status,
              label: STATUS_PARTS[b.status].label,
              color: STATUS_PARTS[b.status].color,
              count: b.count,
              href: `/crm/payments?status=${b.status}&${monthRange(s.selectedMonthKey)}`,
            }))}
          />
        </div>
      </section>

      <section className="crm-pdash-row crm-pdash-row-even">
        <div className="crm-card">
          <div className="crm-card-head">
            <h2 className="crm-card-title">Waiting for payment</h2>
            <Link href="/crm/payments?status=partially_paid" className="crm-dash-more" title="View all waiting payments">
              View all ({m(s.due)})
            </Link>
          </div>
          {s.dueSoon.length ? (
            <ul className="crm-pdash-list">
              {s.dueSoon.map((d) => {
                const due = dueLabel(d.dueDate);
                return (
                  <li key={d.key}>
                    <Link href={d.href} className="crm-pdash-list-link">
                      <span className="crm-pdash-list-text">
                        <span className="crm-strong">{d.client}</span>
                        <span className={`crm-cell-sub${due.late ? " crm-pdash-overdue" : ""}`}>{[d.invoice, due.text].filter(Boolean).join(" · ")}</span>
                      </span>
                      <span className="crm-pdash-list-amt">{m(d.due)}</span>
                    </Link>
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
            <h2 className="crm-card-title">Payments in {activeMonthName}</h2>
            <Link href={`/crm/payments?${monthRange(s.selectedMonthKey)}`} className="crm-dash-more">
              View all
            </Link>
          </div>
          {s.recent.length ? (
            <ul className="crm-pdash-list">
              {s.recent.map((r) => (
                <li key={r.key}>
                  <Link href={r.href} className="crm-pdash-list-link">
                    <span className="crm-pdash-list-text">
                      <span className="crm-strong">{r.client}</span>
                      <span className="crm-cell-sub">
                        {r.kind === "link" ? "Payment link" : "Website"}
                        {r.service ? ` · ${r.service}` : ""} · <LocalDateTime iso={r.at} />
                      </span>
                    </span>
                    <span className="crm-pdash-list-side">
                      <span className="crm-pdash-list-amt">{m(r.amount)}</span>
                      <span className={`crm-pill crm-pill-${r.status}`}>{PAYMENT_STATUS_LABEL[r.status] || r.status}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="crm-muted">No payments in {activeMonthName}.</p>
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

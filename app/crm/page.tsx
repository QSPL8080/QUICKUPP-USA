import Link from "next/link";
import { requireUser } from "@/lib/crm/auth";
import { SOURCES, dashboardStats } from "@/lib/crm/data";
import { PageHead } from "@/components/crm/ListTools";
import { money } from "@/lib/crm/format";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default async function CrmDashboard() {
  const user = await requireUser();
  const { perSource, recent, payments } = await dashboardStats();
  const totalNew = perSource.reduce((a, s) => a + s.fresh, 0);
  const totalAll = perSource.reduce((a, s) => a + s.total, 0);
  const totalMonth = perSource.reduce((a, s) => a + s.month, 0);
  const max = Math.max(1, ...perSource.map((s) => s.total));
  const main = payments[0];

  return (
    <>
      <PageHead title={`Welcome back, ${user.name.split(" ")[0]}`} sub="Here’s what’s happening across your enquiries and payments." />

      <section className="crm-kpis">
        <div className="crm-kpi crm-kpi-accent">
          <p className="crm-kpi-label">New enquiries</p>
          <p className="crm-kpi-value">{totalNew}</p>
          <p className="crm-kpi-note">Waiting for a reply</p>
        </div>
        <div className="crm-kpi">
          <p className="crm-kpi-label">This month</p>
          <p className="crm-kpi-value">{totalMonth}</p>
          <p className="crm-kpi-note">Enquiries received</p>
        </div>
        <div className="crm-kpi">
          <p className="crm-kpi-label">Received this month</p>
          <p className="crm-kpi-value">{main ? money(main.month, main.currency) : money(0, "USD")}</p>
          <p className="crm-kpi-note">{main ? `${main.currency} payments` : "No payments yet"}</p>
        </div>
        <div className="crm-kpi">
          <p className="crm-kpi-label">Pending payments</p>
          <p className="crm-kpi-value">{main ? money(main.pending, main.currency) : money(0, "USD")}</p>
          <p className="crm-kpi-note">Awaiting payment</p>
        </div>
      </section>

      <section className="crm-grid-2">
        <div className="crm-card">
          <div className="crm-card-head">
            <h2 className="crm-card-title">Enquiries by form</h2>
            <span className="crm-muted">{totalAll} total</span>
          </div>
          <ul className="crm-bars">
            {perSource.map((s) => (
              <li key={s.key}>
                <Link href={s.href} className="crm-bar-row">
                  <span className="crm-bar-label">{s.label}</span>
                  <span className="crm-bar-track">
                    <span className="crm-bar-fill" style={{ width: `${(s.total / max) * 100}%` }} />
                  </span>
                  <span className="crm-bar-num">{s.total}</span>
                  {s.fresh > 0 && <span className="crm-nav-badge">{s.fresh} new</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="crm-card">
          <div className="crm-card-head">
            <h2 className="crm-card-title">Latest enquiries</h2>
          </div>
          {recent.length ? (
            <ul className="crm-recent">
              {recent.map((r) => (
                <li key={`${r.source}-${r.id}`}>
                  <Link href={SOURCES[r.source].href} className="crm-recent-row">
                    <span className="crm-avatar crm-avatar-soft" aria-hidden="true">{r.name.slice(0, 1).toUpperCase()}</span>
                    <span className="crm-recent-text">
                      <span className="crm-strong">{r.name}</span>
                      <span className="crm-cell-sub">{SOURCES[r.source].short} · {fmt(r.createdAt)}</span>
                    </span>
                    <span className={`crm-pill crm-pill-${r.status}`}>{r.status[0].toUpperCase() + r.status.slice(1)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="crm-muted">No enquiries yet.</p>
          )}
        </div>
      </section>

      <section className="crm-card">
        <div className="crm-card-head">
          <h2 className="crm-card-title">Payments overview</h2>
          <Link href="/crm/payments?new=1" className="crm-act crm-act-dark crm-act-sm">
            Add payment
          </Link>
        </div>
        {payments.length ? (
          <div className="crm-table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Currency</th>
                  <th className="crm-right">Received</th>
                  <th className="crm-right">This month</th>
                  <th className="crm-right">Pending</th>
                  <th className="crm-right">Entries</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.currency}>
                    <td className="crm-strong">{p.currency}</td>
                    <td className="crm-right">{money(p.received, p.currency)}</td>
                    <td className="crm-right">{money(p.month, p.currency)}</td>
                    <td className="crm-right">{money(p.pending, p.currency)}</td>
                    <td className="crm-right">{p.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="crm-muted">No payments recorded yet.</p>
        )}
      </section>
    </>
  );
}

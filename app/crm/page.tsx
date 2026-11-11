import Link from "next/link";
import { requireArea } from "@/lib/crm/auth";
import { crmOverview, paymentStats } from "@/lib/crm/stats";
import { ENQUIRY_STATUS_LABEL, type EnquiryStatus } from "@/lib/crm/leadOptions";
import { APPLICATION_STATUS_LABEL, type ApplicationStatus } from "@/lib/applications";
import { PAYMENT_STATUS_LABEL, money } from "@/lib/crm/format";
import { PageHead } from "@/components/crm/ListTools";
import { ColumnChart, RankList, Ring, StackBar } from "@/components/crm/DashCharts";

/*
 * CRM Dashboard: one view of the whole CRM — leads, project progress,
 * payments, careers, team and the latest activity.
 */

const LEAD_COLORS: Record<string, string> = {
  new: "#6366f1",
  contacted: "#f59e0b",
  in_progress: "#06b6d4",
  on_hold: "#94a3b8",
  closed: "#10b981",
};
const CHANNEL_COLORS: Record<string, string> = { Website: "#4f46e5", Manual: "#0ea5e9", Meta: "#a855f7" };
const APP_COLORS: Record<string, string> = {
  new: "#6366f1",
  reviewing: "#f59e0b",
  shortlisted: "#06b6d4",
  rejected: "#94a3b8",
  hired: "#10b981",
};

const ago = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const TYPE_LABEL = { lead: "Lead", application: "Application", payment: "Payment" } as const;

function statusLabel(type: "lead" | "application" | "payment", s: string) {
  if (type === "lead") return ENQUIRY_STATUS_LABEL[s as EnquiryStatus] || s;
  if (type === "application") return APPLICATION_STATUS_LABEL[s as ApplicationStatus] || s;
  return PAYMENT_STATUS_LABEL[s] || s;
}

function monthRange(key: string) {
  const [y, m] = key.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const from = `${key}-01`;
  const to = `${key}-${String(lastDay).padStart(2, "0")}`;
  return `from=${from}&to=${to}`;
}

export default async function CrmDashboard() {
  const user = await requireArea("dashboard");
  const [o, p] = await Promise.all([crmOverview(), paymentStats()]);
  const cur = p.currency;
  const maxSource = Math.max(1, ...o.perSource.map((s) => s.total));
  const projectTotal = o.byProject.reduce((a, b) => a + b.count, 0);

  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonthRange = monthRange(thisMonthKey);
  const isSuper = user.role === "super_admin";

  return (
    <>
      <PageHead title={`Welcome back, ${user.name.split(" ")[0]}`} sub="An overview of leads, projects, payments, careers and your team." />

      {/* headline numbers */}
      <section className="crm-kpis crm-dash-kpis">
        <Link href="/crm/enquiries" className="crm-kpi crm-kpi-accent crm-dash-kpi" title="View all enquiries">
          <p className="crm-kpi-label">Total leads</p>
          <p className="crm-kpi-value">{o.totals.leads}</p>
          <p className="crm-kpi-note">
            {o.totals.week} this week · {o.totals.month} this month
          </p>
        </Link>
        <Link href="/crm/enquiries?status=new" className="crm-kpi crm-dash-kpi" title="View new leads awaiting reply">
          <p className="crm-kpi-label">Awaiting reply</p>
          <p className="crm-kpi-value">{o.totals.fresh}</p>
          <p className="crm-kpi-note">New leads not yet contacted</p>
        </Link>
        <Link href={`/crm/payments?status=paid&${thisMonthRange}`} className="crm-kpi crm-dash-kpi" title="View payments collected this month">
          <p className="crm-kpi-label">Collected this month</p>
          <p className="crm-kpi-value">{money(p.month, cur)}</p>
          <p className="crm-kpi-note">{money(p.due, cur)} outstanding</p>
        </Link>
        <Link href="/crm/applications" className="crm-kpi crm-dash-kpi" title="View job applications">
          <p className="crm-kpi-label">Job applications</p>
          <p className="crm-kpi-value">{o.applications.total}</p>
          <p className="crm-kpi-note">
            {o.applications.week} this week · {o.jobs.live} live {o.jobs.live === 1 ? "opening" : "openings"}
          </p>
        </Link>
      </section>

      {/* leads */}
      <section className="crm-dash-row">
        <div className="crm-card">
          <div className="crm-card-head">
            <h2 className="crm-card-title">New leads · last 6 months</h2>
            <span className="crm-muted">{o.leadTrend.reduce((a, t) => a + t.value, 0)} leads</span>
          </div>
          <ColumnChart
            data={o.leadTrend.map((t) => ({
              ...t,
              href: `/crm/enquiries?${monthRange(t.key)}`,
            }))}
            empty="No leads in the last 6 months."
          />
        </div>
        <div className="crm-card">
          <div className="crm-card-head">
            <h2 className="crm-card-title">Lead pipeline</h2>
            <Link href="/crm/enquiries" className="crm-dash-more">
              All enquiries
            </Link>
          </div>
          <StackBar
            parts={o.byStatus.map((b) => ({
              key: b.status,
              label: ENQUIRY_STATUS_LABEL[b.status],
              color: LEAD_COLORS[b.status],
              count: b.count,
              href: `/crm/enquiries?status=${b.status}`,
            }))}
          />
        </div>
      </section>

      <section className="crm-dash-row crm-dash-row-3">
        <div className="crm-card">
          <div className="crm-card-head">
            <h2 className="crm-card-title">Leads by form</h2>
            <span className="crm-muted">{o.totals.leads} total</span>
          </div>
          <ul className="crm-bars crm-dash-bars">
            {o.perSource.map((s) => (
              <li key={s.key}>
                <Link href={s.href} className="crm-bar-row">
                  <span className="crm-bar-label">{s.label}</span>
                  <span className="crm-bar-track">
                    <span className="crm-bar-fill" style={{ width: `${(s.total / maxSource) * 100}%` }} />
                  </span>
                  <span className="crm-bar-num">{s.total}</span>
                  {s.fresh > 0 ? <span className="crm-nav-badge">{s.fresh} new</span> : <span />}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="crm-card">
          <div className="crm-card-head">
            <h2 className="crm-card-title">Lead source</h2>
          </div>
          <StackBar
            parts={o.byChannel.map((c) => ({
              key: c.label,
              label: c.label,
              color: CHANNEL_COLORS[c.label] || "#4f46e5",
              count: c.count,
              href: c.label === "Website"
                ? "/crm/enquiries?channel=Website"
                : `/crm/enquiries?source=manual&channel=${encodeURIComponent(c.label)}`,
            }))}
          />
        </div>

        <div className="crm-card">
          <div className="crm-card-head">
            <h2 className="crm-card-title">Project status</h2>
            <span className="crm-muted">{projectTotal} leads</span>
          </div>
          <RankList
            items={o.byProject.map((b) => ({
              label: b.status,
              value: b.count,
              href: `/crm/enquiries?projectStatus=${encodeURIComponent(b.status)}`,
            }))}
            empty="No projects yet."
          />
        </div>
      </section>

      {/* payments, careers, team */}
      <section className="crm-dash-row crm-dash-row-3">
        <div className="crm-card crm-dash-panel">
          <div className="crm-card-head">
            <h2 className="crm-card-title">Payments</h2>
            <Link href="/crm/payments" className="crm-dash-more">
              Open payments
            </Link>
          </div>
          <Link href="/crm/payments?status=paid" className="crm-dash-pay crm-dash-pay-link" title="Click to view collected payments">
            <Ring value={p.collectionRate} label="Collection rate" tone="green" />
            <div>
              <p className="crm-dash-big">{money(p.received, cur)}</p>
              <p className="crm-cell-sub">collected · {p.collectionRate}% of {money(p.invoiced, cur)} invoiced &rarr;</p>
            </div>
          </Link>
          <dl className="crm-dash-facts">
            <Link href="/crm/payments?status=partially_paid" className="crm-dash-fact-link" title="View outstanding / partially paid payments">
              <dt>Outstanding</dt>
              <dd>{money(p.due, cur)}</dd>
            </Link>
            <Link href="/crm/payments?status=pending" className="crm-dash-fact-link" title="View open pending invoices">
              <dt>Open invoices</dt>
              <dd>{p.openCount}</dd>
            </Link>
            <Link href="/crm/payments?tab=payment_link&status=pending" className="crm-dash-fact-link" title="View active payment links">
              <dt>Active links</dt>
              <dd>{p.links.active}</dd>
            </Link>
            <Link href={`/crm/payments?status=paid&${thisMonthRange}`} className="crm-dash-fact-link" title="View payments collected this month">
              <dt>This month</dt>
              <dd>{money(p.month, cur)}</dd>
            </Link>
          </dl>
        </div>

        <div className="crm-card crm-dash-panel">
          <div className="crm-card-head">
            <h2 className="crm-card-title">Careers</h2>
            <Link href="/crm/jobs" className="crm-dash-more">
              Job openings
            </Link>
          </div>
          <dl className="crm-dash-facts crm-dash-facts-3">
            <Link href="/crm/jobs?status=live" className="crm-dash-fact-link" title="View live job openings">
              <dt>Live</dt>
              <dd>{o.jobs.live}</dd>
            </Link>
            <Link href="/crm/jobs?status=closed" className="crm-dash-fact-link" title="View closed job openings">
              <dt>Closed</dt>
              <dd>{o.jobs.closed}</dd>
            </Link>
            <Link href="/crm/jobs?status=expired" className="crm-dash-fact-link" title="View expired job openings">
              <dt>Expired</dt>
              <dd>{o.jobs.expired}</dd>
            </Link>
          </dl>
          <StackBar
            parts={o.applications.byStatus.map((b) => ({
              key: b.status,
              label: APPLICATION_STATUS_LABEL[b.status],
              color: APP_COLORS[b.status],
              count: b.count,
              href: `/crm/applications?status=${b.status}`,
            }))}
          />
        </div>

        <div className="crm-card crm-dash-panel">
          <div className="crm-card-head">
            <h2 className="crm-card-title">Team &amp; content</h2>
            {isSuper && (
              <Link href="/crm/users" className="crm-dash-more">
                Manage team
              </Link>
            )}
          </div>
          <dl className="crm-dash-facts">
            {isSuper ? (
              <Link href="/crm/users" className="crm-dash-fact-link" title="View active team members">
                <dt>Active users</dt>
                <dd>
                  {o.team.active}
                  <span className="crm-dash-of"> / {o.team.total}</span>
                </dd>
              </Link>
            ) : (
              <div>
                <dt>Active users</dt>
                <dd>
                  {o.team.active}
                  <span className="crm-dash-of"> / {o.team.total}</span>
                </dd>
              </div>
            )}
            {isSuper ? (
              <Link href="/crm/users" className="crm-dash-fact-link" title="View team members signed in this week">
                <dt>Signed in this week</dt>
                <dd>{o.team.recent}</dd>
              </Link>
            ) : (
              <div>
                <dt>Signed in this week</dt>
                <dd>{o.team.recent}</dd>
              </div>
            )}
            {isSuper ? (
              <Link href="/crm/users" className="crm-dash-fact-link" title="View super admins">
                <dt>Super admins</dt>
                <dd>{o.team.supers}</dd>
              </Link>
            ) : (
              <div>
                <dt>Super admins</dt>
                <dd>{o.team.supers}</dd>
              </div>
            )}
            <Link href="/crm/blogs" className="crm-dash-fact-link" title="View published blogs">
              <dt>Published blogs</dt>
              <dd>
                {o.blogs.live}
                <span className="crm-dash-of"> / {o.blogs.total}</span>
              </dd>
            </Link>
          </dl>
          {o.topJobs.length > 0 && (
            <>
              <p className="crm-dash-subhead">Most applied roles</p>
              <RankList
                items={o.topJobs.map((j) => ({
                  label: j.label,
                  value: j.count,
                  href: `/crm/applications?q=${encodeURIComponent(j.label)}`,
                }))}
              />
            </>
          )}
        </div>
      </section>

      {/* latest activity */}
      <section className="crm-card">
        <div className="crm-card-head">
          <h2 className="crm-card-title">Recent activity</h2>
          <span className="crm-muted">Leads, applications and payments</span>
        </div>
        {o.activity.length ? (
          <ul className="crm-dash-feed">
            {o.activity.map((a) => (
              <li key={a.key}>
                <Link href={a.href} className="crm-dash-feed-row">
                  <span className={`crm-dash-feed-icon is-${a.type}`} aria-hidden="true">
                    {a.type === "lead" ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16v12H5.2L4 17.2V4z" />
                      </svg>
                    ) : a.type === "application" ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="7" width="18" height="13" rx="2" />
                        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <path d="M2 10h20" />
                      </svg>
                    )}
                  </span>
                  <span className="crm-recent-text">
                    <span className="crm-strong">{a.title}</span>
                    <span className="crm-cell-sub">
                      {TYPE_LABEL[a.type]} · {a.sub}
                      {"amount" in a && a.amount ? ` · ${money(a.amount, a.currency)}` : ""}
                    </span>
                  </span>
                  <span className={`crm-pill crm-pill-${a.status}`}>{statusLabel(a.type, a.status)}</span>
                  <span className="crm-dash-feed-time">{ago(a.at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="crm-muted">No activity yet.</p>
        )}
      </section>
    </>
  );
}

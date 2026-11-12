import { requireArea } from "@/lib/crm/auth";
import { CURRENCIES, PAYMENT_METHODS, PAYMENT_SERVICES, PAYMENT_STATUSES, listPayments } from "@/lib/crm/data";
import PaymentsView from "@/components/crm/PaymentsView";
import { monthPeriod, viewerTimeZone } from "@/lib/crm/crmTime";
import { getPool } from "@/lib/db";
import LocalDateTime from "@/components/crm/LocalDateTime";

/** The last deletions of payments and payment links (super admin only): what, who and when */
async function recentDeletions() {
  const [rows] = await getPool()
    .query(
      `SELECT id, entity_type, message, actor_name, actor_role, UNIX_TIMESTAMP(created_at) AS ts
         FROM crm_activity WHERE action = 'deleted' AND entity_type IN ('payment', 'payment_link')
        ORDER BY created_at DESC, id DESC LIMIT 20`
    )
    .catch(() => [[]]);
  return (rows as { id: number; entity_type: string; message: string; actor_name: string | null; ts: number }[]).map((r) => ({ ...r, at: new Date(Number(r.ts) * 1000).toISOString() }));
}

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    tab?: "website" | "payment_link" | "all";
    page?: string;
    new?: string;
    from?: string;
    to?: string;
    open?: string;
  }>;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function PaymentsPage({ searchParams }: Props) {
  const user = await requireArea("payments");
  const sp = await searchParams;
  const q = sp.q || "";
  const status = sp.status || "";
  const tab = (sp.tab as "website" | "payment_link" | "all") || "all";
  const from = DATE_RE.test(sp.from || "") ? sp.from! : "";
  const to = DATE_RE.test(sp.to || "") ? sp.to! : "";

  const tz = await viewerTimeZone();
  const data = await listPayments({ q, status, tab, page: Number(sp.page) || 1, from, to, tz });

  // month links: the month shown in the date filter (or this month), and the ones either side
  const period = monthPeriod(from, to, tz);
  const isWholeMonth = period.isWholeMonth;

  const monthHref = (offset: number) => {
    const r = period.range(offset);
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    if (tab && tab !== "all") p.set("tab", tab);
    p.set("from", r.from);
    p.set("to", r.to);
    return `?${p.toString()}`;
  };
  const monthLabel = period.label;
  const filtered = Boolean(q || status || from || to);
  const deletions = user.role === "super_admin" ? await recentDeletions() : [];

  return (
    <>
    <PaymentsView
      rows={data.items}
      openNew={sp.new === "1"}
      openId={Number(sp.open) || undefined}
      userRole={user.role === "super_admin" ? "super_admin" : "admin"}
      options={{ services: PAYMENT_SERVICES, methods: PAYMENT_METHODS, currencies: CURRENCIES, statuses: PAYMENT_STATUSES }}
      q={q}
      status={status}
      currentTab={tab}
      from={from}
      to={to}
      monthLabel={monthLabel}
      isWholeMonth={isWholeMonth}
      prevMonthHref={monthHref(-1)}
      curMonthHref={monthHref(0)}
      nextMonthHref={monthHref(1)}
      filtered={filtered}
      counts={data.counts}
      total={data.total}
      page={data.page}
      pages={data.pages}
      pageSize={data.pageSize}
    />
    {user.role === "super_admin" && (
      <details className="crm-card crm-deleted-log">
        <summary>
          <span className="crm-card-title">Deleted payments</span>
          <span className="crm-muted">{deletions.length ? `Last ${deletions.length} · who deleted what, and when` : "Nothing deleted yet"}</span>
        </summary>
        {deletions.length > 0 && (
          <ul>
            {deletions.map((d) => (
              <li key={d.id}>
                <span className="crm-deleted-what">{d.message}</span>
                <span className="crm-cell-sub">
                  <LocalDateTime iso={d.at} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </details>
    )}
    </>
  );
}

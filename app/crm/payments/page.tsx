import { requireArea } from "@/lib/crm/auth";
import { CURRENCIES, PAYMENT_METHODS, PAYMENT_SERVICES, PAYMENT_STATUSES, listPayments } from "@/lib/crm/data";
import PaymentsView from "@/components/crm/PaymentsView";
import { monthPeriod, viewerTimeZone } from "@/lib/crm/crmTime";

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

  return (
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
  );
}

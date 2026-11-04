import { requireUser } from "@/lib/crm/auth";
import { CURRENCIES, PAYMENT_METHODS, PAYMENT_SERVICES, PAYMENT_STATUSES, listPayments } from "@/lib/crm/data";
import PaymentsView from "@/components/crm/PaymentsView";

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    tab?: "website" | "payment_link" | "all";
    page?: string;
    new?: string;
    from?: string;
    to?: string;
  }>;
};

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function PaymentsPage({ searchParams }: Props) {
  const user = await requireUser();
  const sp = await searchParams;
  const q = sp.q || "";
  const status = sp.status || "";
  const tab = (sp.tab as "website" | "payment_link" | "all") || "all";
  const from = DATE_RE.test(sp.from || "") ? sp.from! : "";
  const to = DATE_RE.test(sp.to || "") ? sp.to! : "";

  const data = await listPayments({ q, status, tab, page: Number(sp.page) || 1, from, to });

  // month links: the month shown in the date filter (or this month), and the ones either side
  const base = from ? new Date(`${from}T00:00:00`) : new Date();
  const monthStart = new Date(base.getFullYear(), base.getMonth(), 1);
  const isWholeMonth = from === ymd(monthStart) && to === ymd(new Date(base.getFullYear(), base.getMonth() + 1, 0));

  const monthHref = (offset: number) => {
    const s = new Date(monthStart.getFullYear(), monthStart.getMonth() + offset, 1);
    const e = new Date(s.getFullYear(), s.getMonth() + 1, 0);
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    if (tab && tab !== "all") p.set("tab", tab);
    p.set("from", ymd(s));
    p.set("to", ymd(e));
    return `?${p.toString()}`;
  };
  const monthLabel = monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const filtered = Boolean(q || status || (tab && tab !== "all") || from || to);

  return (
    <PaymentsView
      rows={data.items}
      openNew={sp.new === "1"}
      userRole={user.role}
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

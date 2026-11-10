import Link from "next/link";
import { requireArea } from "@/lib/crm/auth";
import { paymentStats } from "@/lib/crm/stats";
import { PageHead } from "@/components/crm/ListTools";
import PaymentsDashboard from "@/components/crm/PaymentsDashboard";

type Props = {
  searchParams: Promise<{
    month?: string;
    from?: string;
    to?: string;
  }>;
};

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;

export default async function PaymentsDashboardPage({ searchParams }: Props) {
  await requireArea("payments");
  const sp = await searchParams;

  const rawMonth = sp.month && MONTH_RE.test(sp.month)
    ? sp.month
    : sp.from && DATE_RE.test(sp.from)
      ? sp.from.slice(0, 7)
      : "";

  const base = rawMonth ? new Date(`${rawMonth}-01T00:00:00`) : new Date();
  const targetMonth = new Date(base.getFullYear(), base.getMonth(), 1);
  const monthLabel = targetMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const isCurrentMonth =
    targetMonth.getFullYear() === new Date().getFullYear() &&
    targetMonth.getMonth() === new Date().getMonth();

  const monthHref = (offset: number) => {
    const d = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + offset, 1);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const s = new Date(d.getFullYear(), d.getMonth(), 1);
    const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return `?month=${m}&from=${ymd(s)}&to=${ymd(e)}`;
  };

  const stats = await paymentStats({ targetMonth });

  return (
    <>
      <PageHead title="Payments Dashboard" sub="Website payments and payment links at a glance.">
        <Link href="/crm/payments" className="crm-act crm-act-dark">
          View all payments
        </Link>
      </PageHead>
      <PaymentsDashboard
        s={stats}
        monthLabel={monthLabel}
        isCurrentMonth={isCurrentMonth}
        prevMonthHref={monthHref(-1)}
        curMonthHref={monthHref(0)}
        nextMonthHref={monthHref(1)}
      />
    </>
  );
}

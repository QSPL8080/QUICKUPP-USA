import { requireUser } from "@/lib/crm/auth";
import { CURRENCIES, PAYMENT_METHODS, PAYMENT_SERVICES, PAYMENT_STATUSES, listPayments } from "@/lib/crm/data";
import PaymentsView from "@/components/crm/PaymentsView";
import PaymentsDashboard from "@/components/crm/PaymentsDashboard";
import { paymentStats } from "@/lib/crm/stats";

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    tab?: "website" | "payment_link" | "all";
    page?: string;
    new?: string;
  }>;
};

export default async function PaymentsPage({ searchParams }: Props) {
  const user = await requireUser();
  const sp = await searchParams;
  const q = sp.q || "";
  const status = sp.status || "";
  const tab = (sp.tab as "website" | "payment_link" | "all") || "all";
  const [data, stats] = await Promise.all([listPayments({ q, status, tab, page: Number(sp.page) || 1 }), paymentStats()]);
  return (
    <PaymentsView
      rows={data.items}
      openNew={sp.new === "1"}
      userRole={user.role}
      options={{ services: PAYMENT_SERVICES, methods: PAYMENT_METHODS, currencies: CURRENCIES, statuses: PAYMENT_STATUSES }}
      q={q}
      status={status}
      currentTab={tab}
      counts={data.counts}
      total={data.total}
      page={data.page}
      pages={data.pages}
      pageSize={data.pageSize}
      overview={<PaymentsDashboard s={stats} />}
    />
  );
}

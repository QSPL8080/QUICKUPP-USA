import { requireUser } from "@/lib/crm/auth";
import { CURRENCIES, PAYMENT_METHODS, PAYMENT_SERVICES, PAYMENT_STATUSES, listPayments } from "@/lib/crm/data";
import PaymentsView from "@/components/crm/PaymentsView";

type Props = { searchParams: Promise<{ q?: string; status?: string; page?: string; new?: string }> };

export default async function PaymentsPage({ searchParams }: Props) {
  await requireUser();
  const sp = await searchParams;
  const q = sp.q || "";
  const status = sp.status || "";
  const data = await listPayments({ q, status, page: Number(sp.page) || 1 });
  return (
    <PaymentsView
      rows={data.items}
      openNew={sp.new === "1"}
      options={{ services: PAYMENT_SERVICES, methods: PAYMENT_METHODS, currencies: CURRENCIES, statuses: PAYMENT_STATUSES }}
      q={q}
      status={status}
      total={data.total}
      page={data.page}
      pages={data.pages}
      pageSize={data.pageSize}
    />
  );
}

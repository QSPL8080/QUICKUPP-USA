import { isSuperAdmin, requireUser } from "@/lib/crm/auth";
import { CURRENCIES, PAYMENT_METHODS, PAYMENT_SERVICES, PAYMENT_STATUSES, listPayments } from "@/lib/crm/data";
import PaymentsView from "@/components/crm/PaymentsView";
import { PAYMENT_STATUS_LABEL } from "@/lib/crm/format";
import { Filters, PageHead, Pager } from "@/components/crm/ListTools";

type Props = { searchParams: Promise<{ q?: string; status?: string; page?: string; new?: string }> };

export default async function PaymentsPage({ searchParams }: Props) {
  const user = await requireUser();
  const sp = await searchParams;
  const q = sp.q || "";
  const status = sp.status || "";
  const data = await listPayments({ q, status, page: Number(sp.page) || 1 });
  return (
    <>
      <PageHead title="Payments" sub="Record payments by hand and keep track of what's paid and pending." />
      <Filters q={q} status={status} placeholder="Search client, email, company, invoice or reference" statuses={PAYMENT_STATUSES.map((s) => ({ value: s, label: PAYMENT_STATUS_LABEL[s] }))} />
      <div className="crm-card crm-card-flush">
        <PaymentsView
          rows={data.items}
          canDelete={isSuperAdmin(user)}
          openNew={sp.new === "1"}
          options={{ services: PAYMENT_SERVICES, methods: PAYMENT_METHODS, currencies: CURRENCIES, statuses: PAYMENT_STATUSES }}
        />
        <Pager {...data} q={q} status={status} />
      </div>
    </>
  );
}

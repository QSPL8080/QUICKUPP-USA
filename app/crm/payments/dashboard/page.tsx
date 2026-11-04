import Link from "next/link";
import { requireUser } from "@/lib/crm/auth";
import { paymentStats } from "@/lib/crm/stats";
import { PageHead } from "@/components/crm/ListTools";
import PaymentsDashboard from "@/components/crm/PaymentsDashboard";

export default async function PaymentsDashboardPage() {
  await requireUser();
  const stats = await paymentStats();
  return (
    <>
      <PageHead title="Payments Dashboard" sub="Website payments and payment links at a glance.">
        <Link href="/crm/payments" className="crm-act crm-act-dark">
          View all payments
        </Link>
      </PageHead>
      <PaymentsDashboard s={stats} />
    </>
  );
}

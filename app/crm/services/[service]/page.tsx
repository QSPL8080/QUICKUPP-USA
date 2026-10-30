import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/crm/auth";
import { ENQUIRY_STATUSES, SOURCES, listEnquiries } from "@/lib/crm/data";
import { isServiceFormKey, SERVICE_FORMS, type ServiceFormKey } from "@/lib/formOptions";
import EnquiryTable from "@/components/crm/EnquiryTable";
import { Filters, PageHead, Pager } from "@/components/crm/ListTools";

type Props = {
  params: Promise<{ service: string }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
};

export default async function ServiceFormPage({ params, searchParams }: Props) {
  await requireUser();
  const { service } = await params;
  if (!isServiceFormKey(service)) notFound();
  const sp = await searchParams;
  const q = sp.q || "";
  const status = sp.status || "";
  const data = await listEnquiries(service, { q, status, page: Number(sp.page) || 1 });
  const keys = Object.keys(SERVICE_FORMS) as ServiceFormKey[];

  return (
    <>
      <PageHead title="Service Forms" sub="Enquiries sent from each service's subpages." />
      <nav className="crm-tabs" aria-label="Service forms">
        {keys.map((k) => (
          <Link key={k} href={SOURCES[k].href} className={`crm-tab${k === service ? " is-on" : ""}`} aria-current={k === service ? "page" : undefined}>
            {SOURCES[k].short}
          </Link>
        ))}
      </nav>
      <Filters q={q} status={status} placeholder="Search name, email, phone or company" statuses={ENQUIRY_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))} />
      <div className="crm-card crm-card-flush">
        <EnquiryTable source={service} rows={data.items} interestLabel="Category" />
        <Pager {...data} q={q} status={status} />
      </div>
    </>
  );
}

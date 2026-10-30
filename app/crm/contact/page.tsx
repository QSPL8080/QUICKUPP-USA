import { requireUser } from "@/lib/crm/auth";
import { ENQUIRY_STATUSES, listEnquiries } from "@/lib/crm/data";
import EnquiryTable from "@/components/crm/EnquiryTable";
import { Filters, PageHead, Pager } from "@/components/crm/ListTools";

type Props = { searchParams: Promise<{ q?: string; status?: string; page?: string }> };

export default async function ContactEnquiriesPage({ searchParams }: Props) {
  await requireUser();
  const sp = await searchParams;
  const q = sp.q || "";
  const status = sp.status || "";
  const data = await listEnquiries("contact", { q, status, page: Number(sp.page) || 1 });
  return (
    <>
      <PageHead title="Contact Enquiries" sub="Submissions from the Contact page form." />
      <Filters q={q} status={status} placeholder="Search name, email, phone or company" statuses={ENQUIRY_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))} />
      <div className="crm-card crm-card-flush">
        <EnquiryTable source="contact" rows={data.items} interestLabel="Subject / Service" />
        <Pager {...data} q={q} status={status} />
      </div>
    </>
  );
}

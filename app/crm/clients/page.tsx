import Link from "next/link";
import { isAdminLike, leadPermsFor, requireArea } from "@/lib/crm/auth";
import { auditViewerView } from "@/lib/crm/audit";
import { listClients } from "@/lib/crm/clients";
import ClientsView from "@/components/crm/ClientsView";
import { PageHead, Pager } from "@/components/crm/ListTools";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string; from?: string; to?: string; page?: string; open?: string }> };
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/*
 * Clients: every lead that has paid (a deposit or in full), when it became a
 * client, its payments and what is still due (with the balance link), and its
 * documents (quotation, NDA…). Admins, the Super Admin and the Accountant work
 * here; Viewers look.
 */
export default async function ClientsPage({ searchParams }: Props) {
  const user = await requireArea("clients");
  await auditViewerView(user, "clients");
  const sp = await searchParams;
  const f = {
    q: sp.q || "",
    from: DATE_RE.test(sp.from || "") ? (sp.from as string) : "",
    to: DATE_RE.test(sp.to || "") ? (sp.to as string) : "",
  };
  const data = await listClients({ ...f, page: Number(sp.page) || 1 });
  const filtered = Boolean(f.q || f.from || f.to);
  return (
    <>
      <PageHead
        title="Clients"
        sub="Leads become clients the moment their first payment comes in (a deposit or the full amount). See when, what they paid, what is still due, and keep their quotation, NDA and other documents here."
      />
      <form className="crm-filters crm-filters-wrap" method="get">
        <label className="crm-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input className="crm-input" type="search" name="q" defaultValue={f.q} placeholder="Search name, email, phone, company or service" aria-label="Search" />
        </label>
        <span className="crm-date-range">
          <input className="crm-input" type="date" name="from" defaultValue={f.from} aria-label="Became a client from" />
          <span className="crm-muted">to</span>
          <input className="crm-input" type="date" name="to" defaultValue={f.to} aria-label="Became a client to" />
        </span>
        <button type="submit" className="crm-act crm-act-dark">
          Apply
        </button>
        {filtered && (
          <Link href="?" className="crm-act crm-act-ghost">
            Clear
          </Link>
        )}
      </form>
      <p className="crm-muted crm-period-count" style={{ margin: "0 0 10px" }}>
        {data.total} {data.total === 1 ? "client" : "clients"}
        {filtered ? " match the filters" : " in total"}
      </p>
      <div className="crm-card crm-card-flush">
        <ClientsView rows={data.items} offset={(data.page - 1) * data.pageSize} canUpload={leadPermsFor(user).clientDocs}
          canDeleteDocs={isAdminLike(user)} openKey={sp.open || ""} />
        <Pager {...data} q={f.q} status="" extra={{ from: f.from, to: f.to }} />
      </div>
    </>
  );
}

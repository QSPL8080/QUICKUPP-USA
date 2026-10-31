import Link from "next/link";
import { requireUser } from "@/lib/crm/auth";
import { listLeads } from "@/lib/crm/data";
import { listTeamNames } from "@/lib/crm/users";
import { ENQUIRY_STATUSES, ENQUIRY_STATUS_LABEL, SOURCE_KEYS, SOURCE_LABEL } from "@/lib/crm/leadOptions";
import LeadsView from "@/components/crm/LeadsView";
import { PageHead, Pager } from "@/components/crm/ListTools";

type Props = { searchParams: Promise<{ q?: string; source?: string; status?: string; from?: string; to?: string; page?: string; new?: string }> };

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function EnquiriesPage({ searchParams }: Props) {
  await requireUser();
  const sp = await searchParams;
  const f = {
    q: sp.q || "",
    source: sp.source || "",
    status: sp.status || "",
    from: DATE_RE.test(sp.from || "") ? (sp.from as string) : "",
    to: DATE_RE.test(sp.to || "") ? (sp.to as string) : "",
  };
  const [data, team] = await Promise.all([listLeads({ ...f, page: Number(sp.page) || 1 }), listTeamNames()]);

  // month links: the month shown in the date filter (or this month), and the ones either side
  const base = f.from ? new Date(`${f.from}T00:00:00`) : new Date();
  const monthStart = new Date(base.getFullYear(), base.getMonth(), 1);
  const isWholeMonth = f.from === ymd(monthStart) && f.to === ymd(new Date(base.getFullYear(), base.getMonth() + 1, 0));
  const monthHref = (offset: number) => {
    const s = new Date(monthStart.getFullYear(), monthStart.getMonth() + offset, 1);
    const e = new Date(s.getFullYear(), s.getMonth() + 1, 0);
    const p = new URLSearchParams();
    if (f.q) p.set("q", f.q);
    if (f.source) p.set("source", f.source);
    if (f.status) p.set("status", f.status);
    p.set("from", ymd(s));
    p.set("to", ymd(e));
    return `?${p.toString()}`;
  };
  const monthLabel = monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const exportHref = `/api/crm/enquiries/export?${new URLSearchParams(Object.entries(f).filter(([, v]) => v) as [string, string][]).toString()}`;
  const filtered = Boolean(f.q || f.source || f.status || f.from || f.to);

  return (
    <>
      <PageHead title="All Enquiries" sub="Every lead in one place — Contact form, the four service forms and leads added by hand. Newest first.">
        <a href={exportHref} className="crm-act crm-act-ghost">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export CSV
        </a>
        <Link href="?new=1" className="crm-act crm-act-dark">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add lead
        </Link>
      </PageHead>

      <form className="crm-filters crm-filters-wrap" method="get">
        <label className="crm-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input className="crm-input" type="search" name="q" defaultValue={f.q} placeholder="Search name, email, phone, company or service" aria-label="Search" />
        </label>
        <select className="crm-input crm-select" name="source" defaultValue={f.source} aria-label="Source">
          <option value="">All sources</option>
          {SOURCE_KEYS.map((k) => (
            <option key={k} value={k}>
              {SOURCE_LABEL[k]}
            </option>
          ))}
        </select>
        <select className="crm-input crm-select" name="status" defaultValue={f.status} aria-label="Lead status">
          <option value="">All lead statuses</option>
          {ENQUIRY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ENQUIRY_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <span className="crm-date-range">
          <input className="crm-input" type="date" name="from" defaultValue={f.from} aria-label="Received from" />
          <span className="crm-muted">to</span>
          <input className="crm-input" type="date" name="to" defaultValue={f.to} aria-label="Received to" />
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

      <div className="crm-period">
        <span className="crm-period-label">Period</span>
        <Link href={monthHref(-1)} className="crm-icon-act crm-period-step" aria-label="Previous month">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <Link href={monthHref(0)} className={`crm-period-month${isWholeMonth ? " is-on" : ""}`}>
          {monthLabel}
        </Link>
        <Link href={monthHref(1)} className="crm-icon-act crm-period-step" aria-label="Next month">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
        <span className="crm-muted crm-period-count">
          {data.total} {data.total === 1 ? "lead" : "leads"}
          {filtered ? " match the filters" : " in total"}
        </span>
      </div>

      <div className="crm-card crm-card-flush">
        <LeadsView rows={data.items} offset={(data.page - 1) * data.pageSize} team={team} openNew={sp.new === "1"} />
        <Pager {...data} q={f.q} status={f.status} extra={{ source: f.source, from: f.from, to: f.to }} />
      </div>
    </>
  );
}

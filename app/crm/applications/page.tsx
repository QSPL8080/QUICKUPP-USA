import Link from "next/link";
import { requireArea } from "@/lib/crm/auth";
import { applicationJobs, listApplications } from "@/lib/crm/applications";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL } from "@/lib/applications";
import ApplicationsView from "@/components/crm/ApplicationsView";
import { PageHead, Pager } from "@/components/crm/ListTools";

type Props = { searchParams: Promise<{ q?: string; status?: string; job?: string; from?: string; to?: string; page?: string }> };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function ApplicationsPage({ searchParams }: Props) {
  await requireArea("applications");
  const sp = await searchParams;
  const f = {
    q: sp.q || "",
    status: sp.status || "",
    job: sp.job || "",
    from: DATE_RE.test(sp.from || "") ? (sp.from as string) : "",
    to: DATE_RE.test(sp.to || "") ? (sp.to as string) : "",
  };
  const [data, jobs] = await Promise.all([listApplications({ ...f, page: Number(sp.page) || 1 }), applicationJobs()]);
  const exportHref = `/api/crm/applications/export?${new URLSearchParams(Object.entries(f).filter(([, v]) => v) as [string, string][]).toString()}`;
  const filtered = Boolean(f.q || f.status || f.job || f.from || f.to);

  return (
    <>
      <PageHead
        title="Job Applications"
        sub="Candidates who clicked Apply Now on a Careers page opening. Each application is also emailed to hr@quickuppsoftech.us with the resume attached."
      >
        <a href={exportHref} className="crm-act crm-act-ghost">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export CSV
        </a>
        <Link href="/crm/jobs" className="crm-act crm-act-ghost">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          Manage job openings
        </Link>
      </PageHead>

      <form className="crm-filters" method="get">
        <label className="crm-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input className="crm-input" type="search" name="q" defaultValue={f.q} placeholder="Search name, email, phone, position or location" aria-label="Search" />
        </label>
        <select className="crm-input crm-select" name="job" defaultValue={f.job} aria-label="Applied for">
          <option value="">All positions</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title} ({j.n})
            </option>
          ))}
        </select>
        <select className="crm-input crm-select" name="status" defaultValue={f.status} aria-label="Status">
          <option value="">All statuses</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {APPLICATION_STATUS_LABEL[s]}
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

      <div className="crm-card crm-card-flush">
        <ApplicationsView rows={data.items} />
        <Pager {...data} q={f.q} status={f.status} extra={{ job: f.job, from: f.from, to: f.to }} />
      </div>
    </>
  );
}

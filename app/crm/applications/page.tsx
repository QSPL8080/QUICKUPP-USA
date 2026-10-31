import Link from "next/link";
import { requireUser } from "@/lib/crm/auth";
import { applicationJobs, listApplications } from "@/lib/crm/applications";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL } from "@/lib/applications";
import ApplicationsView from "@/components/crm/ApplicationsView";
import { PageHead, Pager } from "@/components/crm/ListTools";

type Props = { searchParams: Promise<{ q?: string; status?: string; job?: string; page?: string }> };

export default async function ApplicationsPage({ searchParams }: Props) {
  await requireUser();
  const sp = await searchParams;
  const q = sp.q || "";
  const status = sp.status || "";
  const job = sp.job || "";
  const [data, jobs] = await Promise.all([listApplications({ q, status, job, page: Number(sp.page) || 1 }), applicationJobs()]);

  return (
    <>
      <PageHead
        title="Job Applications"
        sub="Candidates who clicked Apply Now on a Careers page opening. Each application is also emailed to hr@quickuppsoftech.us with the resume attached."
      >
        <Link href="/crm/jobs" className="crm-act crm-act-ghost">
          Manage job openings
        </Link>
      </PageHead>

      <form className="crm-filters" method="get">
        <label className="crm-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input className="crm-input" type="search" name="q" defaultValue={q} placeholder="Search name, email, phone, position or location" aria-label="Search" />
        </label>
        <select className="crm-input crm-select" name="job" defaultValue={job} aria-label="Applied for">
          <option value="">All positions</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title} ({j.n})
            </option>
          ))}
        </select>
        <select className="crm-input crm-select" name="status" defaultValue={status} aria-label="Status">
          <option value="">All statuses</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {APPLICATION_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button type="submit" className="crm-act crm-act-dark">
          Apply
        </button>
        {(q || status || job) && (
          <Link href="?" className="crm-act crm-act-ghost">
            Clear
          </Link>
        )}
      </form>

      <div className="crm-card crm-card-flush">
        <ApplicationsView rows={data.items} />
        <Pager {...data} q={q} status={status} extra={{ job }} />
      </div>
    </>
  );
}

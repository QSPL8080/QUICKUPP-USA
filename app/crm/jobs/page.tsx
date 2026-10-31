import { requireUser } from "@/lib/crm/auth";
import { listAllJobs } from "@/lib/jobsData";
import JobsView from "@/components/crm/JobsView";
import Link from "next/link";
import { PageHead } from "@/components/crm/ListTools";

type Props = { searchParams: Promise<{ new?: string }> };

export default async function JobsPage({ searchParams }: Props) {
  await requireUser();
  const sp = await searchParams;
  const rows = await listAllJobs();
  return (
    <>
      <PageHead
        title="Job Openings (Website)"
        sub="Post and manage the vacancies listed under Current Job Openings on the Careers page. Closed openings and ones past their deadline are hidden there."
      >
        <Link href="/crm/applications" className="crm-act crm-act-ghost">
          View job applications
        </Link>
      </PageHead>
      <div className="crm-card crm-card-flush">
        <JobsView rows={rows} openNew={sp.new === "1"} />
      </div>
    </>
  );
}

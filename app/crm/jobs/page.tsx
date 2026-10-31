import { requireUser } from "@/lib/crm/auth";
import { listAllJobs } from "@/lib/jobsData";
import JobsView from "@/components/crm/JobsView";
import { PageHead } from "@/components/crm/ListTools";

type Props = { searchParams: Promise<{ new?: string }> };

export default async function JobsPage({ searchParams }: Props) {
  await requireUser();
  const sp = await searchParams;
  const rows = await listAllJobs();
  return (
    <>
      <PageHead title="Job Openings" sub="Vacancies shown on the Careers page. Closed openings and ones past their deadline are hidden there." />
      <div className="crm-card crm-card-flush">
        <JobsView rows={rows} openNew={sp.new === "1"} />
      </div>
    </>
  );
}

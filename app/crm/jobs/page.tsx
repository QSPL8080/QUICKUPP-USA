import { canAccess, requireArea } from "@/lib/crm/auth";
import { listAllJobs } from "@/lib/jobsData";
import JobsView from "@/components/crm/JobsView";

type Props = { searchParams: Promise<{ new?: string }> };

export default async function JobsPage({ searchParams }: Props) {
  const user = await requireArea("jobs");
  const sp = await searchParams;
  const rows = await listAllJobs();
  return <JobsView rows={rows} openNew={sp.new === "1"} showApplications={canAccess(user, "applications")} />;
}

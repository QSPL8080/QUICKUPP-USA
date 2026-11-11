import { getUserFor } from "@/lib/crm/auth";
import { listAllJobs } from "@/lib/jobsData";
import { parseIds } from "@/lib/crm/ids";
import { csvFile } from "@/lib/crm/csv";

const todayStr = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
};

/* GET ?status=live|closed|expired&ids=1,2 → the job openings as a CSV file */
export async function GET(request: Request) {
  if (!(await getUserFor("jobs"))) return new Response("Please sign in again.", { status: 401 });
  const sp = new URL(request.url).searchParams;
  const rawIds = sp.get("ids");
  const parsed = rawIds ? parseIds(rawIds.split(",")) : null;
  const ids = parsed && parsed.length ? new Set(parsed) : null;
  const status = sp.get("status") || "";
  const today = todayStr();
  const state = (open: boolean, deadline: string | null) => (!open ? "Closed" : deadline && deadline < today ? "Deadline passed" : "Live");
  // applicant counts are left out for the SEO role, who never sees applications
  const withApps = Boolean(await getUserFor("applications"));

  const jobs = (await listAllJobs()).filter((j) => {
    if (ids && !ids.has(j.id)) return false;
    if (status === "live") return state(j.isOpen, j.deadline) === "Live";
    if (status === "closed") return !j.isOpen;
    if (status === "expired") return state(j.isOpen, j.deadline) === "Deadline passed";
    return true;
  });

  const head = [
    "Sr. No",
    "Job ID",
    "Job Title",
    "Department",
    "Employment Type",
    "Location",
    "Experience",
    "Responsibilities",
    "Skills",
    "Deadline",
    "On Careers Page",
    ...(withApps ? ["Applications"] : []),
    "Posted Date & Time",
  ];
  const rows = jobs.map((j, i) => [
    i + 1,
    j.id,
    j.title,
    j.department,
    j.employmentType,
    j.location,
    j.experience,
    j.responsibilities.join("; "),
    j.skills.join("; "),
    j.deadline || "",
    state(j.isOpen, j.deadline),
    ...(withApps ? [j.applications ?? 0] : []),
    new Date(j.createdAt).toISOString().replace("T", " ").slice(0, 16),
  ]);
  return csvFile(`job-openings-${today}.csv`, head, rows);
}

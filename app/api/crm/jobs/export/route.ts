import { getUserFor } from "@/lib/crm/auth";
import { listAllJobs } from "@/lib/jobsData";
import { parseIds } from "@/lib/crm/ids";
import { csvFile } from "@/lib/crm/csv";
import { exportStamp, exportZone, viewerTimeZone } from "@/lib/crm/crmTime";
import { getPool } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";
import { APPLICATION_STATUS_LABEL } from "@/lib/applications";
import { SITE_URL } from "@/lib/siteUrl";

const todayStr = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
};

/* GET ?status=live|closed|expired&ids=1,2 → the job openings as a CSV file */
export async function GET(request: Request) {
  if (!(await getUserFor("jobs"))) return new Response("Please sign in again.", { status: 401 });
  const sp = new URL(request.url).searchParams;
  const rawIds = sp.get("ids");
  const parsed = rawIds ? parseIds(rawIds.split(","), 5000) : null;
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

  const tz = await viewerTimeZone();
  const zone = exportZone(tz);
  const pool = getPool();
  const ids2 = jobs.map((j) => j.id);
  // who posted each opening, when it last changed, and its applications by status
  const extra = new Map<number, { by: string; updated: Date | null }>();
  const apps = new Map<number, Record<string, number>>();
  if (ids2.length) {
    const [jr] = await pool
      .query<RowDataPacket[]>("SELECT j.id, j.updated_at, u.name AS by_name FROM job_openings j LEFT JOIN crm_users u ON u.id = j.created_by WHERE j.id IN (?)", [ids2])
      .catch(() => [[] as RowDataPacket[]]);
    for (const r of jr) extra.set(Number(r.id), { by: r.by_name || "", updated: r.updated_at ? new Date(r.updated_at) : null });
    if (withApps) {
      const [ar] = await pool
        .query<RowDataPacket[]>("SELECT job_id, status, COUNT(*) AS n FROM job_applications WHERE job_id IN (?) GROUP BY job_id, status", [ids2])
        .catch(() => [[] as RowDataPacket[]]);
      for (const r of ar) apps.set(Number(r.job_id), { ...(apps.get(Number(r.job_id)) || {}), [r.status]: Number(r.n) });
    }
  }
  const byStatus = (id: number) =>
    Object.entries(apps.get(id) || {})
      .map(([k, n]) => `${APPLICATION_STATUS_LABEL[k as keyof typeof APPLICATION_STATUS_LABEL] || k}: ${n}`)
      .join(", ");

  const head = [
    "Sr. No", "Job ID", "Job Title", "Department", "Employment Type", "Location", "Experience", "Responsibilities", "Skills",
    "Application Deadline", "On Careers Page", "Careers Page Link",
    ...(withApps ? ["Applications", "Applications by Status"] : []),
    "Posted By", `Posted (${zone})`, `Last Changed (${zone})`,
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
    j.deadline || "No deadline",
    state(j.isOpen, j.deadline),
    `${SITE_URL}/career`,
    ...(withApps ? [j.applications ?? 0, byStatus(j.id)] : []),
    extra.get(j.id)?.by || "",
    exportStamp(j.createdAt, tz),
    exportStamp(extra.get(j.id)?.updated || null, tz),
  ]);
  return csvFile(`quickupp-job-openings-${today}.csv`, head, rows);
}

import { getUserFor } from "@/lib/crm/auth";
import { exportApplications } from "@/lib/crm/applications";
import { APPLICATION_STATUS_LABEL, fmtBytes } from "@/lib/applications";
import { parseIds } from "@/lib/crm/ids";
import { exportStamp, exportZone, viewerTimeZone } from "@/lib/crm/crmTime";
import { csvFile } from "@/lib/crm/csv";
import { getPool } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";
import { SITE_URL } from "@/lib/siteUrl";


/* GET ?q=&job=&status=&from=&to=&ids= → the filtered job applications as a CSV file */
export async function GET(request: Request) {
  if (!(await getUserFor("applications"))) return new Response("Please sign in again.", { status: 401 });
  const sp = new URL(request.url).searchParams;
  const rawIds = sp.get("ids");
  const parsed = rawIds ? parseIds(rawIds.split(","), 5000) : null;
  const ids = parsed && parsed.length ? parsed : undefined;

  const rows = await exportApplications({
    q: sp.get("q") || "",
    job: sp.get("job") || "",
    status: sp.get("status") || "",
    from: sp.get("from") || "",
    to: sp.get("to") || "",
    tz: await viewerTimeZone(),
    ids,
  });

  const tz = await viewerTimeZone();
  const zone = exportZone(tz);
  // the opening each application was for: still on the Careers page, closed, or deleted
  const jobIds = [...new Set(rows.map((r) => r.jobId).filter((x): x is number => x != null))];
  const openings = new Map<number, string>();
  if (jobIds.length) {
    const [jr] = await getPool()
      .query<RowDataPacket[]>("SELECT id, is_open, deadline FROM job_openings WHERE id IN (?)", [jobIds])
      .catch(() => [[] as RowDataPacket[]]);
    const today = new Date().toISOString().slice(0, 10);
    for (const j of jr) {
      const deadline = j.deadline ? (j.deadline instanceof Date ? j.deadline.toISOString() : String(j.deadline)).slice(0, 10) : "";
      openings.set(Number(j.id), !Number(j.is_open) ? "Closed" : deadline && deadline < today ? "Deadline passed" : "Live on Careers page");
    }
  }

  const head = [
    "Sr. No", "Application ID", `Received (${zone})`, "Candidate Name", "Email", "Phone", "Current Location", "Applied Position",
    "Job ID", "Opening Now", "Department", "Total Experience", "LinkedIn / Portfolio", "Cover Note", "Resume File Name",
    "Resume File Size", "Resume (open in CRM)", "Status",
  ];
  const lines = rows.map((r, i) => [
    i + 1,
    `#${r.id}`,
    exportStamp(r.createdAt, tz),
    r.name,
    r.email,
    r.phone,
    r.location,
    r.jobTitle,
    r.jobId ?? "",
    r.jobId == null ? "Deleted" : openings.get(r.jobId) || "Deleted",
    r.department,
    r.experience,
    r.profileUrl,
    r.coverNote,
    r.resumeName,
    fmtBytes(r.resumeSize),
    `${SITE_URL}/api/crm/applications/${r.id}/resume`,
    APPLICATION_STATUS_LABEL[r.status] || r.status,
  ]);
  return csvFile(`quickupp-job-applications-${new Date().toISOString().slice(0, 10)}.csv`, head, lines);
}

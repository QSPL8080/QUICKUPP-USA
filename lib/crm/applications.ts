import "server-only";
import { getPool } from "@/lib/db";
import { APPLICATION_STATUSES, type ApplicationRow, type ApplicationStatus } from "@/lib/applications";
import { DEFAULT_TZ, dayEnd, dayStart } from "@/lib/crm/crmTime";

/* Reading job applications for the CRM (the resume itself is fetched separately) */

const PAGE_SIZE = 25;

export type ApplicationFilters = {
  q?: string;
  status?: string;
  job?: string;
  from?: string;
  to?: string;
  /** the viewer's time zone, which the from/to days are in */
  tz?: string;
  ids?: number[] | null;
};

function buildApplicationsWhere(opts: ApplicationFilters) {
  const where: string[] = [];
  const args: (string | number | Date)[] = [];
  const tz = opts.tz || DEFAULT_TZ;
  if (opts.ids && opts.ids.length > 0) {
    where.push(`id IN (${opts.ids.map(() => "?").join(", ")})`);
    args.push(...opts.ids);
  }
  if (opts.status && (APPLICATION_STATUSES as readonly string[]).includes(opts.status)) {
    where.push("status = ?");
    args.push(opts.status);
  }
  // job: an opening's id, or "title:<job title>" for applications whose opening has since been deleted
  const job = String(opts.job || "");
  const jobId = Number(job);
  if (Number.isInteger(jobId) && jobId > 0) {
    where.push("job_id = ?");
    args.push(jobId);
  } else if (job.startsWith("title:") && job.length > 6) {
    where.push("job_id IS NULL AND job_title = ?");
    args.push(job.slice(6, 200));
  }
  const q = (opts.q || "").trim().slice(0, 100);
  if (q) {
    const like = `%${q}%`;
    where.push("(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR job_title LIKE ? OR current_location LIKE ?)");
    args.push(like, like, like, like, like);
  }
  if (opts.from && /^\d{4}-\d{2}-\d{2}$/.test(opts.from)) {
    where.push("created_at >= ?");
    args.push(dayStart(opts.from, tz));
  }
  if (opts.to && /^\d{4}-\d{2}-\d{2}$/.test(opts.to)) {
    where.push("created_at < ?");
    args.push(dayEnd(opts.to, tz));
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, args };
}

export async function listApplications(opts: ApplicationFilters & { page?: number }) {
  const { whereSql, args } = buildApplicationsWhere(opts);
  const page = Math.max(1, Math.floor(opts.page || 1));

  const pool = getPool();
  const [countRows] = await pool.query(`SELECT COUNT(*) AS n FROM job_applications ${whereSql}`, args);
  const total = Number((countRows as { n: number }[])[0]?.n || 0);
  const [rows] = await pool.query(
    `SELECT id, job_id, job_title, department, full_name, email, phone, current_location, experience, profile_url, cover_note,
            resume_name, resume_size, status, created_at
       FROM job_applications ${whereSql}
      ORDER BY created_at DESC, id DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
    args
  );

  const items: ApplicationRow[] = (rows as Record<string, unknown>[]).map((r) => ({
    id: Number(r.id),
    jobId: r.job_id == null ? null : Number(r.job_id),
    jobTitle: String(r.job_title ?? ""),
    department: r.department == null ? null : String(r.department),
    name: String(r.full_name ?? ""),
    email: String(r.email ?? ""),
    phone: String(r.phone ?? ""),
    location: String(r.current_location ?? ""),
    experience: String(r.experience ?? ""),
    profileUrl: r.profile_url == null ? null : String(r.profile_url),
    coverNote: r.cover_note == null ? null : String(r.cover_note),
    resumeName: String(r.resume_name ?? ""),
    resumeSize: Number(r.resume_size || 0),
    status: (APPLICATION_STATUSES as readonly string[]).includes(String(r.status)) ? (String(r.status) as ApplicationStatus) : "new",
    createdAt: new Date(r.created_at as string).toISOString(),
  }));

  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), pageSize: PAGE_SIZE };
}

export type ExportApplicationItem = {
  id: number;
  jobId: number | null;
  jobTitle: string;
  department: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  profileUrl: string;
  coverNote: string;
  resumeName: string;
  resumeSize: number;
  status: ApplicationStatus;
  createdAt: string;
};

/** All applications matching filters for CSV export (capped to 10000) */
export async function exportApplications(opts: ApplicationFilters): Promise<ExportApplicationItem[]> {
  const { whereSql, args } = buildApplicationsWhere(opts);
  const [rows] = await getPool().query(
    `SELECT id, job_id, job_title, department, full_name, email, phone, current_location, experience, profile_url, cover_note,
            resume_name, resume_size, status, created_at
       FROM job_applications ${whereSql}
      ORDER BY created_at DESC, id DESC LIMIT 10000`,
    args
  );

  return (rows as Record<string, unknown>[]).map((r) => ({
    id: Number(r.id),
    jobId: r.job_id == null ? null : Number(r.job_id),
    jobTitle: String(r.job_title ?? ""),
    department: r.department == null ? "" : String(r.department),
    name: String(r.full_name ?? ""),
    email: String(r.email ?? ""),
    phone: String(r.phone ?? ""),
    location: String(r.current_location ?? ""),
    experience: String(r.experience ?? ""),
    profileUrl: r.profile_url == null ? "" : String(r.profile_url),
    coverNote: r.cover_note == null ? "" : String(r.cover_note),
    resumeName: String(r.resume_name ?? ""),
    resumeSize: Number(r.resume_size || 0),
    status: (APPLICATION_STATUSES as readonly string[]).includes(String(r.status)) ? (String(r.status) as ApplicationStatus) : "new",
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
}

/** Openings that have applications, for the "applied for" filter */
/** The positions in the "Applied for" filter: current openings, then deleted ones (by title) */
export async function applicationJobs(): Promise<{ value: string; title: string; n: number; removed: boolean }[]> {
  const [rows] = await getPool().query(
    `SELECT job_id, MAX(job_title) AS title, COUNT(*) AS n FROM job_applications WHERE job_id IS NOT NULL GROUP BY job_id
     UNION ALL
     SELECT NULL AS job_id, job_title AS title, COUNT(*) AS n FROM job_applications WHERE job_id IS NULL GROUP BY job_title
     ORDER BY job_id IS NULL, title`
  );
  return (rows as Record<string, unknown>[]).map((r) =>
    r.job_id == null
      ? { value: `title:${String(r.title)}`, title: String(r.title), n: Number(r.n), removed: true }
      : { value: String(r.job_id), title: String(r.title), n: Number(r.n), removed: false }
  );
}

/** Number of applications nobody has looked at yet (sidebar badge) */
export async function newApplicationCount(): Promise<number> {
  try {
    const [rows] = await getPool().query("SELECT COUNT(*) AS n FROM job_applications WHERE status = 'new'");
    return Number((rows as { n: number }[])[0]?.n || 0);
  } catch {
    return 0; // table not created yet
  }
}

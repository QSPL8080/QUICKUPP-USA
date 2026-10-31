import "server-only";
import { getPool } from "@/lib/db";
import { APPLICATION_STATUSES, type ApplicationRow, type ApplicationStatus } from "@/lib/applications";

/* Reading job applications for the CRM (the resume itself is fetched separately) */

const PAGE_SIZE = 25;

export async function listApplications(opts: { q?: string; status?: string; job?: string; page?: number }) {
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (opts.status && (APPLICATION_STATUSES as readonly string[]).includes(opts.status)) {
    where.push("status = ?");
    args.push(opts.status);
  }
  const jobId = Number(opts.job);
  if (Number.isInteger(jobId) && jobId > 0) {
    where.push("job_id = ?");
    args.push(jobId);
  }
  const q = (opts.q || "").trim().slice(0, 100);
  if (q) {
    const like = `%${q}%`;
    where.push("(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR job_title LIKE ? OR current_location LIKE ?)");
    args.push(like, like, like, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const page = Math.max(1, Math.floor(opts.page || 1));

  const pool = getPool();
  const [countRows] = await pool.query(`SELECT COUNT(*) AS n FROM job_applications ${whereSql}`, args);
  const total = Number((countRows as { n: number }[])[0]?.n || 0);
  const [rows] = await pool.query(
    `SELECT id, job_id, job_title, department, full_name, email, phone, current_location, experience, profile_url, cover_note,
            resume_name, resume_size, status, mail_sent, created_at
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
    mailSent: Number(r.mail_sent) === 1,
    createdAt: new Date(r.created_at as string).toISOString(),
  }));

  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), pageSize: PAGE_SIZE };
}

/** Openings that have applications, for the "applied for" filter */
export async function applicationJobs(): Promise<{ id: number; title: string; n: number }[]> {
  const [rows] = await getPool().query(
    "SELECT job_id, MAX(job_title) AS title, COUNT(*) AS n FROM job_applications WHERE job_id IS NOT NULL GROUP BY job_id ORDER BY title"
  );
  return (rows as Record<string, unknown>[]).map((r) => ({ id: Number(r.job_id), title: String(r.title), n: Number(r.n) }));
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

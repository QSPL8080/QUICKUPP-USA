import "server-only";
import { getPool } from "@/lib/db";
import { lines, type Job } from "@/lib/jobs";

/* Reading job openings (Careers page and CRM) */

const toDate = (v: unknown) => {
  if (!v) return null;
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(v).slice(0, 10);
};

const toJob = (r: Record<string, unknown>): Job => ({
  id: Number(r.id),
  title: String(r.title ?? ""),
  department: String(r.department ?? ""),
  employmentType: String(r.employment_type ?? ""),
  location: String(r.location ?? ""),
  experience: String(r.experience ?? ""),
  responsibilities: lines(r.responsibilities as string),
  skills: lines(r.skills as string),
  deadline: toDate(r.deadline),
  isOpen: Number(r.is_open) === 1,
  createdAt: new Date(r.created_at as string).toISOString(),
  ...(r.applications !== undefined ? { applications: Number(r.applications) } : {}),
});

/** Open jobs for the Careers page: closed ones and ones past their deadline are left out */
export async function listOpenJobs(): Promise<Job[]> {
  const [rows] = await getPool().query(
    "SELECT * FROM job_openings WHERE is_open = 1 AND (deadline IS NULL OR deadline >= CURDATE()) ORDER BY created_at DESC, id DESC"
  );
  return (rows as Record<string, unknown>[]).map(toJob);
}

/** Every job, for the CRM */
export async function listAllJobs(): Promise<Job[]> {
  const pool = getPool();
  try {
    const [rows] = await pool.query(
      `SELECT j.*, (SELECT COUNT(*) FROM job_applications a WHERE a.job_id = j.id) AS applications
         FROM job_openings j ORDER BY j.created_at DESC, j.id DESC`
    );
    return (rows as Record<string, unknown>[]).map(toJob);
  } catch {
    // applications table not created yet
  }
  const [rows] = await pool.query("SELECT * FROM job_openings ORDER BY created_at DESC, id DESC");
  return (rows as Record<string, unknown>[]).map(toJob);
}

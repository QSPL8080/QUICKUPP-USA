/*
 * Job openings shown on the Careers page and managed in the CRM (/crm/jobs).
 * Shared by the browser and the server: keep this file free of server code.
 */

/* the departments named on the Careers page */
export const JOB_DEPARTMENTS = [
  "IT & Software Development",
  "Digital Marketing & Growth",
  "AI & Automation",
  "Business Development & Sales",
  "BPO & Business Operations",
  "Internships & Fresh Graduates",
] as const;

/* "full-time, part-time, and internship opportunities" */
export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Internship"] as const;

export type Job = {
  id: number;
  title: string;
  department: string;
  employmentType: string;
  location: string;
  experience: string;
  responsibilities: string[];
  skills: string[];
  deadline: string | null; // YYYY-MM-DD
  isOpen: boolean;
  createdAt: string;
  applications?: number; // CRM only
};

export type JobInput = {
  title: string;
  department: string;
  employmentType: string;
  location: string;
  experience: string;
  responsibilities: string;
  skills: string;
  deadline: string | null;
  isOpen: boolean;
};

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Splits a multi-line field into its non-empty lines */
export const lines = (v: string | null | undefined) =>
  (v || "")
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-•*\s]+/, "").trim())
    .filter(Boolean);

export function validateJob(body: Record<string, unknown>): { ok: true; data: JobInput } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const title = text(body.title, 190);
  const department = text(body.department, 100);
  const employmentType = text(body.employmentType, 40);
  const location = text(body.location, 150);
  const experience = text(body.experience, 100);
  const responsibilities = text(body.responsibilities, 6000);
  const skills = text(body.skills, 4000);
  const deadline = text(body.deadline, 10);

  if (!title) errors.title = "Please enter the job title.";
  if (!(JOB_DEPARTMENTS as readonly string[]).includes(department)) errors.department = "Please choose a department.";
  if (!(EMPLOYMENT_TYPES as readonly string[]).includes(employmentType)) errors.employmentType = "Please choose the employment type.";
  if (!location) errors.location = "Please enter the work location.";
  if (!experience) errors.experience = "Please enter the experience required.";
  if (!lines(responsibilities).length) errors.responsibilities = "Please add at least one responsibility.";
  if (!lines(skills).length) errors.skills = "Please add at least one required skill.";
  if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) errors.deadline = "Please enter a valid date.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: { title, department, employmentType, location, experience, responsibilities, skills, deadline: deadline || null, isOpen: body.isOpen !== false },
  };
}

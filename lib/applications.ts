/*
 * Job applications sent from the Apply Now form on the Careers page and
 * listed in the CRM (/crm/applications). Shared by the browser and the
 * server: keep this file free of server code.
 */

export const APPLICATION_STATUSES = ["new", "reviewing", "shortlisted", "rejected", "hired"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  new: "New",
  reviewing: "In review",
  shortlisted: "Shortlisted",
  rejected: "Not selected",
  hired: "Hired",
};

/* resume upload rules (checked in the browser and again on the server) */
export const RESUME_MAX_BYTES = 5 * 1024 * 1024;
export const RESUME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
export const RESUME_ACCEPT = ".pdf,.doc,.docx";

export type ApplicationInput = {
  jobId: number;
  fullName: string;
  email: string;
  phone: string;
  currentLocation: string;
  experience: string;
  profileUrl: string | null;
  coverNote: string | null;
};

export type ApplicationRow = {
  id: number;
  jobId: number | null;
  jobTitle: string;
  department: string | null;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  profileUrl: string | null;
  coverNote: string | null;
  resumeName: string;
  resumeSize: number;
  status: ApplicationStatus;
  mailSent: boolean;
  createdAt: string;
};

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const resumeExt = (name: string) => (name.split(".").pop() || "").toLowerCase();

/** Checks the resume file's type and size; returns an error message or "" */
export function checkResume(file: { name: string; size: number } | null | undefined): string {
  if (!file || !file.size) return "Please attach your resume.";
  if (!RESUME_TYPES[resumeExt(file.name)]) return "Please attach a PDF, DOC or DOCX file.";
  if (file.size > RESUME_MAX_BYTES) return "Your resume must be 5 MB or smaller.";
  return "";
}

export function validateApplication(body: Record<string, unknown>): { ok: true; data: ApplicationInput } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const jobId = Number(body.jobId);
  const fullName = text(body.fullName, 150);
  const email = text(body.email, 190).toLowerCase();
  const phone = text(body.phone, 40);
  const currentLocation = text(body.currentLocation, 150);
  const experience = text(body.experience, 100);
  let profileUrl = text(body.profileUrl, 255);
  const coverNote = text(body.coverNote, 4000);

  if (!Number.isInteger(jobId) || jobId < 1) errors.jobId = "Please choose a job opening.";
  if (!fullName) errors.fullName = "Please enter your full name.";
  if (!email || !EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";
  if (!/^[0-9+()\-.\s]{5,40}$/.test(phone)) errors.phone = "Please enter a valid phone number.";
  if (!currentLocation) errors.currentLocation = "Please enter your current location.";
  if (!experience) errors.experience = "Please enter your total experience.";
  if (profileUrl) {
    if (!/^https?:\/\//i.test(profileUrl)) profileUrl = `https://${profileUrl}`;
    if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(profileUrl)) errors.profileUrl = "Please enter a valid link.";
  }
  if (body.agreed !== true && body.agreed !== "true" && body.agreed !== "on") {
    errors.agreed = "Please accept the Privacy Policy and Terms & Conditions.";
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: { jobId, fullName, email, phone, currentLocation, experience, profileUrl: profileUrl || null, coverNote: coverNote || null },
  };
}

export const fmtBytes = (n: number) => (n >= 1024 * 1024 ? `${(n / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

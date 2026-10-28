import { BUDGETS, INDUSTRIES } from "@/lib/formOptions";

/*
 * Validation shared by the Contact and service enquiry API routes.
 * Every value is trimmed, length-limited and checked against the allowed
 * options before it reaches the database.
 */

export type EnquiryInput = {
  fullName: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  industry: string;
  otherIndustry: string | null;
  subject: string;
  budget: string | null;
  message: string;
};

type Result = { ok: true; data: EnquiryInput } | { ok: false; errors: Record<string, string> };

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEnquiry(body: Record<string, unknown>, subjects: readonly string[], subjectField: string): Result {
  const errors: Record<string, string> = {};

  const fullName = text(body.fullName, 150);
  const email = text(body.email, 190).toLowerCase();
  const phone = text(body.phone, 40);
  const companyName = text(body.companyName, 190);
  const industry = text(body.industry, 100);
  const otherIndustry = text(body.otherIndustry, 150);
  const subject = text(body[subjectField], 150);
  const budget = text(body.budget, 60);
  const message = text(body.message, 5000);

  if (!fullName) errors.fullName = "Please enter your full name.";
  if (!email || !EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";
  if (phone && !/^[0-9+()\-.\s]{5,40}$/.test(phone)) errors.phone = "Please enter a valid phone number.";
  if (!(INDUSTRIES as readonly string[]).includes(industry)) errors.industry = "Please select your industry.";
  if (industry === "Other" && !otherIndustry) errors.otherIndustry = "Please specify your industry.";
  if (!subjects.includes(subject)) errors[subjectField] = "Please select a service.";
  if (budget && !BUDGETS.some((b) => b.value === budget)) errors.budget = "Please select a budget range.";
  if (!message) errors.message = "Please tell us about your project.";
  if (body.agreed !== true) errors.agreed = "Please accept the Privacy Policy and Terms & Conditions.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      fullName,
      email,
      phone: phone || null,
      companyName: companyName || null,
      industry,
      otherIndustry: industry === "Other" ? otherIndustry : null,
      subject,
      budget: budget || null,
      message,
    },
  };
}

/** Request details stored with each lead */
export function requestMeta(request: Request, pageUrl: unknown) {
  const fwd = request.headers.get("x-forwarded-for");
  return {
    ip: (fwd ? fwd.split(",")[0] : request.headers.get("x-real-ip") || "").trim().slice(0, 64) || null,
    userAgent: (request.headers.get("user-agent") || "").slice(0, 500) || null,
    pageUrl: typeof pageUrl === "string" ? pageUrl.slice(0, 500) : null,
  };
}

/** Reads a JSON body; returns null for anything that isn't a JSON object */
export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/*
 * Lead (enquiry) options shared by the CRM pages (browser) and its API
 * routes (server). Keep this file free of server code.
 */
import { BUDGETS, CONTACT_TIMELINES, INDUSTRIES, SERVICE_FORMS, type ServiceFormKey } from "@/lib/formOptions";

export const ENQUIRY_STATUSES = ["new", "contacted", "in_progress", "on_hold", "closed"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];
export const ENQUIRY_STATUS_LABEL: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In Progress",
  on_hold: "On Hold",
  closed: "Closed",
};

export type EnquirySource = "contact" | ServiceFormKey | "manual";
export const SOURCE_KEYS: EnquirySource[] = ["contact", "digital-marketing", "ai-automation", "it-services", "staff-augmentation", "manual"];

/* how each source is named in the lead list and its filter */
export const SOURCE_LABEL: Record<EnquirySource, string> = {
  contact: "Contact Form",
  "digital-marketing": "Service Form · Digital Marketing",
  "ai-automation": "Service Form · AI & Automation",
  "it-services": "Service Form · IT Services",
  "staff-augmentation": "Service Form · Staff Augmentation",
  manual: "Added Manually",
};

export const isEnquirySource = (v: unknown): v is EnquirySource => typeof v === "string" && (SOURCE_KEYS as string[]).includes(v);

/* Add Lead form: the services and service pages offered on the website */
export const LEAD_SERVICES = (Object.keys(SERVICE_FORMS) as ServiceFormKey[]).map((k) => ({
  value: SERVICE_FORMS[k].label,
  options: SERVICE_FORMS[k].options as readonly string[],
}));
export const LEAD_CHANNELS = ["Website", "Manual", "Meta"] as const;
export const LEAD_BUDGETS = BUDGETS.map((b) => b.value);
export const LEAD_TIMELINES = CONTACT_TIMELINES;
export const LEAD_INDUSTRIES = INDUSTRIES;

export type ManualLeadInput = {
  fullName: string;
  email: string | null;
  phone: string;
  companyName: string | null;
  companyWebsite: string | null;
  country: string | null;
  industry: string | null;
  service: string;
  category: string;
  budget: string | null;
  timeline: string | null;
  channel: string;
  assignedTo: string | null;
  notes: string | null;
  status: EnquiryStatus;
};

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateManualLead(body: Record<string, unknown>): { ok: true; data: ManualLeadInput } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const fullName = text(body.fullName, 150);
  const email = text(body.email, 190).toLowerCase();
  const phone = text(body.phone, 40);
  const companyName = text(body.companyName, 190);
  let companyWebsite = text(body.companyWebsite, 255);
  const country = text(body.country, 100);
  const industry = text(body.industry, 100);
  const service = text(body.service, 150);
  const category = text(body.category, 150);
  const budget = text(body.budget, 60);
  const timeline = text(body.timeline, 60);
  const channel = text(body.channel, 60);
  const assignedTo = text(body.assignedTo, 120);
  const notes = text(body.notes, 5000);
  const status = text(body.status, 20) || "new";

  if (!fullName) errors.fullName = "Please enter the client's name.";
  if (!/^[0-9+()\-.\s]{5,40}$/.test(phone)) errors.phone = "Please enter a valid phone number.";
  if (email && !EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";
  if (companyWebsite && !/^https?:\/\//i.test(companyWebsite)) companyWebsite = `https://${companyWebsite}`;
  const group = LEAD_SERVICES.find((s) => s.value === service);
  if (!group) errors.service = "Please choose a service.";
  else if (!group.options.includes(category)) errors.category = "Please choose the service type.";
  if (industry && !(LEAD_INDUSTRIES as readonly string[]).includes(industry)) errors.industry = "Please choose an industry.";
  if (budget && !LEAD_BUDGETS.includes(budget)) errors.budget = "Please choose a budget.";
  if (timeline && !(LEAD_TIMELINES as readonly string[]).includes(timeline)) errors.timeline = "Please choose a timeline.";
  if (!(LEAD_CHANNELS as readonly string[]).includes(channel)) errors.channel = "Please choose the lead source.";
  if (!(ENQUIRY_STATUSES as readonly string[]).includes(status)) errors.status = "Please choose a status.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      fullName,
      email: email || null,
      phone,
      companyName: companyName || null,
      companyWebsite: companyWebsite || null,
      country: country || null,
      industry: industry || null,
      service,
      category,
      budget: budget || null,
      timeline: timeline || null,
      channel,
      assignedTo: assignedTo || null,
      notes: notes || null,
      status: status as EnquiryStatus,
    },
  };
}

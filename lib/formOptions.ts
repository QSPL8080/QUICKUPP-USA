/*
 * Options shared by the enquiry forms (browser) and the API routes (server).
 * Keep this file light: it is bundled into the pages that show a form.
 */
import { serviceGroups } from "@/lib/sitemap";

export const INDUSTRIES = [
  "Healthcare",
  "Home Services",
  "Professional Services",
  "Education",
  "IT & SaaS",
  "eCommerce",
  "Real Estate",
  "Interior Design",
  "Travel & Hospitality",
  "Other",
] as const;

export const BUDGETS: { value: string; label: string }[] = [
  { value: "Under $5,000", label: "Under $5,000" },
  { value: "$5,000 - $15,000", label: "$5,000 – $15,000" },
  { value: "$15,000 - $50,000", label: "$15,000 – $50,000" },
  { value: "$50,000+", label: "$50,000+" },
  { value: "Not Specified / Flexible", label: "Flexible / Not Sure" },
];

/* Contact page form ("Tell Us About Your Project") */
export const CONTACT_SERVICES = [
  "AI-Powered Digital Marketing",
  "SEO / AEO / GEO",
  "Paid Advertising & Lead Generation",
  "AI Solutions & Automation",
  "Website & Software Development",
  "Mobile App Development",
  "BPO Services",
  "Staff Augmentation",
  "Other",
] as const;

export const CONTACT_BUDGETS = ["$1,000 – $2,500", "$2,500 – $5,000", "$5,000 – $10,000", "$10,000+"] as const;

export const CONTACT_TIMELINES = ["Immediately", "Within 2–4 Weeks", "Within 1–3 Months"] as const;

const groupItems = (label: string) => serviceGroups.find((g) => g.label === label)?.items.map((i) => i.label) ?? [];

/**
 * The four service forms. Each one saves to its own table, and its "Service"
 * field lists that service's subpages (AI & Automation is a single page, so
 * it offers that service plus Other).
 */
export const SERVICE_FORMS = {
  "digital-marketing": {
    label: "AI-Powered Digital Marketing Services",
    table: "service_digital_marketing",
    options: groupItems("AI-Powered Digital Marketing Services"),
  },
  "ai-automation": {
    label: "AI & Automation Solutions",
    table: "service_ai_automation",
    options: ["AI & Automation Solutions", "Other"],
  },
  "it-services": {
    label: "Information Technology Services",
    table: "service_it_services",
    options: groupItems("Information Technology Services"),
  },
  "staff-augmentation": {
    label: "Staff Augmentation",
    table: "service_staff_augmentation",
    options: groupItems("Staff Augmentation"),
  },
} as const satisfies Record<string, { label: string; table: string; options: readonly string[] }>;

export type ServiceFormKey = keyof typeof SERVICE_FORMS;

export const isServiceFormKey = (v: unknown): v is ServiceFormKey =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(SERVICE_FORMS, v);

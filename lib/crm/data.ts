import "server-only";
import { getPool } from "@/lib/db";
import { SERVICE_FORMS, type ServiceFormKey } from "@/lib/formOptions";

/*
 * Reading enquiries and payments for the CRM. Table names only ever come
 * from the fixed lists below, never from the request.
 */

export const ENQUIRY_STATUSES = ["new", "contacted", "closed"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export type EnquirySource = "contact" | ServiceFormKey;

export const SOURCES: Record<EnquirySource, { table: string; label: string; short: string; href: string }> = {
  contact: { table: "contact_enquiries", label: "Contact Enquiries", short: "Contact", href: "/crm/contact" },
  "digital-marketing": { table: SERVICE_FORMS["digital-marketing"].table, label: SERVICE_FORMS["digital-marketing"].label, short: "Digital Marketing", href: "/crm/services/digital-marketing" },
  "ai-automation": { table: SERVICE_FORMS["ai-automation"].table, label: SERVICE_FORMS["ai-automation"].label, short: "AI & Automation", href: "/crm/services/ai-automation" },
  "it-services": { table: SERVICE_FORMS["it-services"].table, label: SERVICE_FORMS["it-services"].label, short: "IT Services", href: "/crm/services/it-services" },
  "staff-augmentation": { table: SERVICE_FORMS["staff-augmentation"].table, label: SERVICE_FORMS["staff-augmentation"].label, short: "Staff Augmentation", href: "/crm/services/staff-augmentation" },
};

export const isEnquirySource = (v: unknown): v is EnquirySource =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(SOURCES, v);

export type EnquiryRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  website: string | null; // contact form
  country: string | null; // contact form
  timeline: string | null; // contact form
  industry: string;
  otherIndustry: string | null;
  service: string | null; // service tables: the form's fixed service
  interest: string; // contact: subject / service; service tables: category
  budget: string | null;
  message: string;
  sourcePage: string | null;
  pageUrl: string | null;
  status: EnquiryStatus;
  createdAt: string;
};

const PAGE_SIZE = 25;

export async function listEnquiries(source: EnquirySource, opts: { q?: string; status?: string; page?: number }) {
  const { table } = SOURCES[source];
  const isContact = source === "contact";
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (opts.status && (ENQUIRY_STATUSES as readonly string[]).includes(opts.status)) {
    where.push("status = ?");
    args.push(opts.status);
  }
  const q = (opts.q || "").trim().slice(0, 100);
  if (q) {
    const like = `%${q}%`;
    if (isContact) {
      where.push("(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR company_name LIKE ? OR country LIKE ?)");
      args.push(like, like, like, like, like);
    } else {
      where.push("(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR company_name LIKE ?)");
      args.push(like, like, like, like);
    }
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const page = Math.max(1, Math.floor(opts.page || 1));

  const pool = getPool();
  const [countRows] = await pool.query(`SELECT COUNT(*) AS n FROM \`${table}\` ${whereSql}`, args);
  const total = Number((countRows as { n: number }[])[0]?.n || 0);
  const [rows] = await pool.query(
    `SELECT * FROM \`${table}\` ${whereSql} ORDER BY created_at DESC, id DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
    args
  );

  const items: EnquiryRow[] = (rows as Record<string, unknown>[]).map((r) => ({
    id: Number(r.id),
    name: String(r.full_name ?? ""),
    email: String(r.email ?? ""),
    phone: (r.phone as string) || null,
    company: (r.company_name as string) || null,
    website: isContact ? ((r.company_website as string) || null) : null,
    country: isContact ? ((r.country as string) || null) : null,
    timeline: isContact ? ((r.timeline as string) || null) : null,
    industry: String(r.industry ?? ""),
    otherIndustry: (r.other_industry as string) || null,
    service: isContact ? null : ((r.service as string) || SOURCES[source].label),
    interest: String((isContact ? r.project_type : r.category) ?? ""),
    budget: (r.budget as string) || null,
    message: String(r.message ?? ""),
    sourcePage: isContact ? null : ((r.source_page as string) || null),
    pageUrl: (r.page_url as string) || null,
    status: (r.status as EnquiryStatus) || "new",
    createdAt: new Date(r.created_at as string).toISOString(),
  }));

  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), pageSize: PAGE_SIZE };
}

/* ---- Payments --------------------------------------------------------------------------- */

export const PAYMENT_STATUSES = ["paid", "pending", "partially_paid", "refunded", "failed"] as const;
export const PAYMENT_METHODS = ["Bank Transfer", "Credit / Debit Card", "PayPal", "Stripe", "Zelle", "Wire Transfer", "Check", "Cash", "UPI", "Other"] as const;
export const CURRENCIES = ["USD", "INR", "EUR", "GBP", "AED", "CAD", "AUD"] as const;
export const PAYMENT_SERVICES = [
  "AI-Powered Digital Marketing Services",
  "AI & Automation Solutions",
  "Information Technology Services",
  "Staff Augmentation",
  "YouTube Video Promotion",
  "AI Video Production",
  "Other",
] as const;

export type PaymentRow = {
  id: number;
  clientName: string;
  clientEmail: string | null;
  companyName: string | null;
  service: string;
  description: string | null;
  amount: number;
  currency: string;
  method: string;
  status: (typeof PAYMENT_STATUSES)[number];
  source: "manual" | "online";
  reference: string | null;
  invoiceNumber: string | null;
  paidAt: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
};

export async function listPayments(opts: { q?: string; status?: string; page?: number }) {
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (opts.status && (PAYMENT_STATUSES as readonly string[]).includes(opts.status)) {
    where.push("p.status = ?");
    args.push(opts.status);
  }
  const q = (opts.q || "").trim().slice(0, 100);
  if (q) {
    where.push("(p.client_name LIKE ? OR p.client_email LIKE ? OR p.company_name LIKE ? OR p.invoice_number LIKE ? OR p.reference LIKE ?)");
    const like = `%${q}%`;
    args.push(like, like, like, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const page = Math.max(1, Math.floor(opts.page || 1));
  const pool = getPool();
  const [countRows] = await pool.query(`SELECT COUNT(*) AS n FROM payments p ${whereSql}`, args);
  const total = Number((countRows as { n: number }[])[0]?.n || 0);
  const [rows] = await pool.query(
    `SELECT p.*, u.name AS created_by_name FROM payments p LEFT JOIN crm_users u ON u.id = p.created_by
     ${whereSql} ORDER BY COALESCE(p.paid_at, DATE(p.created_at)) DESC, p.id DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
    args
  );
  const items: PaymentRow[] = (rows as Record<string, unknown>[]).map((r) => ({
    id: Number(r.id),
    clientName: String(r.client_name ?? ""),
    clientEmail: (r.client_email as string) || null,
    companyName: (r.company_name as string) || null,
    service: String(r.service ?? ""),
    description: (r.description as string) || null,
    amount: Number(r.amount),
    currency: String(r.currency ?? "USD"),
    method: String(r.method ?? ""),
    status: r.status as PaymentRow["status"],
    source: (r.source as PaymentRow["source"]) || "manual",
    reference: (r.reference as string) || null,
    invoiceNumber: (r.invoice_number as string) || null,
    paidAt: r.paid_at ? toDateOnly(r.paid_at) : null,
    notes: (r.notes as string) || null,
    createdBy: (r.created_by_name as string) || null,
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), pageSize: PAGE_SIZE };
}

function toDateOnly(v: unknown): string {
  if (v instanceof Date) {
    const y = v.getFullYear(), m = String(v.getMonth() + 1).padStart(2, "0"), d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(v).slice(0, 10);
}

/* ---- Dashboard -------------------------------------------------------------------------- */

export async function dashboardStats() {
  const pool = getPool();
  const perSource = await Promise.all(
    (Object.keys(SOURCES) as EnquirySource[]).map(async (key) => {
      const [rows] = await pool.query(
        `SELECT COUNT(*) AS total,
                SUM(status = 'new') AS fresh,
                SUM(created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')) AS month
           FROM \`${SOURCES[key].table}\``
      );
      const r = (rows as Record<string, unknown>[])[0] || {};
      return { key, label: SOURCES[key].short, href: SOURCES[key].href, total: Number(r.total || 0), fresh: Number(r.fresh || 0), month: Number(r.month || 0) };
    })
  );

  const recentSql = (Object.keys(SOURCES) as EnquirySource[])
    .map((key) => `(SELECT id, full_name, email, status, created_at, '${key}' AS src FROM \`${SOURCES[key].table}\` ORDER BY created_at DESC LIMIT 6)`)
    .join(" UNION ALL ");
  const [recentRows] = await pool.query(`SELECT * FROM (${recentSql}) t ORDER BY created_at DESC LIMIT 6`);
  const recent = (recentRows as Record<string, unknown>[]).map((r) => ({
    id: Number(r.id),
    name: String(r.full_name ?? ""),
    email: String(r.email ?? ""),
    status: String(r.status ?? "new"),
    source: r.src as EnquirySource,
    createdAt: new Date(r.created_at as string).toISOString(),
  }));

  const [payRows] = await pool.query(
    `SELECT currency,
            SUM(CASE WHEN status IN ('paid','partially_paid') THEN amount ELSE 0 END) AS received,
            SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pending,
            SUM(CASE WHEN status IN ('paid','partially_paid') AND paid_at >= DATE_FORMAT(NOW(), '%Y-%m-01') THEN amount ELSE 0 END) AS month,
            COUNT(*) AS n
       FROM payments GROUP BY currency ORDER BY received DESC`
  );
  const payments = (payRows as Record<string, unknown>[]).map((r) => ({
    currency: String(r.currency),
    received: Number(r.received || 0),
    pending: Number(r.pending || 0),
    month: Number(r.month || 0),
    count: Number(r.n || 0),
  }));

  return { perSource, recent, payments };
}

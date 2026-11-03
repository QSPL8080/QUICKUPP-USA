import "server-only";
import { getPool } from "@/lib/db";
import { SERVICE_FORMS } from "@/lib/formOptions";
import { ENQUIRY_STATUSES, isEnquirySource, type EnquirySource, type EnquiryStatus } from "@/lib/crm/leadOptions";

/*
 * Reading enquiries and payments for the CRM. Table names only ever come
 * from the fixed lists below, never from the request.
 */

export { ENQUIRY_STATUSES, isEnquirySource } from "@/lib/crm/leadOptions";
export type { EnquiryStatus, EnquirySource } from "@/lib/crm/leadOptions";

export const SOURCES: Record<EnquirySource, { table: string; label: string; short: string; href: string }> = {
  contact: { table: "contact_enquiries", label: "Contact Enquiries", short: "Contact", href: "/crm/enquiries?source=contact" },
  "digital-marketing": { table: SERVICE_FORMS["digital-marketing"].table, label: SERVICE_FORMS["digital-marketing"].label, short: "Digital Marketing", href: "/crm/enquiries?source=digital-marketing" },
  "ai-automation": { table: SERVICE_FORMS["ai-automation"].table, label: SERVICE_FORMS["ai-automation"].label, short: "AI & Automation", href: "/crm/enquiries?source=ai-automation" },
  "it-services": { table: SERVICE_FORMS["it-services"].table, label: SERVICE_FORMS["it-services"].label, short: "IT Services", href: "/crm/enquiries?source=it-services" },
  "staff-augmentation": { table: SERVICE_FORMS["staff-augmentation"].table, label: SERVICE_FORMS["staff-augmentation"].label, short: "Staff Augmentation", href: "/crm/enquiries?source=staff-augmentation" },
  youtube: { table: SERVICE_FORMS["youtube"].table, label: SERVICE_FORMS["youtube"].label, short: "YouTube", href: "/crm/enquiries?source=youtube" },
  manual: { table: "manual_leads", label: "Manual Leads", short: "Manual", href: "/crm/enquiries?source=manual" },
};

/** Full details of one lead (detail drawer) */
export type EnquiryRow = {
  source: EnquirySource;
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  website: string | null;
  country: string | null;
  timeline: string | null;
  industry: string;
  otherIndustry: string | null;
  service: string | null; // service forms / manual: the service group
  interest: string; // contact: service chosen; service forms / manual: the service page
  budget: string | null;
  youtubeLink?: string | null;
  message: string;
  sourcePage: string | null;
  pageUrl: string | null;
  channel: string | null; // manual leads
  assignedTo: string | null; // manual leads
  createdBy: string | null; // manual leads
  status: EnquiryStatus;
  createdAt: string;
};

/** One line of the All Enquiries list */
export type LeadRow = {
  key: string; // "source:id"
  source: EnquirySource;
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string | null;
  detail: string;
  status: EnquiryStatus;
  createdAt: string;
};

const PAGE_SIZE = 25;

/* one SELECT per source with the same columns, so they can be listed together */
const UNION_SQL = (Object.keys(SOURCES) as EnquirySource[])
  .map((k) => {
    const detail = k === "contact" ? "project_type" : k === "youtube" ? "''" : "category";
    const service = k === "contact" ? "NULL" : "service";
    return `SELECT '${k}' AS src, id, full_name, email, phone, company_name, ${detail} AS detail, ${service} AS service, status, created_at FROM \`${SOURCES[k].table}\``;
  })
  .join(" UNION ALL ");

export type LeadFilters = { q?: string; source?: string; status?: string; from?: string; to?: string };

function leadWhere(f: LeadFilters) {
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (f.source === "services") {
    where.push("src IN ('digital-marketing', 'ai-automation', 'it-services', 'staff-augmentation')");
  } else if (f.source && isEnquirySource(f.source)) {
    where.push("src = ?");
    args.push(f.source);
  }
  if (f.status && (ENQUIRY_STATUSES as readonly string[]).includes(f.status)) {
    where.push("status = ?");
    args.push(f.status);
  }
  if (f.from && /^\d{4}-\d{2}-\d{2}$/.test(f.from)) {
    where.push("created_at >= ?");
    args.push(`${f.from} 00:00:00`);
  }
  if (f.to && /^\d{4}-\d{2}-\d{2}$/.test(f.to)) {
    where.push("created_at < ? + INTERVAL 1 DAY");
    args.push(`${f.to} 00:00:00`);
  }
  const q = (f.q || "").trim().slice(0, 100);
  if (q) {
    const like = `%${q}%`;
    where.push("(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR company_name LIKE ? OR detail LIKE ?)");
    args.push(like, like, like, like, like);
  }
  return { sql: where.length ? `WHERE ${where.join(" AND ")}` : "", args };
}

const toLead = (r: Record<string, unknown>): LeadRow => ({
  key: `${r.src}:${r.id}`,
  source: r.src as EnquirySource,
  id: Number(r.id),
  name: String(r.full_name ?? ""),
  email: String(r.email ?? ""),
  phone: (r.phone as string) || null,
  company: (r.company_name as string) || null,
  service: (r.service as string) || null,
  detail: String(r.detail ?? ""),
  status: ((ENQUIRY_STATUSES as readonly string[]).includes(String(r.status)) ? r.status : "new") as EnquiryStatus,
  createdAt: new Date(r.created_at as string).toISOString(),
});

/** Every lead from every form (and manual ones), newest first */
export async function listLeads(f: LeadFilters & { page?: number }) {
  const { sql, args } = leadWhere(f);
  const page = Math.max(1, Math.floor(f.page || 1));
  const pool = getPool();
  const [countRows] = await pool.query(`SELECT COUNT(*) AS n FROM (${UNION_SQL}) t ${sql}`, args);
  const total = Number((countRows as { n: number }[])[0]?.n || 0);

  const [tabCounts] = await pool.query(`
    SELECT
      COUNT(*) AS all_count,
      SUM(CASE WHEN src = 'contact' THEN 1 ELSE 0 END) AS contact_count,
      SUM(CASE WHEN src IN ('digital-marketing', 'ai-automation', 'it-services', 'staff-augmentation') THEN 1 ELSE 0 END) AS services_count,
      SUM(CASE WHEN src = 'youtube' THEN 1 ELSE 0 END) AS youtube_count,
      SUM(CASE WHEN src = 'manual' THEN 1 ELSE 0 END) AS manual_count
    FROM (${UNION_SQL}) t
  `);
  const tc = (tabCounts as Record<string, unknown>[])?.[0] || {};
  const counts = {
    all: Number(tc.all_count || 0),
    contact: Number(tc.contact_count || 0),
    services: Number(tc.services_count || 0),
    youtube: Number(tc.youtube_count || 0),
    manual: Number(tc.manual_count || 0),
  };

  const [rows] = await pool.query(
    `SELECT * FROM (${UNION_SQL}) t ${sql} ORDER BY created_at DESC, id DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
    args
  );
  return { items: (rows as Record<string, unknown>[]).map(toLead), total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), pageSize: PAGE_SIZE, counts };
}

/** The same list without paging, for the CSV export (capped) */
export async function exportLeads(f: LeadFilters) {
  const { sql, args } = leadWhere(f);
  const [rows] = await getPool().query(`SELECT * FROM (${UNION_SQL}) t ${sql} ORDER BY created_at DESC, id DESC LIMIT 10000`, args);
  return (rows as Record<string, unknown>[]).map(toLead);
}

/** One lead with every field its form collected */
export async function getLead(source: EnquirySource, id: number): Promise<EnquiryRow | null> {
  const { table } = SOURCES[source];
  const [rows] =
    source === "manual"
      ? await getPool().query(`SELECT m.*, u.name AS created_by_name FROM manual_leads m LEFT JOIN crm_users u ON u.id = m.created_by WHERE m.id = ?`, [id])
      : await getPool().query(`SELECT * FROM \`${table}\` WHERE id = ?`, [id]);
  const r = (rows as Record<string, unknown>[])[0];
  if (!r) return null;
  const isContact = source === "contact";
  const isManual = source === "manual";
  const hasExtra = isContact || isManual;
  return {
    source,
    id: Number(r.id),
    name: String(r.full_name ?? ""),
    email: String(r.email ?? ""),
    phone: (r.phone as string) || null,
    company: (r.company_name as string) || null,
    website: (r.company_website as string) || null,
    country: (r.country as string) || null,
    timeline: (r.timeline as string) || null,
    industry: String(r.industry ?? ""),
    otherIndustry: (r.other_industry as string) || null,
    service: isContact ? null : ((r.service as string) || SOURCES[source].label),
    interest: String((isContact ? r.project_type : source === "youtube" ? "" : r.category) ?? ""),
    budget: (r.budget as string) || null,
    youtubeLink: (r.youtube_link as string) || null,
    message: String(r.message ?? ""),
    sourcePage: isContact || isManual ? null : ((r.source_page as string) || null),
    pageUrl: isManual ? null : ((r.page_url as string) || null),
    channel: isManual ? ((r.lead_channel as string) || null) : null,
    assignedTo: isManual ? ((r.assigned_to as string) || null) : null,
    createdBy: isManual ? ((r.created_by_name as string) || null) : null,
    status: ((ENQUIRY_STATUSES as readonly string[]).includes(String(r.status)) ? r.status : "new") as EnquiryStatus,
    createdAt: new Date(r.created_at as string).toISOString(),
  };
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
  clientPhone?: string | null;
  companyName: string | null;
  category?: string | null;
  service: string;
  description: string | null;
  amount: number;
  totalAmount?: number | null;
  paymentType?: "full" | "partial";
  remainingAmount?: number | null;
  currency: string;
  method: string;
  status: (typeof PAYMENT_STATUSES)[number];
  source: "website" | "payment_link" | "manual" | "online";
  reference: string | null;
  paypalOrderId?: string | null;
  billingStartDate?: string | null;
  billingEndDate?: string | null;
  invoiceNumber: string | null;
  paidAt: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
};

export async function listPayments(opts: {
  q?: string;
  status?: string;
  tab?: "website" | "payment_link" | "all";
  page?: number;
}) {
  const pool = getPool();
  const currentTab = opts.tab || "website";

  // Tab counts
  const [tabCounts] = await pool.query(`
    SELECT
      SUM(CASE WHEN source IN ('website', 'online') THEN 1 ELSE 0 END) AS website_count,
      SUM(CASE WHEN source IN ('payment_link', 'manual') THEN 1 ELSE 0 END) AS payment_link_count,
      COUNT(*) AS all_count
    FROM payments
  `);
  const counts = (tabCounts as any[])?.[0] || {};
  const websiteCount = Number(counts.website_count || 0);
  const paymentLinkCount = Number(counts.payment_link_count || 0);
  const allCount = Number(counts.all_count || 0);

  const where: string[] = [];
  const args: (string | number)[] = [];

  if (currentTab === "website") {
    where.push("p.source IN ('website', 'online')");
  } else if (currentTab === "payment_link") {
    where.push("p.source IN ('payment_link', 'manual')");
  }

  if (opts.status && (PAYMENT_STATUSES as readonly string[]).includes(opts.status)) {
    where.push("p.status = ?");
    args.push(opts.status);
  }
  const q = (opts.q || "").trim().slice(0, 100);
  if (q) {
    where.push(
      "(p.client_name LIKE ? OR p.client_email LIKE ? OR p.client_phone LIKE ? OR p.company_name LIKE ? OR p.invoice_number LIKE ? OR p.reference LIKE ? OR p.paypal_order_id LIKE ? OR p.service LIKE ? OR p.category LIKE ?)"
    );
    const like = `%${q}%`;
    args.push(like, like, like, like, like, like, like, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const page = Math.max(1, Math.floor(opts.page || 1));
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
    clientPhone: (r.client_phone as string) || null,
    companyName: (r.company_name as string) || null,
    category: (r.category as string) || null,
    service: String(r.service ?? ""),
    description: (r.description as string) || null,
    amount: Number(r.amount),
    totalAmount: r.total_amount != null ? Number(r.total_amount) : null,
    paymentType: (r.payment_type as "full" | "partial") || "full",
    remainingAmount: r.remaining_amount != null ? Number(r.remaining_amount) : null,
    currency: String(r.currency ?? "USD"),
    method: String(r.method ?? ""),
    status: r.status as PaymentRow["status"],
    source: (r.source as PaymentRow["source"]) || "website",
    reference: (r.reference as string) || null,
    paypalOrderId: (r.paypal_order_id as string) || null,
    billingStartDate: r.billing_start_date ? toDateOnly(r.billing_start_date) : null,
    billingEndDate: r.billing_end_date ? toDateOnly(r.billing_end_date) : null,
    invoiceNumber: (r.invoice_number as string) || null,
    paidAt: r.paid_at ? toDateOnly(r.paid_at) : null,
    notes: (r.notes as string) || null,
    createdBy: (r.created_by_name as string) || null,
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
  return {
    items,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    pageSize: PAGE_SIZE,
    tab: currentTab,
    counts: {
      website: websiteCount,
      paymentLink: paymentLinkCount,
      all: allCount,
    },
  };
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

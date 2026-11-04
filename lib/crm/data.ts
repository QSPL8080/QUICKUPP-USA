import "server-only";
import { getPool } from "@/lib/db";
import { SERVICE_FORMS } from "@/lib/formOptions";
import { ENQUIRY_STATUSES, PROJECT_STATUSES, isEnquirySource, type EnquirySource, type EnquiryStatus, type ProjectStatus } from "@/lib/crm/leadOptions";

/*
 * Reading enquiries and payments for the CRM. Table names only ever come
 * from the fixed lists below, never from the request.
 */

export { ENQUIRY_STATUSES, PROJECT_STATUSES, isEnquirySource } from "@/lib/crm/leadOptions";
export type { EnquiryStatus, ProjectStatus, EnquirySource } from "@/lib/crm/leadOptions";

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
  category?: string | null;
  budget: string | null;
  youtubeLink?: string | null;
  message: string;
  sourcePage: string | null;
  pageUrl: string | null;
  channel: string | null; // manual leads
  assignedTo: string | null; // manual leads
  createdBy: string | null; // manual leads
  status: EnquiryStatus;
  projectStatus: string;
  attachments?: any[];
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
  assignedTo?: string | null;
  status: EnquiryStatus;
  projectStatus: string;
  createdAt: string;
};

const PAGE_SIZE = 25;

/* one SELECT per source with the same columns, so they can be listed together */
const UNION_SQL = (Object.keys(SOURCES) as EnquirySource[])
  .map((k) => {
    const detail = k === "contact" ? "COALESCE(category, project_type)" : k === "youtube" ? "''" : "category";
    const service = k === "contact" ? "project_type" : "service";
    return `SELECT '${k}' AS src, id, full_name, email, phone, company_name, ${detail} AS detail, ${service} AS service, assigned_to, status, COALESCE(NULLIF(TRIM(project_status), ''), 'Not Started') AS project_status, created_at FROM \`${SOURCES[k].table}\``;
  })
  .join(" UNION ALL ");

const UNION_SQL_SAFE = (Object.keys(SOURCES) as EnquirySource[])
  .map((k) => {
    const detail = k === "contact" ? "COALESCE(category, project_type)" : k === "youtube" ? "''" : "category";
    const service = k === "contact" ? "project_type" : "service";
    const assigned = k === "manual" ? "assigned_to" : "NULL AS assigned_to";
    return `SELECT '${k}' AS src, id, full_name, email, phone, company_name, ${detail} AS detail, ${service} AS service, ${assigned}, status, 'Not Started' AS project_status, created_at FROM \`${SOURCES[k].table}\``;
  })
  .join(" UNION ALL ");

export type LeadFilters = { q?: string; source?: string; status?: string; projectStatus?: string; from?: string; to?: string };

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
  if (f.projectStatus && (PROJECT_STATUSES as readonly string[]).includes(f.projectStatus)) {
    where.push("project_status = ?");
    args.push(f.projectStatus);
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
  assignedTo: (r.assigned_to as string) || null,
  status: ((ENQUIRY_STATUSES as readonly string[]).includes(String(r.status)) ? r.status : "new") as EnquiryStatus,
  projectStatus: String(r.project_status || "Not Started"),
  createdAt: new Date(r.created_at as string).toISOString(),
});

/** Every lead from every form (and manual ones), newest first */
export async function listLeads(f: LeadFilters & { page?: number }) {
  const { sql, args } = leadWhere(f);
  const page = Math.max(1, Math.floor(f.page || 1));
  const pool = getPool();
  let currentUnion = UNION_SQL;

  let countRows: any;
  try {
    [countRows] = await pool.query(`SELECT COUNT(*) AS n FROM (${currentUnion}) t ${sql}`, args);
  } catch (err: any) {
    if (err?.code === "ER_BAD_FIELD_ERROR" || String(err?.message || "").includes("assigned_to")) {
      currentUnion = UNION_SQL_SAFE;
      [countRows] = await pool.query(`SELECT COUNT(*) AS n FROM (${currentUnion}) t ${sql}`, args);
    } else {
      throw err;
    }
  }
  const total = Number((countRows as { n: number }[])[0]?.n || 0);

  let tabCounts: any;
  try {
    [tabCounts] = await pool.query(`
      SELECT
        COUNT(*) AS all_count,
        SUM(CASE WHEN src = 'contact' THEN 1 ELSE 0 END) AS contact_count,
        SUM(CASE WHEN src IN ('digital-marketing', 'ai-automation', 'it-services', 'staff-augmentation') THEN 1 ELSE 0 END) AS services_count,
        SUM(CASE WHEN src = 'youtube' THEN 1 ELSE 0 END) AS youtube_count,
        SUM(CASE WHEN src = 'manual' THEN 1 ELSE 0 END) AS manual_count
      FROM (${currentUnion}) t
    `);
  } catch {
    [tabCounts] = await pool.query(`
      SELECT
        COUNT(*) AS all_count,
        SUM(CASE WHEN src = 'contact' THEN 1 ELSE 0 END) AS contact_count,
        SUM(CASE WHEN src IN ('digital-marketing', 'ai-automation', 'it-services', 'staff-augmentation') THEN 1 ELSE 0 END) AS services_count,
        SUM(CASE WHEN src = 'youtube' THEN 1 ELSE 0 END) AS youtube_count,
        SUM(CASE WHEN src = 'manual' THEN 1 ELSE 0 END) AS manual_count
      FROM (${UNION_SQL_SAFE}) t
    `);
  }
  const tc = (tabCounts as Record<string, unknown>[])?.[0] || {};
  const counts = {
    all: Number(tc.all_count || 0),
    contact: Number(tc.contact_count || 0),
    services: Number(tc.services_count || 0),
    youtube: Number(tc.youtube_count || 0),
    manual: Number(tc.manual_count || 0),
  };

  let rows: any;
  try {
    [rows] = await pool.query(
      `SELECT * FROM (${currentUnion}) t ${sql} ORDER BY created_at DESC, id DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
      args
    );
  } catch {
    [rows] = await pool.query(
      `SELECT * FROM (${UNION_SQL_SAFE}) t ${sql} ORDER BY created_at DESC, id DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
      args
    );
  }
  return { items: (rows as Record<string, unknown>[]).map(toLead), total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), pageSize: PAGE_SIZE, counts };
}

/** The same list without paging, for the CSV export (capped) */
export async function exportLeads(f: LeadFilters) {
  const { sql, args } = leadWhere(f);
  try {
    const [rows] = await getPool().query(`SELECT * FROM (${UNION_SQL}) t ${sql} ORDER BY created_at DESC, id DESC LIMIT 10000`, args);
    return (rows as Record<string, unknown>[]).map(toLead);
  } catch {
    const [rows] = await getPool().query(`SELECT * FROM (${UNION_SQL_SAFE}) t ${sql} ORDER BY created_at DESC, id DESC LIMIT 10000`, args);
    return (rows as Record<string, unknown>[]).map(toLead);
  }
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
    service: isContact ? ((r.project_type as string) || "Contact Form") : ((r.service as string) || SOURCES[source].label),
    interest: String((isContact ? (r.category || r.project_type) : source === "youtube" ? "" : r.category) ?? ""),
    category: (r.category as string) || (r.project_type as string) || null,
    budget: (r.budget as string) || null,
    youtubeLink: (r.youtube_link as string) || null,
    message: String(r.message ?? ""),
    sourcePage: isContact || isManual ? null : ((r.source_page as string) || null),
    pageUrl: isManual ? null : ((r.page_url as string) || null),
    channel: isManual ? ((r.lead_channel as string) || null) : null,
    assignedTo: (r.assigned_to as string) || null,
    createdBy: isManual ? ((r.created_by_name as string) || null) : null,
    status: ((ENQUIRY_STATUSES as readonly string[]).includes(String(r.status)) ? r.status : "new") as EnquiryStatus,
    projectStatus: String(r.project_status || "Not Started"),
    attachments: (() => {
      if (typeof r.attachments === "string") {
        try {
          const parsed = JSON.parse(r.attachments);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return Array.isArray(r.attachments) ? r.attachments : [];
    })(),
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
  industry?: string | null;
  description: string | null;
  amount: number;
  totalAmount?: number | null;
  paymentType?: "full" | "partial";
  remainingAmount?: number | null;
  currency: string;
  method: string;
  status: string;
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
  token?: string | null;
  expiresAt?: string | null;
  linkStatus?: string | null;
  leadSource?: string | null;
  quantity?: string | null;
  balanceDueDate?: string | null;
  balanceReminderSentAt?: string | null;
};

export async function listPayments(opts: {
  q?: string;
  status?: string;
  tab?: "website" | "payment_link" | "all";
  page?: number;
}) {
  const pool = getPool();
  const currentTab = opts.tab || "all";

  // Tab counts
  let websiteCount = 0;
  let paymentLinkCount = 0;

  try {
    const [wRows] = await pool.query("SELECT COUNT(*) AS c FROM payments WHERE source IN ('website', 'online')");
    websiteCount = Number((wRows as any[])?.[0]?.c || 0);
  } catch {}

  try {
    const [pRows] = await pool.query("SELECT COUNT(*) AS c FROM payment_links");
    paymentLinkCount = Number((pRows as any[])?.[0]?.c || 0);
  } catch {
    try {
      const [fallbackRows] = await pool.query("SELECT COUNT(*) AS c FROM payments WHERE source IN ('payment_link', 'manual')");
      paymentLinkCount = Number((fallbackRows as any[])?.[0]?.c || 0);
    } catch {}
  }

  const allCount = websiteCount + paymentLinkCount;
  const counts = {
    website: websiteCount,
    paymentLink: paymentLinkCount,
    all: allCount,
  };

  const PAY_COLS = `id, client_name, client_email, client_phone, company_name, category, service, industry,
    description, amount, total_amount, payment_type, remaining_amount, currency, method, status,
    source, reference, paypal_order_id, billing_start_date, billing_end_date,
    balance_due_date, invoice_number, paid_at, notes, created_by, created_at, token, expires_at,
    link_status, lead_source, quantity, balance_reminder_sent_at`;

  let baseQuery = "";
  if (currentTab === "website") {
    baseQuery = `SELECT ${PAY_COLS} FROM payments WHERE source IN ('website', 'online')`;
  } else if (currentTab === "payment_link") {
    baseQuery = `SELECT ${PAY_COLS} FROM payment_links`;
  } else {
    baseQuery = `
      SELECT ${PAY_COLS} FROM payments WHERE source IN ('website', 'online')
      UNION ALL
      SELECT ${PAY_COLS} FROM payment_links
    `;
  }

  const where: string[] = [];
  const args: (string | number)[] = [];

  if (opts.status && (PAYMENT_STATUSES as readonly string[]).includes(opts.status as any)) {
    where.push("p.status = ?");
    args.push(opts.status);
  }
  const q = (opts.q || "").trim().slice(0, 100);
  if (q) {
    where.push(
      "(p.client_name LIKE ? OR p.client_email LIKE ? OR p.client_phone LIKE ? OR p.company_name LIKE ? OR p.invoice_number LIKE ? OR p.reference LIKE ? OR p.paypal_order_id LIKE ? OR p.service LIKE ? OR p.category LIKE ? OR p.token LIKE ?)"
    );
    const like = `%${q}%`;
    args.push(like, like, like, like, like, like, like, like, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const page = Math.max(1, Math.floor(opts.page || 1));

  let countRows: any;
  let rows: any;

  try {
    [countRows] = await pool.query(`SELECT COUNT(*) AS n FROM (${baseQuery}) p ${whereSql}`, args);
    [rows] = await pool.query(
      `SELECT p.*, u.name AS created_by_name FROM (${baseQuery}) p LEFT JOIN crm_users u ON u.id = p.created_by
       ${whereSql} ORDER BY COALESCE(p.paid_at, DATE(p.created_at)) DESC, p.id DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
      args
    );
  } catch (err: any) {
    // Graceful fallback if payment_links table has not been created yet in the DB
    const fallbackBase = `SELECT * FROM payments WHERE ${currentTab === "payment_link" ? "source IN ('payment_link', 'manual')" : currentTab === "website" ? "source IN ('website', 'online')" : "1=1"}`;
    [countRows] = await pool.query(`SELECT COUNT(*) AS n FROM (${fallbackBase}) p ${whereSql}`, args);
    [rows] = await pool.query(
      `SELECT p.*, u.name AS created_by_name FROM (${fallbackBase}) p LEFT JOIN crm_users u ON u.id = p.created_by
       ${whereSql} ORDER BY COALESCE(p.paid_at, DATE(p.created_at)) DESC, p.id DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
      args
    );
  }

  const total = Number((countRows as { n: number }[])[0]?.n || 0);
  const items: PaymentRow[] = (rows as Record<string, unknown>[]).map((r) => ({
    id: Number(r.id),
    clientName: String(r.client_name ?? ""),
    clientEmail: (r.client_email as string) || null,
    clientPhone: (r.client_phone as string) || null,
    companyName: (r.company_name as string) || null,
    category: (r.category as string) || null,
    service: String(r.service ?? ""),
    industry: (r.industry as string) || null,
    description: (r.description as string) || null,
    amount: Number(r.amount),
    totalAmount: r.total_amount != null ? Number(r.total_amount) : null,
    paymentType: (r.payment_type as "full" | "partial") || "full",
    remainingAmount: r.remaining_amount != null ? Number(r.remaining_amount) : null,
    currency: String(r.currency ?? "USD"),
    method: String(r.method ?? ""),
    status: (r.status as string) || "paid",
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
    token: (r.token as string) || null,
    expiresAt: r.expires_at ? new Date(r.expires_at as string).toISOString() : null,
    linkStatus: (r.link_status as string) || null,
    leadSource: (r.lead_source as string) || null,
    quantity: (r.quantity as string) || null,
    balanceDueDate: r.balance_due_date ? toDateOnly(r.balance_due_date) : null,
    balanceReminderSentAt: r.balance_reminder_sent_at ? new Date(r.balance_reminder_sent_at as string).toISOString() : null,
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

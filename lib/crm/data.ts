import "server-only";
import { getPool } from "@/lib/db";
import { INDUSTRY_TABLE, SERVICE_FORMS } from "@/lib/formOptions";
import { ENQUIRY_STATUSES, PROJECT_STATUSES, isEnquirySource, type EnquirySource, type EnquiryStatus } from "@/lib/crm/leadOptions";
import type { RowDataPacket } from "mysql2/promise";
import { errCode, errMessage } from "@/lib/err";
import { ensureLeadTables } from "@/lib/crm/ensureTables";
import { DEFAULT_TZ, dayEnd, dayStart } from "@/lib/crm/crmTime";

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
  industries: { table: INDUSTRY_TABLE, label: "Industry Page Enquiries", short: "Industries", href: "/crm/enquiries?source=industries" },
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
  attachments?: unknown[];
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
    const detail = k === "contact" ? "COALESCE(category, project_type)" : k === "youtube" ? "''" : k === "industries" ? "COALESCE(NULLIF(category, ''), service)" : "category";
    const service = k === "contact" ? "project_type" : "service";
    const channel = k === "manual" ? "COALESCE(NULLIF(lead_channel, ''), 'Manual')" : "'Website'";
    return `SELECT '${k}' AS src, id, full_name, email, phone, company_name, ${detail} AS detail, ${service} AS service, assigned_to, status, COALESCE(NULLIF(TRIM(project_status), ''), 'Not Started') AS project_status, ${channel} AS channel, created_at FROM \`${SOURCES[k].table}\``;
  })
  .join(" UNION ALL ");

const UNION_SQL_SAFE = (Object.keys(SOURCES) as EnquirySource[])
  .map((k) => {
    const detail = k === "contact" ? "COALESCE(category, project_type)" : k === "youtube" ? "''" : k === "industries" ? "COALESCE(NULLIF(category, ''), service)" : "category";
    const service = k === "contact" ? "project_type" : "service";
    const assigned = k === "manual" ? "assigned_to" : "NULL AS assigned_to";
    const channel = k === "manual" ? "COALESCE(NULLIF(lead_channel, ''), 'Manual')" : "'Website'";
    return `SELECT '${k}' AS src, id, full_name, email, phone, company_name, ${detail} AS detail, ${service} AS service, ${assigned}, status, 'Not Started' AS project_status, ${channel} AS channel, created_at FROM \`${SOURCES[k].table}\``;
  })
  .join(" UNION ALL ");

/* tz: the viewer's time zone, which the from/to days are in (see lib/crm/crmTime) */
export type LeadFilters = { q?: string; source?: string; status?: string; projectStatus?: string; channel?: string; from?: string; to?: string; tz?: string };

function leadWhere(f: LeadFilters) {
  const where: string[] = [];
  const args: (string | number | Date)[] = [];
  const tz = f.tz || DEFAULT_TZ;
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
  if (f.channel) {
    if (f.channel.toLowerCase() === "website") {
      where.push("(channel = 'Website' OR channel IS NULL)");
    } else {
      where.push("LOWER(channel) = ?");
      args.push(f.channel.toLowerCase());
    }
  }
  if (f.from && /^\d{4}-\d{2}-\d{2}$/.test(f.from)) {
    where.push("created_at >= ?");
    args.push(dayStart(f.from, tz));
  }
  if (f.to && /^\d{4}-\d{2}-\d{2}$/.test(f.to)) {
    where.push("created_at < ?");
    args.push(dayEnd(f.to, tz));
  }
  const q = (f.q || "").trim().slice(0, 100);
  if (q) {
    const like = `%${q}%`;
    where.push("(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR company_name LIKE ? OR detail LIKE ? OR service LIKE ?)");
    args.push(like, like, like, like, like, like);
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
  await ensureLeadTables();
  const { sql, args } = leadWhere(f);
  const page = Math.max(1, Math.floor(f.page || 1));
  const pool = getPool();
  let currentUnion = UNION_SQL;

  let countRows: RowDataPacket[];
  try {
    [countRows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS n FROM (${currentUnion}) t ${sql}`, args);
  } catch (err) {
    if (errCode(err) === "ER_BAD_FIELD_ERROR" || String(errMessage(err) || "").includes("assigned_to")) {
      currentUnion = UNION_SQL_SAFE;
      [countRows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS n FROM (${currentUnion}) t ${sql}`, args);
    } else {
      throw err;
    }
  }
  const total = Number((countRows as { n: number }[])[0]?.n || 0);

  // the tab badges count what each tab would show with the other filters (search, status, dates…)
  const others = leadWhere({ ...f, source: "" });
  const countSql = (union: string) => `
      SELECT
        COUNT(*) AS all_count,
        SUM(CASE WHEN src = 'contact' THEN 1 ELSE 0 END) AS contact_count,
        SUM(CASE WHEN src IN ('digital-marketing', 'ai-automation', 'it-services', 'staff-augmentation') THEN 1 ELSE 0 END) AS services_count,
        SUM(CASE WHEN src = 'youtube' THEN 1 ELSE 0 END) AS youtube_count,
        SUM(CASE WHEN src = 'industries' THEN 1 ELSE 0 END) AS industries_count,
        SUM(CASE WHEN src = 'manual' THEN 1 ELSE 0 END) AS manual_count
      FROM (${union}) t ${others.sql}`;
  let tabCounts: RowDataPacket[];
  try {
    [tabCounts] = await pool.query<RowDataPacket[]>(countSql(currentUnion), others.args);
  } catch {
    [tabCounts] = await pool.query<RowDataPacket[]>(countSql(UNION_SQL_SAFE), others.args);
  }
  const tc = (tabCounts as Record<string, unknown>[])?.[0] || {};
  const counts = {
    all: Number(tc.all_count || 0),
    contact: Number(tc.contact_count || 0),
    services: Number(tc.services_count || 0),
    youtube: Number(tc.youtube_count || 0),
    industries: Number(tc.industries_count || 0),
    manual: Number(tc.manual_count || 0),
  };

  let rows: RowDataPacket[];
  try {
    [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM (${currentUnion}) t ${sql} ORDER BY created_at DESC, id DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
      args
    );
  } catch {
    [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM (${UNION_SQL_SAFE}) t ${sql} ORDER BY created_at DESC, id DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
      args
    );
  }
  return { items: (rows as Record<string, unknown>[]).map(toLead), total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), pageSize: PAGE_SIZE, counts };
}

/** The same list without paging, for the CSV export (capped) */
export async function exportLeads(f: LeadFilters) {
  await ensureLeadTables();
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
  await ensureLeadTables();
  const { table } = SOURCES[source];
  const [rows] =
    source === "manual"
      ? await getPool().query(`SELECT m.*, u.name AS created_by_name FROM manual_leads m LEFT JOIN crm_users u ON u.id = m.created_by WHERE m.id = ?`, [id])
      : await getPool().query(`SELECT * FROM \`${table}\` WHERE id = ?`, [id]);
  const r = (rows as Record<string, unknown>[])[0];
  if (!r) return null;
  return toEnquiry(source, r);
}

/** One database row of a lead table → every field its form collected */
function toEnquiry(source: EnquirySource, r: Record<string, unknown>): EnquiryRow {
  const isContact = source === "contact";
  const isManual = source === "manual";
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

/**
 * Leads with every field, for the CSV export: the filtered list (same filters
 * as All Enquiries) or just the selected ones ("source:id" keys), newest first.
 */
export async function exportLeadDetails(f: LeadFilters, keys?: string[]): Promise<EnquiryRow[]> {
  await ensureLeadTables();
  const order: { source: EnquirySource; id: number }[] = keys?.length
    ? keys
        .map((k) => {
          const [s, raw] = String(k).split(":");
          return { source: s as EnquirySource, id: Number(raw) };
        })
        .filter((k) => isEnquirySource(k.source) && Number.isInteger(k.id) && k.id > 0)
    : (await exportLeads(f)).map((l) => ({ source: l.source, id: l.id }));
  const bySource = new Map<EnquirySource, number[]>();
  for (const k of order) bySource.set(k.source, [...(bySource.get(k.source) || []), k.id]);
  const found = new Map<string, EnquiryRow>();
  for (const [source, ids] of bySource) {
    for (let i = 0; i < ids.length; i += 500) {
      const chunk = ids.slice(i, i + 500);
      const [rows] =
        source === "manual"
          ? await getPool().query(`SELECT m.*, u.name AS created_by_name FROM manual_leads m LEFT JOIN crm_users u ON u.id = m.created_by WHERE m.id IN (?)`, [chunk])
          : await getPool().query(`SELECT * FROM \`${SOURCES[source].table}\` WHERE id IN (?)`, [chunk]);
      for (const r of rows as Record<string, unknown>[]) found.set(`${source}:${Number(r.id)}`, toEnquiry(source, r));
    }
  }
  const list = order.map((k) => found.get(`${k.source}:${k.id}`)).filter((x): x is EnquiryRow => Boolean(x));
  if (keys?.length) list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return list;
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
  /** which table the row lives in: ids are only unique within one table */
  table: "payments" | "payment_links";
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
  leadId?: number | null;
  quantity?: string | null;
  balanceDueDate?: string | null;
  balanceReminderSentAt?: string | null;
  balanceReminder10dSentAt?: string | null;
  balanceReminder2dSentAt?: string | null;
};

export async function listPayments(opts: {
  q?: string;
  status?: string;
  tab?: "website" | "payment_link" | "all";
  page?: number;
  from?: string;
  to?: string;
  /** the viewer's time zone, which the from/to days are in */
  tz?: string;
  /** every matching payment on one page (the CSV export) */
  all?: boolean;
}) {
  const pool = getPool();
  const currentTab = opts.tab || "all";
  const pageSize = opts.all ? 10000 : PAGE_SIZE;
  const tz = opts.tz || DEFAULT_TZ;

  const PAY_COLS = `id, client_name, client_email, client_phone, company_name, category, service, industry,
    description, amount, total_amount, payment_type, remaining_amount, currency, method, status,
    source, reference, paypal_order_id, billing_start_date, billing_end_date,
    balance_due_date, invoice_number, paid_at, notes, created_by, created_at, token, expires_at,
    link_status, lead_source, lead_id, quantity, balance_reminder_sent_at,
    balance_reminder_10d_sent_at, balance_reminder_2d_sent_at`;

  /*
   * Website Payments: checkouts on the website. Payment Links: the links made in
   * the CRM, plus any other payment record (older manual entries). All
   * Payments: both, so every record shows up somewhere.
   */
  const WEBSITE = `SELECT 'payments' AS tbl, ${PAY_COLS} FROM payments WHERE source IN ('website', 'online')`;
  const OTHER = `SELECT 'payments' AS tbl, ${PAY_COLS} FROM payments WHERE source IS NULL OR source NOT IN ('website', 'online')`;
  const LINKS = `SELECT 'payment_links' AS tbl, ${PAY_COLS} FROM payment_links`;
  const sets = (withLinks: boolean) => {
    const links = withLinks ? `${LINKS} UNION ALL ${OTHER}` : OTHER;
    return {
      all: `${WEBSITE} UNION ALL ${links}`,
      tab: currentTab === "website" ? WEBSITE : currentTab === "payment_link" ? links : `${WEBSITE} UNION ALL ${links}`,
    };
  };

  const where: string[] = [];
  const args: (string | number | Date)[] = [];

  if (opts.status && (PAYMENT_STATUSES as readonly string[]).includes(opts.status)) {
    where.push("p.status = ?");
    args.push(opts.status);
  }
  if (opts.from && /^\d{4}-\d{2}-\d{2}$/.test(opts.from)) {
    where.push("COALESCE(p.paid_at, p.created_at) >= ?");
    args.push(dayStart(opts.from, tz));
  }
  if (opts.to && /^\d{4}-\d{2}-\d{2}$/.test(opts.to)) {
    where.push("COALESCE(p.paid_at, p.created_at) < ?");
    args.push(dayEnd(opts.to, tz));
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

  const run = async (withLinks: boolean) => {
    const set = sets(withLinks);
    // the tab badges count what each tab would show with the same search, status and dates
    const [c] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS a, SUM(p.tbl = 'payments' AND p.source IN ('website', 'online')) AS w FROM (${set.all}) p ${whereSql}`,
      args
    );
    const [n] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS n FROM (${set.tab}) p ${whereSql}`, args);
    const [r] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, u.name AS created_by_name FROM (${set.tab}) p LEFT JOIN crm_users u ON u.id = p.created_by
       ${whereSql} ORDER BY COALESCE(p.paid_at, p.created_at) DESC, p.tbl ASC, p.id DESC LIMIT ${pageSize} OFFSET ${opts.all ? 0 : (page - 1) * PAGE_SIZE}`,
      args
    );
    return { c, n, r };
  };

  let result: Awaited<ReturnType<typeof run>>;
  try {
    result = await run(true);
  } catch {
    // payment_links not created yet
    result = await run(false);
  }
  const allCount = Number(result.c[0]?.a || 0);
  const websiteCount = Number(result.c[0]?.w || 0);
  const paymentLinkCount = allCount - websiteCount;
  const countRows = result.n;
  const rows = result.r;

  const total = Number((countRows as { n: number }[])[0]?.n || 0);
  const items: PaymentRow[] = (rows as Record<string, unknown>[]).map((r) => ({
    id: Number(r.id),
    table: r.tbl === "payment_links" ? "payment_links" : "payments",
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
    paidAt: r.paid_at ? new Date(r.paid_at as string).toISOString() : null,
    notes: (r.notes as string) || null,
    createdBy: (r.created_by_name as string) || null,
    createdAt: new Date(r.created_at as string).toISOString(),
    token: (r.token as string) || null,
    expiresAt: r.expires_at ? new Date(r.expires_at as string).toISOString() : null,
    linkStatus: (r.link_status as string) || null,
    leadSource: (r.lead_source as string) || null,
    leadId: r.lead_id ? Number(r.lead_id) : null,
    quantity: (r.quantity as string) || null,
    balanceDueDate: r.balance_due_date ? toDateOnly(r.balance_due_date) : null,
    balanceReminderSentAt: r.balance_reminder_sent_at ? new Date(r.balance_reminder_sent_at as string).toISOString() : null,
    balanceReminder10dSentAt: r.balance_reminder_10d_sent_at ? new Date(r.balance_reminder_10d_sent_at as string).toISOString() : null,
    balanceReminder2dSentAt: r.balance_reminder_2d_sent_at ? new Date(r.balance_reminder_2d_sent_at as string).toISOString() : null,
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

/** A DATE column (mysql2 gives a Date at local midnight) as YYYY-MM-DD */
export function toDateOnly(v: unknown): string {
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
      const [rows] = await pool.query<RowDataPacket[]>(
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

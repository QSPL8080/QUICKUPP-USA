import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { getPool } from "@/lib/db";
import { SOURCES, type EnquirySource } from "@/lib/crm/data";
import { ensureLeadTables } from "@/lib/crm/ensureTables";
import { SOURCE_LABEL, isEnquirySource } from "@/lib/crm/leadOptions";

/*
 * Clients: a lead becomes a client when the first payment for it comes in (a
 * deposit or the full amount, on a payment link or a payment recorded by hand).
 * The moment is kept on the lead (client_since, UTC) and shown on All
 * Enquiries, Calendly Meetings, Payments and the Clients tab.
 */

const PAID = ["paid", "partially_paid"];

/** Marks the lead as a client from now (the first time only) */
export async function markLeadClient(source: unknown, id: unknown) {
  const leadId = Number(id);
  if (!isEnquirySource(source) || !Number.isInteger(leadId) || leadId < 1) return;
  await getPool()
    .query(`UPDATE \`${SOURCES[source].table}\` SET client_since = UTC_TIMESTAMP() WHERE id = ? AND client_since IS NULL`, [leadId])
    .catch((err) => console.error("[clients] could not mark the lead as a client:", err));
}

/** After a payment record changed: when it is paid (in part or in full) and made for a lead, that lead is a client */
export async function markClientFromRecord(table: "payment_links" | "payments", id: number) {
  const [rows] = await getPool()
    .query<RowDataPacket[]>(`SELECT status, lead_source, lead_id FROM \`${table}\` WHERE id = ?`, [id])
    .catch(() => [[] as RowDataPacket[]]);
  const r = rows[0];
  if (r && PAID.includes(String(r.status)) && r.lead_id) await markLeadClient(r.lead_source, r.lead_id);
}

/** Which of these leads are clients ("source:id") */
export async function leadClientKeys(pairs: { source?: string | null; id?: number | null }[]): Promise<Set<string>> {
  const bySource = new Map<EnquirySource, number[]>();
  for (const p of pairs) if (isEnquirySource(p.source) && p.id) bySource.set(p.source, [...(bySource.get(p.source) || []), Number(p.id)]);
  const out = new Set<string>();
  for (const [src, ids] of bySource) {
    const [rows] = await getPool()
      .query<RowDataPacket[]>(`SELECT id FROM \`${SOURCES[src].table}\` WHERE id IN (?) AND client_since IS NOT NULL`, [[...new Set(ids)]])
      .catch(() => [[] as RowDataPacket[]]);
    for (const r of rows) out.add(`${src}:${Number(r.id)}`);
  }
  return out;
}

/* ---------------------------------------------------------------- the Clients tab */

export type ClientPayment = {
  table: "payment_links" | "payments";
  id: number;
  orderNumber: string;
  service: string;
  category: string | null;
  currency: string;
  total: number;
  paid: number;
  remaining: number;
  status: string;
  paymentType: string;
  paidAt: string | null;
  createdAt: string;
  /** the pay link for the balance, while part is still to pay */
  balanceToken: string | null;
  balanceDueDate: string | null;
};

export type ClientDoc = { id: string; fileName: string; fileSize: number; docType: string | null; uploadedByName: string | null; createdAt: string };

export type ClientItem = {
  key: string;
  source: EnquirySource;
  sourceLabel: string;
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string | null;
  assignedTo: string | null;
  clientSince: string;
  payments: ClientPayment[];
  currency: string;
  totalPaid: number;
  totalDue: number;
  docs: ClientDoc[];
};

const PAGE_SIZE = 25;
const isoOf = (v: unknown) => (v instanceof Date ? v.toISOString() : v ? new Date(String(v)).toISOString() : null);

function docsOf(raw: unknown): ClientDoc[] {
  let list: Record<string, unknown>[] = [];
  try {
    list = Array.isArray(raw) ? raw : raw ? JSON.parse(String(raw)) : [];
  } catch {}
  return (Array.isArray(list) ? list : []).map((a) => ({
    id: String(a.id),
    fileName: String(a.fileName || "file"),
    fileSize: Number(a.fileSize || 0),
    docType: a.docType ? String(a.docType) : null,
    uploadedByName: a.uploadedByName ? String(a.uploadedByName) : null,
    createdAt: String(a.createdAt || ""),
  }));
}

/** The clients (leads that have paid), newest client first, with their payments and documents */
export async function listClients(opts: { q?: string; page?: number; from?: string; to?: string }) {
  await ensureLeadTables();
  const q = (opts.q || "").trim().slice(0, 100);
  const parts = (Object.keys(SOURCES) as EnquirySource[]).map(
    (k) =>
      `SELECT '${k}' AS src, id, full_name, email, phone, company_name, ${k === "contact" ? "project_type" : "service"} AS service, assigned_to, client_since, attachments FROM \`${SOURCES[k].table}\` WHERE client_since IS NOT NULL`
  );
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (q) {
    const like = `%${q}%`;
    where.push("(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR company_name LIKE ? OR service LIKE ?)");
    args.push(like, like, like, like, like);
  }
  if (opts.from) {
    where.push("client_since >= ?");
    args.push(`${opts.from} 00:00:00`);
  }
  if (opts.to) {
    where.push("client_since <= ?");
    args.push(`${opts.to} 23:59:59`);
  }
  const union = `(${parts.join(" UNION ALL ")}) c${where.length ? ` WHERE ${where.join(" AND ")}` : ""}`;
  const pool = getPool();
  const [countRows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS n FROM ${union}`, args);
  const total = Number(countRows[0]?.n || 0);
  const page = Math.max(1, Math.floor(opts.page || 1));
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM ${union} ORDER BY client_since DESC, id DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`, args);

  const items: ClientItem[] = rows.map((r) => ({
    key: `${r.src}:${r.id}`,
    source: r.src as EnquirySource,
    sourceLabel: SOURCE_LABEL[r.src as EnquirySource] || "",
    id: Number(r.id),
    name: String(r.full_name || ""),
    email: String(r.email || ""),
    phone: r.phone ? String(r.phone) : null,
    company: r.company_name ? String(r.company_name) : null,
    service: r.service ? String(r.service) : null,
    assignedTo: r.assigned_to ? String(r.assigned_to) : null,
    clientSince: isoOf(r.client_since) || "",
    payments: [],
    currency: "USD",
    totalPaid: 0,
    totalDue: 0,
    docs: docsOf(r.attachments),
  }));

  // their payments (payment links and payments recorded for the lead)
  if (items.length) {
    const byKey = new Map(items.map((c) => [c.key, c]));
    const cond = items.map(() => "(lead_source = ? AND lead_id = ?)").join(" OR ");
    const condArgs = items.flatMap((c) => [c.source, c.id]);
    for (const table of ["payment_links", "payments"] as const) {
      const [prow] = await pool
        .query<RowDataPacket[]>(
          `SELECT id, lead_source, lead_id, invoice_number, service, category, currency, total_amount, amount, remaining_amount, status, payment_type,
                  link_status, token, paid_at, created_at, balance_due_date
             FROM \`${table}\` WHERE ${cond} ORDER BY created_at DESC`,
          condArgs
        )
        .catch(() => [[] as RowDataPacket[]]);
      for (const p of prow) {
        const c = byKey.get(`${p.lead_source}:${p.lead_id}`);
        if (!c) continue;
        const status = String(p.status || "");
        const total = Number(p.total_amount || p.amount || 0);
        const paid = PAID.includes(status) ? Number(p.amount || 0) : 0;
        const remaining = status === "partially_paid" ? Number(p.remaining_amount || 0) : 0;
        c.payments.push({
          table,
          id: Number(p.id),
          orderNumber: String(p.invoice_number || `#${p.id}`),
          service: String(p.service || ""),
          category: p.category ? String(p.category) : null,
          currency: String(p.currency || "USD"),
          total,
          paid,
          remaining,
          status,
          paymentType: String(p.payment_type || "full"),
          paidAt: isoOf(p.paid_at),
          createdAt: isoOf(p.created_at) || "",
          balanceToken: remaining > 0 && p.token && p.link_status !== "cancelled" ? String(p.token) : null,
          balanceDueDate: p.balance_due_date ? String(isoOf(p.balance_due_date)).slice(0, 10) : null,
        });
      }
    }
    for (const c of items) {
      c.payments.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      c.currency = c.payments.find((p) => p.paid > 0)?.currency || c.payments[0]?.currency || "USD";
      c.totalPaid = c.payments.reduce((a, p) => a + p.paid, 0);
      c.totalDue = c.payments.reduce((a, p) => a + p.remaining, 0);
    }
  }
  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), pageSize: PAGE_SIZE };
}

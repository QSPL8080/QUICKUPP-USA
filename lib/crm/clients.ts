import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { getPool } from "@/lib/db";
import { SOURCES, type EnquirySource } from "@/lib/crm/data";
import { ensureLeadTables } from "@/lib/crm/ensureTables";
import { SOURCE_LABEL, clientCode, enquiryCode, isEnquirySource } from "@/lib/crm/leadOptions";
import { addAlerts } from "@/lib/crm/alerts";
import { audit } from "@/lib/crm/audit";

/*
 * Clients: a lead becomes a client when the first payment for it comes in (a
 * deposit or the full amount, on a payment link or a payment recorded by hand).
 * The moment is kept on the lead (client_since, UTC) and shown on All
 * Enquiries, Calendly Meetings, Payments and the Clients tab.
 */

const PAID = ["paid", "partially_paid"];

/** The Admins, the Super Admin and the Accountants: who hears about payments and new clients */
async function financeTeam() {
  const [rows] = await getPool()
    .query<RowDataPacket[]>("SELECT id, name, email, role FROM crm_users WHERE role IN ('super_admin', 'admin', 'accountant') AND is_active = 1 AND deleted_at IS NULL")
    .catch(() => [[] as RowDataPacket[]]);
  return rows.map((r) => ({ id: Number(r.id), name: String(r.name), role: String(r.role) }));
}

/**
 * Marks the lead as a client from now, the first time only: the single UPDATE with
 * "client_since IS NULL" makes the conversion happen exactly once, however many
 * payments come in. `by` says what made it a client (a PayPal payment, or the team
 * member who recorded the payment). Returns true when it became a client now.
 */
export async function markLeadClient(source: unknown, id: unknown, by = "System (PayPal payment)"): Promise<boolean> {
  const leadId = Number(id);
  if (!isEnquirySource(source) || !Number.isInteger(leadId) || leadId < 1) return false;
  const table = SOURCES[source].table;
  const pool = getPool();
  try {
    const [res] = await pool
      .query(`UPDATE \`${table}\` SET client_since = UTC_TIMESTAMP(), client_by = ? WHERE id = ? AND client_since IS NULL`, [by.slice(0, 190), leadId])
      .catch(async (err) => {
        // client_by comes with a later database update
        if ((err as { code?: string }).code !== "ER_BAD_FIELD_ERROR") throw err;
        return pool.query(`UPDATE \`${table}\` SET client_since = UTC_TIMESTAMP() WHERE id = ? AND client_since IS NULL`, [leadId]);
      });
    const converted = Number((res as { affectedRows?: number }).affectedRows || 0) > 0;
    if (!converted) return false;
    // the Admins, the Super Admin and the Accountants hear about the new client
    const [lead] = await pool.query<RowDataPacket[]>(`SELECT full_name, company_name FROM \`${table}\` WHERE id = ?`, [leadId]).catch(() => [[] as RowDataPacket[]]);
    const name = String(lead[0]?.full_name || "A lead");
    const team = await financeTeam();
    await addAlerts(
      team.map((t) => t.id),
      {
        kind: "client_converted",
        title: `New client: ${name}`,
        sub: `${clientCode(source, leadId)}${lead[0]?.company_name ? ` · ${lead[0].company_name}` : ""} · ${by}`,
        href: `/crm/clients?open=${encodeURIComponent(`${source}:${leadId}`)}`,
      }
    );
    await audit({ name: by }, "client_converted", "lead", `${source}:${leadId}`, `${enquiryCode(source, leadId)} ${name} became client ${clientCode(source, leadId)}`);
    return true;
  } catch (err) {
    console.error("[clients] could not mark the lead as a client:", err);
    return false;
  }
}

/** After a payment record changed: when it is paid (in part or in full) and made for a lead, that lead is a client */
export async function markClientFromRecord(table: "payment_links" | "payments", id: number, by?: string) {
  const [rows] = await getPool()
    .query<RowDataPacket[]>(`SELECT status, lead_source, lead_id FROM \`${table}\` WHERE id = ?`, [id])
    .catch(() => [[] as RowDataPacket[]]);
  const r = rows[0];
  if (r && PAID.includes(String(r.status)) && r.lead_id) await markLeadClient(r.lead_source, r.lead_id, by);
}

/**
 * A verified PayPal payment came in (a deposit, the full amount, or the balance):
 * a CRM notification for the Admins, the Super Admin and the Accountants. Never throws.
 */
export async function notifyPaymentReceived(table: "payment_links" | "payments", id: number, kind: "deposit" | "full" | "balance") {
  try {
    const [rows] = await getPool()
      .query<RowDataPacket[]>(`SELECT client_name, invoice_number, amount, total_amount, remaining_amount, currency FROM \`${table}\` WHERE id = ?`, [id])
      .catch(() => [[] as RowDataPacket[]]);
    const r = rows[0];
    if (!r) return;
    const cur = String(r.currency || "USD");
    const fmt = (v: unknown) => `${cur === "USD" ? "$" : `${cur} `}${Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const order = String(r.invoice_number || `#${id}`);
    const title =
      kind === "balance"
        ? `Balance paid: ${r.client_name || "Client"}`
        : kind === "deposit"
          ? `Deposit received: ${r.client_name || "Client"}`
          : `Payment received: ${r.client_name || "Client"}`;
    const sub =
      kind === "deposit"
        ? `${order} · ${fmt(r.amount)} of ${fmt(r.total_amount)}, ${fmt(r.remaining_amount)} still due`
        : `${order} · ${fmt(r.total_amount || r.amount)} fully paid`;
    const team = await financeTeam();
    await addAlerts(
      team.map((t) => t.id),
      { kind: kind === "balance" ? "balance_paid" : "payment_received", title, sub, href: `/crm/payments?q=${encodeURIComponent(order)}` }
    );
  } catch (err) {
    console.error("[clients] could not send the payment notification:", err);
  }
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
  /** every PayPal (or recorded) payment on it, oldest first */
  transactions: { kind: string; amount: number; currency: string; status: string; transactionId: string | null; at: string }[];
};

export type ClientMeeting = { id: number; title: string; startTime: string | null; status: string; outcome: string | null };

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
  /** what made it a client: a PayPal payment, or the team member who recorded the payment */
  clientBy: string | null;
  payments: ClientPayment[];
  meetings: ClientMeeting[];
  currency: string;
  /** the agreed total across its payments, what was received, and what is still due */
  totalAgreed: number;
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
export async function listClients(opts: { q?: string; page?: number; from?: string; to?: string; key?: string }) {
  await ensureLeadTables();
  const q = (opts.q || "").trim().slice(0, 100);
  const unionOf = (withBy: boolean) =>
    (Object.keys(SOURCES) as EnquirySource[]).map(
      (k) =>
        `SELECT '${k}' AS src, id, full_name, email, phone, company_name, ${k === "contact" ? "project_type" : "service"} AS service, assigned_to, client_since, ${withBy ? "client_by" : "NULL AS client_by"}, attachments FROM \`${SOURCES[k].table}\` WHERE client_since IS NOT NULL`
    );
  let parts = unionOf(true);
  const where: string[] = [];
  const args: (string | number)[] = [];
  // one client (a link to it)
  const [kSrc, kId] = (opts.key || "").split(":");
  if (isEnquirySource(kSrc) && Number(kId) > 0) {
    where.push("src = ? AND id = ?");
    args.push(kSrc, Number(kId));
  }
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
  let union = `(${parts.join(" UNION ALL ")}) c${where.length ? ` WHERE ${where.join(" AND ")}` : ""}`;
  const pool = getPool();
  const [countRows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS n FROM ${union}`, args).catch(async (err) => {
    // client_by comes with a later database update
    if ((err as { code?: string }).code !== "ER_BAD_FIELD_ERROR") throw err;
    parts = unionOf(false);
    union = `(${parts.join(" UNION ALL ")}) c${where.length ? ` WHERE ${where.join(" AND ")}` : ""}`;
    return pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS n FROM ${union}`, args);
  });
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
    clientBy: r.client_by ? String(r.client_by) : null,
    payments: [],
    meetings: [],
    currency: "USD",
    totalAgreed: 0,
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
          transactions: [],
        });
      }
    }
    // each payment's transactions (deposit, balance, full), oldest first
    for (const table of ["payment_links", "payments"] as const) {
      const list = items.flatMap((c) => c.payments.filter((p) => p.table === table));
      if (!list.length) continue;
      const byId = new Map(list.map((p) => [p.id, p]));
      const [tx] = await pool
        .query<RowDataPacket[]>(
          "SELECT record_id, kind, amount, currency, status, transaction_id, created_at FROM payment_transactions WHERE record_table = ? AND record_id IN (?) ORDER BY created_at, id",
          [table, [...byId.keys()]]
        )
        .catch(() => [[] as RowDataPacket[]]);
      for (const t of tx) {
        byId.get(Number(t.record_id))?.transactions.push({
          kind: String(t.kind || ""),
          amount: Number(t.amount || 0),
          currency: String(t.currency || "USD"),
          status: String(t.status || ""),
          transactionId: t.transaction_id ? String(t.transaction_id) : null,
          at: isoOf(t.created_at) || "",
        });
      }
    }
    // the meetings held with them (Enquiry → Meeting → Payment → Client)
    const [mrows] = await pool
      .query<RowDataPacket[]>(
        `SELECT id, lead_source, lead_id, event_name, start_time, status, outcome FROM crm_meetings WHERE deleted_at IS NULL AND (${cond}) ORDER BY start_time DESC`,
        condArgs
      )
      .catch(() => [[] as RowDataPacket[]]);
    for (const m of mrows) {
      byKey.get(`${m.lead_source}:${m.lead_id}`)?.meetings.push({
        id: Number(m.id),
        title: String(m.event_name || "Meeting"),
        startTime: isoOf(m.start_time),
        status: String(m.status || ""),
        outcome: m.outcome ? String(m.outcome) : null,
      });
    }
    for (const c of items) {
      c.payments.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      c.currency = c.payments.find((p) => p.paid > 0)?.currency || c.payments[0]?.currency || "USD";
      c.totalAgreed = c.payments.filter((p) => p.paid > 0 || p.remaining > 0).reduce((a, p) => a + p.total, 0);
      c.totalPaid = c.payments.reduce((a, p) => a + p.paid, 0);
      c.totalDue = c.payments.reduce((a, p) => a + p.remaining, 0);
    }
  }
  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), pageSize: PAGE_SIZE };
}

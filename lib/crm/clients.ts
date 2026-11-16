import "server-only";
import { getPool } from "@/lib/db";
import { logActivity } from "@/lib/crm/activity";
import type { CrmUser } from "@/lib/crm/auth";
import { notifyClientConverted } from "@/lib/crm/userNotify";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { SOURCES, type EnquirySource } from "@/lib/crm/data";

export type ClientStatus = "active" | "onboarding" | "in_progress" | "completed" | "paused" | "churned";
export const CLIENT_STATUSES: readonly ClientStatus[] = ["active", "onboarding", "in_progress", "completed", "paused", "churned"];
export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  onboarding: "Onboarding",
  in_progress: "In Progress",
  active: "Active",
  completed: "Completed",
  paused: "Paused",
  churned: "Churned",
};

export type ClientDocument = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy?: string;
};

export type ClientRow = {
  id: number;
  leadId: number | null;
  leadSource: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  companyName: string | null;
  companyWebsite: string | null;
  country: string | null;
  industry: string | null;
  service: string | null;
  assignedBdmId: number | null;
  assignedBdmName: string | null;
  status: ClientStatus;
  totalBilled: number;
  totalPaid: number;
  totalBalance: number;
  currency: string;
  notes: string | null;
  documents: ClientDocument[];
  convertedAt: string;
  createdAt: string;
  updatedAt: string;
};

const PAGE_SIZE = 25;

const toClientRow = (r: Record<string, unknown>): ClientRow => ({
  id: Number(r.id),
  leadId: r.lead_id ? Number(r.lead_id) : null,
  leadSource: r.lead_source ? String(r.lead_source) : null,
  clientName: String(r.client_name ?? ""),
  clientEmail: String(r.client_email ?? ""),
  clientPhone: r.client_phone ? String(r.client_phone) : null,
  companyName: r.company_name ? String(r.company_name) : null,
  companyWebsite: r.company_website ? String(r.company_website) : null,
  country: r.country ? String(r.country) : null,
  industry: r.industry ? String(r.industry) : null,
  service: r.service ? String(r.service) : null,
  assignedBdmId: r.assigned_bdm_id ? Number(r.assigned_bdm_id) : null,
  assignedBdmName: r.assigned_bdm_name ? String(r.assigned_bdm_name) : null,
  status: (CLIENT_STATUSES.includes(r.status as ClientStatus) ? r.status : "onboarding") as ClientStatus,
  totalBilled: Number(r.total_billed || 0),
  totalPaid: Number(r.total_paid || 0),
  totalBalance: Number(r.total_balance || 0),
  currency: String(r.currency || "USD"),
  notes: r.notes ? String(r.notes) : null,
  documents: (() => {
    if (typeof r.documents === "string") {
      try {
        const parsed = JSON.parse(r.documents);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return Array.isArray(r.documents) ? (r.documents as ClientDocument[]) : [];
  })(),
  convertedAt: new Date(r.converted_at as string).toISOString(),
  createdAt: new Date(r.created_at as string).toISOString(),
  updatedAt: new Date(r.updated_at as string).toISOString(),
});

/**
 * List clients with search, status filters, BDM filters, and financial metrics.
 */
export async function listClients(opts: {
  q?: string;
  status?: string;
  bdm?: string;
  page?: number;
  all?: boolean;
}) {
  const pool = getPool();
  const where: string[] = ["deleted_at IS NULL"];
  const args: (string | number)[] = [];

  const q = (opts.q || "").trim().slice(0, 100);
  if (q) {
    where.push("(client_name LIKE ? OR client_email LIKE ? OR client_phone LIKE ? OR company_name LIKE ? OR service LIKE ? OR notes LIKE ?)");
    const like = `%${q}%`;
    args.push(like, like, like, like, like, like);
  }

  if (opts.status && (CLIENT_STATUSES as readonly string[]).includes(opts.status)) {
    where.push("status = ?");
    args.push(opts.status);
  }

  if (opts.bdm) {
    where.push("assigned_bdm_name = ?");
    args.push(opts.bdm);
  }

  const whereSql = `WHERE ${where.join(" AND ")}`;
  const page = Math.max(1, Math.floor(opts.page || 1));
  const pageSize = opts.all ? 10000 : PAGE_SIZE;

  // Counts & metrics
  const [metricRows] = await pool.query<RowDataPacket[]>(
    `SELECT
       COUNT(*) AS total_clients,
       COALESCE(SUM(total_billed), 0) AS total_billed,
       COALESCE(SUM(total_paid), 0) AS total_paid,
       COALESCE(SUM(total_balance), 0) AS total_balance,
       SUM(status = 'onboarding') AS count_onboarding,
       SUM(status = 'in_progress') AS count_in_progress,
       SUM(status = 'active') AS count_active,
       SUM(status = 'completed') AS count_completed,
       SUM(status = 'paused') AS count_paused,
       SUM(status = 'churned') AS count_churned
     FROM crm_clients WHERE deleted_at IS NULL`
  );
  const m = metricRows[0] || {};
  const metrics = {
    totalClients: Number(m.total_clients || 0),
    totalBilled: Number(m.total_billed || 0),
    totalPaid: Number(m.total_paid || 0),
    totalBalance: Number(m.total_balance || 0),
    counts: {
      all: Number(m.total_clients || 0),
      onboarding: Number(m.count_onboarding || 0),
      in_progress: Number(m.count_in_progress || 0),
      active: Number(m.count_active || 0),
      completed: Number(m.count_completed || 0),
      paused: Number(m.count_paused || 0),
      churned: Number(m.count_churned || 0),
    },
  };

  const [countRows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS n FROM crm_clients ${whereSql}`, args);
  const total = Number((countRows as { n: number }[])[0]?.n || 0);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM crm_clients ${whereSql} ORDER BY converted_at DESC, id DESC LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`,
    args
  );

  return {
    items: (rows as Record<string, unknown>[]).map(toClientRow),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    pageSize,
    metrics,
  };
}

/**
 * Get single client by ID with all payment history and documents.
 */
export async function getClient(id: number, allowDeleted = false) {
  const pool = getPool();
  const delSql = allowDeleted ? "" : " AND deleted_at IS NULL";
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM crm_clients WHERE id = ?${delSql}`, [id]);
  const raw = (rows as Record<string, unknown>[])[0];
  if (!raw) return null;
  const client = toClientRow(raw);

  // Fetch payment records linked by email or phone
  const email = client.clientEmail.trim().toLowerCase();
  const phone = (client.clientPhone || "").trim();
  const conditions: string[] = ["client_email = ?"];
  const args: (string | number)[] = [email];
  if (phone) {
    conditions.push("client_phone = ?");
    args.push(phone);
  }

  const [payments] = await pool.query<RowDataPacket[]>(
    `SELECT id, amount, total_amount, payment_type, remaining_amount, currency, method, status, invoice_number,
            paid_at, created_at, reference, service, category
     FROM payments WHERE (${conditions.join(" OR ")}) AND deleted_at IS NULL ORDER BY COALESCE(paid_at, created_at) DESC`,
    args
  );

  const [links] = await pool.query<RowDataPacket[]>(
    `SELECT id, amount, total_amount, payment_type, remaining_amount, currency, method, status, link_status, invoice_number,
            token, paid_at, created_at, service, category
     FROM payment_links WHERE (${conditions.join(" OR ")}) AND deleted_at IS NULL ORDER BY created_at DESC`,
    args
  );

  return {
    client,
    payments: payments as Record<string, unknown>[],
    paymentLinks: links as Record<string, unknown>[],
  };
}

/**
 * Automatically converts a lead into an active Client upon verified payment (partial or full).
 * If the client already exists by email, updates billing totals and logs conversion.
 */
export async function convertLeadToClient(params: {
  leadSource?: string | null;
  leadId?: number | null;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  companyName?: string | null;
  companyWebsite?: string | null;
  country?: string | null;
  industry?: string | null;
  service?: string | null;
  amountPaid: number;
  totalAmount?: number | null;
  currency?: string;
  assignedBdmId?: number | null;
  assignedBdmName?: string | null;
}): Promise<number> {
  const pool = getPool();
  const email = (params.clientEmail || "").trim().toLowerCase();
  if (!email) throw new Error("Client email is required for client conversion");

  const totalBilled = Math.max(params.amountPaid, Number(params.totalAmount || params.amountPaid));
  const totalPaid = Number(params.amountPaid);
  const totalBalance = Math.max(0, totalBilled - totalPaid);
  const currency = (params.currency || "USD").toUpperCase();

  // Check if client already exists
  const [existing] = await pool.query<RowDataPacket[]>(
    "SELECT id, total_billed, total_paid, total_balance, assigned_bdm_id, assigned_bdm_name FROM crm_clients WHERE client_email = ? AND deleted_at IS NULL LIMIT 1",
    [email]
  );
  const ex = (existing as { id: number; total_billed: number; total_paid: number; total_balance: number; assigned_bdm_id: number | null; assigned_bdm_name: string | null }[])[0];

  let clientId: number;
  if (ex) {
    clientId = ex.id;
    const newPaid = Number(ex.total_paid) + totalPaid;
    const newBilled = Number(ex.total_billed) + (params.totalAmount ? Number(params.totalAmount) : totalPaid);
    const newBalance = Math.max(0, newBilled - newPaid);
    await pool.query(
      `UPDATE crm_clients SET
         total_billed = ?,
         total_paid = ?,
         total_balance = ?,
         service = COALESCE(?, service),
         company_name = COALESCE(?, company_name),
         client_phone = COALESCE(?, client_phone),
         status = 'active',
         updated_at = NOW()
       WHERE id = ?`,
      [newBilled, newPaid, newBalance, params.service || null, params.companyName || null, params.clientPhone || null, clientId]
    );
  } else {
    const [res] = await pool.query<ResultSetHeader>(
      `INSERT INTO crm_clients (
         lead_id, lead_source, client_name, client_email, client_phone, company_name, company_website,
         country, industry, service, assigned_bdm_id, assigned_bdm_name, status,
         total_billed, total_paid, total_balance, currency, converted_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'onboarding', ?, ?, ?, ?, NOW())`,
      [
        params.leadId || null,
        params.leadSource || null,
        params.clientName.trim(),
        email,
        params.clientPhone?.trim() || null,
        params.companyName?.trim() || null,
        params.companyWebsite?.trim() || null,
        params.country?.trim() || null,
        params.industry?.trim() || null,
        params.service?.trim() || null,
        params.assignedBdmId || null,
        params.assignedBdmName || null,
        totalBilled,
        totalPaid,
        totalBalance,
        currency,
      ]
    );
    clientId = res.insertId;
  }

  // If lead is specified, update original lead status and project_status
  if (params.leadId && params.leadSource && params.leadSource in SOURCES) {
    const tbl = SOURCES[params.leadSource as EnquirySource]?.table;
    if (tbl) {
      await pool.query(
        `UPDATE \`${tbl}\` SET project_status = 'In Progress', status = 'closed' WHERE id = ? AND deleted_at IS NULL`,
        [params.leadId]
      ).catch(() => {});
    }
  }

  // User notifications & audit log
  void notifyClientConverted({
    clientName: params.clientName,
    clientEmail: email,
    service: params.service || "Quickupp Softech Services",
    amountPaid: totalPaid,
    currency,
    assignedBdmName: params.assignedBdmName || ex?.assigned_bdm_name || null,
  }).catch((e) => console.error("Failed to notify client conversion:", e));

  await logActivity({
    entity: "lead",
    id: params.leadId || clientId,
    action: "client_converted",
    text: `Client "${params.clientName}" (${email}) automatically converted to active client account with verified payment of ${currency} ${totalPaid.toFixed(2)}`,
    actor: { type: "system", label: "Payment System" },
  });

  return clientId;
}

/**
 * Update an existing client's details.
 */
export async function updateClient(
  id: number,
  data: Partial<ClientRow>,
  user: Pick<CrmUser, "id" | "name" | "role">
) {
  const pool = getPool();
  const sets: string[] = [];
  const args: (string | number | null)[] = [];

  if (data.clientName !== undefined) {
    sets.push("client_name = ?");
    args.push(data.clientName.trim());
  }
  if (data.clientPhone !== undefined) {
    sets.push("client_phone = ?");
    args.push(data.clientPhone ? data.clientPhone.trim() : null);
  }
  if (data.companyName !== undefined) {
    sets.push("company_name = ?");
    args.push(data.companyName ? data.companyName.trim() : null);
  }
  if (data.companyWebsite !== undefined) {
    sets.push("company_website = ?");
    args.push(data.companyWebsite ? data.companyWebsite.trim() : null);
  }
  if (data.country !== undefined) {
    sets.push("country = ?");
    args.push(data.country ? data.country.trim() : null);
  }
  if (data.industry !== undefined) {
    sets.push("industry = ?");
    args.push(data.industry ? data.industry.trim() : null);
  }
  if (data.service !== undefined) {
    sets.push("service = ?");
    args.push(data.service ? data.service.trim() : null);
  }
  if (data.status !== undefined && CLIENT_STATUSES.includes(data.status)) {
    sets.push("status = ?");
    args.push(data.status);
  }
  if (data.assignedBdmId !== undefined) {
    sets.push("assigned_bdm_id = ?");
    args.push(data.assignedBdmId || null);
  }
  if (data.assignedBdmName !== undefined) {
    sets.push("assigned_bdm_name = ?");
    args.push(data.assignedBdmName || null);
  }
  if (data.notes !== undefined) {
    sets.push("notes = ?");
    args.push(data.notes || null);
  }

  if (!sets.length) return false;
  sets.push("updated_at = NOW()");

  const [res] = await pool.query<ResultSetHeader>(
    `UPDATE crm_clients SET ${sets.join(", ")} WHERE id = ? AND deleted_at IS NULL`,
    [...args, id]
  );

  await logActivity({
    entity: "lead",
    id,
    action: "client_updated",
    text: `Client details updated by ${user.name}`,
    actor: { type: "user", user },
  });

  return Boolean(res.affectedRows);
}

/**
 * Add an uploaded document to client profile.
 */
export async function addClientDocument(
  clientId: number,
  doc: ClientDocument,
  user: Pick<CrmUser, "id" | "name" | "role">
) {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT documents FROM crm_clients WHERE id = ? AND deleted_at IS NULL",
    [clientId]
  );
  const raw = rows[0]?.documents;
  let docs: ClientDocument[] = [];
  if (typeof raw === "string") {
    try {
      docs = JSON.parse(raw);
    } catch {
      docs = [];
    }
  } else if (Array.isArray(raw)) {
    docs = raw as ClientDocument[];
  }

  docs.push(doc);

  await pool.query("UPDATE crm_clients SET documents = ? WHERE id = ?", [JSON.stringify(docs), clientId]);

  await logActivity({
    entity: "lead",
    id: clientId,
    action: "document_uploaded",
    text: `Document "${doc.name}" uploaded for client by ${user.name}`,
    actor: { type: "user", user },
  });

  return docs;
}

/**
 * Delete a document from client profile.
 */
export async function removeClientDocument(clientId: number, docId: string) {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT documents FROM crm_clients WHERE id = ? AND deleted_at IS NULL",
    [clientId]
  );
  const raw = rows[0]?.documents;
  let docs: ClientDocument[] = [];
  if (typeof raw === "string") {
    try {
      docs = JSON.parse(raw);
    } catch {
      docs = [];
    }
  } else if (Array.isArray(raw)) {
    docs = raw as ClientDocument[];
  }

  docs = docs.filter((d) => d.id !== docId);

  await pool.query("UPDATE crm_clients SET documents = ? WHERE id = ?", [JSON.stringify(docs), clientId]);
  return docs;
}

/**
 * Soft delete client (Admin, BDM, Super Admin) or permanent delete (Super Admin only).
 */
export async function deleteClient(id: number, user: Pick<CrmUser, "id" | "role">, permanent = false) {
  const pool = getPool();
  if (permanent) {
    const [res] = await pool.query<ResultSetHeader>("DELETE FROM crm_clients WHERE id = ?", [id]);
    return Boolean(res.affectedRows);
  }
  const [res] = await pool.query<ResultSetHeader>(
    "UPDATE crm_clients SET deleted_at = NOW(), deleted_by = ? WHERE id = ? AND deleted_at IS NULL",
    [user.id, id]
  );
  return Boolean(res.affectedRows);
}

/**
 * Restore soft-deleted client from Deleted Bin.
 */
export async function restoreClient(id: number) {
  const pool = getPool();
  const [res] = await pool.query<ResultSetHeader>(
    "UPDATE crm_clients SET deleted_at = NULL, deleted_by = NULL WHERE id = ?",
    [id]
  );
  return Boolean(res.affectedRows);
}

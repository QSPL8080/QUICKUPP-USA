import { getPool } from "@/lib/db";
import { getCurrentUser } from "@/lib/crm/auth";
import { ENQUIRY_STATUSES, SOURCES, getLead, isEnquirySource, type EnquirySource } from "@/lib/crm/data";
import { validateManualLead } from "@/lib/crm/leadOptions";
import { readJson } from "@/lib/enquiry";

const unauthorized = () => Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
const invalid = () => Response.json({ ok: false, error: "Invalid request." }, { status: 400 });

/* GET ?source=&id= → one lead with all its details, attachments, and payment links */
export async function GET(request: Request) {
  if (!(await getCurrentUser())) return unauthorized();
  const url = new URL(request.url);
  const source = url.searchParams.get("source");
  const id = Number(url.searchParams.get("id"));
  if (!isEnquirySource(source) || !Number.isInteger(id) || id < 1) return invalid();
  const lead = await getLead(source, id);
  if (!lead) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });

  const pool = getPool();

  // 1. Fetch attachments (stored directly on lead record in MySQL)
  const attachments = Array.isArray(lead.attachments) ? lead.attachments : [];

  // 2. Fetch payment links matching this lead
  const email = (lead.email || "").trim().toLowerCase();
  const phone = (lead.phone || "").trim();
  const conditions: string[] = ["(lead_source = ? AND lead_id = ?)"];
  const args: any[] = [source, id];
  if (email) {
    conditions.push("(client_email = ? AND client_email != '')");
    args.push(email);
  }
  if (phone) {
    conditions.push("(client_phone = ? AND client_phone != '')");
    args.push(phone);
  }

  let linkRows: any[] = [];
  try {
    const [res] = await pool.query(
      `SELECT id, client_name, client_email, client_phone, company_name, service, category,
              industry, quantity, description, amount, total_amount, payment_type, remaining_amount,
              currency, method, status, link_status, invoice_number, token, billing_start_date,
              billing_end_date, balance_due_date, created_at, paid_at, notes, lead_source, lead_id
       FROM payment_links
       WHERE ${conditions.join(" OR ")}
       ORDER BY id DESC`,
      args
    );
    linkRows = res as any[];
  } catch {
    const [res] = await pool.query(
      `SELECT id, client_name, client_email, client_phone, company_name, service, category,
              industry, quantity, description, amount, total_amount, payment_type, remaining_amount,
              currency, method, status, link_status, invoice_number, token, billing_start_date,
              billing_end_date, balance_due_date, created_at, paid_at, notes
       FROM payments
       WHERE token IS NOT NULL AND (${conditions.join(" OR ")})
       ORDER BY id DESC`,
      args
    ).catch(() => [[]]);
    linkRows = res as any[];
  }

  const paymentLinks = linkRows.map((r) => ({
    id: r.id,
    clientName: r.client_name,
    clientEmail: r.client_email,
    clientPhone: r.client_phone,
    companyName: r.company_name,
    service: r.service,
    category: r.category || r.quantity,
    industry: r.industry,
    amount: Number(r.amount || 0),
    totalAmount: Number(r.total_amount || r.amount || 0),
    paymentType: r.payment_type || "full",
    remainingAmount: Number(r.remaining_amount || 0),
    currency: r.currency || "USD",
    method: r.method,
    status: r.status,
    linkStatus: r.link_status || "active",
    invoiceNumber: r.invoice_number,
    orderNumber: r.invoice_number,
    paymentOption: r.payment_type || "full",
    token: r.token,
    billingStartDate: r.billing_start_date ? String(r.billing_start_date).slice(0, 10) : null,
    billingEndDate: r.billing_end_date ? String(r.billing_end_date).slice(0, 10) : null,
    balanceDueDate: r.balance_due_date ? String(r.balance_due_date).slice(0, 10) : null,
    createdAt: r.created_at,
    paidAt: r.paid_at,
    notes: r.notes,
    leadSource: r.lead_source,
    leadId: r.lead_id,
  }));

  return Response.json({ ok: true, lead, attachments, paymentLinks });
}

/* POST → add a lead by hand */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const body = await readJson(request);
  if (!body) return invalid();
  const result = validateManualLead(body);
  if (!result.ok) return Response.json({ ok: false, errors: result.errors }, { status: 400 });
  const d = result.data;
  const assignedTo = d.assignedTo || user.name || "Super Admin";
  const [res] = await getPool().execute(
    `INSERT INTO manual_leads
      (full_name, email, phone, company_name, company_website, country, industry, service, category, budget, timeline,
       lead_channel, assigned_to, message, status, project_status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [d.fullName, d.email, d.phone, d.companyName, d.companyWebsite, d.country, d.industry, d.service, d.category, d.budget, d.timeline,
      d.channel, assignedTo, d.notes, d.status, d.projectStatus || "Not Started", user.id]
  );
  return Response.json({ ok: true, id: (res as { insertId: number }).insertId });
}

/* PUT { id, source, ...fields } → edit a lead */
export async function PUT(request: Request) {
  if (!(await getCurrentUser())) return unauthorized();
  const body = await readJson(request);
  const id = Number(body?.id);
  const source: EnquirySource = isEnquirySource(body?.source) ? body.source : "manual";
  if (!body || !Number.isInteger(id) || id < 1) return invalid();
  const result = validateManualLead(body);
  if (!result.ok) return Response.json({ ok: false, errors: result.errors }, { status: 400 });
  const d = result.data;
  const pool = getPool();
  try {
    if (source === "manual") {
      const [res] = await pool.execute(
        `UPDATE manual_leads SET full_name = ?, email = ?, phone = ?, company_name = ?, company_website = ?, country = ?, industry = ?,
           service = ?, category = ?, budget = ?, timeline = ?, lead_channel = ?, assigned_to = ?, message = ?, status = ?, project_status = ?
         WHERE id = ?`,
        [d.fullName, d.email, d.phone, d.companyName, d.companyWebsite, d.country, d.industry, d.service, d.category, d.budget, d.timeline,
          d.channel, d.assignedTo, d.notes, d.status, d.projectStatus || "Not Started", id]
      );
      if (!(res as { affectedRows: number }).affectedRows) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });
    } else if (source === "contact") {
      const [res] = await pool.execute(
        `UPDATE contact_enquiries SET full_name = ?, email = ?, phone = ?, company_name = ?, company_website = ?, country = ?, industry = ?,
           project_type = ?, budget = ?, timeline = ?, message = ?, assigned_to = ?, status = ?, project_status = ?
         WHERE id = ?`,
        [d.fullName, d.email, d.phone, d.companyName, d.companyWebsite, d.country, d.industry, d.service || d.category, d.budget, d.timeline,
          d.notes, d.assignedTo, d.status, d.projectStatus || "Not Started", id]
      );
      if (!(res as { affectedRows: number }).affectedRows) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });
    } else if (source === "youtube") {
      const [res] = await pool.execute(
        `UPDATE service_youtube_promotion SET full_name = ?, email = ?, phone = ?, company_name = ?, company_website = ?, country = ?, industry = ?,
           budget = ?, timeline = ?, message = ?, assigned_to = ?, status = ?, project_status = ?
         WHERE id = ?`,
        [d.fullName, d.email, d.phone, d.companyName, d.companyWebsite, d.country, d.industry, d.budget, d.timeline,
          d.notes, d.assignedTo, d.status, d.projectStatus || "Not Started", id]
      );
      if (!(res as { affectedRows: number }).affectedRows) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });
    } else {
      const table = SOURCES[source].table;
      const [res] = await pool.execute(
        `UPDATE \`${table}\` SET full_name = ?, email = ?, phone = ?, company_name = ?, company_website = ?, country = ?, industry = ?,
           service = ?, category = ?, budget = ?, timeline = ?, message = ?, assigned_to = ?, status = ?, project_status = ?
         WHERE id = ?`,
        [d.fullName, d.email, d.phone, d.companyName, d.companyWebsite, d.country, d.industry, d.service, d.category, d.budget, d.timeline,
          d.notes, d.assignedTo, d.status, d.projectStatus || "Not Started", id]
      );
      if (!(res as { affectedRows: number }).affectedRows) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });
    }
  } catch (err: any) {
    if (err?.code === "ER_BAD_FIELD_ERROR") {
      const table = SOURCES[source].table;
      await pool.execute(
        `UPDATE \`${table}\` SET full_name = ?, email = ?, phone = ?, company_name = ?, status = ? WHERE id = ?`,
        [d.fullName, d.email, d.phone, d.companyName, d.status, id]
      ).catch(() => {});
    } else {
      throw err;
    }
  }

  // Keep linked payment links updated with latest customer info
  await pool.execute(
    `UPDATE payment_links SET
       client_name = ?,
       client_email = COALESCE(NULLIF(?, ''), client_email),
       client_phone = COALESCE(NULLIF(?, ''), client_phone),
       company_name = ?
     WHERE (lead_source = ? AND lead_id = ?)`,
    [d.fullName, d.email, d.phone, d.companyName, source, id]
  ).catch(() => {});

  return Response.json({ ok: true });
}

/* PATCH { source, id, status, projectStatus, assignedTo } → change a lead's status, projectStatus, or assignedTo (any CRM user) */
export async function PATCH(request: Request) {
  if (!(await getCurrentUser())) return unauthorized();
  const body = await readJson(request);
  const id = Number(body?.id);
  if (!isEnquirySource(body?.source) || !Number.isInteger(id) || id < 1) {
    return invalid();
  }
  const sets: string[] = [];
  const args: (string | null)[] = [];
  if (body?.status !== undefined) {
    if (!(ENQUIRY_STATUSES as readonly string[]).includes(String(body.status))) {
      return invalid();
    }
    sets.push("status = ?");
    args.push(String(body.status));
  }
  if (body?.projectStatus !== undefined) {
    sets.push("project_status = ?");
    args.push(body.projectStatus ? String(body.projectStatus).trim() : "Not Started");
  }
  if (body?.assignedTo !== undefined) {
    sets.push("assigned_to = ?");
    args.push(body.assignedTo ? String(body.assignedTo).trim() : null);
  }
  if (!sets.length) return invalid();
  try {
    await getPool().execute(
      `UPDATE \`${SOURCES[body.source].table}\` SET ${sets.join(", ")} WHERE id = ?`,
      [...args, id]
    );
  } catch (err: any) {
    if (err?.code === "ER_BAD_FIELD_ERROR" && body?.status !== undefined) {
      await getPool().execute(
        `UPDATE \`${SOURCES[body.source].table}\` SET status = ? WHERE id = ?`,
        [String(body.status), id]
      ).catch(() => {});
    } else {
      throw err;
    }
  }
  return Response.json({ ok: true });
}

/*
 * DELETE { keys: ["contact:12", "manual:3", ...] } → permanently remove leads
 * from any source (super admin and admin)
 */
export async function DELETE(request: Request) {
  if (!(await getCurrentUser())) return unauthorized();
  const body = await readJson(request);
  const keys = Array.isArray(body?.keys) ? body.keys : body?.source && body?.id ? [`${body.source}:${body.id}`] : null;
  if (!keys || !keys.length || keys.length > 500) return invalid();
  const bySource = new Map<EnquirySource, number[]>();
  for (const k of keys) {
    const [src, rawId] = String(k).split(":");
    const id = Number(rawId);
    if (!isEnquirySource(src) || !Number.isInteger(id) || id < 1) return invalid();
    bySource.set(src, [...(bySource.get(src) || []), id]);
  }
  let deleted = 0;
  for (const [src, ids] of bySource) {
    // permanently removed (no hidden "deleted" copies are kept)
    const [res] = await getPool().query(`DELETE FROM \`${SOURCES[src].table}\` WHERE id IN (?)`, [ids]);
    deleted += (res as { affectedRows: number }).affectedRows;
  }
  if (!deleted) return Response.json({ ok: false, error: "Already deleted." }, { status: 404 });
  return Response.json({ ok: true, deleted });
}

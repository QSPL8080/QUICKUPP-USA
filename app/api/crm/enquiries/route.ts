import { getPool } from "@/lib/db";
import { getUserFor, canSoftDelete, canPermanentlyDelete } from "@/lib/crm/auth";
import { ENQUIRY_STATUSES, SOURCES, getLead, isEnquirySource, toDateOnly, type EnquirySource } from "@/lib/crm/data";
import { validateManualLead } from "@/lib/crm/leadOptions";
import { readJson } from "@/lib/enquiry";
import { actorOf } from "@/lib/crm/activity";
import { leadHistory, leadSnapshot, logLeadChanges, logLeadCreated } from "@/lib/crm/leadActivity";
import { notifyLeadAssigned } from "@/lib/crm/userNotify";
import type { RowDataPacket } from "mysql2/promise";
import { errCode } from "@/lib/err";

const unauthorized = () => Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
const invalid = () => Response.json({ ok: false, error: "Invalid request." }, { status: 400 });

/* GET ?source=&id= → one lead with all its details, attachments, and payment links */
export async function GET(request: Request) {
  const user = await getUserFor("leads");
  if (!user) return unauthorized();
  const url = new URL(request.url);
  const source = url.searchParams.get("source");
  const id = Number(url.searchParams.get("id"));
  if (!isEnquirySource(source) || !Number.isInteger(id) || id < 1) return invalid();
  const lead = await getLead(source, id);
  if (!lead) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });

  // Record-level access control: BDE can only view leads assigned to them
  if (user.role === "bde" && lead.assignedTo !== user.name) {
    return Response.json({ ok: false, error: "Access denied. You can only view leads assigned to you." }, { status: 403 });
  }

  const pool = getPool();

  // 1. Fetch attachments (stored directly on lead record in MySQL)
  const attachments = Array.isArray(lead.attachments) ? lead.attachments : [];

  // 2. Fetch payment links matching this lead
  const email = (lead.email || "").trim().toLowerCase();
  const phone = (lead.phone || "").trim();
  const conditions: string[] = ["(lead_source = ? AND lead_id = ?)"];
  const args: (string | number)[] = [source, id];
  if (email) {
    conditions.push("(client_email = ? AND client_email != '')");
    args.push(email);
  }
  if (phone) {
    conditions.push("(client_phone = ? AND client_phone != '')");
    args.push(phone);
  }

  let linkRows: RowDataPacket[] = [];
  try {
    const [res] = await pool.query(
      `SELECT id, client_name, client_email, client_phone, company_name, service, category,
              industry, quantity, description, amount, total_amount, payment_type, remaining_amount,
              currency, method, status, link_status, invoice_number, token, billing_start_date,
              billing_end_date, balance_due_date, created_at, paid_at, notes, lead_source, lead_id
       FROM payment_links
       WHERE (${conditions.join(" OR ")}) AND deleted_at IS NULL
       ORDER BY id DESC`,
      args
    );
    linkRows = res as RowDataPacket[];
  } catch {
    const [res] = await pool.query(
      `SELECT id, client_name, client_email, client_phone, company_name, service, category,
              industry, quantity, description, amount, total_amount, payment_type, remaining_amount,
              currency, method, status, link_status, invoice_number, token, billing_start_date,
              billing_end_date, balance_due_date, created_at, paid_at, notes
       FROM payments
       WHERE token IS NOT NULL AND (${conditions.join(" OR ")}) AND deleted_at IS NULL
       ORDER BY id DESC`,
      args
    ).catch(() => [[]]);
    linkRows = res as RowDataPacket[];
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
    billingStartDate: r.billing_start_date ? toDateOnly(r.billing_start_date) : null,
    billingEndDate: r.billing_end_date ? toDateOnly(r.billing_end_date) : null,
    balanceDueDate: r.balance_due_date ? toDateOnly(r.balance_due_date) : null,
    createdAt: r.created_at,
    paidAt: r.paid_at,
    notes: r.notes,
    leadSource: r.lead_source,
    leadId: r.lead_id,
  }));

  const { activity, audit } = await leadHistory(source, id, lead);

  return Response.json({ ok: true, lead, attachments, paymentLinks, activity, audit });
}

/* POST → add a lead by hand */
export async function POST(request: Request) {
  const user = await getUserFor("leads");
  if (!user) return unauthorized();
  const body = await readJson(request);
  if (!body) return invalid();
  const result = validateManualLead(body);
  if (!result.ok) return Response.json({ ok: false, errors: result.errors }, { status: 400 });
  const d = result.data;
  // only who was actually chosen; the person adding the lead is not assumed to be the assignee
  const assignedTo = d.assignedTo ? d.assignedTo : null;
  const [res] = await getPool().execute(
    `INSERT INTO manual_leads
      (full_name, email, phone, company_name, company_website, country, industry, service, category, budget, timeline,
       lead_channel, assigned_to, message, status, project_status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [d.fullName, d.email, d.phone, d.companyName, d.companyWebsite, d.country, d.industry, d.service, d.category, d.budget, d.timeline,
      d.channel, assignedTo, d.notes, d.status, d.projectStatus || "Not Started", user.id]
  );
  const newId = (res as { insertId: number }).insertId;
  await logLeadCreated(newId, actorOf(user), assignedTo || "", d.channel || "Manual");

  if (assignedTo && assignedTo !== user.name) {
    void notifyLeadAssigned({
      leadSource: "manual",
      leadId: newId,
      leadName: d.fullName,
      leadEmail: d.email,
      assignedToName: assignedTo,
      assignedByName: user.name,
    }).catch((e) => console.error("Failed to notify lead assigned:", e));
  }

  return Response.json({ ok: true, id: newId });
}

/* PUT { id, source, ...fields } → edit a lead */
export async function PUT(request: Request) {
  const user = await getUserFor("leads");
  if (!user) return unauthorized();
  const body = await readJson(request);
  const id = Number(body?.id);
  const source: EnquirySource = isEnquirySource(body?.source) ? body.source : "manual";
  if (!body || !Number.isInteger(id) || id < 1) return invalid();
  const result = validateManualLead(body);
  if (!result.ok) return Response.json({ ok: false, errors: result.errors }, { status: 400 });
  const d = result.data;
  const pool = getPool();
  const before = await leadSnapshot(source, id);
  if (!before) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });

  // Record-level access control: BDE can only edit their assigned leads, and cannot reassign
  if (user.role === "bde") {
    if (before.assigned_to !== user.name) {
      return Response.json({ ok: false, error: "Access denied. You can only edit leads assigned to you." }, { status: 403 });
    }
    if (d.assignedTo !== before.assigned_to) {
      return Response.json({ ok: false, error: "BDEs cannot assign or reassign leads." }, { status: 403 });
    }
  }

  try {
    if (source === "manual") {
      const [res] = await pool.execute(
        `UPDATE manual_leads SET full_name = ?, email = ?, phone = ?, company_name = ?, company_website = ?, country = ?, industry = ?,
           service = ?, category = ?, budget = ?, timeline = ?, lead_channel = ?, assigned_to = ?, message = ?, status = ?, project_status = ?
         WHERE id = ? AND deleted_at IS NULL`,
        [d.fullName, d.email, d.phone, d.companyName, d.companyWebsite, d.country, d.industry, d.service, d.category, d.budget, d.timeline,
          d.channel, d.assignedTo, d.notes, d.status, d.projectStatus || "Not Started", id]
      );
      if (!(res as { affectedRows: number }).affectedRows) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });
    } else if (source === "contact") {
      const [res] = await pool.execute(
        `UPDATE contact_enquiries SET full_name = ?, email = ?, phone = ?, company_name = ?, company_website = ?, country = ?, industry = ?,
           project_type = ?, budget = ?, timeline = ?, message = ?, assigned_to = ?, status = ?, project_status = ?
         WHERE id = ? AND deleted_at IS NULL`,
        [d.fullName, d.email, d.phone, d.companyName, d.companyWebsite, d.country, d.industry, d.service || d.category, d.budget, d.timeline,
          d.notes, d.assignedTo, d.status, d.projectStatus || "Not Started", id]
      );
      if (!(res as { affectedRows: number }).affectedRows) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });
    } else if (source === "youtube") {
      const [res] = await pool.execute(
        `UPDATE service_youtube_promotion SET full_name = ?, email = ?, phone = ?, company_name = ?, company_website = ?, country = ?, industry = ?,
           budget = ?, timeline = ?, message = ?, assigned_to = ?, status = ?, project_status = ?
         WHERE id = ? AND deleted_at IS NULL`,
        [d.fullName, d.email, d.phone, d.companyName, d.companyWebsite, d.country, d.industry, d.budget, d.timeline,
          d.notes, d.assignedTo, d.status, d.projectStatus || "Not Started", id]
      );
      if (!(res as { affectedRows: number }).affectedRows) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });
    } else {
      const table = SOURCES[source].table;
      const [res] = await pool.execute(
        `UPDATE \`${table}\` SET full_name = ?, email = ?, phone = ?, company_name = ?, company_website = ?, country = ?, industry = ?,
           service = ?, category = ?, budget = ?, timeline = ?, message = ?, assigned_to = ?, status = ?, project_status = ?
         WHERE id = ? AND deleted_at IS NULL`,
        [d.fullName, d.email, d.phone, d.companyName, d.companyWebsite, d.country, d.industry, d.service, d.category, d.budget, d.timeline,
          d.notes, d.assignedTo, d.status, d.projectStatus || "Not Started", id]
      );
      if (!(res as { affectedRows: number }).affectedRows) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });
    }
  } catch (err) {
    if (errCode(err) === "ER_BAD_FIELD_ERROR") {
      const table = SOURCES[source].table;
      await pool.execute(
        `UPDATE \`${table}\` SET full_name = ?, email = ?, phone = ?, company_name = ?, status = ? WHERE id = ? AND deleted_at IS NULL`,
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

  // History: only the fields that really changed
  const after = await leadSnapshot(source, id);
  if (before && after) await logLeadChanges(source, id, before, after, actorOf(user));

  // Notify assignee if reassigned
  if (d.assignedTo && d.assignedTo !== before.assigned_to) {
    void notifyLeadAssigned({
      leadSource: source,
      leadId: id,
      leadName: d.fullName,
      leadEmail: d.email,
      assignedToName: d.assignedTo,
      assignedByName: user.name,
    }).catch((e) => console.error("Failed to notify lead assigned:", e));
  }

  return Response.json({ ok: true });
}

/* PATCH { source, id, status, projectStatus, assignedTo } → change a lead's status, projectStatus, or assignedTo */
export async function PATCH(request: Request) {
  const user = await getUserFor("leads");
  if (!user) return unauthorized();
  const body = await readJson(request);
  const id = Number(body?.id);
  if (!isEnquirySource(body?.source) || !Number.isInteger(id) || id < 1) {
    return invalid();
  }
  const source: EnquirySource = body.source;
  const before = await leadSnapshot(source, id);
  if (!before) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });

  // Record-level access control for BDE
  if (user.role === "bde") {
    if (before.assigned_to !== user.name) {
      return Response.json({ ok: false, error: "Access denied. You can only update leads assigned to you." }, { status: 403 });
    }
    if (body?.assignedTo !== undefined) {
      return Response.json({ ok: false, error: "BDEs cannot assign or reassign leads." }, { status: 403 });
    }
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
      `UPDATE \`${SOURCES[body.source].table}\` SET ${sets.join(", ")} WHERE id = ? AND deleted_at IS NULL`,
      [...args, id]
    );
  } catch (err) {
    if (errCode(err) === "ER_BAD_FIELD_ERROR" && body?.status !== undefined) {
      await getPool().execute(
        `UPDATE \`${SOURCES[body.source].table}\` SET status = ? WHERE id = ? AND deleted_at IS NULL`,
        [String(body.status), id]
      ).catch(() => {});
    } else {
      throw err;
    }
  }

  const after = await leadSnapshot(source, id);
  if (after) await logLeadChanges(source, id, before, after, actorOf(user));

  if (body?.assignedTo && String(body.assignedTo).trim() !== String(before.assigned_to || "").trim()) {
    void notifyLeadAssigned({
      leadSource: source,
      leadId: id,
      leadName: String(before.full_name || "Lead"),
      leadEmail: String(before.email || ""),
      assignedToName: String(body.assignedTo).trim(),
      assignedByName: user.name,
    }).catch((e) => console.error("Failed to notify lead assigned:", e));
  }

  return Response.json({ ok: true });
}

/*
 * DELETE { keys: ["contact:12", "manual:3", ...], permanent?: boolean }
 * Soft delete: Admin, BDM, Super Admin (moves to Deleted Bin)
 * Permanent delete: Super Admin only
 */
export async function DELETE(request: Request) {
  const user = await getUserFor("leads");
  if (!user) return unauthorized();
  if (!canSoftDelete(user)) {
    return Response.json({ ok: false, error: "You do not have permission to delete leads." }, { status: 403 });
  }
  const body = await readJson(request);
  const keys = Array.isArray(body?.keys) ? body.keys : body?.source && body?.id ? [`${body.source}:${body.id}`] : null;
  if (!keys || !keys.length || keys.length > 500) return invalid();
  const isPermanent = Boolean(body?.permanent);
  if (isPermanent && !canPermanentlyDelete(user)) {
    return Response.json({ ok: false, error: "Only Super Admin can permanently delete records." }, { status: 403 });
  }

  const bySource = new Map<EnquirySource, number[]>();
  for (const k of keys) {
    const [src, rawId] = String(k).split(":");
    const id = Number(rawId);
    if (!isEnquirySource(src) || !Number.isInteger(id) || id < 1) return invalid();
    bySource.set(src, [...(bySource.get(src) || []), id]);
  }
  let affected = 0;
  const pool = getPool();
  for (const [src, ids] of bySource) {
    if (isPermanent) {
      const [res] = await pool.query(`DELETE FROM \`${SOURCES[src].table}\` WHERE id IN (?)`, [ids]);
      affected += (res as { affectedRows: number }).affectedRows;
      await pool.query("DELETE FROM crm_activity WHERE entity_type = 'lead' AND entity_source = ? AND entity_id IN (?)", [src, ids]).catch(() => {});
      await pool.query("DELETE FROM crm_notification_reads WHERE item_key IN (?)", [ids.map((id) => `${src}:${id}`)]).catch(() => {});
      for (const table of ["payment_links", "payments"]) {
        await pool.query(`UPDATE \`${table}\` SET lead_id = NULL, lead_source = NULL WHERE lead_source = ? AND lead_id IN (?)`, [src, ids]).catch(() => {});
      }
    } else {
      // Soft delete: set deleted_at and deleted_by
      const [res] = await pool.query(
        `UPDATE \`${SOURCES[src].table}\` SET deleted_at = NOW(), deleted_by = ? WHERE id IN (?) AND deleted_at IS NULL`,
        [user.id, ids]
      );
      affected += (res as { affectedRows: number }).affectedRows;
    }
  }
  if (!affected) return Response.json({ ok: false, error: "Already deleted or not found." }, { status: 404 });
  return Response.json({ ok: true, deleted: affected, permanent: isPermanent });
}

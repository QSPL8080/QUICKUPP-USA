import { getPool } from "@/lib/db";
import { getUserFor, leadPermsFor, type CrmUser } from "@/lib/crm/auth";
import { assignableMember, canOpenLead, leadAssigneeId, recordLeadAssignment } from "@/lib/crm/leadAccess";
import { deleteOrTrash } from "@/lib/crm/trash";
import { SOURCE_LABEL } from "@/lib/crm/leadOptions";
import { SOURCES, getLead, isEnquirySource, toDateOnly, type EnquirySource } from "@/lib/crm/data";
import { isManualStatus } from "@/lib/crm/leadOptions";
import { validateManualLead } from "@/lib/crm/leadOptions";
import { readJson } from "@/lib/enquiry";
import { actorOf } from "@/lib/crm/activity";
import { leadHistory, leadSnapshot, logLeadChanges, logLeadCreated } from "@/lib/crm/leadActivity";
import type { RowDataPacket } from "mysql2/promise";
import { errCode } from "@/lib/err";

const unauthorized = () => Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
const invalid = () => Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
const refused = (error = "Your role can't make this change.") => Response.json({ ok: false, error }, { status: 403 });
const notYours = () => Response.json({ ok: false, error: "This lead isn't assigned to you." }, { status: 404 });

/* an assignment change: who and when, the history, the audit log, and the notices (see lib/crm/leadAccess) */
async function assignmentChanged(source: EnquirySource, id: number, previousId: number | null, nextId: number | null, by: CrmUser) {
  const lead = await getLead(source, id);
  if (!lead) return;
  await recordLeadAssignment({ source, id, name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, service: lead.service }, previousId, nextId, by);
}

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
  // a BDM/BDE opens only the leads assigned to them
  if (leadPermsFor(user).ownOnly && lead.assignedUserId !== user.id) return notYours();

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
       WHERE ${conditions.join(" OR ")}
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
       WHERE token IS NOT NULL AND (${conditions.join(" OR ")})
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

  // BDMs and BDEs don't see payments
  const perms = leadPermsFor(user);
  return Response.json({ ok: true, lead, attachments, paymentLinks: perms.ownOnly ? [] : paymentLinks, activity, audit });
}

/* POST → add a lead by hand (Admins and the Super Admin) */
export async function POST(request: Request) {
  const user = await getUserFor("leads");
  if (!user) return unauthorized();
  const perms = leadPermsFor(user);
  if (!perms.add) return refused("Only an Admin can add enquiries.");
  const body = await readJson(request);
  if (!body) return invalid();
  const result = validateManualLead(body);
  if (!result.ok) return Response.json({ ok: false, errors: result.errors }, { status: 400 });
  const d = result.data;
  // Admins pick a BDM/BDE (or nobody); a lead a BDM/BDE adds is theirs. The person
  // adding the lead is not otherwise assumed to be the assignee.
  let assigneeId: number | null = null;
  let assignedTo: string | null = null;
  if (perms.ownOnly) {
    assigneeId = user.id;
    assignedTo = user.name;
  } else if (body.assignedUserId) {
    const m = await assignableMember(body.assignedUserId);
    if (!m) return Response.json({ ok: false, errors: { assignedTo: "Choose an active BDM or BDE." } }, { status: 400 });
    assigneeId = m.id;
    assignedTo = m.name;
  }
  const [res] = await getPool().execute(
    `INSERT INTO manual_leads
      (full_name, email, phone, company_name, company_website, country, industry, service, category, budget, timeline,
       lead_channel, assigned_to, assigned_user_id, message, status, project_status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [d.fullName, d.email, d.phone, d.companyName, d.companyWebsite, d.country, d.industry, d.service, d.category, d.budget, d.timeline,
      d.channel, assignedTo, assigneeId, d.notes, d.status, d.projectStatus || "Not Started", user.id]
  );
  const newId = (res as { insertId: number }).insertId;
  await logLeadCreated(newId, actorOf(user), assignedTo || "", d.channel || "Manual");
  if (assigneeId) await assignmentChanged("manual", newId, null, assigneeId, user);
  return Response.json({ ok: true, id: newId });
}

/* PUT { id, source, ...fields } → edit a lead */
export async function PUT(request: Request) {
  const user = await getUserFor("leads");
  if (!user) return unauthorized();
  const perms = leadPermsFor(user);
  if (!perms.edit) return refused();
  const body = await readJson(request);
  const id = Number(body?.id);
  const source: EnquirySource = isEnquirySource(body?.source) ? body.source : "manual";
  if (!body || !Number.isInteger(id) || id < 1) return invalid();
  if (!(await canOpenLead(user, source, id))) return notYours();
  // a lead that has paid stays Won whatever the form sends (Won is never picked by hand)
  const isWon = (await leadStatus(source, id)) === "won";
  const result = validateManualLead(isWon ? { ...body, status: "new" } : body);
  if (!result.ok) return Response.json({ ok: false, errors: result.errors }, { status: 400 });
  const d = result.data;
  if (isWon) d.status = "won";
  const pool = getPool();
  const before = await leadSnapshot(source, id);
  // only Admins change who the lead is assigned to (to a BDM/BDE, by account)
  let newAssignee: number | null | undefined; // undefined: unchanged
  if (perms.assign && body.assignedUserId !== undefined) {
    if (body.assignedUserId) {
      const m = await assignableMember(body.assignedUserId);
      if (!m) return Response.json({ ok: false, errors: { assignedTo: "Choose an active BDM or BDE." } }, { status: 400 });
      newAssignee = m.id;
      d.assignedTo = m.name;
    } else {
      newAssignee = null;
      d.assignedTo = null;
    }
  } else {
    d.assignedTo = before?.assignedTo || null;
  }
  const previousAssignee = newAssignee === undefined ? undefined : await leadAssigneeIdSafe(source, id);
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
  } catch (err) {
    if (errCode(err) === "ER_BAD_FIELD_ERROR") {
      const table = SOURCES[source].table;
      await pool.execute(
        `UPDATE \`${table}\` SET full_name = ?, email = ?, phone = ?, company_name = ?, status = ? WHERE id = ?`,
        [d.fullName, d.email, d.phone, d.companyName, d.status, id]
      ).catch(() => {});
    } else {
      throw err;
    }
  }

  if (newAssignee !== undefined) {
    await pool.query(`UPDATE \`${SOURCES[source].table}\` SET assigned_user_id = ? WHERE id = ?`, [newAssignee, id]).catch(() => {});
    if (newAssignee !== previousAssignee) await assignmentChanged(source, id, previousAssignee ?? null, newAssignee, user);
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

  // history: only the fields that really changed (saving an unchanged lead logs nothing)
  const after = await leadSnapshot(source, id);
  if (before && after) await logLeadChanges(source, id, before, after, actorOf(user));

  return Response.json({ ok: true });
}

/*
 * PATCH { source, id, status, projectStatus, assignedUserId } → change a lead's
 * statuses (Admins, and a BDM/BDE on their own leads) or assign it to a BDM/BDE
 * (Admins; the BDM/BDE gets a CRM notification and an email)
 */
export async function PATCH(request: Request) {
  const user = await getUserFor("leads");
  if (!user) return unauthorized();
  const perms = leadPermsFor(user);
  if (!perms.edit) return refused();
  const body = await readJson(request);
  const id = Number(body?.id);
  if (!isEnquirySource(body?.source) || !Number.isInteger(id) || id < 1) {
    return invalid();
  }
  const source: EnquirySource = body.source;
  if (!(await canOpenLead(user, source, id))) return notYours();
  const sets: string[] = [];
  const args: (string | number | null)[] = [];
  let newAssignee: number | null | undefined;
  if (body?.status !== undefined) {
    // Won comes only from a payment, and a lead that has paid stays Won; Lost and the others are picked by hand
    if (body.status === "won") return Response.json({ ok: false, error: "Won is set automatically when the lead pays." }, { status: 400 });
    if (!isManualStatus(body.status)) return invalid();
    if ((await leadStatus(source, id)) === "won") return Response.json({ ok: false, error: "This lead has paid, so it stays Won." }, { status: 409 });
    sets.push("status = ?");
    args.push(String(body.status));
  }
  if (body?.projectStatus !== undefined) {
    sets.push("project_status = ?");
    args.push(body.projectStatus ? String(body.projectStatus).trim() : "Not Started");
  }
  if (body?.assignedUserId !== undefined) {
    if (!perms.assign) return refused("Only an Admin can assign leads.");
    if (body.assignedUserId) {
      const m = await assignableMember(body.assignedUserId);
      if (!m) return Response.json({ ok: false, error: "Choose an active BDM or BDE." }, { status: 400 });
      newAssignee = m.id;
      sets.push("assigned_user_id = ?", "assigned_to = ?");
      args.push(m.id, m.name);
    } else {
      newAssignee = null;
      sets.push("assigned_user_id = NULL", "assigned_to = NULL");
    }
  }
  if (!sets.length) return invalid();
  const before = await leadSnapshot(source, id);
  if (!before) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });
  const previousAssignee = newAssignee === undefined ? undefined : await leadAssigneeIdSafe(source, id);
  try {
    await getPool().execute(
      `UPDATE \`${SOURCES[body.source].table}\` SET ${sets.join(", ")} WHERE id = ?`,
      [...args, id]
    );
  } catch (err) {
    if (errCode(err) === "ER_BAD_FIELD_ERROR" && body?.status !== undefined) {
      await getPool().execute(
        `UPDATE \`${SOURCES[body.source].table}\` SET status = ? WHERE id = ?`,
        [String(body.status), id]
      ).catch(() => {});
    } else {
      throw err;
    }
  }
  const after = await leadSnapshot(source, id);
  if (after) await logLeadChanges(source, id, before, after, actorOf(user));
  if (newAssignee !== undefined && newAssignee !== previousAssignee) await assignmentChanged(source, id, previousAssignee ?? null, newAssignee, user);
  return Response.json({ ok: true });
}

/* the lead's current status */
async function leadStatus(source: EnquirySource, id: number) {
  const [rows] = await getPool().query(`SELECT status FROM \`${SOURCES[source].table}\` WHERE id = ?`, [id]).catch(() => [[]] as unknown as [Record<string, unknown>[]]);
  return String((rows as Record<string, unknown>[])[0]?.status || "");
}

const leadAssigneeIdSafe = async (source: EnquirySource, id: number) => (await leadAssigneeId(source, id)) ?? null;

/*
 * DELETE { keys: ["contact:12", "manual:3", ...], reason? } → delete leads from
 * any source (Admins and the Super Admin): they move to the Bin, where
 * the Super Admin can put them back or remove them for good
 */
export async function DELETE(request: Request) {
  const user = await getUserFor("leads");
  if (!user) return unauthorized();
  if (!leadPermsFor(user).remove) return refused("Only an Admin can delete leads.");
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
  let trashed = false;
  for (const [src, ids] of bySource) {
    const r = await deleteOrTrash({
      entity: "lead",
      table: SOURCES[src].table,
      ids,
      user,
      describe: (row) => ({
        label: String(row.full_name || "Lead"),
        detail: [SOURCE_LABEL[src], row.email, row.company_name].filter(Boolean).join(" · "),
      }),
      reason: typeof body?.reason === "string" ? body.reason : "",
    });
    deleted += r.count;
    trashed = r.trashed;
  }
  if (!deleted) return Response.json({ ok: false, error: "Already deleted." }, { status: 404 });
  return Response.json({ ok: true, deleted, trashed });
}


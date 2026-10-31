import { getPool } from "@/lib/db";
import { getCurrentUser } from "@/lib/crm/auth";
import { ENQUIRY_STATUSES, SOURCES, getLead, isEnquirySource, type EnquirySource } from "@/lib/crm/data";
import { validateManualLead } from "@/lib/crm/leadOptions";
import { readJson } from "@/lib/enquiry";

const unauthorized = () => Response.json({ ok: false, error: "Please sign in again." }, { status: 401 });
const invalid = () => Response.json({ ok: false, error: "Invalid request." }, { status: 400 });

/* GET ?source=&id= → one lead with all its details */
export async function GET(request: Request) {
  if (!(await getCurrentUser())) return unauthorized();
  const url = new URL(request.url);
  const source = url.searchParams.get("source");
  const id = Number(url.searchParams.get("id"));
  if (!isEnquirySource(source) || !Number.isInteger(id) || id < 1) return invalid();
  const lead = await getLead(source, id);
  if (!lead) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });
  return Response.json({ ok: true, lead });
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
  const [res] = await getPool().execute(
    `INSERT INTO manual_leads
      (full_name, email, phone, company_name, company_website, country, industry, service, category, budget, timeline,
       lead_channel, assigned_to, message, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [d.fullName, d.email, d.phone, d.companyName, d.companyWebsite, d.country, d.industry, d.service, d.category, d.budget, d.timeline,
      d.channel, d.assignedTo, d.notes, d.status, user.id]
  );
  return Response.json({ ok: true, id: (res as { insertId: number }).insertId });
}

/* PUT { id, ...fields } → edit a lead that was added by hand */
export async function PUT(request: Request) {
  if (!(await getCurrentUser())) return unauthorized();
  const body = await readJson(request);
  const id = Number(body?.id);
  if (!body || !Number.isInteger(id) || id < 1) return invalid();
  const result = validateManualLead(body);
  if (!result.ok) return Response.json({ ok: false, errors: result.errors }, { status: 400 });
  const d = result.data;
  const [res] = await getPool().execute(
    `UPDATE manual_leads SET full_name = ?, email = ?, phone = ?, company_name = ?, company_website = ?, country = ?, industry = ?,
       service = ?, category = ?, budget = ?, timeline = ?, lead_channel = ?, assigned_to = ?, message = ?, status = ?
     WHERE id = ?`,
    [d.fullName, d.email, d.phone, d.companyName, d.companyWebsite, d.country, d.industry, d.service, d.category, d.budget, d.timeline,
      d.channel, d.assignedTo, d.notes, d.status, id]
  );
  if (!(res as { affectedRows: number }).affectedRows) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });
  return Response.json({ ok: true });
}

/* PATCH { source, id, status } → change a lead's status (any CRM user) */
export async function PATCH(request: Request) {
  if (!(await getCurrentUser())) return unauthorized();
  const body = await readJson(request);
  const id = Number(body?.id);
  if (!isEnquirySource(body?.source) || !Number.isInteger(id) || id < 1 || !(ENQUIRY_STATUSES as readonly string[]).includes(String(body?.status))) {
    return invalid();
  }
  await getPool().execute(`UPDATE \`${SOURCES[body.source].table}\` SET status = ? WHERE id = ?`, [String(body.status), id]);
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

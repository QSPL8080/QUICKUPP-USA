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
  const assignedTo = d.assignedTo || user.name || "Super Admin";
  const [res] = await getPool().execute(
    `INSERT INTO manual_leads
      (full_name, email, phone, company_name, company_website, country, industry, service, category, budget, timeline,
       lead_channel, assigned_to, message, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [d.fullName, d.email, d.phone, d.companyName, d.companyWebsite, d.country, d.industry, d.service, d.category, d.budget, d.timeline,
      d.channel, assignedTo, d.notes, d.status, user.id]
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
           service = ?, category = ?, budget = ?, timeline = ?, lead_channel = ?, assigned_to = ?, message = ?, status = ?
         WHERE id = ?`,
        [d.fullName, d.email, d.phone, d.companyName, d.companyWebsite, d.country, d.industry, d.service, d.category, d.budget, d.timeline,
          d.channel, d.assignedTo, d.notes, d.status, id]
      );
      if (!(res as { affectedRows: number }).affectedRows) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });
    } else if (source === "contact") {
      const [res] = await pool.execute(
        `UPDATE contact_enquiries SET full_name = ?, email = ?, phone = ?, company_name = ?, company_website = ?, country = ?, industry = ?,
           project_type = ?, budget = ?, timeline = ?, message = ?, assigned_to = ?, status = ?
         WHERE id = ?`,
        [d.fullName, d.email, d.phone, d.companyName, d.companyWebsite, d.country, d.industry, d.service || d.category, d.budget, d.timeline,
          d.notes, d.assignedTo, d.status, id]
      );
      if (!(res as { affectedRows: number }).affectedRows) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });
    } else if (source === "youtube") {
      const [res] = await pool.execute(
        `UPDATE service_youtube_promotion SET full_name = ?, email = ?, phone = ?, company_name = ?, company_website = ?, country = ?, industry = ?,
           budget = ?, timeline = ?, message = ?, assigned_to = ?, status = ?
         WHERE id = ?`,
        [d.fullName, d.email, d.phone, d.companyName, d.companyWebsite, d.country, d.industry, d.budget, d.timeline,
          d.notes, d.assignedTo, d.status, id]
      );
      if (!(res as { affectedRows: number }).affectedRows) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });
    } else {
      const table = SOURCES[source].table;
      const [res] = await pool.execute(
        `UPDATE \`${table}\` SET full_name = ?, email = ?, phone = ?, company_name = ?, company_website = ?, country = ?, industry = ?,
           service = ?, category = ?, budget = ?, timeline = ?, message = ?, assigned_to = ?, status = ?
         WHERE id = ?`,
        [d.fullName, d.email, d.phone, d.companyName, d.companyWebsite, d.country, d.industry, d.service, d.category, d.budget, d.timeline,
          d.notes, d.assignedTo, d.status, id]
      );
      if (!(res as { affectedRows: number }).affectedRows) return Response.json({ ok: false, error: "This lead was deleted." }, { status: 404 });
    }
  } catch (err: any) {
    if (err?.code === "ER_BAD_FIELD_ERROR" && String(err?.message || "").includes("assigned_to")) {
      const table = SOURCES[source].table;
      await pool.execute(
        `UPDATE \`${table}\` SET full_name = ?, email = ?, phone = ?, company_name = ?, status = ? WHERE id = ?`,
        [d.fullName, d.email, d.phone, d.companyName, d.status, id]
      ).catch(() => {});
    } else {
      throw err;
    }
  }
  return Response.json({ ok: true });
}

/* PATCH { source, id, status, assignedTo } → change a lead's status or assignedTo (any CRM user) */
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

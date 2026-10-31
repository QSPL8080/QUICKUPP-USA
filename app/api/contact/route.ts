import { getPool } from "@/lib/db";
import { CONTACT_SUBJECTS } from "@/lib/formOptions";
import { readJson, requestMeta, validateEnquiry } from "@/lib/enquiry";

/* Contact page form → contact_enquiries (shown in CRM > All Enquiries as "Contact Form") */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });

  // Hidden "website" field: filled in only by spam bots
  if (typeof body.website === "string" && body.website.trim()) return Response.json({ ok: true });

  const result = validateEnquiry(body, CONTACT_SUBJECTS, "projectType");
  if (!result.ok) return Response.json({ ok: false, errors: result.errors }, { status: 400 });

  const d = result.data;
  const meta = requestMeta(request, body.pageUrl);

  try {
    const [res] = await getPool().execute(
      `INSERT INTO contact_enquiries
        (full_name, email, phone, company_name, industry, other_industry, project_type, budget, message,
         agreed_terms, page_url, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      [d.fullName, d.email, d.phone, d.companyName, d.industry, d.otherIndustry, d.subject, d.budget, d.message,
        meta.pageUrl, meta.ip, meta.userAgent]
    );
    return Response.json({ ok: true, id: (res as { insertId: number }).insertId });
  } catch (err) {
    console.error("[api/contact] insert failed:", err);
    return Response.json({ ok: false, error: "We couldn't send your inquiry right now. Please try again." }, { status: 500 });
  }
}

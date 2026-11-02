import { getPool } from "@/lib/db";
import { readJson, validateContactEnquiry } from "@/lib/enquiry";

/* Contact page form → contact_enquiries (shown in CRM > All Enquiries as "Contact Form") */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });

  // Hidden "website" field: filled in only by spam bots
  if (typeof body.website === "string" && body.website.trim()) return Response.json({ ok: true });

  const result = validateContactEnquiry(body);
  if (!result.ok) return Response.json({ ok: false, errors: result.errors }, { status: 400 });

  const d = result.data;

  try {
    // Only the fields we have in the form should be saved + form filled time (created_at is auto-timestamped), nothing else
    const [res] = await getPool().execute(
      `INSERT INTO contact_enquiries
        (full_name, email, phone, company_name, company_website, country, industry, other_industry, project_type, budget, timeline, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.fullName,
        d.email,
        d.phone,
        d.companyName,
        d.companyWebsite,
        d.country,
        d.industry,
        d.otherIndustry,
        d.service,
        d.budget,
        d.timeline,
        d.message,
      ]
    );
    return Response.json({ ok: true, id: (res as { insertId: number }).insertId });
  } catch (err) {
    console.error("[api/contact] insert failed:", err);
    return Response.json({ ok: false, error: "We couldn't send your inquiry right now. Please try again." }, { status: 500 });
  }
}

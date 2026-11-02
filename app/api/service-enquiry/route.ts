import { getPool } from "@/lib/db";
import { SERVICE_FORMS, isServiceFormKey } from "@/lib/formOptions";
import { readJson, validateServiceEnquiry } from "@/lib/enquiry";

/*
 * Service page forms → one table per service:
 *   digital-marketing  → service_digital_marketing
 *   ai-automation      → service_ai_automation
 *   it-services        → service_it_services
 *   staff-augmentation → service_staff_augmentation
 * The table name comes only from this fixed list, never from the request.
 * "service" is the fixed service of that form; "category" is the subpage the
 * visitor picked.
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });

  if (typeof body.website === "string" && body.website.trim()) return Response.json({ ok: true });

  if (!isServiceFormKey(body.service)) {
    return Response.json({ ok: false, error: "Unknown service form." }, { status: 400 });
  }
  const form = SERVICE_FORMS[body.service];

  const result = validateServiceEnquiry(body, form.options);
  if (!result.ok) return Response.json({ ok: false, errors: result.errors }, { status: 400 });

  const d = result.data;

  try {
    // Only the fields we have in the form should be saved + form filled time (created_at is auto-timestamped), nothing else
    const [res] = await getPool().execute(
      `INSERT INTO ${form.table}
        (full_name, email, phone, company_name, company_website, country, industry, other_industry, service, category, budget, timeline, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.fullName,
        d.email,
        d.phone,
        d.companyName,
        d.companyWebsite,
        d.country,
        d.industry,
        d.otherIndustry,
        form.label,
        d.category,
        d.budget,
        d.timeline,
        d.message,
      ]
    );
    return Response.json({ ok: true, id: (res as { insertId: number }).insertId });
  } catch (err) {
    console.error(`[api/service-enquiry] insert into ${form.table} failed:`, err);
    return Response.json({ ok: false, error: "We couldn't send your inquiry right now. Please try again." }, { status: 500 });
  }
}

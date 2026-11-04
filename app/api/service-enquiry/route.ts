import { after } from "next/server";
import { getPool } from "@/lib/db";
import { SERVICE_FORMS, isServiceFormKey } from "@/lib/formOptions";
import { readJson, validateServiceEnquiry } from "@/lib/enquiry";
import { LEADS_NOTIFICATION_EMAIL, escapeHtml, sendMail } from "@/lib/mailer";
import { logLeadReceived } from "@/lib/crm/leadActivity";

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
    const isYoutube = form.table === "service_youtube_promotion";
    const insertSql = isYoutube
      ? `INSERT INTO ${form.table}
          (full_name, email, phone, company_name, company_website, country, industry, other_industry, service, budget, timeline, youtube_link, message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      : `INSERT INTO ${form.table}
          (full_name, email, phone, company_name, company_website, country, industry, other_industry, service, category, budget, timeline, message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const insertParams = isYoutube
      ? [
          d.fullName,
          d.email,
          d.phone,
          d.companyName,
          d.companyWebsite,
          d.country,
          d.industry,
          d.otherIndustry,
          form.label,
          d.budget,
          d.timeline,
          d.youtubeLink || null,
          d.message,
        ]
      : [
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
        ];

    const [res] = await getPool().execute(insertSql, insertParams);

    const insertId = (res as { insertId: number }).insertId;

    await logLeadReceived(body.service, insertId);

    // Send email notification to info@quickuppsoftech.us (asynchronously, so client does not wait)
    after(async () => {
      const rows = [
        ["Lead ID", `#${insertId}`],
        ["Service", form.label],
      ];
      if (!isYoutube) {
        rows.push(["Selected Categories", d.category || "—"]);
      }
      rows.push(
        ["Full Name", d.fullName],
        ["Business Email", d.email],
        ["Phone Number", d.phone],
        ["Company Name", d.companyName || "—"],
        ["Company Website", d.companyWebsite || "—"],
        ["Country", d.country],
        ["Industry", d.industry === "Other" && d.otherIndustry ? `Other (${d.otherIndustry})` : d.industry],
        ["Estimated Project Budget", d.budget],
        ["Project Timeline", d.timeline]
      );
      if (d.youtubeLink) {
        rows.push(["YouTube Video / Channel Link", d.youtubeLink]);
      }

      const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#111">
<h2 style="color:#0f172a;margin-bottom:16px;">New Service Lead: ${escapeHtml(form.label)}</h2>
<p>A new inquiry was submitted through the ${escapeHtml(form.label)} form.</p>
<table style="border-collapse:collapse;width:100%;max-width:600px;margin-bottom:20px;">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:bold;width:200px;">${escapeHtml(k)}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${escapeHtml(v)}</td></tr>`
  )
  .join("")}
</table>
<div style="background:#f1f5f9;padding:12px 16px;border-radius:6px;max-width:600px;margin-bottom:20px;">
<b>Tell Us About Your Requirements:</b><br>
${escapeHtml(d.message || "—").replace(/\n/g, "<br>")}
</div>
<p style="color:#64748b;font-size:13px;">This lead is saved in the CRM under All Enquiries &gt; ${escapeHtml(form.label)} (#${insertId}).<br>Reply directly to this email to contact the lead.</p>
</div>`;

      const text = `New Service Lead: ${form.label}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nRequirements / Message:\n${d.message || "—"}\n\nSaved in CRM (#${insertId}). Reply to this email to contact the lead.`;

      await sendMail({
        channel: "info",
        to: LEADS_NOTIFICATION_EMAIL,
        fromName: "Quickupp Softech Website",
        replyTo: `${d.fullName} <${d.email}>`,
        subject: `New Service Lead: ${d.fullName} – ${form.label} (${d.category || "General"})`,
        html,
        text,
      }).catch((err) => console.error(`[api/service-enquiry] notification email failed for ${form.table}:`, err));
    });

    return Response.json({ ok: true, id: insertId });
  } catch (err) {
    console.error(`[api/service-enquiry] insert into ${form.table} failed:`, err);
    return Response.json({ ok: false, error: "We couldn't send your inquiry right now. Please try again." }, { status: 500 });
  }
}

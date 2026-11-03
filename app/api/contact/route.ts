import { after } from "next/server";
import { getPool } from "@/lib/db";
import { readJson, validateContactEnquiry } from "@/lib/enquiry";
import { LEADS_NOTIFICATION_EMAIL, escapeHtml, sendMail } from "@/lib/mailer";

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
    let insertId: number;
    try {
      const [res] = await getPool().execute(
        `INSERT INTO contact_enquiries
          (full_name, email, phone, company_name, company_website, country, industry, other_industry, project_type, category, budget, timeline, message)
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
          d.service,
          d.category || null,
          d.budget,
          d.timeline,
          d.message,
        ]
      );
      insertId = (res as { insertId: number }).insertId;
    } catch {
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
          d.category ? `[Category: ${d.category}]\n\n${d.message || ""}` : d.message,
        ]
      );
      insertId = (res as { insertId: number }).insertId;
    }

    // Send email notification to info@quickuppsoftech.us (asynchronously, so client does not wait)
    after(async () => {
      const rows = [
        ["Lead ID", `#${insertId}`],
        ["Full Name", d.fullName],
        ["Business Email", d.email],
        ["Phone Number", d.phone],
        ["Company Name", d.companyName || "—"],
        ["Company Website", d.companyWebsite || "—"],
        ["Country", d.country],
        ["Industry", d.industry === "Other" && d.otherIndustry ? `Other (${d.otherIndustry})` : d.industry],
        ["Service Interested In", d.service],
        ["Category / Scope", d.category || "—"],
        ["Estimated Project Budget", d.budget],
        ["Project Timeline", d.timeline],
      ];

      const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#111">
<h2 style="color:#0f172a;margin-bottom:16px;">New Contact Lead Received</h2>
<p>A new inquiry was submitted through the website Contact Form.</p>
<table style="border-collapse:collapse;width:100%;max-width:600px;margin-bottom:20px;">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:bold;width:200px;">${escapeHtml(k)}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;">${escapeHtml(v)}</td></tr>`
  )
  .join("")}
</table>
<div style="background:#f1f5f9;padding:12px 16px;border-radius:6px;max-width:600px;margin-bottom:20px;">
<b>Tell Us About Your Project / Requirements:</b><br>
${escapeHtml(d.message || "—").replace(/\n/g, "<br>")}
</div>
<p style="color:#64748b;font-size:13px;">This lead is saved in the CRM under All Enquiries &gt; Contact Form (#${insertId}).<br>Reply directly to this email to contact the lead.</p>
</div>`;

      const text = `New Contact Lead Received\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nProject Requirements / Message:\n${d.message || "—"}\n\nSaved in CRM (#${insertId}). Reply to this email to contact the lead.`;

      await sendMail({
        channel: "info",
        to: LEADS_NOTIFICATION_EMAIL,
        fromName: "Quickupp Softech Website",
        replyTo: `${d.fullName} <${d.email}>`,
        subject: `New Lead: ${d.fullName} – ${d.service}`,
        html,
        text,
      }).catch((err) => console.error("[api/contact] notification email failed:", err));
    });

    return Response.json({ ok: true, id: insertId });
  } catch (err) {
    console.error("[api/contact] insert failed:", err);
    return Response.json({ ok: false, error: "We couldn't send your inquiry right now. Please try again." }, { status: 500 });
  }
}

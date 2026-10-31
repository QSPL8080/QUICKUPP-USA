import { after } from "next/server";
import { getPool } from "@/lib/db";
import { requestMeta } from "@/lib/enquiry";
import { RESUME_TYPES, checkResume, fmtBytes, resumeExt, validateApplication } from "@/lib/applications";
import { HR_EMAIL, escapeHtml, sendMail } from "@/lib/mailer";

/*
 * Careers page Apply Now form (multipart: fields + resume file)
 * → saved in job_applications (shown in the CRM under Job Applications)
 * → emailed to HR with the resume attached
 */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Hidden "website" field: filled in only by spam bots
  const trap = form.get("website");
  if (typeof trap === "string" && trap.trim()) return Response.json({ ok: true });

  const fields: Record<string, unknown> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") fields[k] = v;

  const result = validateApplication(fields);
  const fileValue = form.get("resume");
  const file = fileValue && typeof fileValue !== "string" ? fileValue : null;
  const resumeError = checkResume(file);
  if (!result.ok || resumeError) {
    const errors = result.ok ? {} : result.errors;
    if (resumeError) errors.resume = resumeError;
    return Response.json({ ok: false, errors }, { status: 400 });
  }
  const d = result.data;
  const resume = file as File;

  const pool = getPool();
  try {
    // only openings that are live on the Careers page can be applied to
    const [jobs] = await pool.query(
      "SELECT id, title, department, employment_type, location FROM job_openings WHERE id = ? AND is_open = 1 AND (deadline IS NULL OR deadline >= CURDATE())",
      [d.jobId]
    );
    const job = (jobs as Record<string, unknown>[])[0];
    if (!job) {
      return Response.json({ ok: false, error: "This opening is no longer accepting applications." }, { status: 410 });
    }

    const ext = resumeExt(resume.name);
    const data = Buffer.from(await resume.arrayBuffer());
    const resumeName = resume.name.replace(/[^\w.\- ()]+/g, "_").slice(0, 200) || `resume.${ext}`;
    const meta = requestMeta(request, fields.pageUrl);

    const [res] = await pool.execute(
      `INSERT INTO job_applications
        (job_id, job_title, department, full_name, email, phone, current_location, experience, profile_url, cover_note,
         resume_name, resume_type, resume_size, resume_data, agreed_terms, page_url, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      [Number(job.id), String(job.title), String(job.department), d.fullName, d.email, d.phone, d.currentLocation, d.experience, d.profileUrl, d.coverNote,
        resumeName, RESUME_TYPES[ext], data.length, data, meta.pageUrl, meta.ip, meta.userAgent]
    );
    const id = (res as { insertId: number }).insertId;

    // email HR; the application is already saved even if this fails
    const rows: [string, string][] = [
      ["Position", String(job.title)],
      ["Department", String(job.department)],
      ["Employment Type", String(job.employment_type)],
      ["Work Location", String(job.location)],
      ["Full Name", d.fullName],
      ["Email", d.email],
      ["Phone", d.phone],
      ["Current Location", d.currentLocation],
      ["Total Experience", d.experience],
      ["LinkedIn / Portfolio", d.profileUrl || "—"],
      ["Resume", `${resumeName} (${fmtBytes(data.length)}, attached)`],
    ];
    const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#0b0f17;max-width:640px">
  <h2 style="margin:0 0 4px;font-size:20px">New job application</h2>
  <p style="margin:0 0 18px;color:#64748b">Sent from the Careers page · Application #${id}</p>
  <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;border:1px solid #e5e7ef">
    ${rows
      .map(
        ([k, v], i) =>
          `<tr style="background:${i % 2 ? "#ffffff" : "#f8f9fc"}"><td style="width:170px;color:#64748b;font-weight:bold;border-bottom:1px solid #e5e7ef">${escapeHtml(k)}</td><td style="border-bottom:1px solid #e5e7ef">${escapeHtml(v)}</td></tr>`
      )
      .join("\n    ")}
  </table>
  <h3 style="margin:22px 0 6px;font-size:15px">Cover note</h3>
  <p style="margin:0;white-space:pre-wrap;line-height:1.6">${escapeHtml(d.coverNote || "—")}</p>
  <p style="margin:24px 0 0;color:#64748b;font-size:12px">This application is also saved in the CRM under Job Applications. Reply to this email to answer the candidate.</p>
</div>`;
    const text = `New job application (#${id})\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nCover note:\n${d.coverNote || "—"}`;

    // sent after the reply so the candidate never waits on the mail server
    after(async () => {
      const sent = await sendMail({
        to: HR_EMAIL,
        replyTo: `${d.fullName} <${d.email}>`,
        subject: `Career Application – ${d.fullName} – ${job.title}`,
        html,
        text,
        attachments: [{ filename: resumeName, content: data, contentType: RESUME_TYPES[ext] }],
      });
      if (sent) await pool.execute("UPDATE job_applications SET mail_sent = 1 WHERE id = ?", [id]).catch(() => {});
    });

    return Response.json({ ok: true, id });
  } catch (err) {
    console.error("[api/careers/apply] failed:", err);
    return Response.json({ ok: false, error: "We couldn't send your application right now. Please try again." }, { status: 500 });
  }
}

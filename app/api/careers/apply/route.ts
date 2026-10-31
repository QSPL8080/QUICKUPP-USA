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
    // plain, simple layout so it reads well in any mail app
    const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#111">
<p>Hello,</p>
<p>A new job application has been received from the Careers page.</p>
<p>${rows.map(([k, v]) => `<b>${escapeHtml(k)}:</b> ${escapeHtml(v)}`).join("<br>\n")}</p>
<p><b>Cover note:</b><br>${escapeHtml(d.coverNote || "—").replace(/\n/g, "<br>")}</p>
<p>The resume is attached to this email. This application is also saved in the CRM under Careers &gt; Job Applications (#${id}).<br>Reply to this email to contact the candidate.</p>
</div>`;
    const text = `Hello,\n\nA new job application has been received from the Careers page.\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nCover note:\n${d.coverNote || "—"}\n\nThe resume is attached. This application is also saved in the CRM under Careers > Job Applications (#${id}). Reply to this email to contact the candidate.`;

    // sent after the reply so the candidate never waits on the mail server
    after(async () => {
      const sent = await sendMail({
        to: HR_EMAIL,
        fromName: "Quickupp Softech Careers",
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

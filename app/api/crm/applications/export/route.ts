import { getUserFor } from "@/lib/crm/auth";
import { exportApplications } from "@/lib/crm/applications";
import { APPLICATION_STATUS_LABEL, fmtBytes } from "@/lib/applications";
import { parseIds } from "@/lib/crm/ids";
import { viewerTimeZone } from "@/lib/crm/crmTime";

const cell = (v: string | number | null | undefined) => {
  const s = v == null ? "" : String(v);
  // quote every cell; neutralise spreadsheet formulas
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

/* GET ?q=&job=&status=&from=&to=&ids= → the filtered job applications as a CSV file */
export async function GET(request: Request) {
  if (!(await getUserFor("applications"))) return new Response("Please sign in again.", { status: 401 });
  const sp = new URL(request.url).searchParams;
  const rawIds = sp.get("ids");
  const parsed = rawIds ? parseIds(rawIds.split(",")) : null;
  const ids = parsed && parsed.length ? parsed : undefined;

  const rows = await exportApplications({
    q: sp.get("q") || "",
    job: sp.get("job") || "",
    status: sp.get("status") || "",
    from: sp.get("from") || "",
    to: sp.get("to") || "",
    tz: await viewerTimeZone(),
    ids,
  });

  const head = [
    "Sr. No",
    "Application ID",
    "Candidate Name",
    "Email",
    "Phone",
    "Current Location",
    "Applied Position",
    "Department",
    "Total Experience",
    "LinkedIn / Portfolio",
    "Cover Note",
    "Resume File Name",
    "Resume File Size",
    "Status",
    "Received Date & Time",
  ];

  const lines = rows.map((r, i) =>
    [
      i + 1,
      `#${r.id}`,
      r.name,
      r.email,
      r.phone,
      r.location,
      r.jobTitle,
      r.department || "—",
      r.experience,
      r.profileUrl || "—",
      r.coverNote || "—",
      r.resumeName,
      fmtBytes(r.resumeSize),
      APPLICATION_STATUS_LABEL[r.status] || r.status,
      new Date(r.createdAt).toISOString().replace("T", " ").slice(0, 19),
    ]
      .map(cell)
      .join(",")
  );

  const csv = "\uFEFF" + [head.map(cell).join(","), ...lines].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="quickupp-job-applications-${date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}

import { getUserFor } from "@/lib/crm/auth";
import { exportLeadDetails } from "@/lib/crm/data";
import { ENQUIRY_STATUS_LABEL, SOURCE_LABEL } from "@/lib/crm/leadOptions";
import { csvFile } from "@/lib/crm/csv";

/*
 * GET ?q=&source=&status=&projectStatus=&channel=&from=&to= → the leads the
 * All Enquiries list shows (same tab and filters), every field, as a CSV file
 * that opens in Excel / Google Sheets.
 * GET ?keys=contact:12,manual:3 → just those (the selected rows).
 */
export async function GET(request: Request) {
  if (!(await getUserFor("leads"))) return new Response("Please sign in again.", { status: 401 });
  const sp = new URL(request.url).searchParams;
  const keys = (sp.get("keys") || "").split(",").map((k) => k.trim()).filter(Boolean).slice(0, 2000);
  const rows = await exportLeadDetails(
    {
      q: sp.get("q") || "",
      source: sp.get("source") || "",
      status: sp.get("status") || "",
      projectStatus: sp.get("projectStatus") || "",
      channel: sp.get("channel") || "",
      from: sp.get("from") || "",
      to: sp.get("to") || "",
    },
    keys.length ? keys : undefined
  );
  const head = [
    "Sr. No", "Received", "Source", "Name", "Email", "Phone", "Company", "Company Website", "Country", "Industry",
    "Service", "Categories / Service Interest", "Budget", "Timeline", "YouTube Link", "Message", "Lead Status",
    "Project Status", "Handled By", "Lead Channel", "Page",
  ];
  const lines = rows.map((r, i) => [
    i + 1,
    new Date(r.createdAt).toISOString().replace("T", " ").slice(0, 16),
    SOURCE_LABEL[r.source],
    r.name,
    r.email,
    r.phone,
    r.company,
    r.website,
    r.country,
    r.industry === "Other" && r.otherIndustry ? `Other: ${r.otherIndustry}` : r.industry,
    r.service,
    r.interest || r.category,
    r.budget,
    r.timeline,
    r.youtubeLink,
    r.message,
    ENQUIRY_STATUS_LABEL[r.status] || r.status,
    r.projectStatus || "Not Started",
    r.assignedTo,
    r.channel || (r.source === "manual" ? "Manual" : "Website"),
    r.pageUrl || r.sourcePage,
  ]);
  return csvFile(`quickupp-enquiries-${new Date().toISOString().slice(0, 10)}.csv`, head, lines);
}

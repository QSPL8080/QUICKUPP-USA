import { getUserFor } from "@/lib/crm/auth";
import { exportLeadDetails } from "@/lib/crm/data";
import { ENQUIRY_STATUS_LABEL, SOURCE_LABEL } from "@/lib/crm/leadOptions";
import { csvFile } from "@/lib/crm/csv";
import { exportStamp, exportZone, viewerTimeZone } from "@/lib/crm/crmTime";
import { PAYMENT_STATUS_LABEL } from "@/lib/crm/format";
import { getPool } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";

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
      tz: await viewerTimeZone(),
    },
    keys.length ? keys : undefined
  );
  const tz = await viewerTimeZone();
  const zone = exportZone(tz);
  const pool = getPool();

  // payment links made for these leads, and the latest activity on each
  const bySource = new Map<string, number[]>();
  for (const r of rows) bySource.set(r.source, [...(bySource.get(r.source) || []), r.id]);
  const links = new Map<string, RowDataPacket[]>();
  const activity = new Map<string, { n: number; last: Date }>();
  for (const [source, ids] of bySource) {
    for (let i = 0; i < ids.length; i += 500) {
      const chunk = ids.slice(i, i + 500);
      const [pl] = await pool
        .query<RowDataPacket[]>(
          "SELECT lead_id, invoice_number, total_amount, amount, remaining_amount, status, link_status, created_at FROM payment_links WHERE lead_source = ? AND lead_id IN (?) ORDER BY created_at",
          [source, chunk]
        )
        .catch(() => [[] as RowDataPacket[]]);
      for (const l of pl) links.set(`${source}:${l.lead_id}`, [...(links.get(`${source}:${l.lead_id}`) || []), l]);
      const [acts] = await pool
        .query<RowDataPacket[]>(
          "SELECT entity_id, COUNT(*) AS n, MAX(created_at) AS last FROM crm_activity WHERE entity_type = 'lead' AND entity_source = ? AND entity_id IN (?) GROUP BY entity_id",
          [source, chunk]
        )
        .catch(() => [[] as RowDataPacket[]]);
      for (const a of acts) activity.set(`${source}:${a.entity_id}`, { n: Number(a.n), last: new Date(a.last) });
    }
  }
  const usd = (v: unknown) => `$${Number(v || 0).toFixed(2)}`;
  const linkText = (l: RowDataPacket) =>
    `${l.invoice_number || "—"}: total ${usd(l.total_amount)}, paid ${usd(l.amount)}${Number(l.remaining_amount) > 0 && l.status === "partially_paid" ? `, balance ${usd(l.remaining_amount)}` : ""} (${PAYMENT_STATUS_LABEL[l.status] || l.status}${l.link_status ? `, link ${l.link_status}` : ""})`;

  const head = [
    "Sr. No", "Lead ID", `Received (${zone})`, "Source", "Lead Channel", "Name", "Email", "Phone", "Company", "Company Website",
    "Country / Location", "Industry", "Service", "Service Page / Interest", "Categories", "Budget", "Timeline", "YouTube Link",
    "Message / Notes", "Lead Status", "Project Status", "Handled By", "Added By (manual leads)", "Form Page", "Page URL",
    "Attachments", "Payment Links", "Total Paid on Payment Links", "History Entries", `Last Activity (${zone})`,
  ];
  const lines = rows.map((r, i) => {
    const key = `${r.source}:${r.id}`;
    const pl = links.get(key) || [];
    const act = activity.get(key);
    const files = (r.attachments || []) as { fileName?: string; name?: string; fileSize?: number }[];
    return [
      i + 1,
      `${SOURCE_LABEL[r.source]} #${r.id}`,
      exportStamp(r.createdAt, tz),
      SOURCE_LABEL[r.source],
      r.channel || (r.source === "manual" ? "Manual" : "Website"),
      r.name,
      r.email,
      r.phone,
      r.company,
      r.website,
      r.country,
      r.industry === "Other" && r.otherIndustry ? `Other: ${r.otherIndustry}` : r.industry,
      r.service,
      r.interest,
      r.category && r.category !== r.interest ? r.category : "",
      r.budget,
      r.timeline,
      r.youtubeLink,
      r.message,
      ENQUIRY_STATUS_LABEL[r.status] || r.status,
      r.projectStatus || "Not Started",
      r.assignedTo || "Not assigned",
      r.createdBy,
      r.sourcePage,
      r.pageUrl,
      files.map((f) => f.fileName || f.name).filter(Boolean).join("; "),
      pl.map(linkText).join(" | "),
      pl.length ? usd(pl.reduce((a, l) => a + Number(l.amount || 0), 0)) : "",
      act?.n ?? 0,
      act ? exportStamp(act.last, tz) : "",
    ];
  });
  return csvFile(`quickupp-enquiries-${new Date().toISOString().slice(0, 10)}.csv`, head, lines);
}

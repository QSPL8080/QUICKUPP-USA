import { getCurrentUser } from "@/lib/crm/auth";
import { exportLeads } from "@/lib/crm/data";
import { ENQUIRY_STATUS_LABEL, SOURCE_LABEL } from "@/lib/crm/leadOptions";

const cell = (v: string | number | null | undefined) => {
  const s = v == null ? "" : String(v);
  // quote every cell; neutralise spreadsheet formulas
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

/* GET ?q=&source=&status=&from=&to= → the filtered lead list as a CSV file */
export async function GET(request: Request) {
  if (!(await getCurrentUser())) return new Response("Please sign in again.", { status: 401 });
  const sp = new URL(request.url).searchParams;
  const rows = await exportLeads({
    q: sp.get("q") || "",
    source: sp.get("source") || "",
    status: sp.get("status") || "",
    from: sp.get("from") || "",
    to: sp.get("to") || "",
  });
  const head = ["Sr. No", "Name", "Email", "Phone", "Company", "Source", "Service", "Service type", "Status", "Received"];
  const lines = rows.map((r, i) =>
    [i + 1, r.name, r.email, r.phone, r.company, SOURCE_LABEL[r.source], r.service, r.detail, ENQUIRY_STATUS_LABEL[r.status], new Date(r.createdAt).toISOString().replace("T", " ").slice(0, 16)]
      .map(cell)
      .join(",")
  );
  const csv = "﻿" + [head.map(cell).join(","), ...lines].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="quickupp-enquiries-${date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}

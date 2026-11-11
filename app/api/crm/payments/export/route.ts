import { getUserFor } from "@/lib/crm/auth";
import { listPayments } from "@/lib/crm/data";
import { PAYMENT_STATUS_LABEL } from "@/lib/crm/format";
import { csvFile } from "@/lib/crm/csv";
import { viewerTimeZone } from "@/lib/crm/crmTime";

/*
 * GET ?q=&status=&tab=&from=&to= → the payments the Payments tab shows (same
 * tab, status, search and month), every field, as a CSV file.
 * GET ?keys=pay:5,link:3 → just those (the selected rows: pay = a payment
 * record, link = a payment link). The older form website:5,payment_link:3 works too.
 */
export async function GET(request: Request) {
  if (!(await getUserFor("payments"))) return new Response("Please sign in again.", { status: 401 });
  const sp = new URL(request.url).searchParams;
  const tabRaw = sp.get("tab");
  const tab = tabRaw === "website" || tabRaw === "payment_link" ? tabRaw : "all";
  const keys = new Set((sp.get("keys") || "").split(",").map((k) => k.trim()).filter(Boolean));
  const data = await listPayments({
    q: sp.get("q") || "",
    status: sp.get("status") || "",
    tab,
    from: sp.get("from") || "",
    to: sp.get("to") || "",
    tz: await viewerTimeZone(),
    all: true,
  });
  const rows = keys.size
    ? data.items.filter((p) => keys.has(`${p.table === "payment_links" ? "link" : "pay"}:${p.id}`) || keys.has(`${p.source}:${p.id}`))
    : data.items;
  const day = (v: string | null) => (v ? new Date(v).toISOString().replace("T", " ").slice(0, 16) : "");
  const money = (v: number | null | undefined) => (v == null ? "" : v.toFixed(2));
  const head = [
    "Sr. No", "Order / Invoice", "Type", "Client Name", "Client Email", "Client Phone", "Company", "Service", "Category",
    "Industry", "Payment Type", "Amount Paid", "Order Total", "Remaining", "Currency", "Status", "Method",
    "Paid At (UTC)", "Created (UTC)", "Balance Due Date", "Transaction Ref", "PayPal Order", "Link Status",
    "Billing Start", "Billing End", "Created By", "Notes",
  ];
  const lines = rows.map((p, i) => [
    i + 1,
    p.invoiceNumber,
    p.source === "payment_link" ? "Payment link" : p.source === "website" || p.source === "online" ? "Website" : p.source,
    p.clientName,
    p.clientEmail,
    p.clientPhone,
    p.companyName,
    p.service,
    p.category,
    p.industry,
    p.paymentType === "partial" ? "Partial / deposit" : "Full",
    money(p.amount),
    money(p.totalAmount ?? p.amount),
    money(p.remainingAmount),
    p.currency,
    PAYMENT_STATUS_LABEL[p.status] || p.status,
    p.method,
    day(p.paidAt),
    day(p.createdAt),
    p.balanceDueDate,
    p.reference,
    p.paypalOrderId,
    p.linkStatus,
    p.billingStartDate,
    p.billingEndDate,
    p.createdBy,
    p.notes,
  ]);
  return csvFile(`quickupp-payments-${new Date().toISOString().slice(0, 10)}.csv`, head, lines);
}

import { getUserFor } from "@/lib/crm/auth";
import { listPayments } from "@/lib/crm/data";
import { PAYMENT_STATUS_LABEL } from "@/lib/crm/format";
import { csvFile } from "@/lib/crm/csv";
import { exportStamp, exportZone, viewerTimeZone } from "@/lib/crm/crmTime";
import { getPool } from "@/lib/db";
import type { RowDataPacket } from "mysql2/promise";
import { listTransactions, type Txn } from "@/lib/paymentTxns";
import { payLinkUrl } from "@/lib/siteUrl";
import { SOURCE_LABEL, isEnquirySource } from "@/lib/crm/leadOptions";

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
  const tz = await viewerTimeZone();
  const zone = exportZone(tz);
  const at = (v: string | null | undefined) => exportStamp(v, tz);
  const money = (v: number | null | undefined) => (v == null ? "" : Number(v).toFixed(2));

  // every PayPal transaction on these records (deposit, balance, full), read in one go
  const txns = new Map<string, Txn[]>();
  for (const table of ["payments", "payment_links"] as const) {
    const ids = rows.filter((p) => p.table === table).map((p) => p.id);
    for (let i = 0; i < ids.length; i += 500) {
      const [tr] = await getPool()
        .query<RowDataPacket[]>(
          "SELECT record_id, kind, amount, currency, status, transaction_id, paypal_order_id, note, created_at FROM payment_transactions WHERE record_table = ? AND record_id IN (?) ORDER BY created_at, id",
          [table, ids.slice(i, i + 500)]
        )
        .catch(() => [[] as RowDataPacket[]]);
      for (const t of tr) {
        const k = `${table}:${t.record_id}`;
        txns.set(k, [
          ...(txns.get(k) || []),
          { kind: t.kind, amount: Number(t.amount), currency: t.currency, status: t.status, transactionId: t.transaction_id, orderId: t.paypal_order_id, at: new Date(t.created_at).toISOString(), note: t.note },
        ]);
      }
    }
  }
  // payments from before transactions were kept one by one: read from their history
  for (const p of rows) {
    const k = `${p.table}:${p.id}`;
    if (!txns.has(k) && p.amount > 0) txns.set(k, await listTransactions(p.table, p.id));
  }

  const KIND = { full: "Full payment", deposit: "Deposit", balance: "Balance" } as const;
  const linkState = (p: (typeof rows)[number]) => {
    if (p.table !== "payment_links") return p.status === "partially_paid" ? "Balance link open until paid" : "";
    if (p.linkStatus === "cancelled") return "Deactivated";
    if (p.status === "paid" || p.linkStatus === "used") return p.table === "payment_links" ? "Used (paid)" : "Paid";
    if (p.amount > 0 && p.status === "partially_paid") return "Balance link open until paid";
    const ends = p.expiresAt ? new Date(p.expiresAt) : new Date(new Date(p.createdAt).getTime() + 24 * 3600_000);
    if (p.linkStatus === "expired" || Date.now() > ends.getTime()) return "Expired (not paid within 24 hours)";
    return "Open";
  };

  const head = [
    "Sr. No", "Order / Invoice", "Record", "Client Name", "Client Email", "Client Phone", "Company", "Service", "Category / Package",
    "Industry", "Description", "Currency", "Order Total", "Paid So Far", "Balance Due", "Payment Status", "Payment Option",
    "Number of Payments", "Payments (type, amount, date, transaction ID)", "Deposit Transaction ID", `Deposit Paid At (${zone})`,
    "Balance Transaction ID", `Balance Paid At (${zone})`, "Full Payment Transaction ID", "Failed Attempts",
    `Last Payment At (${zone})`, `Created (${zone})`, "Link Created By", `Link Valid Until (${zone})`, "Link Status", "Pay / Balance Link",
    "Balance Due Date", `10-Day Reminder Sent (${zone})`, `2-Day Reminder Sent (${zone})`, "Billing Start", "Billing End",
    "From Lead", "Notes",
  ];
  const lines = rows.map((p, i) => {
    const list = txns.get(`${p.table}:${p.id}`) || [];
    const ok = list.filter((t) => t.status !== "failed");
    const failed = list.filter((t) => t.status === "failed");
    const dep = ok.find((t) => t.kind === "deposit");
    const bal = ok.filter((t) => t.kind === "balance").slice(-1)[0];
    const full = ok.find((t) => t.kind === "full");
    const total = p.totalAmount ?? p.amount;
    const due = p.status === "partially_paid" ? p.remainingAmount ?? Math.max(0, total - p.amount) : 0;
    const open = p.token && p.linkStatus !== "cancelled" && (p.status === "partially_paid" || (p.amount === 0 && linkState(p) === "Open"));
    return [
      i + 1,
      p.invoiceNumber,
      p.table === "payment_links" ? "Payment link" : p.source === "website" || p.source === "online" ? "Website payment (Pay Now)" : "Recorded payment",
      p.clientName,
      p.clientEmail,
      p.clientPhone,
      p.companyName,
      p.service,
      p.category || p.quantity,
      p.industry,
      p.description,
      p.currency,
      money(total),
      money(p.amount),
      due > 0 ? money(due) : "",
      PAYMENT_STATUS_LABEL[p.status] || p.status,
      p.paymentType === "partial" || dep ? "50% deposit, then balance" : "Full payment",
      ok.length,
      ok.map((t) => `${KIND[t.kind]} ${money(t.amount)} ${t.currency} on ${at(t.at)} (${t.transactionId || "—"})${t.status === "pending" ? " pending clearing" : ""}`).join(" | "),
      dep?.transactionId || "",
      dep ? at(dep.at) : "",
      bal?.transactionId || "",
      bal ? at(bal.at) : "",
      full?.transactionId || "",
      failed.length ? failed.map((t) => `${at(t.at)}${t.note ? ` (${t.note})` : ""}`).join(" | ") : "",
      ok.length ? at(ok[ok.length - 1].at) : at(p.paidAt),
      at(p.createdAt),
      p.table === "payment_links" ? p.createdBy || "Admin" : "",
      p.table === "payment_links" ? at(p.expiresAt || new Date(new Date(p.createdAt).getTime() + 24 * 3600_000).toISOString()) : "",
      linkState(p),
      open ? payLinkUrl(p.token!) : "",
      p.balanceDueDate,
      at(p.balanceReminder10dSentAt),
      at(p.balanceReminder2dSentAt),
      p.billingStartDate,
      p.billingEndDate,
      p.leadSource && p.leadId ? `${isEnquirySource(p.leadSource) ? SOURCE_LABEL[p.leadSource] : p.leadSource} #${p.leadId}` : "",
      p.notes,
    ];
  });
  return csvFile(`quickupp-payments-${new Date().toISOString().slice(0, 10)}.csv`, head, lines);
}

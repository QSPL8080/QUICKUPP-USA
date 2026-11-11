import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { EMAIL_LOGO_SRC, escapeHtml } from "@/lib/mailer";
import { paymentDateTime } from "@/lib/paymentTime";
import type { Txn } from "@/lib/paymentTxns";
import { orderNumberOf } from "@/lib/paymentTxns";

/*
 * The emails sent when PayPal reports a payment:
 * - to info@ (the team): every payment, failed and pending ones included;
 * - to the client: a confirmation with the PDF receipt attached. A deposit
 *   email shows what was paid, what is left and the balance link; a balance
 *   email shows the deposit and the balance and says the order is fully paid.
 */

export type PaymentCase = "full" | "deposit" | "balance" | "pending" | "failed";

export type PaymentMailContext = {
  kind: PaymentCase;
  rec: RowDataPacket; // the payment record after the update
  txns: Txn[]; // every transaction on it, oldest first (this one last)
  amount: number; // this payment
  currency: string;
  transactionId: string;
  source: "website" | "link" | "balance-link";
  balanceUrl: string | null;
  failureReason?: string;
  notes?: string | null;
};

const e = (v: unknown) => escapeHtml(String(v ?? ""));
const usd = (v: number, c = "USD") => `$${Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${c}`;
const when = (iso: string) => {
  const { date, time } = paymentDateTime(iso);
  return `${date}, ${time}`;
};
const dueDate = (v: unknown) => {
  if (!v) return "";
  const d = v instanceof Date ? v : new Date(`${String(v).slice(0, 10)}T00:00:00`);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};
const KIND_LABEL: Record<Txn["kind"], string> = { full: "Full payment", deposit: "Deposit", balance: "Balance payment" };
const SOURCE_LABEL = { website: "Website (Pay Now)", link: "Payment link", "balance-link": "Balance link" } as const;

const row = (label: string, value: string, style = "") =>
  `<tr><td style="padding:8px 0;color:#64748b;width:42%;vertical-align:top;">${label}</td><td style="padding:8px 0;color:#0f172a;font-weight:600;${style}">${value}</td></tr>`;

function paymentsTable(txns: Txn[], currency: string) {
  const paid = txns.filter((t) => t.status !== "failed");
  if (!paid.length) return "";
  const lines = paid
    .map(
      (t) => `<tr>
        <td style="padding:10px 8px;border-top:1px solid #e2e8f0;"><strong>${KIND_LABEL[t.kind]}</strong><br/><span style="color:#64748b;font-size:12px;">${e(when(t.at))}</span></td>
        <td style="padding:10px 8px;border-top:1px solid #e2e8f0;font-family:monospace;font-size:12.5px;word-break:break-all;">${e(t.transactionId || "—")}</td>
        <td style="padding:10px 8px;border-top:1px solid #e2e8f0;text-align:right;font-weight:700;white-space:nowrap;">${t.amount > 0 ? usd(t.amount, currency) : "—"}${t.status === "pending" ? '<br/><span style="color:#b45309;font-size:11px;">pending clearing</span>' : ""}</td>
      </tr>`
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:13.5px;margin:0 0 20px;border:1px solid #e2e8f0;border-radius:10px;">
    <tr style="background:#f8fafc;"><th style="padding:9px 8px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">Payment</th><th style="padding:9px 8px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">Transaction ID</th><th style="padding:9px 8px;text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">Amount</th></tr>
    ${lines}
  </table>`;
}

function shell(title: string, body: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${e(title)}</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;margin:0;padding:24px 12px;background:#f1f5f9;color:#1e293b;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#0b0f17;padding:26px 32px;text-align:center;border-bottom:2px solid #3b82f6;">
      <img src="${EMAIL_LOGO_SRC}" alt="Quickupp Softech LLC" width="170" style="display:block;margin:0 auto;max-width:170px;height:auto;"/>
    </div>
    <div style="padding:30px 32px 26px;">${body}</div>
    <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8;">
      © ${new Date().getFullYear()} Quickupp Softech LLC · 167 Princeton Street, Bridgeport, Connecticut 06605, USA<br/>Payments are processed securely by PayPal.
    </div>
  </div>
</body></html>`;
}

function figures(ctx: PaymentMailContext) {
  const r = ctx.rec;
  const total = Number(r.total_amount || r.amount || 0);
  const paidTotal = Number(r.amount || 0);
  const remaining = r.status === "partially_paid" ? Number(r.remaining_amount ?? Math.max(0, total - paidTotal)) : 0;
  return { total, paidTotal, remaining };
}

/* ------------------------------------------------------------------ to info@ */
export function teamEmail(ctx: PaymentMailContext) {
  const r = ctx.rec;
  const order = orderNumberOf(r);
  const { total, paidTotal, remaining } = figures(ctx);
  const name = r.client_name || "Client";
  const cur = ctx.currency;
  const subject =
    ctx.kind === "failed"
      ? `Payment failed: ${usd(ctx.amount, cur)} from ${name} (Order #${order})`
      : ctx.kind === "pending"
      ? `Payment pending clearing: ${usd(ctx.amount, cur)} from ${name} (Order #${order})`
      : ctx.kind === "deposit"
      ? `Deposit received: ${usd(ctx.amount, cur)} of ${usd(total, cur)} from ${name}, ${usd(remaining, cur)} still due (Order #${order})`
      : ctx.kind === "balance"
      ? `Balance paid: ${usd(ctx.amount, cur)} from ${name}, order fully paid (Order #${order})`
      : `Full payment received: ${usd(ctx.amount, cur)} from ${name} (Order #${order})`;
  const head = {
    full: ["#065f46", "Full payment received"],
    deposit: ["#1d4ed8", "Deposit received (partial payment)"],
    balance: ["#065f46", "Balance paid · order fully paid"],
    pending: ["#b45309", "Payment pending clearing"],
    failed: ["#991b1b", "Payment failed"],
  }[ctx.kind];

  const body = `
    <div style="background:${head[0]};padding:16px 20px;border-radius:10px;margin-bottom:22px;">
      <div style="color:#ffffff;font-size:19px;font-weight:800;">${head[1]}</div>
      <div style="color:#e2e8f0;font-size:13px;margin-top:3px;">${e(SOURCE_LABEL[ctx.source])} · ${e(when(new Date().toISOString()))}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:18px;">
      ${row("Order", e(order), "font-family:monospace;")}
      ${row(ctx.kind === "failed" ? "Attempted amount" : "This payment", usd(ctx.amount, cur), `font-size:17px;color:${ctx.kind === "failed" ? "#dc2626" : "#047857"};`)}
      ${row("Transaction ID", e(ctx.transactionId), "font-family:monospace;")}
      ${row("Order total", usd(total, cur))}
      ${ctx.kind === "failed" ? "" : row("Paid so far", usd(paidTotal, cur), "color:#047857;")}
      ${remaining > 0 ? row("Balance due", usd(remaining, cur), "color:#dc2626;") : ""}
      ${remaining > 0 && r.balance_due_date ? row("Balance due by", e(dueDate(r.balance_due_date))) : ""}
      ${ctx.failureReason ? row("Reason", e(ctx.failureReason), "color:#dc2626;") : ""}
      ${row("Client", e(name))}
      ${row("Email", r.client_email ? `<a href="mailto:${e(r.client_email)}">${e(r.client_email)}</a>` : "—")}
      ${row("Phone", e(r.client_phone || "—"))}
      ${r.company_name ? row("Company", e(r.company_name)) : ""}
      ${row("Service", e(r.service || "—"))}
      ${r.category || r.quantity ? row("Category", e(r.category || r.quantity)) : ""}
      ${ctx.notes ? row("Client note", e(ctx.notes)) : ""}
    </table>
    ${ctx.txns.some((t) => t.status !== "failed") ? `<div style="font-size:13px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:.04em;margin:0 0 8px;">Payments on this order</div>${paymentsTable(ctx.txns, cur)}` : ""}
    ${remaining > 0 && ctx.balanceUrl ? `<p style="font-size:13px;color:#475569;margin:0 0 14px;">Client's balance link: <a href="${e(ctx.balanceUrl)}">${e(ctx.balanceUrl)}</a></p>` : ""}
    <p style="font-size:12px;color:#94a3b8;margin:0;">Saved in the CRM under Payments.</p>`;

  const text = [
    subject,
    `Order: ${order}`,
    `This payment: ${usd(ctx.amount, cur)} (transaction ${ctx.transactionId})`,
    `Order total: ${usd(total, cur)}`,
    ctx.kind === "failed" ? "" : `Paid so far: ${usd(paidTotal, cur)}`,
    remaining > 0 ? `Balance due: ${usd(remaining, cur)}` : "",
    ctx.failureReason ? `Reason: ${ctx.failureReason}` : "",
    `Client: ${name} · ${r.client_email || ""} · ${r.client_phone || ""}`,
    `Service: ${r.service || ""}`,
    ...ctx.txns.filter((t) => t.status !== "failed").map((t) => `- ${KIND_LABEL[t.kind]} ${usd(t.amount, cur)} on ${when(t.at)} · transaction ${t.transactionId || "—"}`),
  ]
    .filter(Boolean)
    .join("\n");
  return { subject, html: shell(subject, body), text };
}

/* ------------------------------------------------------------------ to the client */
export function clientEmail(ctx: PaymentMailContext) {
  const r = ctx.rec;
  const order = orderNumberOf(r);
  const { total, paidTotal, remaining } = figures(ctx);
  const cur = ctx.currency;
  const first = String(r.client_name || "").trim().split(/\s+/)[0] || "there";
  const service = r.service || "your service";

  const subject =
    ctx.kind === "pending"
      ? `We received your payment, PayPal is clearing it | Order #${order}`
      : ctx.kind === "deposit"
      ? `Deposit received, ${usd(remaining, cur)} balance remaining | Order #${order}`
      : ctx.kind === "balance"
      ? `Balance paid, your order is fully paid | Order #${order}`
      : `Payment confirmed, thank you | Order #${order}`;

  const banner = {
    full: ["#ecfdf5", "#a7f3d0", "#047857", "Payment received", `${usd(ctx.amount, cur)} · Fully paid`],
    deposit: ["#eff6ff", "#bfdbfe", "#1d4ed8", "Deposit received", `${usd(ctx.amount, cur)} paid · ${usd(remaining, cur)} balance remaining`],
    balance: ["#ecfdf5", "#a7f3d0", "#047857", "Balance received", `${usd(ctx.amount, cur)} paid · Order fully paid`],
    pending: ["#fffbeb", "#fde68a", "#b45309", "Payment processing", `${usd(ctx.amount, cur)} · PayPal is clearing it`],
    failed: ["#fef2f2", "#fecaca", "#b91c1c", "Payment failed", ""],
  }[ctx.kind];

  const intro =
    ctx.kind === "pending"
      ? `We have received your payment of <strong>${usd(ctx.amount, cur)}</strong> for ${e(service)}. PayPal is still clearing it; we will confirm as soon as it clears.`
      : ctx.kind === "deposit"
      ? `Thank you! We have received your deposit of <strong>${usd(ctx.amount, cur)}</strong> for ${e(service)}. The remaining balance of <strong>${usd(remaining, cur)}</strong> can be paid any time with your balance link below.`
      : ctx.kind === "balance"
      ? `Thank you! We have received your balance payment of <strong>${usd(ctx.amount, cur)}</strong> for ${e(service)}. Your order is now <strong>fully paid</strong>.`
      : `Thank you! We have received your payment of <strong>${usd(ctx.amount, cur)}</strong> for ${e(service)}. Your order is <strong>fully paid</strong>.`;

  const thisTxn = ctx.txns[ctx.txns.length - 1];
  const details = `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 20px;">
      ${row("Order number", e(order), "font-family:monospace;")}
      ${row("Service", e(service))}
      ${r.category || r.quantity ? row("Category", e(r.category || r.quantity)) : ""}
      ${row("Order total", usd(total, cur))}
      ${ctx.kind === "balance" ? "" : row(ctx.kind === "pending" ? "Amount (clearing)" : ctx.kind === "deposit" ? "Deposit paid" : "Amount paid", usd(ctx.amount, cur), "color:#047857;")}
      ${ctx.kind === "balance" ? row("Total paid", usd(paidTotal, cur), "color:#047857;") : ""}
      ${remaining > 0 ? row("Balance remaining", usd(remaining, cur), "color:#dc2626;") : ""}
      ${remaining > 0 && r.balance_due_date ? row("Balance due by", e(dueDate(r.balance_due_date))) : ""}
      ${ctx.kind !== "balance" ? row("Date &amp; time", e(when(thisTxn?.at || new Date().toISOString()))) : ""}
      ${ctx.kind !== "balance" ? row("Transaction ID", e(ctx.transactionId), "font-family:monospace;") : ""}
      ${row("Payment method", "PayPal")}
      ${row("Status", ctx.kind === "pending" ? "Pending clearing" : remaining > 0 ? "Partially paid" : "Paid in full", `color:${ctx.kind === "pending" ? "#b45309" : remaining > 0 ? "#1d4ed8" : "#047857"};`)}
    </table>`;

  const balanceBox =
    ctx.kind === "deposit" && remaining > 0 && ctx.balanceUrl
      ? `<div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;padding:18px 20px;text-align:center;margin:0 0 22px;">
          <div style="font-size:15px;font-weight:800;color:#1e1b4b;margin-bottom:4px;">Balance remaining: ${usd(remaining, cur)}</div>
          <div style="font-size:13px;color:#475569;margin-bottom:14px;">${r.balance_due_date ? `Please pay by ${e(dueDate(r.balance_due_date))}. ` : ""}We'll also send you a reminder before it's due.</div>
          <a href="${e(ctx.balanceUrl)}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 26px;border-radius:8px;">Pay remaining balance</a>
          <div style="font-size:12px;color:#64748b;margin-top:12px;word-break:break-all;">${e(ctx.balanceUrl)}</div>
        </div>`
      : "";

  const body = `
    <h1 style="font-size:21px;font-weight:800;color:#0f172a;margin:0 0 12px;">Hi ${e(first)},</h1>
    <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 20px;">${intro}</p>
    <div style="background:${banner[0]};border:1px solid ${banner[1]};border-radius:12px;padding:16px 20px;margin:0 0 22px;text-align:center;">
      <div style="font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:${banner[2]};">${banner[3]}</div>
      <div style="font-size:18px;font-weight:800;color:${banner[2]};margin-top:4px;">${banner[4]}</div>
    </div>
    ${details}
    ${ctx.kind === "balance" ? `<div style="font-size:13px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:.04em;margin:0 0 8px;">Your payments</div>${paymentsTable(ctx.txns, cur)}` : ""}
    ${balanceBox}
    <p style="font-size:14px;color:#334155;margin:0 0 18px;">Your PDF receipt is attached to this email.</p>
    <p style="font-size:14px;color:#475569;line-height:1.6;margin:0 0 18px;">If you have any questions, just reply to this email or write to <a href="mailto:info@quickuppsoftech.us" style="color:#4f46e5;">info@quickuppsoftech.us</a>.</p>
    <p style="font-size:14.5px;color:#1e293b;margin:0;">Thank you,<br/><strong>Quickupp Softech LLC</strong></p>`;

  const text = [
    `Hi ${first},`,
    "",
    intro.replace(/<[^>]+>/g, ""),
    "",
    `Order number: ${order}`,
    `Service: ${service}`,
    `Order total: ${usd(total, cur)}`,
    ...(ctx.kind === "balance"
      ? ctx.txns.filter((t) => t.status !== "failed").map((t) => `${KIND_LABEL[t.kind]}: ${usd(t.amount, cur)} on ${when(t.at)} (transaction ${t.transactionId || "—"})`)
      : [`Amount paid: ${usd(ctx.amount, cur)}`, `Transaction ID: ${ctx.transactionId}`]),
    remaining > 0 ? `Balance remaining: ${usd(remaining, cur)}${r.balance_due_date ? `, due by ${dueDate(r.balance_due_date)}` : ""}` : "Status: paid in full",
    ctx.kind === "deposit" && remaining > 0 && ctx.balanceUrl ? `Pay the balance any time: ${ctx.balanceUrl}` : "",
    "",
    "Your PDF receipt is attached.",
    "",
    "Thank you,",
    "Quickupp Softech LLC",
  ]
    .filter((x, i, a) => x !== "" || a[i - 1] !== "")
    .join("\n");
  return { subject, html: shell(subject, body), text };
}

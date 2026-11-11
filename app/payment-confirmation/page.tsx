import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { RowDataPacket } from "mysql2/promise";
import { getPool } from "@/lib/db";
import { getRecord, listTransactions, orderNumberOf, type Txn } from "@/lib/paymentTxns";
import type { LinkTable } from "@/lib/paymentLink";
import { paymentDateTime } from "@/lib/paymentTime";
import "./confirmation.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment Confirmation | Quickupp Softech LLC",
  description: "Payment confirmation for your Quickupp Softech LLC order.",
  robots: { index: false, follow: false },
};

/*
 * Shown after paying on the website (Pay Now) or with a pay link. It is
 * opened with the PayPal transaction ID (?txn=), which only the payer has, so
 * nobody can look up someone else's order by guessing an order number.
 * Three cases: paid in full, deposit (balance still due, with the balance
 * link), and balance paid (deposit + balance, order complete).
 */

type Props = { searchParams: Promise<{ txn?: string; status?: string }> };

const usd = (v: number, c = "USD") => `$${Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${c}`;
const when = (iso: string) => {
  const { date, time } = paymentDateTime(iso);
  return `${date}, ${time}`;
};
const KIND: Record<Txn["kind"], string> = { full: "Full payment", deposit: "Deposit", balance: "Balance payment" };

async function find(txn: string): Promise<{ table: LinkTable; rec: RowDataPacket; txns: Txn[]; thisTxn: Txn | null } | null> {
  if (!txn || txn.length > 64) return null;
  const [rows] = await getPool()
    .query<RowDataPacket[]>("SELECT record_table, record_id FROM payment_transactions WHERE transaction_id = ? AND status <> 'failed' LIMIT 1", [txn])
    .catch(() => [[] as RowDataPacket[]]);
  if (!rows.length) return null;
  const table = rows[0].record_table === "payment_links" ? "payment_links" : "payments";
  const rec = await getRecord(table, Number(rows[0].record_id));
  if (!rec) return null;
  const txns = (await listTransactions(table, Number(rec.id), rec)).filter((t) => t.status !== "failed");
  return { table, rec, txns, thisTxn: txns.find((t) => t.transactionId === txn) || null };
}

export default async function PaymentConfirmationPage({ searchParams }: Props) {
  const sp = await searchParams;
  const found = await find(String(sp.txn || ""));

  const header = (
    <header className="pc-topbar">
      <Link href="/" className="pc-logo-link" aria-label="Quickupp Softech LLC Home">
        <Image src="/images/logo-black.png" alt="Quickupp Softech LLC" width={160} height={36} className="pc-logo-img" priority />
      </Link>
      <Link href="/" className="pc-back-home">
        <span>← Back to Website</span>
      </Link>
    </header>
  );

  if (!found) {
    return (
      <div className="pc-page-wrap">
        {header}
        <main className="pc-card">
          <div className="pc-hero">
            <h1 className="pc-title">Thank you</h1>
            <p className="pc-subtitle">
              If you have just made a payment, your confirmation and PDF receipt are on their way to your email. Questions? Write to{" "}
              <a href="mailto:info@quickuppsoftech.us">info@quickuppsoftech.us</a>.
            </p>
          </div>
          <div className="pc-body">
            <div className="pc-actions">
              <Link href="/" className="pc-btn-primary">
                <span>Back to Quickupp Softech LLC</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { rec, txns, thisTxn } = found;
  const cur = rec.currency || "USD";
  const total = Number(rec.total_amount || rec.amount || 0);
  const paidTotal = Number(rec.amount || 0);
  const isPending = thisTxn?.status === "pending" || rec.status === "pending";
  const remaining = rec.status === "partially_paid" ? Number(rec.remaining_amount ?? Math.max(0, total - paidTotal)) : 0;
  const kind: "full" | "deposit" | "balance" = thisTxn?.kind || (remaining > 0 ? "deposit" : "full");
  const thisAmount = thisTxn?.amount || paidTotal;
  const order = orderNumberOf(rec);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const balanceHref = remaining > 0 && rec.token ? `${site}/pay/${rec.token}` : null;
  const due = rec.balance_due_date
    ? new Date(`${String(rec.balance_due_date instanceof Date ? rec.balance_due_date.toISOString() : rec.balance_due_date).slice(0, 10)}T00:00:00`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const title = isPending
    ? "Payment received, processing"
    : kind === "deposit"
    ? "Deposit received"
    : kind === "balance"
    ? "Balance paid, order complete"
    : "Payment successful";
  const subtitle = isPending
    ? `We have received your payment of ${usd(thisAmount, cur)}. PayPal is clearing it; we will email you as soon as it clears.`
    : kind === "deposit"
    ? `Thank you! Your deposit of ${usd(thisAmount, cur)} has been received. The remaining balance of ${usd(remaining, cur)} can be paid any time with your balance link.`
    : kind === "balance"
    ? `Thank you! Your balance payment of ${usd(thisAmount, cur)} has been received. Your order is now fully paid.`
    : `Thank you! Your payment of ${usd(thisAmount, cur)} has been received. Your order is fully paid.`;
  const pill = isPending ? ["PENDING CLEARING", "is-pending"] : remaining > 0 ? ["PARTIALLY PAID", "is-partial"] : ["PAID IN FULL", ""];

  return (
    <div className="pc-page-wrap">
      {header}
      <main className="pc-card">
        <div className="pc-hero">
          <div className="pc-badge-icon" style={isPending ? { background: "#fef3c7", color: "#b45309" } : undefined}>
            {isPending ? (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
            ) : (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
          </div>
          <h1 className="pc-title">{title}</h1>
          <p className="pc-subtitle">{subtitle}</p>
        </div>

        <div className="pc-body">
          <div className="pc-section">
            <h2 className="pc-section-title">
              <span>Order summary</span>
            </h2>
            <table className="pc-table">
              <tbody>
                <tr>
                  <td className="pc-label-cell">Order number</td>
                  <td className="pc-val-cell pc-code-val">{order}</td>
                </tr>
                <tr>
                  <td className="pc-label-cell">Service</td>
                  <td className="pc-val-cell">{rec.service}</td>
                </tr>
                {(rec.category || rec.quantity) && (
                  <tr>
                    <td className="pc-label-cell">Category</td>
                    <td className="pc-val-cell">{rec.category || rec.quantity}</td>
                  </tr>
                )}
                <tr>
                  <td className="pc-label-cell">Order total</td>
                  <td className="pc-val-cell">{usd(total, cur)}</td>
                </tr>
                <tr>
                  <td className="pc-label-cell">{isPending ? "Amount (clearing)" : "Paid so far"}</td>
                  <td className="pc-val-cell pc-amount-val" style={isPending ? { color: "#b45309" } : undefined}>
                    {usd(isPending ? thisAmount : paidTotal, cur)}
                  </td>
                </tr>
                {remaining > 0 && (
                  <tr>
                    <td className="pc-label-cell">Balance remaining</td>
                    <td className="pc-val-cell" style={{ color: "#dc2626", fontWeight: 700 }}>
                      {usd(remaining, cur)}
                      {due ? <span className="pc-due"> · due by {due}</span> : null}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="pc-label-cell">Status</td>
                  <td className="pc-val-cell">
                    <span className={`pc-status-pill ${pill[1]}`}>{pill[0]}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pc-section">
            <h2 className="pc-section-title">
              <span>{txns.length > 1 ? "Your payments" : "Your payment"}</span>
            </h2>
            <div className="pc-txns">
              {txns.map((t, i) => (
                <div className={`pc-txn${t.transactionId === thisTxn?.transactionId ? " is-now" : ""}`} key={`${t.transactionId}-${i}`}>
                  <div className="pc-txn-main">
                    <strong>{KIND[t.kind]}</strong>
                    <span>{when(t.at)} · PayPal</span>
                    <span className="pc-txn-id">Transaction ID: {t.transactionId || "—"}</span>
                  </div>
                  <div className="pc-txn-amount">
                    {t.amount > 0 ? usd(t.amount, t.currency) : "—"}
                    {t.status === "pending" && <small>pending clearing</small>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {balanceHref && !isPending && (
            <div className="pc-balance">
              <div>
                <strong>Balance remaining: {usd(remaining, cur)}</strong>
                <p>
                  {due ? `Please pay by ${due}. ` : ""}Your balance link is also in your email, and we&apos;ll send a reminder before it&apos;s due.
                </p>
              </div>
              <a href={balanceHref} className="pc-btn-primary">
                Pay remaining balance
              </a>
            </div>
          )}

          <div className="pc-info-card">
            <div className="pc-info-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <h3 className="pc-info-heading">Confirmation sent to your email</h3>
              <p className="pc-info-sub">
                We have emailed this confirmation, with your PDF receipt attached, to <span className="pc-info-email">{rec.client_email}</span>. Please check your
                inbox (and spam folder).
              </p>
            </div>
          </div>

          <div className="pc-next-card">
            <h3 className="pc-next-title">
              <span>What&apos;s next?</span>
            </h3>
            <p className="pc-next-desc">
              Our team will contact you with the next steps. Please keep your order number (<strong>{order}</strong>) handy when you write to us.
            </p>
            <p className="pc-help-line">
              Need help?{" "}
              <a href="mailto:info@quickuppsoftech.us" className="pc-help-link">
                info@quickuppsoftech.us
              </a>
            </p>
          </div>

          <div className="pc-actions">
            <Link href="/" className="pc-btn-primary">
              <span>Back to Quickupp Softech LLC</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

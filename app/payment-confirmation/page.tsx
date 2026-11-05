import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPool } from "@/lib/db";
import PrintReceiptButton from "@/components/PrintReceiptButton";
import "./confirmation.css";

export const metadata: Metadata = {
  title: "Payment Confirmation | Quickupp Softech LLC",
  description: "Official payment receipt and order confirmation for Quickupp Softech LLC.",
  alternates: {
    canonical: "https://www.quickuppsoftech.us/payment-confirmation",
  },
};

type Props = {
  searchParams: Promise<{
    order?: string;
    invoice?: string;
    ref?: string;
    txn?: string;
    email?: string;
    name?: string;
    service?: string;
    category?: string;
    amount?: string;
    type?: string;
    status?: string;
  }>;
};

export default async function PaymentConfirmationPage({ searchParams }: Props) {
  const sp = await searchParams;
  const lookupKey = sp.order || sp.invoice || sp.ref || sp.txn;

  let paymentRecord: any = null;

  if (lookupKey) {
    try {
      const pool = getPool();
      const isNumeric = /^\d+$/.test(lookupKey);
      const [rows] = await pool.query(
        isNumeric
          ? `SELECT * FROM payments WHERE id = ? LIMIT 1`
          : `SELECT * FROM payments WHERE invoice_number = ? OR reference = ? OR paypal_order_id = ? LIMIT 1`,
        isNumeric ? [Number(lookupKey)] : [lookupKey, lookupKey, lookupKey]
      );
      paymentRecord = (rows as any[])?.[0] || null;
    } catch (err) {
      console.error("[Payment Confirmation Query Error]", err);
    }
  }

  // Fallback values from record or searchParams
  const orderNumber =
    paymentRecord?.invoice_number ||
    sp.order ||
    sp.invoice ||
    `QS-${new Date().getFullYear()}-000127`;

  const clientName = paymentRecord?.client_name || sp.name || "Valued Client";
  const clientEmail = paymentRecord?.client_email || sp.email || "your email address";
  const service = paymentRecord?.service || sp.service || "Information Technology Services";
  const category = paymentRecord?.category || sp.category || "AI, Marketing & Technology";
  const amountPaid = Number(paymentRecord?.amount || sp.amount || 79);
  const totalAmount = Number(paymentRecord?.total_amount || paymentRecord?.amount || amountPaid);
  const paymentType = (paymentRecord?.payment_type as "full" | "partial") || (sp.type as any) || "full";
  const remainingAmount = Number(paymentRecord?.remaining_amount || 0);
  const transactionId = paymentRecord?.reference || sp.ref || sp.txn || "COMPLETED-PAYPAL";
  const isPending = paymentRecord?.status === "pending" || sp.status === "pending";
  const isPartial = paymentType === "partial";

  return (
    <div className="pc-page-wrap">
      {/* Top Header with Quickupp Logo */}
      <header className="pc-topbar">
        <Link href="/" className="pc-logo-link" aria-label="Quickupp Softech LLC Home">
          <Image
            src="/images/logo-black.png"
            alt="Quickupp Softech LLC"
            width={160}
            height={36}
            className="pc-logo-img"
            priority
          />
        </Link>
        <Link href="/" className="pc-back-home">
          <span>← Back to Website</span>
        </Link>
      </header>

      {/* Main Order Confirmation Card */}
      <main className="pc-card">
        {/* Hero Section */}
        <div className="pc-hero">
          <div className="pc-badge-icon" style={isPending ? { background: "#fef3c7", color: "#b45309" } : {}}>
            {isPending ? (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
            ) : (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
          </div>
          <h1 className="pc-title">{isPending ? "Payment Received – Processing" : "Payment Successful"}</h1>
          <p className="pc-subtitle">
            {isPending
              ? "Thank you for your order. Your payment is currently being cleared by PayPal. As soon as clearing completes, your order confirmation will update automatically."
              : "Thank you for your order. Your payment has been received successfully and your order is now confirmed."}
          </p>
        </div>

        {/* Card Body */}
        <div className="pc-body">
          {/* Section 1: Payment Details Table */}
          <div className="pc-section">
            <h2 className="pc-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
              <span>Payment Details</span>
            </h2>

            <table className="pc-table">
              <tbody>
                <tr>
                  <td className="pc-label-cell">Order Number:</td>
                  <td className="pc-val-cell pc-code-val">{orderNumber}</td>
                </tr>
                <tr>
                  <td className="pc-label-cell">Service:</td>
                  <td className="pc-val-cell">{service}</td>
                </tr>
                {category && (
                  <tr>
                    <td className="pc-label-cell">Category:</td>
                    <td className="pc-val-cell">{category}</td>
                  </tr>
                )}
                {isPartial && (
                  <tr>
                    <td className="pc-label-cell">Total Service Amount:</td>
                    <td className="pc-val-cell">${totalAmount.toFixed(2)} USD</td>
                  </tr>
                )}
                <tr>
                  <td className="pc-label-cell">{isPending ? "Amount (Pending Clearing):" : "Amount Paid:"}</td>
                  <td className="pc-val-cell pc-amount-val" style={isPending ? { color: "#b45309" } : undefined}>${amountPaid.toFixed(2)} USD</td>
                </tr>
                {isPartial && (
                  <tr>
                    <td className="pc-label-cell">Remaining Balance:</td>
                    <td className="pc-val-cell" style={{ color: "#dc2626", fontWeight: 700 }}>
                      ${remainingAmount.toFixed(2)} USD
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="pc-label-cell">Payment Method:</td>
                  <td className="pc-val-cell">PayPal</td>
                </tr>
                <tr>
                  <td className="pc-label-cell">Transaction ID:</td>
                  <td className="pc-val-cell pc-code-val" style={{ wordBreak: "break-all" }}>
                    {transactionId}
                  </td>
                </tr>
                <tr>
                  <td className="pc-label-cell">Status:</td>
                  <td className="pc-val-cell">
                    <span
                      className={`pc-status-pill ${isPending ? "is-pending" : isPartial ? "is-partial" : ""}`}
                      style={isPending ? { background: "#fef3c7", color: "#92400e", borderColor: "#fde68a" } : {}}
                    >
                      {isPending ? "PENDING CLEARING" : isPartial ? "PARTIALLY PAID" : "PAID"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Your Receipt Has Been Emailed */}
          <div className="pc-info-card">
            <div className="pc-info-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <h3 className="pc-info-heading">Your Receipt Has Been Emailed</h3>
              <p className="pc-info-sub">
                A payment confirmation and PDF receipt have been sent to:{" "}
                <span className="pc-info-email">{clientEmail}</span>
              </p>
              <p className="pc-info-note">
                Your official payment receipt is attached to that email as a PDF. Please check your inbox (and spam/junk folder) to view and download your receipt.
              </p>
            </div>
          </div>

          {/* Section 3: What's Next? */}
          <div className="pc-next-card">
            <h3 className="pc-next-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              <span>What&apos;s Next?</span>
            </h3>
            <p className="pc-next-desc">
              Our team will review your order and contact you with the next steps. If you purchased a creative, video, or engineering service, please keep your order number (<strong>{orderNumber}</strong>) handy when communicating with our team.
            </p>
            <p className="pc-help-line">
              Need help?{" "}
              <a href="mailto:info@quickuppsoftech.us" className="pc-help-link">
                info@quickuppsoftech.us
              </a>
            </p>
          </div>

          {/* Section 4: Action Buttons */}
          <div className="pc-actions">
            <PrintReceiptButton label="Print Order Confirmation" />
            <Link href="/" className="pc-btn-primary">
              <span>Back to Quickupp Softech LLC</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

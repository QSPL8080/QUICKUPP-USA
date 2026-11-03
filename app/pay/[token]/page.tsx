"use client";

import React, { useEffect, useRef, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "../../checkout/checkout.css";

type OrderData = {
  id: number;
  invoiceNumber: string;
  token: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  companyName: string | null;
  service: string;
  category: string | null;
  quantity: string | null;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  paymentType: "full" | "partial";
  status: string;
  linkStatus: string;
  currency: string;
  notes: string | null;
  source: string;
};

export default function PayTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { token } = use(params);

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const [selectedType, setSelectedType] = useState<"full" | "partial">("full");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const paypalRenderedRef = useRef(false);

  // Fetch payment link details
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`/api/payments/lookup?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          if (data.expired) setIsExpired(true);
          setLoadError(data.error || "Payment link is invalid or expired.");
          return;
        }
        setOrder(data.order);
        if (data.order.status === "paid") {
          setIsPaid(true);
        } else if (data.order.amountPaid > 0) {
          // Already partially paid, next payment is remaining balance!
          setSelectedType("full");
        } else if (data.order.paymentType === "partial") {
          setSelectedType("partial");
        }
      })
      .catch((err) => {
        setLoadError(err.message || "Failed to load payment link.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Determine amounts
  const isPayingBalance = order ? order.amountPaid > 0 && order.remainingAmount > 0 : false;
  const payAmount = order
    ? isPayingBalance
      ? order.remainingAmount
      : selectedType === "partial"
      ? Math.round(order.totalAmount * 0.5 * 100) / 100
      : order.totalAmount
    : 0;

  useEffect(() => {
    if (!order || isPaid || isExpired || loading) return;

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
    if (!clientId) {
      setError("PayPal client ID is not configured. Please contact support.");
      return;
    }

    const createOrder = async () => {
      setError("");
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: order.clientName,
          clientEmail: order.clientEmail,
          clientPhone: order.clientPhone,
          companyName: order.companyName,
          service: order.service,
          category: order.category,
          amount: payAmount,
          totalAmount: order.totalAmount,
          paymentType: isPayingBalance ? "full" : selectedType,
          remainingAmount: isPayingBalance ? 0 : selectedType === "partial" ? order.totalAmount - payAmount : 0,
          token: order.token,
          invoiceNumber: order.invoiceNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.orderID) {
        throw new Error(data.error || "Unable to initiate payment with PayPal. Please try again.");
      }
      return data.orderID;
    };

    const onApprove = async (data: { orderID: string }) => {
      setIsProcessing(true);
      setError("");
      try {
        const res = await fetch("/api/payments/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderID: data.orderID,
            token: order.token,
            invoiceNumber: order.invoiceNumber,
            clientName: order.clientName,
            clientEmail: order.clientEmail,
            clientPhone: order.clientPhone,
            companyName: order.companyName,
            service: order.service,
            category: order.category,
            amount: payAmount,
            totalAmount: order.totalAmount,
            paymentType: isPayingBalance ? "full" : selectedType,
            remainingAmount: isPayingBalance ? 0 : selectedType === "partial" ? order.totalAmount - payAmount : 0,
          }),
        });

        const captureData = await res.json();
        if (!res.ok || captureData.status === "failed") {
          setError(captureData.error || "Payment was declined or could not be captured. Please try again.");
          setIsProcessing(false);
          return;
        }

        router.push(`/payment-confirmation?order=${encodeURIComponent(captureData.orderNumber || order.invoiceNumber)}`);
      } catch (err: any) {
        setError(err.message || "An error occurred while confirming payment. Please contact support.");
        setIsProcessing(false);
      }
    };

    function renderButtons() {
      if (!window.paypal) return;
      if (paypalRenderedRef.current) return;

      const pContainer = paypalContainerRef.current;
      const cContainer = cardContainerRef.current;
      if (!pContainer || !cContainer) return;

      pContainer.innerHTML = "";
      cContainer.innerHTML = "";

      try {
        if (window.paypal.FUNDING && window.paypal.FUNDING.PAYPAL) {
          const pBtn = window.paypal.Buttons({
            fundingSource: window.paypal.FUNDING.PAYPAL,
            style: { layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 38 },
            createOrder,
            onApprove,
            onError: (err: any) => {
              console.error("[PayPal Pay Error]", err);
              setError("PayPal encountered an issue. Please try again.");
              setIsProcessing(false);
            },
            onCancel: () => setIsProcessing(false),
          });
          if (pBtn.isEligible()) pBtn.render(pContainer).catch(() => {});
        }
      } catch (err) {
        console.error("PayPal button init error", err);
      }

      try {
        if (window.paypal.FUNDING && window.paypal.FUNDING.CARD) {
          const cBtn = window.paypal.Buttons({
            fundingSource: window.paypal.FUNDING.CARD,
            style: { layout: "vertical", color: "black", shape: "rect", label: "pay", height: 38 },
            createOrder,
            onApprove,
            onError: (err: any) => {
              console.error("[Card Pay Error]", err);
              setError("Card payment encountered an issue. Please try again.");
              setIsProcessing(false);
            },
            onCancel: () => setIsProcessing(false),
          });
          if (cBtn.isEligible()) cBtn.render(cContainer).catch(() => {});
        }
      } catch (err) {
        console.error("Card button init error", err);
      }

      paypalRenderedRef.current = true;
    }

    if (window.paypal) {
      renderButtons();
    } else {
      const existingScript = document.getElementById("paypal-sdk-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "paypal-sdk-script";
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons&enable-funding=card`;
        script.async = true;
        script.onload = () => renderButtons();
        script.onerror = () => setError("Failed to load PayPal payment SDK. Please refresh.");
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener("load", renderButtons);
      }
    }
  }, [order, isPaid, isExpired, loading, payAmount, selectedType, isPayingBalance, router]);

  // If loading
  if (loading) {
    return (
      <div className="co-page" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="co-spinner" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "#475569", fontWeight: 600 }}>Loading secure invoice details…</p>
        </div>
      </div>
    );
  }

  // If expired or error
  if (loadError || !order) {
    return (
      <div className="co-page" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="co-card" style={{ maxWidth: "520px", textAlign: "center", padding: "40px 30px" }}>
          <div style={{ fontSize: "44px", marginBottom: "16px" }}>{isExpired ? "⏳" : "⚠️"}</div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
            {isExpired ? "Payment Link Expired" : "Invalid Payment Link"}
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
            {loadError || "This payment link does not exist or has expired. Please contact Quickupp Softech support to generate a fresh link."}
          </p>
          <Link href="/" className="co-back-link" style={{ justifyContent: "center" }}>
            Return to Quickupp Softech
          </Link>
        </div>
      </div>
    );
  }

  // If already paid
  if (isPaid) {
    return (
      <div className="co-page" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="co-card" style={{ maxWidth: "520px", textAlign: "center", padding: "40px 30px" }}>
          <div style={{ fontSize: "44px", marginBottom: "16px" }}>🎉</div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
            Payment Already Completed
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", marginBottom: "18px" }}>
            Order <strong style={{ color: "#7c3aed" }}>#{order.invoiceNumber}</strong> has already been fully paid ($
            {order.totalAmount.toFixed(2)} USD). Your receipt has been sent to {order.clientEmail}.
          </p>
          <a
            href={`/api/payments/receipt?order=${encodeURIComponent(order.invoiceNumber)}`}
            className="co-back-link"
            style={{ justifyContent: "center", marginBottom: "16px", color: "#2563eb", fontWeight: 700 }}
          >
            📄 Download Official PDF Receipt
          </a>
          <div>
            <Link href="/" className="co-back-link" style={{ justifyContent: "center" }}>
              Return to Quickupp Softech
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="co-page">
      <header className="co-header">
        <div className="co-header-inner">
          <Link href="/" className="co-logo">
            <Image
              src="/images/logo.png"
              alt="Quickupp Softech LLC"
              width={160}
              height={38}
              priority
              style={{ objectFit: "contain", height: "auto" }}
            />
          </Link>
        </div>
      </header>

      <main className="co-main">
        <div className="co-container">
          <div className="co-layout">
            {/* Left Card: Order Summary & Scope */}
            <div className="co-card co-summary-card" style={{ marginTop: "22px" }}>
              <div className="co-card-header">
                <div>
                  <span className="co-kicker">Custom Invoice #{order.invoiceNumber}</span>
                  <h1 className="co-title" style={{ fontSize: "21px" }}>{order.service}</h1>
                  {order.quantity && (
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#7c3aed",
                        background: "#faf5ff",
                        border: "1px solid #f3e8ff",
                        padding: "2px 8px",
                        borderRadius: "5px",
                      }}
                    >
                      Scope: {order.quantity}
                    </span>
                  )}
                </div>
              </div>

              <div className="co-details-grid" style={{ marginTop: "14px", fontSize: "13.5px" }}>
                <div>
                  <span className="co-dt-label">Client Name:</span>
                  <span className="co-dt-val">{order.clientName}</span>
                </div>
                <div>
                  <span className="co-dt-label">Email:</span>
                  <span className="co-dt-val" style={{ color: "#2563eb" }}>{order.clientEmail}</span>
                </div>
                {order.clientPhone && (
                  <div>
                    <span className="co-dt-label">Mobile / WhatsApp:</span>
                    <span className="co-dt-val">{order.clientPhone}</span>
                  </div>
                )}
                {order.companyName && (
                  <div>
                    <span className="co-dt-label">Company:</span>
                    <span className="co-dt-val">{order.companyName}</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="co-price-box" style={{ marginTop: "20px" }}>
                <div className="co-price-row">
                  <span>Total Order Amount</span>
                  <span className="co-price-num">${order.totalAmount.toFixed(2)} USD</span>
                </div>

                {isPayingBalance ? (
                  <>
                    <div className="co-price-row" style={{ color: "#16a34a" }}>
                      <span>Deposit Paid So Far</span>
                      <span>-${order.amountPaid.toFixed(2)} USD</span>
                    </div>
                    <div className="co-price-divider" />
                    <div className="co-price-row co-price-total">
                      <span>Remaining Balance Due Today</span>
                      <span className="co-total-num">${order.remainingAmount.toFixed(2)} USD</span>
                    </div>
                  </>
                ) : order.paymentType === "partial" ? (
                  <>
                    <div style={{ marginTop: "14px", marginBottom: "8px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "8px" }}>
                        Select Payment Option:
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedType("partial");
                            paypalRenderedRef.current = false;
                          }}
                          style={{
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: `2px solid ${selectedType === "partial" ? "#7c3aed" : "#cbd5e1"}`,
                            background: selectedType === "partial" ? "#f5f3ff" : "#ffffff",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>50% Deposit</div>
                          <div style={{ fontSize: "16px", fontWeight: 800, color: "#7c3aed" }}>
                            ${(Math.round(order.totalAmount * 0.5 * 100) / 100).toFixed(2)}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedType("full");
                            paypalRenderedRef.current = false;
                          }}
                          style={{
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: `2px solid ${selectedType === "full" ? "#7c3aed" : "#cbd5e1"}`,
                            background: selectedType === "full" ? "#f5f3ff" : "#ffffff",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Pay in Full</div>
                          <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                            ${order.totalAmount.toFixed(2)}
                          </div>
                        </button>
                      </div>
                    </div>
                    <div className="co-price-divider" />
                    <div className="co-price-row co-price-total">
                      <span>Amount Due Now</span>
                      <span className="co-total-num">${payAmount.toFixed(2)} USD</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="co-price-divider" />
                    <div className="co-price-row co-price-total">
                      <span>Total Due Today</span>
                      <span className="co-total-num">${order.totalAmount.toFixed(2)} USD</span>
                    </div>
                  </>
                )}
              </div>

              {order.notes && (
                <div style={{ marginTop: "16px", padding: "10px 14px", background: "#f8fafc", borderRadius: "8px", fontSize: "12.5px", color: "#475569" }}>
                  <strong>Order Note:</strong> {order.notes}
                </div>
              )}
            </div>

            {/* Right Card: Side-by-Side PayPal & Debit/Credit Card Checkout */}
            <div className="co-card co-payment-card" style={{ marginTop: "22px" }}>
              <div className="co-card-header">
                <div>
                  <span className="co-kicker">Payment Methods</span>
                  <h2 className="co-subtitle" style={{ fontSize: "18px" }}>Complete Payment of ${payAmount.toFixed(2)} USD</h2>
                </div>
              </div>

              {error && (
                <div className="co-error-banner" role="alert" style={{ marginBottom: "16px" }}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {isProcessing ? (
                <div className="co-processing-box" style={{ padding: "40px 20px", textAlign: "center" }}>
                  <div className="co-spinner" style={{ margin: "0 auto 16px" }} />
                  <p style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>Authorizing your transaction…</p>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Please do not close this window.</p>
                </div>
              ) : (
                <div className="co-methods-grid">
                  {/* Option 1: PayPal */}
                  <div className="co-method-box">
                    <div className="co-method-head">
                      <span className="co-method-title">PayPal Account</span>
                      <span className="co-badge">Fast &amp; Secure</span>
                    </div>
                    <p className="co-method-desc">Pay directly using your PayPal wallet or linked balance.</p>
                    <div ref={paypalContainerRef} className="co-btn-slot" />
                  </div>

                  {/* Option 2: Debit or Credit Card */}
                  <div className="co-method-box">
                    <div className="co-method-head">
                      <span className="co-method-title">Debit or Credit Card</span>
                      <span className="co-badge">All Cards</span>
                    </div>
                    <p className="co-method-desc">Pay securely using Visa, Mastercard, Amex, or Discover.</p>
                    <div ref={cardContainerRef} className="co-btn-slot" />
                  </div>
                </div>
              )}

              <div style={{ marginTop: "24px", paddingTop: "14px", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                  Quickupp Softech LLC • 8 The Green, Suite A, Dover, DE 19901 • Official PDF receipt emailed upon payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

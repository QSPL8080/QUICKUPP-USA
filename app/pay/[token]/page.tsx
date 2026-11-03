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
  balanceDueDate?: string | null;
  billingStartDate?: string | null;
  billingEndDate?: string | null;
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
  const remainingAmount = order
    ? isPayingBalance
      ? 0
      : selectedType === "partial"
      ? Math.max(0, Math.round((order.totalAmount - payAmount) * 100) / 100)
      : 0
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
          category: order.category || order.quantity,
          amount: payAmount,
          totalAmount: order.totalAmount,
          paymentType: isPayingBalance ? "full" : selectedType,
          remainingAmount,
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
            category: order.category || order.quantity,
            amount: payAmount,
            totalAmount: order.totalAmount,
            paymentType: isPayingBalance ? "full" : selectedType,
            remainingAmount,
          }),
        });

        const captureData = await res.json();
        if (!res.ok || captureData.status === "failed") {
          setError(captureData.error || "Payment was declined or could not be captured. Please try again.");
          setIsProcessing(false);
          return;
        }

        if (captureData.status === "pending") {
          router.push(
            `/payment-confirmation?order=${encodeURIComponent(captureData.orderNumber || order.invoiceNumber)}&status=pending`
          );
        } else {
          router.push(
            `/payment-confirmation?order=${encodeURIComponent(captureData.orderNumber || order.invoiceNumber)}`
          );
        }
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

      // 1. Render Standalone PayPal Button in Left Card
      try {
        if (window.paypal.FUNDING && window.paypal.FUNDING.PAYPAL) {
          const pBtn = window.paypal.Buttons({
            fundingSource: window.paypal.FUNDING.PAYPAL,
            style: { layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 38 },
            createOrder,
            onApprove,
            onError: (err: any) => {
              console.error("[PayPal Pay Error]", err);
              setError("PayPal encountered an issue. Please try again or use another payment method.");
              setIsProcessing(false);
            },
            onCancel: () => setIsProcessing(false),
          });

          if (pBtn.isEligible()) {
            pBtn.render(pContainer).catch((err: any) => console.error("PayPal render error", err));
          }
        }
      } catch (err) {
        console.error("PayPal button init error", err);
      }

      // 2. Render Standalone Card Button in Right Card (BESIDE!)
      try {
        if (window.paypal.FUNDING && window.paypal.FUNDING.CARD) {
          const cBtn = window.paypal.Buttons({
            fundingSource: window.paypal.FUNDING.CARD,
            style: {
              layout: "vertical",
              color: "black",
              shape: "rect",
              label: "pay",
              height: 38,
            },
            createOrder,
            onApprove,
            onError: (err: any) => {
              console.error("[Card Pay Error]", err);
              setError("Card payment encountered an issue. Please check your card details or try again.");
              setIsProcessing(false);
            },
            onCancel: () => setIsProcessing(false),
          });

          if (cBtn.isEligible()) {
            cBtn.render(cContainer).catch((err: any) => console.error("Card render error", err));
          }
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
      if (existingScript) {
        existingScript.addEventListener("load", renderButtons);
      } else {
        const script = document.createElement("script");
        script.id = "paypal-sdk-script";
        script.src = "https://www.paypal.com/sdk/js?client-id=" + clientId + "&currency=USD&intent=capture";
        script.async = true;
        script.onload = renderButtons;
        script.onerror = () => setError("Could not load PayPal secure checkout. Please check your internet connection.");
        document.body.appendChild(script);
      }
    }
  }, [order, isPaid, isExpired, loading, payAmount, selectedType, isPayingBalance, remainingAmount, router]);

  // If loading
  if (loading) {
    return (
      <div className="ck-page" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center", color: "#64748b", fontFamily: "sans-serif" }}>
          <div className="ck-spinner" style={{ margin: "0 auto 12px" }} />
          <span>Loading secure invoice checkout...</span>
        </div>
      </div>
    );
  }

  // If expired or error
  if (loadError || !order) {
    return (
      <div className="ck-page">
        <header className="ck-topbar">
          <Link href="/" className="ck-logo-link" aria-label="Quickupp Softech LLC">
            <Image
              src="/images/logo-black.png"
              alt="Quickupp Softech LLC"
              width={135}
              height={32}
              className="ck-logo-img"
              priority
            />
          </Link>
          <Link href="/" className="ck-back-link">
            <span>← Back to Website</span>
          </Link>
        </header>

        <main className="ck-container" style={{ display: "grid", placeItems: "center", minHeight: "70vh" }}>
          <div className="ck-summary-card" style={{ maxWidth: "480px", width: "100%", textAlign: "center", padding: "32px 24px" }}>
            <div style={{ fontSize: "40px", marginBottom: "14px" }}>{isExpired ? "⏳" : "⚠️"}</div>
            <h1 className="ck-card-title" style={{ justifyContent: "center", fontSize: "19px", marginBottom: "8px" }}>
              {isExpired ? "Payment Link Expired" : "Invalid Payment Link"}
            </h1>
            <p style={{ color: "#64748b", fontSize: "13.5px", lineHeight: "1.6", margin: "0 0 20px" }}>
              {loadError || "This payment link does not exist or has expired. Please contact Quickupp Softech support to generate a fresh link."}
            </p>
            <Link href="/" className="ck-back-link" style={{ justifyContent: "center" }}>
              ← Return to Quickupp Softech LLC
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // If already paid
  if (isPaid) {
    return (
      <div className="ck-page">
        <header className="ck-topbar">
          <Link href="/" className="ck-logo-link" aria-label="Quickupp Softech LLC">
            <Image
              src="/images/logo-black.png"
              alt="Quickupp Softech LLC"
              width={135}
              height={32}
              className="ck-logo-img"
              priority
            />
          </Link>
          <Link href="/" className="ck-back-link">
            <span>← Back to Website</span>
          </Link>
        </header>

        <main className="ck-container" style={{ display: "grid", placeItems: "center", minHeight: "70vh" }}>
          <div className="ck-summary-card" style={{ maxWidth: "500px", width: "100%", textAlign: "center", padding: "32px 24px" }}>
            <div style={{ fontSize: "40px", marginBottom: "14px" }}>🎉</div>
            <h1 className="ck-card-title" style={{ justifyContent: "center", fontSize: "19px", marginBottom: "8px" }}>
              Payment Already Completed
            </h1>
            <p style={{ color: "#64748b", fontSize: "13.5px", lineHeight: "1.6", margin: "0 0 16px" }}>
              Order <strong style={{ color: "#7c3aed" }}>#{order.invoiceNumber}</strong> has already been fully paid ($
              {order.totalAmount.toFixed(2)} USD). Your confirmation and official receipt were sent to {order.clientEmail}.
            </p>
            <Link href="/" className="ck-back-link" style={{ justifyContent: "center" }}>
              ← Return to Quickupp Softech LLC
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="ck-page">
      {/* Header - Transparent without background box */}
      <header className="ck-topbar">
        <Link href="/" className="ck-logo-link" aria-label="Quickupp Softech LLC">
          <Image
            src="/images/logo-black.png"
            alt="Quickupp Softech LLC"
            width={135}
            height={32}
            className="ck-logo-img"
            priority
          />
        </Link>
        <Link href="/" className="ck-back-link">
          <span>← Back to Website</span>
        </Link>
      </header>

      {/* Main Side-by-Side Container (Zero Scroll) */}
      <main className="ck-container">
        {error && <div className="ck-error-banner">{error}</div>}

        {isProcessing && (
          <div className="ck-processing-msg">
            <div className="ck-spinner" />
            <span>Processing & verifying payment with PayPal...</span>
          </div>
        )}

        <div className="ck-grid" style={{ display: isProcessing ? "none" : "grid" }}>
          {/* LEFT PANEL: Order Summary & Fast PayPal Checkout */}
          <div className="ck-summary-card">
            <h1 className="ck-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
              </svg>
              <span>Order Summary</span>
            </h1>
            <p className="ck-card-subtitle">
              Quickupp Softech Invoice #{order.invoiceNumber}
            </p>

            <div className="ck-detail-list">
              <div className="ck-detail-row">
                <span className="ck-detail-label">Client</span>
                <span className="ck-detail-val">{order.clientName}</span>
              </div>
              {order.clientEmail && (
                <div className="ck-detail-row">
                  <span className="ck-detail-label">Email</span>
                  <span className="ck-detail-val">{order.clientEmail}</span>
                </div>
              )}
              {order.clientPhone && (
                <div className="ck-detail-row">
                  <span className="ck-detail-label">Phone</span>
                  <span className="ck-detail-val">{order.clientPhone}</span>
                </div>
              )}
              {order.companyName && (
                <div className="ck-detail-row">
                  <span className="ck-detail-label">Company</span>
                  <span className="ck-detail-val">{order.companyName}</span>
                </div>
              )}
              <div className="ck-detail-row">
                <span className="ck-detail-label">Service</span>
                <span className="ck-detail-val">{order.service}</span>
              </div>
              {(order.quantity || order.category) && (
                <div className="ck-detail-row">
                  <span className="ck-detail-label">Scope</span>
                  <div className="ck-cat-tags">
                    <span className="ck-cat-tag">{order.quantity || order.category}</span>
                  </div>
                </div>
              )}
              {(order.billingStartDate || order.balanceDueDate) && (
                <div className="ck-detail-row">
                  <span className="ck-detail-label">{isPayingBalance ? "Balance Due" : "Coverage"}</span>
                  <span className="ck-detail-val">
                    {isPayingBalance
                      ? (order.balanceDueDate || order.billingEndDate || "Upon Completion")
                      : (order.billingStartDate ? `${order.billingStartDate} to ${order.billingEndDate || "Ongoing"}` : order.balanceDueDate)}
                  </span>
                </div>
              )}
              <div className="ck-detail-row">
                <span className="ck-detail-label">Option</span>
                {isPayingBalance ? (
                  <span className="ck-detail-val" style={{ color: "#7c3aed", fontWeight: 700 }}>
                    Remaining Balance Settlement
                  </span>
                ) : order.paymentType === "partial" ? (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedType("partial");
                        paypalRenderedRef.current = false;
                      }}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "5px",
                        fontSize: "11px",
                        fontWeight: 700,
                        border: `1.5px solid ${selectedType === "partial" ? "#7c3aed" : "#cbd5e1"}`,
                        background: selectedType === "partial" ? "#f5f3ff" : "#ffffff",
                        color: selectedType === "partial" ? "#7c3aed" : "#475569",
                        cursor: "pointer",
                      }}
                    >
                      50% Deposit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedType("full");
                        paypalRenderedRef.current = false;
                      }}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "5px",
                        fontSize: "11px",
                        fontWeight: 700,
                        border: `1.5px solid ${selectedType === "full" ? "#059669" : "#cbd5e1"}`,
                        background: selectedType === "full" ? "#ecfdf5" : "#ffffff",
                        color: selectedType === "full" ? "#059669" : "#475569",
                        cursor: "pointer",
                      }}
                    >
                      Pay in Full (100%)
                    </button>
                  </div>
                ) : (
                  <span className="ck-detail-val" style={{ color: "#059669", fontWeight: 700 }}>
                    Full (100%)
                  </span>
                )}
              </div>
            </div>

            {/* Pricing Breakdown Box */}
            <div className="ck-breakdown-box">
              <div className="ck-breakdown-row">
                <span>Total Invoice</span>
                <strong>${order.totalAmount.toFixed(2)} USD</strong>
              </div>
              {isPayingBalance ? (
                <div className="ck-breakdown-row">
                  <span style={{ color: "#16a34a" }}>Deposit Paid Previously</span>
                  <strong style={{ color: "#16a34a" }}>-${order.amountPaid.toFixed(2)} USD</strong>
                </div>
              ) : selectedType === "partial" ? (
                <div className="ck-breakdown-row">
                  <span style={{ color: "#7c3aed" }}>Remaining 50% Balance</span>
                  <strong style={{ color: "#7c3aed" }}>${(order.totalAmount - payAmount).toFixed(2)} USD</strong>
                </div>
              ) : null}
              <div className="ck-breakdown-row is-total">
                <span>{selectedType === "partial" ? "Due Today (50% Deposit)" : isPayingBalance ? "Balance Due Today" : "Total Due Today"}</span>
                <span className="ck-total-highlight">${payAmount.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Fast PayPal Checkout Button */}
            <div className="ck-paypal-section">
              <div className="ck-paypal-title">
                <span>Pay with PayPal Account:</span>
              </div>
              <div ref={paypalContainerRef} className="ck-paypal-box" />
            </div>
          </div>

          {/* RIGHT PANEL: Debit or Credit Card Panel (BESIDE!) */}
          <div className="ck-pay-card">
            <h2 className="ck-pay-title">Debit or Credit Card</h2>
            <p className="ck-pay-subtitle">
              Pay securely with any major card. No PayPal login required.
            </p>

            {/* Card Standalone Button & Expanded Card Form Container */}
            <div ref={cardContainerRef} className="ck-card-wrapper" />

            <div className="ck-footer-note">
              Payments processed securely by Quickupp Softech LLC via PayPal.<br />
              Need help? <a href="mailto:info@quickuppsoftech.us">info@quickuppsoftech.us</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import "./checkout.css";

function CheckoutContent() {
  const router = useRouter();
  const sp = useSearchParams();

  const clientName = sp.get("name") || "Valued Client";
  const clientEmail = sp.get("email") || "";
  const clientPhone = sp.get("phone") || "";
  const companyName = sp.get("company") || "";
  const service = sp.get("service") || "AI-Powered Digital Marketing Services";
  const category = sp.get("category") || "Social Media Marketing";
  const billingStartDate = sp.get("from") || "";
  const billingEndDate = sp.get("to") || "";
  const notes = sp.get("notes") || "";
  const paymentType = (sp.get("type") as "full" | "partial") || "full";

  const numTotal = Math.max(1, Number(sp.get("amount") || 79));
  const isPartial = paymentType === "partial";
  const payAmount = isPartial ? Math.round(numTotal * 0.5 * 100) / 100 : numTotal;
  const remainingAmount = isPartial ? Math.max(0, Math.round((numTotal - payAmount) * 100) / 100) : 0;

  const [step, setStep] = useState<"summary" | "payment">("summary");
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const paypalRenderedRef = useRef<boolean>(false);

  useEffect(() => {
    if (step !== "payment") {
      paypalRenderedRef.current = false;
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
    if (!clientId) {
      setError("PayPal is not configured yet. Please verify NEXT_PUBLIC_PAYPAL_CLIENT_ID in your environment.");
      return;
    }

    function renderButtons() {
      if (!window.paypal || !paypalContainerRef.current) return;
      if (paypalRenderedRef.current) return;

      paypalContainerRef.current.innerHTML = "";

      window.paypal
        .Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "pay",
            height: 38,
          },
          createOrder: async () => {
            setError("");
            const res = await fetch("/api/payments/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                clientName,
                clientEmail,
                clientPhone,
                companyName,
                category,
                service,
                billingStartDate,
                billingEndDate,
                amount: payAmount,
                totalAmount: numTotal,
                paymentType,
                remainingAmount,
                notes,
              }),
            });

            const data = await res.json();
            if (!res.ok || !data.orderID) {
              throw new Error(data.error || "Unable to initiate payment with PayPal. Please try again.");
            }
            return data.orderID;
          },
          onApprove: async (data: { orderID: string }) => {
            setIsProcessing(true);
            setError("");
            try {
              const res = await fetch("/api/payments/capture-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderID: data.orderID,
                  clientName,
                  clientEmail,
                  clientPhone,
                  companyName,
                  category,
                  service,
                  billingStartDate,
                  billingEndDate,
                  amount: payAmount,
                  totalAmount: numTotal,
                  paymentType,
                  remainingAmount,
                  notes,
                }),
              });

              const captureData = await res.json();

              if (!res.ok || captureData.status === "failed") {
                setError(
                  captureData.error ||
                    "Payment was declined or could not be captured. Our team has been notified to assist you."
                );
                setIsProcessing(false);
                return;
              }

              if (captureData.status === "pending") {
                router.push(
                  "/payment-confirmation?order=" + encodeURIComponent(captureData.orderNumber) + "&status=pending"
                );
              } else {
                router.push(
                  "/payment-confirmation?order=" + encodeURIComponent(captureData.orderNumber)
                );
              }
            } catch (err: any) {
              setError(err.message || "An error occurred while confirming your payment. Please contact support.");
              setIsProcessing(false);
            }
          },
          onError: (err: any) => {
            console.error("[PayPal Checkout Error]", err);
            setError("PayPal encountered an issue. Please try again or use another payment method.");
            setIsProcessing(false);
          },
          onCancel: () => {
            setIsProcessing(false);
          },
        })
        .render(paypalContainerRef.current)
        .then(() => {
          paypalRenderedRef.current = true;
        })
        .catch((err: any) => {
          console.error("[PayPal Render Error]", err);
        });
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
        script.onerror = () => {
          setError("Could not load PayPal secure checkout. Please check your internet connection.");
        };
        document.body.appendChild(script);
      }
    }
  }, [
    step,
    clientName,
    clientEmail,
    clientPhone,
    companyName,
    category,
    service,
    billingStartDate,
    billingEndDate,
    payAmount,
    numTotal,
    paymentType,
    remainingAmount,
    notes,
    router,
  ]);

  const categories = category ? category.split(",").map((c) => c.trim()).filter(Boolean) : [];

  return (
    <div className="ck-page">
      {/* Header - Transparent without white card background */}
      <header className="ck-topbar">
        <Link href="/" className="ck-logo-link" aria-label="Quickupp Softech LLC">
          <Image
            src="/images/logo-black.png"
            alt="Quickupp Softech LLC"
            width={140}
            height={34}
            className="ck-logo-img"
            priority
          />
        </Link>
        <Link href="/" className="ck-back-link">
          <span>← Back to Website</span>
        </Link>
      </header>

      {/* Stepper Navigation */}
      <div className="ck-stepper">
        <button
          type="button"
          onClick={() => setStep("summary")}
          className={`ck-step ${step === "summary" ? "is-active" : "is-completed"}`}
        >
          <span className="ck-step-num">{step === "payment" ? "✓" : "1"}</span>
          <span className="ck-step-label">Order Summary</span>
        </button>
        <div className={`ck-step-divider ${step === "payment" ? "is-active" : ""}`} />
        <div className={`ck-step ${step === "payment" ? "is-active" : ""}`}>
          <span className="ck-step-num">2</span>
          <span className="ck-step-label">Payment</span>
        </div>
      </div>

      {/* Main Container */}
      <main className={`ck-container ${step === "payment" ? "is-payment" : ""}`}>
        {step === "summary" && (
          /* Step 1: Order Summary (Ultra-Compact 2-Column Side-by-Side) */
          <div className="ck-card">
            <div className="ck-card-header">
              <h1 className="ck-card-title">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
                </svg>
                <span>Order Summary</span>
              </h1>
              <p className="ck-card-subtitle">
                Review your service engagement details and pricing below.
              </p>
            </div>

            <div className="ck-summary-grid">
              {/* Left Column: Engagement Information */}
              <div className="ck-summary-left">
                <div className="ck-detail-list">
                  <div className="ck-detail-row">
                    <span className="ck-detail-label">Client Name</span>
                    <span className="ck-detail-val">{clientName}</span>
                  </div>
                  {clientEmail && (
                    <div className="ck-detail-row">
                      <span className="ck-detail-label">Email Address</span>
                      <span className="ck-detail-val">{clientEmail}</span>
                    </div>
                  )}
                  {clientPhone && (
                    <div className="ck-detail-row">
                      <span className="ck-detail-label">Phone Number</span>
                      <span className="ck-detail-val">{clientPhone}</span>
                    </div>
                  )}
                  {companyName && (
                    <div className="ck-detail-row">
                      <span className="ck-detail-label">Company</span>
                      <span className="ck-detail-val">{companyName}</span>
                    </div>
                  )}
                  <div className="ck-detail-row">
                    <span className="ck-detail-label">Service</span>
                    <span className="ck-detail-val">{service}</span>
                  </div>
                  {categories.length > 0 && (
                    <div className="ck-detail-row">
                      <span className="ck-detail-label">Categories / Scope</span>
                      <div className="ck-cat-tags">
                        {categories.map((cat, i) => (
                          <span key={i} className="ck-cat-tag">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {billingStartDate && (
                    <div className="ck-detail-row">
                      <span className="ck-detail-label">Coverage Period</span>
                      <span className="ck-detail-val">
                        {billingStartDate} to {billingEndDate || "Ongoing"}
                      </span>
                    </div>
                  )}
                  <div className="ck-detail-row">
                    <span className="ck-detail-label">Payment Option</span>
                    <span
                      className="ck-detail-val"
                      style={{
                        color: isPartial ? "#7c3aed" : "#059669",
                        fontWeight: 700,
                      }}
                    >
                      {isPartial ? "Partial (50% Deposit)" : "Full (100%)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing Breakdown & Action */}
              <div className="ck-summary-right">
                <div className="ck-breakdown-box">
                  <div className="ck-breakdown-row">
                    <span>Total Service Invoice</span>
                    <strong>${numTotal.toFixed(2)} USD</strong>
                  </div>
                  {isPartial && (
                    <div className="ck-breakdown-row">
                      <span style={{ color: "#dc2626" }}>Remaining 50% Due Later</span>
                      <strong style={{ color: "#dc2626" }}>${remainingAmount.toFixed(2)} USD</strong>
                    </div>
                  )}
                  <div className="ck-breakdown-row is-total">
                    <span>{isPartial ? "Due Today (50% Deposit)" : "Total Due Today"}</span>
                    <span className="ck-total-highlight">${payAmount.toFixed(2)} USD</span>
                  </div>
                </div>

                <div className="ck-trust-box">
                  <div className="ck-trust-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    </svg>
                    <span>PayPal Protection</span>
                  </div>
                  <div className="ck-trust-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span>Receipt Emailed</span>
                  </div>
                  <div className="ck-trust-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>256-Bit SSL</span>
                  </div>
                  <div className="ck-trust-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 14 14" />
                    </svg>
                    <span>Instant Confirm</span>
                  </div>
                </div>

                {/* Proceed to Payment CTA */}
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep("payment");
                  }}
                  className="ck-proceed-btn"
                >
                  <span>Proceed to Payment (${payAmount.toFixed(2)} USD)</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "payment" && (
          /* Step 2: Payment Processing (Centered, compact, no scrolling needed) */
          <div>
            <div className="ck-compact-bar">
              <button
                type="button"
                onClick={() => setStep("summary")}
                className="ck-compact-back"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <span>Edit Order</span>
              </button>
              <div className="ck-compact-info">
                <span className="ck-compact-service">{service}</span>
                <span className="ck-compact-amount">${payAmount.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="ck-pay-card">
              <h2 className="ck-pay-title">Choose Payment Method</h2>
              <p className="ck-pay-subtitle">
                Complete your payment securely with PayPal or Debit / Credit Card.
              </p>

              {error && <div className="ck-error-banner">{error}</div>}

              {isProcessing && (
                <div className="ck-processing-msg">
                  <div className="ck-spinner" />
                  <span>Processing & verifying payment with PayPal...</span>
                </div>
              )}

              {/* PayPal Smart Buttons Container */}
              <div
                ref={paypalContainerRef}
                className="ck-paypal-wrapper"
                style={{ display: isProcessing ? "none" : "block" }}
              />

              <div className="ck-footer-note">
                Payments processed securely by Quickupp Softech LLC via PayPal. Need assistance?{" "}
                <a href="mailto:info@quickuppsoftech.us">info@quickuppsoftech.us</a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#64748b", fontFamily: "sans-serif" }}>
          Loading secure checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

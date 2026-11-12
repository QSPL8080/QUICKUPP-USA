"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import "./checkout.css";
import { errMessage } from "@/lib/err";
import Lines from "@/components/HeadingLines";

// an order already on file, as /api/payments/lookup returns it

function CheckoutContent() {
  const router = useRouter();
  const sp = useSearchParams();

  // balances are paid with the client's own balance link (/pay/<token>), not here
  const clientName = sp.get("name") || "Valued Client";
  const clientEmail = sp.get("email") || "";
  const clientPhone = sp.get("phone") || "";
  const companyName = sp.get("company") || "";
  const service = sp.get("service") || "AI-Powered Digital Marketing Services";
  const category = sp.has("category") ? sp.get("category")! : "Social Media Marketing";
  const billingStartDate = sp.get("from") || "";
  const billingEndDate = sp.get("to") || "";
  const notes = sp.get("notes") || "";

  const paymentType = (sp.get("type") as "full" | "partial") === "partial" ? "partial" : "full";

  const numTotal = Math.max(1, Number(sp.get("amount") || 79));
  const isPartial = paymentType === "partial";
  const payAmount = isPartial ? Math.round(numTotal * 0.5 * 100) / 100 : numTotal;
  const remainingAmount = isPartial ? Math.max(0, Math.round((numTotal - payAmount) * 100) / 100) : 0;

  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const paypalRenderedRef = useRef<boolean>(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
    if (!clientId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reports a missing PayPal setup
      setError("PayPal is not configured yet. Please verify NEXT_PUBLIC_PAYPAL_CLIENT_ID in your environment.");
      return;
    }

    const createOrder = async () => {
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

        router.push("/payment-confirmation?txn=" + encodeURIComponent(captureData.txn || captureData.captureID || ""));
      } catch (err) {
        setError(errMessage(err) || "An error occurred while confirming your payment. Please contact support.");
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
            style: {
              layout: "vertical",
              color: "gold",
              shape: "rect",
              label: "pay",
              height: 38,
            },
            createOrder,
            onApprove,
            onError: (err: unknown) => {
              console.error("[PayPal Checkout Error]", err);
              setError("PayPal encountered an issue. Please try again or use another payment method.");
              setIsProcessing(false);
            },
            onCancel: () => {
              setIsProcessing(false);
            },
          });

          if (pBtn.isEligible()) {
            pBtn.render(pContainer).catch((err: unknown) => console.error("PayPal render error", err));
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
            onError: (err: unknown) => {
              console.error("[Card Payment Error]", err);
              setError("Card payment encountered an issue. Please check your card details or try again.");
              setIsProcessing(false);
            },
            onCancel: () => {
              setIsProcessing(false);
            },
          });

          if (cBtn.isEligible()) {
            cBtn.render(cContainer).catch((err: unknown) => console.error("Card render error", err));
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
        script.onerror = () => {
          setError("Could not load PayPal secure checkout. Please check your internet connection.");
        };
        document.body.appendChild(script);
      }
    }
  }, [
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

  const categories: string[] = typeof category === "string"
    ? category
        .split(",")
        .map((c: string) => c.trim())
        .filter((c) => Boolean(c) && c !== "Not Applicable")
    : [];

  return (
    <div className="ck-page">
      {/* Header - Transparent without background box */}
      <header className="ck-topbar">
        <Link href="/" className="ck-logo-link" aria-label="Quickupp Softech LLC">
          <Image
            src="/images/quickupp-logo-black.png"
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
            <h3 className="ck-card-title"><Lines>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
              </svg>
              <span>Order Summary</span>
            </Lines></h3>
            <p className="ck-card-subtitle">
              Quickupp Softech Engagement Details
            </p>

            <div className="ck-detail-list">
              <div className="ck-detail-row">
                <span className="ck-detail-label">Client</span>
                <span className="ck-detail-val">{clientName}</span>
              </div>
              {clientEmail && (
                <div className="ck-detail-row">
                  <span className="ck-detail-label">Email</span>
                  <span className="ck-detail-val">{clientEmail}</span>
                </div>
              )}
              {clientPhone && (
                <div className="ck-detail-row">
                  <span className="ck-detail-label">Phone</span>
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
                  <span className="ck-detail-label">Scope</span>
                  <div className="ck-cat-tags">
                    {categories.map((cat: string, i: number) => (
                      <span key={i} className="ck-cat-tag">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {billingStartDate && (
                <div className="ck-detail-row">
                  <span className="ck-detail-label">Coverage</span>
                  <span className="ck-detail-val">
                    {billingStartDate} to {billingEndDate || "Ongoing"}
                  </span>
                </div>
              )}
              <div className="ck-detail-row">
                <span className="ck-detail-label">Option</span>
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

            {/* Pricing Breakdown Box */}
            <div className="ck-breakdown-box">
              <div className="ck-breakdown-row">
                <span>Total Invoice</span>
                <strong>${numTotal.toFixed(2)} USD</strong>
              </div>
              {isPartial && (
                <div className="ck-breakdown-row">
                  <span style={{ color: "#dc2626" }}>Remaining 50%</span>
                  <strong style={{ color: "#dc2626" }}>${remainingAmount.toFixed(2)} USD</strong>
                </div>
              )}
              <div className="ck-breakdown-row is-total">
                <span>{isPartial ? "Due Today (50%)" : "Total Due Today"}</span>
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
            <h3 className="ck-pay-title"><Lines>Debit or Credit Card</Lines></h3>
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

"use client";

import { useEffect, useRef, useState } from "react";
import LucideIcon from "@/components/LucideIcon";
import { serviceGroups } from "@/lib/sitemap";
import "@/app/pay-modal.css";

declare global {
  interface Window {
    paypal?: any;
  }
}

/** Global helper to trigger the Pay Now modal from anywhere on the site */
export function openPayNowModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("quickupp:open-pay-modal"));
  }
}

const PRESET_AMOUNTS = ["500", "1000", "2500", "5000"];

const PARTIAL_PRESETS = [
  { id: "50", label: "50% Deposit", pct: 0.5 },
  { id: "30", label: "30% Milestone", pct: 0.3 },
  { id: "25", label: "25% Retainer", pct: 0.25 },
  { id: "custom", label: "Custom Amount", pct: null },
] as const;

function getInitialDates() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return {
    start: fmt(firstDay),
    end: fmt(lastDay),
  };
}

export default function PayNowModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"form" | "paypal" | "success">("form");

  // Form Fields
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState(serviceGroups[0]?.label || "");
  const [service, setService] = useState(serviceGroups[0]?.items[0]?.label || "");
  const [billingStartDate, setBillingStartDate] = useState(getInitialDates().start);
  const [billingEndDate, setBillingEndDate] = useState(getInitialDates().end);

  // Amount & Payment Options
  const [totalAmount, setTotalAmount] = useState("1000");
  const [paymentType, setPaymentType] = useState<"full" | "partial">("full");
  const [partialPreset, setPartialPreset] = useState<"50" | "30" | "25" | "custom">("50");
  const [customPartialAmount, setCustomPartialAmount] = useState("500");

  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [receipt, setReceipt] = useState<{
    captureID: string;
    orderID: string;
    amount: number;
    totalAmount: number;
    paymentType: "full" | "partial";
    remainingAmount: number;
    currency: string;
    date: string;
  } | null>(null);

  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const paypalRenderedRef = useRef(false);

  // Listen for open events
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setStep("form");
      setFormError("");
    };

    window.addEventListener("quickupp:open-pay-modal", handleOpen);
    return () => window.removeEventListener("quickupp:open-pay-modal", handleOpen);
  }, []);

  // Update services when category changes
  const availableServices =
    serviceGroups.find((g) => g.label === category)?.items.map((i) => i.label) || [];

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const matched = serviceGroups.find((g) => g.label === newCat);
    if (matched && matched.items.length > 0) {
      setService(matched.items[0].label);
    } else {
      setService("Custom Consultation");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    paypalRenderedRef.current = false;
  };

  // Calculations for Full vs Partial
  const numTotal = Number(totalAmount) || 0;
  const getPayAmount = (): number => {
    if (paymentType === "full") return numTotal;
    if (partialPreset === "50") return Math.round(numTotal * 0.5 * 100) / 100;
    if (partialPreset === "30") return Math.round(numTotal * 0.3 * 100) / 100;
    if (partialPreset === "25") return Math.round(numTotal * 0.25 * 100) / 100;
    return Number(customPartialAmount) || 0;
  };

  const payAmount = getPayAmount();
  const remainingAmount = Math.max(0, Math.round((numTotal - payAmount) * 100) / 100);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!clientName.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!clientEmail.trim() || !clientEmail.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!clientPhone.trim()) {
      setFormError("Please enter your phone number.");
      return;
    }
    if (!numTotal || isNaN(numTotal) || numTotal <= 0) {
      setFormError("Please enter a valid invoice or service amount in USD.");
      return;
    }

    if (paymentType === "partial") {
      if (!payAmount || isNaN(payAmount) || payAmount <= 0) {
        setFormError("Please enter a valid partial payment deposit amount.");
        return;
      }
      if (payAmount >= numTotal) {
        setFormError(
          `Partial payment amount ($${payAmount.toFixed(2)}) must be less than the total invoice amount ($${numTotal.toFixed(2)}). Or switch to Full Payment.`
        );
        return;
      }
    }

    setStep("paypal");
  };

  // Load and render PayPal buttons when entering "paypal" step
  useEffect(() => {
    if (!isOpen || step !== "paypal") {
      paypalRenderedRef.current = false;
      return;
    }

    const clientId =
      process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
      "BAADsN-KaPbg9Hk2SEUeY-d5b7nKuDIJGmN38uu5tnGwPOBHdELRWBwZ4hhAY4aT0nASGUKsQzvKur90lo";

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
            height: 48,
          },
          createOrder: async () => {
            setFormError("");
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
              throw new Error(data.error || "Failed to create PayPal payment order.");
            }
            return data.orderID;
          },
          onApprove: async (data: { orderID: string }) => {
            setIsSubmitting(true);
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
              if (!res.ok || !captureData.success) {
                throw new Error(captureData.error || "Payment authorization failed during capture.");
              }

              setReceipt({
                captureID: captureData.captureID,
                orderID: data.orderID,
                amount: Number(captureData.amount || payAmount),
                totalAmount: Number(captureData.totalAmount || numTotal),
                paymentType: captureData.paymentType || paymentType,
                remainingAmount: Number(captureData.remainingAmount ?? remainingAmount),
                currency: captureData.currency || "USD",
                date: new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
              });
              setStep("success");
            } catch (err: any) {
              setFormError(err.message || "An error occurred while confirming your payment.");
            } finally {
              setIsSubmitting(false);
            }
          },
          onError: (err: any) => {
            console.error("[PayPal Buttons Error]", err);
            setFormError(
              "PayPal was unable to process your payment. Please check your card or balance and try again."
            );
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

    // Check if PayPal script already loaded
    if (window.paypal) {
      renderButtons();
    } else {
      const existingScript = document.getElementById("paypal-sdk-script");
      if (existingScript) {
        existingScript.addEventListener("load", renderButtons);
      } else {
        const script = document.createElement("script");
        script.id = "paypal-sdk-script";
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
        script.async = true;
        script.onload = renderButtons;
        script.onerror = () => {
          setFormError("Could not connect to PayPal. Please check your internet connection.");
        };
        document.body.appendChild(script);
      }
    }
  }, [
    isOpen,
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
  ]);

  if (!isOpen) return null;

  return (
    <div className="pm-overlay" onClick={handleClose}>
      <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="pm-head">
          <div className="pm-head-left">
            <div className="pm-head-icon">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </div>
            <div>
              <h2 className="pm-head-title">
                {step === "success" ? "Payment Confirmation" : "Quickupp Softech Payment Portal"}
              </h2>
              <div className="pm-head-sub">
                {step === "success"
                  ? "Transaction confirmed successfully"
                  : "Secure online payment via PayPal & Credit/Debit Cards"}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="pm-close-btn"
            onClick={handleClose}
            aria-label="Close Payment Modal"
          >
            <LucideIcon name="x" size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="pm-body">
          {formError && (
            <div className="pm-error-alert" role="alert">
              ⚠️ {formError}
            </div>
          )}

          {/* Step 1: Client & Service Form */}
          {step === "form" && (
            <form onSubmit={handleFormSubmit} className="pm-form" noValidate>
              {/* Row 1: Full Name & Phone Number */}
              <div className="pm-row">
                <div className="pm-field">
                  <label className="pm-label">
                    Full Name <span className="pm-req">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="pm-input"
                  />
                </div>
                <div className="pm-field">
                  <label className="pm-label">
                    Phone Number <span className="pm-req">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 (555) 000-0000"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="pm-input"
                  />
                </div>
              </div>

              {/* Row 2: Email Address & Company Name */}
              <div className="pm-row">
                <div className="pm-field">
                  <label className="pm-label">
                    Email Address <span className="pm-req">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@company.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="pm-input"
                  />
                </div>
                <div className="pm-field">
                  <label className="pm-label">Company Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="pm-input"
                  />
                </div>
              </div>

              {/* Cascading Category & Service */}
              <div className="pm-row">
                <div className="pm-field">
                  <label className="pm-label">
                    Service Category <span className="pm-req">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="pm-select"
                  >
                    {serviceGroups.map((g) => (
                      <option key={g.label} value={g.label}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="pm-field">
                  <label className="pm-label">
                    Service <span className="pm-req">*</span>
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="pm-select"
                  >
                    {availableServices.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Billing Period (Coverage Range) */}
              <div className="pm-field">
                <div className="pm-field-heading">
                  <LucideIcon name="calendar" size={14} />
                  <span>Billing Period (Payment Month Coverage)</span>
                </div>
                <div className="pm-row">
                  <div className="pm-field">
                    <label className="pm-label" style={{ fontSize: "12px", color: "#64748b" }}>
                      From Date:
                    </label>
                    <input
                      type="date"
                      value={billingStartDate}
                      onChange={(e) => setBillingStartDate(e.target.value)}
                      className="pm-input"
                    />
                  </div>
                  <div className="pm-field">
                    <label className="pm-label" style={{ fontSize: "12px", color: "#64748b" }}>
                      To Date:
                    </label>
                    <input
                      type="date"
                      value={billingEndDate}
                      onChange={(e) => setBillingEndDate(e.target.value)}
                      className="pm-input"
                    />
                  </div>
                </div>
              </div>

              {/* Amount Box: Total Invoice / Service Amount */}
              <div className="pm-field">
                <label className="pm-label">
                  Total Service / Invoice Amount (USD) <span className="pm-req">*</span>
                </label>
                <div className="pm-currency-input-wrap">
                  <span className="pm-currency-symbol">$</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="1000"
                    value={totalAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTotalAmount(val);
                      const n = Number(val) || 0;
                      if (n > 0 && Number(customPartialAmount) >= n) {
                        setCustomPartialAmount(String(Math.round(n * 0.5)));
                      }
                    }}
                    className="pm-input"
                  />
                </div>
                <div className="pm-amount-pills">
                  {PRESET_AMOUNTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setTotalAmount(p);
                        const n = Number(p);
                        setCustomPartialAmount(String(Math.round(n * 0.5)));
                      }}
                      className={`pm-amount-pill ${totalAmount === p ? "is-active" : ""}`}
                    >
                      ${Number(p).toLocaleString()}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTotalAmount("")}
                    className={`pm-amount-pill ${!PRESET_AMOUNTS.includes(totalAmount) ? "is-active" : ""}`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {/* Payment Type: Full vs Partial Payment */}
              <div className="pm-field">
                <label className="pm-label">
                  Choose Payment Option <span className="pm-req">*</span>
                </label>
                <div className="pm-type-toggle">
                  {/* Full Payment Card */}
                  <div
                    className={`pm-type-card ${paymentType === "full" ? "is-active" : ""}`}
                    onClick={() => setPaymentType("full")}
                  >
                    <div className="pm-type-card-head">
                      <span className="pm-type-card-title">Full Payment (100%)</span>
                      <div className="pm-type-radio">
                        {paymentType === "full" && <div className="pm-type-radio-dot" />}
                      </div>
                    </div>
                    <span className="pm-type-card-desc">
                      Pay full amount of <strong>${numTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</strong> today with zero remaining balance.
                    </span>
                  </div>

                  {/* Partial Payment Card */}
                  <div
                    className={`pm-type-card ${paymentType === "partial" ? "is-active" : ""}`}
                    onClick={() => setPaymentType("partial")}
                  >
                    <div className="pm-type-card-head">
                      <span className="pm-type-card-title">Partial Payment</span>
                      <div className="pm-type-radio">
                        {paymentType === "partial" && <div className="pm-type-radio-dot" />}
                      </div>
                    </div>
                    <span className="pm-type-card-desc">
                      Pay an advance deposit or milestone now; balance due per terms.
                    </span>
                  </div>
                </div>

                {/* If Partial Payment Selected: Show Selector & Custom Box */}
                {paymentType === "partial" && (
                  <div className="pm-partial-box">
                    <label className="pm-label" style={{ fontSize: "12.5px", color: "#6b21a8" }}>
                      Select Partial Deposit Ratio or Custom Amount:
                    </label>
                    <div className="pm-partial-pills">
                      {PARTIAL_PRESETS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPartialPreset(item.id)}
                          className={`pm-partial-pill ${partialPreset === item.id ? "is-active" : ""}`}
                        >
                          {item.label}
                          {item.pct && numTotal > 0
                            ? ` ($${(numTotal * item.pct).toLocaleString(undefined, { maximumFractionDigits: 0 })})`
                            : ""}
                        </button>
                      ))}
                    </div>

                    {partialPreset === "custom" && (
                      <div className="pm-field" style={{ marginTop: "4px" }}>
                        <label className="pm-label" style={{ fontSize: "12px", color: "#64748b" }}>
                          Custom Partial Amount to Pay Now (USD):
                        </label>
                        <div className="pm-currency-input-wrap">
                          <span className="pm-currency-symbol">$</span>
                          <input
                            type="number"
                            min="1"
                            step="any"
                            placeholder="500"
                            value={customPartialAmount}
                            onChange={(e) => setCustomPartialAmount(e.target.value)}
                            className="pm-input"
                          />
                        </div>
                      </div>
                    )}

                    {/* Breakdown Preview */}
                    <div className="pm-breakdown-card">
                      <div className="pm-breakdown-row">
                        <span>Total Service Fee:</span>
                        <span>${numTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</span>
                      </div>
                      <div className="pm-breakdown-row is-highlight">
                        <span style={{ color: "#7c3aed" }}>Paying Now (via PayPal):</span>
                        <span style={{ color: "#7c3aed" }}>
                          ${payAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                        </span>
                      </div>
                      <div className="pm-breakdown-row is-balance">
                        <span>Remaining Balance Due:</span>
                        <span>
                          ${remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Notes */}
              <div className="pm-field">
                <label className="pm-label">Additional Notes or Invoice Reference (Optional)</label>
                <textarea
                  placeholder="e.g. Project milestone payment or monthly retainer note"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="pm-textarea"
                />
              </div>

              {/* Action Button */}
              <button type="submit" className="pm-submit-btn">
                <span>
                  Proceed to Pay ${payAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD (
                  {paymentType === "partial" ? "Partial Deposit" : "Full Payment"})
                </span>
                <LucideIcon name="arrow-right" size={16} />
              </button>
            </form>
          )}

          {/* Step 2: PayPal Checkout Buttons */}
          {step === "paypal" && (
            <div>
              {/* Order Summary */}
              <div className="pm-summary-card">
                <div className="pm-summary-row">
                  <span className="pm-summary-label">Client Name:</span>
                  <span className="pm-summary-val">{clientName}</span>
                </div>
                <div className="pm-summary-row">
                  <span className="pm-summary-label">Email:</span>
                  <span className="pm-summary-val">{clientEmail}</span>
                </div>
                <div className="pm-summary-row">
                  <span className="pm-summary-label">Phone:</span>
                  <span className="pm-summary-val">{clientPhone}</span>
                </div>
                <div className="pm-summary-row">
                  <span className="pm-summary-label">Service:</span>
                  <span className="pm-summary-val">{service}</span>
                </div>
                <div className="pm-summary-row">
                  <span className="pm-summary-label">Coverage Period:</span>
                  <span className="pm-summary-val">
                    {billingStartDate} to {billingEndDate}
                  </span>
                </div>
                <div className="pm-summary-row">
                  <span className="pm-summary-label">Payment Option:</span>
                  <span
                    className="pm-summary-val"
                    style={{
                      fontWeight: 800,
                      color: paymentType === "partial" ? "#7c3aed" : "#10b981",
                    }}
                  >
                    {paymentType === "partial" ? "Partial Payment (Deposit)" : "Full Payment (100%)"}
                  </span>
                </div>

                {paymentType === "partial" && (
                  <>
                    <div className="pm-summary-row">
                      <span className="pm-summary-label">Total Invoice Amount:</span>
                      <span className="pm-summary-val">
                        ${numTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                      </span>
                    </div>
                    <div className="pm-summary-row">
                      <span className="pm-summary-label" style={{ color: "#dc2626" }}>
                        Remaining Balance Due Later:
                      </span>
                      <span className="pm-summary-val" style={{ color: "#dc2626", fontWeight: 700 }}>
                        ${remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                      </span>
                    </div>
                  </>
                )}

                <div className="pm-summary-total">
                  <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "16px" }}>
                    {paymentType === "partial" ? "Due Today (PayPal):" : "Total to Pay (PayPal):"}
                  </span>
                  <span className="pm-total-amount">
                    ${payAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
              </div>

              {/* PayPal Buttons Anchor */}
              <div style={{ textAlign: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                  Choose your preferred payment method:
                </span>
              </div>

              <div ref={paypalContainerRef} className="pm-paypal-container">
                {/* PayPal JS SDK injects buttons here */}
              </div>

              {isSubmitting && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    color: "#4f46e5",
                    fontWeight: 700,
                  }}
                >
                  ⏳ Processing and confirming payment with PayPal...
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep("form")}
                className="pm-btn-secondary"
                style={{ width: "100%", marginTop: "12px" }}
              >
                ← Back to Edit Amount &amp; Details
              </button>
            </div>
          )}

          {/* Step 3: Success Confirmation & Receipt */}
          {step === "success" && receipt && (
            <div className="pm-success-box">
              <div className="pm-success-icon">
                <LucideIcon name="check" size={32} />
              </div>
              <h3 className="pm-success-title">Payment Confirmed &amp; Received!</h3>
              <p className="pm-success-desc">
                Your {receipt.paymentType === "partial" ? "partial deposit" : "full payment"} of{" "}
                <strong>${receipt.amount.toFixed(2)} USD</strong> has been successfully captured and confirmed via PayPal.
              </p>

              {/* High-visibility Confirmation Message Banner */}
              <div className="pm-confirm-banner">
                <div className="pm-confirm-banner-icon">
                  <LucideIcon name="check" size={16} />
                </div>
                <div>
                  <div className="pm-confirm-banner-title">
                    Payment Confirmation Sent
                  </div>
                  <p className="pm-confirm-banner-text">
                    Thank you, <strong>{clientName}</strong>! An official confirmation receipt has been dispatched to{" "}
                    <strong>{clientEmail}</strong>.
                    {receipt.paymentType === "partial" && (
                      <>
                        {" "}Your remaining balance of{" "}
                        <strong>${receipt.remainingAmount.toFixed(2)} USD</strong> will be billed per milestone terms.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Receipt Table */}
              <table className="pm-receipt-table">
                <tbody>
                  <tr>
                    <td style={{ color: "#64748b", width: "40%" }}>Status:</td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "#dcfce7",
                          color: "#15803d",
                          fontWeight: 800,
                          padding: "3px 10px",
                          borderRadius: "999px",
                          fontSize: "12px",
                        }}
                      >
                        ✓ COMPLETED &amp; CONFIRMED
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "#64748b" }}>Payment Type:</td>
                    <td style={{ fontWeight: 700, color: "#0f172a" }}>
                      {receipt.paymentType === "partial" ? "Partial Payment (Deposit)" : "Full Payment (100%)"}
                    </td>
                  </tr>
                  {receipt.paymentType === "partial" && (
                    <tr>
                      <td style={{ color: "#64748b" }}>Total Invoice Amount:</td>
                      <td style={{ fontWeight: 600, color: "#475569" }}>
                        ${receipt.totalAmount.toFixed(2)} USD
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ color: "#64748b" }}>Amount Paid Now:</td>
                    <td style={{ fontWeight: 800, color: "#10b981", fontSize: "16px" }}>
                      ${receipt.amount.toFixed(2)} USD
                    </td>
                  </tr>
                  {receipt.paymentType === "partial" && (
                    <tr>
                      <td style={{ color: "#64748b" }}>Remaining Balance Due:</td>
                      <td style={{ fontWeight: 700, color: "#dc2626" }}>
                        ${receipt.remainingAmount.toFixed(2)} USD
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ color: "#64748b" }}>Transaction / Capture ID:</td>
                    <td style={{ fontWeight: 700, fontFamily: "monospace", color: "#0f172a" }}>
                      {receipt.captureID}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "#64748b" }}>PayPal Order ID:</td>
                    <td style={{ fontFamily: "monospace", color: "#475569" }}>{receipt.orderID}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "#64748b" }}>Client Name:</td>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>{clientName}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "#64748b" }}>Client Phone:</td>
                    <td style={{ color: "#0f172a" }}>{clientPhone}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "#64748b" }}>Service:</td>
                    <td style={{ fontWeight: 600, color: "#0f172a" }}>{service}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "#64748b" }}>Billing Coverage:</td>
                    <td style={{ color: "#0f172a" }}>
                      {billingStartDate} to {billingEndDate}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "#64748b" }}>Date &amp; Time:</td>
                    <td style={{ color: "#0f172a" }}>{receipt.date}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "#64748b" }}>Receipt Sent To:</td>
                    <td style={{ color: "#0f172a" }}>{clientEmail}</td>
                  </tr>
                </tbody>
              </table>

              <div className="pm-receipt-actions">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="pm-btn-secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="pm-submit-btn"
                  style={{ width: "auto", padding: "0 28px" }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

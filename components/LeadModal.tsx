"use client";

import React, { useState, useEffect } from "react";

export default function LeadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    countryCode: "+1",
    phone: "",
    company: "",
    category: "Full Growth System (Marketing + AI + Tech)",
    message: "",
  });

  // Popup automatically after 15 seconds
  useEffect(() => {
    // Check if dismissed in this session
    const hasSeenModal = sessionStorage.getItem("qs_lead_modal_seen");
    if (hasSeenModal) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
  }, []);

  // Listen for custom trigger event or Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const closeModal = () => {
    setIsOpen(false);
    sessionStorage.setItem("qs_lead_modal_seen", "true");
  };

  const openModal = () => {
    setIsOpen(true);
    setIsSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate reliable submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      sessionStorage.setItem("qs_lead_modal_seen", "true");
    }, 900);
  };

  useEffect(() => {
    const handleOpenModalEvent = () => openModal();
    window.addEventListener("open-lead-modal", handleOpenModalEvent);
    return () => window.removeEventListener("open-lead-modal", handleOpenModalEvent);
  }, []);

  return (
    <>
      {/* Modal Backdrop & Container */}
      {isOpen && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "rgba(7, 11, 20, 0.82)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            overflowY: "auto",
            animation: "qsFadeIn 0.25s ease-out",
          }}
        >
          {/* Modal Dialog Content (2-Column Card) */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "28px",
              width: "100%",
              maxWidth: "960px",
              maxHeight: "92vh",
              overflowY: "auto",
              position: "relative",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.4)",
              display: "grid",
              gridTemplateColumns: "1fr 1.35fr",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
            className="qs-lead-modal-grid"
          >
            {/* Close Button Top Right */}
            <button
              onClick={closeModal}
              aria-label="Close dialog"
              style={{
                position: "absolute",
                top: "16px",
                right: "18px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#f2f4f7",
                border: "none",
                fontSize: "18px",
                color: "#667085",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#18171c";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f2f4f7";
                e.currentTarget.style.color = "#667085";
              }}
            >
              âœ•
            </button>

            {/* LEFT COLUMN: Brand, Value Proposition & Trust Badges */}
            <div
              style={{
                background: "linear-gradient(180deg, #0d1527 0%, #070c18 100%)",
                padding: "44px 36px",
                color: "#ffffff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
                borderTopLeftRadius: "28px",
                borderBottomLeftRadius: "28px",
              }}
              className="qs-lead-modal-left"
            >
              {/* Background ambient glow */}
              <div
                style={{
                  position: "absolute",
                  top: "-60px",
                  left: "-60px",
                  width: "240px",
                  height: "240px",
                  background: "radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Brand */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: "26px" }}>
                  <img
                    src="/images/logo-white.png"
                    alt="Quickupp Softech LLC"
                    style={{
                      height: "58px",
                      width: "auto",
                      maxWidth: "250px",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>

                <h3
                  style={{
                    fontSize: "clamp(22px, 2.5vw, 30px)",
                    fontWeight: 800,
                    lineHeight: 1.25,
                    color: "#ffffff",
                    marginBottom: "8px",
                  }}
                >
                  Your Strategic <br />
                  <span style={{ color: "#7c3aed" }}>Technology &amp; Growth</span> Partner
                </h3>

                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255, 255, 255, 0.75)",
                    lineHeight: 1.6,
                    marginBottom: "28px",
                  }}
                >
                  Fast-track your digital success with integrated Marketing, AI, and Software Engineering.
                </p>

                {/* Trust Stats List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
                  {/* Item 1 */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: "rgba(222, 242, 92, 0.12)",
                        border: "1px solid rgba(222, 242, 92, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#7c3aed",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff" }}>120+ Global Clients</div>
                      <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>Across US, UK &amp; Middle East</div>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: "rgba(56, 189, 248, 0.12)",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#38bdf8",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff" }}>200+ Projects Delivered</div>
                      <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>High-ROI Web, AI &amp; Marketing</div>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: "rgba(168, 85, 247, 0.12)",
                        border: "1px solid rgba(168, 85, 247, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#c084fc",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff" }}>Global Delivery</div>
                      <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>USA â€¢ UAE â€¢ India</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Badges Footer */}
              <div style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "20px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "rgba(255, 255, 255, 0.5)",
                    marginBottom: "10px",
                  }}
                >
                  Certified &amp; Compliant
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(255, 255, 255, 0.08)", padding: "4px 8px", borderRadius: "6px", color: "#7c3aed" }}>
                    âœ“ SOC 2
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(255, 255, 255, 0.08)", padding: "4px 8px", borderRadius: "6px", color: "#38bdf8" }}>
                    âœ“ HIPAA Ready
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(255, 255, 255, 0.08)", padding: "4px 8px", borderRadius: "6px", color: "#c084fc" }}>
                    âœ“ GDPR
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(255, 255, 255, 0.08)", padding: "4px 8px", borderRadius: "6px", color: "#4ade80" }}>
                    âœ“ ISO 27001
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: The Lead Form */}
            <div
              style={{
                padding: "44px 36px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              className="qs-lead-modal-right"
            >
              {isSubmitted ? (
                /* Success State */
                <div style={{ textAlign: "center", padding: "30px 10px", animation: "qsFadeIn 0.3s ease" }}>
                  <div
                    style={{
                      width: "68px",
                      height: "68px",
                      borderRadius: "50%",
                      background: "#ecfdf5",
                      border: "2px solid #10b981",
                      color: "#10b981",
                      fontSize: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px auto",
                    }}
                  >
                    âœ“
                  </div>
                  <h3 style={{ fontSize: "26px", fontWeight: 800, color: "#18171c", marginBottom: "8px" }}>
                    Thank You!
                  </h3>
                  <p style={{ fontSize: "15px", color: "#475467", lineHeight: 1.6, maxWidth: "380px", margin: "0 auto 24px auto" }}>
                    We have received your requirements. One of our senior growth strategists will review your brief and contact you within 24 hours.
                  </p>
                  <button
                    onClick={closeModal}
                    style={{
                      background: "#18171c",
                      color: "#7c3aed",
                      fontWeight: 700,
                      padding: "12px 28px",
                      borderRadius: "100px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                /* Form Fields State */
                <>
                  <div style={{ marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#18171c", marginBottom: "4px", lineHeight: 1.25 }}>
                      Tell Us About Your Requirements
                    </h2>
                    <p style={{ fontSize: "13.5px", color: "#667085", margin: 0 }}>
                      Our growth &amp; technology experts will get back to you promptly.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Full Name */}
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#98a2b3" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Full Name *"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "11px 14px 11px 40px",
                          borderRadius: "10px",
                          border: "1px solid #d0d5dd",
                          fontSize: "14px",
                          color: "#18171c",
                          outline: "none",
                          transition: "border-color 0.2s ease",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                        onBlur={(e) => (e.target.style.borderColor = "#d0d5dd")}
                      />
                    </div>

                    {/* Business Email */}
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#98a2b3" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="Business Email *"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "11px 14px 11px 40px",
                          borderRadius: "10px",
                          border: "1px solid #d0d5dd",
                          fontSize: "14px",
                          color: "#18171c",
                          outline: "none",
                          transition: "border-color 0.2s ease",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                        onBlur={(e) => (e.target.style.borderColor = "#d0d5dd")}
                      />
                    </div>

                    {/* Phone Number with Country Code */}
                    <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "8px" }}>
                      <select
                        value={formData.countryCode}
                        onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                        style={{
                          padding: "11px 8px",
                          borderRadius: "10px",
                          border: "1px solid #d0d5dd",
                          fontSize: "13.5px",
                          color: "#18171c",
                          background: "#f8f9fa",
                          outline: "none",
                        }}
                      >
                        <option value="+1">ðŸ‡ºðŸ‡¸ +1 (US)</option>
                        <option value="+44">ðŸ‡¬ðŸ‡§ +44 (UK)</option>
                        <option value="+971">ðŸ‡¦ðŸ‡ª +971 (UAE)</option>
                        <option value="+91">ðŸ‡®ðŸ‡³ +91 (IN)</option>
                        <option value="+61">ðŸ‡¦ðŸ‡º +61 (AU)</option>
                        <option value="+49">ðŸ‡©ðŸ‡ª +49 (DE)</option>
                        <option value="+1-CA">ðŸ‡¨ðŸ‡¦ +1 (CA)</option>
                      </select>
                      <input
                        type="tel"
                        required
                        placeholder="Phone Number *"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: "10px",
                          border: "1px solid #d0d5dd",
                          fontSize: "14px",
                          color: "#18171c",
                          outline: "none",
                          transition: "border-color 0.2s ease",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                        onBlur={(e) => (e.target.style.borderColor = "#d0d5dd")}
                      />
                    </div>

                    {/* Company Name */}
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#98a2b3" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="16" height="20" x="4" y="2" rx="2" />
                          <path d="M9 22v-4h6v4" />
                          <path d="M8 6h.01" />
                          <path d="M16 6h.01" />
                          <path d="M8 10h.01" />
                          <path d="M16 10h.01" />
                          <path d="M8 14h.01" />
                          <path d="M16 14h.01" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Company Name *"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "11px 14px 11px 40px",
                          borderRadius: "10px",
                          border: "1px solid #d0d5dd",
                          fontSize: "14px",
                          color: "#18171c",
                          outline: "none",
                          transition: "border-color 0.2s ease",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                        onBlur={(e) => (e.target.style.borderColor = "#d0d5dd")}
                      />
                    </div>

                    {/* Enquiry Category */}
                    <div>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: "10px",
                          border: "1px solid #d0d5dd",
                          fontSize: "13.5px",
                          color: "#18171c",
                          background: "#ffffff",
                          outline: "none",
                        }}
                      >
                        <option value="Full Growth System (Marketing + AI + Tech)">ðŸš€ Full Growth System (Marketing + AI + Tech)</option>
                        <option value="AI & Automation Solutions">ðŸ¤– AI &amp; Automation Solutions</option>
                        <option value="Performance Marketing & SEO">ðŸ“ˆ Performance Marketing &amp; SEO (AEO/GEO)</option>
                        <option value="Web & Mobile App Development">ðŸ’» Web &amp; Mobile App Development</option>
                        <option value="AI Video Production (Avatar / UGC)">ðŸŽ¥ AI Video Production (Avatar / UGC)</option>
                        <option value="Staff Augmentation (IT / Marketing)">ðŸ‘¥ Staff Augmentation (IT / Marketing)</option>
                      </select>
                    </div>

                    {/* Additional Message */}
                    <textarea
                      rows={2}
                      placeholder="Brief details about your project, timeline, or objectives (optional)..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #d0d5dd",
                        fontSize: "13.5px",
                        color: "#18171c",
                        outline: "none",
                        resize: "none",
                        fontFamily: "inherit",
                        transition: "border-color 0.2s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                      onBlur={(e) => (e.target.style.borderColor = "#d0d5dd")}
                    />

                    {/* Privacy Note */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#667085" }}>
                      <span>ðŸ”’</span>
                      <span>Your information is 100% confidential. We respect your privacy.</span>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        marginTop: "4px",
                        background: "linear-gradient(135deg, #18171c 0%, #2a2832 100%)",
                        color: "#7c3aed",
                        border: "1px solid #7c3aed",
                        padding: "14px 20px",
                        borderRadius: "100px",
                        fontSize: "15px",
                        fontWeight: 700,
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                        transition: "all 0.25s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubmitting) {
                          e.currentTarget.style.background = "#7c3aed";
                          e.currentTarget.style.color = "#18171c";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubmitting) {
                          e.currentTarget.style.background = "linear-gradient(135deg, #18171c 0%, #2a2832 100%)";
                          e.currentTarget.style.color = "#7c3aed";
                        }
                      }}
                    >
                      {isSubmitting ? (
                        <span>Processing your enquiry...</span>
                      ) : (
                        <span>Submit Enquiry →</span>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

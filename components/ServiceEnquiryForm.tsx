"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import CountrySelect from "@/components/CountrySelect";
import { CONTACT_BUDGETS, CONTACT_TIMELINES, INDUSTRIES, SERVICE_FORMS, type ServiceFormKey } from "@/lib/formOptions";
import { isWebLink, LINK_ERROR, normalizeLink } from "@/lib/webLink";

/*
 * Enquiry form shown on every subpage of a service, and on every industry page.
 * On a service page "Service" is fixed to that service; on an industry page
 * "Industry" is fixed instead and the visitor picks the service.
 * "Category" supports selecting multiple categories/subpages of the service.
 * Submissions go to /api/service-enquiry and are saved in the service's own table.
 */

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  companyWebsite: "",
  country: "",
  industry: "",
  otherIndustry: "",
  budget: "",
  timeline: "",
  youtubeLink: "",
  message: "",
  agreed: false,
};

const SERVICE_KEYS = Object.keys(SERVICE_FORMS) as ServiceFormKey[];

type Props =
  | { service: ServiceFormKey; industry?: undefined; current?: string }
  | { service?: undefined; industry: (typeof INDUSTRIES)[number]; current?: string };

export default function ServiceEnquiryForm({ service: fixedService, industry: fixedIndustry, current }: Props) {
  const start = { ...EMPTY, industry: fixedIndustry ?? "" };
  // on an industry page the visitor picks the service
  const [pickedService, setPickedService] = useState<ServiceFormKey | "">("");
  const service = fixedService ?? pickedService;
  const form = service ? SERVICE_FORMS[service] : null;
  const options: readonly string[] = form?.options ?? [];
  const hasCategories = service !== "youtube" && (fixedIndustry ? true : options.length > 0);
  const idp = `sef-${fixedService ?? (fixedIndustry || "").toLowerCase().replace(/[^a-z]+/g, "-")}`;
  const [serviceError, setServiceError] = useState(false);

  const [formData, setFormData] = useState(start);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categoryError, setCategoryError] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  const [website, setWebsite] = useState(""); // hidden spam trap
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [agreedError, setAgreedError] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = (patch: Partial<typeof EMPTY>) => setFormData((f) => ({ ...f, ...patch }));

  // Auto-reset form back to original state after 3 seconds
  useEffect(() => {
    if (!submitted) return;
    const interval = setInterval(() => {
      setCountdown((c) => (c > 1 ? c - 1 : 1));
    }, 1000);
    const timer = setTimeout(() => {
      setSubmitted(false);
      setCountdown(3);
      setFormData(start);
      setPickedService("");
      setSelectedCategories([]);
      setCategoryError(false);
      setAgreedError(false);
      setSubmitError("");
      setWebsite("");
    }, 3000);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  // Close category dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
    }
    if (isCategoryOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isCategoryOpen]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat];
      if (next.length > 0) setCategoryError(false);
      return next;
    });
  };

  const selectAllCategories = () => {
    setSelectedCategories([...options]);
    setCategoryError(false);
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  const pickService = (key: ServiceFormKey | "") => {
    setPickedService(key);
    setSelectedCategories([]);
    setIsCategoryOpen(false);
    setCategoryError(false);
    if (key) setServiceError(false);
    if (key !== "youtube") set({ youtubeLink: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) {
      setServiceError(true);
      return;
    }
    if (hasCategories && selectedCategories.length === 0) {
      setCategoryError(true);
      return;
    }
    setCategoryError(false);

    if (!formData.agreed) {
      setAgreedError(true);
      return;
    }
    setAgreedError(false);
    if (formData.companyWebsite.trim() && !isWebLink(formData.companyWebsite)) {
      setSubmitError(LINK_ERROR);
      document.getElementById(`${idp}-website`)?.focus();
      return;
    }
    if (service === "youtube" && !isWebLink(formData.youtubeLink)) {
      setSubmitError("Please enter a valid YouTube link, e.g. youtube.com/@yourchannel.");
      document.getElementById(`${idp}-ytlink`)?.focus();
      return;
    }
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/service-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          companyName: formData.companyName,
          companyWebsite: normalizeLink(formData.companyWebsite),
          country: formData.country,
          industry: formData.industry,
          otherIndustry: formData.otherIndustry,
          ...(hasCategories
            ? {
                category: selectedCategories.join(", "),
                categories: selectedCategories,
              }
            : {}),
          budget: formData.budget,
          timeline: formData.timeline,
          youtubeLink: normalizeLink(formData.youtubeLink),
          message: formData.message,
          agreed: formData.agreed,
          service,
          ...(fixedIndustry ? { industryPage: true } : {}),
          website,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        const firstError = json.errors ? Object.values(json.errors)[0] : json.error;
        setSubmitError(String(firstError || "We couldn't send your inquiry right now. Please try again."));
        return;
      }
      setCountdown(3);
      setSubmitted(true);
    } catch {
      setSubmitError("We couldn't send your inquiry right now. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="sef-section" id="enquiry">
      <div className="sef-container">
        <h2 className="sef-heading">
          Talk to Us About <span className="qs-gradient-text">{current || form?.label || fixedIndustry}</span>
        </h2>
        <div className="su-contact-form-container">
          {submitted ? (
            <div className="su-success-box">
              <div className="su-success-icon">✓</div>
              <h3 className="sef-success-title">Thank You! Your Inquiry Has Been Received.</h3>
              <p className="sef-success-text">
                Our team will review your details and contact you to discuss your requirements.
              </p>
              <p style={{ fontSize: "13.5px", color: "#64748b", marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Returning to original form in {countdown}s...
              </p>
              <button
                type="button"
                className="su-submit-btn"
                style={{ marginTop: "16px" }}
                onClick={() => {
                  setSubmitted(false);
                  setFormData(start);
                  setPickedService("");
                  setSelectedCategories([]);
                  setCategoryError(false);
                  setAgreedError(false);
                  setSubmitError("");
                  setWebsite("");
                }}
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="su-contact-form" noValidate={false}>
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="sef-trap"
              />

              <div className="su-form-top">
                <h2 className="su-inquiry-title">Send Your Inquiry!</h2>
                <p className="su-inquiry-para">Our team will review your details and contact you to discuss your requirements.</p>
              </div>

              {/* Row 1: Full name, Business email, Phone number */}
              <div className="sef-row">
                <div className="su-field-group">
                  <label htmlFor={`${idp}-name`} className="su-field-label">
                    Full Name*
                  </label>
                  <input
                    id={`${idp}-name`}
                    type="text"
                    required
                    placeholder="Full Name"
                    className="su-text-input"
                    value={formData.fullName}
                    onChange={(e) => set({ fullName: e.target.value })}
                  />
                </div>
                <div className="su-field-group">
                  <label htmlFor={`${idp}-email`} className="su-field-label">
                    Business Email*
                  </label>
                  <input
                    id={`${idp}-email`}
                    type="email"
                    required
                    placeholder="Business Email"
                    className="su-text-input"
                    value={formData.email}
                    onChange={(e) => set({ email: e.target.value })}
                  />
                </div>
                <div className="su-field-group">
                  <label htmlFor={`${idp}-phone`} className="su-field-label">
                    Phone Number*
                  </label>
                  <input
                    id={`${idp}-phone`}
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    className="su-text-input"
                    value={formData.phone}
                    onChange={(e) => set({ phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 2: Company name, Company website, Country */}
              <div className="sef-row">
                <div className="su-field-group">
                  <label htmlFor={`${idp}-company`} className="su-field-label">
                    Company Name
                  </label>
                  <input
                    id={`${idp}-company`}
                    type="text"
                    placeholder="Company / Organization"
                    className="su-text-input"
                    value={formData.companyName}
                    onChange={(e) => set({ companyName: e.target.value })}
                  />
                </div>
                <div className="su-field-group">
                  <label htmlFor={`${idp}-website`} className="su-field-label">
                    Company Website
                  </label>
                  <input
                    id={`${idp}-website`}
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    placeholder="www.example.com"
                    className="su-text-input"
                    value={formData.companyWebsite}
                    onChange={(e) => set({ companyWebsite: e.target.value })}
                  />
                </div>
                <div className="su-field-group">
                  <label htmlFor={`${idp}-country`} className="su-field-label">
                    Country*
                  </label>
                  <CountrySelect
                    id={`${idp}-country`}
                    name="country"
                    required
                    placeholder="Select or type country"
                    className="su-text-input"
                    value={formData.country}
                    onChange={(country) => set({ country })}
                  />
                </div>
              </div>

              {service === "youtube" && (
                <div className="sef-row">
                  <div className="su-field-group" style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor={`${idp}-ytlink`} className="su-field-label">
                      YouTube Video or Channel Link*
                    </label>
                    <input
                      id={`${idp}-ytlink`}
                      type="text"
                      inputMode="url"
                      required
                      placeholder="youtube.com/@yourchannel or youtu.be/..."
                      className="su-text-input"
                      value={formData.youtubeLink}
                      onChange={(e) => set({ youtubeLink: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Row 3: Service (fixed), Category, Industry */}
              {/* Row 3: Service (fixed), Category (if applicable), Industry */}
              <div className={`sef-row ${hasCategories ? "" : "sef-row-2"}`}>
                <div className="su-field-group">
                  <label htmlFor={`${idp}-service`} className="su-field-label">
                    Service Interested In*
                  </label>
                  {fixedService ? (
                    <div className="sef-locked-wrap" title="Fixed on this service's pages">
                      <input
                        id={`${idp}-service`}
                        type="text"
                        readOnly
                        tabIndex={-1}
                        aria-readonly="true"
                        className="su-text-input sef-locked"
                        value={form?.label ?? ""}
                      />
                      <LockIcon />
                    </div>
                  ) : (
                    <>
                      <select
                        id={`${idp}-service`}
                        required
                        className={`su-select-input${serviceError ? " has-error" : ""}`}
                        value={pickedService}
                        onChange={(e) => pickService(e.target.value as ServiceFormKey | "")}
                      >
                        <option value="">Select Service</option>
                        {SERVICE_KEYS.map((k) => (
                          <option key={k} value={k}>
                            {SERVICE_FORMS[k].label}
                          </option>
                        ))}
                      </select>
                      {serviceError && (
                        <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px", display: "block" }}>
                          Please select a service.
                        </span>
                      )}
                    </>
                  )}
                </div>

                {hasCategories && (
                  <div className="su-field-group sef-category-group" ref={categoryRef}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "7px" }}>
                      <label htmlFor={`${idp}-category`} className="su-field-label" style={{ margin: 0 }}>
                        Category*
                      </label>
                      <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500, letterSpacing: "normal", textTransform: "none" }}>
                        Select multiple
                      </span>
                    </div>

                    <div className="sef-custom-select-wrap">
                      <button
                        id={`${idp}-category`}
                        type="button"
                        className={`su-select-input sef-multi-trigger ${categoryError ? "has-error" : ""} ${isCategoryOpen ? "is-active" : ""}`}
                        disabled={!service}
                        onClick={() => setIsCategoryOpen((v) => !v)}
                        aria-expanded={isCategoryOpen}
                        aria-haspopup="listbox"
                      >
                        <div className="sef-trigger-text">
                          {!service ? (
                            <span className="sef-placeholder">Select a service first...</span>
                          ) : selectedCategories.length === 0 ? (
                            <span className="sef-placeholder">Select one or more categories...</span>
                          ) : selectedCategories.length === 1 ? (
                            <span className="sef-trigger-names">{selectedCategories[0]}</span>
                          ) : (
                            <>
                              <span className="sef-count-pill">{selectedCategories.length} selected</span>
                              <span className="sef-trigger-names">
                                {selectedCategories[0]}, +{selectedCategories.length - 1} more
                              </span>
                            </>
                          )}
                        </div>

                        <svg
                          className={`sef-arrow ${isCategoryOpen ? "is-open" : ""}`}
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>

                      {/* Dropdown panel */}
                      {isCategoryOpen && (
                        <div className="sef-dropdown-panel" role="listbox" aria-multiselectable="true">
                          <div className="sef-dropdown-header">
                            <span className="sef-dropdown-avail">{options.length} Available</span>
                            <div className="sef-dropdown-actions">
                              <button
                                type="button"
                                className="sef-quick-btn"
                                onClick={selectAllCategories}
                              >
                                Select All
                              </button>
                              <span style={{ color: "#cbd5e1" }}>•</span>
                              <button
                                type="button"
                                className="sef-quick-btn sef-clear-btn"
                                onClick={clearCategories}
                              >
                                Clear
                              </button>
                            </div>
                          </div>

                          <div className="sef-options-scroll">
                            {options.map((opt) => {
                              const isChecked = selectedCategories.includes(opt);
                              return (
                                <div
                                  key={opt}
                                  className={`sef-option-item ${isChecked ? "is-checked" : ""}`}
                                  onClick={() => toggleCategory(opt)}
                                  role="option"
                                  aria-selected={isChecked}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className="sef-checkbox"
                                    tabIndex={-1}
                                  />
                                  <span className="sef-option-text">{opt}</span>
                                  {isChecked && <span className="sef-checkmark">✓</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {categoryError && (
                      <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px", display: "block" }}>
                        Please select at least one category.
                      </span>
                    )}

                    {/* Selected category pill tags */}
                    {selectedCategories.length > 0 && (
                      <div className="sef-tags-wrap">
                        {selectedCategories.map((cat) => (
                          <span key={cat} className="sef-tag">
                            {cat}
                            <button
                              type="button"
                              className="sef-tag-remove"
                              onClick={() => toggleCategory(cat)}
                              title={`Remove ${cat}`}
                              aria-label={`Remove ${cat}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="su-field-group">
                  <label htmlFor={`${idp}-industry`} className="su-field-label">
                    Industry*
                  </label>
                  {fixedIndustry ? (
                    <div className="sef-locked-wrap" title="Fixed on this industry's page">
                      <input
                        id={`${idp}-industry`}
                        type="text"
                        readOnly
                        tabIndex={-1}
                        aria-readonly="true"
                        className="su-text-input sef-locked"
                        value={fixedIndustry}
                      />
                      <LockIcon />
                    </div>
                  ) : (
                  <select
                    id={`${idp}-industry`}
                    required
                    className="su-select-input"
                    value={formData.industry}
                    onChange={(e) => {
                      const val = e.target.value;
                      set({ industry: val, otherIndustry: val === "Other" ? formData.otherIndustry : "" });
                    }}
                  >
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                  )}
                </div>
              </div>

              {/* Row 4: (Other Industry if selected) + Estimated Budget + Project Timeline */}
              {formData.industry === "Other" ? (
                <div className="sef-row">
                  <div className="su-field-group">
                    <label htmlFor={`${idp}-other`} className="su-field-label">
                      Please specify your industry*
                    </label>
                    <input
                      id={`${idp}-other`}
                      type="text"
                      required
                      placeholder="Please specify your industry..."
                      className="su-text-input"
                      value={formData.otherIndustry}
                      onChange={(e) => set({ otherIndustry: e.target.value })}
                    />
                  </div>
                  <div className="su-field-group">
                    <label htmlFor={`${idp}-budget`} className="su-field-label">
                      Estimated Project Budget*
                    </label>
                    <select
                      id={`${idp}-budget`}
                      required
                      className="su-select-input"
                      value={formData.budget}
                      onChange={(e) => set({ budget: e.target.value })}
                    >
                      <option value="">Select Budget Range</option>
                      {CONTACT_BUDGETS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="su-field-group">
                    <label htmlFor={`${idp}-timeline`} className="su-field-label">
                      Project Timeline*
                    </label>
                    <select
                      id={`${idp}-timeline`}
                      required
                      className="su-select-input"
                      value={formData.timeline}
                      onChange={(e) => set({ timeline: e.target.value })}
                    >
                      <option value="">Select Timeline</option>
                      {CONTACT_TIMELINES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="sef-row sef-row-2">
                  <div className="su-field-group">
                    <label htmlFor={`${idp}-budget`} className="su-field-label">
                      Estimated Project Budget*
                    </label>
                    <select
                      id={`${idp}-budget`}
                      required
                      className="su-select-input"
                      value={formData.budget}
                      onChange={(e) => set({ budget: e.target.value })}
                    >
                      <option value="">Select Budget Range</option>
                      {CONTACT_BUDGETS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="su-field-group">
                    <label htmlFor={`${idp}-timeline`} className="su-field-label">
                      Project Timeline*
                    </label>
                    <select
                      id={`${idp}-timeline`}
                      required
                      className="su-select-input"
                      value={formData.timeline}
                      onChange={(e) => set({ timeline: e.target.value })}
                    >
                      <option value="">Select Timeline</option>
                      {CONTACT_TIMELINES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Message / Project Details */}
              <div className="su-field-group">
                <label htmlFor={`${idp}-message`} className="su-field-label">
                  Tell Us About Your Project / Requirements
                </label>
                <textarea
                  id={`${idp}-message`}
                  rows={4}
                  placeholder="Tell us about your project, goals, and requirements..."
                  className="su-textarea-input"
                  value={formData.message}
                  onChange={(e) => set({ message: e.target.value })}
                />
              </div>

              <label className={`su-checkbox-wrap${agreedError ? " is-error" : ""}`}>
                <input
                  type="checkbox"
                  checked={formData.agreed}
                  onChange={(e) => {
                    set({ agreed: e.target.checked });
                    setAgreedError(!e.target.checked);
                  }}
                  className="su-checkbox-input"
                />
                <span className="su-checkbox-label">
                  By submitting this form, you agree to our <Link href="/privacy-policy">Privacy Policy</Link> and{" "}
                  <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
                </span>
              </label>
              {agreedError && (
                <p className="sef-agree-error" role="alert">
                  Please accept the Privacy Policy and Terms &amp; Conditions before submitting your message.
                </p>
              )}

              {submitError && (
                <p className="su-form-error" role="alert">
                  {submitError}
                </p>
              )}

              <button type="submit" disabled={submitting} className="su-submit-btn">
                <span>{submitting ? "Submitting..." : "Submit Your Inquiry"}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 18" fill="none" className="su-submit-arrow">
                  <path
                    d="M3.75 9L14.25 9M14.25 9L9 3.75M14.25 9L9 14.25"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function LockIcon() {
  return (
    <svg className="sef-lock" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

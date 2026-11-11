"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CountrySelect from "@/components/CountrySelect";
import { CONTACT_BUDGETS, CONTACT_TIMELINES, INDUSTRIES, SERVICE_FORMS, type ServiceFormKey } from "@/lib/formOptions";

/*
 * The lead form in the hero of every industry page, in three steps
 * (project → details → send). The industry is fixed to the
 * page; the visitor picks the service and its categories. Submissions go to
 * /api/service-enquiry with industryPage: true → the CRM's "Industry Pages"
 * enquiries. 3 seconds after a successful send it starts again at step 1.
 */

type Industry = (typeof INDUSTRIES)[number];

const SERVICE_KEYS = Object.keys(SERVICE_FORMS) as ServiceFormKey[];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[0-9+()\-.\s]{5,40}$/;

const STEPS = ["Project", "Details", "Send"] as const;

const EMPTY = {
  service: "" as ServiceFormKey | "",
  categories: [] as string[],
  youtubeLink: "",
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  companyWebsite: "",
  country: "",
  budget: "",
  timeline: "",
  message: "",
  agreed: false,
};
type Form = typeof EMPTY;
type Errors = Partial<Record<keyof Form, string>>;

/* which step each field is on (for messages coming back from the server) */
const STEP_OF: Record<string, number> = {
  service: 0, category: 0, categories: 0, youtubeLink: 0,
  fullName: 1, email: 1, phone: 1, companyName: 1, companyWebsite: 1, country: 1,
  budget: 2, timeline: 2, message: 2, agreed: 2,
};

export default function IndustryHeroForm({ industry }: { industry: Industry }) {
  const [form, setForm] = useState<Form>(EMPTY);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [trap, setTrap] = useState(""); // hidden spam trap
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const options: readonly string[] = form.service ? SERVICE_FORMS[form.service].options : [];
  const isYoutube = form.service === "youtube";
  const id = (k: string) => `ihf-${k}`;

  const set = (patch: Partial<Form>) => {
    setForm((f) => ({ ...f, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const k of Object.keys(patch) as (keyof Form)[]) delete next[k];
      return next;
    });
  };

  // after a successful send: back to step 1 in 3 seconds
  useEffect(() => {
    if (!submitted) return;
    const tick = setInterval(() => setCountdown((c) => (c > 1 ? c - 1 : 1)), 1000);
    const reset = setTimeout(() => {
      setForm(EMPTY);
      setErrors({});
      setTrap("");
      setSubmitError("");
      setStep(0);
      setCountdown(3);
      setSubmitted(false);
    }, 3000);
    return () => {
      clearInterval(tick);
      clearTimeout(reset);
    };
  }, [submitted]);

  /** the messages for one step; empty when it is complete */
  const check = (s: number): Errors => {
    const e: Errors = {};
    if (s === 0) {
      if (!form.service) e.service = "Please select a service.";
      else if (isYoutube) {
        if (!/^https?:\/\/\S+$/i.test(form.youtubeLink.trim())) e.youtubeLink = "Please enter your YouTube video or channel link.";
      } else if (options.length && !form.categories.length) e.categories = "Please select at least one category.";
    }
    if (s === 1) {
      if (!form.fullName.trim()) e.fullName = "Please enter your full name.";
      if (!EMAIL_RE.test(form.email.trim())) e.email = "Please enter a valid business email.";
      if (!PHONE_RE.test(form.phone.trim())) e.phone = "Please enter a valid phone number.";
      if (!form.country.trim()) e.country = "Please enter your country.";
    }
    if (s === 2) {
      if (!form.budget) e.budget = "Please select an estimated budget.";
      if (!form.timeline) e.timeline = "Please select a project timeline.";
      if (!form.agreed) e.agreed = "Please accept the Privacy Policy and Terms & Conditions.";
    }
    return e;
  };

  const next = () => {
    const e = check(step);
    setErrors(e);
    if (Object.keys(e).length) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goTo = (s: number) => {
    if (s < step) {
      setStep(s);
      return;
    }
    // forward only through complete steps
    for (let i = step; i < s; i++) {
      const e = check(i);
      if (Object.keys(e).length) {
        setErrors(e);
        setStep(i);
        return;
      }
    }
    setStep(s);
  };

  const pickService = (service: ServiceFormKey | "") => set({ service, categories: [], youtubeLink: "" });

  const toggleCategory = (c: string) =>
    set({ categories: form.categories.includes(c) ? form.categories.filter((x) => x !== c) : [...form.categories, c] });

  const send = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      const e = check(i);
      if (Object.keys(e).length) {
        setErrors(e);
        setStep(i);
        return;
      }
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/service-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          companyName: form.companyName,
          companyWebsite: form.companyWebsite,
          country: form.country,
          industry,
          otherIndustry: "",
          ...(isYoutube ? {} : { category: form.categories.join(", "), categories: form.categories }),
          budget: form.budget,
          timeline: form.timeline,
          youtubeLink: form.youtubeLink,
          message: form.message,
          agreed: form.agreed,
          service: form.service,
          industryPage: true,
          website: trap,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        if (json.errors && typeof json.errors === "object") {
          const errs = json.errors as Record<string, string>;
          const mapped: Errors = {};
          for (const [k, v] of Object.entries(errs)) mapped[(k === "category" ? "categories" : k) as keyof Form] = v;
          setErrors(mapped);
          setStep(Math.min(...Object.keys(errs).map((k) => STEP_OF[k] ?? 2)));
        }
        const first = json.errors ? Object.values(json.errors)[0] : json.error;
        setSubmitError(String(first || "We couldn't send your inquiry right now. Please try again."));
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) next();
    else send();
  };

  const err = (k: keyof Form) => (errors[k] ? <span className="ihf-error">{errors[k]}</span> : null);

  if (submitted) {
    return (
      <div className="ihf ihf-done" role="status">
        <span className="ihf-done-icon" aria-hidden="true">✓</span>
        <div className="ihf-title" role="heading" aria-level={2}>Thank You! Your Inquiry Has Been Received.</div>
        <div className="ihf-sub">Our team will review your details and contact you to discuss your requirements.</div>
        <div className="ihf-countdown">Returning to the form in {countdown}s…</div>
      </div>
    );
  }

  return (
    <form className="ihf" onSubmit={submit} noValidate>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} className="sef-trap" />

      <div className="ihf-head">
        <div className="ihf-title" role="heading" aria-level={2}>Send Your Inquiry!</div>
        <div className="ihf-sub">Our team will review your details and contact you to discuss your requirements.</div>
      </div>

      <ol className="ihf-steps" aria-label="Form steps">
        {STEPS.map((label, i) => (
          <li key={label} className={i === step ? "is-on" : i < step ? "is-done" : ""}>
            <button type="button" className="ihf-step" onClick={() => goTo(i)} aria-current={i === step ? "step" : undefined}>
              <span className="ihf-step-num">{i < step ? "✓" : i + 1}</span>
              <span className="ihf-step-label">{label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="ihf-body" key={step}>
        {step === 0 && (
          <>
            <div className="ihf-field">
              <label className="su-field-label" htmlFor={id("industry")}>Industry</label>
              <div className="ihf-locked" id={id("industry")} title="Fixed on this industry's page">
                <span>{industry}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </div>
            </div>
            <div className="ihf-field">
              <label className="su-field-label" htmlFor={id("service")}>Service Interested In*</label>
              <select
                id={id("service")}
                className={`su-select-input${errors.service ? " has-error" : ""}`}
                value={form.service}
                onChange={(e) => pickService(e.target.value as ServiceFormKey | "")}
              >
                <option value="">Select Service</option>
                {SERVICE_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {SERVICE_FORMS[k].label}
                  </option>
                ))}
              </select>
              {err("service")}
            </div>
            {isYoutube ? (
              <div className="ihf-field">
                <label className="su-field-label" htmlFor={id("yt")}>YouTube Video or Channel Link*</label>
                <input
                  id={id("yt")}
                  type="url"
                  className="su-text-input"
                  placeholder="https://www.youtube.com/@yourchannel"
                  value={form.youtubeLink}
                  onChange={(e) => set({ youtubeLink: e.target.value })}
                />
                {err("youtubeLink")}
              </div>
            ) : (
              form.service &&
              options.length > 0 && (
                <div className="ihf-field">
                  <div className="ihf-label-row">
                    <span className="su-field-label">Categories* <em>(choose one or more)</em></span>
                    <button
                      type="button"
                      className="ihf-link"
                      onClick={() => set({ categories: form.categories.length === options.length ? [] : [...options] })}
                    >
                      {form.categories.length === options.length ? "Clear" : "Select all"}
                    </button>
                  </div>
                  <div className="ihf-chips" role="group" aria-label="Categories">
                    {options.map((c) => {
                      const on = form.categories.includes(c);
                      return (
                        <button key={c} type="button" className={`ihf-chip${on ? " is-on" : ""}`} aria-pressed={on} onClick={() => toggleCategory(c)}>
                          {on && <span aria-hidden="true">✓</span>}
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  {err("categories")}
                </div>
              )
            )}
          </>
        )}

        {step === 1 && (
          <div className="ihf-grid">
            <div className="ihf-field">
              <label className="su-field-label" htmlFor={id("name")}>Full Name*</label>
              <input id={id("name")} className="su-text-input" placeholder="Full Name" autoComplete="name" value={form.fullName} onChange={(e) => set({ fullName: e.target.value })} />
              {err("fullName")}
            </div>
            <div className="ihf-field">
              <label className="su-field-label" htmlFor={id("email")}>Business Email*</label>
              <input id={id("email")} type="email" className="su-text-input" placeholder="Business Email" autoComplete="email" value={form.email} onChange={(e) => set({ email: e.target.value })} />
              {err("email")}
            </div>
            <div className="ihf-field">
              <label className="su-field-label" htmlFor={id("phone")}>Phone Number*</label>
              <input id={id("phone")} type="tel" className="su-text-input" placeholder="+1 (555) 000-0000" autoComplete="tel" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
              {err("phone")}
            </div>
            <div className="ihf-field">
              <label className="su-field-label" htmlFor={id("country")}>Country*</label>
              <CountrySelect id={id("country")} name="country" className="su-text-input" placeholder="Select or type country" value={form.country} onChange={(country) => set({ country })} />
              {err("country")}
            </div>
            <div className="ihf-field">
              <label className="su-field-label" htmlFor={id("company")}>Company Name</label>
              <input id={id("company")} className="su-text-input" placeholder="Company / Organization" autoComplete="organization" value={form.companyName} onChange={(e) => set({ companyName: e.target.value })} />
            </div>
            <div className="ihf-field">
              <label className="su-field-label" htmlFor={id("site")}>Company Website</label>
              <input id={id("site")} type="url" className="su-text-input" placeholder="https://example.com" value={form.companyWebsite} onChange={(e) => set({ companyWebsite: e.target.value })} />
            </div>
          </div>
        )}

        {step === 2 && (
          <>
            <div className="ihf-grid">
              <div className="ihf-field">
                <label className="su-field-label" htmlFor={id("budget")}>Estimated Project Budget*</label>
                <select id={id("budget")} className={`su-select-input${errors.budget ? " has-error" : ""}`} value={form.budget} onChange={(e) => set({ budget: e.target.value })}>
                  <option value="">Select Budget Range</option>
                  {CONTACT_BUDGETS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                {err("budget")}
              </div>
              <div className="ihf-field">
                <label className="su-field-label" htmlFor={id("timeline")}>Project Timeline*</label>
                <select id={id("timeline")} className={`su-select-input${errors.timeline ? " has-error" : ""}`} value={form.timeline} onChange={(e) => set({ timeline: e.target.value })}>
                  <option value="">Select Timeline</option>
                  {CONTACT_TIMELINES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {err("timeline")}
              </div>
            </div>
            <div className="ihf-field">
              <label className="su-field-label" htmlFor={id("message")}>Project Details</label>
              <textarea
                id={id("message")}
                rows={3}
                className="su-textarea-input"
                placeholder="Tell us about your project, goals, and requirements..."
                value={form.message}
                onChange={(e) => set({ message: e.target.value })}
              />
            </div>
            <label className={`ihf-agree${errors.agreed ? " is-error" : ""}`}>
              <input type="checkbox" checked={form.agreed} onChange={(e) => set({ agreed: e.target.checked })} />
              <span>
                By submitting this form, you agree to our <Link href="/privacy-policy">Privacy Policy</Link> and{" "}
                <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
              </span>
            </label>
            {err("agreed")}
          </>
        )}
      </div>

      {submitError && <div className="ihf-submit-error" role="alert">{submitError}</div>}

      <div className="ihf-actions">
        {step > 0 ? (
          <button type="button" className="ihf-back" onClick={() => setStep(step - 1)} disabled={submitting}>
            ← Back
          </button>
        ) : (
          <span className="ihf-progress">Step 1 of {STEPS.length}</span>
        )}
        <button type="submit" className="su-submit-btn ihf-next" disabled={submitting}>
          {step < STEPS.length - 1 ? "Next →" : submitting ? "Sending…" : "Send Inquiry"}
        </button>
      </div>
    </form>
  );
}

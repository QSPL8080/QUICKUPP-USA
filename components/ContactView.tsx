"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompanyMotion from "@/components/CompanyMotion";
import LucideIcon, { type LucideIconName } from "@/components/LucideIcon";
import { CONTACT_BUDGETS, CONTACT_SERVICES, CONTACT_TIMELINES } from "@/lib/formOptions";
import "@/app/contact.css";

/*
 * Contact page ("ct-" design). Every word comes from the supplied Contact
 * page copy; site fonts, type scale, heading gradient and black/white
 * buttons. The Calendly booking calendar and the enquiry form (saved to
 * contact_enquiries) sit in their own sections.
 */

/* Calendly booking page (event: Free 30-Minute Strategy Call) */
const CALENDLY_URL =
  "https://calendly.com/quickuppsoftechmeet/strategy-call?hide_gdpr_banner=1&hide_event_type_details=1&hide_landing_page_details=1&background_color=ffffff&text_color=0b0f17&primary_color=6366f1";

type CalendlyApi = { initInlineWidget: (o: { url: string; parentElement: HTMLElement; resize?: boolean }) => void };

const SERVICES: { title: string; text: string; icon: LucideIconName }[] = [
  {
    title: "AI-Powered Digital Marketing",
    text: "SEO, Social Media Marketing, PPC Advertising, Google Ads, Meta Ads, Content Marketing, and Lead Generation.",
    icon: "megaphone",
  },
  { title: "AI Solutions", text: "AI Automation, AI Video Creation, AI Avatars, and Business Process Automation.", icon: "bot" },
  { title: "IT Services", text: "Website Development, Web Applications, Software Development, and Technology Solutions.", icon: "code-xml" },
  { title: "BPO Services", text: "Business Process Outsourcing, Customer Support, and Operational Support.", icon: "headset" },
  { title: "Staff Augmentation", text: "Skilled professionals to support your business and technology requirements.", icon: "users" },
];

const INDUSTRIES: { label: string; icon: LucideIconName }[] = [
  { label: "Healthcare & Medical Services", icon: "heart-pulse" },
  { label: "Real Estate & Property Development", icon: "building-2" },
  { label: "Home Improvement & Interior Design", icon: "sofa" },
  { label: "E-commerce & Retail", icon: "shopping-bag" },
  { label: "Professional & Consulting Services", icon: "briefcase" },
  { label: "Financial & Business Services", icon: "chart-column" },
  { label: "Education & Training", icon: "graduation-cap" },
  { label: "Technology & SaaS", icon: "cpu" },
  { label: "Startups & Small-to-Medium Businesses", icon: "rocket" },
];

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  companyWebsite: "",
  country: "",
  service: "",
  budget: "",
  timeline: "",
  message: "",
  agreed: false,
};
type FormState = typeof EMPTY;

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M3.75 9L14.25 9M14.25 9L9 3.75M14.25 9L9 14.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Field({
  id,
  label,
  required,
  error,
  wide,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`ct-field${wide ? " ct-field-wide" : ""}${error ? " has-error" : ""}`}>
      <label htmlFor={id} className="ct-label">
        {label}
        {required && <span className="ct-req">*</span>}
      </label>
      {children}
      {error && <span className="ct-field-error">{error}</span>}
    </div>
  );
}

function InquiryForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trap, setTrap] = useState(""); // hidden spam trap

  const set =
    (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const v = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
      setForm((f) => ({ ...f, [k]: v }));
      if (errors[k]) setErrors((x) => ({ ...x, [k]: "" }));
    };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website: trap, pageUrl: window.location.href }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        if (json.errors) {
          setErrors(json.errors);
          const first = Object.keys(json.errors)[0];
          document.getElementById(`ct-${first}`)?.focus();
        } else {
          setSubmitError(json.error || "We couldn't send your inquiry right now. Please try again.");
        }
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError("We couldn't send your inquiry right now. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="ct-success" role="status">
        <span className="ct-success-icon" aria-hidden="true">
          <LucideIcon name="check" size={26} strokeWidth={2.6} />
        </span>
        <h3 className="ct-success-title">Thank You! Your Inquiry Has Been Received.</h3>
        <p className="ct-note">Our team will review your details and contact you to discuss your requirements.</p>
        <button
          type="button"
          className="ct-btn ct-btn-dark"
          onClick={() => {
            setForm(EMPTY);
            setSubmitted(false);
          }}
        >
          <span>Send Another Inquiry</span>
        </button>
      </div>
    );
  }

  return (
    <form className="ct-form" onSubmit={submit} noValidate>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={trap}
        onChange={(e) => setTrap(e.target.value)}
        className="ct-trap"
      />
      <div className="ct-grid">
        <Field id="ct-fullName" label="Full Name" required error={errors.fullName}>
          <input id="ct-fullName" className="ct-input" autoComplete="name" placeholder="Full Name" value={form.fullName} onChange={set("fullName")} />
        </Field>
        <Field id="ct-email" label="Business Email" required error={errors.email}>
          <input id="ct-email" type="email" className="ct-input" autoComplete="email" placeholder="Business Email" value={form.email} onChange={set("email")} />
        </Field>
        <Field id="ct-phone" label="Phone Number" required error={errors.phone}>
          <input id="ct-phone" type="tel" className="ct-input" autoComplete="tel" placeholder="Phone Number" value={form.phone} onChange={set("phone")} />
        </Field>
        <Field id="ct-companyName" label="Company Name" error={errors.companyName}>
          <input id="ct-companyName" className="ct-input" autoComplete="organization" placeholder="Company Name" value={form.companyName} onChange={set("companyName")} />
        </Field>
        <Field id="ct-companyWebsite" label="Company Website" error={errors.companyWebsite}>
          <input id="ct-companyWebsite" className="ct-input" autoComplete="url" placeholder="Company Website" value={form.companyWebsite} onChange={set("companyWebsite")} />
        </Field>
        <Field id="ct-country" label="Country" required error={errors.country}>
          <input id="ct-country" className="ct-input" autoComplete="country-name" placeholder="Country" value={form.country} onChange={set("country")} />
        </Field>
        <Field id="ct-service" label="Service Interested In" required error={errors.service} wide>
          <select id="ct-service" className={`ct-input ct-select${form.service ? "" : " is-empty"}`} value={form.service} onChange={set("service")}>
            <option value="" disabled>
              Service Interested In
            </option>
            {CONTACT_SERVICES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field id="ct-budget" label="Estimated Project Budget" required error={errors.budget}>
          <select id="ct-budget" className={`ct-input ct-select${form.budget ? "" : " is-empty"}`} value={form.budget} onChange={set("budget")}>
            <option value="" disabled>
              Estimated Project Budget
            </option>
            {CONTACT_BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
        <Field id="ct-timeline" label="Project Timeline" required error={errors.timeline}>
          <select id="ct-timeline" className={`ct-input ct-select${form.timeline ? "" : " is-empty"}`} value={form.timeline} onChange={set("timeline")}>
            <option value="" disabled>
              Project Timeline
            </option>
            {CONTACT_TIMELINES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field id="ct-message" label="Tell Us About Your Project / Requirements" error={errors.message} wide>
          <textarea
            id="ct-message"
            className="ct-input ct-textarea"
            rows={5}
            placeholder="Tell Us About Your Project / Requirements"
            value={form.message}
            onChange={set("message")}
          />
        </Field>
      </div>

      <label className={`ct-agree${errors.agreed ? " has-error" : ""}`}>
        <input id="ct-agreed" type="checkbox" checked={form.agreed} onChange={set("agreed")} />
        <span className="ct-agree-box" aria-hidden="true">
          <LucideIcon name="check" size={12} strokeWidth={3.2} />
        </span>
        <span className="ct-agree-text">
          By submitting this form, you agree to our <Link href="/privacy-policy">Privacy Policy</Link> and{" "}
          <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
        </span>
      </label>
      {errors.agreed && <span className="ct-field-error ct-agree-error">{errors.agreed}</span>}

      {submitError && (
        <p className="ct-alert" role="alert">
          {submitError}
        </p>
      )}

      <div className="ct-submit-row">
        <button type="submit" className="ct-btn ct-btn-dark" disabled={submitting}>
          <span>{submitting ? "Submitting…" : "Submit Your Inquiry"}</span>
          {!submitting && <Arrow />}
        </button>
        <p className="ct-note">Our team will review your details and contact you to discuss your requirements.</p>
      </div>
    </form>
  );
}

function CalendlyEmbed() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  /* Calendly reports its content height; the frame follows it */
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== "https://calendly.com" || !e.data || e.data.event !== "calendly.page_height") return;
      const h = parseInt(String(e.data.payload?.height), 10);
      if (h >= 400) setHeight(h); // ignore the tiny heights reported while loading
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <>
      <div className="su-calendly-scroll ct-cal-scroll" style={height ? ({ "--cal-h": `${height}px` } as React.CSSProperties) : undefined}>
        <div className="su-calendly-frame" ref={ref} />
      </div>
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
        onReady={() => {
          const el = ref.current;
          const api = (window as unknown as { Calendly?: CalendlyApi }).Calendly;
          if (el && api && !el.hasChildNodes()) api.initInlineWidget({ url: CALENDLY_URL, parentElement: el, resize: true });
        }}
      />
    </>
  );
}

export default function ContactView() {
  return (
    <div className="ct-page">
      <Header />
      <main>
        {/* Hero + Get in Touch */}
        <section className="ct-hero">
          <div className="ct-hero-bg" aria-hidden="true" />
          <div className="ct-container ct-hero-grid">
            <div className="ct-hero-copy">
              <nav className="ct-breadcrumb" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <span className="ct-crumb-current">Contact</span>
              </nav>
              <span className="ct-badge">
                <span className="ct-badge-dot" aria-hidden="true" />
                Your Trusted Digital Growth &amp; Technology Partner
              </span>
              <h1 className="ct-h1">
                Contact Quickupp Softech – <span className="qs-gradient-text">Let&apos;s Grow Your Business</span>
              </h1>
              <p className="ct-lead">
                Looking to grow your business, generate quality leads, strengthen your online presence, or streamline operations with technology?
              </p>
              <p className="ct-text">
                At Quickupp Softech LLC, we help businesses build, market, and scale through strategic digital marketing, AI-powered solutions, IT
                services, and business process outsourcing.
              </p>
              <p className="ct-text">
                Whether you&apos;re a startup, growing business, or established enterprise, our team is ready to understand your goals and explore the right
                solutions for your business.
              </p>
              <p className="ct-text ct-text-strong">Let&apos;s discuss how we can help you move forward.</p>
              <div className="ct-actions">
                <a href="#consultation" className="ct-btn ct-btn-dark">
                  <span>Book a Free Consultation</span>
                  <Arrow />
                </a>
                <a href="#inquiry" className="ct-btn ct-btn-light">
                  <span>Tell Us About Your Project</span>
                </a>
              </div>
            </div>

            <aside className="ct-touch" aria-labelledby="ct-touch-title">
              <h2 id="ct-touch-title" className="ct-touch-title">
                Get in Touch
              </h2>
              <p className="ct-touch-text">
                Have a project in mind or need a reliable growth partner? Connect with our team to discuss your requirements, explore our services, and
                find the right approach for your business.
              </p>
              <ul className="ct-touch-list">
                <li>
                  <a href="mailto:info@quickuppsoftech.us" className="ct-touch-row">
                    <span className="ct-touch-icon" aria-hidden="true">
                      <LucideIcon name="mail" size={18} />
                    </span>
                    <span className="ct-touch-body">
                      <span className="ct-touch-label">Email</span>
                      <span className="ct-touch-value">info@quickuppsoftech.us</span>
                    </span>
                    <span className="ct-touch-go" aria-hidden="true">
                      <LucideIcon name="arrow-up-right" size={15} strokeWidth={2.2} />
                    </span>
                  </a>
                </li>
                <li>
                  <div className="ct-touch-row">
                    <span className="ct-touch-icon" aria-hidden="true">
                      <LucideIcon name="building" size={18} />
                    </span>
                    <span className="ct-touch-body">
                      <span className="ct-touch-label">Business</span>
                      <span className="ct-touch-value">Quickupp Softech LLC</span>
                    </span>
                  </div>
                </li>
                <li>
                  <div className="ct-touch-row">
                    <span className="ct-touch-icon" aria-hidden="true">
                      <LucideIcon name="map-pin" size={18} />
                    </span>
                    <span className="ct-touch-body">
                      <span className="ct-touch-label">Office Address</span>
                      <span className="ct-touch-value">8 The Green, Suite A, Dover, Delaware 19901, USA</span>
                    </span>
                  </div>
                </li>
              </ul>
            </aside>
          </div>
        </section>

        {/* Book a Free Consultation */}
        <section id="consultation" className="ct-section">
          <div className="ct-container ct-split">
            <div className="ct-split-copy ct-sticky">
              <span className="ct-eyebrow">Book a Free Consultation</span>
              <h2 className="ct-h2">
                Let&apos;s Discuss Your <span className="qs-gradient-text">Business Growth Opportunities</span>
              </h2>
              <p className="ct-text">
                Have a project in mind or looking for expert guidance? Schedule a one-on-one consultation with our team to discuss your business goals,
                challenges, and potential solutions.
              </p>
              <p className="ct-text">
                Choose a convenient date and time, and let&apos;s explore how Quickupp Softech can help your business grow.
              </p>
            </div>
            <div className="ct-panel ct-cal">
              <CalendlyEmbed />
              <p className="ct-cal-note">
                <LucideIcon name="sparkles" size={15} />
                <span>Schedule a meeting directly with our team at a time that works for you.</span>
              </p>
            </div>
          </div>
        </section>

        {/* Tell Us About Your Project */}
        <section id="inquiry" className="ct-section ct-soft">
          <div className="ct-container ct-split">
            <div className="ct-split-copy ct-sticky">
              <span className="ct-eyebrow">Tell Us About Your Project</span>
              <h2 className="ct-h2">
                Let&apos;s Understand <span className="qs-gradient-text">Your Requirements</span>
              </h2>
              <p className="ct-text">
                Looking for digital marketing, AI solutions, IT development, or business support services? Share your requirements through the form
                below.
              </p>
              <p className="ct-text">Our team will review your inquiry and get in touch to understand your objectives and discuss the next steps.</p>
            </div>
            <div className="ct-panel ct-form-panel">
              <InquiryForm />
            </div>
          </div>
        </section>

        {/* Our Services */}
        <section className="ct-section">
          <div className="ct-container">
            <div className="ct-head">
              <h2 className="ct-h2">
                Our <span className="qs-gradient-text">Services</span>
              </h2>
              <p className="ct-text">We provide integrated business growth and technology solutions, including:</p>
            </div>
            <div className="ct-services">
              {SERVICES.map((s) => (
                <article key={s.title} className="ct-service">
                  <span className="ct-service-icon" aria-hidden="true">
                    <LucideIcon name={s.icon} size={22} />
                  </span>
                  <h3 className="ct-service-title">{s.title}</h3>
                  <p className="ct-service-text">{s.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Industries We Serve */}
        <section className="ct-section ct-soft">
          <div className="ct-container">
            <div className="ct-head">
              <h2 className="ct-h2">
                Industries <span className="qs-gradient-text">We Serve</span>
              </h2>
              <p className="ct-text">
                We work with businesses across multiple industries, helping them improve visibility, acquire customers, and scale operations.
              </p>
            </div>
            <ul className="ct-industries">
              {INDUSTRIES.map((i) => (
                <li key={i.label} className="ct-industry">
                  <span className="ct-industry-icon" aria-hidden="true">
                    <LucideIcon name={i.icon} size={19} />
                  </span>
                  <span>{i.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Let's Discuss Your Project */}
        <section className="ct-section ct-cta-sec">
          <div className="ct-container">
            <div className="ct-cta">
              <div className="ct-cta-glow" aria-hidden="true" />
              <h2 className="ct-cta-title">
                Let&apos;s Discuss <span className="qs-gradient-text">Your Project</span>
              </h2>
              <p className="ct-cta-text">
                Every business has different goals and challenges. Tell us a little about your requirements, and our team will get in touch to understand
                your needs and discuss possible solutions.
              </p>
              <p className="ct-cta-strong">Have a project ready? Let&apos;s build something that drives growth.</p>
              <div className="ct-actions ct-actions-center">
                <a href="#inquiry" className="ct-btn ct-btn-white">
                  <span>Submit Your Inquiry</span>
                  <Arrow />
                </a>
                <a href="#consultation" className="ct-btn ct-btn-ghost">
                  <span>Book a Free Consultation</span>
                </a>
              </div>
              <div className="ct-cta-sign">
                <span className="ct-cta-brand">Quickupp Softech LLC</span>
                <span className="ct-cta-tag">Your Trusted Digital Growth &amp; Technology Partner.</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <CompanyMotion seed={0} />
      <Footer />
    </div>
  );
}

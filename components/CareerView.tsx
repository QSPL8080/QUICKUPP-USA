"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CareerMotion from "@/components/CareerMotion";
import LucideIcon, { type LucideIconName } from "@/components/LucideIcon";
import type { Job } from "@/lib/jobs";
import { RESUME_ACCEPT, checkResume, fmtBytes } from "@/lib/applications";
import "@/app/career.css";

/*
 * Careers page ("cv-" design, used on no other page): three rows of team
 * photos gliding to the right beside the hero copy, a bento of benefits,
 * a deck of department slabs that open sideways, staggered value
 * tiles with monograms, a hiring track that fills as you scroll, live job openings
 * from the CRM (/crm/jobs) and a closing band with flowing gradient text.
 * Every word comes from the supplied Careers copy; site fonts, type scale,
 * heading gradient and black/white buttons.
 */

const HR_EMAIL = "hr@quickuppsoftech.us";
const mailto = (subject: string) => `mailto:${HR_EMAIL}?subject=${encodeURIComponent(subject)}`;
const APPLY_SUBJECT = "Career Application – [Your Name] – [Position]";

const BENEFITS: { title: string; text: string; icon: LucideIconName }[] = [
  { title: "Global Exposure", text: "Work with international clients and projects across different industries and markets.", icon: "globe" },
  { title: "Continuous Learning", text: "Develop your professional skills through practical experience, new technologies, and challenging assignments.", icon: "graduation-cap" },
  { title: "Innovation & Technology", text: "Explore modern technologies, AI-powered solutions, digital platforms, and emerging business opportunities.", icon: "cpu" },
  { title: "Career Development", text: "Build your expertise, take on new responsibilities, and grow with evolving business opportunities.", icon: "trending-up" },
  { title: "Collaborative Environment", text: "Work alongside professionals from different domains, exchange ideas, and achieve shared goals.", icon: "users-round" },
  { title: "Ownership & Impact", text: "Take responsibility for your work, contribute ideas, and see how your efforts create measurable outcomes.", icon: "target" },
];

const DEPARTMENTS: { title: string; text: string; label: string; roles: string[]; icon: LucideIconName }[] = [
  {
    title: "IT & Software Development",
    text: "Build innovative digital products and technology solutions for businesses worldwide.",
    label: "Career opportunities:",
    icon: "code-xml",
    roles: [
      "Full Stack Developers",
      "Frontend Developers",
      "Backend Developers",
      "Web Developers",
      "Mobile App Developers",
      "Flutter Developers",
      "UI/UX Designers",
      "Software Testers & QA Engineers",
      "DevOps & Cloud Engineers",
    ],
  },
  {
    title: "Digital Marketing & Growth",
    text: "Help businesses strengthen their online presence, acquire customers, and achieve measurable marketing results.",
    label: "Career opportunities:",
    icon: "megaphone",
    roles: [
      "Digital Marketing Executives",
      "SEO Specialists",
      "Performance Marketing Specialists",
      "Social Media Managers",
      "Content Writers",
      "Graphic Designers",
      "Video Editors",
      "PPC & Google Ads Specialists",
      "Marketing Strategists",
    ],
  },
  {
    title: "AI & Automation",
    text: "Work with emerging AI technologies to create smarter workflows, creative solutions, and business automation systems.",
    label: "Career opportunities:",
    icon: "bot",
    roles: ["AI Automation Specialists", "AI Video Creators", "AI Content Specialists", "Automation Developers", "AI Workflow Specialists"],
  },
  {
    title: "Business Development & Sales",
    text: "Connect with global businesses, understand their requirements, and create new growth opportunities.",
    label: "Career opportunities:",
    icon: "briefcase",
    roles: [
      "Business Development Executives",
      "International Sales Executives",
      "Lead Generation Specialists",
      "Appointment Setters",
      "Sales Development Representatives",
      "Client Relationship Executives",
    ],
  },
  {
    title: "BPO & Business Operations",
    text: "Support business operations through efficient processes, communication, and customer-focused services.",
    label: "Career opportunities:",
    icon: "headset",
    roles: ["Customer Support Executives", "Operations Executives", "Process Associates", "Quality Analysts", "Team Leaders"],
  },
  {
    title: "Internships & Fresh Graduates",
    text: "Start your professional journey with practical experience, mentorship, and opportunities to work on real business projects.",
    label: "Internship opportunities:",
    icon: "rocket",
    roles: [
      "Digital Marketing Intern",
      "SEO Intern",
      "Graphic Design Intern",
      "Web Development Intern",
      "Business Development Intern",
      "Social Media Intern",
      "AI & Automation Intern",
    ],
  },
];

const VALUES = [
  { title: "Integrity", text: "Doing the right thing and maintaining professional standards." },
  { title: "Accountability", text: "Taking ownership of responsibilities and outcomes." },
  { title: "Innovation", text: "Exploring better ideas, technologies, and approaches." },
  { title: "Collaboration", text: "Working together and respecting different perspectives." },
  { title: "Excellence", text: "Maintaining quality and consistency in everything we do." },
  { title: "Growth Mindset", text: "Learning from challenges and continuously developing our capabilities." },
];

const STEPS = [
  { title: "Application", text: "Submit your application with your updated resume and relevant portfolio or work samples." },
  { title: "Resume Screening", text: "Our recruitment team reviews your qualifications, experience, skills, and suitability for the role." },
  { title: "Interview & Assessment", text: "Shortlisted candidates may be invited for an interview, technical evaluation, or role-specific assessment." },
  { title: "Final Discussion", text: "We discuss the role, expectations, responsibilities, and potential opportunity." },
  { title: "Offer & Onboarding", text: "Selected candidates receive an offer and guidance through the onboarding process." },
];

/* hero photo rows (pictures only, no text), each gliding to the right */
const REEL = [
  ["contact-team-collaboration.jpg", "contact-meeting-discussion.jpg", "contact-strategy-consultation.jpg", "contact-agency-consultation.jpg"],
  ["contact-team-conference.jpg", "contact-diverse-meeting.jpg", "contact-consultation-team.jpg", "contact-consultancy-partners.jpg"],
  ["contact-tech-discussion.jpg", "contact-office-consultation.jpg", "contact-meeting-room.jpg", "contact-client-meeting-table.jpg"],
];

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M3.75 9L14.25 9M14.25 9L9 3.75M14.25 9L9 14.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const fmtDeadline = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

function Benefits() {
  return (
    <ul className="cv-benefits">
      {BENEFITS.map((b, i) => (
        <li key={b.title} className={`cv-benefit${i === 0 || i === 5 ? " is-feature" : ""}`}>
          <span className="cv-benefit-icon" aria-hidden="true">
            <LucideIcon name={b.icon} size={22} />
          </span>
          <h3 className="cv-benefit-title">{b.title}</h3>
          <p className="cv-benefit-text">{b.text}</p>
        </li>
      ))}
    </ul>
  );
}

function Departments() {
  const [active, setActive] = useState(0);
  return (
    <div className="cv-deck">
      {DEPARTMENTS.map((d, i) => {
        const on = i === active;
        const num = String(i + 1).padStart(2, "0");
        return (
          <article key={d.title} className={`cv-slab${on ? " is-active" : ""}`}>
            <button type="button" className="cv-dept-tab cv-slab-tab" aria-expanded={on} onClick={() => setActive(i)} tabIndex={on ? -1 : 0}>
              <span className="cv-slab-num">{num}</span>
              <span className="cv-slab-name">{d.title}</span>
              <span className="cv-slab-icon" aria-hidden="true">
                <LucideIcon name={d.icon} size={20} />
              </span>
            </button>
            <div className="cv-slab-body" aria-hidden={!on}>
              <span className="cv-slab-mark" aria-hidden="true">
                {num}
              </span>
              <span className="cv-dept-icon" aria-hidden="true">
                <LucideIcon name={d.icon} size={26} />
              </span>
              <h3 className="cv-dept-title">
                {i + 1}. {d.title}
              </h3>
              <p className="cv-dept-text">{d.text}</p>
              <p className="cv-dept-label">{d.label}</p>
              <ul className="cv-roles">
                {d.roles.map((r, k) => (
                  <li key={r} className="cv-role" style={{ animationDelay: `${0.25 + 0.04 * k}s` }}>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/** The hiring track fills as the section scrolls past */
function HiringTrack() {
  const ref = useRef<HTMLOListElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const start = window.innerHeight * 0.8;
      const end = window.innerHeight * 0.35;
      setP(Math.min(1, Math.max(0, (start - r.top) / Math.max(1, start - end + r.height * 0.4))));
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);
  const reached = Math.round(p * (STEPS.length - 1) + 0.3);
  return (
    <ol className="cv-track" ref={ref} style={{ "--cv-p": p } as React.CSSProperties}>
      <span className="cv-track-line" aria-hidden="true" />
      {STEPS.map((s, i) => (
        <li key={s.title} className={`cv-step${i <= reached ? " is-on" : ""}`}>
          <span className="cv-step-dot" aria-hidden="true">
            <b>{i + 1}</b>
          </span>
          <span className="cv-step-label">Step {i + 1}</span>
          <h3 className="cv-step-title">{s.title}</h3>
          <p className="cv-step-text">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

function JobCard({ job, onApply }: { job: Job; onApply: (job: Job) => void }) {
  const [open, setOpen] = useState(false);
  const meta: { label: string; value: string; icon: LucideIconName }[] = [
    { label: "Department", value: job.department, icon: "layers" },
    { label: "Employment Type", value: job.employmentType, icon: "briefcase" },
    { label: "Work Location", value: job.location, icon: "map-pin" },
    { label: "Experience Required", value: job.experience, icon: "trophy" },
  ];
  return (
    <article className={`cv-job${open ? " is-open" : ""}`}>
      <div className="cv-job-head">
        <div className="cv-job-main">
          <h3 className="cv-job-title">{job.title}</h3>
          <dl className="cv-job-meta">
            {meta.map((m) => (
              <div key={m.label} className="cv-job-fact">
                <dt>
                  <LucideIcon name={m.icon} size={14} />
                  {m.label}
                </dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="cv-job-side">
          <button type="button" className="cv-btn cv-btn-dark" onClick={() => onApply(job)}>
            <span>Apply Now</span>
            <Arrow />
          </button>
          <button type="button" className="cv-job-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? "Hide details" : "Show details"}>
            <LucideIcon name="chevron-right" size={18} strokeWidth={2.4} />
          </button>
        </div>
      </div>
      <div className="cv-job-body" hidden={!open}>
        <div className="cv-job-cols">
          <div>
            <h4 className="cv-job-h4">Key Responsibilities</h4>
            <ul className="cv-job-list">
              {job.responsibilities.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="cv-job-h4">Required Skills</h4>
            <ul className="cv-job-skills">
              {job.skills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
        {job.deadline && (
          <p className="cv-job-deadline">
            <strong>Application Deadline:</strong> {fmtDeadline(job.deadline)}
          </p>
        )}
      </div>
    </article>
  );
}

type ApplyFields = {
  fullName: string;
  email: string;
  phone: string;
  currentLocation: string;
  experience: string;
  profileUrl: string;
  coverNote: string;
};

const EMPTY_APPLY: ApplyFields = {
  fullName: "",
  email: "",
  phone: "",
  currentLocation: "",
  experience: "",
  profileUrl: "",
  coverNote: "",
};

/** Apply Now: a side sheet with the application form for one opening */
function ApplyForm({ job, onClose }: { job: Job; onClose: () => void }) {
  const [f, setF] = useState<ApplyFields>(EMPTY_APPLY);
  const [file, setFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const trapRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    sheetRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const set =
    (k: keyof ApplyFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setF((p) => ({ ...p, [k]: e.target.value }));
      if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
    };

  const pickFile = (picked: File | null) => {
    setFile(picked);
    setErrors((p) => ({ ...p, resume: picked ? checkResume(picked) : "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!f.fullName.trim()) errs.fullName = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()))
      errs.email = "Please enter a valid email address.";
    if (!/^[0-9+()\-.\s]{5,40}$/.test(f.phone.trim()))
      errs.phone = "Please enter a valid phone number.";
    if (!f.currentLocation.trim())
      errs.currentLocation = "Please enter your current location.";
    if (!f.experience.trim())
      errs.experience = "Please enter your total experience.";
    const fileErr = checkResume(file);
    if (fileErr) errs.resume = fileErr;
    if (!agreed)
      errs.agreed = "Please accept the Privacy Policy and Terms & Conditions.";
    setErrors(errs);
    setFormError("");
    if (Object.keys(errs).length) return;

    const body = new FormData();
    body.set("jobId", String(job.id));
    (Object.keys(f) as (keyof ApplyFields)[]).forEach((k) => body.set(k, f[k]));
    body.set("agreed", "true");
    body.set("pageUrl", window.location.href);
    body.set("website", trapRef.current?.value || "");
    body.set("resume", file as File);

    setSending(true);
    const res = await fetch("/api/careers/apply", {
      method: "POST",
      body,
    }).catch(() => null);
    const data = res ? await res.json().catch(() => null) : null;
    setSending(false);
    if (res?.ok && data?.ok) return setDone(true);
    if (data?.errors) setErrors(data.errors);
    setFormError(
      data?.error ||
        (data?.errors
          ? "Please check the highlighted fields."
          : "We couldn't send your application right now. Please try again."),
    );
  };

  const err = (k: string) =>
    errors[k] ? <span className="cv-apply-error">{errors[k]}</span> : null;
  const field = (
    k: keyof ApplyFields,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
    required = true,
  ) => (
    <label className={`cv-apply-field${errors[k] ? " has-error" : ""}`}>
      <span className="cv-apply-label">
        {label}
        {required && <i aria-hidden="true">*</i>}
      </span>
      <input
        className="cv-apply-input"
        value={f[k]}
        onChange={set(k)}
        {...props}
      />
      {err(k)}
    </label>
  );

  // rendered at the end of <body> so no animated parent can shift the fixed sheet
  return createPortal(
    <div className="cv-page cv-apply-portal">
      <div className="cv-apply-wrap" onClick={onClose}>
        <div
          className="cv-apply"
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Apply for ${job.title}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="cv-apply-head">
            <div>
              <span className="cv-apply-kicker">Apply Now</span>
              <h3 className="cv-apply-title">{job.title}</h3>
              <ul className="cv-apply-tags">
                <li>{job.department}</li>
                <li>{job.employmentType}</li>
                <li>{job.location}</li>
                <li>{job.experience}</li>
              </ul>
            </div>
            <button
              type="button"
              className="cv-apply-x"
              onClick={onClose}
              aria-label="Close"
            >
              <LucideIcon name="x" size={20} strokeWidth={2.2} />
            </button>
          </div>

          {done ? (
            <div className="cv-apply-done">
              <span className="cv-apply-done-icon" aria-hidden="true">
                <LucideIcon name="check" size={30} strokeWidth={2.6} />
              </span>
              <h3 className="cv-apply-title">Application sent</h3>
              <p className="cv-apply-note">
                Thank you, {f.fullName.split(" ")[0]}. Your application for{" "}
                {job.title} has reached our recruitment team. If your profile
                matches the role, we will contact you at {f.email}.
              </p>
              <button
                type="button"
                className="cv-btn cv-btn-dark"
                onClick={onClose}
              >
                <span>Close</span>
              </button>
            </div>
          ) : (
            <form className="cv-apply-form" onSubmit={submit} noValidate>
              <input
                ref={trapRef}
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="cv-apply-trap"
                aria-hidden="true"
              />
              <div className="cv-apply-grid">
                {field("fullName", "Full Name", { autoComplete: "name" })}
                {field("email", "Email Address", {
                  type: "email",
                  autoComplete: "email",
                })}
                {field("phone", "Phone Number", {
                  type: "tel",
                  autoComplete: "tel",
                })}
                {field("currentLocation", "Current Location", {
                  placeholder: "City, Country",
                  autoComplete: "address-level2",
                })}
                {field("experience", "Total Experience", {
                  placeholder: "e.g. 3 years",
                })}
                {field(
                  "profileUrl",
                  "LinkedIn / Portfolio URL",
                  { type: "url", placeholder: "https://" },
                  false,
                )}
              </div>

              <label
                className={`cv-apply-drop${file ? " has-file" : ""}${errors.resume ? " has-error" : ""}`}
              >
                <input
                  type="file"
                  accept={RESUME_ACCEPT}
                  onChange={(e) => pickFile(e.target.files?.[0] || null)}
                />
                <span className="cv-apply-drop-icon" aria-hidden="true">
                  <LucideIcon name={file ? "file-check" : "upload"} size={22} />
                </span>
                <span className="cv-apply-drop-text">
                  <strong>{file ? file.name : "Upload your resume"}</strong>
                  <span>
                    {file
                      ? `${fmtBytes(file.size)} · click to change`
                      : "PDF, DOC or DOCX · up to 5 MB"}
                  </span>
                </span>
                <i className="cv-apply-req" aria-hidden="true">
                  *
                </i>
              </label>
              {err("resume")}

              <label className="cv-apply-field">
                <span className="cv-apply-label">Cover Note</span>
                <textarea
                  className="cv-apply-input cv-apply-textarea"
                  rows={4}
                  value={f.coverNote}
                  onChange={set("coverNote")}
                  placeholder="Tell us briefly why you're a good fit for this role"
                />
              </label>

              <label
                className={`cv-apply-agree${errors.agreed ? " has-error" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    setErrors((p) => ({ ...p, agreed: "" }));
                  }}
                />
                <span>
                  I agree to the{" "}
                  <Link href="/privacy-policy" target="_blank">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/terms-and-conditions" target="_blank">
                    Terms &amp; Conditions
                  </Link>
                  .
                </span>
              </label>
              {err("agreed")}

              {formError && (
                <p className="cv-apply-alert" role="alert">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="cv-btn cv-btn-dark cv-apply-submit"
                disabled={sending}
              >
                <span>{sending ? "Sending…" : "Submit Application"}</span>
                {!sending && <Arrow />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Openings({ jobs }: { jobs: Job[] }) {
  const depts = Array.from(new Set(jobs.map((j) => j.department)));
  const [filter, setFilter] = useState<string>("");
  const shown = filter ? jobs.filter((j) => j.department === filter) : jobs;
  const [applying, setApplying] = useState<Job | null>(null);
  return (
    <div className="cv-openings">
      {applying && <ApplyForm job={applying} onClose={() => setApplying(null)} />}
      {depts.length > 1 && (
        <div className="cv-filter" role="group" aria-label="Filter by department">
          <button type="button" className={`cv-filter-chip${!filter ? " is-on" : ""}`} onClick={() => setFilter("")}>
            All
            <span className="cv-filter-count">{jobs.length}</span>
          </button>
          {depts.map((d) => (
            <button key={d} type="button" className={`cv-filter-chip${filter === d ? " is-on" : ""}`} onClick={() => setFilter(d)}>
              {d}
              <span className="cv-filter-count">{jobs.filter((j) => j.department === d).length}</span>
            </button>
          ))}
        </div>
      )}
      <div className="cv-jobs">
        {shown.map((j) => (
          <JobCard key={j.id} job={j} onApply={setApplying} />
        ))}
      </div>
    </div>
  );
}

export default function CareerView({ jobs }: { jobs: Job[] }) {
  return (
    <div className="cv-page">
      <Header />
      <main>
        {/* Hero: copy beside three rows of team photos gliding to the right */}
        <section className="cv-hero">
          <div className="cv-container cv-hero-grid">
            <div className="cv-hero-copy">
              <nav className="cv-breadcrumb" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <span className="cv-crumb-current">Careers</span>
              </nav>
              <p className="cv-motto">
                <span>Driven by Passion.</span>
                <i aria-hidden="true" />
                <span>Defined by Impact.</span>
              </p>
              <h1 className="cv-h1">
                Careers at Quickupp Softech – <span className="qs-gradient-text">Build Your Future With Us</span>
              </h1>
              <p className="cv-lead">
                At Quickupp Softech, we believe great companies are built by ambitious people who challenge possibilities, embrace innovation, and turn
                ideas into meaningful outcomes.
              </p>
              <p className="cv-text">
                We are a growing global technology and digital growth company working across IT services, digital marketing, AI-powered solutions, and
                business process outsourcing.
              </p>
              <p className="cv-text">
                We&apos;re always looking for talented individuals who are passionate about their work, eager to learn, and ready to make an impact.
              </p>
              <p className="cv-kinetic">
                <span>Your skills.</span> <span>Your ambition.</span> <span>Your next opportunity.</span> <span>Let&apos;s grow together.</span>
              </p>
              <div className="cv-actions">
                <a href="#openings" className="cv-btn cv-btn-dark">
                  <span>Explore Open Positions</span>
                  <Arrow />
                </a>
                <a href={mailto(APPLY_SUBJECT)} className="cv-btn cv-btn-light">
                  <span>Apply Now</span>
                </a>
              </div>
            </div>

            <div className="cv-reel" aria-hidden="true">
              {REEL.map((row, ri) => (
                <div key={ri} className={`cv-reel-row cv-reel-row-${ri + 1}`}>
                  <div className="cv-reel-track">
                    {[...row, ...row].map((src, i) => (
                      <img key={i} src={`/images/${src}`} alt="" loading={i < 4 ? "eager" : "lazy"} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Build a Career That Moves You Forward */}
        <section className="cv-section">
          <div className="cv-container cv-forward">
            <div className="cv-forward-head">
              <h2 className="cv-h2">
                Build a Career That <span className="qs-gradient-text">Moves You Forward</span>
              </h2>
            </div>
            <div className="cv-forward-copy">
              <p className="cv-text">
                At Quickupp Softech, your career is more than just a job title. It&apos;s an opportunity to work on meaningful projects, develop professional
                expertise, collaborate with talented people, and contribute to the growth of businesses across global markets.
              </p>
              <p className="cv-text">
                Whether you&apos;re an experienced professional, a recent graduate, or someone looking to begin their career through an internship, we offer
                opportunities to learn, contribute, and grow.
              </p>
              <p className="cv-quote">We value people who take initiative, think creatively, solve problems, and are committed to continuous improvement.</p>
            </div>
          </div>
        </section>

        {/* Why Work With Quickupp Softech? */}
        <section className="cv-section cv-mist">
          <div className="cv-container">
            <div className="cv-head">
              <span className="cv-kicker">A Workplace Built for Growth</span>
              <h2 className="cv-h2">
                Why Work With <span className="qs-gradient-text">Quickupp Softech?</span>
              </h2>
            </div>
            <Benefits />
          </div>
        </section>

        {/* Explore Career Opportunities */}
        <section className="cv-section">
          <div className="cv-container">
            <div className="cv-head cv-head-left">
              <h2 className="cv-h2">
                Explore Career <span className="qs-gradient-text">Opportunities</span>
              </h2>
              <p className="cv-text">We offer opportunities across multiple departments and professional domains.</p>
            </div>
            <Departments />
          </div>
        </section>

        {/* Our Work Culture */}
        <section className="cv-section cv-culture">
          <div className="cv-container">
            <div className="cv-head">
              <span className="cv-kicker">Think Big. Take Ownership. Grow Together.</span>
              <h2 className="cv-h2">
                Our Work <span className="qs-gradient-text">Culture</span>
              </h2>
              <p className="cv-text">
                We believe in creating an environment where people are encouraged to think independently, share ideas, take responsibility, and
                continuously improve.
              </p>
              <p className="cv-value-intro">At Quickupp Softech, we value:</p>
            </div>
            <ul className="cv-values">
              {VALUES.map((v) => (
                <li key={v.title} className="cv-value">
                  <span className="cv-value-mono" aria-hidden="true">
                    {v.title.charAt(0)}
                  </span>
                  <h3 className="cv-value-title">{v.title}</h3>
                  <p className="cv-value-text">{v.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Our Hiring Process */}
        <section className="cv-section cv-mist">
          <div className="cv-container">
            <div className="cv-head">
              <h2 className="cv-h2">
                Our Hiring <span className="qs-gradient-text">Process</span>
              </h2>
              <p className="cv-text">We aim to keep our recruitment process structured, transparent, and focused on identifying the right talent.</p>
            </div>
            <HiringTrack />
          </div>
        </section>

        {/* Current Job Openings */}
        <section id="openings" className="cv-section">
          <div className="cv-container">
            <div className="cv-head cv-head-left cv-open-head">
              <span className="cv-kicker">Find Your Next Opportunity</span>
              <h2 className="cv-h2">
                Current Job <span className="qs-gradient-text">Openings</span>
              </h2>
              <p className="cv-text">Explore our latest full-time, part-time, and internship opportunities across different departments.</p>
              <p className="cv-text">
                Each opening includes the job description, required skills, experience level, work location, employment type, and application
                instructions.
              </p>
            </div>
            {jobs.length > 0 && <Openings jobs={jobs} />}
            <p className={`cv-open-note${jobs.length ? "" : " is-empty"}`}>
              <LucideIcon name="sparkles" size={18} />
              <span>
                Don&apos;t see a suitable opening? You can still share your profile with our recruitment team for future opportunities.
              </span>
            </p>
          </div>
        </section>

        {/* Don't See the Right Role? */}
        <section id="connect" className="cv-section cv-connect-sec">
          <div className="cv-container">
            <div className="cv-connect">
              <div className="cv-connect-copy">
                <h2 className="cv-connect-title">
                  Don&apos;t See the Right Role? <span className="qs-gradient-text">Connect With Us.</span>
                </h2>
                <p className="cv-connect-text">
                  We are always interested in connecting with talented professionals who share our passion for technology, innovation, and business
                  growth.
                </p>
                <p className="cv-connect-text">
                  Send us your resume, portfolio, and a brief introduction about yourself. If a suitable opportunity becomes available, our recruitment team
                  can consider your profile.
                </p>
              </div>
              <div className="cv-envelope">
                <div className="cv-envelope-row">
                  <span className="cv-envelope-label">Email:</span>
                  <a href={`mailto:${HR_EMAIL}`} className="cv-envelope-value">
                    {HR_EMAIL}
                  </a>
                </div>
                <div className="cv-envelope-row">
                  <span className="cv-envelope-label">Subject:</span>
                  <span className="cv-envelope-value">{APPLY_SUBJECT}</span>
                </div>
                <a href={mailto(APPLY_SUBJECT)} className="cv-btn cv-btn-white cv-envelope-btn">
                  <span>Send Your Resume</span>
                  <Arrow />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Start Your Journey: the copy beside three words that light up in turn */}
        <section className="cv-section cv-journey">
          <div className="cv-container cv-journey-grid">
            <div className="cv-journey-copy">
              <h2 className="cv-h2">
                Start Your Journey With <span className="qs-gradient-text">Quickupp Softech</span>
              </h2>
              <p className="cv-text">Your next career opportunity could be the beginning of something extraordinary.</p>
              <p className="cv-text">
                If you&apos;re ambitious, motivated, and ready to contribute to a growing global organization, we&apos;d love to hear from you.
              </p>
              <p className="cv-journey-strong">Let&apos;s build, innovate, and grow together.</p>
            </div>

            <div className="cv-words">
              <span className="cv-journey-brand">Quickupp Softech LLC</span>
              <p className="cv-words-list" aria-label="Technology. Innovation. Growth.">
                <span>Technology.</span>
                <span>Innovation.</span>
                <span>Growth.</span>
              </p>
            </div>
          </div>
        </section>
      </main>
      <CareerMotion />
      <Footer />
    </div>
  );
}

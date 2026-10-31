"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CareerMotion from "@/components/CareerMotion";
import LucideIcon, { type LucideIconName } from "@/components/LucideIcon";
import type { Job } from "@/lib/jobs";
import "@/app/career.css";

/*
 * Careers page ("cv-" design, used on no other page): an arched photo
 * window in the hero, benefit cards, a department switcher, staggered value
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
      {BENEFITS.map((b) => (
        <li key={b.title} className="cv-benefit">
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
  const d = DEPARTMENTS[active];
  return (
    <div className="cv-dept">
      <div className="cv-dept-tabs" role="tablist" aria-label="Departments">
        {DEPARTMENTS.map((dep, i) => (
          <button
            key={dep.title}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`cv-dept-tab${i === active ? " is-active" : ""}`}
            onClick={() => setActive(i)}
          >
            <span className="cv-dept-num">{i + 1}.</span>
            <span className="cv-dept-name">{dep.title}</span>
            <span className="cv-dept-go" aria-hidden="true">
              <LucideIcon name="arrow-right" size={16} strokeWidth={2.2} />
            </span>
          </button>
        ))}
      </div>
      <div className="cv-dept-panel" role="tabpanel" key={d.title}>
        <span className="cv-dept-icon" aria-hidden="true">
          <LucideIcon name={d.icon} size={26} />
        </span>
        <h3 className="cv-dept-title">
          {active + 1}. {d.title}
        </h3>
        <p className="cv-dept-text">{d.text}</p>
        <p className="cv-dept-label">{d.label}</p>
        <ul className="cv-roles">
          {d.roles.map((r, i) => (
            <li key={r} className="cv-role" style={{ animationDelay: `${0.05 * i}s` }}>
              {r}
            </li>
          ))}
        </ul>
      </div>
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

function JobCard({ job }: { job: Job }) {
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
          <a href={mailto(`Career Application – [Your Name] – ${job.title}`)} className="cv-btn cv-btn-dark">
            <span>Apply Now</span>
            <Arrow />
          </a>
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

function Openings({ jobs }: { jobs: Job[] }) {
  const depts = Array.from(new Set(jobs.map((j) => j.department)));
  const [filter, setFilter] = useState<string>("");
  const shown = filter ? jobs.filter((j) => j.department === filter) : jobs;
  return (
    <div className="cv-openings">
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
          <JobCard key={j.id} job={j} />
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
        {/* Hero: copy beside an arched photo window */}
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

            <div className="cv-arch-wrap">
              <span className="cv-arch-orbit" aria-hidden="true" />
              <div className="cv-arch">
                <img src="/images/contact-team-collaboration.jpg" alt="Team members working together at laptops" />
              </div>
              <div className="cv-arch-mini">
                <img src="/images/contact-team-conference.jpg" alt="" aria-hidden="true" />
              </div>
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

        {/* Start Your Journey */}
        <section className="cv-section cv-journey">
          <div className="cv-container cv-journey-inner">
            <h2 className="cv-h2">
              Start Your Journey With <span className="qs-gradient-text">Quickupp Softech</span>
            </h2>
            <p className="cv-text">Your next career opportunity could be the beginning of something extraordinary.</p>
            <p className="cv-text">
              If you&apos;re ambitious, motivated, and ready to contribute to a growing global organization, we&apos;d love to hear from you.
            </p>
            <p className="cv-journey-strong">Let&apos;s build, innovate, and grow together.</p>
            <div className="cv-journey-sign">
              <span className="cv-journey-brand">Quickupp Softech LLC</span>
              <span className="cv-journey-tag">Technology. Innovation. Growth.</span>
            </div>
          </div>
        </section>
      </main>
      <CareerMotion />
      <Footer />
    </div>
  );
}

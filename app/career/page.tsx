"use client";

import React, { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Role {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  salary: string;
  desc: string;
  tags: string[];
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

const openRolesData: Role[] = [
  {
    id: "fullstack-dev",
    title: "Senior Full-Stack Engineer (Next.js / Node.js)",
    department: "Engineering",
    type: "Full-Time / Remote",
    location: "Global / USA / India",
    salary: "$90,000 - $140,000 / yr",
    desc: "Architect, build, and deploy high-performance web applications, headless commerce systems, and scalable APIs using Next.js 15, TypeScript, Tailwind, and modern cloud infrastructure.",
    tags: ["Next.js 15", "TypeScript", "React", "Node.js", "Tailwind CSS", "GraphQL", "PostgreSQL", "AWS"],
    responsibilities: [
      "Lead the architecture and implementation of scalable web applications for enterprise clients.",
      "Optimize Core Web Vitals, page rendering performance, and server-side rendering pipelines.",
      "Collaborate with UI/UX designers to translate Figma prototypes into pixel-perfect, accessible components.",
      "Mentor junior engineers and champion code quality, automated testing, and CI/CD best practices.",
    ],
    requirements: [
      "5+ years of full-stack engineering experience with React, Next.js, and TypeScript.",
      "Deep understanding of serverless architecture, Edge computing, and state management.",
      "Proven track record of shipping production-grade applications with high traffic volumes.",
      "Strong communication skills and comfortable working asynchronously in a distributed team.",
    ],
    benefits: [
      "100% remote freedom with flexible working hours.",
      "$1,500 annual personal learning & conference grant.",
      "Top-tier MacBook Pro and home-office equipment budget.",
      "Comprehensive global healthcare and wellness stipends.",
    ],
  },
  {
    id: "ai-engineer",
    title: "AI & Automation Solutions Architect",
    department: "AI Solutions",
    type: "Full-Time / Remote",
    location: "Global / USA / India",
    salary: "$95,000 - $150,000 / yr",
    desc: "Design and implement autonomous multi-agent systems, intelligent CRM workflows, WhatsApp lead bots, and LLM-powered lead qualification pipelines.",
    tags: ["Python", "LangChain", "OpenAI / Claude API", "Make / n8n", "FastAPI", "Vector DBs", "RAG Systems"],
    responsibilities: [
      "Build custom autonomous AI agents, Retrieval-Augmented Generation (RAG) pipelines, and LLM fine-tuning workflows.",
      "Integrate automated CRM pipelines across HubSpot, Salesforce, WhatsApp Business API, and telephony providers.",
      "Benchmark model latencies, token economics, and response quality for production deployments.",
      "Conduct technical discovery with enterprise clients to architect end-to-end automation roadmaps.",
    ],
    requirements: [
      "3+ years building and deploying AI applications, LLM agents, or automated enterprise integrations.",
      "Fluency in Python, FastAPI, TypeScript, and modern vector databases (Pinecone, Weaviate, pgvector).",
      "Hands-on experience with orchestration frameworks like LangChain, LlamaIndex, or AutoGen.",
      "Strong problem-solving instincts with an eye for operational efficiency.",
    ],
    benefits: [
      "Full access to OpenAI, Anthropic, Midjourney, and top-tier AI compute infrastructure.",
      "100% remote work policy across all global timezones.",
      "Performance-based bonuses tied directly to client automation ROI.",
      "Generous paid time off and flexible scheduling.",
    ],
  },
  {
    id: "perf-marketing",
    title: "Performance Marketing Lead (Google & Meta)",
    department: "Digital Marketing",
    type: "Full-Time / Remote",
    location: "Global / USA / India",
    salary: "$80,000 - $125,000 / yr",
    desc: "Manage high-budget multi-channel paid acquisition campaigns across Google Search, Performance Max, Meta Ads, and LinkedIn, focusing on ROAS, CAC reduction, and CRO.",
    tags: ["Google Ads", "Meta Ads", "LinkedIn Ads", "ROAS Optimization", "GA4 / GTM", "A/B Testing", "CRO"],
    responsibilities: [
      "Manage $100k+ monthly paid ad budgets across Google, Meta, and LinkedIn with strict CAC/ROAS targets.",
      "Develop data-driven ad creatives, copy hooks, and landing page conversion experiments.",
      "Implement server-side tracking, Conversions API (CAPI), and attribution modeling in GA4.",
      "Deliver weekly executive performance reports with actionable growth recommendations.",
    ],
    requirements: [
      "4+ years managing performance marketing campaigns for B2B SaaS, healthcare, or e-commerce.",
      "Demonstrated history of scaling ad spend profitably while maintaining strict CPA thresholds.",
      "Mastery of Google Ads Manager, Meta Ads Manager, GA4, Looker Studio, and Google Tag Manager.",
      "Strong analytical mindset with deep statistical understanding of A/B split testing.",
    ],
    benefits: [
      "Direct profit-share and milestone bonuses on ad performance.",
      "Flexible asynchronous work schedule.",
      "Access to premium creative design teams and video editors for rapid ad iteration.",
      "Continuous training on AI-assisted media buying.",
    ],
  },
  {
    id: "seo-strategist",
    title: "SEO & AI Search Strategist (AEO / GEO)",
    department: "Organic Growth",
    type: "Full-Time / Remote",
    location: "Global / USA / India",
    salary: "$75,000 - $115,000 / yr",
    desc: "Pioneer modern entity-based search architecture, technical SEO, Generative Engine Optimization (GEO), and answer-engine visibility for hyper-growth brands.",
    tags: ["Generative Engine Optimization", "Technical SEO", "Schema.org", "Content Architecture", "Ahrefs", "Semrush"],
    responsibilities: [
      "Develop comprehensive organic search roadmaps optimized for Google, ChatGPT Search, Perplexity, and Gemini.",
      "Execute deep technical audits covering Core Web Vitals, crawl budgets, schema markup, and site migrations.",
      "Lead programmatic SEO and topical authority clustering strategies.",
      "Track answer-engine citations and build high-authority digital PR backlink profiles.",
    ],
    requirements: [
      "3+ years of proven organic search growth experience in competitive niches.",
      "Deep understanding of entity search, semantic vector search, and Answer Engine Optimization (AEO).",
      "Proficiency with Screaming Frog, Ahrefs, Semrush, Google Search Console, and Schema markup.",
      "Excellent technical writing and structured data comprehension.",
    ],
    benefits: [
      "100% remote independence.",
      "Access to the latest proprietary AI content analysis tools.",
      "Budget for international SEO summits and digital marketing events.",
      "Comprehensive global wellness package.",
    ],
  },
  {
    id: "uiux-designer",
    title: "Lead UI/UX & Design Systems Specialist",
    department: "Design",
    type: "Full-Time / Remote",
    location: "Global / USA / India",
    salary: "$85,000 - $130,000 / yr",
    desc: "Craft award-winning digital experiences, micro-interactions, responsive design systems, and conversion-optimized interfaces in Figma and Webflow.",
    tags: ["Figma", "Design Systems", "Webflow", "Micro-Interactions", "Wireframing", "User Research", "Prototyping"],
    responsibilities: [
      "Design modern, high-converting web and mobile user interfaces from initial wireframes to production handoff.",
      "Maintain and evolve a unified design system with reusable component libraries and design tokens.",
      "Conduct user research, heat map analysis, and usability testing to eliminate conversion friction.",
      "Collaborate closely with front-end engineers to ensure flawless fidelity and animations in code.",
    ],
    requirements: [
      "4+ years of product/web design experience with a standout portfolio of live work.",
      "Mastery of Figma (auto-layout, variables, component properties, and interactive prototypes).",
      "Strong understanding of modern web capabilities (CSS animations, glassmorphism, responsive grids).",
      "Bonus: Hands-on experience with Webflow or Framer development.",
    ],
    benefits: [
      "Creative freedom to design world-class, award-winning aesthetics.",
      "Latest Apple hardware and Figma Organization seat.",
      "Flexible schedule with zero unnecessary meetings.",
      "Annual conference and design workshop stipend.",
    ],
  },
  {
    id: "qa-engineer",
    title: "QA Automation & Reliability Engineer",
    department: "Engineering",
    type: "Full-Time / Remote",
    location: "Global / USA / India",
    salary: "$70,000 - $110,000 / yr",
    desc: "Ensure enterprise software resilience, automated end-to-end testing, security audits, and cross-platform reliability across all client deliverables.",
    tags: ["Playwright", "Cypress", "Jest", "TypeScript", "CI/CD GitHub Actions", "API Testing", "Postman"],
    responsibilities: [
      "Build and maintain automated end-to-end, integration, and unit testing suites using Playwright and Jest.",
      "Integrate automated test passes into CI/CD deployment pipelines on GitHub Actions and Vercel.",
      "Perform cross-browser, responsive, and performance regression testing for client deployments.",
      "Document test plans, reproduce edge-case bugs, and verify hotfixes with engineering teams.",
    ],
    requirements: [
      "3+ years experience in automated QA testing for complex web applications.",
      "Proficiency with JavaScript/TypeScript, Playwright, Cypress, and REST API testing tools.",
      "Familiarity with web accessibility (WCAG 2.1 AA) and performance testing tools (Lighthouse, k6).",
      "Meticulous attention to detail and strong written communication.",
    ],
    benefits: [
      "100% remote workspace.",
      "Comprehensive health, vision, and dental coverage.",
      "Equipment grant and continuous learning support.",
      "Clear career progression towards QA Lead / DevSecOps.",
    ],
  },
];

const compactPerksData = [
  {
    title: "100% Remote-First",
    desc: "Work flexibly from anywhere across all global timezones.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    title: "AI-Powered Stack",
    desc: "Full OpenAI, Claude 3.5, Cursor, and enterprise AI tools provided.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    title: "$1,500/yr Grant",
    desc: "Annual stipend for courses, books, and global tech conferences.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M6 6h10" />
        <path d="M6 10h10" />
      </svg>
    ),
  },
  {
    title: "High Ownership",
    desc: "Autonomous agile squads with zero corporate red tape.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

const departments = [
  "All Open Roles",
  "Engineering",
  "AI Solutions",
  "Digital Marketing",
  "Organic Growth",
  "Design",
];

export default function CareerPage() {
  const [activeDept, setActiveDept] = useState("All Open Roles");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [appliedRoleTitle, setAppliedRoleTitle] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Application form state
  const [applicantData, setApplicantData] = useState({
    name: "",
    email: "",
    phone: "",
    portfolio: "",
    experience: "3-5 years",
    notes: "",
  });

  const filteredRoles = useMemo(() => {
    return openRolesData.filter((role) => {
      const matchesDept =
        activeDept === "All Open Roles" || role.department === activeDept;
      const matchesSearch =
        searchQuery.trim() === "" ||
        role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesDept && matchesSearch;
    });
  }, [activeDept, searchQuery]);

  const handleOpenRoleModal = (role: Role) => {
    setSelectedRole(role);
  };

  const handleStartApply = (roleTitle: string) => {
    setAppliedRoleTitle(roleTitle);
    setShowApplyModal(true);
    setFormSubmitted(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="qs-trendy-page">
      <Header />

      {/* 1. COMPACT CULTURE & PERKS STRIP */}
      <section className="qs-career-top-wrap">
        <div className="w-layout-blockcontainer container w-container">
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 28px" }}>
            <div className="qs-trendy-badge">
              <span className="qs-trendy-dot" />
              Life At Quickupp
            </div>
            <h1 style={{ fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 800, color: "#0f172a", marginBottom: "8px", letterSpacing: "-0.02em" }}>
              Why Innovators <span className="qs-gradient-span">Love Working Here</span>
            </h1>
            <p style={{ fontSize: "14.5px", color: "#64748b", margin: 0, lineHeight: 1.55 }}>
              A remote-first engineering and growth culture where you do high-impact work with full autonomy.
            </p>
          </div>

          <div className="qs-compact-perks-grid">
            {compactPerksData.map((perk, i) => (
              <div key={i} className="qs-compact-perk-card">
                <div className="qs-compact-perk-top">
                  <div className="qs-compact-perk-icon">{perk.icon}</div>
                  <h3 className="qs-compact-perk-title">{perk.title}</h3>
                </div>
                <p className="qs-compact-perk-desc">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. TRENDY OPENINGS SECTION */}
      <section className="qs-openings-section">
        <div className="w-layout-blockcontainer container w-container">
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 24px" }}>
            <div className="qs-trendy-badge">
              <span className="qs-trendy-dot" />
              Current Openings ({filteredRoles.length})
            </div>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 800, color: "#0f172a", marginBottom: "6px", letterSpacing: "-0.02em" }}>
              Find Your Next Role
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
              Explore our current engineering, AI, marketing, and design opportunities.
            </p>
          </div>

          {/* Department Filter Bar */}
          <div className="qs-roles-filter-bar">
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                className={"qs-service-pill-btn " + (activeDept === dept ? "selected" : "")}
                onClick={() => setActiveDept(dept)}
              >
                <span>{dept}</span>
                {dept === "All Open Roles" ? (
                  <span style={{ fontSize: "10.5px", opacity: 0.7 }}>({openRolesData.length})</span>
                ) : (
                  <span style={{ fontSize: "10.5px", opacity: 0.7 }}>
                    ({openRolesData.filter((r) => r.department === dept).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="qs-search-filter-box">
            <div className="qs-search-icon-pos">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by role or keyword (e.g. Next.js, AI, Ads, Figma)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="qs-search-filter-input"
            />
          </div>

          {/* Trendy Compact Roles List */}
          <div className="qs-roles-list">
            {filteredRoles.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 20px",
                  background: "#f8fafc",
                  borderRadius: "18px",
                  border: "1px dashed #cbd5e1",
                }}
              >
                <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
                  No exact matches found
                </h3>
                <p style={{ fontSize: "13.5px", color: "#64748b", marginBottom: "16px" }}>
                  We couldn&apos;t find an open role matching &ldquo;{searchQuery}&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveDept("All Open Roles");
                  }}
                  className="qs-view-detail-btn"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredRoles.map((role) => (
                <div
                  key={role.id}
                  className="qs-role-card-compact"
                  onClick={() => handleOpenRoleModal(role)}
                >
                  <div>
                    <div className="qs-role-meta-row">
                      <span className="qs-role-dept-tag">
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#7c3aed" }} />
                        {role.department}
                      </span>
                      <span className="qs-role-sub-pill">{role.type}</span>
                      <span className="qs-role-sub-pill">{role.location}</span>
                      <span className="qs-role-salary-pill">{role.salary}</span>
                    </div>

                    <h3 className="qs-role-heading-compact">{role.title}</h3>
                    <p className="qs-role-summary-compact">{role.desc}</p>

                    <div className="qs-tech-tags-strip">
                      {role.tags.slice(0, 5).map((tag) => (
                        <span key={tag} className="qs-tech-tag-mini">
                          {tag}
                        </span>
                      ))}
                      {role.tags.length > 5 && (
                        <span className="qs-tech-tag-mini" style={{ color: "#7c3aed", fontWeight: 700 }}>
                          +{role.tags.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="qs-role-action-area"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleStartApply(role.title)}
                      className="qs-apply-action-btn"
                    >
                      <span>Apply for Role</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenRoleModal(role)}
                      className="qs-view-detail-btn"
                    >
                      <span>Details</span>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 3. COMPACT 4-STEP HIRING ROADMAP */}
      <section className="qs-compact-hiring-sec">
        <div className="w-layout-blockcontainer container w-container">
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 32px" }}>
            <div className="qs-trendy-badge">
              <span className="qs-trendy-dot" />
              Simple &amp; Transparent
            </div>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 800, color: "#0f172a", marginBottom: "6px", letterSpacing: "-0.02em" }}>
              Our 4-Step Hiring Process
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
              We value your time. Quick turnaround from application to offer.
            </p>
          </div>

          <div className="qs-hiring-grid-compact">
            <div className="qs-hiring-card-compact">
              <span className="qs-hiring-step-tag">01 / REVIEW</span>
              <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
                Portfolio Review
              </h4>
              <p style={{ fontSize: "13px", lineHeight: 1.5, color: "#64748b", margin: 0 }}>
                We review your resume and past projects within 48 hours.
              </p>
            </div>

            <div className="qs-hiring-card-compact">
              <span className="qs-hiring-step-tag">02 / DISCOVERY</span>
              <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
                Culture &amp; Fit Chat
              </h4>
              <p style={{ fontSize: "13px", lineHeight: 1.5, color: "#64748b", margin: 0 }}>
                A 30-minute informal conversation about aspirations and fit.
              </p>
            </div>

            <div className="qs-hiring-card-compact">
              <span className="qs-hiring-step-tag">03 / PRACTICAL</span>
              <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
                Technical Review
              </h4>
              <p style={{ fontSize: "13px", lineHeight: 1.5, color: "#64748b", margin: 0 }}>
                A concise real-world discussion—never unpaid take-home work.
              </p>
            </div>

            <div className="qs-hiring-card-compact">
              <span className="qs-hiring-step-tag">04 / WELCOME</span>
              <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
                Offer &amp; Onboarding
              </h4>
              <p style={{ fontSize: "13px", lineHeight: 1.5, color: "#64748b", margin: 0 }}>
                Competitive offer, equipment setup, and team welcome.
              </p>
            </div>
          </div>
        </div>
      </section>

{/* ==========================================================================
          ROLE DETAIL MODAL
          ========================================================================== */}
      {selectedRole && (
        <div
          className="qs-career-modal-backdrop"
          onClick={() => setSelectedRole(null)}
        >
          <div
            className="qs-career-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="qs-career-modal-header">
              <div>
                <div className="qs-role-meta-row" style={{ marginBottom: "6px" }}>
                  <span className="qs-role-dept-tag">{selectedRole.department}</span>
                  <span className="qs-role-sub-pill">{selectedRole.type}</span>
                  <span className="qs-role-salary-pill">{selectedRole.salary}</span>
                </div>
                <h3 style={{ fontSize: "19px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  {selectedRole.title}
                </h3>
              </div>
              <button
                type="button"
                className="qs-career-modal-close"
                onClick={() => setSelectedRole(null)}
              >
                ✕
              </button>
            </div>

            <div className="qs-career-modal-body">
              <p style={{ fontSize: "14px", lineHeight: 1.65, color: "#475569", marginBottom: "20px" }}>
                {selectedRole.desc}
              </p>

              <h4 className="qs-modal-section-title">Key Responsibilities</h4>
              <ul className="qs-modal-list">
                {selectedRole.responsibilities.map((resp, i) => (
                  <li key={i} className="qs-modal-list-item">
                    <span className="qs-modal-bullet">✓</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>

              <h4 className="qs-modal-section-title">What We&apos;re Looking For</h4>
              <ul className="qs-modal-list">
                {selectedRole.requirements.map((req, i) => (
                  <li key={i} className="qs-modal-list-item">
                    <span className="qs-modal-bullet">✓</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>

              <h4 className="qs-modal-section-title">What We Offer</h4>
              <ul className="qs-modal-list">
                {selectedRole.benefits.map((ben, i) => (
                  <li key={i} className="qs-modal-list-item">
                    <span className="qs-modal-bullet">✓</span>
                    <span>{ben}</span>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => {
                    const title = selectedRole.title;
                    setSelectedRole(null);
                    handleStartApply(title);
                  }}
                  className="qs-apply-action-btn"
                  style={{ width: "100%", justifyContent: "center", padding: "14px 24px", fontSize: "14.5px" }}
                >
                  <span>Apply for this Role Now</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          QUICK APPLICATION MODAL
          ========================================================================== */}
      {showApplyModal && (
        <div
          className="qs-career-modal-backdrop"
          onClick={() => setShowApplyModal(false)}
        >
          <div
            className="qs-career-modal-dialog"
            style={{ maxWidth: "580px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="qs-career-modal-header">
              <div>
                <div className="qs-role-dept-tag" style={{ marginBottom: "4px" }}>
                  Direct Application
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  {appliedRoleTitle}
                </h3>
              </div>
              <button
                type="button"
                className="qs-career-modal-close"
                onClick={() => setShowApplyModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="qs-career-modal-body">
              {formSubmitted ? (
                <div style={{ textAlign: "center", padding: "24px 10px" }}>
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.12)",
                      color: "#10b981",
                      fontSize: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 14px",
                      fontWeight: 800,
                    }}
                  >
                    ✓
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
                    Application Received!
                  </h3>
                  <p style={{ fontSize: "13.5px", color: "#64748b", lineHeight: 1.55, maxWidth: "380px", margin: "0 auto 20px" }}>
                    Thank you, {applicantData.name || "friend"}. We will review your application for &ldquo;{appliedRoleTitle}&rdquo; and respond within 48 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="qs-view-detail-btn"
                    style={{ padding: "8px 20px" }}
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit}>
                  <div className="qs-input-group">
                    <label className="qs-input-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      className="qs-input-ctrl"
                      value={applicantData.name}
                      onChange={(e) => setApplicantData({ ...applicantData, name: e.target.value })}
                    />
                  </div>

                  <div className="qs-input-row-2">
                    <div className="qs-input-group">
                      <label className="qs-input-label">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="alex@example.com"
                        className="qs-input-ctrl"
                        value={applicantData.email}
                        onChange={(e) => setApplicantData({ ...applicantData, email: e.target.value })}
                      />
                    </div>
                    <div className="qs-input-group">
                      <label className="qs-input-label">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="qs-input-ctrl"
                        value={applicantData.phone}
                        onChange={(e) => setApplicantData({ ...applicantData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="qs-input-group">
                    <label className="qs-input-label">LinkedIn / GitHub / Portfolio URL *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://linkedin.com/in/username"
                      className="qs-input-ctrl"
                      value={applicantData.portfolio}
                      onChange={(e) => setApplicantData({ ...applicantData, portfolio: e.target.value })}
                    />
                  </div>

                  <div className="qs-input-group">
                    <label className="qs-input-label">Years of Relevant Experience</label>
                    <select
                      className="qs-select-ctrl"
                      value={applicantData.experience}
                      onChange={(e) => setApplicantData({ ...applicantData, experience: e.target.value })}
                    >
                      <option value="1-2 years">1 - 2 years</option>
                      <option value="3-5 years">3 - 5 years</option>
                      <option value="5-8 years">5 - 8 years</option>
                      <option value="8+ years">8+ years (Senior / Principal)</option>
                    </select>
                  </div>

                  <div className="qs-input-group">
                    <label className="qs-input-label">Why are you a great fit? (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Brief note on your standout projects..."
                      className="qs-textarea-ctrl"
                      value={applicantData.notes}
                      onChange={(e) => setApplicantData({ ...applicantData, notes: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="qs-btn-submit-action"
                  >
                    <span>Submit Application</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

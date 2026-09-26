"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

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
    desc: "Craft award-winning digital experiences, micro-interactions, responsive design systems, and conversion-optimized interfaces in Figma and modern code.",
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



const cultureValues = [
  {
    num: "01",
    title: "Radical Integrity",
    desc: "We commit to unwavering honesty in all client deliverables and internal collaborations, fostering 100% trust.",
  },
  {
    num: "02",
    title: "AI-Native Innovation",
    desc: "We relentlessly explore emerging AI models, LLM agents, and automation workflows to give clients an unfair advantage.",
  },
  {
    num: "03",
    title: "High Ownership",
    desc: "Every team member operates with founder mentality, taking full responsibility from design concept to live production.",
  },
  {
    num: "04",
    title: "Global Collaboration",
    desc: "We work seamlessly across global timezones with deep respect for diverse viewpoints and asynchronous clarity.",
  },
  {
    num: "05",
    title: "Customer Obsession",
    desc: "Our priority is delivering measurable revenue growth, pipeline volume, and world-class digital experiences.",
  },
  {
    num: "06",
    title: "Continuous Learning",
    desc: "We invest heavily in each individual’s career progression, conference grants, and technical skill development.",
  },
  {
    num: "07",
    title: "Engineering Excellence",
    desc: "We hold ourselves to rigorous standards in clean code, modern UI animations, security, and lightning speed.",
  },
  {
    num: "08",
    title: "Mutual Respect",
    desc: "We treat everyone with dignity, celebrate wins together, and maintain an energizing, low-ego team dynamic.",
  },
  {
    num: "09",
    title: "Velocity & Focus",
    desc: "We approach challenges with clarity and speed, executing the high-leverage actions that truly move the needle.",
  },
];

const teamPhotos = [
  "/images/home-two-about.jpg",
  "/images/home1-about-01.jpg",
  "/images/team-img-01.jpg",
  "/images/team-img-02.jpg",
  "/images/team-img-03.jpg",
  "/images/team-img-04.jpg",
  "/images/team-img-05.jpg",
  "/images/team-img-06.jpg",
];

const testimonialsData = [
  {
    quote: "Joining Quickupp was the best decision for my engineering career. The level of autonomy and direct access to cutting-edge AI stacks allowed me to build solutions 5x faster.",
    name: "Alex Rivera",
    role: "Lead Full-Stack Architect",
    avatar: "/images/team-img-01.jpg",
  },
  {
    quote: "A truly asynchronous culture that actually works. Zero micromanagement, a passionate team, and direct impact on high-growth US brands.",
    name: "Priya Sharma",
    role: "Senior AI Solutions Specialist",
    avatar: "/images/team-img-02.jpg",
  },
  {
    quote: "The creative freedom here is unmatched. We are encouraged to push the boundaries of modern web animations, typography, and interactive design.",
    name: "Marcus Chen",
    role: "Principal Product Designer",
    avatar: "/images/team-img-03.jpg",
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

  // Scroll highlight animation for Manifesto Text
  const manifestoRef = useRef<HTMLHeadingElement>(null);
  const [manifestoProgress, setManifestoProgress] = useState(0);

  const manifestoParagraph =
    "At Quickupp Softech, we believe top-tier engineering and high-ROI digital growth happen when world-class talent has genuine ownership, zero red tape, and state-of-the-art AI tooling.";

  const manifestoWords = useMemo(() => manifestoParagraph.split(" "), [manifestoParagraph]);

  useEffect(() => {
    let ticking = false;
    const calculateProgress = () => {
      if (!manifestoRef.current) return;
      const rect = manifestoRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Start when top reaches 85% down viewport, finish when top reaches 35% down viewport
      const startY = windowH * 0.85;
      const endY = windowH * 0.35;
      const currentY = rect.top;

      let p = (startY - currentY) / (startY - endY);
      p = Math.max(0, Math.min(1, p));
      setManifestoProgress(p);
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    calculateProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

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
    <div className="sc-career-page">
      <Header />

      {/* =========================================================================
          1. HERO HEADER & MANIFESTO PHOTO STRIP
          ========================================================================= */}
      <section className="sc-manifesto-section" style={{ paddingTop: "145px" }}>
        <div className="w-layout-blockcontainer container w-container">
          <div className="sc-manifesto-center-wrap" style={{ maxWidth: "880px", margin: "0 auto 48px", textAlign: "center" }}>
            <div className="sc-badge" style={{ margin: "0 auto 18px" }}>
              <span className="sc-badge-dot" />
              <span>CAREERS AT QUICKUPP SOFTECH</span>
            </div>
            <h1 style={{ fontSize: "clamp(34px, 4.4vw, 56px)", fontWeight: 800, color: "#0b0f17", letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 18px" }}>
              Build the Future of <span className="qs-gradient-text">AI, Tech &amp; Growth.</span>
            </h1>
            <p style={{ fontSize: "clamp(16px, 1.3vw, 19px)", color: "#475569", lineHeight: 1.65, maxWidth: "740px", margin: "0 auto 28px" }}>
              Join a distributed collective of engineers, growth strategists, and AI researchers architecting high-converting digital products.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
              <a href="#open-roles" className="sc-apply-role-btn" style={{ padding: "12px 28px", fontSize: "14px" }}>
                <span>Explore Open Roles</span>
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                  <path d="M3.75 9L14.25 9M14.25 9L9 3.75M14.25 9L9 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#our-values" className="sc-view-details-btn" style={{ padding: "12px 24px", fontSize: "14px" }}>
                <span>Our Principles</span>
              </a>
            </div>
          </div>

          <div className="sc-manifesto-center-wrap" style={{ margin: "60px auto 44px" }}>
            <div className="sc-badge" style={{ margin: "0 auto 20px" }}>
              <span className="sc-badge-dot" />
              <span>2026 • GLOBAL TEAM &amp; ENGINEERING CULTURE</span>
            </div>
            <h2 ref={manifestoRef} className="sc-manifesto-text-center">
              {manifestoWords.map((word, idx) => {
                const wordThreshold = (idx + 0.3) / manifestoWords.length;
                const isRevealed = manifestoProgress >= wordThreshold;
                return (
                  <span
                    key={idx}
                    className={`sc-scroll-word ${isRevealed ? "is-revealed" : ""}`}
                  >
                    {word}
                  </span>
                );
              })}
            </h2>
          </div>
        </div>

        {/* Big Continuous Photo Gallery Strip */}
        <div className="sc-gallery-strip">
          <div className="sc-gallery-track">
            {teamPhotos.concat(teamPhotos).map((imgSrc, idx) => (
              <div key={idx} className="sc-gallery-card">
                <img src={imgSrc} alt="Team Culture & Collaboration" className="sc-gallery-img" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. THE VALUES OF OUR CULTURE (01 - 09 Grid)
          ========================================================================= */}
      <section id="our-values" className="sc-values-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="sc-section-header">
            <div className="sc-badge">
              <span className="sc-badge-dot" />
              <span>Our Principles</span>
            </div>
            <h2 className="sc-section-title">The Values of <span className="qs-gradient-text">Our Culture</span></h2>
            <p className="sc-section-desc">
              We fuel bold ideas with sharp strategy, data-backed execution, and relentless commitment to craft.
            </p>
          </div>

          <div className="sc-values-grid">
            {cultureValues.map((val, idx) => (
              <div key={idx} className="sc-value-card">
                <div className="sc-value-number">{val.num}</div>
                <div className="sc-value-title">{val.title}</div>
                <p className="sc-value-desc">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. WHY WE'RE THE RIGHT CHOICE (Split Showcase Layout)
          ========================================================================= */}
      <section className="sc-choice-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="sc-section-header">
            <div className="sc-badge">
              <span className="sc-badge-dot" />
              <span>Why Quickupp</span>
            </div>
            <h2 className="sc-section-title">Why We’re the <span className="qs-gradient-text">Right Choice</span></h2>
            <p className="sc-section-desc">
              A workplace engineered for high autonomy, technical mastery, and rapid career acceleration.
            </p>
          </div>

          <div className="sc-choice-grid">
            {/* Left Visual Card */}
            <div className="sc-choice-left-visual">
              <img src="/images/home1-about-01.jpg" alt="Quickupp Team" className="sc-choice-left-img" />
              <div className="sc-choice-badge-overlay">
                <div className="sc-choice-badge-title">Empowered Global Builders</div>
                <p className="sc-choice-badge-sub">Collaborating across 12+ timezones with async freedom.</p>
              </div>
            </div>

            {/* Right 4-Card Feature Grid */}
            <div className="sc-choice-cards-grid">
              <div className="sc-choice-item-card">
                <div className="sc-choice-item-title">Proven Impact &amp; Results</div>
                <p className="sc-choice-item-desc">
                  We eliminate corporate fluff, focusing 100% on high-ROI marketing &amp; resilient software.
                </p>
              </div>

              <div className="sc-choice-item-card">
                <div className="sc-choice-item-title">100% Remote Flexibility</div>
                <p className="sc-choice-item-desc">
                  Work from anywhere in the world on high-impact projects with flexible working hours.
                </p>
              </div>

              <div className="sc-choice-item-card">
                <div className="sc-choice-item-title">Cutting-Edge AI Stack</div>
                <p className="sc-choice-item-desc">
                  Full access to OpenAI, Claude 3.5, Cursor, and high-performance cloud compute.
                </p>
              </div>

              <div className="sc-choice-item-card">
                <div className="sc-choice-item-title">Rapid Career Growth</div>
                <p className="sc-choice-item-desc">
                  Fast-track promotions, performance profit shares, and direct founder mentorship.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. EXPLORE OUR CURRENT OPENINGS (Filterable Jobs & Live Modal)
          ========================================================================= */}
      <section id="open-roles" className="sc-roles-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="sc-section-header">
            <div className="sc-badge">
              <span className="sc-badge-dot" />
              <span>Current Openings ({openRolesData.length})</span>
            </div>
            <h2 className="sc-section-title">Find Your <span className="qs-gradient-text">Next Role</span></h2>
            <p className="sc-section-desc">
              Explore our current engineering, AI, marketing, and design opportunities.
            </p>
          </div>

          {/* Department Filter Pills */}
          <div className="sc-roles-filter-bar">
            {departments.map((dept) => {
              const count =
                dept === "All Open Roles"
                  ? openRolesData.length
                  : openRolesData.filter((r) => r.department === dept).length;
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setActiveDept(dept)}
                  className={`sc-filter-btn ${activeDept === dept ? "is-active" : ""}`}
                >
                  {dept} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="sc-search-wrap">
            <svg className="sc-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by role or keyword (e.g. Next.js, AI, Ads, Figma)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sc-search-input"
            />
          </div>

          {/* Roles Listing */}
          <div className="sc-roles-list">
            {filteredRoles.map((role) => (
              <div key={role.id} className="sc-role-card">
                <div className="sc-role-left">
                  <div className="sc-role-top-meta">
                    <span className="sc-dept-badge">{role.department}</span>
                    <span className="sc-role-meta-pill">{role.type}</span>
                    <span className="sc-role-meta-pill">{role.location}</span>
                    <span className="sc-role-salary-pill">{role.salary}</span>
                  </div>

                  <h3 className="sc-role-title">{role.title}</h3>
                  <p className="sc-role-desc">{role.desc}</p>

                  <div className="sc-role-tags-wrap">
                    {role.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="sc-role-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="sc-role-right-actions">
                  <button
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className="sc-view-details-btn"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartApply(role.title)}
                    className="sc-apply-role-btn"
                  >
                    <span>Apply Now</span>
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                      <path d="M3.75 9L14.25 9M14.25 9L9 3.75M14.25 9L9 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {filteredRoles.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "#f8fafc", borderRadius: "16px" }}>
                <p style={{ fontSize: "16px", color: "#64748b", margin: 0 }}>
                  No open positions found matching your criteria. Try adjusting your search query or department filter.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. EMPLOYEE TESTIMONIALS
          ========================================================================= */}
      <section className="sc-testimonials-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="sc-section-header">
            <div className="sc-badge">
              <span className="sc-badge-dot" />
              <span>Team Voices</span>
            </div>
            <h2 className="sc-section-title">Hear from Our <span className="qs-gradient-text">Global Team</span></h2>
            <p className="sc-section-desc">
              Discover what developers, growth marketers, and designers say about life at Quickupp.
            </p>
          </div>

          <div className="sc-testimonials-grid">
            {testimonialsData.map((t, idx) => (
              <div key={idx} className="sc-testimonial-card">
                <div>
                  <div className="sc-stars-wrap">
                    {"★★★★★"}
                  </div>
                  <p className="sc-testimonial-quote">“{t.quote}”</p>
                </div>

                <div className="sc-author-row">
                  <img src={t.avatar} alt={t.name} className="sc-author-avatar" />
                  <div>
                    <div className="sc-author-name">{t.name}</div>
                    <div className="sc-author-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. CINEMATIC PARALLAX REVEAL TRANSITION CTA BANNER
          ========================================================================= */}
      <section className="su-cinematic-cta-section">
        <div className="su-cinematic-bg-media" />
        <div className="su-cinematic-dark-overlay" />
        <div className="w-layout-blockcontainer container w-container">
          <div className="su-cinematic-content">
            <p className="su-cinematic-sub">
              <span className="su-cinematic-sub-dot" /> Quickupp Softech® • USA &amp; Global Delivery
            </p>
            <h2 className="su-cinematic-heading">
              Ready to Build the Future of <span className="su-cinematic-heading-accent">AI &amp; Tech with Us?</span>
            </h2>
            <div className="su-cinematic-action-wrap">
              <a href="#openings" className="su-flip-button">
                <div className="su-flip-button-texts">
                  <div className="su-flip-button-text _01">Explore Open Positions</div>
                  <div className="su-flip-button-text _02">Explore Open Positions</div>
                </div>
                <div className="su-flip-arrow-box">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 18" fill="none" className="su-flip-arrow _01">
                    <path d="M3.75 9L14.25 9M14.25 9L9 3.75M14.25 9L9 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 18" fill="none" className="su-flip-arrow _02">
                    <path d="M3.75 9L14.25 9M14.25 9L9 3.75M14.25 9L9 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. ROLE DETAILS MODAL
          ========================================================================= */}
      {selectedRole && (
        <div className="sc-modal-overlay" onClick={() => setSelectedRole(null)}>
          <div className="sc-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              className="sc-modal-close-btn"
              aria-label="Close Modal"
            >
              ✕
            </button>

            <div style={{ marginBottom: "16px" }}>
              <span className="sc-dept-badge" style={{ marginRight: "8px" }}>
                {selectedRole.department}
              </span>
              <span className="sc-role-salary-pill">{selectedRole.salary}</span>
            </div>

            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
              {selectedRole.title}
            </h2>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <span className="sc-role-meta-pill">{selectedRole.type}</span>
              <span className="sc-role-meta-pill">{selectedRole.location}</span>
            </div>

            <p style={{ fontSize: "14.5px", color: "#475569", lineHeight: 1.6, marginBottom: "20px" }}>
              {selectedRole.desc}
            </p>

            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
              Key Responsibilities
            </h4>
            <ul style={{ paddingLeft: "20px", marginBottom: "20px", color: "#475569", fontSize: "13.5px", lineHeight: 1.6 }}>
              {selectedRole.responsibilities.map((r, i) => (
                <li key={i} style={{ marginBottom: "6px" }}>{r}</li>
              ))}
            </ul>

            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
              Requirements &amp; Skills
            </h4>
            <ul style={{ paddingLeft: "20px", marginBottom: "24px", color: "#475569", fontSize: "13.5px", lineHeight: 1.6 }}>
              {selectedRole.requirements.map((req, i) => (
                <li key={i} style={{ marginBottom: "6px" }}>{req}</li>
              ))}
            </ul>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="sc-view-details-btn"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const title = selectedRole.title;
                  setSelectedRole(null);
                  handleStartApply(title);
                }}
                className="sc-apply-role-btn"
              >
                Apply for this Role →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          10. APPLICATION SUBMISSION DRAWER / MODAL
          ========================================================================= */}
      {showApplyModal && (
        <div className="sc-modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="sc-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowApplyModal(false)}
              className="sc-modal-close-btn"
              aria-label="Close Modal"
            >
              ✕
            </button>

            {formSubmitted ? (
              <div style={{ textAlign: "center", padding: "30px 10px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #00d2ff, #8b5cf6)", color: "#fff", fontSize: "26px", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  ✓
                </div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
                  Application Submitted Successfully!
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "420px", margin: "0 auto 24px" }}>
                  Thank you for applying for <strong>{appliedRoleTitle}</strong>. Our recruiting team will review your profile and reach out to you within 48 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="sc-apply-role-btn"
                  style={{ margin: "0 auto" }}
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <span className="sc-dept-badge" style={{ marginBottom: "6px", display: "inline-block" }}>
                    Job Application
                  </span>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                    Apply for {appliedRoleTitle}
                  </h3>
                  <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
                    Please fill in your contact information and portfolio link.
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#0f172a", marginBottom: "6px" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Mercer"
                      value={applicantData.name}
                      onChange={(e) => setApplicantData({ ...applicantData, name: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#0f172a", marginBottom: "6px" }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="alex@example.com"
                        value={applicantData.email}
                        onChange={(e) => setApplicantData({ ...applicantData, email: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#0f172a", marginBottom: "6px" }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={applicantData.phone}
                        onChange={(e) => setApplicantData({ ...applicantData, phone: e.target.value })}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#0f172a", marginBottom: "6px" }}>
                      Portfolio / GitHub / LinkedIn URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://github.com/yourhandle or https://yourportfolio.com"
                      value={applicantData.portfolio}
                      onChange={(e) => setApplicantData({ ...applicantData, portfolio: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#0f172a", marginBottom: "6px" }}>
                      Cover Note / Why Quickupp?
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Briefly tell us about your experience and why you’d love to build with us..."
                      value={applicantData.notes}
                      onChange={(e) => setApplicantData({ ...applicantData, notes: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", resize: "vertical" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="sc-view-details-btn"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="sc-apply-role-btn"
                    >
                      Submit Application →
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer hideCta={true} />
    </div>
  );
}

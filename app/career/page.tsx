import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Button from "@/components/Button";

export const metadata: Metadata = {
  title: "Careers | Quickupp Softech - Join Our Global Team",
  description:
    "Explore career opportunities at Quickupp Softech. Build, innovate, and grow with a team passionate about Marketing, AI, and Software Engineering.",
};

const openRoles = [
  {
    title: "Senior Full-Stack Developer (Next.js / Node.js)",
    department: "Engineering",
    type: "Full-Time / Remote",
    location: "USA / India",
    desc: "Build scalable web applications, APIs, and headless eCommerce platforms using Next.js, React, TypeScript, and modern cloud architecture.",
  },
  {
    title: "AI & Automation Engineer",
    department: "AI Solutions",
    type: "Full-Time / Remote",
    location: "USA / India",
    desc: "Design and implement intelligent AI agents, WhatsApp workflows, CRM integrations, and LLM-powered lead qualification systems.",
  },
  {
    title: "Performance Marketing Specialist (Google & Meta)",
    department: "Digital Marketing",
    type: "Full-Time / Remote",
    location: "USA / India",
    desc: "Manage high-budget paid media campaigns across Google Ads, Meta Ads, and LinkedIn, focusing on ROAS, CAC reduction, and conversion rate optimization.",
  },
  {
    title: "SEO & AI Search Strategist (AEO / GEO)",
    department: "Organic Growth",
    type: "Full-Time / Remote",
    location: "USA / India",
    desc: "Drive technical SEO, entity search architecture, and AI search visibility strategies across diverse B2B and consumer industries.",
  },
  {
    title: "Senior UI/UX Designer",
    department: "Design",
    type: "Full-Time / Remote",
    location: "USA / India",
    desc: "Craft intuitive, conversion-focused user interfaces and design systems for web apps, mobile apps, SaaS products, and landing pages.",
  },
  {
    title: "Quality Assurance & Automation Engineer",
    department: "Engineering",
    type: "Full-Time / Remote",
    location: "USA / India",
    desc: "Ensure flawless functionality, security, and cross-platform compatibility through automated and manual testing pipelines.",
  },
];

const perks = [
  { title: "Remote-First Flexibility", desc: "Work from wherever you're most productive with flexible working hours." },
  { title: "Cutting-Edge Projects", desc: "Work with the latest AI tools, modern tech stacks, and high-impact global brands." },
  { title: "Learning & Growth Stipend", desc: "Continuous investment in your professional skills, certifications, and conferences." },
  { title: "Collaborative Culture", desc: "A transparent, supportive environment focused on teamwork, innovation, and impact." },
];

export default function CareerPage() {
  return (
    <>
      <Header />
      <PageHero
        title="Build the Future of Growth &amp; Technology"
        crumb="Careers"
        description="Join a passionate team of growth strategists, engineers, and AI innovators helping ambitious brands scale worldwide."
      />

      {/* Culture & Perks */}
      <section className="section-gap" style={{ paddingTop: "64px", paddingBottom: "96px" }}>
        <div className="w-layout-blockcontainer container w-container">
          <div className="qs-section-center-head" style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 48px auto" }}>
            <div className="subtitle-head-wrap" style={{ justifyContent: "center" }}>
              <div className="subtitle-left-icon"></div>
              <div className="subtitle-head">Why Work With Us</div>
            </div>
            <h2 className="heading-title qs-section-heading" style={{ fontSize: "clamp(26px, 3.2vw, 38px)" }}>
              Life at Quickupp Softech
            </h2>
            <p className="paragraph-large" style={{ fontSize: "17px", lineHeight: "1.75", color: "#475467", marginTop: "12px" }}>
              We value curiosity, ownership, technical excellence, and genuine collaboration.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", marginBottom: "56px" }}>
            {perks.map((perk, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1px solid #eaecf0",
                  borderRadius: "16px",
                  padding: "28px 24px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                }}
              >
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#def25c", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "16px", marginBottom: "16px" }}>
                  ✓
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#18171c", marginBottom: "8px" }}>{perk.title}</h3>
                <p style={{ fontSize: "14px", lineHeight: "1.65", color: "#475467", margin: 0 }}>{perk.desc}</p>
              </div>
            ))}
          </div>

          {/* Open Positions */}
          <div className="qs-section-center-head" style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 40px auto" }}>
            <div className="subtitle-head-wrap" style={{ justifyContent: "center" }}>
              <div className="subtitle-left-icon"></div>
              <div className="subtitle-head">Open Roles</div>
            </div>
            <h2 className="heading-title qs-section-heading" style={{ fontSize: "clamp(26px, 3.2vw, 38px)" }}>
              Current Job Openings
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {openRoles.map((role, idx) => (
              <div
                key={idx}
                style={{
                  background: "#fff",
                  border: "1px solid #eaecf0",
                  borderRadius: "16px",
                  padding: "28px 28px",
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                }}
              >
                <div style={{ maxWidth: "700px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, background: "rgba(222, 242, 92, 0.4)", color: "#18171c", padding: "3px 10px", borderRadius: "10px" }}>
                      {role.department}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: 600, background: "#f2f4f7", color: "#475467", padding: "3px 10px", borderRadius: "10px" }}>
                      {role.type}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: 600, background: "#f2f4f7", color: "#475467", padding: "3px 10px", borderRadius: "10px" }}>
                      {role.location}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#18171c", marginBottom: "8px" }}>
                    {role.title}
                  </h3>
                  <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#475467", margin: 0 }}>
                    {role.desc}
                  </p>
                </div>

                <Button href="/contact" label="Apply for Role" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

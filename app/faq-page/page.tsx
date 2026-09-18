import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Button from "@/components/Button";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Quickupp Softech",
  description:
    "Find answers to common questions about Quickupp Softech's Marketing, AI Automation, Web Development, and Staff Augmentation services.",
};

const faqCategories = [
  {
    category: "General & Partnership",
    items: [
      {
        q: "What makes Quickupp Softech different from a traditional marketing agency?",
        a: "We bring Digital Marketing, AI Automation, and Software Engineering together under one roof. Instead of selling disconnected tasks, we build full-funnel customer acquisition and technology ecosystems aligned with your business goals.",
      },
      {
        q: "What industries do you specialize in?",
        a: "We specialize in Healthcare, Home Services, Professional Services, Education, IT & SaaS, eCommerce, Real Estate, Interior Design, and Travel & Hospitality.",
      },
      {
        q: "Do you work with global clients?",
        a: "Yes. Quickupp Softech serves clients across the United States, India, and international markets, delivering 24/7 coverage and global best practices.",
      },
    ],
  },
  {
    category: "Marketing & AI Search Visibility",
    items: [
      {
        q: "How does AI search visibility (AEO & GEO) differ from traditional SEO?",
        a: "Traditional SEO focuses on Google keywords and ranking positions. AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization) optimize your content, entity authority, and schema so AI engines like ChatGPT, Gemini, and Perplexity cite and recommend your brand.",
      },
      {
        q: "Can you optimize our existing Google & Meta ad campaigns?",
        a: "Yes. We conduct an exhaustive audit of your account structure, conversion tracking, audience targeting, negative keywords, and creative assets to eliminate wasted spend and scale high-performing segments.",
      },
      {
        q: "Do you create video and creative content for campaigns?",
        a: "Yes. We offer professional media production, AI UGC videos, AI Avatar videos, and social reels tailored to high-converting ad formats.",
      },
    ],
  },
  {
    category: "AI Automation & Technology",
    items: [
      {
        q: "What kind of AI automation can you implement for our business?",
        a: "We build AI chatbots, intelligent lead qualification bots, automated WhatsApp/SMS/Email follow-up funnels, CRM workflows, and custom software integrations to reduce manual work and increase conversion speed.",
      },
      {
        q: "What tech stack do you use for web and application development?",
        a: "We specialize in Next.js, React, TypeScript, Node.js, PHP, WordPress, Shopify Plus, and modern cloud platforms, ensuring lightning-fast load speeds, SEO excellence, and enterprise-grade security.",
      },
      {
        q: "How does Staff Augmentation work with Quickupp?",
        a: "We provide dedicated marketing, design, QA, and development professionals who integrate directly into your workflows on flexible short-term or long-term engagement models.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <Header />
      <PageHero
        title="Frequently Asked Questions"
        crumb="FAQs"
        description="Everything you need to know about our services, process, technology stack, and engagement models."
      />

      <section className="section-gap" style={{ paddingTop: "64px", paddingBottom: "96px" }}>
        <div className="w-layout-blockcontainer container w-container">
          <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
            {faqCategories.map((cat, cIdx) => (
              <div key={cIdx}>
                <div className="subtitle-head-wrap" style={{ marginBottom: "16px" }}>
                  <div className="subtitle-left-icon"></div>
                  <div className="subtitle-head">{cat.category}</div>
                </div>
                <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#18171c", marginBottom: "24px" }}>
                  {cat.category} Questions
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {cat.items.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      style={{
                        background: "#fff",
                        border: "1px solid #eaecf0",
                        borderRadius: "16px",
                        padding: "24px 28px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                      }}
                    >
                      <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#18171c", marginBottom: "10px" }}>
                        {item.q}
                      </h3>
                      <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#475467", margin: 0 }}>
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Still have questions? */}
          <div
            style={{
              marginTop: "56px",
              background: "#18171c",
              borderRadius: "20px",
              padding: "44px 36px",
              textAlign: "center",
              color: "#fff",
            }}
          >
            <h3 style={{ fontSize: "28px", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>
              Have a Question Not Listed Here?
            </h3>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.85)", maxWidth: "600px", margin: "0 auto 24px auto" }}>
              Our growth strategists and tech experts are available to answer your questions and walk you through your options.
            </p>
            <Button href="/contact" label="Talk to Our Experts" />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

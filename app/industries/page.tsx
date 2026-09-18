import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { industryItems } from "@/lib/sitemap";

export const metadata: Metadata = {
  title: "Industries | Quickupp Softech",
  description:
    "Quickupp Softech serves Healthcare, Home Services, Professional Services, Education, IT & SaaS, eCommerce, Real Estate, Interior Design and Travel & Hospitality businesses.",
};

export default function IndustriesPage() {
  return (
    <>
      <Header />
      <PageHero
        title="Industries We Serve"
        crumb="Industries"
        description="We build marketing, AI and technology solutions tailored to the industries we work with most."
      />
      <section className="section-gap" style={{ paddingTop: "64px", paddingBottom: "96px" }}>
        <div className="w-layout-blockcontainer container w-container">
          <div className="qs-card-grid">
            {industryItems.map((item) => (
              <a key={item.href} href={item.href} className="qs-card">
                <div className="qs-card-eyebrow">Industry</div>
                <div className="text-style-h4 qs-card-title">{item.label}</div>
                <p className="qs-card-desc">
                  Marketing, AI and technology solutions built for {item.label.toLowerCase()} businesses.
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { serviceGroups } from "@/lib/sitemap";

export const metadata: Metadata = {
  title: "Services | Quickupp Softech",
  description:
    "Explore Quickupp Softech's full range of digital marketing, AI video production, AI & automation, IT and staff augmentation services.",
};

export default function ServicesPage() {
  return (
    <>
      <Header />
      <PageHero
        title="Marketing. AI. Technology. Built for Growth."
        crumb="Services"
        description="Explore our full range of digital marketing, AI and technology services, built to help your business grow."
      />
      <section className="section-gap padding-top-0">
        <div className="w-layout-blockcontainer container w-container">
          {serviceGroups.map((group) => (
            <div key={group.label}>
              <h2 className="heading-title qs-group-heading">{group.label}</h2>
              <div className="qs-card-grid">
                {group.items.map((item) => (
                  <a key={item.href} href={item.href} className="qs-card">
                    <div className="qs-card-eyebrow">Service</div>
                    <div className="text-style-h4 qs-card-title">{item.label}</div>
                    {item.desc && <p className="qs-card-desc">{item.desc}</p>}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}

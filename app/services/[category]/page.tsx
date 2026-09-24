import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllCategoryParams, serviceCategories } from "@/lib/servicesData";

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  return getAllCategoryParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: catSlug } = await params;
  const cat = serviceCategories.find((c) => c.categorySlug === catSlug);
  if (!cat) {
    return {
      title: "Services Category | Quickupp Softech",
    };
  }

  return {
    title: `${cat.categoryLabel} | Quickupp Softech`,
    description: cat.categoryDesc,
  };
}

import MerkilCategoryHub from "@/components/MerkilCategoryHub";
import AIVideoCategoryHub from "@/components/AIVideoCategoryHub";

export default async function ServiceCategoryPage({ params }: PageProps) {
  const { category: catSlug } = await params;
  const category = serviceCategories.find((c) => c.categorySlug === catSlug);

  if (!category) {
    notFound();
  }

  if (category.categorySlug === "ai-powered-digital-marketing-services") {
    return <MerkilCategoryHub category={category} />;
  }

  if (category.categorySlug === "ai-video-production") {
    return <AIVideoCategoryHub category={category} />;
  }

  return (
    <div className="asx-page">
      <Header />

      <main style={{ paddingTop: "100px" }}>
        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <section className="asx-hero-section">
          <div className="asx-container">
            {/* Breadcrumb Navigation */}
            <div className="asx-breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/services">Services</Link>
              <span>/</span>
              <span className="asx-breadcrumb-current">{category.categoryLabel}</span>
            </div>

            <div className="asx-section-header-center" style={{ maxWidth: "880px", margin: "0 auto 48px", textAlign: "center" }}>
              <div className="asx-tag-pill" style={{ margin: "0 auto 16px" }}>
                <span className="asx-tag-dot" />
                <span>Featured Capabilities</span>
              </div>

              <h1 className="asx-hero-title" style={{ fontSize: "clamp(30px, 3.6vw, 48px)", fontWeight: 800, color: "#001d28", letterSpacing: "-0.025em", margin: "0 0 16px" }}>
                {category.categoryLabel}
              </h1>

              <p style={{ fontSize: "clamp(15px, 1.3vw, 17.5px)", color: "#2c436b", lineHeight: 1.6, margin: "0 auto" }}>
                {category.categoryDesc}
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SERVICES GRID */}
        {/* ========================================================================= */}
        <section className="asx-section" style={{ borderTop: "1px solid #e5eaee", backgroundColor: "#f8fafc" }}>
          <div className="asx-container">
            <div className="asx-cards-grid-3">
              {category.services.map((item, idx) => (
                <div key={idx} className="asx-outline-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div className="asx-icon-box" style={{ fontSize: "22px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      {item.icon}
                    </div>
                    <h2 className="asx-outline-title" style={{ fontSize: "19px", fontWeight: 700, margin: "14px 0 8px", color: "#001d28" }}>
                      {item.label}
                    </h2>
                    <p className="asx-outline-desc" style={{ fontSize: "14px", color: "#475569", lineHeight: 1.55 }}>
                      {item.desc}
                    </p>
                  </div>

                  <div style={{ marginTop: "24px", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
                    <Link
                      href={`/services/${category.categorySlug}/${item.slug}`}
                      className="asx-btn-dark"
                      style={{ width: "100%", textAlign: "center", padding: "10px 18px", fontSize: "13px" }}
                    >
                      Explore Service →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BOTTOM CTA */}
        {/* ========================================================================= */}
        <section className="asx-section" style={{ backgroundColor: "#001d28", color: "#ffffff", textAlign: "center" }}>
          <div className="asx-container">
            <div style={{ maxWidth: "700px", margin: "0 auto" }}>
              <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 800, color: "#ffffff", margin: "0 0 16px" }}>
                Ready to Accelerate Your Growth?
              </h2>
              <p style={{ fontSize: "15px", color: "#94a3b8", lineHeight: 1.6, margin: "0 0 28px" }}>
                Schedule a consultation with our strategy and engineering team to build the right solutions for your goals.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
                <Link href="/contact" className="asx-btn-green">
                  Get More Info
                </Link>
                <Link href="/services" className="asx-btn-outline" style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff" }}>
                  View All Services
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

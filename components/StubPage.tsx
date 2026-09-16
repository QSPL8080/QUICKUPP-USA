import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Button from "@/components/Button";

export default function StubPage({
  title,
  crumb,
  description,
}: {
  title: string;
  crumb: string;
  description?: string;
}) {
  return (
    <>
      <Header />
      <PageHero
        title={title}
        crumb={crumb}
        description={
          description ??
          "This page is part of the Quickupp Softech site map and full content is coming soon."
        }
      />
      <section className="section-gap padding-top-0">
        <div className="w-layout-blockcontainer container w-container">
          <div className="qs-closing">
            <h2 className="heading-title">Content Coming Soon</h2>
            <p className="qs-block-desc">
              We&apos;re building out this page. In the meantime, get in touch and our team
              will help with your {title.toLowerCase()} needs directly.
            </p>
            <div className="qs-cta-row">
              <Button href="/contact" label="Talk to Our Team" />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

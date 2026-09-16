import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Button from "@/components/Button";

export const metadata: Metadata = {
  title: "About Us | Quickupp Softech",
  description:
    "Quickupp Softech is a full-service digital marketing, AI and technology agency. Learn who we are, why businesses choose us and how we approach every engagement.",
};

const sections = [
  {
    id: "who-we-are",
    title: "Who We Are",
    desc: "Quickupp Softech is a full-service digital marketing, AI and technology agency helping businesses grow through strategy, creativity and data-driven execution.",
  },
  {
    id: "why-choose-us",
    title: "Why Choose Us",
    desc: "A single partner for marketing, AI and technology, combining strategy-first thinking with hands-on execution across every channel.",
  },
  {
    id: "why-businesses-choose-us",
    title: "Why Businesses Choose Us",
    desc: "Customized strategies, transparent reporting and a track record of helping brands reach, engage and convert their audience.",
  },
  {
    id: "our-approach",
    title: "Our Approach",
    desc: "Discover, research, strategize, create and optimize — a clear, repeatable process behind every service we deliver.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <PageHero
        title="Marketing. AI. Technology. Built for Growth."
        crumb="About Us"
        description="We're a full-service digital marketing, AI and technology agency built to help businesses grow."
      />
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="section-gap padding-top-0">
          <div className="w-layout-blockcontainer container w-container">
            <div className="qs-block">
              <h2 className="heading-title qs-block-title">{section.title}</h2>
              <p className="qs-block-desc">{section.desc}</p>
            </div>
          </div>
        </section>
      ))}
      <section className="section-gap padding-top-0">
        <div className="w-layout-blockcontainer container w-container">
          <div className="qs-closing">
            <h2 className="heading-title">Let&apos;s Build Something Great Together</h2>
            <p className="qs-block-desc">
              Get in touch with our team to learn more about how we can help your business grow.
            </p>
            <div className="qs-cta-row">
              <Button href="/contact" label="Get in Touch" />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

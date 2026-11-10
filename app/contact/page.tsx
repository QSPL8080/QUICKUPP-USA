import type { Metadata } from "next";
import ContactView from "@/components/ContactView";

export const metadata: Metadata = {
  title: "Contact Quickupp Softech – Let's Grow Your Business",
  description:
    "At Quickupp Softech LLC, we help businesses build, market, and scale through strategic digital marketing, AI-powered solutions, IT services, and business process outsourcing.",
  alternates: {
    canonical: "https://www.quickuppsoftech.us/contact",
  },
  openGraph: {
    title: "Contact Quickupp Softech – Let's Grow Your Business",
    description:
      "At Quickupp Softech LLC, we help businesses build, market, and scale through strategic digital marketing, AI-powered solutions, IT services, and business process outsourcing.",
    url: "https://www.quickuppsoftech.us/contact",
    type: "website",
  },
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Quickupp Softech LLC",
  url: "https://www.quickuppsoftech.us/contact",
  telephone: "+1-302-754-5679",
  email: "info@quickuppsoftech.us",
  address: {
    "@type": "PostalAddress",
    streetAddress: "167 Princeton Street",
    addressLocality: "Bridgeport",
    addressRegion: "CT",
    postalCode: "06605",
    addressCountry: "US",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+1-302-754-5679",
      contactType: "customer service",
      email: "support@quickuppsoftech.us",
      availableLanguage: ["English"],
    },
    {
      "@type": "ContactPoint",
      telephone: "+1-302-754-5679",
      contactType: "sales",
      email: "info@quickuppsoftech.us",
      availableLanguage: ["English"],
    },
  ],
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <ContactView />
    </>
  );
}

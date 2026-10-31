import type { Metadata } from "next";
import ContactView from "@/components/ContactView";

export const metadata: Metadata = {
  title: "Contact Quickupp Softech – Let's Grow Your Business",
  description:
    "At Quickupp Softech LLC, we help businesses build, market, and scale through strategic digital marketing, AI-powered solutions, IT services, and business process outsourcing.",
};

export default function ContactPage() {
  return <ContactView />;
}

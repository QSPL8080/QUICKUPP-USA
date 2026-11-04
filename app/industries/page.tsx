import type { Metadata } from "next";
import IndustriesOverviewHub from "@/components/IndustriesOverviewHub";

export const metadata: Metadata = {
  title: "Industries We Serve | Quickupp Softech",
  description:
    "Explore tailored digital marketing, AI automation, and custom technology solutions engineered for Healthcare, Education, Real Estate, Home Services, IT & SaaS, eCommerce, and more.",
  alternates: {
    canonical: "https://www.quickuppsoftech.us/industries",
  },
};

export default function IndustriesPage() {
  return <IndustriesOverviewHub />;
}

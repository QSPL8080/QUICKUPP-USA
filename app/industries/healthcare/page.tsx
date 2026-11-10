import type { Metadata } from "next";
import IndustryDetailPage from "@/components/IndustryDetailPage";
import { data } from "@/data/industries/healthcare";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
  alternates: {
    canonical: "https://www.quickuppsoftech.us/industries/healthcare",
    languages: { "en-US": "https://www.quickuppsoftech.us/industries/healthcare" },
  },
};

export default function HealthcareIndustryPage() {
  return <IndustryDetailPage data={data} />;
}

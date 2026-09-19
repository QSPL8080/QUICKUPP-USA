import type { Metadata } from "next";
import IndustryDetailPage from "@/components/IndustryDetailPage";
import { data } from "@/data/industries/healthcare";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function HealthcareIndustryPage() {
  return <IndustryDetailPage data={data} />;
}

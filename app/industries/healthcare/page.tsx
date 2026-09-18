import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { data } from "@/data/industries/healthcare";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function HealthcareIndustryPage() {
  return <ServicePage data={data} />;
}

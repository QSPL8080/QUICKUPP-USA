import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { data } from "@/data/industries/education";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function EducationIndustryPage() {
  return <ServicePage data={data} />;
}

import type { Metadata } from "next";
import IndustryDetailPage from "@/components/IndustryDetailPage";
import { data } from "@/data/industries/professional-services";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function ProfessionalServicesIndustryPage() {
  return <IndustryDetailPage data={data} />;
}

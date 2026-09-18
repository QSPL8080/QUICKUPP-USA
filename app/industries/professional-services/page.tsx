import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { data } from "@/data/industries/professional-services";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function ProfessionalServicesIndustryPage() {
  return <ServicePage data={data} />;
}

import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { data } from "@/data/industries/it-saas";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function ITSaaSIndustryPage() {
  return <ServicePage data={data} />;
}

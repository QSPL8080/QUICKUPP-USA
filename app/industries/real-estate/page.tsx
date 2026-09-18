import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { data } from "@/data/industries/real-estate";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function RealEstateIndustryPage() {
  return <ServicePage data={data} />;
}

import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { data } from "@/data/industries/home-services";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function HomeServicesIndustryPage() {
  return <ServicePage data={data} />;
}

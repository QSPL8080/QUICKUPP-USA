import type { Metadata } from "next";
import IndustryDetailPage from "@/components/IndustryDetailPage";
import { data } from "@/data/industries/home-services";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function HomeServicesIndustryPage() {
  return <IndustryDetailPage data={data} />;
}

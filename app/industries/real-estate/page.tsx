import type { Metadata } from "next";
import IndustryDetailPage from "@/components/IndustryDetailPage";
import { data } from "@/data/industries/real-estate";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function RealEstateIndustryPage() {
  return <IndustryDetailPage data={data} />;
}

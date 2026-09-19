import type { Metadata } from "next";
import IndustryDetailPage from "@/components/IndustryDetailPage";
import { data } from "@/data/industries/travel-hospitality";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function TravelHospitalityIndustryPage() {
  return <IndustryDetailPage data={data} />;
}

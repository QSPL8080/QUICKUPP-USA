import type { Metadata } from "next";
import IndustryDetailPage from "@/components/IndustryDetailPage";
import { data } from "@/data/industries/travel-hospitality";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
  alternates: {
    canonical: "https://www.quickuppsoftech.us/industries/travel-hospitality",
    languages: { "en-US": "https://www.quickuppsoftech.us/industries/travel-hospitality" },
  },
};

export default function TravelHospitalityIndustryPage() {
  return <IndustryDetailPage data={data} />;
}

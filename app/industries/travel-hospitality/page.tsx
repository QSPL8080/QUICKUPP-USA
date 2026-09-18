import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { data } from "@/data/industries/travel-hospitality";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function TravelHospitalityIndustryPage() {
  return <ServicePage data={data} />;
}

import type { Metadata } from "next";
import IndustryDetailPage from "@/components/IndustryDetailPage";
import { data } from "@/data/industries/education";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function EducationIndustryPage() {
  return <IndustryDetailPage data={data} />;
}

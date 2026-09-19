import type { Metadata } from "next";
import IndustryDetailPage from "@/components/IndustryDetailPage";
import { data } from "@/data/industries/it-saas";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function ItSaasIndustryPage() {
  return <IndustryDetailPage data={data} />;
}

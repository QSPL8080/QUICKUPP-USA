import type { Metadata } from "next";
import IndustryDetailPage from "@/components/IndustryDetailPage";
import { data } from "@/data/industries/interior-design";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function InteriorDesignIndustryPage() {
  return <IndustryDetailPage data={data} />;
}

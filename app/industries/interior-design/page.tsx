import type { Metadata } from "next";
import IndustryDetailPage from "@/components/IndustryDetailPage";
import { data } from "@/data/industries/interior-design";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
  alternates: {
    canonical: "https://www.quickuppsoftech.us/industries/interior-design",
    languages: { "en-US": "https://www.quickuppsoftech.us/industries/interior-design" },
  },
};

export default function InteriorDesignIndustryPage() {
  return <IndustryDetailPage data={data} />;
}

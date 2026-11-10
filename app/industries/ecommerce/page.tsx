import type { Metadata } from "next";
import IndustryDetailPage from "@/components/IndustryDetailPage";
import { data } from "@/data/industries/ecommerce";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
  alternates: {
    canonical: "https://www.quickuppsoftech.us/industries/ecommerce",
    languages: { "en-US": "https://www.quickuppsoftech.us/industries/ecommerce" },
  },
};

export default function EcommerceIndustryPage() {
  return <IndustryDetailPage data={data} />;
}

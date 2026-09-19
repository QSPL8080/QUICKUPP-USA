import type { Metadata } from "next";
import IndustryDetailPage from "@/components/IndustryDetailPage";
import { data } from "@/data/industries/ecommerce";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function EcommerceIndustryPage() {
  return <IndustryDetailPage data={data} />;
}

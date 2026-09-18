import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { data } from "@/data/industries/ecommerce";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function EcommerceIndustryPage() {
  return <ServicePage data={data} />;
}

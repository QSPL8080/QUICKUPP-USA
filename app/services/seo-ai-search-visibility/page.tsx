import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import data from "@/data/services/seo-ai-search-visibility";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function Page() {
  return <ServicePage data={data} />;
}

import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { data } from "@/data/industries/interior-design";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function InteriorDesignIndustryPage() {
  return <ServicePage data={data} />;
}

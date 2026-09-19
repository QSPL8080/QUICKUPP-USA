import type { Metadata } from "next";
import ITLifecycleServicePage from "@/components/ITLifecycleServicePage";
import data from "@/data/services/product-engineering";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function Page() {
  return <ITLifecycleServicePage data={data} />;
}
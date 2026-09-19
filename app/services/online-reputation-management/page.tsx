import type { Metadata } from "next";
import RitovexServicePage from "@/components/RitovexServicePage";
import data from "@/data/services/online-reputation-management";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function Page() {
  return <RitovexServicePage data={data} />;
}
import type { Metadata } from "next";
import RitovexServicePage from "@/components/RitovexServicePage";
import data from "@/data/services/it-staff-augmentation";

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function Page() {
  return <RitovexServicePage data={data} />;
}
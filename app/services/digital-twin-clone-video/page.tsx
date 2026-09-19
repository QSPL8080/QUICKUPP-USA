import type { Metadata } from "next";
import RitovexServicePage from "@/components/RitovexServicePage";
import serviceData from "@/data/services/digital-twin-clone-video";

const data = (serviceData as any).default || serviceData;

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
};

export default function Page() {
  return <RitovexServicePage data={data} />;
}
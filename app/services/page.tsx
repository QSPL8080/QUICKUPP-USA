import type { Metadata } from "next";
import RitovexServicesListing from "@/components/RitovexServicesListing";

export const metadata: Metadata = {
  title: "Services | Quickupp Softech",
  description:
    "Explore Quickupp Softech's full range of digital marketing, AI video production, AI & automation, IT and staff augmentation services.",
};

export default function ServicesPage() {
  return <RitovexServicesListing />;
}

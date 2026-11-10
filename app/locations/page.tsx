import type { Metadata } from "next";
import { LocationsHub } from "@/components/LocationViews";

export const metadata: Metadata = {
  title: "Our Locations | Quickupp Softech",
  description: "Explore Quickupp Softech's services across top US metropolitan areas and tech hubs.",
  alternates: {
    canonical: "https://www.quickuppsoftech.us/locations",
    languages: { "en-US": "https://www.quickuppsoftech.us/locations" },
  },
};

export default function Page() {
  return <LocationsHub />;
}

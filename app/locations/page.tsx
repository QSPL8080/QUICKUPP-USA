import type { Metadata } from "next";
import { LocationsHub } from "@/components/LocationViews";

export const metadata: Metadata = {
  title: "Our Locations | Quickupp Softech",
};

export default function Page() {
  return <LocationsHub />;
}

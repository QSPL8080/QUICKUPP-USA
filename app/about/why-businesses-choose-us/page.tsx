import type { Metadata } from "next";
import WhyBusinessesChooseUsInteractive from "@/components/WhyBusinessesChooseUsInteractive";

export const metadata: Metadata = {
  title: "Why Businesses Choose Us | Quickupp Softech",
  description:
    "Built Around Your Business. Focused on What Comes Next. Discover why ambitious companies choose Quickupp Softech as their growth partner.",
  alternates: {
    canonical: "https://www.quickuppsoftech.us/about/why-businesses-choose-us",
    languages: { "en-US": "https://www.quickuppsoftech.us/about/why-businesses-choose-us" },
  },
};

export default function AboutWhyBusinessesChooseUsPage() {
  return <WhyBusinessesChooseUsInteractive />;
}

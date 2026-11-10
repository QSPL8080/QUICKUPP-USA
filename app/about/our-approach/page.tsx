import type { Metadata } from "next";
import OurApproachInteractive from "@/components/OurApproachInteractive";

export const metadata: Metadata = {
  title: "Our Approach | Understand. Strategize. Build. Optimize. Grow. | Quickupp Softech",
  description:
    "Understand. Strategize. Build. Optimize. Grow. Discover how Quickupp Softech connects Marketing, AI and Technology into one disciplined growth framework.",
  alternates: {
    canonical: "https://www.quickuppsoftech.us/about/our-approach",
    languages: { "en-US": "https://www.quickuppsoftech.us/about/our-approach" },
  },
};

export default function AboutOurApproachPage() {
  return <OurApproachInteractive />;
}

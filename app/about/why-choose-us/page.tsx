import type { Metadata } from "next";
import WhyChooseUsInteractive from "@/components/WhyChooseUsInteractive";

export const metadata: Metadata = {
  title: "Why Choose Us | The Growth Partner Built for What's Next | Quickupp Softech",
  description:
    "Discover why ambitious businesses choose Quickupp Softech for unified Marketing, AI automation, and high-performance software engineering.",
};

export default function AboutWhyChooseUsPage() {
  return <WhyChooseUsInteractive />;
}

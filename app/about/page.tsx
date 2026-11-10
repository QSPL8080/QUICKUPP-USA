import type { Metadata } from "next";
import WhoWeAreInteractive from "@/components/WhoWeAreInteractive";

export const metadata: Metadata = {
  title: "About Us | Who We Are | Quickupp Softech",
  description:
    "Quickupp Softech is a full-service Marketing, AI & Technology company helping ambitious businesses grow, scale and stay ahead.",
  alternates: {
    canonical: "https://www.quickuppsoftech.us/about",
    languages: { "en-US": "https://www.quickuppsoftech.us/about" },
  },
};

export default function AboutPage() {
  return <WhoWeAreInteractive />;
}

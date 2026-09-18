import type { Metadata } from "next";
import WhoWeAreInteractive from "@/components/WhoWeAreInteractive";

export const metadata: Metadata = {
  title: "Who We Are | Your Trusted Digital Growth Partner | Quickupp Softech",
  description:
    "Quickupp Softech is a full-service Marketing, AI & Technology company helping ambitious businesses grow, scale and stay ahead.",
};

export default function AboutWhoWeArePage() {
  return <WhoWeAreInteractive />;
}

import type { Metadata } from "next";
import OurTeamInteractive from "@/components/OurTeamInteractive";

export const metadata: Metadata = {
  title: "Our Leadership & Team | The Minds Behind Quickupp Softech",
  description:
    "Meet the growth strategists, AI architects, software engineers, and creative producers powering Quickupp Softech.",
};

export default function AboutOurTeamPage() {
  return <OurTeamInteractive />;
}

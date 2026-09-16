import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "IT Staff Augmentation | Quickupp Softech",
  description: "IT Staff Augmentation — part of Quickupp Softech's services lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="IT Staff Augmentation" crumb="IT Staff Augmentation" />;
}

import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Resources | Quickupp Softech",
  description: "Resources — part of Quickupp Softech's resources lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Resources" crumb="Resources" />;
}

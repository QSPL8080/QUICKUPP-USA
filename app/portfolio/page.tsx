import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Portfolio | Quickupp Softech",
  description: "Portfolio — part of Quickupp Softech's resources lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Portfolio" crumb="Portfolio" />;
}

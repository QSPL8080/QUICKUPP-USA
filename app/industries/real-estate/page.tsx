import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Real Estate | Quickupp Softech",
  description: "Real Estate — part of Quickupp Softech's industries lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Real Estate" crumb="Real Estate" />;
}

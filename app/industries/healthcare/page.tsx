import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Healthcare | Quickupp Softech",
  description: "Healthcare — part of Quickupp Softech's industries lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Healthcare" crumb="Healthcare" />;
}

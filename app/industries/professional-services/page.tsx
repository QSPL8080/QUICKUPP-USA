import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Professional Services | Quickupp Softech",
  description: "Professional Services — part of Quickupp Softech's industries lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Professional Services" crumb="Professional Services" />;
}

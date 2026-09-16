import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Digital Twin & Clone Video | Quickupp Softech",
  description: "Digital Twin & Clone Video — part of Quickupp Softech's services lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Digital Twin & Clone Video" crumb="Digital Twin & Clone Video" />;
}

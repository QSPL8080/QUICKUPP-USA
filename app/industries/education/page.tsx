import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Education | Quickupp Softech",
  description: "Education — part of Quickupp Softech's industries lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Education" crumb="Education" />;
}

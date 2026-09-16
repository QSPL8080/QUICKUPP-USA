import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Interior Design | Quickupp Softech",
  description: "Interior Design — part of Quickupp Softech's industries lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Interior Design" crumb="Interior Design" />;
}

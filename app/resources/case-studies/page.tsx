import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Case Studies | Quickupp Softech",
  description: "Case Studies — part of Quickupp Softech's resources lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Case Studies" crumb="Case Studies" />;
}

import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Home Services | Quickupp Softech",
  description: "Home Services — part of Quickupp Softech's industries lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Home Services" crumb="Home Services" />;
}

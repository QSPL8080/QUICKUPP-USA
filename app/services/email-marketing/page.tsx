import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Email Marketing | Quickupp Softech",
  description: "Email Marketing — part of Quickupp Softech's services lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Email Marketing" crumb="Email Marketing" />;
}

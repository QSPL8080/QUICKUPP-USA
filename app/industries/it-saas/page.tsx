import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "IT & SaaS | Quickupp Softech",
  description: "IT & SaaS — part of Quickupp Softech's industries lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="IT & SaaS" crumb="IT & SaaS" />;
}

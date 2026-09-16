import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "SMS Marketing | Quickupp Softech",
  description: "SMS Marketing — part of Quickupp Softech's services lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="SMS Marketing" crumb="SMS Marketing" />;
}

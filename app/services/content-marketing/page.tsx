import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Content Marketing | Quickupp Softech",
  description: "Content Marketing — part of Quickupp Softech's services lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Content Marketing" crumb="Content Marketing" />;
}

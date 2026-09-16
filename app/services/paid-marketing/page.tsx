import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Paid Marketing | Quickupp Softech",
  description: "Paid Marketing — part of Quickupp Softech's services lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Paid Marketing" crumb="Paid Marketing" />;
}

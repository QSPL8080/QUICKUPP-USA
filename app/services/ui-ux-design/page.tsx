import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "UI/UX Design | Quickupp Softech",
  description: "UI/UX Design — part of Quickupp Softech's services lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="UI/UX Design" crumb="UI/UX Design" />;
}

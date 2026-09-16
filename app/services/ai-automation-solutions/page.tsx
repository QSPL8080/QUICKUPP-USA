import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "AI & Automation Solutions | Quickupp Softech",
  description: "AI & Automation Solutions — part of Quickupp Softech's services lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="AI & Automation Solutions" crumb="AI & Automation Solutions" />;
}

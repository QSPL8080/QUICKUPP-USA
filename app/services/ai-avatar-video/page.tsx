import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "AI Avatar Video | Quickupp Softech",
  description: "AI Avatar Video — part of Quickupp Softech's services lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="AI Avatar Video" crumb="AI Avatar Video" />;
}

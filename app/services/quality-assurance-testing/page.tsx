import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Quality Assurance & Testing | Quickupp Softech",
  description: "Quality Assurance & Testing — part of Quickupp Softech's services lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Quality Assurance & Testing" crumb="Quality Assurance & Testing" />;
}

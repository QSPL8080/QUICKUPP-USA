import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Web Design & Development | Quickupp Softech",
  description: "Web Design & Development — part of Quickupp Softech's services lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Web Design & Development" crumb="Web Design & Development" />;
}

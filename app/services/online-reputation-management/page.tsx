import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Online Reputation Management | Quickupp Softech",
  description: "Online Reputation Management — part of Quickupp Softech's services lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Online Reputation Management" crumb="Online Reputation Management" />;
}

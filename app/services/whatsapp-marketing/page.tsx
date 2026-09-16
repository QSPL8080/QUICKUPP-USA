import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "WhatsApp Marketing | Quickupp Softech",
  description: "WhatsApp Marketing — part of Quickupp Softech's services lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="WhatsApp Marketing" crumb="WhatsApp Marketing" />;
}

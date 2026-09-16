import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Client Testimonials | Quickupp Softech",
  description: "Client Testimonials — part of Quickupp Softech's resources lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Client Testimonials" crumb="Client Testimonials" />;
}

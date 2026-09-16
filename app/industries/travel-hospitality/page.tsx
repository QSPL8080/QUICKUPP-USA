import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Travel & Hospitality | Quickupp Softech",
  description: "Travel & Hospitality — part of Quickupp Softech's industries lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Travel & Hospitality" crumb="Travel & Hospitality" />;
}

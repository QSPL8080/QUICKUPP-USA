import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Product Engineering | Quickupp Softech",
  description: "Product Engineering — part of Quickupp Softech's services lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="Product Engineering" crumb="Product Engineering" />;
}

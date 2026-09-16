import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "eCommerce | Quickupp Softech",
  description: "eCommerce — part of Quickupp Softech's industries lineup. Full page content is coming soon.",
};

export default function Page() {
  return <StubPage title="eCommerce" crumb="eCommerce" />;
}

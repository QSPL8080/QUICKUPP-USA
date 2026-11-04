import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio | Quickupp Softech",
  description:
    "Explore Quickupp Softech's featured client work, successful digital campaigns, and custom technology solutions across AI, SaaS, web apps, and performance marketing.",
  alternates: {
    canonical: "https://www.quickuppsoftech.us/portfolio",
  },
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

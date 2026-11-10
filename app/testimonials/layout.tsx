import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Testimonials & Reviews | Quickupp Softech",
  description:
    "Read real client reviews and testimonials about Quickupp Softech's digital marketing, AI automation, and custom web development services.",
  alternates: {
    canonical: "https://www.quickuppsoftech.us/testimonials",
    languages: { "en-US": "https://www.quickuppsoftech.us/testimonials" },
  },
};

export default function TestimonialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

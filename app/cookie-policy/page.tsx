import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { COOKIES } from "@/data/legal/cookies";

export const metadata: Metadata = {
  title: "Cookie Policy | Quickupp Softech",
  description:
    "This Cookie Policy explains what cookies are, how Quickupp Softech LLC uses them, what information they collect, and how you can manage your cookie preferences.",
  alternates: {
    canonical: "https://www.quickuppsoftech.us/cookie-policy",
  },
};

export default function CookiePolicyPage() {
  return <LegalPage doc={COOKIES} />;
}

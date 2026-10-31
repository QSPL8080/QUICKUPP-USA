import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { PRIVACY } from "@/data/legal/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy | Quickupp Softech",
  description:
    "This Privacy Policy describes how Quickupp Softech LLC collects, uses, discloses, stores, and protects personal information when you visit our website, contact us, request information, or use our services.",
};

export default function PrivacyPolicyPage() {
  return <LegalPage doc={PRIVACY} />;
}

import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { TERMS } from "@/data/legal/terms";

export const metadata: Metadata = {
  title: "Terms and Conditions | Quickupp Softech",
  description:
    "These Terms and Conditions govern your access to and use of the Quickupp Softech LLC website, https://www.quickuppsoftech.us.",
};

export default function TermsAndConditionsPage() {
  return <LegalPage doc={TERMS} />;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Checkout | Quickupp Softech LLC",
  description:
    "Complete your project payment securely with Quickupp Softech LLC via PayPal, Credit or Debit Card.",
  alternates: {
    canonical: "https://www.quickuppsoftech.us/checkout",
    languages: { "en-US": "https://www.quickuppsoftech.us/checkout" },
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

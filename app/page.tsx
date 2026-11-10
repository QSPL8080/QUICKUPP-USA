import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeView from "@/components/home/HomeView";

export const metadata: Metadata = {
  title: "Quickupp Softech | Digital Marketing, AI & IT Solutions",
  description:
    "Quickupp Softech is a digital marketing, AI, and IT solutions agency helping brands grow with performance marketing, web & app development, and AI-driven automation.",
  alternates: {
    canonical: "https://www.quickuppsoftech.us",
    languages: { "en-US": "https://www.quickuppsoftech.us" },
  },
};

export default function Home() {
  return (
    <>
      <Header />
      <HomeView />
      <Footer />
    </>
  );
}

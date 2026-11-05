import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeView from "@/components/home/HomeView";

export const metadata: Metadata = {
  title: "IT & Digital Marketing Services | Quickupp Softech",
  description:
    "Quickupp Softech delivers web development, SEO, paid marketing and digital solutions for growing businesses. Explore services and book a call.",
  alternates: {
    canonical: "https://quickuppsoftech.us",
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

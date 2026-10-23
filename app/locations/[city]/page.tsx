import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityView } from "@/components/LocationViews";
import { LOCATIONS, getCity } from "@/lib/locations";

interface PageProps {
  params: Promise<{ city: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCATIONS.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const c = getCity(city);
  if (!c) return { title: "Location Not Found | Quickupp Softech" };
  return {
    title: `${c.city} | Our Locations | Quickupp Softech`,
    description: c.pages.map((p) => p.h1).slice(0, 4).join(" · "),
  };
}

export default async function Page({ params }: PageProps) {
  const { city } = await params;
  const c = getCity(city);
  if (!c) notFound();
  return <CityView city={c} />;
}

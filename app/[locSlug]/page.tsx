import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocationServiceView } from "@/components/LocationViews";
import { ALL_LOCATION_PAGE_SLUGS, getLocationPage, pageExcerpt } from "@/lib/locations";

/* City service pages keep the exact URLs from the location documents,
   e.g. /social-media-agency-atlanta. Any other path here is a 404. */

interface PageProps {
  params: Promise<{ locSlug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_LOCATION_PAGE_SLUGS.map((locSlug) => ({ locSlug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locSlug } = await params;
  const match = getLocationPage(locSlug);
  if (!match) return { title: "Page Not Found | Quickupp Softech" };
  return {
    title: `${match.page.h1} | Quickupp Softech`,
    description: pageExcerpt(match.page),
  };
}

export default async function Page({ params }: PageProps) {
  const { locSlug } = await params;
  const match = getLocationPage(locSlug);
  if (!match) notFound();
  return <LocationServiceView city={match.city} page={match.page} />;
}

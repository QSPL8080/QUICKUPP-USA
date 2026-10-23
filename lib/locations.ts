/*
 * Location pages — content parsed from the "QS LLC WEBSITE CONTENT <City>.docx"
 * files into data/locations/<city>.json (one file per city, 16 service pages
 * each). Every service page keeps the exact URL given in the documents
 * (e.g. /social-media-agency-atlanta).
 */
import newYork from "@/data/locations/new-york.json";
import losAngeles from "@/data/locations/los-angeles.json";
import chicago from "@/data/locations/chicago.json";
import houston from "@/data/locations/houston.json";
import phoenix from "@/data/locations/phoenix.json";
import dallas from "@/data/locations/dallas.json";
import austin from "@/data/locations/austin.json";
import sanFrancisco from "@/data/locations/san-francisco.json";
import miami from "@/data/locations/miami.json";
import atlanta from "@/data/locations/atlanta.json";

export type LocBlock =
  | { type: "p"; html: string }
  | { type: "list"; items: string[] }
  | { type: "cta"; label: string }
  | { type: "steps"; steps: { num: string; title: string; desc: string }[] }
  | { type: "qa"; q: string; a: string }
  | { type: "chips"; items: string[] }
  | { type: "sub"; title: string; blocks: LocBlock[] };

export interface LocSection {
  heading: string;
  kind: "standard" | "cards" | "steps" | "industries" | "faq" | "closing";
  blocks: LocBlock[];
  faqs?: { q: string; a: string }[];
  chips?: string[];
}

export interface LocPage {
  slug: string;
  h1: string;
  label: string;
  service: string;
  category: "marketing" | "it" | "staff";
  icon: string;
  intro: LocBlock[];
  sections: LocSection[];
}

export interface LocCity {
  city: string;
  slug: string;
  pages: LocPage[];
}

export const LOCATIONS: LocCity[] = [
  newYork,
  losAngeles,
  chicago,
  houston,
  phoenix,
  dallas,
  austin,
  sanFrancisco,
  miami,
  atlanta,
] as LocCity[];

export const CATEGORY_LABELS: Record<LocPage["category"], string> = {
  marketing: "AI-Powered Digital Marketing Services",
  it: "Information Technology Services",
  staff: "Staff Augmentation",
};

export const CATEGORY_ORDER: LocPage["category"][] = ["marketing", "it", "staff"];

export function getCity(slug: string): LocCity | undefined {
  return LOCATIONS.find((c) => c.slug === slug);
}

export function getLocationPage(slug: string): { city: LocCity; page: LocPage } | undefined {
  for (const city of LOCATIONS) {
    const page = city.pages.find((p) => p.slug === slug);
    if (page) return { city, page };
  }
  return undefined;
}

export const ALL_LOCATION_PAGE_SLUGS = LOCATIONS.flatMap((c) => c.pages.map((p) => p.slug));

export const INDUSTRY_LINKS: Record<string, string> = {
  Healthcare: "/industries/healthcare",
  "Home Services": "/industries/home-services",
  "Professional Services": "/industries/professional-services",
  Education: "/industries/education",
  "IT & SaaS": "/industries/it-saas",
  eCommerce: "/industries/ecommerce",
  Ecommerce: "/industries/ecommerce",
  "Real Estate": "/industries/real-estate",
  "Interior Design": "/industries/interior-design",
  "Travel & Hospitality": "/industries/travel-hospitality",
};

/** Plain-text excerpt of the first intro paragraph */
export function pageExcerpt(page: LocPage): string {
  const first = page.intro.find((b) => b.type === "p") as { type: "p"; html: string } | undefined;
  return first ? first.html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&") : "";
}

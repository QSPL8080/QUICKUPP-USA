import { CASE_STUDY_CATEGORIES } from "@/lib/caseStudyCategories";
import { CASE_STUDY_DOCS, type CsBlock, type CsDoc } from "@/data/case-study-docs";

/* Helpers for the case study pages (content comes from data/case-study-docs.ts) */

/** The same order as the case studies list (data/case-study-docs.ts) */
export const CASE_STUDY_ORDER = [
  "neighbors-emergency-center",
  "erics-car-care",
  "stat-specialty-hospital",
  "altus-emergency-centers",
  "exceptional-emergency-center",
  "afa-movers",
  "smoke-it-up",
  "grandewood-pointe",
  "ainsley-heights",
  "kim-bruno-law",
  "jlg-law",
  "lakhani-mcgrath",
  "st-michaels-elite-hospital",
  "eg-elite",
  "madtax",
  "romero-injury-law",
] as const;

export const getCaseStudyDoc = (slug: string): CsDoc | undefined => CASE_STUDY_DOCS[slug];

/** A document's first results row (the headline numbers) */
export const headlineStats = (doc: CsDoc) => (doc.blocks.find((b) => b.type === "stats") as Extract<CsBlock, { type: "stats" }> | undefined)?.items ?? [];

/** Value of a row in the document's info table, by label (e.g. "Client", "Services") */
export const infoValue = (doc: CsDoc, label: string) => {
  const i = doc.info.labels.findIndex((l) => l.toLowerCase().startsWith(label.toLowerCase()));
  return i >= 0 ? doc.info.values[i] : "";
};

/*
 * A cover photo per case study, matched to the client's industry. These are
 * the same Unsplash photos the industry pages use; the cards fall back to a
 * gradient if a photo can't load.
 */
const U = (id: string, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const COVERS: Record<string, string> = {
  "neighbors-emergency-center": "photo-1629909613654-28e377c37b09",
  "stat-specialty-hospital": "photo-1519494026892-80bbd2d6fd0d",
  "altus-emergency-centers": "photo-1516549655169-df83a0774514",
  "exceptional-emergency-center": "photo-1538108149393-fbbd81895907",
  "afa-movers": "photo-1586528116311-ad8dd3c8310d",
  "grandewood-pointe": "photo-1600596542815-ffad4c1539a9",
  "ainsley-heights": "photo-1600585154340-be6161a56a0c",
  "st-michaels-elite-hospital": "photo-1584515979956-d9f6e5d09982",
  "eg-elite": "photo-1553413077-190dd305871c",
  "romero-injury-law": "photo-1556761175-5973dc0f32e7",
};
/* covers supplied for these studies (public/images/case-studies/covers); they take the place of the stock photo */
const OWN_COVERS = new Set(["madtax", "smoke-it-up", "erics-car-care", "kim-bruno-law", "jlg-law", "lakhani-mcgrath"]);

export const caseStudyCover = (slug: string, w = 1600) =>
  OWN_COVERS.has(slug)
    ? `/images/case-studies/covers/${slug}.jpg`
    : COVERS[slug]
      ? U(COVERS[slug], w)
      : "/images/contact-consultancy-meeting.jpg";

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .replace(/(^|[\s/&-])([a-z])/g, (_, a: string, b: string) => a + b.toUpperCase())
    .replace(/\bSeo\b/g, "SEO");

/** Each case study's category (the filter chip and its tag) */
const CATEGORY: Record<string, (typeof CASE_STUDY_CATEGORIES)[number]> = {
  "afa-movers": "Others",
  "ainsley-heights": "Real Estate",
  "altus-emergency-centers": "Healthcare",
  "eg-elite": "Car Shipping",
  "erics-car-care": "Car Care",
  "exceptional-emergency-center": "Healthcare",
  "grandewood-pointe": "Real Estate",
  "jlg-law": "Law Firms",
  "kim-bruno-law": "Law Firms",
  "lakhani-mcgrath": "Law Firms",
  "madtax": "Professional Services",
  "neighbors-emergency-center": "Healthcare",
  "romero-injury-law": "Law Firms",
  "smoke-it-up": "Smoke Shop",
  "st-michaels-elite-hospital": "Healthcare",
  "stat-specialty-hospital": "Healthcare",
};
export const caseStudyArea = (slug: string) => ({ area: CATEGORY[slug] ?? "Others", sector: "" });

/** "RESULTS · GOOGLE MAPS" → "Results · Google Maps" for the page navigator */
export const sectionLabel = (kicker: string) => titleCase(kicker).replace(/’S\b/g, "’s");

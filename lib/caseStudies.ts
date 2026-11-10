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
  "erics-car-care": "photo-1581092918056-0c4c3acd3789",
  "stat-specialty-hospital": "photo-1519494026892-80bbd2d6fd0d",
  "altus-emergency-centers": "photo-1516549655169-df83a0774514",
  "exceptional-emergency-center": "photo-1538108149393-fbbd81895907",
  "afa-movers": "photo-1586528116311-ad8dd3c8310d",
  "smoke-it-up": "photo-1441986300917-64674bd600d8",
  "grandewood-pointe": "photo-1600596542815-ffad4c1539a9",
  "ainsley-heights": "photo-1600585154340-be6161a56a0c",
  "kim-bruno-law": "photo-1507679799987-c73779587ccf",
  "jlg-law": "photo-1450133064473-71024230f91b",
  "lakhani-mcgrath": "photo-1486406146926-c627a92ad1ab",
  "st-michaels-elite-hospital": "photo-1584515979956-d9f6e5d09982",
  "eg-elite": "photo-1553413077-190dd305871c",
  "madtax": "photo-1454165804606-c3d57bc86b40",
  "romero-injury-law": "photo-1556761175-5973dc0f32e7",
};
export const caseStudyCover = (slug: string, w = 1600) => (COVERS[slug] ? U(COVERS[slug], w) : "/images/contact-consultancy-meeting.jpg");

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .replace(/(^|[\s/&-])([a-z])/g, (_, a: string, b: string) => a + b.toUpperCase())
    .replace(/\bSeo\b/g, "SEO");

/** Each case study's category (the filter chip) and its industry tag */
const CATEGORY: Record<string, { area: (typeof CASE_STUDY_CATEGORIES)[number]; sector: string }> = {
  "afa-movers": { area: "Other", sector: "" },
  "ainsley-heights": { area: "Professional Services", sector: "Real Estate" },
  "altus-emergency-centers": { area: "Healthcare", sector: "" },
  "eg-elite": { area: "Automotive", sector: "Car Shipping" },
  "erics-car-care": { area: "Automotive", sector: "Car Care" },
  "exceptional-emergency-center": { area: "Healthcare", sector: "" },
  "grandewood-pointe": { area: "Professional Services", sector: "Real Estate" },
  "jlg-law": { area: "Professional Services", sector: "Law Firms" },
  "kim-bruno-law": { area: "Professional Services", sector: "Law Firms" },
  "lakhani-mcgrath": { area: "Professional Services", sector: "Law Firms" },
  "madtax": { area: "Professional Services", sector: "" },
  "neighbors-emergency-center": { area: "Healthcare", sector: "" },
  "romero-injury-law": { area: "Professional Services", sector: "Law Firms" },
  "smoke-it-up": { area: "E-Commerce", sector: "Smoke Shop" },
  "stat-specialty-hospital": { area: "Healthcare", sector: "" },
  "st-michaels-elite-hospital": { area: "Healthcare", sector: "" },
};
export const caseStudyArea = (slug: string) => CATEGORY[slug] ?? { area: "Other", sector: "" };

/** "RESULTS · GOOGLE MAPS" → "Results · Google Maps" for the page navigator */
export const sectionLabel = (kicker: string) => titleCase(kicker).replace(/’S\b/g, "’s");

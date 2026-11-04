import { CASE_STUDY_DOCS, type CsBlock, type CsDoc } from "@/data/case-study-docs";

/* Helpers for the case study pages (content comes from data/case-study-docs.ts) */

/** The same order as the case studies list (data/case-studies.ts) */
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

/** "CASE STUDY · AUTO REPAIR · MULTI-LOCATION" → "Auto Repair · Multi-location" style label for lists */
export const caseStudyKickerParts = (kicker: string) =>
  kicker
    .split("·")
    .map((s) => s.trim())
    .filter((s) => s && s.toUpperCase() !== "CASE STUDY");

/** A document's first results row (the headline numbers) */
export const headlineStats = (doc: CsDoc) => (doc.blocks.find((b) => b.type === "stats") as Extract<CsBlock, { type: "stats" }> | undefined)?.items ?? [];

/** Value of a row in the document's info table, by label (e.g. "Client", "Services") */
export const infoValue = (doc: CsDoc, label: string) => {
  const i = doc.info.labels.findIndex((l) => l.toLowerCase().startsWith(label.toLowerCase()));
  return i >= 0 ? doc.info.values[i] : "";
};

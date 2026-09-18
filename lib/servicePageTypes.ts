export interface ProcessStep {
  num: string;
  title: string;
  desc: string;
}

export interface ListBlock {
  type: "list";
  title: string;
  subtitle?: string;
  tagline?: string;
  desc?: string;
  items: string[];
  cta?: { label: string; href: string };
  note?: string;
}

export interface DescPairsBlock {
  type: "descPairs";
  title?: string;
  subtitle?: string;
  tagline?: string;
  desc?: string;
  items: { title: string; desc: string }[];
  cta?: { label: string; href: string };
  columns?: 1 | 2 | 3;
}

export interface ProcessBlock {
  type: "process";
  title: string;
  steps: ProcessStep[];
}

export interface WhyChooseBlock {
  type: "whyChoose";
  title?: string;
  tagline: string;
  desc?: string;
  bullets: string[];
  cta?: { label: string; href: string };
}

export interface IndustriesBlock {
  type: "industries";
  industries: string[];
}

export interface AiBlock {
  type: "ai";
  title: string;
  intro?: string;
  bullets?: string[];
  desc?: string;
  cta?: { label: string; href: string };
}

export interface FaqBlock {
  type: "faq";
  items: { q: string; a: string }[];
}

export type ServiceBlock =
  | ListBlock
  | DescPairsBlock
  | ProcessBlock
  | WhyChooseBlock
  | IndustriesBlock
  | AiBlock
  | FaqBlock;

export interface ServicePageData {
  metaTitle: string;
  metaDescription: string;
  crumb: string;
  heroEyebrow: string;
  heroTitle: string;
  heroParagraphs: string[];
  heroCta: { label: string; href: string };
  blocks: ServiceBlock[];
  closingTitle: string;
  closingDesc: string;
  closingCtas: { label: string; href: string }[];
}

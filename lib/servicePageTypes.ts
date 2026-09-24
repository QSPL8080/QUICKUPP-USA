export interface ProcessStep {
  num: string;
  title: string;
  desc?: string;
  text?: string;
}

export interface ListBlock {
  type: "list";
  title: string;
  subtitle?: string;
  tagline?: string;
  intro?: string;
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
  intro?: string;
  desc?: string;
  items: { title: string; desc: string }[];
  cta?: { label: string; href: string };
  columns?: 1 | 2 | 3;
}

export interface ProcessBlock {
  type: "process";
  title: string;
  tagline?: string;
  intro?: string;
  desc?: string;
  steps: ProcessStep[];
  items?: string[];
  cta?: { label: string; href: string };
}

export interface WhyChooseBlock {
  type: "whyChoose";
  title?: string;
  tagline?: string;
  intro?: string;
  desc?: string;
  bullets: string[];
  cta?: { label: string; href: string };
}

export interface IndustriesBlock {
  type: "industries";
  title?: string;
  tagline?: string;
  intro?: string;
  desc?: string;
  industries: string[];
}

export interface AiBlock {
  type: "ai";
  title: string;
  tagline?: string;
  intro?: string;
  bullets?: string[];
  desc?: string;
  cta?: { label: string; href: string };
}

export interface FaqBlock {
  type: "faq";
  title?: string;
  tagline?: string;
  intro?: string;
  desc?: string;
  items: { q: string; a: string }[];
  faqs?: { q: string; a: string }[];
}

export interface CardsBlock {
  type: "cards";
  title?: string;
  intro?: string;
  cards: { title: string; text: string; icon?: string }[];
}

export interface StepsBlock {
  type: "steps";
  title?: string;
  intro?: string;
  steps: { title: string; text: string; num?: string }[];
}

export type ServiceBlock =
  | ListBlock
  | DescPairsBlock
  | ProcessBlock
  | WhyChooseBlock
  | IndustriesBlock
  | AiBlock
  | FaqBlock
  | CardsBlock
  | StepsBlock;

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

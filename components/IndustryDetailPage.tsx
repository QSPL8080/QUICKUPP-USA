"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IndustryMotion from "@/components/IndustryMotion";
import "@/app/industry-sector.css";
import type {
  ServicePageData,
  DescPairsBlock,
  ListBlock,
  ProcessBlock,
  WhyChooseBlock,
  AiBlock,
  FaqBlock,
} from "@/lib/servicePageTypes";

/*
 * Industries subpages — "inx-" sector design, used only here.
 * Every word comes from the page data (data/industries/*.ts); the layout adds
 * no labels, badges or numbers of its own beyond item order.
 */

function CheckSvg({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowRightSvg({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}

// Clean & Simple Category Icon Resolver
function getCategoryIcon(name: string) {
  const n = name.toLowerCase();

  if (n.includes("legal")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18M3 7l9-4 9 4M3 7l3 9a3 3 0 0 0 6 0L9 7M15 7l3 9a3 3 0 0 0 6 0l-3-9" />
      </svg>
    );
  }
  if (n.includes("accounting") || n.includes("tax")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="16" y1="14" x2="16" y2="18" />
        <line x1="12" y1="14" x2="12" y2="18" />
        <line x1="8" y1="14" x2="8" y2="18" />
      </svg>
    );
  }
  if (n.includes("financial")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    );
  }
  if (n.includes("business")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    );
  }
  if (n.includes("management")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (n.includes("it consulting") || n.includes("it ")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
      </svg>
    );
  }
  if (n.includes("marketing") || n.includes("creative")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    );
  }
  if (n.includes("hr") || n.includes("recruitment")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
      </svg>
    );
  }
  if (n.includes("real estate")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2" />
      </svg>
    );
  }
  if (n.includes("architecture") || n.includes("design")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    );
  }
  if (n.includes("engineering") || n.includes("technical")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2" />
      </svg>
    );
  }
  if (n.includes("b2b") || n.includes("other")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }

  // Home Services
  if (n.includes("plumbing")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    );
  }
  if (n.includes("electrical")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    );
  }
  if (n.includes("hvac")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
      </svg>
    );
  }
  if (n.includes("cleaning")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21" />
      </svg>
    );
  }
  if (n.includes("roofing")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    );
  }
  if (n.includes("pest")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }

  return <CheckSvg size={16} />;
}

export interface IndustryMedia {
  hero: string;
  story: string;
  arch: string;
  circle: string;
  video: string;
  ecosystemBg: string;
  channelsBg: string;
  pipelineBg: string;
  processBg: string;
  aiBg: string;
}

// Industry imagery mapping for high-resolution Assurix-style imagery (Strictly Zero Duplicates - 81 Distinct Images)
const industryImages: Record<string, IndustryMedia> = {
  Healthcare: {
    hero: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80",
    story: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80",
    arch: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
    circle: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
    video: "/video/Portfolio 1.mp4",
    ecosystemBg: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1600&q=80",
    channelsBg: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1600&q=80",
    pipelineBg: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1600&q=80",
    processBg: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1600&q=80",
    aiBg: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80",
  },
  Education: {
    hero: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
    story: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80",
    arch: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    circle: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80",
    video: "/video/Portfolio 2.mp4",
    ecosystemBg: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1600&q=80",
    channelsBg: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1600&q=80",
    pipelineBg: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
    processBg: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80",
    aiBg: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
  },
  "Real Estate": {
    hero: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
    story: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80",
    arch: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    circle: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    video: "/video/Portfolio 1.mp4",
    ecosystemBg: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
    channelsBg: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80",
    pipelineBg: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=1600&q=80",
    processBg: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
    aiBg: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1600&q=80",
  },
  "Home Services": {
    hero: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80",
    story: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80",
    arch: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    circle: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=600&q=80",
    video: "/video/Portfolio 2.mp4",
    ecosystemBg: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80",
    channelsBg: "https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&w=1600&q=80",
    pipelineBg: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1600&q=80",
    processBg: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=80",
    aiBg: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=80",
  },
  "IT & SaaS": {
    hero: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1600&q=80",
    story: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
    arch: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    circle: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
    video: "/video/Portfolio 1.mp4",
    ecosystemBg: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
    channelsBg: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
    pipelineBg: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
    processBg: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
    aiBg: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80",
  },
  "Interior Design": {
    hero: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
    story: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80",
    arch: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
    circle: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    video: "/video/Portfolio 2.mp4",
    ecosystemBg: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1600&q=80",
    channelsBg: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1600&q=80",
    pipelineBg: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1600&q=80",
    processBg: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80",
    aiBg: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80",
  },
  "Professional Services": {
    hero: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    story: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80",
    arch: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    circle: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80",
    video: "/video/Portfolio 1.mp4",
    ecosystemBg: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    channelsBg: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80",
    pipelineBg: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1600&q=80",
    processBg: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80",
    aiBg: "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?auto=format&fit=crop&w=1600&q=80",
  },
  eCommerce: {
    hero: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
    story: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1000&q=80",
    arch: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80",
    circle: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=600&q=80",
    video: "/video/Portfolio 1.mp4",
    ecosystemBg: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80",
    channelsBg: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1600&q=80",
    pipelineBg: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1600&q=80",
    processBg: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1600&q=80",
    aiBg: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&q=80",
  },
  "Travel & Hospitality": {
    hero: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    story: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80",
    arch: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
    circle: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80",
    video: "/video/Portfolio 2.mp4",
    ecosystemBg: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    channelsBg: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80",
    pipelineBg: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
    processBg: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=80",
    aiBg: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
  },
};

function getImagesForIndustry(crumb: string): IndustryMedia {
  return (
    industryImages[crumb] || {
      hero: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80",
      story: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80",
      arch: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
      circle: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
      video: "/video/Portfolio 1.mp4",
      ecosystemBg: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1600&q=80",
      processBg: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1600&q=80",
      aiBg: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80",
    }
  );
}

function cleanDash(text: string): string {
  if (!text) return "";
  return text
    .replace(/[—–]/g, " - ")
    .replace(/-{2,}/g, "-")
    .replace(/\s+-\s+/g, " - ");
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Second half of a heading in the site gradient */
function GradientTitle({ text }: { text: string }) {
  const title = cleanDash(text || "");
  const dot = title.split(". ").filter(Boolean);
  if (dot.length >= 2) {
    const cut = Math.ceil(dot.length / 2);
    return (
      <>
        {dot.slice(0, cut).join(". ") + "."} <span className="qs-gradient-text">{dot.slice(cut).join(". ")}</span>
      </>
    );
  }
  const words = title.split(" ");
  if (words.length < 3) return <span className="qs-gradient-text">{title}</span>;
  const cut = Math.ceil(words.length / 2);
  return (
    <>
      {words.slice(0, cut).join(" ")} <span className="qs-gradient-text">{words.slice(cut).join(" ")}</span>
    </>
  );
}

/** A route written as "A → B → C" */
function Route({ text }: { text: string }) {
  const parts = text.split("→").map((s) => s.trim()).filter(Boolean);
  return (
    <ol className="inx-route">
      {parts.map((p, i) => (
        <li key={i}>
          <span className="inx-route-dot" aria-hidden="true" />
          <span className="inx-route-text">{p}</span>
        </li>
      ))}
    </ol>
  );
}

/** Multi-line text: routes, lead-in lines ending in ":" and paragraphs */
function TextFlow({ text, first }: { text?: string; first?: string }) {
  if (!text) return null;
  const lines = cleanDash(text)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return (
    <>
      {lines.map((l, i) =>
        l.includes("→") ? (
          <Route key={i} text={l} />
        ) : l.endsWith(":") ? (
          <p key={i} className="inx-cue">
            {l}
          </p>
        ) : (
          <p key={i} className={i === 0 && first ? first : "inx-text"}>
            {l}
          </p>
        )
      )}
    </>
  );
}

function Cta({ cta, center }: { cta?: { label: string; href: string }; center?: boolean }) {
  if (!cta) return null;
  return (
    <div className={`inx-actions${center ? " inx-actions-center" : ""}`}>
      <Link href={cta.href || "/contact"} className="inx-btn inx-btn-dark">
        <span>{cta.label}</span>
        <ArrowRightSvg />
      </Link>
    </div>
  );
}

/** Crop marks around a framed image */
function Frame({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <figure className={`inx-frame ${className}`}>
      <span className="inx-frame-plate" aria-hidden="true" />
      <img src={src} alt={alt} loading="lazy" />
      <span className="inx-mark inx-mark-tl" aria-hidden="true" />
      <span className="inx-mark inx-mark-tr" aria-hidden="true" />
      <span className="inx-mark inx-mark-bl" aria-hidden="true" />
      <span className="inx-mark inx-mark-br" aria-hidden="true" />
    </figure>
  );
}

/* ---- Services: spotlight cards ------------------------------------------- */
function ServicesBlock({ block, id }: { block: DescPairsBlock; id?: string }) {
  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const cards = e.currentTarget.querySelectorAll<HTMLElement>(".inx-card");
    cards.forEach((c) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty("--inx-x", `${e.clientX - r.left}px`);
      c.style.setProperty("--inx-y", `${e.clientY - r.top}px`);
    });
  }, []);
  const n = block.items.length;
  const cols = n === 4 ? 2 : 3;
  return (
    <section id={id} className="inx-sec">
      <div className="inx-container">
        <div className={`inx-head-split${block.desc ? "" : " inx-head-solo"}`}>
          <div className="inx-head-main">
            {block.subtitle && <p className="inx-eyebrow">{cleanDash(block.subtitle)}</p>}
            {block.title && (
              <h2>
                <GradientTitle text={block.title} />
              </h2>
            )}
          </div>
          {block.desc && (
            <div className="inx-head-side">
              <TextFlow text={block.desc} />
            </div>
          )}
        </div>
        <div className={`inx-cards inx-cards-${cols}`} onPointerMove={onMove}>
          {block.items.map((it, i) => (
            <article key={i} className="inx-card">
              <h3>{cleanDash(it.title)}</h3>
              <p className="inx-text">{cleanDash(it.desc)}</p>
            </article>
          ))}
        </div>
        <Cta cta={block.cta} />
      </div>
    </section>
  );
}

/* ---- Connected bullets: one joined band ------------------------------------ */
function Band({ items }: { items: string[] }) {
  const n = items.length;
  return (
    <ol className="inx-band" style={{ "--inx-n": n } as React.CSSProperties}>
      {items.map((t, i) => (
        <li
          key={i}
          className={i === n - 1 ? "is-last" : undefined}
          style={{ "--inx-l": (n > 1 ? i / (n - 1) : 1).toFixed(3) } as React.CSSProperties}
        >
          <span className="inx-band-text">{t}</span>
        </li>
      ))}
    </ol>
  );
}

/* ---- Text + bullets blocks ------------------------------------------------- */
function AiSection({ block, soft, backdrop }: { block: AiBlock; soft: boolean; backdrop?: string }) {
  const bdProps = backdrop
    ? { style: { "--qs-backdrop": `url('${backdrop}')` } as React.CSSProperties }
    : {};
  const bullets = block.bullets || [];
  const chain = bullets.length > 0 && bullets.length <= 7 && bullets.every((b) => b.length <= 28);
  if (!bullets.length) {
    return (
      <section className={`inx-sec${soft ? " inx-soft" : ""}${backdrop ? " qs-backdrop" : ""}`} {...bdProps}>
        <div className="inx-container inx-split-text">
          <h2>
            <GradientTitle text={block.title} />
          </h2>
          <div className="inx-split-body">
            <TextFlow text={block.intro} first="inx-lead" />
            <TextFlow text={block.desc} />
            <Cta cta={block.cta} />
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className={`inx-sec${soft ? " inx-soft" : ""}${backdrop ? " qs-backdrop" : ""}`} {...bdProps}>
      <div className="inx-container">
        <div className="inx-head-center">
          <h2>
            <GradientTitle text={block.title} />
          </h2>
          <TextFlow text={block.intro} />
        </div>
        {chain ? (
          <Band items={bullets.map((b) => cleanDash(b))} />
        ) : (
          <ul className="inx-matrix">
            {bullets.map((b, i) => (
              <li key={i}>
                <span className="inx-matrix-text">{cleanDash(b)}</span>
              </li>
            ))}
          </ul>
        )}
        {block.desc && (
          <div className="inx-after">
            <TextFlow text={block.desc} />
          </div>
        )}
        <Cta cta={block.cta} center />
      </div>
    </section>
  );
}

/* ---- Who we help: ledger --------------------------------------------------- */
function ListSection({ block, image, alt }: { block: ListBlock; image?: string; alt: string }) {
  return (
    <section className="inx-sec">
      <div className="inx-container inx-ledger-grid">
        <div className="inx-ledger-side">
          {block.tagline && <p className="inx-eyebrow">{cleanDash(block.tagline)}</p>}
          <h2>
            <GradientTitle text={block.title} />
          </h2>
          {block.subtitle && <p className="inx-eyebrow inx-eyebrow-after">{cleanDash(block.subtitle)}</p>}
          <TextFlow text={block.desc} />
          <Cta cta={block.cta} />
          {image && <Frame src={image} alt={alt} className="inx-frame-side" />}
        </div>
        <ul className="inx-ledger">
          {block.items.map((it, i) => (
            <li key={i}>
              <span className="inx-ledger-icon" aria-hidden="true">
                {getCategoryIcon(it)}
              </span>
              <span className="inx-ledger-text">{cleanDash(it)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---- Process: stacking cards ------------------------------------------------ */
function ProcessSection({ block }: { block: ProcessBlock }) {
  const steps = block.steps || [];
  return (
    <section className="inx-sec inx-soft">
      <div className="inx-container">
        <div className="inx-head-center">
          {block.tagline && <p className="inx-eyebrow">{cleanDash(block.tagline)}</p>}
          <h2>
            <GradientTitle text={block.title} />
          </h2>
        </div>
        {steps.length > 0 ? (
          <ol className="inx-stack">
            {steps.map((s, i) => (
              <li key={i} className="inx-stack-card" style={{ top: `calc(118px + ${i * 16}px)` }}>
                <span className="inx-stack-num">{s.num || pad(i + 1)}</span>
                <div className="inx-stack-body">
                  <h3>{cleanDash(s.title)}</h3>
                  <p className="inx-text">{cleanDash(s.desc || s.text || "")}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="inx-process-text">
            <TextFlow text={block.intro} />
            <TextFlow text={block.desc} />
          </div>
        )}
        <Cta cta={block.cta} center />
      </div>
    </section>
  );
}

/* ---- Why choose ---------------------------------------------------------------- */
function WhySection({ block, image, alt }: { block: WhyChooseBlock; image: string; alt: string }) {
  const showTagline = !!block.tagline && !block.bullets.some((b) => b.trim() === block.tagline!.trim());
  return (
    <section className="inx-sec">
      <div className="inx-container inx-why-grid">
        <div className="inx-why-side">
          {showTagline && <p className="inx-eyebrow">{cleanDash(block.tagline!)}</p>}
          {block.title && (
            <h2>
              <GradientTitle text={block.title} />
            </h2>
          )}
          <TextFlow text={block.desc} />
          <Cta cta={block.cta} />
          <Frame src={image} alt={alt} className="inx-frame-why" />
        </div>
        <ul className="inx-why-list">
          {block.bullets.map((b, i) => {
            const t = cleanDash(b);
            const c = t.indexOf(":");
            const has = c > 0 && c < 45;
            return (
              <li key={i}>
                <span className="inx-why-check" aria-hidden="true">
                  <CheckSvg size={14} />
                </span>
                <span className="inx-why-text">
                  {has ? (
                    <>
                      <strong>{t.slice(0, c)}:</strong> {t.slice(c + 1).trim()}
                    </>
                  ) : (
                    t
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---- FAQ ------------------------------------------------------------------------- */
function FaqSection({ block }: { block: FaqBlock }) {
  const items = block.items || block.faqs || [];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="inx-sec">
      <div className="inx-container inx-faq-grid inx-faq-solo">
        <div className="inx-faq">
          {items.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className={`inx-faq-item${isOpen ? " is-open" : ""}`}>
                <button type="button" className="inx-faq-q" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
                  <span className="inx-faq-text">{cleanDash(f.q)}</span>
                  <span className="inx-faq-sign" aria-hidden="true" />
                </button>
                <div className="inx-faq-a">
                  <div>
                    <p className="inx-text">{cleanDash(f.a)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function IndustryDetailPage({ data }: { data: ServicePageData }) {
  const images = getImagesForIndustry(data.crumb);
  /* Soft photo backdrops on two plain list sections: the first and the last AI block */
  const firstAi = data.blocks.findIndex((b) => b.type === "ai");
  const lastAi = data.blocks.map((b) => b.type).lastIndexOf("ai");
  const paras = data.heroParagraphs || [];
  let firstServices = true;
  let listImageUsed = false;
  let softToggle = false;

  return (
    <div className="inx-page">
      <Header />
      <main>
        <section className="inx-hero">
          <div className="inx-hero-bg" aria-hidden="true" />
          <div className="inx-container">
            <nav className="inx-crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/industries">Industries</Link>
              <span aria-hidden="true">/</span>
              <span className="inx-crumb-now">{data.crumb}</span>
            </nav>
            <div className="inx-hero-grid">
              <div className="inx-hero-copy">
                <h1>
                  <GradientTitle text={data.heroTitle} />
                </h1>
                {paras.map((p, i) => (
                  <p key={i} className={i === 0 ? "inx-lead" : "inx-text"}>
                    {cleanDash(p)}
                  </p>
                ))}
                <Cta cta={data.heroCta} />
              </div>
              <figure className="inx-hero-media">
                <span className="inx-frame-plate" aria-hidden="true" />
                <img src={images.hero} alt={data.crumb} loading="eager" />
                <span className="inx-mark inx-mark-tl" aria-hidden="true" />
                <span className="inx-mark inx-mark-tr" aria-hidden="true" />
                <span className="inx-mark inx-mark-bl" aria-hidden="true" />
                <span className="inx-mark inx-mark-br" aria-hidden="true" />
              </figure>
            </div>
          </div>
        </section>

        {data.blocks.map((block, i) => {
          if (block.type === "descPairs") {
            const id = firstServices ? "services-section" : undefined;
            firstServices = false;
            return <ServicesBlock key={i} block={block as DescPairsBlock} id={id} />;
          }
          if (block.type === "ai") {
            softToggle = !softToggle;
            return (
              <AiSection
                key={i}
                block={block as AiBlock}
                soft={softToggle}
                backdrop={i === firstAi ? images.processBg : i === lastAi && lastAi !== firstAi ? images.aiBg : undefined}
              />
            );
          }
          if (block.type === "list") {
            const img = listImageUsed ? undefined : images.story;
            listImageUsed = true;
            return <ListSection key={i} block={block as ListBlock} image={img} alt={data.crumb} />;
          }
          if (block.type === "process") return <ProcessSection key={i} block={block as ProcessBlock} />;
          if (block.type === "whyChoose") return <WhySection key={i} block={block as WhyChooseBlock} image={images.arch} alt={data.crumb} />;
          if (block.type === "faq") return <FaqSection key={i} block={block as FaqBlock} />;
          return null;
        })}

        <section className="inx-close-sec">
          <div className="inx-container">
            <div className="inx-close">
              <div className="inx-close-copy">
                {data.closingTitle && (
                  <h2>
                    <GradientTitle text={data.closingTitle} />
                  </h2>
                )}
                <TextFlow text={data.closingDesc} />
                {data.closingCtas?.length > 0 && (
                  <div className="inx-actions">
                    {data.closingCtas.map((c, i) => (
                      <Link key={i} href={c.href || "/contact"} className={`inx-btn ${i === 0 ? "inx-btn-dark" : "inx-btn-outline"}`}>
                        <span>{c.label}</span>
                        {i === 0 && <ArrowRightSvg />}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div className="inx-close-media" aria-hidden="true">
                <img src={images.ecosystemBg} alt="" loading="lazy" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <IndustryMotion seed={(data.crumb || "").length} />
      <Footer />
    </div>
  );
}

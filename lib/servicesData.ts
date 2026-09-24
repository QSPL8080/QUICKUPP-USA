import type { ServicePageData } from "@/lib/servicePageTypes";

// Digital Marketing
import socialMediaMarketing from "@/data/services/social-media-marketing";
import seoAiSearchVisibility from "@/data/services/seo-ai-search-visibility";
import paidMarketing from "@/data/services/paid-marketing";
import contentMarketing from "@/data/services/content-marketing";
import mediaProduction from "@/data/services/media-production";
import onlineReputationManagement from "@/data/services/online-reputation-management";
import emailMarketing from "@/data/services/email-marketing";
import smsMarketing from "@/data/services/sms-marketing";
import whatsappMarketing from "@/data/services/whatsapp-marketing";

// AI Video Production
import aiAvatarVideo from "@/data/services/ai-avatar-video";
import aiUgcVideo from "@/data/services/ai-ugc-video";
import aiHyperRealisticVideo from "@/data/services/ai-hyper-realistic-video";
import digitalTwinCloneVideo from "@/data/services/digital-twin-clone-video";

// AI & Automation Solutions
import aiAutomationSolutions from "@/data/services/ai-automation-solutions";

// Information Technology Services
import webDesignDevelopment from "@/data/services/web-design-development";
import applicationDevelopment from "@/data/services/application-development";
import productEngineering from "@/data/services/product-engineering";
import qualityAssuranceTesting from "@/data/services/quality-assurance-testing";
import uiUxDesign from "@/data/services/ui-ux-design";

// Staff Augmentation
import marketingDesignStaffAugmentation from "@/data/services/marketing-design-staff-augmentation";
import itStaffAugmentation from "@/data/services/it-staff-augmentation";

export interface ServiceCategoryMeta {
  categorySlug: string;
  categoryLabel: string;
  categoryDesc: string;
  services: {
    slug: string;
    label: string;
    desc: string;
    icon: string;
    template: "merkil" | "ritovex" | "itlifecycle" | "aivideo";
    data: ServicePageData;
  }[];
}

export type ServiceCategory = ServiceCategoryMeta;

export const serviceCategories: ServiceCategoryMeta[] = [
  {
    categorySlug: "ai-powered-digital-marketing-services",
    categoryLabel: "AI-Powered Digital Marketing Services",
    categoryDesc:
      "Scale your visibility, drive qualified inbound pipeline, and maximize ROI across all search, social, and paid channels with AI-powered marketing.",
    services: [
      {
        slug: "social-media-marketing",
        label: "Social Media Marketing",
        desc: "Build brand & engage audience across every major platform.",
        icon: "📱",
        template: "merkil",
        data: socialMediaMarketing,
      },
      {
        slug: "seo-ai-search-visibility",
        label: "SEO & AI Search Visibility",
        desc: "Rank on Google & get discovered in AI search engines.",
        icon: "🔍",
        template: "merkil",
        data: seoAiSearchVisibility,
      },
      {
        slug: "paid-marketing",
        label: "Paid Marketing",
        desc: "High-ROI ads across Google, Meta, LinkedIn & AI channels.",
        icon: "🎯",
        template: "merkil",
        data: paidMarketing,
      },
      {
        slug: "content-marketing",
        label: "Content Marketing",
        desc: "Authority content that builds trust & converts readers.",
        icon: "✍️",
        template: "merkil",
        data: contentMarketing,
      },
      {
        slug: "media-production",
        label: "Media Production",
        desc: "High-impact video production, motion & brand creatives.",
        icon: "🎬",
        template: "merkil",
        data: mediaProduction,
      },
      {
        slug: "online-reputation-management",
        label: "Online Reputation Management",
        desc: "Protect brand integrity & build 5-star customer trust.",
        icon: "🛡️",
        template: "merkil",
        data: onlineReputationManagement,
      },
      {
        slug: "email-marketing",
        label: "Email Marketing",
        desc: "Turn customer lists into repeat revenue machines.",
        icon: "✉️",
        template: "merkil",
        data: emailMarketing,
      },
      {
        slug: "sms-marketing",
        label: "SMS Marketing",
        desc: "Instant high-open-rate mobile messaging & promos.",
        icon: "💬",
        template: "merkil",
        data: smsMarketing,
      },
      {
        slug: "whatsapp-marketing",
        label: "WhatsApp Marketing",
        desc: "Direct conversational sales & automated customer flows.",
        icon: "📲",
        template: "merkil",
        data: whatsappMarketing,
      },
    ],
  },
  {
    categorySlug: "ai-video-production",
    categoryLabel: "AI Video Production",
    categoryDesc:
      "Generate studio-grade, hyper-realistic, and multilingual video content with cutting-edge AI avatars, clones, and synthesis.",
    services: [
      {
        slug: "ai-avatar-video",
        label: "AI Avatar Video",
        desc: "Lifelike multilingual AI presenters in minutes.",
        icon: "👤",
        template: "aivideo",
        data: aiAvatarVideo,
      },
      {
        slug: "ai-ugc-video",
        label: "AI UGC Video",
        desc: "Authentic user-generated style videos at scale.",
        icon: "🤳",
        template: "aivideo",
        data: aiUgcVideo,
      },
      {
        slug: "ai-hyper-realistic-video",
        label: "AI Hyper-Realistic Video",
        desc: "Cinematic quality AI visuals for campaigns.",
        icon: "🎥",
        template: "aivideo",
        data: aiHyperRealisticVideo,
      },
      {
        slug: "digital-twin-clone-video",
        label: "Digital Twin & Clone Video",
        desc: "Scale your executive presence with custom clones.",
        icon: "👥",
        template: "aivideo",
        data: digitalTwinCloneVideo,
      },
    ],
  },
  {
    categorySlug: "ai-automation-solutions",
    categoryLabel: "AI & Automation Solutions",
    categoryDesc:
      "Modernize manual operations, sync CRM workflows, and embed customized autonomous AI agents into your business operations.",
    services: [
      {
        slug: "ai-automation-solutions",
        label: "AI & Automation Solutions",
        desc: "Automate workflows, CRM sync & enterprise intelligence.",
        icon: "⚡",
        template: "ritovex",
        data: aiAutomationSolutions,
      },
    ],
  },
  {
    categorySlug: "information-technology-services",
    categoryLabel: "Information Technology Services",
    categoryDesc:
      "Build custom, performant, and resilient web platforms, mobile applications, software architectures, and intuitive UI/UX experiences.",
    services: [
      {
        slug: "web-design-development",
        label: "Web Design & Development",
        desc: "Custom, lightning-fast high-converting platforms.",
        icon: "🌐",
        template: "itlifecycle",
        data: webDesignDevelopment,
      },
      {
        slug: "application-development",
        label: "Application Development",
        desc: "Scalable iOS, Android & cross-platform apps.",
        icon: "📱",
        template: "itlifecycle",
        data: applicationDevelopment,
      },
      {
        slug: "product-engineering",
        label: "Product Engineering",
        desc: "Enterprise architecture & custom SaaS platforms.",
        icon: "⚙️",
        template: "itlifecycle",
        data: productEngineering,
      },
      {
        slug: "quality-assurance-testing",
        label: "Quality Assurance & Testing",
        desc: "Rigorous automated testing & vulnerability audits.",
        icon: "🧪",
        template: "itlifecycle",
        data: qualityAssuranceTesting,
      },
      {
        slug: "ui-ux-design",
        label: "UI/UX Design",
        desc: "Intuitive, high-retention digital interfaces.",
        icon: "🎨",
        template: "itlifecycle",
        data: uiUxDesign,
      },
    ],
  },
  {
    categorySlug: "staff-augmentation",
    categoryLabel: "Staff Augmentation",
    categoryDesc:
      "Scale your engineering, design, and marketing teams quickly with top 1% vetted developers, growth architects, and creative specialists.",
    services: [
      {
        slug: "marketing-design-staff-augmentation",
        label: "Marketing & Design Staff Augmentation",
        desc: "Top 1% vetted growth marketers & designers.",
        icon: "🎨",
        template: "ritovex",
        data: marketingDesignStaffAugmentation,
      },
      {
        slug: "it-staff-augmentation",
        label: "IT Staff Augmentation",
        desc: "Dedicated senior software engineers & AI devs.",
        icon: "💻",
        template: "ritovex",
        data: itStaffAugmentation,
      },
    ],
  },
];

export function getServiceByCategoryAndSlug(categorySlug: string, serviceSlug: string) {
  const category = serviceCategories.find((cat) => cat.categorySlug === categorySlug);
  if (!category) return null;
  const service = category.services.find((s) => s.slug === serviceSlug);
  if (!service) return null;
  return {
    category,
    service,
  };
}

export function getAllCategorizedServiceParams() {
  const params: { category: string; slug: string }[] = [];
  for (const cat of serviceCategories) {
    for (const s of cat.services) {
      params.push({ category: cat.categorySlug, slug: s.slug });
    }
  }
  return params;
}

export function getAllCategoryParams() {
  return serviceCategories.map((cat) => ({ category: cat.categorySlug }));
}

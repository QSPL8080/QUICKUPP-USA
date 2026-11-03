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

// AI & Automation Solutions
import aiAutomationSolutions from "@/data/services/ai-automation-solutions";
import aiChatbotDevelopment from "@/data/services/ai-chatbot-development";
import aiAgentDevelopment from "@/data/services/ai-agent-development";
import aiWorkflowAutomation from "@/data/services/ai-workflow-automation";
import aiCrmAutomation from "@/data/services/ai-crm-automation";
import aiLeadGenerationQualification from "@/data/services/ai-lead-generation-qualification";
import aiCustomerSupportAutomation from "@/data/services/ai-customer-support-automation";
import aiDocumentProcessing from "@/data/services/ai-document-processing";
import aiApiIntegration from "@/data/services/ai-api-integration";
import customAiSolutions from "@/data/services/custom-ai-solutions";

// Information Technology Services
import webDesignDevelopment from "@/data/services/web-design-development";
import applicationDevelopment from "@/data/services/application-development";
import productEngineering from "@/data/services/product-engineering";
import qualityAssuranceTesting from "@/data/services/quality-assurance-testing";
import uiUxDesign from "@/data/services/ui-ux-design";

// Staff Augmentation
import marketingDesignStaffAugmentation from "@/data/services/marketing-design-staff-augmentation";
import itStaffAugmentation from "@/data/services/it-staff-augmentation";

interface ServiceCategoryMeta {
  categorySlug: string;
  categoryLabel: string;
  categoryDesc: string;
  services: {
    slug: string;
    label: string;
    desc: string;
    icon: string;
    template: "merkil" | "copora" | "aiautomation" | "staffaug";
    data: ServicePageData;
  }[];
}

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
    categorySlug: "ai-automation-solutions",
    categoryLabel: "AI & Automation Solutions",
    categoryDesc:
      "Modernize manual operations, sync CRM workflows, and embed customized autonomous AI agents into your business operations.",
    services: [
      {
        slug: "ai-chatbot-development",
        label: "AI Chatbot Development",
        desc: "Intelligent conversational chatbots for websites, support & sales.",
        icon: "🤖",
        template: "aiautomation",
        data: aiChatbotDevelopment,
      },
      {
        slug: "ai-agent-development",
        label: "AI Agent Development",
        desc: "Autonomous AI agents to execute tasks, make decisions & automate.",
        icon: "🧠",
        template: "aiautomation",
        data: aiAgentDevelopment,
      },
      {
        slug: "ai-workflow-automation",
        label: "AI Workflow Automation",
        desc: "End-to-end automation of manual business processes & pipelines.",
        icon: "⚡",
        template: "aiautomation",
        data: aiWorkflowAutomation,
      },
      {
        slug: "ai-crm-automation",
        label: "AI-Powered CRM Automation",
        desc: "Sync customer data, pipeline stages & automated outreach.",
        icon: "👥",
        template: "aiautomation",
        data: aiCrmAutomation,
      },
      {
        slug: "ai-lead-generation-qualification",
        label: "AI Lead Generation & Qualification",
        desc: "Capture, qualify, and score high-intent leads automatically.",
        icon: "🎯",
        template: "aiautomation",
        data: aiLeadGenerationQualification,
      },
      {
        slug: "ai-customer-support-automation",
        label: "AI Customer Support Automation",
        desc: "24/7 automated resolution, ticketing & smart escalations.",
        icon: "🎧",
        template: "aiautomation",
        data: aiCustomerSupportAutomation,
      },
      {
        slug: "ai-document-processing",
        label: "AI Document Processing",
        desc: "Intelligent OCR, data extraction & document classification.",
        icon: "📄",
        template: "aiautomation",
        data: aiDocumentProcessing,
      },
      {
        slug: "ai-api-integration",
        label: "AI API Integration",
        desc: "Seamless LLM, custom AI model & enterprise API integrations.",
        icon: "🔌",
        template: "aiautomation",
        data: aiApiIntegration,
      },
      {
        slug: "custom-ai-solutions",
        label: "Custom AI Solutions",
        desc: "Bespoke AI architectures built for proprietary business workflows.",
        icon: "✨",
        template: "aiautomation",
        data: customAiSolutions,
      },
      {
        slug: "ai-automation-solutions",
        label: "AI & Automation Solutions",
        desc: "Automate workflows, CRM sync & enterprise intelligence.",
        icon: "⚡",
        template: "aiautomation",
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
        template: "copora",
        data: webDesignDevelopment,
      },
      {
        slug: "application-development",
        label: "Application Development",
        desc: "Scalable iOS, Android & cross-platform apps.",
        icon: "📱",
        template: "copora",
        data: applicationDevelopment,
      },
      {
        slug: "product-engineering",
        label: "Product Engineering",
        desc: "Enterprise architecture & custom SaaS platforms.",
        icon: "⚙️",
        template: "copora",
        data: productEngineering,
      },
      {
        slug: "quality-assurance-testing",
        label: "Quality Assurance & Testing",
        desc: "Rigorous automated testing & vulnerability audits.",
        icon: "🧪",
        template: "copora",
        data: qualityAssuranceTesting,
      },
      {
        slug: "ui-ux-design",
        label: "UI/UX Design",
        desc: "Intuitive, high-retention digital interfaces.",
        icon: "🎨",
        template: "copora",
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
        template: "staffaug",
        data: marketingDesignStaffAugmentation,
      },
      {
        slug: "it-staff-augmentation",
        label: "IT Staff Augmentation",
        desc: "Dedicated senior software engineers & AI devs.",
        icon: "💻",
        template: "staffaug",
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

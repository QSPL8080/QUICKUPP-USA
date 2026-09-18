import type { ServicePageData } from "@/lib/servicePageTypes";

const data: ServicePageData = {
  metaTitle: "Email Marketing Services | Quickupp Softech",
  metaDescription:
    "Connect with your audience, nurture leads and drive conversions with strategic Email Marketing Services from Quickupp Softech.",
  crumb: "Email Marketing Services",
  heroEyebrow: "Email Marketing Services",
  heroTitle: "Turn Emails Into Customer Relationships & Business Growth",
  heroParagraphs: [
    "Connect with your audience, nurture leads and drive conversions with strategic Email Marketing Services from Quickupp Softech.",
    "We create targeted email campaigns that help businesses generate leads, promote products and services, nurture prospects and build long-term customer relationships.",
  ],
  heroCta: { label: "Get Your Email Marketing Strategy", href: "/contact" },
  blocks: [
    {
      type: "list",
      title: "Our Email Marketing Services",
      items: [
        "Email Marketing Services",
        "Email Marketing Campaigns",
        "Email Marketing Management",
        "Email Newsletter Services",
        "Promotional Email Campaigns",
        "Lead Nurturing",
        "Email Automation",
        "Drip Email Campaigns",
        "Customer Retention Emails",
        "Ecommerce Email Marketing",
        "B2B Email Marketing",
        "Email Copywriting",
        "Email Campaign Optimization",
        "Email Performance Reporting",
      ],
    },
    {
      type: "process",
      title: "Our Email Marketing Process",
      steps: [
        { num: "01", title: "Strategy", desc: "Understand your audience and business goals." },
        { num: "02", title: "Segmentation", desc: "Target customers based on interests and behavior." },
        { num: "03", title: "Content", desc: "Create engaging email copy and designs." },
        { num: "04", title: "Automation", desc: "Set up personalized email workflows." },
        { num: "05", title: "Optimize", desc: "Track and improve campaign performance." },
      ],
    },
    {
      type: "whyChoose",
      title: "Why Choose Quickupp Softech?",
      tagline: "Data-Driven Email Strategies",
      bullets: [
        "Data-Driven Email Strategies",
        "Engaging Email Content",
        "Automated Campaigns",
        "Audience Segmentation",
        "Lead Nurturing Strategies",
        "Performance Tracking",
        "Conversion-Focused Campaigns",
      ],
    },
    {
      type: "industries",
      industries: [
        "Healthcare",
        "Home Services",
        "Professional Services",
        "Education",
        "IT & SaaS",
        "eCommerce",
        "Real Estate",
        "Interior Design",
        "Travel & Hospitality",
        "Automotive",
      ],
    },
    {
      type: "faq",
      items: [
        {
          q: "What is Email Marketing?",
          a: "Email marketing is a digital marketing strategy that uses targeted emails to communicate with customers, nurture leads and drive conversions.",
        },
        {
          q: "Do you provide Email Automation?",
          a: "Yes. We can handle automated workflows including welcome emails, lead nurturing, follow-ups and customer retention campaigns.",
        },
        {
          q: "Can you manage email newsletters?",
          a: "Yes. We can handle newsletter strategy, content, design, scheduling and performance tracking.",
        },
      ],
    },
  ],
  closingTitle: "Grow Your Business With Smarter Email Marketing",
  closingDesc:
    "Build stronger customer relationships and turn your email list into a valuable growth channel with Quickupp Softech.\n\nMarketing. AI. Technology. Built for Growth.",
  closingCtas: [{
    label: "Talk to Our Email Marketing Experts",
    href: "/contact",
  }],
};

export default data;

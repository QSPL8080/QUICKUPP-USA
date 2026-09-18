import type { ServicePageData } from "@/lib/servicePageTypes";


export const data: ServicePageData = {
  metaTitle: "SMS Marketing Services | Quickupp Softech",
  metaDescription:
    "Connect with customers directly through timely, personalized and engaging text messages. Quickupp Softech provides SMS Marketing Services.",
  crumb: "SMS Marketing Services",
  heroEyebrow: "SMS Marketing Services",
  heroTitle: "Reach Customers Instantly With Targeted SMS Marketing",
  heroParagraphs: [
    "Connect with customers directly through timely, personalized and engaging text messages.",
    "Quickupp Softech provides SMS Marketing Services that help businesses promote offers, generate leads, send updates, nurture customers and drive conversions through targeted SMS campaigns.",
  ],
  heroCta: { label: "Get Your SMS Marketing Strategy", href: "/contact" },
  blocks: [
    {
      type: "list",
      title: "Our SMS Marketing Services",
      items: [
        "SMS Marketing Services",
        "SMS Marketing Campaigns",
        "Bulk SMS Marketing",
        "Promotional SMS",
        "Transactional SMS",
        "SMS Lead Generation",
        "SMS Automation",
        "Customer Retention SMS",
        "Offer & Promotion SMS",
        "Appointment Reminder SMS",
        "Event & Campaign SMS",
        "Personalized SMS Marketing",
        "SMS Campaign Management",
        "SMS Marketing Analytics",
      ],
    },
    {
      type: "process",
      title: "Our SMS Marketing Process",
      steps: [
        { num: "01", title: "Strategy", desc: "Define your audience and campaign objectives." },
        { num: "02", title: "Segmentation", desc: "Target relevant customer groups." },
        { num: "03", title: "Campaign Creation", desc: "Develop concise, action-focused SMS content." },
        { num: "04", title: "Delivery", desc: "Launch campaigns through appropriate SMS channels." },
        { num: "05", title: "Optimize", desc: "Track results and improve campaign performance." },
      ],
    },
    {
      type: "whyChoose",
      title: "Why Choose Quickupp Softech?",
      tagline: "Targeted SMS Campaigns",
      bullets: [
        "Targeted SMS Campaigns",
        "Personalized Messaging",
        "Automated SMS Workflows",
        "Lead & Customer Engagement",
        "Conversion-Focused Strategies",
        "Performance Tracking",
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
          q: "What is SMS Marketing?",
          a: "SMS marketing uses text messages to communicate directly with customers, promote offers, share updates and drive action.",
        },
        {
          q: "Do you provide Bulk SMS Marketing?",
          a: "Yes. We can help businesses plan and manage targeted bulk SMS campaigns for promotional and customer communication purposes.",
        },
        {
          q: "Can SMS Marketing be automated?",
          a: "Yes. Automated SMS can be used for reminders, follow-ups, customer engagement and other communication workflows.",
        },
      ],
    },
  ],
  closingTitle: "Connect With Customers Faster",
  closingDesc:
    "Reach your audience with relevant messages at the right time through SMS Marketing Services by Quickupp Softech.\n^Marketing. AI. Technology. Built for Growth.",
  closingCtas: [{ label: "Talk to Our SMS Marketing Experts", href: "/contact" }],
};

export default data;

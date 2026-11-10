/*
 * Home page copy, word for word from "Quickupp_Softech_Full_Homepage_Content_Updated.docx".
 * Nothing here is added; links point each call to action at the matching page.
 */

export const CALENDLY_URL = "https://calendly.com/quickuppsoftechmeet/strategy-call";

export const HERO = {
  eyebrow: ["MARKETING.", "AI.", "TECHNOLOGY.", "BUILT FOR GROWTH."],
  title: ["Build Smarter.", "Grow Faster.", "Scale with Confidence."],
  text: "We help businesses accelerate growth through performance-driven digital marketing, AI-powered automation, custom technology, and scalable business solutions. From generating qualified leads to streamlining operations and building digital products, we bring strategy and execution together to help your business move forward.",
  primary: { label: "Book a Discovery Call", href: CALENDLY_URL, external: true },
  secondary: { label: "Explore Our Services", href: "#services" },
  supporting: ["Strategic expertise.", "Practical solutions.", "Global delivery."],
};

export const TRUST = {
  count: 1000,
  countSuffix: "+",
  titleRest: "Trusted Clients Over Worldwide",
  subtitle: "Your Partner for Digital Growth and Transformation",
  services: ["Digital Marketing", "AI & Automation", "Software Development", "Staff Augmentation"],
};

export const ABOUT = {
  title: ["Business Growth Meets", "Technology."],
  text: [
    "Quickupp Softech brings marketing, AI, and technology together to help businesses solve practical challenges and pursue meaningful growth. We help strengthen digital presence, generate business opportunities, improve operational efficiency, and build scalable digital solutions around your goals.",
    "Whether you need a stronger customer acquisition strategy, connected business workflows, or technology built for your next stage, our team works with you to identify the right approach and move from planning to execution.",
  ],
  cta: { label: "Get to Know Us", href: "/about" },
};

export type HomeService = {
  num: string;
  title: string;
  text: string;
  points: string[];
  cta: { label: string; href: string; external?: boolean };
  img: string;
  icon: "megaphone" | "bot" | "code-xml" | "users" | "clapperboard" | "play";
};

export const SERVICES = {
  title: ["Solutions Designed Around", "Your Business Goals"],
  text: "From customer acquisition to digital transformation, our services help businesses solve practical challenges, improve efficiency, and build for long-term growth.",
  items: [
    {
      num: "01",
      title: "AI-Powered Digital Marketing",
      text: "Build visibility, attract relevant audiences, and turn marketing activity into measurable business opportunities.",
      points: [
        "Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads, Snapchat Ads and YouTube Ads",
        "Search Engine Optimization (SEO) and AI Search Optimization (AEO/GEO)",
        "Social Media Marketing and Content Strategy",
        "Lead Generation and Conversion Optimization",
        "Campaign Tracking, Reporting and Performance Improvement",
      ],
      cta: { label: "Explore Digital Marketing Services", href: "/services/ai-powered-digital-marketing-services" },
      img: "https://images.unsplash.com/photo-1686061592689-312bbfb5c055?auto=format&fit=crop&w=1400&q=80",
      icon: "megaphone",
    },
    {
      num: "02",
      title: "AI & Automation Solutions",
      text: "Reduce repetitive work and create more connected customer and business workflows with practical AI and automation.",
      points: [
        "AI Chatbots and AI Agents",
        "CRM and Lead Management Automation",
        "Automated Lead Follow-ups and Appointment Workflows",
        "Customer Support Automation",
        "Workflow Integrations and Business Process Automation",
      ],
      cta: { label: "Explore AI Solutions", href: "/services/ai-automation-solutions" },
      img: "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?auto=format&fit=crop&w=1400&q=80",
      icon: "bot",
    },
    {
      num: "03",
      title: "IT Services",
      text: "Plan, design, develop, and improve digital products and systems aligned with your business requirements.",
      points: [
        "Custom Software Development",
        "Website Development and Web Applications",
        "Mobile App Development",
        "API Development and Integrations",
        "Cloud Solutions, UI/UX Design and Application Improvements",
      ],
      cta: { label: "Explore IT Services", href: "/services/information-technology-services" },
      img: "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=1400&q=80",
      icon: "code-xml",
    },
    {
      num: "04",
      title: "Staff Augmentation",
      text: "Extend your team with technical and digital specialists based on project scope, timelines, and availability.",
      points: [
        "Software Developers and Engineers",
        "QA and Testing Specialists",
        "UI/UX Designers",
        "Digital Marketing Specialists",
        "Additional technical or business support roles based on requirements",
      ],
      cta: { label: "Find Your Talent", href: "/services/staff-augmentation" },
      img: "https://images.unsplash.com/photo-1758691737124-05c5bffe46f0?auto=format&fit=crop&w=1400&q=80",
      icon: "users",
    },
    {
      num: "05",
      title: "AI Video Production",
      text: "Create video content for product communication, advertising, and brand storytelling using AI-assisted production workflows.",
      points: [
        "AI Avatar and Spokesperson Videos",
        "UGC-Style Ad Creatives",
        "Product Explainer Videos",
        "Multilingual Video Content",
        "Creative Variations for Marketing Campaigns",
      ],
      cta: { label: "Explore AI Video Production Services", href: "https://quickuppaistudio.us/", external: true },
      img: "https://images.unsplash.com/photo-1574717025179-0b6d03d4d86f?auto=format&fit=crop&w=1400&q=80",
      icon: "clapperboard",
    },
    {
      num: "06",
      title: "YouTube Video Promotion",
      text: "Reach relevant audiences and support campaign objectives through targeted YouTube advertising.",
      points: [
        "YouTube Ads Campaign Setup",
        "Audience and Placement Targeting",
        "Campaign Management and Optimization",
        "Performance Tracking and Reporting",
      ],
      cta: { label: "Explore YouTube Advertising Services", href: "/services/youtube-video-promotion" },
      img: "https://images.unsplash.com/photo-1764162051349-7cc989a1399d?auto=format&fit=crop&w=1400&q=80",
      icon: "play",
    },
  ] as HomeService[],
};

export const WHY = {
  title: ["One Partner. Connected Solutions.", "Clear Priorities."],
  text: "You do not need disconnected vendors for every business challenge. Quickupp Softech brings marketing, AI, and technology capabilities together to help you choose practical solutions and execute with clarity.",
  points: [
    { title: "Strategy Before Execution", text: "We start by understanding your goals, audience, challenges, and constraints before recommending a direction.", icon: "target" },
    { title: "Multiple Capabilities Under One Roof", text: "Connect digital marketing, automation, and technology delivery through one coordinated partner.", icon: "layers" },
    { title: "Clear Communication", text: "Keep priorities, responsibilities, progress, and next steps visible throughout the engagement.", icon: "message-circle" },
    { title: "Flexible Engagement Models", text: "Shape the scope and working model around your project requirements and business needs.", icon: "sliders-horizontal" },
    {
      title: "A Focus on Business Outcomes",
      text: "Align the work with relevant objectives such as qualified inquiries, operational efficiency, customer experience, or product delivery.",
      icon: "trending-up",
    },
  ] as const,
  cta: { label: "Discuss Your Business Goals", href: "/contact" },
};

export const WORK = {
  title: ["Practical Solutions.", "Built Around Real Business Needs."],
  text: [
    "Every business has a different challenge. We bring together digital marketing, AI automation, and technology to develop solutions aligned with real business goals.",
    "Explore selected projects to discover our approach, the challenges we address, and the value our work is designed to deliver-from generating qualified leads and improving campaign performance to streamlining workflows and building digital experiences.",
  ],
  primary: { label: "Explore Our Case Studies", href: "/case-studies" },
  secondary: { label: "View Our Portfolio", href: "/portfolio" },
};

export const VOICES = {
  title: ["Strong Partnerships Start with", "Understanding."],
  text: "We believe good work starts with listening, clear expectations, and consistent collaboration. Read feedback from clients who have worked with our team on their marketing, automation, or technology goals.",
  cta: { label: "Explore Client Success Stories", href: "/testimonials" },
};

export const PROCESS = {
  title: ["A Clear Process from", "Strategy to Execution."],
  steps: [
    { num: "01", title: "Discover", text: "Understand your business, audience, requirements, current systems, and goals.", icon: "search" },
    { num: "02", title: "Strategize", text: "Identify opportunities and recommend an approach that fits your priorities.", icon: "compass" },
    { num: "03", title: "Plan", text: "Define scope, deliverables, responsibilities, timelines, and success measures.", icon: "layout-grid" },
    { num: "04", title: "Execute", text: "Deliver the agreed work with clear communication and progress updates.", icon: "rocket" },
    { num: "05", title: "Improve", text: "Review relevant results, gather feedback, and identify opportunities for improvement.", icon: "trending-up" },
  ] as const,
  cta: { label: "Start a Conversation", href: "/contact" },
};

export const INDUSTRIES = {
  eyebrow: "INDUSTRIES WE SUPPORT",
  title: ["Industry-Aware Solutions.", "Business-Focused Execution."],
  text: "We adapt our digital marketing, AI automation, and technology solutions to the unique needs of different industries-helping businesses attract the right customers, improve operations, and scale with confidence.",
  items: [
    { name: "Healthcare & Medical", text: "HIPAA-aware marketing strategies, patient inquiry management, appointment workflows, and digital growth solutions.", icon: "heart-pulse" },
    { name: "Home Services", text: "High-intent local lead generation, service inquiry management, automated follow-ups, and booking workflows for home service businesses.", icon: "house" },
    { name: "Professional Services", text: "B2B lead generation, brand authority, customer acquisition, and sales pipeline development.", icon: "briefcase" },
    { name: "Education & E-Learning", text: "Student enrollment campaigns, digital visibility, learning platforms, and admission workflow automation.", icon: "graduation-cap" },
    { name: "IT & SaaS", text: "Product-led growth, software development, demand generation, and recurring revenue growth support.", icon: "cpu" },
    { name: "eCommerce & Retail", text: "Customer acquisition, performance marketing, conversion optimization, and e-commerce growth strategies.", icon: "shopping-bag" },
    { name: "Real Estate", text: "High-intent buyer and seller lead generation, property marketing, customer follow-up automation, and web platforms.", icon: "building" },
    {
      name: "Interior Design & Home Improvement",
      text: "Premium homeowner lead generation, portfolio branding, project inquiries, and customer nurturing for interior design and renovation businesses.",
      icon: "sofa",
    },
    { name: "Travel & Hospitality", text: "Direct booking campaigns, customer engagement, digital marketing, and experience-focused brand storytelling.", icon: "plane" },
    { name: "Manufacturing & Logistics", text: "B2B lead generation, workflow automation, custom applications, and systems integration.", icon: "factory" },
    {
      name: "Financial Services & FinTech",
      text: "Digital experiences, customer inquiry workflows, and technology solutions designed with applicable regulatory requirements in mind.",
      icon: "landmark",
    },
    { name: "Legal Services & Legal Tech", text: "Digital visibility, client inquiry management, appointment workflows, and legal technology solutions.", icon: "scale" },
    { name: "Automotive & Mobility", text: "Customer acquisition campaigns, service inquiries, digital visibility, and customer engagement automation.", icon: "car" },
    {
      name: "Food, Restaurants & Cafés",
      text: "Local marketing, customer acquisition, promotional campaigns, reservation inquiries, and repeat-customer engagement.",
      icon: "utensils",
    },
    { name: "Solar & Renewable Energy", text: "Lead generation, quotation inquiries, customer follow-ups, and marketing automation.", icon: "sun" },
    { name: "HR, Recruitment & Staffing", text: "Employer branding, candidate acquisition, recruitment workflows, and process automation.", icon: "users-round" },
    { name: "Startups, SMEs & B2B Businesses", text: "Growth marketing, AI adoption, custom technology, demand generation, and scalable business solutions.", icon: "rocket" },
  ],
  cta: { label: "Discuss Your Business Needs", href: "/contact" },
};

export const TECH = {
  title: ["The Right Technology", "for the Right Business Problem."],
  text: "We select technologies based on your product, users, integrations, performance needs, and long-term plans. Our capabilities may include:",
  rows: [
    { label: "Web Development", items: ["React", "Next.js", "Angular", "TypeScript"], icon: "globe" },
    { label: "Backend Development", items: ["Node.js", "Python", "PHP"], icon: "settings" },
    { label: "Mobile Development", items: ["Flutter", "React Native"], icon: "smartphone" },
    { label: "Databases", items: ["PostgreSQL", "MySQL", "MongoDB"], icon: "layers" },
    { label: "Cloud & DevOps", items: ["AWS", "Azure", "Docker"], icon: "cloud" },
    { label: "AI & Integrations", items: ["AI models", "APIs", "CRM platforms", "workflow automation"], icon: "workflow" },
  ],
  cta: { label: "Discuss Your Technology Project", href: "/contact" },
};

export const INSIGHTS = {
  title: ["Ideas and Insights for", "Smarter Business Growth."],
  text: "Explore practical insights on digital marketing, AI automation, software development, and technology-led business improvement. Our resources are designed to help business leaders understand options, make informed decisions, and identify opportunities for growth.",
  cta: { label: "Explore All Insights", href: "/blog" },
};

export const FINAL = {
  title: ["Let's Talk About Your", "Next Move."],
  text: "Tell us about your business challenge, upcoming project, or growth opportunity. We'll review your requirements and discuss the next steps for finding the right solution.",
  primary: { label: "Request a Project Proposal", href: "/contact" },
  secondary: { label: "Book a Discovery Call", href: CALENDLY_URL, external: true },
};

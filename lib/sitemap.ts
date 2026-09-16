export interface NavItem {
  label: string;
  href: string;
  desc?: string;
  built?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const serviceGroups: NavGroup[] = [
  {
    label: "AI-Powered Digital Marketing Services",
    items: [
      { label: "Social Media Marketing", href: "/services/social-media-marketing", desc: "Build your brand, engage your audience and drive growth across every major platform.", built: true },
      { label: "SEO & AI Search Visibility", href: "/services/seo-ai-search-visibility", desc: "Be found on Google and discovered in AI search with SEO, AEO and GEO.", built: true },
      { label: "Paid Marketing", href: "/services/paid-marketing", desc: "Turn ad spend into growth across Google, Meta, LinkedIn, TikTok and AI ads." },
      { label: "Content Marketing", href: "/services/content-marketing", desc: "Content that builds visibility, authority and growth." },
      { label: "Media Production", href: "/services/media-production", desc: "Professional video production and Reels for your brand." },
      { label: "Online Reputation Management", href: "/services/online-reputation-management", desc: "Build trust and protect your brand's online reputation." },
      { label: "Email Marketing", href: "/services/email-marketing", desc: "Turn emails into customer relationships and business growth." },
      { label: "SMS Marketing", href: "/services/sms-marketing", desc: "Reach customers instantly with targeted SMS marketing." },
      { label: "WhatsApp Marketing", href: "/services/whatsapp-marketing", desc: "Connect, engage and convert with WhatsApp marketing." },
    ],
  },
  {
    label: "AI Video Production",
    items: [
      { label: "AI Avatar Video", href: "/services/ai-avatar-video", desc: "Create professional videos with AI avatars." },
      { label: "AI UGC Video", href: "/services/ai-ugc-video", desc: "Create authentic-looking UGC videos with AI." },
      { label: "AI Hyper-Realistic Video", href: "/services/ai-hyper-realistic-video", desc: "Create stunning hyper-realistic videos with AI." },
      { label: "Digital Twin & Clone Video", href: "/services/digital-twin-clone-video", desc: "Create your digital twin and scale your video presence." },
    ],
  },
  {
    label: "AI & Automation Solutions",
    items: [
      { label: "AI & Automation Solutions", href: "/services/ai-automation-solutions", desc: "Automate smarter, work faster and grow better." },
    ],
  },
  {
    label: "Information Technology Services",
    items: [
      { label: "Web Design & Development", href: "/services/web-design-development", desc: "Websites designed to look better, perform better and grow your business." },
      { label: "Application Development", href: "/services/application-development", desc: "Build powerful mobile applications that drive business growth." },
      { label: "Product Engineering", href: "/services/product-engineering", desc: "Build, scale and transform your business with custom software." },
      { label: "Quality Assurance & Testing", href: "/services/quality-assurance-testing", desc: "Deliver reliable, secure and high-performing software." },
      { label: "UI/UX Design", href: "/services/ui-ux-design", desc: "Create better digital experiences." },
    ],
  },
  {
    label: "Staff Augmentation",
    items: [
      { label: "Marketing & Design Staff Augmentation", href: "/services/marketing-design-staff-augmentation", desc: "Scale your marketing and creative team with flexible talent." },
      { label: "IT Staff Augmentation", href: "/services/it-staff-augmentation", desc: "Scale your technology team with skilled IT professionals." },
    ],
  },
];

export const industryItems: NavItem[] = [
  { label: "Healthcare", href: "/industries/healthcare" },
  { label: "Home Services", href: "/industries/home-services" },
  { label: "Professional Services", href: "/industries/professional-services" },
  { label: "Education", href: "/industries/education" },
  { label: "IT & SaaS", href: "/industries/it-saas" },
  { label: "eCommerce", href: "/industries/ecommerce" },
  { label: "Real Estate", href: "/industries/real-estate" },
  { label: "Interior Design", href: "/industries/interior-design" },
  { label: "Travel & Hospitality", href: "/industries/travel-hospitality" },
];

export const aboutItems: NavItem[] = [
  { label: "Who We Are", href: "/about#who-we-are" },
  { label: "Why Choose Us", href: "/about#why-choose-us" },
  { label: "Why Businesses Choose Us", href: "/about#why-businesses-choose-us" },
  { label: "Our Approach", href: "/about#our-approach" },
];

export const resourceItems: NavItem[] = [
  { label: "Blogs", href: "/blog" },
  { label: "Case Studies", href: "/resources/case-studies" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Client Testimonials", href: "/testimonials" },
];

export const allServiceItems: NavItem[] = serviceGroups.flatMap((g) => g.items);

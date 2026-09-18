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
      { label: "Paid Marketing", href: "/services/paid-marketing", desc: "Turn ad spend into growth across Google, Meta, LinkedIn, TikTok and AI ads.", built: true },
      { label: "Content Marketing", href: "/services/content-marketing", desc: "Content that builds visibility, authority and growth.", built: true },
      { label: "Media Production", href: "/services/media-production", desc: "Professional video production and Reels for your brand.", built: true },
      { label: "Online Reputation Management", href: "/services/online-reputation-management", desc: "Build trust and protect your brand's online reputation.", built: true },
      { label: "Email Marketing", href: "/services/email-marketing", desc: "Turn emails into customer relationships and business growth.", built: true },
      { label: "SMS Marketing", href: "/services/sms-marketing", desc: "Reach customers instantly with targeted SMS marketing.", built: true },
      { label: "WhatsApp Marketing", href: "/services/whatsapp-marketing", desc: "Connect, engage and convert with WhatsApp marketing.", built: true },
    ],
  },
  {
    label: "AI Video Production",
    items: [
      { label: "AI Avatar Video", href: "/services/ai-avatar-video", desc: "Create professional videos with AI avatars.", built: true },
      { label: "AI UGC Video", href: "/services/ai-ugc-video", desc: "Create authentic-looking UGC videos with AI.", built: true },
      { label: "AI Hyper-Realistic Video", href: "/services/ai-hyper-realistic-video", desc: "Create stunning hyper-realistic videos with AI.", built: true },
      { label: "Digital Twin & Clone Video", href: "/services/digital-twin-clone-video", desc: "Create your digital twin and scale your video presence.", built: true },
    ],
  },
  {
    label: "AI & Automation Solutions",
    items: [
      { label: "AI & Automation Solutions", href: "/services/ai-automation-solutions", desc: "Automate smarter, work faster and grow better.", built: true },
    ],
  },
  {
    label: "Information Technology Services",
    items: [
      { label: "Web Design & Development", href: "/services/web-design-development", desc: "Websites designed to look better, perform better and grow your business.", built: true },
      { label: "Application Development", href: "/services/application-development", desc: "Build powerful mobile applications that drive business growth.", built: true },
      { label: "Product Engineering", href: "/services/product-engineering", desc: "Build, scale and transform your business with custom software.", built: true },
      { label: "Quality Assurance & Testing", href: "/services/quality-assurance-testing", desc: "Deliver reliable, secure and high-performing software.", built: true },
      { label: "UI/UX Design", href: "/services/ui-ux-design", desc: "Create better digital experiences.", built: true },
    ],
  },
  {
    label: "Staff Augmentation",
    items: [
      { label: "Marketing & Design Staff Augmentation", href: "/services/marketing-design-staff-augmentation", desc: "Scale your marketing and creative team with flexible talent.", built: true },
      { label: "IT Staff Augmentation", href: "/services/it-staff-augmentation", desc: "Scale your technology team with skilled IT professionals.", built: true },
    ],
  },
];

export const industryItems: NavItem[] = [
  { label: "Healthcare", href: "/industries/healthcare", built: true },
  { label: "Home Services", href: "/industries/home-services", built: true },
  { label: "Professional Services", href: "/industries/professional-services", built: true },
  { label: "Education", href: "/industries/education", built: true },
  { label: "IT & SaaS", href: "/industries/it-saas", built: true },
  { label: "eCommerce", href: "/industries/ecommerce", built: true },
  { label: "Real Estate", href: "/industries/real-estate", built: true },
  { label: "Interior Design", href: "/industries/interior-design", built: true },
  { label: "Travel & Hospitality", href: "/industries/travel-hospitality", built: true },
];

export const aboutItems: NavItem[] = [
  { label: "Who We Are", href: "/about/who-we-are", built: true },
  { label: "Why Choose Us", href: "/about/why-choose-us", built: true },
  { label: "Our Approach", href: "/about/our-approach", built: true },
  { label: "Our Team", href: "/about/our-team", built: true },
];

export const resourceItems: NavItem[] = [
  { label: "Blogs", href: "/blog", built: true },
  { label: "Case Studies", href: "/case-studies", built: true },
  { label: "Portfolio", href: "/portfolio", built: true },
  { label: "Client Testimonials", href: "/testimonials", built: true },
];

export const allServiceItems: NavItem[] = serviceGroups.flatMap((g) => g.items);

export interface NavItem {
  label: string;
  href: string;
  desc?: string;
  icon?: string;
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
      { label: "Social Media Marketing", href: "/services/social-media-marketing", desc: "Build brand & engage audience across every major platform.", icon: "📱", built: true },
      { label: "SEO & AI Search Visibility", href: "/services/seo-ai-search-visibility", desc: "Rank on Google & get discovered in AI search engines.", icon: "🔍", built: true },
      { label: "Paid Marketing", href: "/services/paid-marketing", desc: "High-ROI ads across Google, Meta, LinkedIn & AI channels.", icon: "🎯", built: true },
      { label: "Content Marketing", href: "/services/content-marketing", desc: "Authority content that builds trust & converts readers.", icon: "✍️", built: true },
      { label: "Media Production", href: "/services/media-production", desc: "High-impact video production, motion & brand creatives.", icon: "🎬", built: true },
      { label: "Online Reputation Management", href: "/services/online-reputation-management", desc: "Protect brand integrity & build 5-star customer trust.", icon: "🛡️", built: true },
      { label: "Email Marketing", href: "/services/email-marketing", desc: "Turn customer lists into repeat revenue machines.", icon: "✉️", built: true },
      { label: "SMS Marketing", href: "/services/sms-marketing", desc: "Instant high-open-rate mobile messaging & promos.", icon: "💬", built: true },
      { label: "WhatsApp Marketing", href: "/services/whatsapp-marketing", desc: "Direct conversational sales & automated customer flows.", icon: "📲", built: true },
    ],
  },
  {
    label: "AI Video Production",
    items: [
      { label: "AI Avatar Video", href: "/services/ai-avatar-video", desc: "Lifelike multilingual AI presenters in minutes.", icon: "👤", built: true },
      { label: "AI UGC Video", href: "/services/ai-ugc-video", desc: "Authentic user-generated style videos at scale.", icon: "🤳", built: true },
      { label: "AI Hyper-Realistic Video", href: "/services/ai-hyper-realistic-video", desc: "Cinematic quality AI visuals for campaigns.", icon: "🎥", built: true },
      { label: "Digital Twin & Clone Video", href: "/services/digital-twin-clone-video", desc: "Scale your executive presence with custom clones.", icon: "👥", built: true },
    ],
  },
  {
    label: "AI & Automation Solutions",
    items: [
      { label: "AI & Automation Solutions", href: "/services/ai-automation-solutions", desc: "Automate workflows, CRM sync & enterprise intelligence.", icon: "⚡", built: true },
    ],
  },
  {
    label: "Information Technology Services",
    items: [
      { label: "Web Design & Development", href: "/services/web-design-development", desc: "Custom, lightning-fast high-converting platforms.", icon: "🌐", built: true },
      { label: "Application Development", href: "/services/application-development", desc: "Scalable iOS, Android & cross-platform apps.", icon: "📱", built: true },
      { label: "Product Engineering", href: "/services/product-engineering", desc: "Enterprise architecture & custom SaaS platforms.", icon: "⚙️", built: true },
      { label: "Quality Assurance & Testing", href: "/services/quality-assurance-testing", desc: "Rigorous automated testing & vulnerability audits.", icon: "🧪", built: true },
      { label: "UI/UX Design", href: "/services/ui-ux-design", desc: "Intuitive, high-retention digital interfaces.", icon: "🎨", built: true },
    ],
  },
  {
    label: "Staff Augmentation",
    items: [
      { label: "Marketing & Design Staff Augmentation", href: "/services/marketing-design-staff-augmentation", desc: "Top 1% vetted growth marketers & designers.", icon: "🎨", built: true },
      { label: "IT Staff Augmentation", href: "/services/it-staff-augmentation", desc: "Dedicated senior software engineers & AI devs.", icon: "💻", built: true },
    ],
  },
];

export const industryItems: NavItem[] = [
  { label: "Healthcare", href: "/industries/healthcare", desc: "HIPAA-compliant marketing & patient growth", icon: "🏥", built: true },
  { label: "Home Services", href: "/industries/home-services", desc: "High-intent local leads & automated booking", icon: "🏡", built: true },
  { label: "Professional Services", href: "/industries/professional-services", desc: "B2B pipeline generation & brand authority", icon: "⚖️", built: true },
  { label: "Education", href: "/industries/education", desc: "Student enrollment & digital visibility", icon: "🎓", built: true },
  { label: "IT & SaaS", href: "/industries/it-saas", desc: "Product-led growth, dev marketing & MRR scale", icon: "💻", built: true },
  { label: "eCommerce", href: "/industries/ecommerce", desc: "ROAS-maximized ad scale & conversion stores", icon: "🛍️", built: true },
  { label: "Real Estate", href: "/industries/real-estate", desc: "High-ticket buyer/seller leads & web platforms", icon: "🏢", built: true },
  { label: "Interior Design", href: "/industries/interior-design", desc: "Visual portfolio branding & affluent client leads", icon: "✨", built: true },
  { label: "Travel & Hospitality", href: "/industries/travel-hospitality", desc: "Direct bookings & experiential brand storytelling", icon: "✈️", built: true },
];

export const aboutItems: NavItem[] = [
  { label: "Who We Are", href: "/about/who-we-are", desc: "Our mission, global team, and engineering culture", icon: "🌐", built: true },
  { label: "Why Choose Us", href: "/about/why-choose-us", desc: "How our unified growth system outperforms agencies", icon: "🎯", built: true },
  { label: "Why Businesses Choose Us", href: "/about/why-businesses-choose-us", desc: "Built around your business, focused on what comes next", icon: "🚀", built: true },
  { label: "Our Approach", href: "/about/our-approach", desc: "Data-driven strategy, rapid execution & optimization", icon: "🔄", built: true },
];

export const resourceItems: NavItem[] = [
  { label: "Blogs", href: "/blog", desc: "Latest strategies, marketing playbooks & AI insights", icon: "📝", built: true },
  { label: "Case Studies", href: "/case-studies", desc: "Real growth results, metrics & client success stories", icon: "📊", built: true },
  { label: "Portfolio", href: "/portfolio", desc: "Explore our latest digital products & interactive work", icon: "⚡", built: true },
  { label: "Client Testimonials", href: "/testimonials", desc: "What founders, executives & leaders say about us", icon: "⭐", built: true },
];

export const allServiceItems: NavItem[] = serviceGroups.flatMap((g) => g.items);

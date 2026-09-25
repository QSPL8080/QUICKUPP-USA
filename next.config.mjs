/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // AI-Powered Digital Marketing Services
      { source: "/services/social-media-marketing", destination: "/services/ai-powered-digital-marketing-services/social-media-marketing", permanent: true },
      { source: "/services/seo-ai-search-visibility", destination: "/services/ai-powered-digital-marketing-services/seo-ai-search-visibility", permanent: true },
      { source: "/services/paid-marketing", destination: "/services/ai-powered-digital-marketing-services/paid-marketing", permanent: true },
      { source: "/services/content-marketing", destination: "/services/ai-powered-digital-marketing-services/content-marketing", permanent: true },
      { source: "/services/media-production", destination: "/services/ai-powered-digital-marketing-services/media-production", permanent: true },
      { source: "/services/online-reputation-management", destination: "/services/ai-powered-digital-marketing-services/online-reputation-management", permanent: true },
      { source: "/services/email-marketing", destination: "/services/ai-powered-digital-marketing-services/email-marketing", permanent: true },
      { source: "/services/sms-marketing", destination: "/services/ai-powered-digital-marketing-services/sms-marketing", permanent: true },
      { source: "/services/whatsapp-marketing", destination: "/services/ai-powered-digital-marketing-services/whatsapp-marketing", permanent: true },

      // AI Video Production
      { source: "/services/ai-avatar-video", destination: "/services/ai-video-production/ai-avatar-video", permanent: true },
      { source: "/services/ai-ugc-video", destination: "/services/ai-video-production/ai-ugc-video", permanent: true },
      { source: "/services/ai-hyper-realistic-video", destination: "/services/ai-video-production/ai-hyper-realistic-video", permanent: true },
      { source: "/services/digital-twin-clone-video", destination: "/services/ai-video-production/digital-twin-clone-video", permanent: true },

      // Information Technology Services
      { source: "/services/web-design-development", destination: "/services/information-technology-services/web-design-development", permanent: true },
      { source: "/services/application-development", destination: "/services/information-technology-services/application-development", permanent: true },
      { source: "/services/product-engineering", destination: "/services/information-technology-services/product-engineering", permanent: true },
      { source: "/services/quality-assurance-testing", destination: "/services/information-technology-services/quality-assurance-testing", permanent: true },
      { source: "/services/ui-ux-design", destination: "/services/information-technology-services/ui-ux-design", permanent: true },

      // Staff Augmentation
      { source: "/services/marketing-design-staff-augmentation", destination: "/services/staff-augmentation/marketing-design-staff-augmentation", permanent: true },
      { source: "/services/it-staff-augmentation", destination: "/services/staff-augmentation/it-staff-augmentation", permanent: true },
      // Common aliases & redirects
      { source: "/careers", destination: "/career", permanent: true },
      { source: "/about", destination: "/about/who-we-are", permanent: true },
      { source: "/about-us", destination: "/about/who-we-are", permanent: true },
    ];
  },
};

export default nextConfig;

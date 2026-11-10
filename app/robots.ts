import type { MetadataRoute } from "next";

// Matches the robots file supplied by the SEO team: every public page may be
// crawled, and the sitemap lives on the www host. Private areas (CRM, internal
// APIs, payment steps) stay blocked; they are also marked noindex.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/crm/",
          "/api/crm/",
          "/api/cron/",
          "/checkout",
          "/pay/",
          "/payment-confirmation",
        ],
      },
    ],
    sitemap: "https://www.quickuppsoftech.us/sitemap.xml",
    host: "https://www.quickuppsoftech.us",
  };
}

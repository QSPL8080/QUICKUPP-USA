import type { MetadataRoute } from "next";

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
    sitemap: [
      "https://www.quickuppsoftech.us/sitemap.xml",
      "https://quickuppsoftech.us/sitemap.xml",
    ],
  };
}

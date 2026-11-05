import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quickuppsoftech.us";
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
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

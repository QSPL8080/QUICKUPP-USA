import type { MetadataRoute } from "next";
import { serviceGroups, industryItems, aboutItems, resourceItems } from "@/lib/sitemap";
import { LOCATIONS, ALL_LOCATION_PAGE_SLUGS } from "@/lib/locations";
import { CASE_STUDY_ORDER } from "@/lib/caseStudies";
import { getAllBlogSlugs } from "@/lib/blogs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.quickuppsoftech.us").replace(/\/$/, "");
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];
  const addedUrls = new Set<string>();

  const addUrl = (
    path: string,
    priority: number = 0.7,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly"
  ) => {
    const cleanPath = path.startsWith("http") ? path : `${siteUrl}${path.startsWith("/") ? "" : "/"}${path}`;
    if (!addedUrls.has(cleanPath)) {
      addedUrls.add(cleanPath);
      entries.push({
        url: cleanPath,
        lastModified: now,
        changeFrequency,
        priority,
      });
    }
  };

  // 1. Core Homepage & Top-level landing pages
  addUrl("/", 1.0, "daily");
  addUrl("/contact", 0.9, "weekly");
  addUrl("/industries", 0.8, "monthly");
  addUrl("/locations", 0.8, "monthly");
  addUrl("/portfolio", 0.8, "monthly");
  addUrl("/case-studies", 0.8, "weekly");
  addUrl("/blog", 0.8, "daily");
  addUrl("/career", 0.7, "weekly");
  addUrl("/testimonials", 0.7, "monthly");
  addUrl("/faq-page", 0.7, "monthly");
  addUrl("/resources", 0.8, "weekly");
  addUrl("/services/youtube-video-promotion", 0.8, "weekly");

  // 2. About subpages
  aboutItems.forEach((item) => {
    if (item.href && !item.external) addUrl(item.href, 0.85, "monthly");
  });

  // 3. Resource pages
  resourceItems.forEach((item) => {
    if (item.href && !item.external) addUrl(item.href, 0.8, "weekly");
  });

  // 4. Service Categories & Individual Service Pages
  serviceGroups.forEach((group) => {
    group.items.forEach((item) => {
      if (item.href && !item.external) addUrl(item.href, 0.9, "weekly");
    });
  });

  // 5. Industries
  industryItems.forEach((item) => {
    if (item.href && !item.external) addUrl(item.href, 0.85, "monthly");
  });

  // 6. City Location Hubs
  LOCATIONS.forEach((city) => {
    addUrl(`/locations/${city.slug}`, 0.8, "monthly");
  });

  // 7. Location-Specific Service Landing Pages (160 high-intent programmatic landing pages)
  ALL_LOCATION_PAGE_SLUGS.forEach((slug) => {
    addUrl(`/${slug}`, 0.75, "monthly");
  });

  // 8. Case Studies
  CASE_STUDY_ORDER.forEach((slug) => {
    addUrl(`/case-studies/${slug}`, 0.8, "monthly");
  });

  // 9. Published Blog Articles
  try {
    const blogSlugs = await getAllBlogSlugs();
    blogSlugs.forEach((slug) => {
      addUrl(`/blog/${slug}`, 0.75, "weekly");
    });
  } catch {
    // If DB is unreachable during build, fallback gracefully
  }

  // 10. Legal & Compliance pages
  addUrl("/privacy-policy", 0.4, "yearly");
  addUrl("/terms-and-conditions", 0.4, "yearly");
  addUrl("/cookie-policy", 0.4, "yearly");

  return entries;
}

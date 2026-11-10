import type { Metadata } from "next";
import BlogListView from "@/components/BlogListView";
import { getPublishedBlogs } from "@/lib/blogs";

export const metadata: Metadata = {
  title: "Blogs | Quickupp Softech",
  description: "Explore industry-leading perspectives on AI, digital marketing, search visibility, web engineering, and enterprise growth.",
  alternates: {
    canonical: "https://www.quickuppsoftech.us/blog",
    languages: { "en-US": "https://www.quickuppsoftech.us/blog" },
  },
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const blogs = await getPublishedBlogs();
  return <BlogListView initialPosts={blogs} />;
}

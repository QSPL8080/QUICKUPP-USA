import BlogListView from "@/components/BlogListView";
import { getPublishedBlogs } from "@/lib/blogs";

export const metadata = {
  title: "Blogs | Quickupp Softech",
  description: "Explore industry-leading perspectives on AI, digital marketing, search visibility, web engineering, and enterprise growth.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const blogs = await getPublishedBlogs();
  return <BlogListView initialPosts={blogs} />;
}

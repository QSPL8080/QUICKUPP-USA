import { requireArea } from "@/lib/crm/auth";
import { getCrmBlogs } from "@/lib/blogs";
import BlogsView from "@/components/crm/BlogsView";

export const metadata = {
  title: "Website Blogs | Quickupp CRM",
};

export const dynamic = "force-dynamic";

export default async function CrmBlogsPage() {
  await requireArea("blogs");
  const blogs = await getCrmBlogs();

  return <BlogsView rows={blogs} />;
}

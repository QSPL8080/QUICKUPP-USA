import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogDetailView from "@/components/BlogDetailView";
import { getAllBlogSlugs, getPublishedBlogBySlug, getPublishedBlogs } from "@/lib/blogs";

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogBySlug(slug);
  if (!post) return { title: "Blog Article | Quickupp Softech" };

  return {
    title: `${post.title} | Quickupp Softech Blog`,
    description: post.desc,
  };
}

export default async function SingleBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getPublishedBlogs();
  const relatedPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <Header />
      <BlogDetailView post={post} relatedPosts={relatedPosts} />
      <Footer />
    </>
  );
}

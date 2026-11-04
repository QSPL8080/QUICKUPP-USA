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

  const title = post.content.metaTitle || `${post.title} | Quickupp Softech`;
  return {
    title,
    description: post.desc,
    openGraph: { title, description: post.desc, type: "article", images: post.img ? [post.img] : undefined },
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
  // the next three blogs in order, wrapping around to the start
  const at = allPosts.findIndex((p) => p.slug === slug);
  const others = at >= 0 ? [...allPosts.slice(at + 1), ...allPosts.slice(0, at)] : allPosts.filter((p) => p.slug !== slug);
  const relatedPosts = others.slice(0, 3);

  return (
    <>
      <Header />
      <BlogDetailView post={post} relatedPosts={relatedPosts} />
      <Footer />
    </>
  );
}

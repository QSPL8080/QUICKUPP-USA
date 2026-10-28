import { notFound, redirect } from "next/navigation";
import { getAllCategoryParams, serviceCategories } from "@/lib/servicesData";

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  return getAllCategoryParams();
}

export default async function ServiceCategoryPage({ params }: PageProps) {
  const { category: catSlug } = await params;
  const category = serviceCategories.find((c) => c.categorySlug === catSlug);

  if (!category || !category.services || category.services.length === 0) {
    notFound();
  }

  redirect(`/services/${category.categorySlug}/${category.services[0].slug}`);
}


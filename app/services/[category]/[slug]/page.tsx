import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MerkilMarketingServicePage from "@/components/MerkilMarketingServicePage";
import AIVideoServicePage from "@/components/AIVideoServicePage";
import RitovexServicePage from "@/components/RitovexServicePage";
import ITLifecycleServicePage from "@/components/ITLifecycleServicePage";
import {
  getAllCategorizedServiceParams,
  getServiceByCategoryAndSlug,
} from "@/lib/servicesData";

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return getAllCategorizedServiceParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const match = getServiceByCategoryAndSlug(category, slug);
  if (!match) {
    return {
      title: "Service Not Found | Quickupp Softech",
    };
  }

  return {
    title: match.service.data.metaTitle,
    description: match.service.data.metaDescription,
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { category, slug } = await params;
  const match = getServiceByCategoryAndSlug(category, slug);

  if (!match) {
    notFound();
  }

  if (match.service.template === "merkil") {
    return (
      <MerkilMarketingServicePage
        data={match.service.data}
        categoryLabel={match.category.categoryLabel}
        categorySlug={match.category.categorySlug}
      />
    );
  }

  if (match.service.template === "aivideo") {
    return (
      <AIVideoServicePage
        data={match.service.data}
        categoryLabel={match.category.categoryLabel}
        categorySlug={match.category.categorySlug}
      />
    );
  }

  if (match.service.template === "itlifecycle") {
    return <ITLifecycleServicePage data={match.service.data} />;
  }

  return <RitovexServicePage data={match.service.data} />;
}

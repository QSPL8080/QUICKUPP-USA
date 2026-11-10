import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MerkilMarketingServicePage from "@/components/MerkilMarketingServicePage";
import CoporaServicePage from "@/components/CoporaServicePage";
import AIAutomationServicePage from "@/components/AIAutomationServicePage";
import StaffAugmentationServicePage from "@/components/StaffAugmentationServicePage";
import {
  getAllCategorizedServiceParams,
  getServiceByCategoryAndSlug,
} from "@/lib/servicesData";
import { SERVICE_FAQ_SCHEMA } from "@/lib/serviceFaqSchema";

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
    alternates: {
      canonical: `https://www.quickuppsoftech.us/services/${category}/${slug}`,
    },
  };
}

/* the page plus its FAQ structured data (schema.org FAQPage), when the page has one */
export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const faq = SERVICE_FAQ_SCHEMA[slug];
  const faqLd = faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }
    : null;
  return (
    <>
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />}
      <ServicePageBody params={params} />
    </>
  );
}

async function ServicePageBody({ params }: PageProps) {
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

  if (match.service.template === "staffaug") {
    return (
      <StaffAugmentationServicePage
        data={match.service.data}
        categoryLabel={match.category.categoryLabel}
        categorySlug={match.category.categorySlug}
      />
    );
  }

  if (match.service.template === "aiautomation") {
    return (
      <AIAutomationServicePage
        data={match.service.data}
        categoryLabel={match.category.categoryLabel}
        categorySlug={match.category.categorySlug}
      />
    );
  }

  return (
    <CoporaServicePage
      data={match.service.data}
      categoryLabel={match.category.categoryLabel}
      categorySlug={match.category.categorySlug}
    />
  );
}

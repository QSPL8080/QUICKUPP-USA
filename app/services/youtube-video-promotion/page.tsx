import type { Metadata } from "next";
import YouTubePromotionPage from "@/components/YouTubePromotionPage";
import content from "@/data/services/youtube-video-promotion";

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
  alternates: {
    canonical: "https://www.quickuppsoftech.us/services/youtube-video-promotion",
  },
};

export default function Page() {
  return <YouTubePromotionPage content={content} />;
}

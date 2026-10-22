import type { Metadata } from "next";
import YouTubePromotionPage from "@/components/YouTubePromotionPage";
import content from "@/data/services/youtube-video-promotion";

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
};

export default function Page() {
  return <YouTubePromotionPage content={content} />;
}

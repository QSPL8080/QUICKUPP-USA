/*
 * The shape of a blog post. Blogs themselves live only in the database and are
 * written, edited, published and deleted from the CRM (Blogs tab).
 */
export interface BlogPost {
  slug: string;
  category: string;
  /** published date and time as the website shows it, e.g. "November 12, 2026 · 9:30 AM EST" */
  date: string;
  /** published date and time (ISO), for <time> and search engines */
  publishedAt?: string;
  title: string;
  desc: string;
  author: string;
  authorRole: string;
  readTime: string;
  img: string;
  content: {
    /** SEO title from the blog document, if it has one */
    metaTitle?: string;
    intro: string;
    keyTakeaways?: string[];
    sections: {
      heading: string;
      paragraphs: string[];
    }[];
    conclusion: string;
  };
}

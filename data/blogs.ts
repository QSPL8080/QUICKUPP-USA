/*
 * The shape of a blog post. Blogs themselves live only in the database and are
 * written, edited, published and deleted from the CRM (Blogs tab).
 */
export interface BlogPost {
  slug: string;
  category: string;
  date: string;
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

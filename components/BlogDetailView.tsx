import Link from "next/link";
import type { BlogPost } from "@/data/blogs";
import BlogRichText from "@/components/BlogRichText";
import BlogReadingAids from "@/components/BlogReadingAids";
import "@/app/blog-detail.css";

/*
 * One blog, exactly as its document is written: the H1, the introduction,
 * each numbered section with its lists and links, and the conclusion.
 * The side list of sections and the reading bar are built from those
 * headings; nothing is added to the text.
 */

const slugify = (s: string, i: number) =>
  `s${i + 1}-` +
  s
    .toLowerCase()
    .replace(/^\d+\.\s*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

function splitHeading(h: string) {
  const m = h.match(/^(\d+)\.\s*(.*)$/);
  return m ? { num: m[1], text: m[2] } : { num: "", text: h };
}

export default function BlogDetailView({ post, relatedPosts }: { post: BlogPost; relatedPosts: BlogPost[] }) {
  const { content } = post;
  const intro = (content.intro || "").split(/\n{2,}/);
  const sections = (content.sections || []).filter((s) => s.heading || s.paragraphs.length);
  const toc = sections.map((s, i) => ({ id: slugify(s.heading, i), ...splitHeading(s.heading) }));
  const takeaways = content.keyTakeaways || [];
  const conclusion = (content.conclusion || "").split(/\n{2,}/).filter(Boolean);

  return (
    <main className="bld-page">
      <BlogReadingAids ids={toc.map((t) => t.id)} />

      <header className="bld-hero">
        <div className="bld-wrap">
          <div className="asx-breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/resources">Resources</Link>
            <span>/</span>
            <Link href="/blog">Blogs</Link>
          </div>
          <h1 className="bld-h1">{post.title}</h1>
          {post.desc && <p className="bld-standfirst">{post.desc}</p>}
          {post.date && (
            <p className="bld-meta">
              <span>Published </span>
              <time dateTime={post.publishedAt}>{post.date}</time>
              {post.readTime ? <span> · {post.readTime}</span> : null}
            </p>
          )}
        </div>
        <div className="bld-cover-wrap">
          <figure className="bld-cover">
            <img src={post.img} alt="" />
          </figure>
        </div>
      </header>

      <div className="bld-layout">
        {toc.length > 0 && (
          <aside className="bld-aside" aria-label="Sections">
            <nav className="bld-toc">
              <p className="bld-toc-label">On this page</p>
              <ol>
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} data-toc={t.id}>
                      {t.num && <span className="bld-toc-num">{t.num.padStart(2, "0")}</span>}
                      <span>{t.text}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        )}

        <article className="bld-article">
          {intro.length > 0 && intro[0] && (
            <div className="bld-intro">
              <BlogRichText lines={intro} firstClass="bld-p-first" />
            </div>
          )}

          {takeaways.length > 0 && (
            <ul className="bld-ul bld-takeaways">
              {takeaways.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          )}

          {sections.map((s, i) => {
            const h = splitHeading(s.heading);
            const isConclusion = /^(conclusion|final thoughts|summary)$/i.test(h.text.trim());
            return (
              <section key={toc[i].id} id={toc[i].id} className={`bld-section${isConclusion ? " is-conclusion" : ""}`}>
                {s.heading && (
                  <h2 className="bld-h2">
                    {h.num && <span className="bld-h2-num">{h.num.padStart(2, "0")}</span>}
                    <span>{h.text}</span>
                  </h2>
                )}
                <BlogRichText lines={s.paragraphs} />
              </section>
            );
          })}

          {conclusion.length > 0 && (
            <section className="bld-section is-conclusion">
              <BlogRichText lines={conclusion} />
            </section>
          )}

          <div className="bld-end">
            <Link href="/blog" className="bld-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>All Blogs</span>
            </Link>
          </div>
        </article>
      </div>

      {relatedPosts.length > 0 && (
        <section className="bld-more">
          <div className="bld-more-wrap">
            <h2 className="bld-more-title">More Blogs</h2>
            <div className="bld-more-grid">
              {relatedPosts.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="bld-more-card">
                  <span className="bld-more-img">
                    <img src={p.img} alt="" loading="lazy" />
                  </span>
                  <span className="bld-more-name">{p.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResourceMotion from "@/components/ResourceMotion";
import type { BlogPost } from "@/data/blogs";
import "@/app/blogs-list.css";

/*
 * Blogs list: every published blog, each with its image, title and the
 * description from its document. Nothing else.
 */
export default function BlogListView({ initialPosts }: { initialPosts: BlogPost[] }) {
  return (
    <>
      <Header />
      <main className="bls-page">
        <section className="bls-hero">
          <div className="bls-container">
            <div className="asx-breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/resources">Resources</Link>
              <span>/</span>
              <span className="asx-breadcrumb-current">Blogs</span>
            </div>
            <h1 className="bls-h1">
              <span className="qs-gradient-text">Blogs</span>
            </h1>
          </div>
        </section>

        <section className="bls-list-section">
          <div className="bls-container">
            {initialPosts.length ? (
              <div className="bls-grid">
                {initialPosts.map((post, i) => (
                  <article key={post.slug} className="bls-card">
                    <Link href={`/blog/${post.slug}`} className="bls-media" tabIndex={-1} aria-hidden="true">
                      <img src={post.img} alt="" loading={i < 3 ? "eager" : "lazy"} />
                      <span className="bls-num">{String(i + 1).padStart(2, "0")}</span>
                    </Link>
                    <div className="bls-body">
                      {post.date && (
                        <p className="bls-date">
                          <time dateTime={post.publishedAt}>{post.date}</time>
                          {post.readTime ? <span> · {post.readTime}</span> : null}
                        </p>
                      )}
                      <h2 className="bls-title">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>
                      <p className="bls-desc">{post.desc}</p>
                      <Link href={`/blog/${post.slug}`} className="bls-more">
                        <span>Read Article</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="bls-empty">No blogs published yet.</p>
            )}
          </div>
        </section>
        <ResourceMotion variant="blog" />
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Blog | Mercket - Webflow HTML website template",
  description:
    "Insights, trends, and strategies to help you grow your brand and stay ahead in the digital world.",
};

const blogPosts = [
  {
    href: "/post/the-future-of-employe-engagement-whats-next",
    img: "blog-img-01",
    category: "Finance",
    date: "23 February 2026",
    title: "The Future of Employe Engagement: What's Next?",
    authorImg: "testimonial-01",
    author: "Jacob Moore",
  },
  {
    href: "/post/top-trends-shaping-digital-marketing-in-2026",
    img: "blog-img-02",
    category: "Investment",
    date: "25 February 2026",
    title: "Top trends shaping digital marketing in 2026",
    authorImg: "testimonial-03",
    author: "Julia Taylor",
  },
  {
    href: "/post/how-to-measure-marketing-impact-on-profitability",
    img: "blog-img-03",
    category: "Marketing",
    date: "25 February 2026",
    title: "How to measure marketing impact on profitability",
    authorImg: "testimonial-03",
    author: "Julia Taylor",
  },
  {
    href: "/post/branding-vs-rebranding-what-your-business-needs",
    img: "blog-img-04",
    category: "Business",
    date: "25 February 2026",
    title: "Branding vs. rebranding: what your business needs",
    authorImg: "testimonial-02",
    author: "Paula Den",
  },
  {
    href: "/post/using-analytics-to-improve-performance-and-roi",
    img: "blog-img-05",
    category: "Investment",
    date: "25 February 2026",
    title: "Using analytics to improve performance and ROI",
    authorImg: "testimonial-01",
    author: "Jacob Moore",
  },
  {
    href: "/post/the-role-of-social-media-in-modern-growth-strategy",
    img: "blog-img-06",
    category: "Business",
    date: "25 February 2026",
    title: "The role of social media in modern growth strategy",
    authorImg: "testimonial-02",
    author: "Paula Den",
  },
];

export default function BlogPage() {
  return (
    <>
      <Header />
      <section className="breadcrumb-section _02">
        <div className="w-layout-blockcontainer container-large w-container">
          <div className="breadcrumb-wrap">
            <div className="breadcrumb-title-animation">
              <h2 className="breadcrumb-heading-title">Latest Articles</h2>
            </div>
          </div>
          <div className="breadcrumb-bottom-content">
            <div className="breadcrumb-pages-map">
              <div className="breadcrumb-pages-text-wrap">
                <a href="#" className="breadcrumb-pages-text underline">
                  Home
                </a>
                <div className="dashed">/</div>
              </div>
              <div className="breadcrumb-pages-text">Blog</div>
            </div>
            <div className="breadcrumb-desc-wrap">
              <div className="breadcrumb-desc">
                Insights, trends, and strategies to help you grow your brand and
                stay ahead in the digital world.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gap">
        <div className="w-layout-blockcontainer container w-container">
          <div className="blog-one w-dyn-list">
            <div role="list" className="blog-one-list w-dyn-items">
              {blogPosts.map((post, i) => (
                <div
                  key={i}
                  data-w-id="c4c5fa6a-b329-cbc7-50e5-2109db4eaf24"
                  style={{
                    WebkitTransform:
                      "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                    MozTransform:
                      "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                    msTransform:
                      "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                    transform:
                      "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                    opacity: 0,
                  }}
                  role="listitem"
                  className="blog-one-item w-dyn-item"
                >
                  <a
                    data-w-id="c4c5fa6a-b329-cbc7-50e5-2109db4eaf25"
                    href={post.href}
                    className="blog-one-wrap blog-detail w-inline-block"
                  >
                    <div className="blog-one-image">
                      <div
                        style={{
                          width: "200%",
                          height: "0%",
                          backgroundColor: "rgba(35,33,47,0.1)",
                        }}
                        className="image-bg-overlay"
                      ></div>
                      <img
                        width="auto"
                        height="auto"
                        alt={post.img}
                        src={`/images/${post.img}.jpg`}
                        style={{
                          WebkitTransform:
                            "translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                          MozTransform:
                            "translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                          msTransform:
                            "translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                          transform:
                            "translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                        }}
                        sizes="(max-width: 767px) 100vw, (max-width: 991px) 727px, 939px"
                        srcSet={
                          post.img !== "blog-img-04"
                            ? `/images/${post.img}-p-500.jpg 500w, /images/${post.img}-p-800.jpg 800w, /images/${post.img}-p-1080.jpg 1080w, /images/${post.img}.jpg 1520w`
                            : undefined
                        }
                        className="blog-one-preview"
                      />
                    </div>
                    <div className="blog-one-inner">
                      <div className="blog-one-title-wrap">
                        <div className="blog-one-meta">
                          <div
                            data-w-id="c4c5fa6a-b329-cbc7-50e5-2109db4eaf2c"
                            style={{
                              WebkitTransform:
                                "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                              MozTransform:
                                "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                              msTransform:
                                "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                              transform:
                                "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                              opacity: 0,
                            }}
                            className="blog-category"
                          >
                            <div className="category">(</div>
                            <div className="category">{post.category}</div>
                            <div className="category">)</div>
                          </div>
                          <div
                            data-w-id="c4c5fa6a-b329-cbc7-50e5-2109db4eaf32"
                            style={{
                              WebkitTransform:
                                "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                              MozTransform:
                                "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                              msTransform:
                                "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                              transform:
                                "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                              opacity: 0,
                            }}
                            className="blog-category"
                          >
                            <div className="category">(</div>
                            <div className="category">{post.date}</div>
                            <div className="category">)</div>
                          </div>
                        </div>
                        <div
                          data-w-id="c4c5fa6a-b329-cbc7-50e5-2109db4eaf38"
                          style={{
                            WebkitTransform:
                              "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                            MozTransform:
                              "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                            msTransform:
                              "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                            transform:
                              "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                            opacity: 0,
                          }}
                          className="text-style-h2"
                        >
                          {post.title}
                        </div>
                      </div>
                      <div className="blog-one-author-wrap">
                        <div className="blog-one-author-image-wrap">
                          <img
                            src={`/images/${post.authorImg}.jpg`}
                            alt={`Author Image`}
                            style={{
                              WebkitTransform:
                                "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                              MozTransform:
                                "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                              msTransform:
                                "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                              transform:
                                "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                              opacity: 0,
                            }}
                            data-w-id="c4c5fa6a-b329-cbc7-50e5-2109db4eaf3b"
                          />
                        </div>
                        <div
                          data-w-id="c4c5fa6a-b329-cbc7-50e5-2109db4eaf3c"
                          style={{
                            WebkitTransform:
                              "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                            MozTransform:
                              "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                            msTransform:
                              "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                            transform:
                              "translate3d(0, 3.14rem, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)",
                            opacity: 0,
                          }}
                          className="author-name-wrap"
                        >
                          <div className="category">By </div>
                          <div className="category">{post.author}</div>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

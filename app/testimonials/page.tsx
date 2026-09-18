import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Button from "@/components/Button";

export const metadata: Metadata = {
  title: "Client Testimonials & Reviews | Quickupp Softech",
  description:
    "Hear directly from founders, CMOs, and business leaders who scaled with Quickupp Softech's Marketing, AI, and Technology solutions.",
};

const reviews = [
  {
    quote: "Quickupp Softech completely transformed our patient acquisition funnel. In under four months, our appointment booking volume grew by more than 300% while reducing our cost per lead.",
    author: "Dr. Arvind Mehta",
    title: "Medical Director",
    company: "MetroCare Health Systems",
    rating: 5,
    highlight: "+340% Patient Bookings",
  },
  {
    quote: "Finding a single team that excels in Next.js web development, AI automation workflows, and high-ROI paid marketing is nearly impossible. Quickupp delivered on every front.",
    author: "Sarah Jenkins",
    title: "VP of Marketing",
    company: "SaaSFlow Technologies",
    rating: 5,
    highlight: "$2.4M Pipeline Growth",
  },
  {
    quote: "Their team built our custom Shopify Plus experience and integrated automated WhatsApp cart recovery. Our conversion rates and repeat customer purchases doubled.",
    author: "Rohan Kapoor",
    title: "Founder & CEO",
    company: "UrbanLuxe Living",
    rating: 5,
    highlight: "220% YoY Revenue",
  },
  {
    quote: "Before Quickupp, our real estate leads were low quality and required endless chasing. Their AI lead qualification bot now handles initial vetting automatically, booking site visits directly.",
    author: "Vikram Malhotra",
    title: "Head of Sales",
    company: "Prestige Horizon Developers",
    rating: 5,
    highlight: "650+ Site Visits Booked",
  },
  {
    quote: "The transparency and communication are outstanding. We receive clear data-driven reports, proactive recommendations, and genuine growth strategy every single month.",
    author: "Elena Rostova",
    title: "Co-Founder",
    company: "Nova Digital Brands",
    rating: 5,
    highlight: "98% Satisfaction Rating",
  },
  {
    quote: "Quickupp's AI UGC and Avatar video production allowed us to test 50+ video ads in a single month at a fraction of our traditional studio production cost. A game changer.",
    author: "David Chen",
    title: "Growth Lead",
    company: "PulseWear D2C",
    rating: 5,
    highlight: "4.5x ROAS Across Meta",
  },
];

export default function TestimonialsPage() {
  return (
    <>
      <Header />
      <PageHero
        title="What Our Clients Say"
        crumb="Testimonials"
        description="Real partnerships. Real outcomes. Discover why leading businesses trust Quickupp Softech to drive sustainable growth."
      />

      <section className="section-gap" style={{ background: "#f8f9fa", paddingTop: "64px", paddingBottom: "96px" }}>
        <div className="w-layout-blockcontainer container w-container">
          {/* Trust Banner */}
          <div
            style={{
              background: "#18171c",
              borderRadius: "24px",
              padding: "44px 36px",
              color: "#fff",
              textAlign: "center",
              marginBottom: "56px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#def25c", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
              TRUSTED WORLDWIDE
            </div>
            <h2 style={{ fontSize: "clamp(24px, 3.2vw, 36px)", fontWeight: 700, margin: "0 0 12px 0", color: "#fff" }}>
              98% Client Satisfaction Across 200+ Projects
            </h2>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.85)", maxWidth: "700px", margin: "0 auto" }}>
              We partner with ambitious founders, enterprises, and growing SMBs to build high-converting growth systems.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 380px))",
              justifyContent: "center",
              gap: "32px",
              marginBottom: "64px",
            }}
          >
            {reviews.map((rev, idx) => (
              <div
                key={idx}
                className="qs-blog-card"
                style={{
                  background: "#fff",
                  border: "1px solid #eaecf0",
                  borderRadius: "20px",
                  padding: "36px 28px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ color: "#f59e0b", fontSize: "18px", letterSpacing: "2px" }}>
                    {"★".repeat(rev.rating)}
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      background: "rgba(222, 242, 92, 0.4)",
                      color: "#18171c",
                      padding: "4px 10px",
                      borderRadius: "12px",
                    }}
                  >
                    {rev.highlight}
                  </span>
                </div>

                <p style={{ fontSize: "15.5px", lineHeight: "1.7", color: "#344054", fontStyle: "italic", marginBottom: "24px", flexGrow: 1 }}>
                  &ldquo;{rev.quote}&rdquo;
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "16px", borderTop: "1px solid #f2f4f7" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "#18171c",
                      color: "#def25c",
                      fontWeight: 800,
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {rev.author.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#18171c" }}>{rev.author}</div>
                    <div style={{ fontSize: "13px", color: "#667085" }}>{rev.title}, {rev.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="section-gap" style={{ background: "#f8f9fa", paddingTop: "0px", paddingBottom: "80px" }}>
        <div className="w-layout-blockcontainer container w-container">
          <div className="qs-ai-spotlight-box" style={{ padding: "52px 40px", borderRadius: "24px" }}>
            <div className="qs-ai-inner" style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>
              <h2 className="heading-title qs-ai-heading" style={{ fontSize: "clamp(28px, 3.6vw, 44px)", marginBottom: "16px" }}>
                Ready to Join Our Success Stories?
              </h2>
              <p className="qs-ai-desc" style={{ fontSize: "17px", lineHeight: "1.75", color: "rgba(255,255,255,0.9)", marginBottom: "28px" }}>
                Let&apos;s build a customized growth strategy designed around your business goals.
              </p>
              <Button href="/contact" label="Talk to a Growth Strategist" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

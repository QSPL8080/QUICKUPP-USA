import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Our Team | Mercket - Webflow HTML website template",
  description:
    "Meet the professionals behind our work, bringing together strategy, creativity, and expertise.",
};

const teamMembers = [
  { href: "/team/ronald-benson", name: "Ronald Benson", role: "Worker", img: "team-img-01" },
  { href: "/team/heanri-dokanai", name: "Heanri Dokanai", role: "Founder", img: "team-img-02" },
  { href: "/team/robert-jhonson", name: "Robert Jhonson", role: "Co-CEO", img: "team-img-03" },
  { href: "/team/marko-daniel", name: "Marko Daniel", role: "Head Engineer", img: "team-img-04" },
  { href: "/team/sony-miltar", name: "Sony Miltar", role: "Marketing Manager", img: "team-img-05" },
  { href: "/team/jake-nicholson", name: "Jake Nicholson", role: "Director", img: "team-img-06" },
];

export default function OurTeamPage() {
  return (
    <>
      <Header />
      <section className="breadcrumb-section _02">
        <div className="w-layout-blockcontainer container-large w-container">
          <div className="breadcrumb-wrap">
            <div className="breadcrumb-title-animation">
              <h2 className="breadcrumb-heading-title">Our Experts</h2>
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
              <div className="breadcrumb-pages-text">Our Team</div>
            </div>
            <div className="breadcrumb-desc-wrap">
              <div className="breadcrumb-desc">
                A passionate team dedicated to delivering innovative and
                results-driven solutions.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gap">
        <div className="w-layout-blockcontainer container w-container">
          <div className="team-one w-dyn-list">
            <div role="list" className="team-one-list detail-page-list w-dyn-items">
              {teamMembers.map((member, i) => (
                <div key={i} role="listitem" className="team-one-item w-dyn-item">
                  <div className="team-one-wrap">
                    <a
                      href={member.href}
                      className="team-one-image-wrap w-inline-block"
                    >
                      <img
                        alt="Team Image"
                        loading="lazy"
                        src={`/images/${member.img}.jpg`}
                        sizes="(max-width: 767px) 100vw, (max-width: 991px) 727px, 939px"
                        srcSet={`/images/${member.img}-p-500.jpg 500w, /images/${member.img}.jpg 800w`}
                        className="team-one-preview"
                      />
                    </a>
                    <div className="team-one-inner">
                      <div className="team-one-title-wrap">
                        <div>
                          <a href={member.href} className="text-style-h2">
                            {member.name}
                          </a>
                        </div>
                        <div className="team-one-social-link-ul">
                          {[0, 1, 2].map((j) => (
                            <div key={j}>
                              <a
                                href="https://www.facebook.com/"
                                className="team-one-social-link w-inline-block"
                              >
                                <div className="meta-one-icons"></div>
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="team-one-link-wrap">
                        <div className="team-one-category-wrap">
                          <div className="category">(</div>
                          <div className="category">{member.role}</div>
                          <div className="category">)</div>
                        </div>
                        <div>
                          <a
                            href={member.href}
                            className="team-one-link w-inline-block"
                          >
                            <img
                              src="/images/down-left.svg"
                              loading="lazy"
                              alt="down-left"
                              className="team-one-link-icon"
                            />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
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

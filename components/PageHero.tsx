import Link from "next/link";

export default function PageHero({
  title,
  description,
  crumb,
  variant = "_04",
}: {
  title: string;
  description?: string;
  crumb: string;
  variant?: string;
}) {
  return (
    <section className={`breadcrumb-section ${variant}`}>
      <div className="w-layout-blockcontainer container-large w-container">
        <div className="breadcrumb-wrap">
          <div className="breadcrumb-title-animation">
            <h1 className="breadcrumb-heading-title">{title}</h1>
          </div>
        </div>
        <div className="breadcrumb-bottom-content">
          <div className="breadcrumb-pages-map">
            <div className="breadcrumb-pages-text-wrap">
              <Link href="/" className="breadcrumb-pages-text underline">
                Home
              </Link>
              <div className="dashed">/</div>
            </div>
            <div className="breadcrumb-pages-text">{crumb}</div>
          </div>
          {description && (
            <div className="breadcrumb-desc-wrap">
              <div className="breadcrumb-desc">{description}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

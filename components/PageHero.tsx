import Link from "next/link";

function renderGradientHeading(text?: string) {
  if (!text) return null;
  const words = text.split(" ");
  if (words.length === 1) {
    return <span className="qs-gradient-text">{text}</span>;
  }
  if (words.length === 2) {
    return (
      <>
        <span>{words[0]}</span>{" "}
        <span className="qs-gradient-text">{words[1]}</span>
      </>
    );
  }
  const splitPoint = Math.max(1, Math.floor(words.length * 0.55));
  const firstPart = words.slice(0, splitPoint).join(" ");
  const secondPart = words.slice(splitPoint).join(" ");

  return (
    <>
      <span>{firstPart}</span>{" "}
      <span className="qs-gradient-text">{secondPart}</span>
    </>
  );
}

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
            <h1 className="breadcrumb-heading-title">{renderGradientHeading(title)}</h1>
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

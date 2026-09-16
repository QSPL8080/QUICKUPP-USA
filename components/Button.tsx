import Link from "next/link";

type ButtonVariant = "secondary-bg" | "white-bg" | "global-bg";

export default function Button({
  href,
  label,
  variant = "secondary-bg",
  external = false,
}: {
  href: string;
  label: string;
  variant?: ButtonVariant;
  external?: boolean;
}) {
  const inner = (
    <>
      <div className="button-hover-overlay"></div>
      <div className="button-text-wrapper">
        <div className="button-text-wrap">
          <div className="button-text">{label}</div>
          <div className="button-text-hover">{label}</div>
        </div>
      </div>
      <div className="button-arrow-wrapper">
        <div className="button-arrow-wrap">
          <img
            src="/images/button-arrow.svg"
            loading="lazy"
            width="20"
            height="20"
            alt="button-arrow"
            className="button-arrow"
          />
        </div>
      </div>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-wf--button--variant={variant}
        className="button-link w-inline-block"
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} data-wf--button--variant={variant} className="button-link w-inline-block">
      {inner}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AboutSubNav() {
  const pathname = usePathname();

  const links = [
    { label: "Who We Are", href: "/about/who-we-are" },
    { label: "Why Choose Us", href: "/about/why-choose-us" },
    { label: "Our Approach", href: "/about/our-approach" },
    { label: "Our Team", href: "/about/our-team" },
  ];

  return (
    <div style={{ background: "#060b17", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 0", position: "relative", zIndex: 10 }}>
      <div className="sf-container">
        <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href === "/about/who-we-are" && pathname === "/about");
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "8px 22px",
                  borderRadius: "100px",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.25s ease",
                  color: isActive ? "#060b17" : "rgba(255,255,255,0.75)",
                  background: isActive ? "#def25c" : "rgba(255,255,255,0.06)",
                  border: isActive ? "1px solid #def25c" : "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

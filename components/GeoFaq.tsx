"use client";

import { useState } from "react";

/* FAQ accordion for the location pages (first question open) */
export default function GeoFaq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="geo-faq">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className={`geo-faq-item${isOpen ? " is-open" : ""}`}>
            <button type="button" className="geo-faq-q" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
              <span>{f.q}</span>
              <span className="geo-faq-sign" aria-hidden="true" />
            </button>
            <div className="geo-faq-a" aria-hidden={!isOpen}>
              <div>
                <p className="geo-text" dangerouslySetInnerHTML={{ __html: f.a }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

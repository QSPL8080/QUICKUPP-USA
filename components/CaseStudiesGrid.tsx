"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { CASE_STUDY_CATEGORIES } from "@/lib/caseStudyCategories";

/*
 * Case studies list: category chips, one featured study and a magazine grid of
 * the rest. Cards rise in as they come into view. All text comes from the case
 * study documents.
 */
export type CaseCard = {
  slug: string;
  title: string;
  intro: string;
  client: string;
  location: string;
  services: string;
  area: string;
  sector: string;
  stats: { val: string; lbl: string }[];
  cover: string;
};

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

function useReveal(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-cs-reveal]"));
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => {
      if (!el.classList.contains("is-in")) io.observe(el);
    });
    return () => io.disconnect();
  }, [dep]);
  return ref;
}

export default function CaseStudiesGrid({ cards }: { cards: CaseCard[] }) {
  const areas = useMemo(() => {
    const seen = new Map<string, number>();
    for (const c of cards) seen.set(c.area, (seen.get(c.area) || 0) + 1);
    return CASE_STUDY_CATEGORIES.filter((a) => seen.has(a)).map((a) => [a, seen.get(a) as number] as const);
  }, [cards]);
  const [area, setArea] = useState("");
  const shown = area ? cards.filter((c) => c.area === area) : cards;
  const [lead, ...rest] = shown;
  const ref = useReveal(area);

  return (
    <div ref={ref}>
      <div className="cl-chips" role="toolbar" aria-label="Filter case studies">
        <button type="button" className={`cl-chip${area === "" ? " is-on" : ""}`} aria-pressed={area === ""} onClick={() => setArea("")}>
          All <span className="cl-chip-n">{cards.length}</span>
        </button>
        {areas.map(([a, n]) => (
          <button key={a} type="button" className={`cl-chip${area === a ? " is-on" : ""}`} aria-pressed={area === a} onClick={() => setArea(a)}>
            {a} <span className="cl-chip-n">{n}</span>
          </button>
        ))}
      </div>

      {lead && (
        <article key={`lead-${lead.slug}`} className="cl-lead" data-cs-reveal="">
          <Link href={`/case-studies/${lead.slug}`} className="cl-lead-media" aria-hidden="true" tabIndex={-1}>
            <span className="cl-img" style={{ backgroundImage: `url('${lead.cover}')` }} />
            <span className="cl-lead-tags">
              <span className="cl-tag">{lead.area}</span>
              {lead.sector && <span className="cl-tag cl-tag-soft">{lead.sector}</span>}
            </span>
          </Link>
          <div className="cl-lead-body">
            <p className="cl-client">
              {lead.client}
              {lead.location && <span> · {lead.location}</span>}
            </p>
            <h2 className="cl-lead-title">
              <Link href={`/case-studies/${lead.slug}`}>{lead.title}</Link>
            </h2>
            <p className="cl-lead-intro">{lead.intro}</p>
            {lead.stats.length > 0 && (
              <dl className="cl-lead-stats">
                {lead.stats.map((s) => (
                  <div key={s.val + s.lbl}>
                    <dt>{s.val}</dt>
                    <dd>{s.lbl}</dd>
                  </div>
                ))}
              </dl>
            )}
            <Link href={`/case-studies/${lead.slug}`} className="cl-btn">
              <span>Read Full Case Study</span>
              <Arrow />
            </Link>
          </div>
        </article>
      )}

      {rest.length > 0 && (
        <div className="cl-grid">
          {rest.map((c, i) => {
            const top = c.stats[0];
            return (
              <article key={c.slug} className="cl-card" data-cs-reveal="" style={{ "--d": `${(i % 3) * 0.08}s` } as CSSProperties}>
                <Link href={`/case-studies/${c.slug}`} className="cl-card-link">
                  <span className="cl-card-media">
                    <span className="cl-img" style={{ backgroundImage: `url('${c.cover.replace("w=1600", "w=900")}')` }} />
                    <span className="cl-tag cl-card-tag">{c.area}</span>
                    {top && (
                      <span className="cl-card-stat">
                        <strong>{top.val}</strong>
                        <span>{top.lbl}</span>
                      </span>
                    )}
                  </span>
                  <span className="cl-card-body">
                    <span className="cl-client">
                      {c.client}
                      {c.location && <span> · {c.location}</span>}
                    </span>
                    <h2 className="cl-card-title">{c.title}</h2>
                    {c.sector && <span className="cl-card-sector">{c.sector}</span>}
                    <span className="cl-card-more">
                      Read Full Case Study <Arrow />
                    </span>
                  </span>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

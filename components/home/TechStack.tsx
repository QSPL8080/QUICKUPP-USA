"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import HomeIcon, { type HomeIconName } from "@/components/home/HomeIcon";

/*
 * Technology & Capabilities: the six groups sit in two columns around a
 * glowing hub, each joined to it by a beam that light pulses travel along.
 * Hovering a group lights its beam. The beams are measured from the real card
 * positions, so they always meet the cards whatever the screen width.
 */
type Row = { label: string; items: string[]; icon: string };

export default function TechStack({ rows }: { rows: Row[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [paths, setPaths] = useState<string[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hot, setHot] = useState<number | null>(null);
  const half = Math.ceil(rows.length / 2);

  const measure = useCallback(() => {
    const map = mapRef.current;
    const hub = hubRef.current;
    if (!map || !hub) return;
    const m = map.getBoundingClientRect();
    const hb = hub.getBoundingClientRect();
    // hub hidden (phones): no beams
    if (hb.width === 0) {
      setPaths([]);
      return;
    }
    const hx = hb.left + hb.width / 2 - m.left;
    const hy = hb.top + hb.height / 2 - m.top;
    const r = hb.width / 2;
    const next = cardRefs.current.map((el, i) => {
      if (!el) return "";
      const c = el.getBoundingClientRect();
      const left = i < half;
      const x = (left ? c.right : c.left) - m.left;
      const y = c.top + c.height / 2 - m.top;
      const ex = hx + (left ? -r : r);
      const mid = (x + ex) / 2;
      return `M${x.toFixed(1)},${y.toFixed(1)} C${mid.toFixed(1)},${y.toFixed(1)} ${mid.toFixed(1)},${hy.toFixed(1)} ${ex.toFixed(1)},${hy.toFixed(1)}`;
    });
    setSize({ w: m.width, h: m.height });
    setPaths(next);
  }, [half]);

  useLayoutEffect(() => {
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => measure()) : null;
    if (ro && mapRef.current) ro.observe(mapRef.current);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const card = (r: Row, i: number) => (
    <article
      key={r.label}
      ref={(el) => {
        cardRefs.current[i] = el;
      }}
      className={`hx-stack-card${hot === i ? " is-hot" : ""}`}
      style={{ "--k": i } as CSSProperties}
      onMouseEnter={() => setHot(i)}
      onMouseLeave={() => setHot(null)}
    >
      <div className="hx-stack-card-head">
        <span className="hx-stack-icon" aria-hidden="true">
          <HomeIcon name={r.icon as HomeIconName} size={18} />
        </span>
        <h3 className="hx-stack-label">{r.label}</h3>
      </div>
      <ul className="hx-stack-pills">
        {r.items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </article>
  );

  return (
    <div ref={mapRef} className="hx-stack-map" data-hx="stack">
      <svg className="hx-stack-beams" width={size.w} height={size.h} viewBox={`0 0 ${size.w || 1} ${size.h || 1}`} aria-hidden="true">
        <defs>
          <linearGradient id="hx-beam-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={size.w || 1} y2="0">
            <stop offset="0" stopColor="#00d2ff" />
            <stop offset="0.5" stopColor="#6366f1" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        {paths.map((d, i) =>
          d ? (
            <g key={i} className={`hx-beam${hot === i ? " is-hot" : ""}`} style={{ "--k": i } as CSSProperties}>
              <path className="hx-beam-track" d={d} pathLength={100} />
              <path className="hx-beam-pulse" d={d} pathLength={100} stroke="url(#hx-beam-grad)" />
            </g>
          ) : null
        )}
      </svg>

      <div className="hx-stack-col hx-stack-col-l">{rows.slice(0, half).map((r, i) => card(r, i))}</div>

      <div ref={hubRef} className="hx-stack-hub" aria-hidden="true">
        <span className="hx-stack-ring" />
        <span className="hx-stack-ring hx-stack-ring-2" />
        <span className="hx-stack-core">
          <HomeIcon name="cpu" size={30} strokeWidth={1.6} />
        </span>
      </div>

      <div className="hx-stack-col hx-stack-col-r">{rows.slice(half).map((r, i) => card(r, i + half))}</div>
    </div>
  );
}

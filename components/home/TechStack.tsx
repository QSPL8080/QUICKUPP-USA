import type { CSSProperties } from "react";
import HomeIcon, { type HomeIconName } from "@/components/home/HomeIcon";

/*
 * Technology & Capabilities: the six groups as rows on the dark radar stage,
 * each row sliding in after the one before as the stage scrolls into view.
 */
type Row = { label: string; items: string[]; icon: string };

export default function TechStack({ rows }: { rows: Row[] }) {
  return (
    <dl className="hx-radar-rows" data-hx="stack">
      {rows.map((r, i) => (
        <div key={r.label} className="hx-radar-row" style={{ "--k": i } as CSSProperties}>
          <dt>
            <span className="hx-radar-icon" aria-hidden="true">
              <HomeIcon name={r.icon as HomeIconName} size={16} />
            </span>
            <span>{r.label}</span>
          </dt>
          <dd>
            <span className="hx-radar-items">
              <span className="hx-radar-list">
                {r.items.map((t) => (
                  <span key={t} className="hx-radar-pill">
                    {t}
                  </span>
                ))}
              </span>
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

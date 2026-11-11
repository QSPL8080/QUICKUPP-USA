import Link from "next/link";

/*
 * Small server-rendered chart pieces for the CRM dashboards. Plain HTML/SVG,
 * no client JavaScript, styled by the "crm-dash-" rules in app/crm/crm.css.
 */

/** Monthly columns with the value above each column */
export function ColumnChart({
  data,
  format = (v) => String(v),
  empty = "Nothing recorded yet.",
}: {
  data: { key: string; label: string; value: number; href?: string }[];
  format?: (v: number) => string;
  empty?: string;
}) {
  const max = Math.max(0, ...data.map((d) => d.value));
  if (max === 0) {
    return (
      <div className="crm-dash-cols is-empty">
        {data.map((d) => (
          <div key={d.key} className="crm-dash-col">
            <span className="crm-dash-col-bar" style={{ height: "2px" }} />
            <span className="crm-dash-col-label">{d.label}</span>
          </div>
        ))}
        <p className="crm-dash-empty">{empty}</p>
      </div>
    );
  }
  const last = data.length - 1;
  return (
    <div className="crm-dash-cols" role="img" aria-label={data.map((d) => `${d.label}: ${format(d.value)}`).join(", ")}>
      {data.map((d, i) => {
        const colClass = `crm-dash-col${i === last ? " is-current" : ""}${d.href ? " is-clickable" : ""}`;
        const content = (
          <>
            <span className="crm-dash-col-value">{d.value > 0 ? format(d.value) : ""}</span>
            <span className="crm-dash-col-bar" style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }} />
            <span className="crm-dash-col-label">{d.label}</span>
          </>
        );
        return d.href ? (
          <Link
            key={d.key}
            href={d.href}
            className={colClass}
            style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
            title={`View ${d.label} (${format(d.value)})`}
          >
            {content}
          </Link>
        ) : (
          <div key={d.key} className={colClass}>
            {content}
          </div>
        );
      })}
    </div>
  );
}

/** A percentage ring */
export function Ring({ value, label, tone = "indigo" }: { value: number; label: string; tone?: "indigo" | "green" }) {
  const v = Math.max(0, Math.min(100, value));
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <div className={`crm-dash-ring crm-dash-ring-${tone}`}>
      <svg viewBox="0 0 76 76" width="76" height="76" aria-hidden="true">
        <circle cx="38" cy="38" r={r} className="crm-dash-ring-track" />
        <circle
          cx="38"
          cy="38"
          r={r}
          className="crm-dash-ring-fill"
          strokeDasharray={`${(v / 100) * c} ${c}`}
          transform="rotate(-90 38 38)"
        />
      </svg>
      <span className="crm-dash-ring-num">{v}%</span>
      <span className="crm-sr">{label}</span>
    </div>
  );
}

export type StackPart = { key: string; label: string; count: number; color: string; note?: string; href?: string };

/** One horizontal bar split by share, with a legend list underneath */
export function StackBar({ parts, unit = "" }: { parts: StackPart[]; unit?: string }) {
  const total = parts.reduce((a, p) => a + p.count, 0);
  return (
    <div className="crm-dash-stack">
      <div className="crm-dash-stack-bar" role="img" aria-label={parts.map((p) => `${p.label}: ${p.count}`).join(", ")}>
        {total === 0 ? (
          <span className="crm-dash-stack-seg is-empty" style={{ flexGrow: 1 }} />
        ) : (
          parts
            .filter((p) => p.count > 0)
            .map((p) =>
              p.href ? (
                <Link
                  key={p.key}
                  href={p.href}
                  className="crm-dash-stack-seg"
                  style={{ flexGrow: p.count, background: p.color, display: "block", cursor: "pointer" }}
                  title={`${p.label}: ${p.count} (Click to view)`}
                />
              ) : (
                <span
                  key={p.key}
                  className="crm-dash-stack-seg"
                  style={{ flexGrow: p.count, background: p.color }}
                  title={`${p.label}: ${p.count}`}
                />
              )
            )
        )}
      </div>
      <ul className="crm-dash-legend">
        {parts.map((p) => {
          const inner = (
            <>
              <span className="crm-dash-dot" style={{ background: p.color }} aria-hidden="true" />
              <span className="crm-dash-legend-label">{p.label}</span>
              {p.note && <span className="crm-dash-legend-note">{p.note}</span>}
              <span className="crm-dash-legend-num">
                {p.count}
                {unit}
              </span>
              <span className="crm-dash-legend-pct">{total ? Math.round((p.count / total) * 100) : 0}%</span>
            </>
          );
          return <li key={p.key}>{p.href ? <Link href={p.href} className="crm-dash-legend-row">{inner}</Link> : <div className="crm-dash-legend-row">{inner}</div>}</li>;
        })}
      </ul>
    </div>
  );
}

/** Ranked list with thin bars */
export function RankList({
  items,
  format = (v) => String(v),
  empty = "Nothing recorded yet.",
}: {
  items: { label: string; value: number; note?: string }[];
  format?: (v: number) => string;
  empty?: string;
}) {
  if (!items.length) return <p className="crm-muted">{empty}</p>;
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="crm-dash-rank">
      {items.map((it) => (
        <li key={it.label}>
          <div className="crm-dash-rank-top">
            <span className="crm-dash-rank-label">{it.label}</span>
            <span className="crm-dash-rank-num">
              {format(it.value)}
              {it.note && <span className="crm-dash-rank-note"> · {it.note}</span>}
            </span>
          </div>
          <span className="crm-dash-rank-track">
            <span className="crm-dash-rank-fill" style={{ width: `${it.value > 0 ? Math.max(3, (it.value / max) * 100) : 0}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Compact money for chart labels: $1.2K, $14K, $1.1M */
export function shortMoney(v: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(v);
  } catch {
    return `${currency} ${Math.round(v)}`;
  }
}

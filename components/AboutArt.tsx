"use client";

import React, { useEffect, useRef, useState } from "react";

/*
 * Two edge graphics per About subpage (one on the left, one on the right),
 * each drawn for one spot only, so no graphic repeats anywhere (wide screens only). Every graphic grows out
 * of the screen edge and runs the full height of its section.
 * Drawn for the left edge; the right-edge version is mirrored in CSS.
 * Pure decoration: no text, hidden from screen readers.
 */

export type ArtKind = "layers" | "network" | "route" | "hub" | "growth" | "gauge" | "modules" | "target";

const C = { cyan: "#22d3ee", blue: "#3b82f6", indigo: "#6366f1", purple: "#a855f7", pink: "#ec4899", amber: "#f59e0b", ink: "#cbd5e1", line: "#e2e8f0" };
const v = (o: Record<string, string | number>) => o as React.CSSProperties;

/* isometric slab outline centred on (cx, cy) */
function Slab({ cx, cy, w, color, fill }: { cx: number; cy: number; w: number; color: string; fill?: string }) {
  const h = w * 0.58, t = w * 0.12;
  return (
    <g stroke={color}>
      <path d={`M${cx - w} ${cy}L${cx} ${cy - h}L${cx + w} ${cy}L${cx} ${cy + h}Z`} fill={fill ?? "none"} />
      <path d={`M${cx - w} ${cy}V${cy + t}L${cx} ${cy + h + t}L${cx + w} ${cy + t}V${cy}M${cx} ${cy + h}V${cy + h + t}`} />
    </g>
  );
}

/* isometric cube outline, top face centred on (cx, cy) */
function Cube({ cx, cy, s, color, fill }: { cx: number; cy: number; s: number; color: string; fill?: string }) {
  const h = s * 0.58;
  return (
    <g stroke={color}>
      <path d={`M${cx - s} ${cy}L${cx} ${cy - h}L${cx + s} ${cy}L${cx} ${cy + h}Z`} fill={fill ?? "none"} />
      <path d={`M${cx - s} ${cy}V${cy + s}L${cx} ${cy + h + s}L${cx + s} ${cy + s}V${cy}M${cx} ${cy + h}V${cy + h + s}`} />
    </g>
  );
}

function Art({ kind }: { kind: ArtKind }) {
  switch (kind) {
    /* Who We Are — Marketing, AI and Technology as layers of one structure,
       sliding out from the edge */
    case "layers":
      return (
        <>
          <path d="M0 60H120M0 590H150" stroke={C.line} strokeDasharray="2 8" />
          <path d="M44 70V600" stroke={C.line} strokeDasharray="2 8" />
          <g className="abx-art-float" style={v({ "--d": "0s" })}>
            <Slab cx={44} cy={190} w={150} color={C.amber} />
          </g>
          <g className="abx-art-float" style={v({ "--d": "-2.6s" })}>
            <Slab cx={44} cy={290} w={150} color={C.cyan} />
          </g>
          <g className="abx-art-float" style={v({ "--d": "-5.2s" })}>
            <Slab cx={44} cy={390} w={150} color={C.pink} />
          </g>
          <Slab cx={44} cy={490} w={150} color={C.ink} fill="url(#abx-art-soft)" />
          {[190, 290, 390].map((y, i) => (
            <circle key={y} cx={194} cy={y} r={4.5} fill={[C.amber, C.cyan, C.pink][i]} stroke="none" className="abx-art-pulse" style={v({ "--d": `${-i}s` })} />
          ))}
        </>
      );

    /* Our Approach — one route from the edge through five stages */
    case "route": {
      const d = "M-10 40C150 70 210 150 150 230S20 330 60 420S220 500 190 600";
      const stops: [number, number, string][] = [[118, 94, C.cyan], [150, 230, C.blue], [64, 330, C.indigo], [128, 470, C.purple], [190, 600, C.pink]];
      return (
        <>
          <path d={d} stroke={C.line} strokeWidth={14} strokeOpacity={0.55} />
          <path d={d} stroke={C.ink} strokeDasharray="2 10" className="abx-art-flow" />
          <path d={d} stroke="url(#abx-art-v)" strokeWidth={2.6} className="abx-art-draw" style={v({ "--len": 900 })} />
          {stops.map(([x, y, c], i) => (
            <g key={i} className="abx-art-pop" style={v({ "--d": `${0.5 + i * 0.25}s` })}>
              <circle cx={x} cy={y} r={14} fill="#fff" stroke={c} />
              <circle cx={x} cy={y} r={5} fill={c} stroke="none" />
            </g>
          ))}
          <path d="M190 584v-30l22 9-22 9" stroke={C.pink} className="abx-art-pop" style={v({ "--d": "1.8s" })} />
        </>
      );
    }

    /* Why Choose Us — results that keep climbing, columns rising out of the edge */
    case "growth": {
      const cols: [number, number, string][] = [[14, 120, C.cyan], [74, 190, C.blue], [134, 270, C.indigo], [194, 360, C.purple]];
      const base = 560;
      return (
        <>
          {[200, 280, 360, 440, 520].map((y) => (
            <path key={y} d={`M0 ${y}H240`} stroke={C.line} strokeDasharray="2 8" />
          ))}
          <path d={`M0 ${base}H250`} stroke={C.ink} />
          {cols.map(([x, hgt, c], i) => (
            <g key={i} className="abx-art-rise" style={v({ "--d": `${i * 0.16}s` })}>
              <path
                stroke={c}
                fill="url(#abx-art-soft)"
                d={`M${x - 22} ${base}V${base - hgt}L${x} ${base - hgt - 13}L${x + 22} ${base - hgt}V${base}Z`}
              />
              <path stroke={c} d={`M${x - 22} ${base - hgt}L${x} ${base - hgt + 13}L${x + 22} ${base - hgt}M${x} ${base - hgt + 13}V${base}`} />
            </g>
          ))}
          <path className="abx-art-draw" style={v({ "--len": 420 })} stroke={C.amber} strokeWidth={2.6} d="M-6 400L60 330L110 350L226 168" />
          <path className="abx-art-pop" style={v({ "--d": "1.6s" })} stroke={C.amber} strokeWidth={2.6} d="M200 170H228V198" />
        </>
      );
    }

    /* Why Businesses Choose Us — separate pieces brought together into one system */
    case "modules": {
      const cubes: [number, number, number, string, string, boolean?][] = [
        [20, 120, 34, C.cyan, "0s"], [112, 176, 34, C.purple, "-2s"], [20, 236, 34, C.pink, "-4s"],
        [112, 294, 42, C.indigo, "-1s", true], [20, 360, 34, C.amber, "-3s"], [112, 420, 34, C.cyan, "-5s"], [20, 480, 34, C.ink, "-2.5s"],
      ];
      return (
        <>
          <path d="M0 152L78 196M78 214L0 258M0 270L70 314M70 334L0 380M0 392L78 440M78 456L0 500" stroke={C.ink} strokeDasharray="3 8" className="abx-art-flow" />
          {cubes.map(([x, y, s, c, d, hub], i) => (
            <g key={i} className={hub ? undefined : "abx-art-float"} style={v({ "--d": d })}>
              <Cube cx={x} cy={y} s={s} color={c} fill={hub ? "url(#abx-art-soft)" : undefined} />
            </g>
          ))}
          <circle cx={112} cy={294} r={5} fill={C.indigo} stroke="none" className="abx-art-pulse" />
          <path d="M154 318H220" stroke="url(#abx-art-h)" strokeWidth={2.4} className="abx-art-draw" style={v({ "--len": 80 })} />
          <circle cx={226} cy={318} r={6} fill="#fff" stroke={C.pink} className="abx-art-pop" style={v({ "--d": "1.2s" })} />
        </>
      );
    }

    /* Who We Are (closing) — AI: a neural network feeding in from the edge */
    case "network": {
      const cols: [number, number[]][] = [[6, [130, 210, 290, 370, 450, 530]], [96, [170, 260, 350, 440, 510]], [186, [230, 320, 410]]];
      const colors = [C.cyan, C.indigo, C.purple, C.pink, C.blue, C.amber];
      const lines: string[] = [];
      for (let c = 0; c < cols.length - 1; c++)
        for (const y1 of cols[c][1]) for (const y2 of cols[c + 1][1]) lines.push(`M${cols[c][0]} ${y1}L${cols[c + 1][0]} ${y2}`);
      return (
        <>
          <path d={lines.join("")} stroke={C.line} />
          <path d="M6 290L96 350L186 320M6 450L96 440L186 410M6 210L96 170L186 230" stroke="url(#abx-art-v)" strokeWidth={2} className="abx-art-draw" style={v({ "--len": 700 })} />
          {cols.map(([x, ys], ci) =>
            ys.map((y, i) => (
              <g key={`${ci}-${i}`} className="abx-art-pop" style={v({ "--d": `${0.2 + ci * 0.25 + i * 0.05}s` })}>
                <circle cx={x} cy={y} r={ci === 2 ? 11 : 8} fill="#fff" stroke={colors[(i + ci) % colors.length]} />
                <circle cx={x} cy={y} r={ci === 2 ? 4 : 3} fill={colors[(i + ci) % colors.length]} stroke="none" className="abx-art-pulse" style={v({ "--d": `${-(i + ci)}s` })} />
              </g>
            ))
          )}
          <path d="M200 320H244" stroke="url(#abx-art-h)" strokeWidth={2.4} className="abx-art-draw" style={v({ "--len": 60 })} />
        </>
      );
    }

    /* Our Approach (three capabilities) — one hub on the edge, capabilities in orbit */
    case "hub":
      return (
        <>
          <circle cx={0} cy={320} r={220} stroke={C.line} strokeDasharray="2 8" />
          <circle cx={0} cy={320} r={160} stroke={C.ink} strokeDasharray="6 10" className="abx-art-flow" />
          <circle cx={0} cy={320} r={100} stroke="url(#abx-art-v)" strokeOpacity={0.7} />
          <circle cx={0} cy={320} r={46} stroke={C.indigo} fill="url(#abx-art-soft)" />
          {([[100, -52, C.cyan], [160, 8, C.pink], [220, 40, C.amber]] as [number, number, string][]).map(([r, deg, c], i) => {
            const a = (deg * Math.PI) / 180;
            const x = r * Math.cos(a), y = 320 + r * Math.sin(a);
            return (
              <g key={i} className="abx-art-pop" style={v({ "--d": `${0.4 + i * 0.3}s` })}>
                <path d={`M0 320L${x} ${y}`} stroke={c} strokeDasharray="2 6" />
                <circle cx={x} cy={y} r={15} fill="#fff" stroke={c} />
                <circle cx={x} cy={y} r={5.5} fill={c} stroke="none" className="abx-art-pulse" style={v({ "--d": `${-i}s` })} />
              </g>
            );
          })}
        </>
      );

    /* Why Choose Us (reasons) — a gauge reading out of the edge */
    case "gauge": {
      const ticks = Array.from({ length: 31 }, (_, i) => {
        const a = ((-90 + i * 6) * Math.PI) / 180;
        const r1 = 236, r2 = i % 5 === 0 ? 220 : 228;
        return `M${r1 * Math.cos(a)} ${320 + r1 * Math.sin(a)}L${r2 * Math.cos(a)} ${320 + r2 * Math.sin(a)}`;
      }).join("");
      const ring = (r: number) => `M0 ${320 - r}A${r} ${r} 0 0 1 0 ${320 + r}`;
      return (
        <>
          <path d={ticks} stroke={C.ink} />
          {([[196, C.cyan, 0.92], [156, C.indigo, 0.78], [116, C.purple, 0.64], [76, C.pink, 0.5]] as [number, string, number][]).map(([r, c, f], i) => (
            <g key={i}>
              <path d={ring(r)} stroke={C.line} strokeWidth={8} />
              <path d={ring(r)} stroke={c} strokeWidth={8} className="abx-art-meter" style={v({ "--len": Math.PI * r, "--to": Math.PI * r * (1 - f), "--d": `${0.2 + i * 0.15}s` })} />
            </g>
          ))}
          <circle cx={0} cy={320} r={30} fill="#fff" stroke={C.indigo} />
          <circle cx={0} cy={320} r={8} fill={C.indigo} stroke="none" className="abx-art-pulse" />
        </>
      );
    }

    /* Why Businesses Choose Us (closing) — focused on what comes next */
    case "target":
      return (
        <>
          <circle cx={0} cy={320} r={240} stroke={C.line} strokeDasharray="2 8" />
          <circle cx={0} cy={320} r={184} stroke={C.cyan} strokeDasharray="140 30" className="abx-art-spin" />
          <circle cx={0} cy={320} r={130} stroke={C.purple} />
          <circle cx={0} cy={320} r={78} stroke={C.pink} />
          <circle cx={0} cy={320} r={30} stroke={C.indigo} fill="url(#abx-art-soft)" />
          <circle cx={0} cy={320} r={8} fill={C.indigo} stroke="none" className="abx-art-pulse" />
          <g className="abx-art-dart">
            <path d="M10 316L230 160" stroke={C.amber} strokeWidth={2.6} />
            <path d="M10 316l24-4M10 316l6-23M230 160l-4 26M230 160l-26 4M214 172l-4 22M214 172l-22 4" stroke={C.amber} strokeWidth={2.6} />
          </g>
        </>
      );
  }
}

export default function AboutArt({ kind, side }: { kind: ArtKind; side: "left" | "right" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`abx-art abx-art-${side}${inView ? " is-in" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 260 640" preserveAspectRatio="xMinYMid slice" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id="abx-art-v" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.cyan} />
            <stop offset="0.5" stopColor={C.indigo} />
            <stop offset="1" stopColor={C.pink} />
          </linearGradient>
          <linearGradient id="abx-art-h" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.indigo} />
            <stop offset="1" stopColor={C.pink} />
          </linearGradient>
          <linearGradient id="abx-art-soft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={C.indigo} stopOpacity="0.08" />
            <stop offset="1" stopColor={C.pink} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <Art kind={kind} />
      </svg>
    </div>
  );
}

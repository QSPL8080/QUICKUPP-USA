"use client";

import React, { useEffect, useRef, useState } from "react";

/*
 * Line-art graphics for the empty space beside chosen About sections (wide
 * screens only). Pure decoration: no text, hidden from screen readers.
 * Brand colours, thin strokes and slow motion so they sit in the background.
 */

export type ArtKind = "stack" | "nodes" | "path" | "orbit" | "bars" | "arc" | "blocks" | "target";

const C = { cyan: "#22d3ee", blue: "#3b82f6", indigo: "#6366f1", purple: "#a855f7", pink: "#ec4899", amber: "#f59e0b", ink: "#cbd5e1" };

/* isometric slab outline centred on (cx, cy) */
function Slab({ cx, cy, w = 100, h = 58, t = 16, color }: { cx: number; cy: number; w?: number; h?: number; t?: number; color: string }) {
  return (
    <g stroke={color}>
      <path d={`M${cx - w} ${cy}L${cx} ${cy - h}L${cx + w} ${cy}L${cx} ${cy + h}Z`} />
      <path d={`M${cx - w} ${cy}V${cy + t}L${cx} ${cy + h + t}L${cx + w} ${cy + t}V${cy}`} />
      <path d={`M${cx} ${cy + h}V${cy + h + t}`} />
    </g>
  );
}

/* isometric cube outline, top face centred on (cx, cy) */
function Cube({ cx, cy, s = 34, color }: { cx: number; cy: number; s?: number; color: string }) {
  const h = s * 0.58;
  return (
    <g stroke={color}>
      <path d={`M${cx - s} ${cy}L${cx} ${cy - h}L${cx + s} ${cy}L${cx} ${cy + h}Z`} />
      <path d={`M${cx - s} ${cy}V${cy + s}L${cx} ${cy + h + s}L${cx + s} ${cy + s}V${cy}`} />
      <path d={`M${cx} ${cy + h}V${cy + h + s}`} />
    </g>
  );
}

const Spark = ({ x, y, r = 6, color }: { x: number; y: number; r?: number; color: string }) => (
  <path className="abx-art-twinkle" stroke={color} d={`M${x - r} ${y}H${x + r}M${x} ${y - r}V${y + r}`} />
);

function Art({ kind }: { kind: ArtKind }) {
  switch (kind) {
    /* three capabilities, stacked as one */
    case "stack":
      return (
        <>
          <g className="abx-art-float" style={{ "--d": "0s" } as React.CSSProperties}>
            <Slab cx={150} cy={96} color={C.amber} />
          </g>
          <g className="abx-art-float" style={{ "--d": "-2.4s" } as React.CSSProperties} transform="rotate(-8 150 168)">
            <Slab cx={150} cy={168} color={C.cyan} />
          </g>
          <g className="abx-art-float" style={{ "--d": "-4.8s" } as React.CSSProperties} transform="rotate(6 150 238)">
            <Slab cx={150} cy={238} color={C.pink} />
          </g>
          <g className="abx-art-float" style={{ "--d": "-1.2s" } as React.CSSProperties}>
            <Slab cx={150} cy={300} color={C.ink} />
          </g>
          <Spark x={36} y={60} color={C.indigo} />
          <Spark x={270} y={128} r={5} color={C.purple} />
          <circle cx={262} cy={262} r={4} fill={C.cyan} stroke="none" className="abx-art-twinkle" />
        </>
      );

    /* AI: a connected network */
    case "nodes": {
      const pts: [number, number, string][] = [
        [150, 170, C.indigo], [70, 90, C.cyan], [232, 84, C.pink], [52, 210, C.purple], [250, 210, C.cyan],
        [104, 290, C.amber], [210, 300, C.indigo], [150, 50, C.purple], [150, 312, C.pink],
      ];
      const links = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 7], [2, 7], [3, 5], [4, 6], [5, 8], [6, 8], [1, 3], [2, 4]];
      return (
        <>
          <path d="M150 112l50 29v58l-50 29-50-29v-58z" stroke={C.ink} className="abx-art-spin" />
          {links.map(([a, b], i) => (
            <line key={i} className="abx-art-draw" x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={C.ink} />
          ))}
          {pts.map(([x, y, c], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={i === 0 ? 14 : 8} stroke={c} fill="#fff" />
              <circle cx={x} cy={y} r={i === 0 ? 5 : 3} fill={c} stroke="none" className="abx-art-pulse" style={{ "--d": `${-i * 0.6}s` } as React.CSSProperties} />
            </g>
          ))}
        </>
      );
    }

    /* the route: five steps, rising */
    case "path": {
      const steps: [number, number, string][] = [[48, 300, C.cyan], [118, 236, C.blue], [86, 150, C.indigo], [190, 112, C.purple], [252, 40, C.pink]];
      return (
        <>
          <path className="abx-art-flow" stroke={C.ink} strokeDasharray="2 9" d="M48 300C96 290 140 266 118 236S56 176 86 150s88-10 104-38 30-58 62-72" />
          <path className="abx-art-draw" stroke="url(#abx-art-g)" d="M48 300C96 290 140 266 118 236S56 176 86 150s88-10 104-38 30-58 62-72" />
          {steps.map(([x, y, c], i) => (
            <g key={i} className="abx-art-float" style={{ "--d": `${-i * 1.1}s` } as React.CSSProperties}>
              <circle cx={x} cy={y} r={13} stroke={c} fill="#fff" />
              <circle cx={x} cy={y} r={4.5} fill={c} stroke="none" />
            </g>
          ))}
          <path d="M252 27V6l18 7-18 7" stroke={C.pink} />
          <Spark x={226} y={220} color={C.amber} />
          <circle cx={36} cy={196} r={4} fill={C.purple} stroke="none" className="abx-art-twinkle" />
        </>
      );
    }

    /* one core, capabilities in orbit */
    case "orbit":
      return (
        <>
          <ellipse cx={150} cy={172} rx={128} ry={52} stroke={C.ink} strokeDasharray="4 8" transform="rotate(-24 150 172)" />
          <ellipse cx={150} cy={172} rx={128} ry={52} stroke={C.ink} strokeDasharray="4 8" transform="rotate(24 150 172)" />
          <circle cx={150} cy={172} r={96} stroke={C.ink} strokeDasharray="1 7" />
          <circle cx={150} cy={172} r={30} stroke="url(#abx-art-g)" strokeWidth={3} />
          <circle cx={150} cy={172} r={10} fill={C.indigo} stroke="none" className="abx-art-pulse" />
          <g className="abx-art-orbit" style={{ "--t": "26s" } as React.CSSProperties}>
            <circle cx={246} cy={172} r={9} fill="#fff" stroke={C.cyan} />
            <circle cx={246} cy={172} r={3.5} fill={C.cyan} stroke="none" />
          </g>
          <g className="abx-art-orbit" style={{ "--t": "34s", "--s": "120deg" } as React.CSSProperties}>
            <circle cx={246} cy={172} r={9} fill="#fff" stroke={C.pink} />
            <circle cx={246} cy={172} r={3.5} fill={C.pink} stroke="none" />
          </g>
          <g className="abx-art-orbit" style={{ "--t": "42s", "--s": "240deg" } as React.CSSProperties}>
            <circle cx={246} cy={172} r={9} fill="#fff" stroke={C.amber} />
            <circle cx={246} cy={172} r={3.5} fill={C.amber} stroke="none" />
          </g>
          <Spark x={40} y={52} color={C.purple} />
          <Spark x={262} y={300} r={5} color={C.cyan} />
        </>
      );

    /* results that keep climbing */
    case "bars": {
      const bars: [number, number, string][] = [[60, 60, C.cyan], [118, 104, C.indigo], [176, 150, C.purple], [234, 204, C.pink]];
      return (
        <>
          <path d="M20 318H290" stroke={C.ink} />
          {bars.map(([x, hgt, c], i) => (
            <g key={i} className="abx-art-rise" style={{ "--d": `${i * 0.15}s` } as React.CSSProperties}>
              <path
                stroke={c}
                d={`M${x - 22} 318V${318 - hgt}L${x} ${306 - hgt}L${x + 22} ${318 - hgt}V318M${x - 22} ${318 - hgt}L${x} ${330 - hgt}L${x + 22} ${318 - hgt}M${x} ${330 - hgt}V318`}
              />
            </g>
          ))}
          <path className="abx-art-draw" stroke={C.amber} strokeWidth={3} d="M34 236L104 186L156 204L262 82" />
          <path className="abx-art-draw" stroke={C.amber} strokeWidth={3} d="M236 82H264V110" />
          <Spark x={46} y={120} color={C.purple} />
          <circle cx={282} cy={170} r={4} fill={C.cyan} stroke="none" className="abx-art-twinkle" />
        </>
      );
    }

    /* growth, celebrated: dashed arcs and confetti */
    case "arc": {
      const arcs: [number, string, string][] = [
        [128, C.pink, "60 14 8 14"], [108, C.cyan, "34 12"], [88, C.amber, "8 10"], [68, C.indigo, "46 16"], [48, C.purple, "2 9"],
      ];
      const dots: [number, number, number, string][] = [
        [96, 120, 4, C.pink], [206, 116, 5, C.cyan], [150, 72, 3.5, C.amber], [62, 196, 4, C.indigo], [240, 186, 3.5, C.purple],
        [122, 158, 3, C.cyan], [182, 152, 3, C.pink], [270, 222, 4, C.amber], [32, 226, 3, C.cyan],
      ];
      return (
        <>
          {arcs.map(([r, c, dash], i) => (
            <path
              key={i}
              className="abx-art-flow"
              style={{ "--d": `${-i * 1.7}s` } as React.CSSProperties}
              stroke={c}
              strokeWidth={i === 0 ? 7 : 4}
              strokeDasharray={dash}
              d={`M${150 - r} 236A${r} ${r} 0 0 1 ${150 + r} 236`}
            />
          ))}
          {dots.map(([x, y, r, c], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={c} stroke="none" className="abx-art-twinkle" style={{ "--d": `${-i * 0.7}s` } as React.CSSProperties} />
          ))}
          <path d="M136 274q7-8 14 0t14 0 14 0" stroke={C.purple} />
          <path d="M60 270l8 14h-16z" stroke={C.amber} />
          <circle cx={244} cy={276} r={7} stroke={C.cyan} />
          <Spark x={150} y={30} color={C.pink} />
        </>
      );
    }

    /* separate pieces, connected */
    case "blocks":
      return (
        <>
          <path className="abx-art-flow" stroke={C.ink} strokeDasharray="3 8" d="M110 98L150 122M190 98L150 122M150 150V196M96 232L150 262M204 232L150 262" />
          <g className="abx-art-float" style={{ "--d": "0s" } as React.CSSProperties}>
            <Cube cx={84} cy={66} color={C.cyan} />
          </g>
          <g className="abx-art-float" style={{ "--d": "-2s" } as React.CSSProperties}>
            <Cube cx={216} cy={66} color={C.pink} />
          </g>
          <g className="abx-art-float" style={{ "--d": "-4s" } as React.CSSProperties}>
            <Cube cx={150} cy={140} s={40} color={C.indigo} />
          </g>
          <g className="abx-art-float" style={{ "--d": "-1s" } as React.CSSProperties}>
            <Cube cx={70} cy={214} color={C.amber} />
          </g>
          <g className="abx-art-float" style={{ "--d": "-3s" } as React.CSSProperties}>
            <Cube cx={230} cy={214} color={C.purple} />
          </g>
          <Cube cx={150} cy={276} s={28} color={C.ink} />
          <Spark x={26} y={150} color={C.indigo} />
          <circle cx={276} cy={150} r={4} fill={C.cyan} stroke="none" className="abx-art-twinkle" />
        </>
      );

    /* focused on what comes next */
    case "target":
      return (
        <>
          <circle cx={140} cy={190} r={112} stroke={C.ink} strokeDasharray="2 9" className="abx-art-spin" />
          <circle cx={140} cy={190} r={84} stroke={C.cyan} strokeDasharray="120 30" className="abx-art-spin-rev" />
          <circle cx={140} cy={190} r={56} stroke={C.purple} />
          <circle cx={140} cy={190} r={28} stroke={C.pink} />
          <circle cx={140} cy={190} r={8} fill={C.indigo} stroke="none" className="abx-art-pulse" />
          <g className="abx-art-dart">
            <path stroke={C.amber} strokeWidth={3} d="M146 184L262 68" />
            <path stroke={C.amber} strokeWidth={3} d="M262 68l-4 22M262 68l-22 4M248 82l-4 20M248 82l-20 4" />
          </g>
          <Spark x={40} y={60} color={C.indigo} />
          <circle cx={270} cy={262} r={4} fill={C.pink} stroke="none" className="abx-art-twinkle" />
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
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`abx-art abx-art-${side}${inView ? " is-in" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 300 340" fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id="abx-art-g" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor={C.cyan} />
            <stop offset="0.5" stopColor={C.indigo} />
            <stop offset="1" stopColor={C.pink} />
          </linearGradient>
        </defs>
        <Art kind={kind} />
      </svg>
    </div>
  );
}

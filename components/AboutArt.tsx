"use client";

import React, { useEffect, useRef, useState } from "react";

/*
 * Edge graphics for the empty space beside chosen About sections (wide screens
 * only). Each one grows out of the screen edge: large arcs centred just past
 * the edge, with a small motif suited to the section riding on them.
 * Drawn for the left edge; the right-edge version is mirrored in CSS.
 * Pure decoration: no text, hidden from screen readers.
 */

export type ArtKind = "stack" | "nodes" | "path" | "orbit" | "bars" | "arc" | "blocks" | "target";

const C = { cyan: "#22d3ee", blue: "#3b82f6", indigo: "#6366f1", purple: "#a855f7", pink: "#ec4899", amber: "#f59e0b", ink: "#cbd5e1", line: "#e2e8f0" };

/* every graphic radiates from this point on the screen edge */
const O = { x: 0, y: 320 };
const pt = (r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [O.x + r * Math.cos(a), O.y + r * Math.sin(a)];
};
const arc = (r: number, from = -90, to = 90) => {
  const [x1, y1] = pt(r, from);
  const [x2, y2] = pt(r, to);
  return `M${x1} ${y1}A${r} ${r} 0 0 1 ${x2} ${y2}`;
};
const v = (o: Record<string, string | number>) => o as React.CSSProperties;

/* the shared frame: arcs coming out of the edge, a light streak and moving dots */
function Frame({ accent, accent2 }: { accent: string; accent2: string }) {
  return (
    <>
      <path d={arc(296)} stroke={C.ink} strokeDasharray="6 11" className="abx-art-flow" />
      <path d={arc(232)} stroke="url(#abx-art-g)" strokeOpacity={0.55} />
      <path d={arc(168)} stroke={C.line} strokeDasharray="1 7" />
      <path d={arc(104)} stroke={C.line} />
      <path className="abx-art-draw" d="M0 92C120 140 230 250 262 420S214 600 120 640" stroke="url(#abx-art-streak)" strokeWidth={1.6} />
      <g className="abx-art-orbit" style={v({ "--t": "38s" })}>
        <circle cx={pt(296, 0)[0]} cy={pt(296, 0)[1]} r={4} fill={accent} stroke="none" />
        <circle cx={pt(296, 0)[0]} cy={pt(296, 0)[1]} r={10} fill={accent} stroke="none" opacity={0.18} />
      </g>
      <g className="abx-art-orbit" style={v({ "--t": "52s", "--s": "140deg" })}>
        <circle cx={pt(232, 0)[0]} cy={pt(232, 0)[1]} r={3.5} fill={accent2} stroke="none" />
      </g>
    </>
  );
}

/* isometric slab outline centred on (cx, cy) */
function Slab({ cx, cy, w, color }: { cx: number; cy: number; w: number; color: string }) {
  const h = w * 0.58, t = w * 0.16;
  return (
    <g stroke={color}>
      <path d={`M${cx - w} ${cy}L${cx} ${cy - h}L${cx + w} ${cy}L${cx} ${cy + h}Z`} />
      <path d={`M${cx - w} ${cy}V${cy + t}L${cx} ${cy + h + t}L${cx + w} ${cy + t}V${cy}M${cx} ${cy + h}V${cy + h + t}`} />
    </g>
  );
}

/* isometric cube outline, top face centred on (cx, cy) */
function Cube({ cx, cy, s, color }: { cx: number; cy: number; s: number; color: string }) {
  const h = s * 0.58;
  return (
    <g stroke={color}>
      <path d={`M${cx - s} ${cy}L${cx} ${cy - h}L${cx + s} ${cy}L${cx} ${cy + h}Z`} />
      <path d={`M${cx - s} ${cy}V${cy + s}L${cx} ${cy + h + s}L${cx + s} ${cy + s}V${cy}M${cx} ${cy + h}V${cy + h + s}`} />
    </g>
  );
}

function Node({ x, y, color, big }: { x: number; y: number; color: string; big?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={big ? 11 : 7} stroke={color} fill="#fff" />
      <circle cx={x} cy={y} r={big ? 4 : 2.6} fill={color} stroke="none" />
    </g>
  );
}

function Motif({ kind }: { kind: ArtKind }) {
  switch (kind) {
    /* three capabilities, layered into one */
    case "stack":
      return (
        <g transform="translate(176 250)">
          {([[0, C.amber, "0s"], [42, C.cyan, "-2.4s"], [84, C.pink, "-4.8s"]] as [number, string, string][]).map(([dy, c, d], i) => (
            <g key={i} className="abx-art-float" style={v({ "--d": d })}>
              <Slab cx={0} cy={dy} w={62} color={c} />
            </g>
          ))}
          <Slab cx={0} cy={126} w={62} color={C.ink} />
        </g>
      );

    /* AI: a network spreading out from the edge */
    case "nodes": {
      const ns: [number, number, string, boolean?][] = [
        [pt(104, -30)[0], pt(104, -30)[1], C.cyan], [pt(168, 10)[0], pt(168, 10)[1], C.indigo, true],
        [pt(232, -36)[0], pt(232, -36)[1], C.pink], [pt(232, 30)[0], pt(232, 30)[1], C.purple],
        [pt(296, -8)[0], pt(296, -8)[1], C.cyan], [pt(168, 52)[0], pt(168, 52)[1], C.amber], [pt(104, 34)[0], pt(104, 34)[1], C.indigo],
      ];
      const links = [[0, 1], [1, 2], [1, 3], [1, 4], [3, 5], [5, 6], [0, 6], [2, 4], [3, 4]];
      return (
        <>
          {links.map(([a, b], i) => (
            <line key={i} className="abx-art-draw" x1={ns[a][0]} y1={ns[a][1]} x2={ns[b][0]} y2={ns[b][1]} stroke={C.ink} />
          ))}
          {ns.map(([x, y, c, big], i) => (
            <g key={i} className="abx-art-pulse-soft" style={v({ "--d": `${-i * 0.7}s` })}>
              <Node x={x} y={y} color={c} big={big} />
            </g>
          ))}
        </>
      );
    }

    /* the route: five steps climbing along the arc */
    case "path": {
      const steps: [number, string][] = [[62, C.cyan], [34, C.blue], [6, C.indigo], [-22, C.purple], [-50, C.pink]];
      return (
        <>
          <path className="abx-art-draw" d={arc(232, 62, -50).replace("0 0 1", "0 0 0")} stroke="url(#abx-art-g)" strokeWidth={3} />
          {steps.map(([deg, c], i) => {
            const [x, y] = pt(232, deg);
            return (
              <g key={i} className="abx-art-float" style={v({ "--d": `${-i * 1.1}s` })}>
                <Node x={x} y={y} color={c} big={i === steps.length - 1} />
              </g>
            );
          })}
          <path d={`M${pt(232, -50)[0]} ${pt(232, -50)[1] - 12}v-26l20 8-20 8`} stroke={C.pink} />
        </>
      );
    }

    /* one core with capabilities in orbit */
    case "orbit":
      return (
        <g transform="translate(196 320)">
          <ellipse rx={78} ry={30} stroke={C.ink} strokeDasharray="3 7" transform="rotate(-28)" />
          <ellipse rx={78} ry={30} stroke={C.ink} strokeDasharray="3 7" transform="rotate(28)" />
          <circle r={22} stroke="url(#abx-art-g)" strokeWidth={2.6} />
          <circle r={7} fill={C.indigo} stroke="none" className="abx-art-pulse" />
          {([[C.cyan, "18s", "0deg"], [C.pink, "24s", "120deg"], [C.amber, "30s", "240deg"]] as [string, string, string][]).map(([c, t, s0], i) => (
            <g key={i} className="abx-art-orbit-local" style={v({ "--t": t, "--s": s0 })}>
              <Node x={58} y={0} color={c} />
            </g>
          ))}
        </g>
      );

    /* results that keep climbing */
    case "bars": {
      const bars: [number, number, string][] = [[132, 54, C.cyan], [176, 92, C.indigo], [220, 132, C.purple], [264, 178, C.pink]];
      return (
        <>
          <path d="M100 470H300" stroke={C.ink} />
          {bars.map(([x, hgt, c], i) => (
            <g key={i} className="abx-art-rise" style={v({ "--d": `${i * 0.15}s` })}>
              <path
                stroke={c}
                d={`M${x - 16} 470V${470 - hgt}L${x} ${461 - hgt}L${x + 16} ${470 - hgt}V470M${x - 16} ${470 - hgt}L${x} ${479 - hgt}L${x + 16} ${470 - hgt}M${x} ${479 - hgt}V470`}
              />
            </g>
          ))}
          <path className="abx-art-draw" stroke={C.amber} strokeWidth={2.6} d="M110 400L160 362L200 376L276 262M254 262H278V286" />
        </>
      );
    }

    /* growth, measured: progress on the arcs themselves */
    case "arc":
      return (
        <>
          {([[296, C.cyan, -90, 20], [232, C.indigo, -90, 0], [168, C.purple, -90, -24], [104, C.pink, -90, -40]] as [number, string, number, number][]).map(([r, c, a0, a1], i) => (
            <path key={i} className="abx-art-draw" style={v({ transitionDelay: `${0.2 + i * 0.15}s` })} d={arc(r, a0, a1)} stroke={c} strokeWidth={4} />
          ))}
          {[296, 232, 168, 104].map((r, i) => {
            const end = [20, 0, -24, -40][i];
            const [x, y] = pt(r, end);
            return <circle key={r} cx={x} cy={y} r={5} fill="#fff" stroke={[C.cyan, C.indigo, C.purple, C.pink][i]} strokeWidth={2.4} />;
          })}
        </>
      );

    /* separate pieces, connected */
    case "blocks": {
      const cs: [number, number, number, string, string][] = [
        [118, 196, 26, C.cyan, "0s"], [214, 254, 30, C.indigo, "-2s"], [130, 340, 26, C.pink, "-4s"], [236, 410, 26, C.purple, "-1s"],
      ];
      return (
        <>
          <path className="abx-art-flow" stroke={C.ink} strokeDasharray="3 8" d="M138 224L192 250M196 296L150 330M156 372L214 406" />
          {cs.map(([x, y, s0, c, d], i) => (
            <g key={i} className="abx-art-float" style={v({ "--d": d })}>
              <Cube cx={x} cy={y} s={s0} color={c} />
            </g>
          ))}
        </>
      );
    }

    /* focused on what comes next */
    case "target":
      return (
        <g transform="translate(196 340)">
          <circle r={66} stroke={C.cyan} strokeDasharray="90 24" className="abx-art-spin" />
          <circle r={44} stroke={C.purple} />
          <circle r={22} stroke={C.pink} />
          <circle r={6} fill={C.indigo} stroke="none" className="abx-art-pulse" />
          <g className="abx-art-dart">
            <path stroke={C.amber} strokeWidth={2.6} d="M4 -4L92 -92M92 -92l-3 18M92 -92l-18 3M80 -80l-3 16M80 -80l-16 3" />
          </g>
        </g>
      );
  }
}

const FRAME_ACCENTS: Record<ArtKind, [string, string]> = {
  stack: [C.cyan, C.pink],
  nodes: [C.indigo, C.cyan],
  path: [C.pink, C.indigo],
  orbit: [C.amber, C.cyan],
  bars: [C.purple, C.amber],
  arc: [C.pink, C.cyan],
  blocks: [C.cyan, C.purple],
  target: [C.indigo, C.pink],
};

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

  const [a1, a2] = FRAME_ACCENTS[kind];
  return (
    <div ref={ref} className={`abx-art abx-art-${side}${inView ? " is-in" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 320 640" preserveAspectRatio="xMinYMid slice" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id="abx-art-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.cyan} />
            <stop offset="0.5" stopColor={C.indigo} />
            <stop offset="1" stopColor={C.pink} />
          </linearGradient>
          <linearGradient id="abx-art-streak" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={C.pink} stopOpacity="0" />
            <stop offset="0.45" stopColor={C.pink} stopOpacity="0.7" />
            <stop offset="1" stopColor={C.indigo} stopOpacity="0" />
          </linearGradient>
        </defs>
        <Frame accent={a1} accent2={a2} />
        <g className="abx-art-motif">
          <Motif kind={kind} />
        </g>
      </svg>
    </div>
  );
}

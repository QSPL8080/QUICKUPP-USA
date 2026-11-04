"use client";

import { useEffect, useRef } from "react";
import HomeIcon, { type HomeIconName } from "@/components/home/HomeIcon";

/*
 * Home hero visual: a live "growth network". Marketing, AI and Technology are
 * three hubs; light pulses run from each hub into a core marked "Built for
 * Growth", which sends out rings. A field of small nodes drifts behind and
 * moves away from the pointer. Canvas, drawn only while on screen; a still
 * frame for reduced motion. The four labels are the hero eyebrow words.
 */

type Hub = { x: number; y: number; label: string; icon: HomeIconName; color: string };

const HUBS: Hub[] = [
  { x: 0.25, y: 0.24, label: "MARKETING.", icon: "megaphone", color: "#00c2f0" },
  { x: 0.82, y: 0.3, label: "AI.", icon: "bot", color: "#8b5cf6" },
  { x: 0.36, y: 0.85, label: "TECHNOLOGY.", icon: "code-xml", color: "#6366f1" },
];
const CORE = { x: 0.56, y: 0.55 };

export default function HeroNetwork({ coreLabel }: { coreLabel: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    const pointer = { x: -9999, y: -9999 };

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let parts: P[] = [];

    const resize = () => {
      const r = box.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, Math.max(28, (w * h) / 5200)));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1 + Math.random() * 1.6,
      }));
    };

    // the curve from a hub into the core bends a little outward
    const ctrl = (hb: Hub) => {
      const hx = hb.x * w;
      const hy = hb.y * h;
      const cx = CORE.x * w;
      const cy = CORE.y * h;
      const mx = (hx + cx) / 2;
      const my = (hy + cy) / 2;
      const nx = -(cy - hy);
      const ny = cx - hx;
      const len = Math.hypot(nx, ny) || 1;
      return { hx, hy, cx, cy, qx: mx + (nx / len) * 40, qy: my + (ny / len) * 40 };
    };
    const at = (c: ReturnType<typeof ctrl>, t: number) => {
      const u = 1 - t;
      return { x: u * u * c.hx + 2 * u * t * c.qx + t * t * c.cx, y: u * u * c.hy + 2 * u * t * c.qy + t * t * c.cy };
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);

      // drifting field
      for (const p of parts) {
        if (!reduce) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120) {
            const f = (1 - Math.sqrt(d2) / 120) * 0.9;
            p.vx += (dx / (Math.sqrt(d2) || 1)) * f * 0.12;
            p.vy += (dy / (Math.sqrt(d2) || 1)) * f * 0.12;
          }
          p.vx *= 0.985;
          p.vy *= 0.985;
          if (Math.abs(p.vx) < 0.05) p.vx += (Math.random() - 0.5) * 0.04;
          if (Math.abs(p.vy) < 0.05) p.vy += (Math.random() - 0.5) * 0.04;
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10;
          if (p.y > h + 10) p.y = -10;
        }
      }
      for (let i = 0; i < parts.length; i++) {
        const a = parts[i];
        for (let j = i + 1; j < parts.length; j++) {
          const b = parts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 96) {
            ctx.strokeStyle = `rgba(99,102,241,${(1 - d / 96) * 0.16})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const p of parts) {
        ctx.fillStyle = "rgba(99,102,241,0.38)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // hub → core links with travelling pulses
      HUBS.forEach((hb, k) => {
        const c = ctrl(hb);
        const grad = ctx.createLinearGradient(c.hx, c.hy, c.cx, c.cy);
        grad.addColorStop(0, hb.color);
        grad.addColorStop(1, "rgba(99,102,241,0.25)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.setLineDash([5, 7]);
        ctx.lineDashOffset = reduce ? 0 : -time * 0.03;
        ctx.beginPath();
        ctx.moveTo(c.hx, c.hy);
        ctx.quadraticCurveTo(c.qx, c.qy, c.cx, c.cy);
        ctx.stroke();
        ctx.setLineDash([]);

        for (let n = 0; n < 2; n++) {
          const t = reduce ? 0.5 : ((time / 2600 + k * 0.33 + n * 0.5) % 1);
          const pt = at(c, t);
          const glow = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 12);
          glow.addColorStop(0, hb.color);
          glow.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // core rings
      const cx = CORE.x * w;
      const cy = CORE.y * h;
      for (let n = 0; n < 3; n++) {
        const t = reduce ? 0.3 + n * 0.25 : ((time / 2400 + n / 3) % 1);
        const r = 40 + t * Math.min(w, h) * 0.36;
        ctx.strokeStyle = `rgba(99,102,241,${(1 - t) * 0.35})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const loop = (t: number) => {
      draw(t);
      if (running) raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    draw(0);

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.05 })
        : null;
    if (io) io.observe(box);
    else start();

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => {
      resize();
      if (!running) draw(0);
    }) : null;
    ro?.observe(box);

    const move = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const leave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    box.addEventListener("pointermove", move);
    box.addEventListener("pointerleave", leave);
    const onVis = () => (document.hidden ? stop() : io ? null : start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      io?.disconnect();
      ro?.disconnect();
      box.removeEventListener("pointermove", move);
      box.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={boxRef} className="hx-net" aria-hidden="true">
      <canvas ref={canvasRef} className="hx-net-canvas" />
      {HUBS.map((hb, i) => (
        <span
          key={hb.label}
          className="hx-net-hub"
          style={{ left: `${hb.x * 100}%`, top: `${hb.y * 100}%`, ["--hub" as string]: hb.color, ["--d" as string]: `${0.4 + i * 0.15}s` }}
        >
          <span className="hx-net-hub-icon">
            <HomeIcon name={hb.icon} size={20} />
          </span>
          <span className="hx-net-hub-label">{hb.label}</span>
        </span>
      ))}
      <span className="hx-net-core" style={{ left: `${CORE.x * 100}%`, top: `${CORE.y * 100}%` }}>
        <span className="hx-net-core-orb">
          <HomeIcon name="trending-up" size={30} strokeWidth={2.2} />
        </span>
        <span className="hx-net-core-label">{coreLabel}</span>
      </span>
    </div>
  );
}

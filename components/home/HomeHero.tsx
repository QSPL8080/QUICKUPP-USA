"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import HomeIcon from "@/components/home/HomeIcon";

/*
 * Home hero ("hxd-", used on no other page): a growth dial.
 * The four eyebrow words each own a photo. A large round photo sits inside a
 * dial; every few seconds the next photo is swept in clockwise like a clock
 * hand, the progress arc around it fills, and the matching eyebrow word lights
 * up on the left. The eyebrow words also run around the dial's edge, slowly
 * turning. Hovering or focusing a word (or the dial) holds it there.
 * Every word comes from the home page document.
 */

type Hero = {
  eyebrow: string[];
  title: string[];
  text: string;
  supporting: string[];
};

const PHOTOS = [
  "/images/counter-style-three-img-03.jpg", // MARKETING.
  "/images/contact-tech-discussion.jpg", // AI.
  "/images/contact-team-collaboration.jpg", // TECHNOLOGY.
  "/images/contact-diverse-meeting.jpg", // BUILT FOR GROWTH.
];

const STEP_MS = 4200;
const TICKS = 72;
const ARC_R = 204;
const ARC_C = 2 * Math.PI * ARC_R;
const RING_R = 232;
const RING_C = 2 * Math.PI * RING_R;

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

export default function HomeHero({ hero, actions }: { hero: Hero; actions: ReactNode }) {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [held, setHeld] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [motion, setMotion] = useState(true);
  const boxRef = useRef<HTMLElement>(null);
  const count = Math.min(hero.eyebrow.length, PHOTOS.length);

  useEffect(() => {
    setMotion(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = boxRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const activeRef = useRef(0);
  const go = (i: number) => {
    const cur = activeRef.current;
    if (cur === i) return;
    activeRef.current = i;
    setPrev(cur);
    setActive(i);
  };

  useEffect(() => {
    if (!motion || held || !onScreen) return;
    const t = window.setTimeout(() => go((active + 1) % count), STEP_MS);
    return () => window.clearTimeout(t);
  }, [active, held, onScreen, motion, count]);

  const running = motion && !held && onScreen;
  const ringOnce = hero.eyebrow.join("  ·  ");
  const ringText = `${ringOnce}  ·  ${ringOnce}  ·`;

  return (
    <section ref={boxRef} className={`hxd-hero${running ? " is-running" : ""}`}>
      <div className="hxd-back" aria-hidden="true">
        <span className="hxd-wash" />
        <span className="hxd-orbit hxd-orbit-1" />
        <span className="hxd-orbit hxd-orbit-2" />
        <span className="hxd-orbit hxd-orbit-3" />
      </div>

      <div className="hx-wrap hxd-grid">
        <div className="hxd-copy">
          <p className="hxd-eyebrow" onMouseLeave={() => setHeld(false)}>
            {hero.eyebrow.slice(0, count).map((w, i) => (
              <button
                key={w}
                type="button"
                className={`hxd-word${i === active ? " is-on" : ""}`}
                style={d(0.15 + i * 0.08)}
                aria-pressed={i === active}
                onMouseEnter={() => {
                  setHeld(true);
                  go(i);
                }}
                onFocus={() => {
                  setHeld(true);
                  go(i);
                }}
                onBlur={() => setHeld(false)}
                onClick={() => go(i)}
              >
                <span className="hxd-word-text">{w}</span>
                <span className="hxd-word-bar" aria-hidden="true">
                  <span key={`${active}-${running}`} className="hxd-word-fill" style={{ animationDuration: `${STEP_MS}ms` }} />
                </span>
              </button>
            ))}
          </p>

          <h1 className="hxd-title">
            {hero.title.map((l, i) => (
              <span key={l} className="hxd-line" style={d(0.3 + i * 0.13)}>
                <span className={i === hero.title.length - 1 ? "hxd-line-in qs-gradient-text" : "hxd-line-in"}>{l}</span>
              </span>
            ))}
          </h1>

          <p className="hxd-text" style={d(0.72)}>
            {hero.text}
          </p>

          <div className="hx-actions hxd-actions" style={d(0.86)}>
            {actions}
          </div>

          <ul className="hxd-support">
            {hero.supporting.map((s, i) => (
              <li key={s} style={d(1 + i * 0.1)}>
                <span className="hxd-support-mark" aria-hidden="true">
                  <HomeIcon name="check" size={12} strokeWidth={3} />
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="hxd-art"
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          aria-hidden="true"
        >
          <div className="hxd-dial">
            <svg className="hxd-svg" viewBox="0 0 500 500">
              <defs>
                <linearGradient id="hxd-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00d2ff" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <path id="hxd-ring" d={`M 250 250 m -${RING_R} 0 a ${RING_R} ${RING_R} 0 1 1 ${RING_R * 2} 0 a ${RING_R} ${RING_R} 0 1 1 -${RING_R * 2} 0`} />
              </defs>

              <g className="hxd-ticks">
                {Array.from({ length: TICKS }, (_, i) => {
                  const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
                  const major = i % 6 === 0;
                  const r1 = major ? 210 : 213;
                  const r2 = 219;
                  return (
                    <line
                      key={i}
                      x1={250 + Math.cos(a) * r1}
                      y1={250 + Math.sin(a) * r1}
                      x2={250 + Math.cos(a) * r2}
                      y2={250 + Math.sin(a) * r2}
                      className={major ? "is-major" : undefined}
                      style={{ "--i": i } as CSSProperties}
                    />
                  );
                })}
              </g>

              <circle className="hxd-track" cx="250" cy="250" r={ARC_R} />
              <circle
                key={`${active}-${running}`}
                className="hxd-arc"
                cx="250"
                cy="250"
                r={ARC_R}
                style={{ strokeDasharray: ARC_C, "--c": ARC_C, animationDuration: `${STEP_MS}ms` } as CSSProperties}
              />

              <g className="hxd-ring">
                <text className="hxd-ring-text">
                  <textPath href="#hxd-ring" textLength={RING_C - 12} lengthAdjust="spacing">
                    {ringText}
                  </textPath>
                </text>
              </g>
            </svg>

            <div className="hxd-disc">
              {PHOTOS.slice(0, count).map((src, i) => (
                <div
                  key={src}
                  className={`hxd-photo${i === active ? " is-active" : ""}${i === prev && i !== active ? " is-prev" : ""}`}
                >
                  <img src={src} alt="" loading={i === 0 ? "eager" : "lazy"} />
                </div>
              ))}
              {motion && <span key={`hand-${active}`} className="hxd-hand" />}
              <span className="hxd-disc-shine" />
            </div>

            <span className="hxd-chip">
              <span className="hxd-chip-dot" />
              <span key={active} className="hxd-chip-text">
                {hero.eyebrow[active]}
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

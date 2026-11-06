"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import HomeIcon, { type HomeIconName } from "@/components/home/HomeIcon";

/*
 * Home hero ("hxd-", used on no other page): a dark stage with the copy on
 * the left and a photo filling the right side to the stage's edge (the IT
 * service pages' hero layout), and a white pillar dock lying across the
 * stage's lower edge. The photo slowly drifts and zooms; its label shows the
 * eyebrow word whose pillar is open. The four pillars take turns every 5
 * seconds; hovering or focusing a pillar opens it and holds it, and hovering
 * the photo holds it too.
 * Every word comes from the home page document.
 */

type Hero = {
  eyebrow: string[];
  title: string[];
  text: string;
  supporting: string[];
};

const UNSPLASH = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

// the hero's one photo: a product team building at their screens in a bright
// studio (technology and delivery), facing toward the words on the left
const HERO_PHOTO = UNSPLASH("photo-1551434678-e076c223a692");

const PILLARS: { photo: string; icon: HomeIconName }[] = [
  { photo: UNSPLASH("photo-1686061592689-312bbfb5c055"), icon: "megaphone" }, // MARKETING. (analytics dashboard)
  { photo: UNSPLASH("photo-1680783954745-3249be59e527"), icon: "bot" }, // AI. (robot and human hands)
  { photo: UNSPLASH("photo-1498050108023-c5249f4df085"), icon: "code-xml" }, // TECHNOLOGY. (code on a laptop)
  { photo: UNSPLASH("photo-1758691737124-05c5bffe46f0"), icon: "trending-up" }, // BUILT FOR GROWTH. (team around a laptop)
];

const STEP_MS = 5000; // the next pillar every 5 seconds

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

export default function HomeHero({ hero, actions }: { hero: Hero; actions: ReactNode }) {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [motion, setMotion] = useState(true);
  const boxRef = useRef<HTMLElement>(null);
  const activeRef = useRef(0);
  const count = Math.min(hero.eyebrow.length, PILLARS.length);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads a browser-only setting after mount
    setMotion(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = boxRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = (i: number) => {
    const cur = activeRef.current;
    if (cur === i) return;
    activeRef.current = i;
    setActive(i);
  };

  useEffect(() => {
    if (!motion || held || !onScreen) return;
    const t = window.setTimeout(() => go((activeRef.current + 1) % count), STEP_MS);
    return () => window.clearTimeout(t);
  }, [active, held, onScreen, motion, count]);

  const running = motion && !held && onScreen;

  return (
    <section ref={boxRef} className={`hxd-hero${running ? " is-running" : ""}`}>
      <div className="hxd-stage">
        <div className="hxd-back" aria-hidden="true">
          <span className="hxd-glow hxd-glow-a" />
          <span className="hxd-glow hxd-glow-b" />
          <span className="hxd-dots" />
          <span className="hxd-orbit hxd-orbit-1" />
          <span className="hxd-orbit hxd-orbit-2" />
          <span className="hxd-orbit hxd-orbit-3" />
        </div>

        <div className="hxd-wrap hxd-grid">
          <div className="hxd-copy">
            <h1 className="hxd-title">
              <span className="sr-only">IT &amp; Digital Marketing Services for Growing Businesses | </span>
              {hero.title.map((l, i) => (
                <span key={l} className="hxd-line" style={d(0.2 + i * 0.13)}>
                  <span className={i === hero.title.length - 1 ? "hxd-line-in qs-gradient-text" : "hxd-line-in"}>{l}</span>
                </span>
              ))}
            </h1>

            <p className="hxd-text" style={d(0.62)}>
              {hero.text}
            </p>

            <div className="hx-actions hxd-actions" style={d(0.76)}>
              {actions}
            </div>

            <ul className="hxd-support">
              {hero.supporting.map((s, i) => (
                <li key={s} style={d(0.9 + i * 0.1)}>
                  <span className="hxd-support-mark" aria-hidden="true">
                    <HomeIcon name="check" size={12} strokeWidth={3} />
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hxd-art" aria-hidden="true" />
        </div>

        {/* the photo filling the right side to the stage's edge */}
        <div className="hxd-edge" onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)} aria-hidden="true">
          <div className="hxd-shot is-active is-solo">
            <img src={HERO_PHOTO} alt="" loading="eager" />
          </div>
          <span className="hxd-edge-fade" />
          <span className="hxd-edge-grid" />
          <span className="hxd-chip">
            <span className="hxd-chip-dot" />
            <span key={active} className="hxd-chip-text">
              {hero.eyebrow[active]}
            </span>
          </span>
        </div>
      </div>

      {/* the four pillars, lying across the stage's lower edge */}
      <div className="hxd-wrap">
        <div className="hxd-dock" onMouseLeave={() => setHeld(false)}>
          {hero.eyebrow.slice(0, count).map((w, i) => (
            <button
              key={w}
              type="button"
              className={`hxd-pillar${i === active ? " is-on" : ""}`}
              style={d(0.5 + i * 0.08)}
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
              <span className="hxd-pillar-photo" aria-hidden="true">
                <img src={PILLARS[i].photo} alt="" loading="lazy" />
              </span>
              <span className="hxd-pillar-top">
                <span className="hxd-pillar-icon" aria-hidden="true">
                  <HomeIcon name={PILLARS[i].icon} size={20} />
                </span>
                <span className="hxd-pillar-go" aria-hidden="true">
                  <HomeIcon name="arrow-up-right" size={16} strokeWidth={2.2} />
                </span>
              </span>
              <span className="hxd-pillar-word">{w}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

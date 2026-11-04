"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { HomeService } from "@/data/home-content";
import HomeIcon from "@/components/home/HomeIcon";

/*
 * Our Services: the six services as a list on the left and one open service
 * on the right. It moves on by itself every few seconds until someone picks a
 * service; on phones the list becomes a row of tabs above the panel.
 */
const STEP_MS = 7000;

export default function ServiceExplorer({ items }: { items: HomeService[] }) {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // only run the timer while the section is on screen
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!auto || paused || !visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % items.length), STEP_MS);
    return () => window.clearTimeout(t);
  }, [active, auto, paused, visible, items.length]);

  // keep the chosen tab in view on phones
  useEffect(() => {
    const tab = tabsRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`);
    const bar = tabsRef.current;
    if (tab && bar && bar.scrollWidth > bar.clientWidth) {
      bar.scrollTo({ left: tab.offsetLeft - bar.clientWidth / 2 + tab.clientWidth / 2, behavior: "smooth" });
    }
  }, [active]);

  const pick = (i: number) => {
    setActive(i);
    setAuto(false);
  };

  const s = items[active];

  return (
    <div
      ref={boxRef}
      className={`hx-svc-box${auto && !paused && visible ? " is-auto" : ""}`}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div ref={tabsRef} className="hx-svc-list" role="tablist" aria-label="Our services">
        {items.map((it, i) => (
          <button
            key={it.num}
            type="button"
            role="tab"
            id={`hx-svc-tab-${i}`}
            aria-selected={i === active}
            aria-controls="hx-svc-panel"
            data-i={i}
            className={`hx-svc-tab${i === active ? " is-active" : ""}`}
            onClick={() => pick(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                e.preventDefault();
                pick((i + 1) % items.length);
                tabsRef.current?.querySelector<HTMLElement>(`[data-i="${(i + 1) % items.length}"]`)?.focus();
              } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                e.preventDefault();
                const n = (i - 1 + items.length) % items.length;
                pick(n);
                tabsRef.current?.querySelector<HTMLElement>(`[data-i="${n}"]`)?.focus();
              }
            }}
          >
            <span className="hx-svc-tab-num">{it.num}.</span>
            <span className="hx-svc-tab-title">{it.title}</span>
            <span className="hx-svc-tab-bar" aria-hidden="true">
              <span key={`${active}-${auto}`} className="hx-svc-tab-fill" style={{ animationDuration: `${STEP_MS}ms` }} />
            </span>
          </button>
        ))}
      </div>

      <div id="hx-svc-panel" role="tabpanel" aria-labelledby={`hx-svc-tab-${active}`} className="hx-svc-panel">
        <div key={s.num} className="hx-svc-panel-in">
          <figure className="hx-svc-media">
            <img src={s.img} alt="" />
            <span className="hx-svc-media-icon" aria-hidden="true">
              <HomeIcon name={s.icon} size={22} />
            </span>
            <span className="hx-svc-media-num" aria-hidden="true">
              {s.num}
            </span>
          </figure>
          <div className="hx-svc-copy">
            <h3 className="hx-svc-title">
              <span className="hx-svc-title-num">{s.num}.</span> {s.title}
            </h3>
            <p className="hx-svc-text">{s.text}</p>
            <ul className="hx-svc-points">
              {s.points.map((pt, i) => (
                <li key={pt} style={{ animationDelay: `${0.12 + i * 0.07}s` }}>
                  <HomeIcon name="check" size={15} strokeWidth={2.6} className="hx-svc-check" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
            {s.cta.external ? (
              <a href={s.cta.href} target="_blank" rel="noopener noreferrer" className="hx-link">
                <span>{s.cta.label}</span>
                <HomeIcon name="arrow-up-right" size={16} strokeWidth={2.2} />
              </a>
            ) : (
              <Link href={s.cta.href} className="hx-link">
                <span>{s.cta.label}</span>
                <HomeIcon name="arrow-right" size={16} strokeWidth={2.2} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

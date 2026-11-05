"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import type { HomeService } from "@/data/home-content";
import HomeIcon from "@/components/home/HomeIcon";

/*
 * Our Services: the six services as a list on the left and one open service
 * on the right. The box stays pinned while the page scrolls past it and the
 * open service follows the scroll (one service per stretch of scrolling).
 * Picking a service scrolls the page to it. All six panels are stacked in one
 * grid cell, so the panel is always as tall as the longest service and every
 * point stays visible. When the box can't fit on the screen (small phones) it
 * stops pinning and the list works as plain tabs.
 */
const NAV_SPACE = 100; // room left for the floating site header
const STEP_VH = 0.55; // scroll distance per service, as a share of the screen height

type Mode = "pin" | "pin-compact" | "static";

export default function ServiceExplorer({ items }: { items: HomeService[] }) {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<Mode>("pin");
  const [boxH, setBoxH] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<Mode>("pin");
  const lastH = useRef(0);
  const n = items.length;

  // decide whether the box fits on the screen (and how), and remember its height
  const measure = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;
    const room = window.innerHeight - NAV_SPACE - 16;
    const tryMode = (m: Mode) => {
      box.dataset.mode = m;
      return box.offsetHeight;
    };
    let m: Mode = "pin";
    let h = tryMode("pin");
    if (h > room) {
      m = "pin-compact";
      h = tryMode("pin-compact");
    }
    if (h > room) {
      m = "static";
      h = tryMode("static");
    }
    modeRef.current = m;
    lastH.current = h;
    setMode(m);
    setBoxH(h);
  }, []);

  useLayoutEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && boxRef.current) {
      ro = new ResizeObserver(() => {
        // re-check when the box changes size by itself (images, fonts, width)
        const box = boxRef.current;
        if (box && Math.abs(box.offsetHeight - lastH.current) > 2) measure();
      });
      ro.observe(boxRef.current);
    }
    // fonts can change heights once they load
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
    };
  }, [measure]);

  // the open service follows the scroll position
  useEffect(() => {
    if (mode === "static") return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const wrap = wrapRef.current;
      if (!wrap) return;
      const step = window.innerHeight * STEP_VH;
      const top = Math.max(NAV_SPACE, (window.innerHeight - boxH) / 2);
      const passed = top - wrap.getBoundingClientRect().top;
      const i = Math.min(n - 1, Math.max(0, Math.floor((passed + step * 0.5) / step)));
      setActive((cur) => (cur === i ? cur : i));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [mode, boxH, n]);

  // keep the open tab in view when the list is a sideways row (phones)
  useEffect(() => {
    const bar = tabsRef.current;
    const tab = bar?.querySelector<HTMLElement>(`[data-i="${active}"]`);
    if (tab && bar && bar.scrollWidth > bar.clientWidth) {
      bar.scrollTo({ left: tab.offsetLeft - bar.clientWidth / 2 + tab.clientWidth / 2, behavior: "smooth" });
    }
  }, [active]);

  // picking a service: scroll the page to its stretch (or just open it when not pinned)
  const pick = (i: number) => {
    const wrap = wrapRef.current;
    if (modeRef.current === "static" || !wrap) {
      setActive(i);
      return;
    }
    const step = window.innerHeight * STEP_VH;
    const top = Math.max(NAV_SPACE, (window.innerHeight - boxH) / 2);
    const wrapTop = wrap.getBoundingClientRect().top + window.scrollY;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: wrapTop - top + i * step + 2, behavior: smooth ? "smooth" : "auto" });
  };

  const pinned = mode !== "static";
  const stickyTop = `max(${NAV_SPACE}px, calc((100vh - ${boxH}px) / 2))`;

  return (
    <div ref={wrapRef} className={`hx-svc-scroll${pinned ? " is-pinned" : ""}`}>
      <div
        ref={boxRef}
        className="hx-svc-box"
        data-mode={mode}
        style={pinned ? { top: stickyTop } : undefined}
      >
        <div ref={tabsRef} className="hx-svc-list" role="tablist" aria-label="Our services">
          {items.map((it, i) => (
            <button
              key={it.num}
              type="button"
              role="tab"
              id={`hx-svc-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`hx-svc-panel-${i}`}
              data-i={i}
              className={`hx-svc-tab${i === active ? " is-active" : ""}${i < active ? " is-done" : ""}`}
              onClick={() => pick(i)}
              onKeyDown={(e) => {
                const next = e.key === "ArrowDown" || e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowUp" || e.key === "ArrowLeft" ? (i - 1 + n) % n : -1;
                if (next < 0) return;
                e.preventDefault();
                pick(next);
                tabsRef.current?.querySelector<HTMLElement>(`[data-i="${next}"]`)?.focus();
              }}
            >
              <span className="hx-svc-tab-num">{it.num}</span>
              <span className="hx-svc-tab-title">{it.title}</span>
              <span className="hx-svc-tab-icon" aria-hidden="true">
                <HomeIcon name={it.icon} size={17} />
              </span>
            </button>
          ))}
        </div>

        <div className="hx-svc-panel">
          {items.map((s, i) => (
            <div
              key={s.num}
              id={`hx-svc-panel-${i}`}
              role="tabpanel"
              aria-labelledby={`hx-svc-tab-${i}`}
              aria-hidden={i !== active}
              className={`hx-svc-panel-in${i === active ? " is-on" : ""}${i < active ? " is-past" : ""}`}
            >
              <figure className="hx-svc-media">
                <img src={s.img} alt="" loading={i === 0 ? "eager" : "lazy"} />
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
                  {s.points.map((pt, j) => (
                    <li key={pt} style={{ transitionDelay: i === active ? `${0.12 + j * 0.06}s` : "0s" }}>
                      <HomeIcon name="check" size={15} strokeWidth={2.6} className="hx-svc-check" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
                {s.cta.external ? (
                  <a href={s.cta.href} target="_blank" rel="noopener noreferrer" className="hx-link" tabIndex={i === active ? undefined : -1}>
                    <span>{s.cta.label}</span>
                    <HomeIcon name="arrow-up-right" size={16} strokeWidth={2.2} />
                  </a>
                ) : (
                  <Link href={s.cta.href} className="hx-link" tabIndex={i === active ? undefined : -1}>
                    <span>{s.cta.label}</span>
                    <HomeIcon name="arrow-right" size={16} strokeWidth={2.2} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* the scroll distance the pinned box travels through, one stretch per service */}
      {pinned && <div className="hx-svc-runway" style={{ height: `${(n - 1) * STEP_VH * 100}vh` }} aria-hidden="true" />}
    </div>
  );
}

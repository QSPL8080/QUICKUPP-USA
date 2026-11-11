"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import LucideIcon, { type LucideIconName } from "@/components/LucideIcon";
import "@/app/booking.css";

/*
 * "Book a call" section with the live Calendly calendar, in the same
 * app-window frame as the Contact page, used on the service, industry, about
 * and home pages (each page group passes its own heading). The calendar is
 * Calendly itself, so it always shows the times set in Calendly.
 */

const CALENDLY_URL =
  "https://calendly.com/quickuppsoftechmeet/strategy-call?hide_gdpr_banner=1&hide_event_type_details=1&hide_landing_page_details=1&background_color=ffffff&text_color=0b0f17&primary_color=6366f1";

/**
 * After a visitor books, Calendly shows its confirmation inside the embed.
 * 3 seconds later the embed starts again at the calendar (like the forms do).
 * Returns a number to use as the iframe's key: changing it reloads the embed.
 */
export function useCalendlyReset(onReset?: () => void) {
  const [round, setRound] = useState(0);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== "https://calendly.com" || !e.data || e.data.event !== "calendly.event_scheduled") return;

      // Immediately notify CRM backend of scheduled meeting
      if (e.data.payload) {
        fetch("/api/calendly/client-scheduled", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(e.data.payload),
        }).catch(() => {});
      }

      clearTimeout(timer);
      timer = setTimeout(() => {
        onReset?.();
        setRound((r) => r + 1);
      }, 3000);
    };
    window.addEventListener("message", onMessage);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("message", onMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return round;
}

function CalendlyFrame() {
  const [src, setSrc] = useState("");
  const [height, setHeight] = useState<number | null>(null);
  const round = useCalendlyReset(() => setHeight(null));
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // load the calendar only when it is about to come into view
    const el = boxRef.current;
    const load = () => setSrc(`${CALENDLY_URL}&embed_domain=${encodeURIComponent(window.location.host)}&embed_type=Inline`);
    let io: IntersectionObserver | null = null;
    if (el && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            load();
            io?.disconnect();
          }
        },
        { rootMargin: "600px 0px" }
      );
      io.observe(el);
    } else {
      load();
    }
    // Calendly's inline embed reports its content height back to the page
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== "https://calendly.com" || !e.data || e.data.event !== "calendly.page_height") return;
      const h = parseInt(String(e.data.payload?.height), 10);
      if (h >= 400) setHeight(h);
    };
    window.addEventListener("message", onMessage);
    return () => {
      io?.disconnect();
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return (
    <div ref={boxRef} className="su-calendly-scroll bk-cal-scroll" style={height ? ({ "--cal-h": `${height}px` } as CSSProperties) : undefined}>
      <div className="su-calendly-frame">
        {src ? (
          <iframe key={round} src={src} title="Book a Free Consultation with Quickupp Softech" />
        ) : (
          <div className="bk-cal-wait" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
    </div>
  );
}

export type BookingSectionProps = {
  /** small label above the heading */
  eyebrow: string;
  /** heading: the first part in ink, the second in the site gradient */
  title: [string, string];
  text: string[];
  icon?: LucideIconName;
  tone?: "white" | "soft";
  id?: string;
};

export default function BookingSection({ eyebrow, title, text, icon = "calendar", tone = "white", id = "book-a-call" }: BookingSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no observer or reduced motion: show at once
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} className={`bk-section bk-${tone}${inView ? " is-in" : ""}`}>
      <div className="bk-container bk-split">
        <div className="bk-copy">
          <span className="bk-chip">
            <LucideIcon name={icon} size={14} />
            {eyebrow}
          </span>
          <h2 className="bk-h2">
            {title[0]} <span className="qs-gradient-text">{title[1]}</span>
          </h2>
          {text.map((t) => (
            <p key={t} className="bk-text">
              {t}
            </p>
          ))}
        </div>
        <div className="bk-window">
          <div className="bk-window-bar" aria-hidden="true">
            <span />
            <span />
            <span />
            <i />
          </div>
          <div className="bk-window-body">
            <CalendlyFrame />
          </div>
          <p className="bk-window-note">
            <span className="bk-live-dot" aria-hidden="true" />
            <span>Schedule a meeting directly with our team at a time that works for you.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

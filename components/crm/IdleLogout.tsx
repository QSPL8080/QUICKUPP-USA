"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
 * Signs the user out after a period with no mouse, keyboard, touch or scroll
 * activity. Activity is shared between open CRM tabs, a warning with a
 * countdown appears one minute before, and the server keeps its own idle
 * deadline too (so a closed or sleeping computer is signed out as well).
 */

const ACTIVITY_KEY = "qs_crm_last_activity";
const SIGNED_OUT_KEY = "qs_crm_signed_out";
const WARN_MS = 60_000;
const PING_EVERY_MS = 2 * 60_000;
const EVENTS = ["mousemove", "mousedown", "keydown", "wheel", "scroll", "touchstart", "pointerdown"] as const;

const readShared = () => {
  try {
    return Number(localStorage.getItem(ACTIVITY_KEY)) || 0;
  } catch {
    return 0;
  }
};
const writeShared = (key: string, v: number) => {
  try {
    localStorage.setItem(key, String(v));
  } catch {
    /* storage unavailable */
  }
};

export default function IdleLogout({ idleMinutes }: { idleMinutes: number }) {
  const idleMs = idleMinutes * 60_000;
  const last = useRef(0);
  const lastWrite = useRef(0);
  const lastPing = useRef(0);
  const leaving = useRef(false);
  const warningRef = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const signOut = useCallback(async (reason: "idle" | "expired") => {
    if (leaving.current) return;
    leaving.current = true;
    await fetch("/api/crm/logout", { method: "POST" }).catch(() => null);
    writeShared(SIGNED_OUT_KEY, Date.now());
    window.location.replace(`/login?reason=${reason}`);
  }, []);

  const ping = useCallback(async () => {
    lastPing.current = Date.now();
    const res = await fetch("/api/crm/ping", { method: "POST", cache: "no-store" }).catch(() => null);
    if (res?.status === 401) signOut("expired");
  }, [signOut]);

  const markActive = useCallback(
    (force = false) => {
      const now = Date.now();
      last.current = now;
      if (force || now - lastWrite.current > 5_000) {
        lastWrite.current = now;
        writeShared(ACTIVITY_KEY, now);
      }
      if (force || now - lastPing.current > PING_EVERY_MS) ping();
    },
    [ping]
  );

  const staySignedIn = () => {
    warningRef.current = false;
    setSecondsLeft(null);
    markActive(true);
  };

  useEffect(() => {
    const now = Date.now();
    last.current = now;
    lastPing.current = now; // the page load itself just refreshed the session
    writeShared(ACTIVITY_KEY, now);

    // while the warning is open, only its buttons count (a stray mouse move shouldn't)
    const onActivity = () => {
      if (!warningRef.current) markActive();
    };

    const check = () => {
      if (leaving.current) return;
      const idle = Date.now() - Math.max(last.current, readShared());
      if (idle >= idleMs) {
        signOut("idle");
      } else if (idle >= idleMs - WARN_MS) {
        warningRef.current = true;
        setSecondsLeft(Math.ceil((idleMs - idle) / 1000));
      } else if (warningRef.current) {
        // another tab was used meanwhile
        warningRef.current = false;
        setSecondsLeft(null);
      }
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === SIGNED_OUT_KEY && !leaving.current) {
        leaving.current = true;
        window.location.replace("/login");
      }
    };

    EVENTS.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", check);
    window.addEventListener("storage", onStorage);
    const timer = window.setInterval(check, 1000);
    return () => {
      EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("storage", onStorage);
      window.clearInterval(timer);
    };
  }, [idleMs, markActive, signOut]);

  if (secondsLeft === null) return null;

  return (
    <div className="crm-modal-wrap crm-idle-wrap">
      <div className="crm-modal crm-idle" role="alertdialog" aria-modal="true" aria-labelledby="crm-idle-title" aria-describedby="crm-idle-text">
        <span className="crm-idle-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2.5 2.5M9 2h6" />
          </svg>
        </span>
        <h2 id="crm-idle-title" className="crm-drawer-title">
          Still there?
        </h2>
        <p id="crm-idle-text" className="crm-muted">
          You haven&apos;t used the CRM for a while. For security you&apos;ll be signed out in{" "}
          <strong className="crm-idle-count">{secondsLeft}s</strong>.
        </p>
        <div className="crm-idle-actions">
          <button type="button" className="crm-act crm-act-ghost" onClick={() => signOut("idle")}>
            Sign out now
          </button>
          <button type="button" className="crm-act crm-act-dark" onClick={staySignedIn} autoFocus>
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
}

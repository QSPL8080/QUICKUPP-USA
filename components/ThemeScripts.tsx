"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

/*
 * The site's theme scripts need jQuery. It normally loads first (in the page
 * head), but on a "not found" page inside a nested route Next.js builds the
 * head in the browser, so jQuery can arrive after them. These scripts wait
 * until jQuery is there (straight away on every normal page).
 */
export default function ThemeScripts({ srcs }: { srcs: string[] }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const has = () => typeof (window as unknown as { jQuery?: unknown }).jQuery === "function";
    let tick = 0;
    const check = () => {
      if (!has()) return;
      window.clearInterval(tick);
      setReady(true);
    };
    const first = window.setTimeout(check, 0);
    tick = window.setInterval(check, 40);
    const stop = window.setTimeout(() => window.clearInterval(tick), 15000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(tick);
      window.clearTimeout(stop);
    };
  }, []);

  if (!ready) return null;
  return (
    <>
      {srcs.map((src) => (
        <Script key={src} src={src} strategy="afterInteractive" />
      ))}
    </>
  );
}

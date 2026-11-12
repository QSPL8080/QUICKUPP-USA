"use client";

import { useSyncExternalStore } from "react";

/*
 * A date and time shown in the viewer's own time zone ("Nov 10, 2026, 8:13 PM").
 * The server draws the page in its own zone; once the page is running in the
 * browser it is redrawn in the viewer's zone (a plain mismatch would otherwise
 * keep the server's time on screen).
 */
const subscribe = () => () => {};

export default function LocalDateTime({ iso }: { iso: string }) {
  const inBrowser = useSyncExternalStore(subscribe, () => true, () => false);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return <>—</>;
  return (
    <time dateTime={d.toISOString()} suppressHydrationWarning>
      {d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        ...(inBrowser ? {} : { timeZone: "UTC" }),
      })}
    </time>
  );
}

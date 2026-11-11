"use client";

/*
 * A date and time shown in the viewer's own time zone ("Nov 10, 2026, 8:13 PM").
 * Used where a server-rendered page lists payment times.
 */
export default function LocalDateTime({ iso }: { iso: string }) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return <>—</>;
  return (
    <time dateTime={d.toISOString()} suppressHydrationWarning>
      {d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
    </time>
  );
}

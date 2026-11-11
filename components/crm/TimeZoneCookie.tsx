"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/*
 * Tells the server the browser's time zone (crm_tz cookie), so date filters
 * pick whole days on the same clock the tables show. If the page was drawn
 * with a different zone, it is drawn again once.
 */
export default function TimeZoneCookie({ serverZone }: { serverZone: string }) {
  const router = useRouter();
  useEffect(() => {
    let tz = "";
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch {
      return;
    }
    if (!tz) return;
    document.cookie = `crm_tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
    // only lists filtered by date look different in another zone
    if (tz !== serverZone && /[?&](from|to)=/.test(window.location.search)) router.refresh();
  }, [serverZone, router]);
  return null;
}

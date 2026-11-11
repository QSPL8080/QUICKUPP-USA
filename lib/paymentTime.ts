/*
 * The date and time of a payment as customers see it in the confirmation
 * email and the PDF receipt. Shown in US Eastern time, the company's own time
 * zone (Connecticut), so it reads the same whichever server sends it.
 */
const TIME_ZONE = "America/New_York";

export function paymentDateTime(at: Date | string | null | undefined) {
  const d = at ? new Date(at) : new Date();
  const when = Number.isNaN(d.getTime()) ? new Date() : d;
  return {
    /** "November 10, 2026" */
    date: when.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: TIME_ZONE }),
    /** "9:43 AM EST" */
    time: when.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE, timeZoneName: "short" }),
  };
}

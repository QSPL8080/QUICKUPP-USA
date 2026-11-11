/*
 * The website's public address, used in every link a client receives (pay
 * links, balance links, email buttons, WhatsApp messages). It is the live
 * site unless NEXT_PUBLIC_SITE_URL names another public https address, so a
 * link can never point at a test or local copy of the site.
 */
const LIVE = "https://www.quickuppsoftech.us";

export const SITE_URL = (() => {
  const v = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "");
  if (/^https:\/\/[^/]+\.[a-z]{2,}$/i.test(v) && !/localhost|127\.0\.0\.1|\.local$|\.test$/i.test(v)) return v;
  return LIVE;
})();

/** A client's pay link (/pay/<token>) */
export const payLinkUrl = (token: string) => `${SITE_URL}/pay/${token}`;

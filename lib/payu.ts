import "server-only";
import { createHash } from "node:crypto";
import { SITE_URL } from "@/lib/siteUrl";

const PAYU_KEY = (process.env.PAYU_MERCHANT_KEY || process.env.PAYU_KEY || "").trim();
const PAYU_SALT = (process.env.PAYU_MERCHANT_SALT || process.env.PAYU_SALT || "").trim();
const PAYU_MODE = (process.env.PAYU_MODE || "live").trim().toLowerCase();

export const isPayUConfigured = () => Boolean(PAYU_KEY && PAYU_SALT);

export const getPayUActionUrl = () =>
  PAYU_MODE === "test" || PAYU_MODE === "sandbox"
    ? "https://test.payu.in/_payment"
    : "https://secure.payu.in/_payment";

export type PayUParams = {
  txnid: string;
  amount: number | string;
  productinfo: string;
  firstname: string;
  email: string;
  phone?: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
};

/**
 * Generates forward SHA-512 hash for PayU request:
 * key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
 */
export function generatePayUHash(params: PayUParams): {
  hash: string;
  key: string;
  actionUrl: string;
  surl: string;
  furl: string;
} {
  const amt = Number(params.amount).toFixed(2);
  const pinfo = (params.productinfo || "Quickupp Softech Services").replace(/[^a-zA-Z0-9_\- ]/g, "").slice(0, 100);
  const fname = (params.firstname || "Client").trim().slice(0, 60);
  const email = (params.email || "client@quickupp.com").trim().slice(0, 100);
  const u1 = (params.udf1 || "").trim();
  const u2 = (params.udf2 || "").trim();
  const u3 = (params.udf3 || "").trim();
  const u4 = (params.udf4 || "").trim();
  const u5 = (params.udf5 || "").trim();

  const hashString = `${PAYU_KEY}|${params.txnid}|${amt}|${pinfo}|${fname}|${email}|${u1}|${u2}|${u3}|${u4}|${u5}||||||${PAYU_SALT}`;
  const hash = createHash("sha512").update(hashString).digest("hex");

  const surl = `${SITE_URL}/api/payments/payu/callback`;
  const furl = `${SITE_URL}/api/payments/payu/callback`;

  return {
    hash,
    key: PAYU_KEY,
    actionUrl: getPayUActionUrl(),
    surl,
    furl,
  };
}

/**
 * Verifies reverse SHA-512 hash from PayU callback:
 * If additionalCharges present:
 * additionalCharges|salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
 * Else:
 * salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
 */
export function verifyPayUCallbackHash(data: Record<string, string | undefined>): boolean {
  if (!PAYU_SALT) return false;
  const key = String(data.key || PAYU_KEY).trim();
  const txnid = String(data.txnid || "").trim();
  const amount = String(data.amount || "").trim();
  const productinfo = String(data.productinfo || "").trim();
  const firstname = String(data.firstname || "").trim();
  const email = String(data.email || "").trim();
  const status = String(data.status || "").trim();
  const resphash = String(data.hash || "").trim().toLowerCase();
  const additionalCharges = data.additionalCharges ? String(data.additionalCharges).trim() : "";

  const u1 = String(data.udf1 || "").trim();
  const u2 = String(data.udf2 || "").trim();
  const u3 = String(data.udf3 || "").trim();
  const u4 = String(data.udf4 || "").trim();
  const u5 = String(data.udf5 || "").trim();

  let hashSeq = `${PAYU_SALT}|${status}||||||${u5}|${u4}|${u3}|${u2}|${u1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  if (additionalCharges) {
    hashSeq = `${additionalCharges}|${hashSeq}`;
  }

  const calculatedHash = createHash("sha512").update(hashSeq).digest("hex").toLowerCase();
  return calculatedHash === resphash;
}

/**
 * PayPal REST API Server Helper (Quickupp Softech LLC)
 * Supports live and sandbox checkout processing.
 */

const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const PAYPAL_MODE = process.env.PAYPAL_MODE || "live";

const PAYPAL_BASE_URL =
  PAYPAL_MODE === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

/**
 * Obtains an OAuth2 bearer token from PayPal using client credentials.
 */
export async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error(
      "PayPal API credentials missing. Please ensure NEXT_PUBLIC_PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set."
    );
  }

  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID.trim()}:${PAYPAL_CLIENT_SECRET.trim()}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    console.error("[PayPal Auth Error]", data);
    throw new Error(
      data.error_description || "Failed to authenticate with PayPal API"
    );
  }

  return data.access_token as string;
}

export interface CreateOrderParams {
  amount: number;
  currency?: string;
  description?: string;
  customId?: string;
}

/**
 * Creates a PayPal v2 order for checkout.
 */
export async function createPayPalOrder(params: CreateOrderParams) {
  const token = await getPayPalAccessToken();

  const formattedAmount = Number(params.amount).toFixed(2);
  const currency = (params.currency || "USD").toUpperCase();

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: formattedAmount,
        },
        description: (params.description || "Quickupp Softech Service Payment").slice(0, 127),
        custom_id: (params.customId || "").slice(0, 127),
      },
    ],
    application_context: {
      brand_name: "Quickupp Softech LLC",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      shipping_preference: "NO_SHIPPING",
    },
  };

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const order = await res.json();
  if (!res.ok || !order.id) {
    console.error("[PayPal Create Order Error]", order);
    throw new Error(
      order.message || order.details?.[0]?.description || "Failed to create PayPal order"
    );
  }

  return order;
}

/**
 * Captures an approved PayPal order.
 */
export async function capturePayPalOrder(orderId: string) {
  const token = await getPayPalAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const capture = await res.json();
  if (!res.ok) {
    console.error("[PayPal Capture Order Error]", capture);
    throw new Error(
      capture.message || capture.details?.[0]?.description || "Failed to capture PayPal payment"
    );
  }

  return capture;
}

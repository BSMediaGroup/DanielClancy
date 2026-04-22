export const DONATION_PRESETS = [5, 10, 25, 50, 100, 250];
export const DONATION_MIN_USD = 5;
export const DONATION_MAX_USD = 2500;
export const DONATION_CURRENCY = "USD";
export const STRIPE_API_VERSION = "2026-02-25.clover";

const STRIPE_UNAVAILABLE_MESSAGE = "Secure card checkout is temporarily unavailable.";
const PAYPAL_UNAVAILABLE_MESSAGE = "PayPal is temporarily unavailable.";
const STRIPE_WALLET_MESSAGE =
  "Apple Pay and Google Pay only appear in Stripe Checkout when the current device, browser, wallet, and Stripe configuration support them.";

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export function sanitizeEnv(value, maxLength = 400) {
  return String(value || "")
    .trim()
    .slice(0, maxLength);
}

export function parseBoolean(value) {
  return sanitizeEnv(value, 16).toLowerCase() === "true";
}

export function buildOrigin(request) {
  const url = new URL(request.url);
  const forwardedProto = sanitizeEnv(request.headers.get("X-Forwarded-Proto"), 10);
  const forwardedHost = sanitizeEnv(request.headers.get("X-Forwarded-Host"), 255);
  const host = forwardedHost || sanitizeEnv(request.headers.get("Host"), 255) || url.host;
  const protocol = forwardedProto || url.protocol.replace(":", "") || "https";

  return `${protocol}://${host}`;
}

export async function parseRequestJson(request) {
  try {
    return await request.json();
  } catch (_error) {
    return null;
  }
}

export async function readJsonResponse(response) {
  const text = await response.text();

  try {
    return {
      text,
      data: text ? JSON.parse(text) : null,
    };
  } catch (_error) {
    return {
      text,
      data: null,
    };
  }
}

export function normalizeAmount(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
    return null;
  }

  return amount;
}

export function validateDonationAmount(value) {
  const amount = normalizeAmount(value);

  if (amount === null) {
    return {
      ok: false,
      amount: null,
      message: "Choose a valid whole-dollar donation amount.",
    };
  }

  if (amount < DONATION_MIN_USD || amount > DONATION_MAX_USD) {
    return {
      ok: false,
      amount: null,
      message: `Choose an amount between $${DONATION_MIN_USD} and $${DONATION_MAX_USD}.`,
    };
  }

  return {
    ok: true,
    amount,
    message: "",
  };
}

export function amountToCurrencyValue(amount) {
  return `${amount.toFixed(2)}`;
}

export function getStripeAvailability(env) {
  const secretKey = sanitizeEnv(env?.STRIPE_SECRET_KEY, 200);
  const liveEnabled = parseBoolean(env?.STRIPE_LIVE_ENABLED);

  if (!secretKey) {
    return {
      available: false,
      mode: "unavailable",
      message: STRIPE_UNAVAILABLE_MESSAGE,
      methods: ["Cards"],
      walletMessage: STRIPE_WALLET_MESSAGE,
    };
  }

  return {
    available: true,
    mode: liveEnabled ? "live" : "test",
    message: liveEnabled
      ? "Live Stripe Checkout is available for cards and supported wallets."
      : "Stripe Checkout is available in preview mode.",
    methods: ["Cards", "Apple Pay", "Google Pay"],
    walletMessage: STRIPE_WALLET_MESSAGE,
  };
}

export function getPayPalAvailability(env) {
  const clientId = sanitizeEnv(env?.PAYPAL_CLIENT_ID, 200);
  const clientSecret = sanitizeEnv(env?.PAYPAL_CLIENT_SECRET, 200);
  const appName = sanitizeEnv(env?.PAYPAL_APP_NAME, 120) || "DanielClancyNet";
  const liveEnabled = parseBoolean(env?.PAYPAL_LIVE_ENABLED);

  if (!clientId || !clientSecret) {
    return {
      available: false,
      mode: "unavailable",
      message: PAYPAL_UNAVAILABLE_MESSAGE,
      methods: ["PayPal"],
    };
  }

  return {
    available: true,
    mode: liveEnabled ? "live" : "test",
    message: liveEnabled
      ? "Live PayPal checkout is available now."
      : "PayPal checkout is available in preview mode.",
    methods: ["PayPal"],
    clientId,
    appName,
  };
}

export function getPaymentAvailability(env) {
  return {
    currency: DONATION_CURRENCY,
    minAmount: DONATION_MIN_USD,
    maxAmount: DONATION_MAX_USD,
    presetAmounts: [...DONATION_PRESETS],
    stripe: getStripeAvailability(env),
    paypal: getPayPalAvailability(env),
  };
}

export function getPayPalApiBase(env) {
  return parseBoolean(env?.PAYPAL_LIVE_ENABLED)
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function encodeBasicAuth(value) {
  if (typeof btoa === "function") {
    return btoa(value);
  }

  return Buffer.from(value, "utf8").toString("base64");
}

export async function createPayPalAccessToken(env) {
  const clientId = sanitizeEnv(env?.PAYPAL_CLIENT_ID, 200);
  const clientSecret = sanitizeEnv(env?.PAYPAL_CLIENT_SECRET, 200);

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are unavailable.");
  }

  const response = await fetch(`${getPayPalApiBase(env)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodeBasicAuth(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: "grant_type=client_credentials",
  });

  const { data } = await readJsonResponse(response);

  if (!response.ok || !data?.access_token) {
    throw new Error("PayPal authentication failed.");
  }

  return data.access_token;
}

export async function paypalFetch(env, path, { method = "GET", accessToken, body, headers = {} } = {}) {
  const response = await fetch(`${getPayPalApiBase(env)}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...headers,
    },
    body,
  });

  const parsed = await readJsonResponse(response);

  return {
    response,
    data: parsed.data,
    text: parsed.text,
  };
}

export function logPaymentEvent(payload) {
  console.log(JSON.stringify(payload));
}

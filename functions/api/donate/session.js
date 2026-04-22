const STRIPE_API_BASE = "https://api.stripe.com/v1";
const STRIPE_API_VERSION = "2026-02-25.clover";
const DONATION_PRESETS = [5, 10, 25, 50, 100, 250];
const DONATION_MIN_USD = 5;
const DONATION_MAX_USD = 2500;
const DONATION_CURRENCY = "usd";
const PUBLIC_UNAVAILABLE_MESSAGE =
  "Secure card checkout is temporarily unavailable. Please check back shortly.";
const WALLET_MESSAGE =
  "Apple Pay or Google Pay may appear inside Stripe Checkout when your device, browser, wallet, and Stripe settings support them.";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function sanitizeEnv(value, maxLength = 400) {
  return String(value || "")
    .trim()
    .slice(0, maxLength);
}

function parseBoolean(value) {
  return sanitizeEnv(value, 16).toLowerCase() === "true";
}

function getStripeMode(env) {
  const secretKey = sanitizeEnv(env?.STRIPE_SECRET_KEY, 200);
  const publishableKey = sanitizeEnv(env?.STRIPE_PUBLISHABLE_KEY, 200);

  if (!secretKey || !publishableKey) {
    return {
      available: false,
      state: "unavailable",
      mode: "unavailable",
      currency: DONATION_CURRENCY.toUpperCase(),
      minAmount: DONATION_MIN_USD,
      maxAmount: DONATION_MAX_USD,
      presetAmounts: DONATION_PRESETS,
      message: PUBLIC_UNAVAILABLE_MESSAGE,
      walletMessage: WALLET_MESSAGE,
      deferredPaymentPaths: ["PayPal"],
    };
  }

  const liveEnabled = parseBoolean(env?.STRIPE_LIVE_ENABLED);

  return {
    available: true,
    state: "ready",
    mode: liveEnabled ? "live" : "test",
    currency: DONATION_CURRENCY.toUpperCase(),
    minAmount: DONATION_MIN_USD,
    maxAmount: DONATION_MAX_USD,
    presetAmounts: DONATION_PRESETS,
    message: liveEnabled
      ? "Secure card donations are live through Stripe Checkout."
      : "Secure Stripe Checkout is available in preview mode.",
    walletMessage: WALLET_MESSAGE,
    deferredPaymentPaths: ["PayPal"],
  };
}

function parseAmount(payload) {
  const amount = Number(payload?.amount);

  if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
    return null;
  }

  return amount;
}

function buildOrigin(request) {
  const url = new URL(request.url);
  const forwardedProto = sanitizeEnv(request.headers.get("X-Forwarded-Proto"), 10);
  const forwardedHost = sanitizeEnv(request.headers.get("X-Forwarded-Host"), 255);
  const host = forwardedHost || sanitizeEnv(request.headers.get("Host"), 255) || url.host;
  const protocol = forwardedProto || url.protocol.replace(":", "") || "https";

  return `${protocol}://${host}`;
}

function buildSessionFormBody(request, amount) {
  const origin = buildOrigin(request);
  const amountLabel = `$${amount}`;
  const params = new URLSearchParams();

  params.set("mode", "payment");
  params.set("submit_type", "donate");
  params.set("success_url", `${origin}/donate?donation=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/donate?donation=cancel`);
  params.set("billing_address_collection", "auto");
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", DONATION_CURRENCY);
  params.set("line_items[0][price_data][unit_amount]", String(amount * 100));
  params.set("line_items[0][price_data][product_data][name]", "Support Daniel Clancy");
  params.set(
    "line_items[0][price_data][product_data][description]",
    `${amountLabel} one-time donation for Daniel Clancy's content and independent design work.`,
  );
  params.set("metadata[source]", "danielclancy-donate");
  params.set("metadata[amount_usd]", String(amount));
  params.set("payment_intent_data[metadata][source]", "danielclancy-donate");
  params.set("payment_intent_data[metadata][amount_usd]", String(amount));

  return params;
}

async function createCheckoutSession(request, env, amount) {
  const secretKey = sanitizeEnv(env?.STRIPE_SECRET_KEY, 200);
  const formBody = buildSessionFormBody(request, amount);
  const response = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": STRIPE_API_VERSION,
    },
    body: formBody.toString(),
  });

  const responseText = await response.text();
  let payload = {};

  try {
    payload = responseText ? JSON.parse(responseText) : {};
  } catch (_error) {
    payload = {};
  }

  if (!response.ok || !payload?.url) {
    return {
      ok: false,
      status: response.status || 502,
      body: json(
        {
          message:
            "Secure checkout could not be started right now. Please try again in a moment.",
        },
        response.status >= 400 && response.status < 500 ? 400 : 502,
      ),
    };
  }

  return {
    ok: true,
    body: json({ url: payload.url }),
  };
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestGet(context) {
  return json(getStripeMode(context.env));
}

export async function onRequestPost(context) {
  const availability = getStripeMode(context.env);

  if (!availability.available) {
    return json({ message: availability.message }, 503);
  }

  let payload;

  try {
    payload = await context.request.json();
  } catch (_error) {
    return json({ message: "Invalid request payload." }, 400);
  }

  const amount = parseAmount(payload);

  if (!amount) {
    return json({ message: "Please choose a valid donation amount." }, 400);
  }

  if (amount < DONATION_MIN_USD || amount > DONATION_MAX_USD) {
    return json(
      {
        message: `Please choose an amount between $${DONATION_MIN_USD} and $${DONATION_MAX_USD}.`,
      },
      400,
    );
  }

  const session = await createCheckoutSession(context.request, context.env, amount);
  return session.body;
}

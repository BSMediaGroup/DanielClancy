import {
  DONATION_CURRENCY,
  STRIPE_API_VERSION,
  buildOrigin,
  getStripeAvailability,
  json,
  sanitizeEnv,
  validateDonationAmount,
} from "../_shared.js";

const STRIPE_API_BASE = "https://api.stripe.com/v1";
const GENERIC_ERROR =
  "Secure card checkout could not be started right now. Please try again in a moment.";

function buildSessionFormBody(request, amount) {
  const origin = buildOrigin(request);
  const amountLabel = `$${amount}`;
  const params = new URLSearchParams();

  params.set("mode", "payment");
  params.set("submit_type", "donate");
  params.set("success_url", `${origin}/donate?donation=success&provider=stripe&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/donate?donation=cancel&provider=stripe`);
  params.set("billing_address_collection", "auto");
  params.set("payment_method_types[0]", "card");
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", DONATION_CURRENCY.toLowerCase());
  params.set("line_items[0][price_data][unit_amount]", String(amount * 100));
  params.set("line_items[0][price_data][product_data][name]", "Support Daniel Clancy");
  params.set(
    "line_items[0][price_data][product_data][description]",
    `${amountLabel} one-time donation for Daniel Clancy's independent publishing and design work.`,
  );
  params.set("metadata[source]", "danielclancy-donate");
  params.set("metadata[provider]", "stripe");
  params.set("metadata[amount_usd]", String(amount));
  params.set("payment_intent_data[metadata][source]", "danielclancy-donate");
  params.set("payment_intent_data[metadata][provider]", "stripe");
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
  let payload = null;

  try {
    payload = responseText ? JSON.parse(responseText) : null;
  } catch (_error) {
    payload = null;
  }

  if (!response.ok || !payload?.url) {
    return json({ message: GENERIC_ERROR }, response.status >= 400 && response.status < 500 ? 400 : 502);
  }

  return json({ url: payload.url });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestPost(context) {
  const availability = getStripeAvailability(context.env);

  if (!availability.available) {
    return json({ message: availability.message }, 503);
  }

  const payload = await context.request.json().catch(() => null);

  if (!payload) {
    return json({ message: "Invalid request payload." }, 400);
  }

  const amountValidation = validateDonationAmount(payload.amount);

  if (!amountValidation.ok || amountValidation.amount === null) {
    return json({ message: amountValidation.message }, 400);
  }

  return createCheckoutSession(context.request, context.env, amountValidation.amount);
}

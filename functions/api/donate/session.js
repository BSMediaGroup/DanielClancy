import {
  DONATION_CURRENCY,
  DONATION_MAX_USD,
  DONATION_MIN_USD,
  DONATION_PRESETS,
  getStripeAvailability,
  json,
} from "../payments/_shared.js";
import { onRequestPost as onStripeCreateSession, onRequestOptions } from "../payments/stripe/create-session.js";

export { onRequestOptions };

export async function onRequestGet(context) {
  const stripe = getStripeAvailability(context.env);

  return json({
    available: stripe.available,
    state: stripe.available ? "ready" : "unavailable",
    mode: stripe.mode,
    currency: DONATION_CURRENCY,
    minAmount: DONATION_MIN_USD,
    maxAmount: DONATION_MAX_USD,
    presetAmounts: [...DONATION_PRESETS],
    message: stripe.message,
    walletMessage: stripe.walletMessage,
    deferredPaymentPaths: context.env?.PAYPAL_CLIENT_ID ? [] : ["PayPal"],
  });
}

export const onRequestPost = onStripeCreateSession;

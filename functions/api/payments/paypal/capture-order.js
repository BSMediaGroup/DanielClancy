import {
  createPayPalAccessToken,
  getPayPalAvailability,
  json,
  paypalFetch,
  sanitizeEnv,
} from "../_shared.js";

const GENERIC_ERROR = "PayPal could not finalize the donation right now. Please try again.";

function summarizeCapture(order) {
  const purchaseUnit = order?.purchase_units?.[0] || {};
  const capture = purchaseUnit?.payments?.captures?.[0] || {};

  return {
    id: sanitizeEnv(capture?.id, 120),
    status: sanitizeEnv(capture?.status || order?.status, 80),
    orderId: sanitizeEnv(order?.id, 120),
    amount: sanitizeEnv(capture?.amount?.value || purchaseUnit?.amount?.value, 32),
    currency: sanitizeEnv(capture?.amount?.currency_code || purchaseUnit?.amount?.currency_code, 16),
  };
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
  const availability = getPayPalAvailability(context.env);

  if (!availability.available) {
    return json({ message: availability.message }, 503);
  }

  const payload = await context.request.json().catch(() => null);
  const orderId = sanitizeEnv(payload?.orderId, 120);

  if (!orderId) {
    return json({ message: "A valid PayPal order is required." }, 400);
  }

  try {
    const accessToken = await createPayPalAccessToken(context.env);
    const { response, data } = await paypalFetch(context.env, `/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      accessToken,
      headers: {
        "Content-Type": "application/json",
        "PayPal-Request-Id": crypto.randomUUID(),
      },
      body: "{}",
    });

    if (!response.ok) {
      return json({ message: GENERIC_ERROR }, response.status >= 400 && response.status < 500 ? 400 : 502);
    }

    const capture = summarizeCapture(data);

    if (!capture.id) {
      return json({ message: GENERIC_ERROR }, 502);
    }

    return json(capture);
  } catch (_error) {
    return json({ message: GENERIC_ERROR }, 502);
  }
}

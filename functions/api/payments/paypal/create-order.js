import {
  DONATION_CURRENCY,
  amountToCurrencyValue,
  buildOrigin,
  createPayPalAccessToken,
  getPayPalAvailability,
  json,
  paypalFetch,
  validateDonationAmount,
} from "../_shared.js";

const GENERIC_ERROR = "PayPal could not start the donation right now. Please try again in a moment.";

function readApprovalUrl(order) {
  const links = Array.isArray(order?.links) ? order.links : [];
  const approvalLink = links.find((link) => link?.rel === "approve" || link?.rel === "payer-action");

  return typeof approvalLink?.href === "string" ? approvalLink.href : "";
}

function buildOrderPayload(request, env, amount) {
  const origin = buildOrigin(request);
  const appName = getPayPalAvailability(env).appName || "DanielClancyNet";

  return {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: `donation-${amount}`,
        custom_id: `danielclancy-donate-${amount}`,
        description: "Support Daniel Clancy",
        amount: {
          currency_code: DONATION_CURRENCY,
          value: amountToCurrencyValue(amount),
        },
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          brand_name: appName,
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
          return_url: `${origin}/donate?donation=success&provider=paypal`,
          cancel_url: `${origin}/donate?donation=cancel&provider=paypal`,
        },
      },
    },
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

  if (!payload) {
    return json({ message: "Invalid request payload." }, 400);
  }

  const amountValidation = validateDonationAmount(payload.amount);

  if (!amountValidation.ok || amountValidation.amount === null) {
    return json({ message: amountValidation.message }, 400);
  }

  try {
    const accessToken = await createPayPalAccessToken(context.env);
    const orderPayload = buildOrderPayload(context.request, context.env, amountValidation.amount);
    const { response, data } = await paypalFetch(context.env, "/v2/checkout/orders", {
      method: "POST",
      accessToken,
      headers: {
        "Content-Type": "application/json",
        "PayPal-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify(orderPayload),
    });

    const approvalUrl = readApprovalUrl(data);

    if (!response.ok || !data?.id || !approvalUrl) {
      return json({ message: GENERIC_ERROR }, response.status >= 400 && response.status < 500 ? 400 : 502);
    }

    return json({
      id: data.id,
      approvalUrl,
    });
  } catch (_error) {
    return json({ message: GENERIC_ERROR }, 502);
  }
}

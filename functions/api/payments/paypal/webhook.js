import {
  createPayPalAccessToken,
  getPayPalAvailability,
  json,
  logPaymentEvent,
  paypalFetch,
  sanitizeEnv,
} from "../_shared.js";

function readWebhookHeaders(request) {
  return {
    authAlgo: sanitizeEnv(request.headers.get("paypal-auth-algo"), 120),
    certUrl: sanitizeEnv(request.headers.get("paypal-cert-url"), 500),
    transmissionId: sanitizeEnv(request.headers.get("paypal-transmission-id"), 120),
    transmissionSig: sanitizeEnv(request.headers.get("paypal-transmission-sig"), 500),
    transmissionTime: sanitizeEnv(request.headers.get("paypal-transmission-time"), 120),
  };
}

function summarizeWebhook(event) {
  return {
    id: sanitizeEnv(event?.id, 120),
    eventType: sanitizeEnv(event?.event_type, 120),
    resourceType: sanitizeEnv(event?.resource_type, 80),
    resourceId: sanitizeEnv(event?.resource?.id || event?.resource?.supplementary_data?.related_ids?.order_id, 120),
    orderId: sanitizeEnv(event?.resource?.supplementary_data?.related_ids?.order_id, 120),
    amount: sanitizeEnv(event?.resource?.amount?.value, 32),
    currency: sanitizeEnv(event?.resource?.amount?.currency_code, 16),
  };
}

async function verifyWebhook(env, request, event) {
  const webhookId = sanitizeEnv(env?.PAYPAL_WEBHOOK_ID, 200);
  const headers = readWebhookHeaders(request);

  if (
    !webhookId ||
    !headers.authAlgo ||
    !headers.certUrl ||
    !headers.transmissionId ||
    !headers.transmissionSig ||
    !headers.transmissionTime
  ) {
    return false;
  }

  const accessToken = await createPayPalAccessToken(env);
  const { response, data } = await paypalFetch(env, "/v1/notifications/verify-webhook-signature", {
    method: "POST",
    accessToken,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: headers.authAlgo,
      cert_url: headers.certUrl,
      transmission_id: headers.transmissionId,
      transmission_sig: headers.transmissionSig,
      transmission_time: headers.transmissionTime,
      webhook_id: webhookId,
      webhook_event: event,
    }),
  });

  return response.ok && data?.verification_status === "SUCCESS";
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
    return json({ message: "Invalid webhook payload." }, 400);
  }

  try {
    const verified = await verifyWebhook(context.env, context.request, payload);

    if (!verified) {
      return json({ message: "Invalid webhook signature." }, 400);
    }

    switch (payload?.event_type) {
      case "CHECKOUT.ORDER.APPROVED":
      case "PAYMENT.CAPTURE.COMPLETED":
      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.REFUNDED":
        logPaymentEvent({ payPalDonationEvent: summarizeWebhook(payload) });
        break;
      default:
        logPaymentEvent({
          payPalDonationEvent: {
            id: sanitizeEnv(payload?.id, 120),
            eventType: sanitizeEnv(payload?.event_type, 120),
            ignored: true,
          },
        });
        break;
    }

    return json({ received: true });
  } catch (_error) {
    return json({ message: "Webhook verification failed." }, 502);
  }
}

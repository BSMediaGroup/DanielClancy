import { json, logPaymentEvent, sanitizeEnv } from "../../payments/_shared.js";
import { confirmPrintfulDraftOrder } from "../../../_shared/printful-products.js";
import {
  maskEmail,
  merchOrderStorage,
  merchStripeEventKey,
  readMerchOrder,
  readMerchOrderByStripeSession,
  transitionMerchOrder
} from "../../../_shared/merch-orders.js";

const STRIPE_WEBHOOK_TOLERANCE_SECONDS = 300;

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      allow: "POST, OPTIONS",
      "cache-control": "no-store"
    }
  });
}

export async function onRequestPost(context) {
  const secret = sanitizeEnv(context.env?.STRIPE_WEBHOOK_SECRET, 200);
  const storage = merchOrderStorage(context.env);
  if (!secret) return json({ message: "Webhook signing secret is not configured." }, 503);
  if (!storage) return json({ message: "DC_MERCH_ORDERS_KV is required before merch payment webhooks can update fulfillment state." }, 503);

  const verification = await verifyStripeWebhookSignature(context.request, secret);
  if (!verification.ok || !verification.payload) return json({ message: "Invalid webhook signature." }, 400);

  const event = verification.payload;
  const eventId = sanitizeEnv(event?.id, 120);
  if (eventId) {
    const eventKey = merchStripeEventKey(eventId);
    const existingEvent = await storage.get(eventKey).catch(() => null);
    if (existingEvent) return json({ received: true, duplicate: true });
    await storage.put(eventKey, new Date().toISOString());
  }

  if (event?.type === "checkout.session.completed") {
    await handleCheckoutCompleted(context.env, storage, event.data?.object || {});
  } else if (event?.type === "checkout.session.expired") {
    await handleCheckoutExpired(storage, event.data?.object || {});
  }

  logPaymentEvent({
    stripeMerchEvent: {
      id: sanitizeEnv(event?.id, 120),
      type: sanitizeEnv(event?.type, 120),
      handled: event?.type === "checkout.session.completed"
    }
  });
  return json({ received: true });
}

async function handleCheckoutCompleted(env, storage, session) {
  const intentId = sanitizeEnv(session.metadata?.merch_order_intent_id, 120);
  const current = intentId ? await readMerchOrder(storage, intentId) : await readMerchOrderByStripeSession(storage, session.id);
  if (!current) return;

  const paid = session.payment_status === "paid";
  const nextStripe = {
    ...current.stripe,
    sessionId: sanitizeEnv(session.id, 120) || current.stripe?.sessionId,
    paymentStatus: sanitizeEnv(session.payment_status, 80),
    paymentIntentId: sanitizeEnv(session.payment_intent, 120),
    customerEmailMasked: maskEmail(session.customer_details?.email || session.customer_email)
  };

  if (!paid) {
    await transitionMerchOrder(storage, current, "stripe_checkout_created", {
      stripe: nextStripe,
      historyNote: "Stripe checkout completed webhook arrived before payment_status=paid."
    });
    return;
  }

  const currentStatus = String(current.status || "");
  let order = currentStatus === "paid" || currentStatus.startsWith("printful_")
    ? current
    : await transitionMerchOrder(storage, current, "paid", {
        stripe: nextStripe,
        customer: {
          ...(current.customer || {}),
          emailMasked: nextStripe.customerEmailMasked || current.customer?.emailMasked || ""
        },
        historyNote: "Stripe confirmed successful payment."
      });

  if (order.status === "printful_confirmed") return;
  if (order.status === "printful_confirming") return;
  const printfulDraftId = sanitizeEnv(order.printful?.draftOrderId || session.metadata?.printful_draft_order_id, 120);
  if (!printfulDraftId) {
    await transitionMerchOrder(storage, order, "manual_review_required", {
      actionNeeded: true,
      errorSummary: "Stripe payment succeeded but no Printful draft order id was stored.",
      historyNote: "Fulfillment confirmation could not start."
    });
    return;
  }

  order = await transitionMerchOrder(storage, order, "printful_confirming", {
    printful: {
      ...order.printful,
      draftOrderId: printfulDraftId,
      status: "confirming",
      confirmationAttemptCount: Number(order.printful?.confirmationAttemptCount || 0) + 1,
      confirmationAttemptedAt: new Date().toISOString()
    },
    historyNote: "Confirming Printful draft after paid Stripe session."
  });

  const confirmed = await confirmPrintfulDraftOrder(env, printfulDraftId);
  if (!confirmed.ok) {
    await transitionMerchOrder(storage, order, "printful_confirmation_failed", {
      printful: {
        ...order.printful,
        status: "confirmation_failed"
      },
      actionNeeded: true,
      errorSummary: "Printful draft confirmation failed after successful Stripe payment.",
      historyNote: "Manual review is required; no second confirmation attempt was made for this webhook event."
    });
    return;
  }

  const payload = confirmed.payload?.result || confirmed.payload?.data || confirmed.payload || {};
  await transitionMerchOrder(storage, order, "printful_confirmed", {
    printful: {
      ...order.printful,
      status: "confirmed",
      confirmedOrderId: sanitizeEnv(payload.id || payload.order?.id || printfulDraftId, 120),
      confirmedAt: new Date().toISOString()
    },
    actionNeeded: false,
    errorSummary: "",
    historyNote: "Printful draft confirmed after successful Stripe payment."
  });
}

async function handleCheckoutExpired(storage, session) {
  const intentId = sanitizeEnv(session.metadata?.merch_order_intent_id, 120);
  const current = intentId ? await readMerchOrder(storage, intentId) : await readMerchOrderByStripeSession(storage, session.id);
  if (!current || ["paid", "printful_confirming", "printful_confirmed"].includes(current.status)) return;
  await transitionMerchOrder(storage, current, "expired", {
    stripe: {
      ...current.stripe,
      sessionId: sanitizeEnv(session.id, 120) || current.stripe?.sessionId,
      paymentStatus: "expired"
    },
    historyNote: "Stripe Checkout Session expired before payment completion."
  });
}

function parseStripeSignature(headerValue) {
  return String(headerValue || "")
    .split(",")
    .map((part) => part.trim())
    .reduce((accumulator, part) => {
      const [key, value] = part.split("=", 2);
      if (key && value) {
        accumulator[key] ||= [];
        accumulator[key].push(value);
      }
      return accumulator;
    }, {});
}

async function verifyStripeWebhookSignature(request, secret) {
  const payload = await request.text();
  const header = request.headers.get("Stripe-Signature");
  const parsedHeader = parseStripeSignature(header);
  const timestamp = Number(parsedHeader.t?.[0]);
  const candidateSignatures = parsedHeader.v1 || [];
  if (!payload || !header || !Number.isFinite(timestamp) || !candidateSignatures.length) return { ok: false, payload: null };
  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - timestamp);
  if (ageSeconds > STRIPE_WEBHOOK_TOLERANCE_SECONDS) return { ok: false, payload: null };
  const expectedSignature = await createSignature(secret, timestamp, payload);
  const matches = candidateSignatures.some((candidate) => timingSafeEqualHex(expectedSignature, candidate));
  if (!matches) return { ok: false, payload: null };
  try {
    return { ok: true, payload: JSON.parse(payload) };
  } catch {
    return { ok: false, payload: null };
  }
}

async function createSignature(secret, timestamp, payload) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`));
  return Array.from(new Uint8Array(signatureBuffer)).map((value) => value.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqualHex(left, right) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
}

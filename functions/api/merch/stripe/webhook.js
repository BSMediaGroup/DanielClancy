import { json, logPaymentEvent, sanitizeEnv } from "../../payments/_shared.js";

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
  if (event?.type === "checkout.session.completed") {
    const session = event.data?.object || {};
    const intentId = sanitizeEnv(session.metadata?.merch_order_intent_id, 120);
    if (intentId) {
      const key = `merch-order:${intentId}`;
      const current = await storage.get(key).then((raw) => (raw ? JSON.parse(raw) : null)).catch(() => null);
      await storage.put(
        key,
        JSON.stringify({
          ...(current || { id: intentId }),
          updatedAt: new Date().toISOString(),
          status: session.payment_status === "paid" ? "paid_fulfillment_action_required" : "payment_pending",
          paymentStatus: sanitizeEnv(session.payment_status, 80),
          stripeCheckoutSessionId: sanitizeEnv(session.id, 120),
          printfulStatus: current?.printfulStatus || "not_created",
          actionRequired: "Create and confirm Printful fulfillment only after the production order handoff is implemented."
        })
      );
    }
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

function merchOrderStorage(env) {
  const binding = env?.DC_MERCH_ORDERS_KV;
  return binding && typeof binding.get === "function" && typeof binding.put === "function" ? binding : null;
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

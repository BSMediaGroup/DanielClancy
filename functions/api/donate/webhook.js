const STRIPE_WEBHOOK_TOLERANCE_SECONDS = 300;

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

function parseStripeSignature(headerValue) {
  return String(headerValue || "")
    .split(",")
    .map((part) => part.trim())
    .reduce(
      (accumulator, part) => {
        const [key, value] = part.split("=", 2);

        if (key && value) {
          accumulator[key] ||= [];
          accumulator[key].push(value);
        }

        return accumulator;
      },
      {},
    );
}

function timingSafeEqualHex(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

async function createSignature(secret, timestamp, payload) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${timestamp}.${payload}`),
  );

  return Array.from(new Uint8Array(signatureBuffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyStripeWebhookSignature(request, secret) {
  const payload = await request.text();
  const header = request.headers.get("Stripe-Signature");
  const parsedHeader = parseStripeSignature(header);
  const timestamp = Number(parsedHeader.t?.[0]);
  const candidateSignatures = parsedHeader.v1 || [];

  if (!payload || !header || !Number.isFinite(timestamp) || !candidateSignatures.length) {
    return { ok: false, payload: null };
  }

  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - timestamp);

  if (ageSeconds > STRIPE_WEBHOOK_TOLERANCE_SECONDS) {
    return { ok: false, payload: null };
  }

  const expectedSignature = await createSignature(secret, timestamp, payload);
  const matches = candidateSignatures.some((candidate) =>
    timingSafeEqualHex(expectedSignature, candidate),
  );

  if (!matches) {
    return { ok: false, payload: null };
  }

  try {
    return {
      ok: true,
      payload: JSON.parse(payload),
    };
  } catch (_error) {
    return { ok: false, payload: null };
  }
}

function eventSummary(event) {
  const session = event?.data?.object || {};

  return {
    id: sanitizeEnv(event?.id, 120),
    type: sanitizeEnv(event?.type, 120),
    livemode: Boolean(event?.livemode),
    checkoutSessionId: sanitizeEnv(session?.id, 120),
    paymentStatus: sanitizeEnv(session?.payment_status, 80),
    amountTotal: Number(session?.amount_total) || 0,
    currency: sanitizeEnv(session?.currency, 16).toUpperCase(),
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
  const secret = sanitizeEnv(context.env?.STRIPE_WEBHOOK_SECRET, 200);

  if (!secret) {
    return json({ message: "Webhook signing secret is not configured." }, 503);
  }

  const verification = await verifyStripeWebhookSignature(context.request, secret);

  if (!verification.ok || !verification.payload) {
    return json({ message: "Invalid webhook signature." }, 400);
  }

  const event = verification.payload;

  switch (event?.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed":
      console.log(JSON.stringify({ stripeDonationEvent: eventSummary(event) }));
      break;
    default:
      console.log(
        JSON.stringify({
          stripeDonationEvent: {
            id: sanitizeEnv(event?.id, 120),
            type: sanitizeEnv(event?.type, 120),
            ignored: true,
          },
        }),
      );
      break;
  }

  return json({ received: true });
}

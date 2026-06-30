export const MERCH_ORDER_STATUSES = [
  "pending_validation",
  "draft_created",
  "stripe_checkout_created",
  "paid",
  "printful_confirming",
  "printful_confirmed",
  "printful_confirmation_failed",
  "canceled",
  "expired",
  "manual_review_required"
];

export const MERCH_ORDER_PREFIX = "merch:orders:";
export const MERCH_STRIPE_SESSION_PREFIX = "merch:stripe:sessions:";
export const MERCH_STRIPE_EVENT_PREFIX = "merch:stripe:events:";
export const MERCH_PRINTFUL_DRAFT_PREFIX = "merch:printful:drafts:";
export const MERCH_RECENT_INDEX_PREFIX = "merch:index:recent:";

export function merchOrderStorage(env) {
  const binding = env?.DC_MERCH_ORDERS_KV;
  return binding && typeof binding.get === "function" && typeof binding.put === "function" ? binding : null;
}

export function merchOrderKey(intentId) {
  return `${MERCH_ORDER_PREFIX}${cleanId(intentId)}`;
}

export function merchStripeSessionKey(sessionId) {
  return `${MERCH_STRIPE_SESSION_PREFIX}${cleanId(sessionId)}`;
}

export function merchStripeEventKey(eventId) {
  return `${MERCH_STRIPE_EVENT_PREFIX}${cleanId(eventId)}`;
}

export function merchPrintfulDraftKey(printfulOrderId) {
  return `${MERCH_PRINTFUL_DRAFT_PREFIX}${cleanId(printfulOrderId)}`;
}

export function merchRecentIndexKey(order) {
  const created = Date.parse(order?.createdAt || "") || Date.now();
  return `${MERCH_RECENT_INDEX_PREFIX}${String(created).padStart(13, "0")}:${cleanId(order?.id)}`;
}

export async function readMerchOrder(storage, intentId) {
  if (!storage || !intentId) return null;
  const raw = await storage.get(merchOrderKey(intentId));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function readMerchOrderByStripeSession(storage, sessionId) {
  if (!storage || !sessionId) return null;
  const intentId = await storage.get(merchStripeSessionKey(sessionId));
  return intentId ? readMerchOrder(storage, intentId) : null;
}

export async function putMerchOrder(storage, order) {
  if (!storage || !order?.id) throw new Error("merch_order_storage_required");
  const updated = {
    ...order,
    updatedAt: order.updatedAt || new Date().toISOString(),
    statusHistory: Array.isArray(order.statusHistory) ? order.statusHistory : []
  };
  await storage.put(merchOrderKey(updated.id), JSON.stringify(updated));
  await storage.put(merchRecentIndexKey(updated), updated.id);
  if (updated.stripe?.sessionId) await storage.put(merchStripeSessionKey(updated.stripe.sessionId), updated.id);
  if (updated.printful?.draftOrderId) await storage.put(merchPrintfulDraftKey(updated.printful.draftOrderId), updated.id);
  return updated;
}

export async function transitionMerchOrder(storage, current, status, patch = {}) {
  const now = new Date().toISOString();
  const next = {
    ...(current || {}),
    ...patch,
    id: patch.id || current?.id,
    status,
    updatedAt: now,
    statusHistory: [
      ...(Array.isArray(current?.statusHistory) ? current.statusHistory : []),
      {
        status,
        at: now,
        note: cleanText(patch.historyNote || patch.errorSummary || "", 220)
      }
    ]
  };
  delete next.historyNote;
  return putMerchOrder(storage, next);
}

export function createInitialMerchOrder({ id, cart, recipient, shipping }) {
  const now = new Date().toISOString();
  return {
    id,
    createdAt: now,
    updatedAt: now,
    status: "pending_validation",
    statusHistory: [{ status: "pending_validation", at: now, note: "Server-side cart, recipient, and shipping validation passed." }],
    paymentProvider: "stripe",
    customer: {
      emailMasked: maskEmail(recipient?.email)
    },
    recipient: operationalRecipient(recipient),
    cart,
    selectedShipping: shipping,
    stripe: {
      sessionId: "",
      paymentStatus: "pending"
    },
    printful: {
      draftOrderId: "",
      confirmedOrderId: "",
      status: "not_created",
      confirmationAttemptCount: 0
    },
    actionNeeded: false,
    errorSummary: ""
  };
}

export function publicOrderStatus(order) {
  if (!order) return null;
  return {
    id: cleanId(order.id),
    createdAt: cleanText(order.createdAt, 80),
    updatedAt: cleanText(order.updatedAt, 80),
    status: safeStatus(order.status),
    paymentStatus: cleanText(order.stripe?.paymentStatus || order.paymentStatus, 80),
    fulfillmentStatus: cleanText(order.printful?.status || order.printfulStatus, 80),
    actionNeeded: Boolean(order.actionNeeded),
    items: Array.isArray(order.cart?.items)
      ? order.cart.items.map((item) => ({
          title: cleanText(item.title, 220),
          variantName: cleanText(item.variantName, 220),
          quantity: Number(item.quantity) || 0
        }))
      : [],
    message: customerStatusMessage(order)
  };
}

export function adminOrderSummary(order) {
  return {
    id: cleanId(order?.id),
    createdAt: cleanText(order?.createdAt, 80),
    updatedAt: cleanText(order?.updatedAt, 80),
    customerEmail: cleanText(order?.customer?.emailMasked || maskEmail(order?.recipient?.email), 160),
    stripeSessionId: cleanText(order?.stripe?.sessionId, 120),
    stripePaymentStatus: cleanText(order?.stripe?.paymentStatus || order?.paymentStatus, 80),
    printfulDraftOrderId: cleanText(order?.printful?.draftOrderId, 120),
    printfulConfirmedOrderId: cleanText(order?.printful?.confirmedOrderId, 120),
    printfulStatus: cleanText(order?.printful?.status || order?.printfulStatus, 80),
    status: safeStatus(order?.status),
    actionNeeded: Boolean(order?.actionNeeded),
    itemSummary: Array.isArray(order?.cart?.items)
      ? order.cart.items.map((item) => ({
          title: cleanText(item.title, 220),
          variantName: cleanText(item.variantName, 220),
          quantity: Number(item.quantity) || 0
        }))
      : [],
    errorSummary: cleanText(order?.errorSummary, 220)
  };
}

export function maskEmail(value) {
  const email = cleanText(value, 180).toLowerCase();
  const [name, domain] = email.split("@");
  if (!name || !domain) return "";
  const visible = name.length <= 2 ? `${name[0] || ""}*` : `${name.slice(0, 2)}***`;
  return `${visible}@${domain}`;
}

export function cleanText(value, maxLength = 500) {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanId(value) {
  return cleanText(value, 160).replace(/[^a-zA-Z0-9:_-]/g, "").slice(0, 160);
}

function safeStatus(value) {
  const status = cleanText(value, 80);
  return MERCH_ORDER_STATUSES.includes(status) ? status : "manual_review_required";
}

function operationalRecipient(recipient = {}) {
  return {
    name: cleanText(recipient.name, 160),
    email: cleanText(recipient.email, 180).toLowerCase(),
    country_code: cleanText(recipient.country_code, 2).toUpperCase(),
    state_code: cleanText(recipient.state_code, 12).toUpperCase(),
    city: cleanText(recipient.city, 120),
    zip: cleanText(recipient.zip, 40),
    address1: cleanText(recipient.address1, 180),
    address2: cleanText(recipient.address2, 180)
  };
}

function customerStatusMessage(order) {
  switch (order.status) {
    case "printful_confirmed":
      return "Payment is complete and the fulfillment order has been confirmed.";
    case "paid":
    case "printful_confirming":
      return "Payment is complete. Fulfillment confirmation is still being processed.";
    case "printful_confirmation_failed":
    case "manual_review_required":
      return "Payment is complete, but fulfillment needs manual review before any promise of shipment.";
    case "canceled":
      return "Checkout was canceled. No fulfillment order was confirmed.";
    case "expired":
      return "Checkout expired. No fulfillment order was confirmed.";
    default:
      return "Checkout has been created. Payment and fulfillment are not complete yet.";
  }
}

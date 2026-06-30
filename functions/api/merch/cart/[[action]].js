import {
  createPrintfulDraftOrder,
  fetchPrintfulProductList,
  json,
  printfulFetch,
  validatePublicCartItems
} from "../../../_shared/printful-products.js";
import {
  createInitialMerchOrder,
  merchOrderStorage,
  publicOrderStatus,
  readMerchOrder,
  readMerchOrderByStripeSession,
  transitionMerchOrder
} from "../../../_shared/merch-orders.js";
import {
  STRIPE_API_VERSION,
  buildOrigin,
  getStripeAvailability,
  parseRequestJson,
  sanitizeEnv
} from "../../payments/_shared.js";

const ERROR_HEADERS = { "cache-control": "no-store" };
const STRIPE_API_BASE = "https://api.stripe.com/v1";

export async function onRequest(context) {
  const { request, params } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "cache-control": "no-store",
        allow: "POST,OPTIONS"
      }
    });
  }
  const action = Array.isArray(params.action) ? params.action.join("/") : String(params.action || "");
  if (request.method === "GET" && action === "status") return getOrderStatus(context);
  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, { status: 405, headers: ERROR_HEADERS });
  }

  if (action === "validate" || action === "") return validateCart(context);
  if (action === "shipping") return estimateShipping(context);
  if (action === "checkout") return createMerchCheckout(context);
  if (action === "cancel") return cancelCheckout(context);
  return json({ ok: false, error: "not_found" }, { status: 404, headers: ERROR_HEADERS });
}

async function validateCart(context) {
  const payload = await parseRequestJson(context.request);
  const validation = await serverCartSummary(context.env, payload?.items);
  return json(validation.ok ? { ok: true, cart: safeCart(validation) } : validation, {
    status: validation.ok ? 200 : 400,
    headers: ERROR_HEADERS
  });
}

async function estimateShipping(context) {
  const payload = await parseRequestJson(context.request);
  const validation = await serverCartSummary(context.env, payload?.items);
  if (!validation.ok) return json(validation, { status: 400, headers: ERROR_HEADERS });

  const recipient = normalizeRecipient(payload?.recipient);
  if (!recipient.ok) return json(recipient, { status: 400, headers: ERROR_HEADERS });

  const result = await printfulFetch(context.env, "/shipping-rates", {
    version: "v2",
    method: "POST",
    body: {
      recipient: recipient.value,
      currency: validation.currency,
      order_items: validation.items.map((item) => ({
        source: "catalog",
        quantity: item.quantity,
        catalog_variant_id: Number(item.catalogVariantId) || item.catalogVariantId
      }))
    }
  });
  if (!result.ok) {
    return json(
      {
        ok: false,
        error: result.error || "printful_shipping_unavailable",
        message: result.message || result.detail || "Printful shipping rates are unavailable."
      },
      { status: result.status || 502, headers: ERROR_HEADERS }
    );
  }

  const options = Array.isArray(result.payload?.data)
    ? result.payload.data.map(normalizeShippingOption).filter(Boolean)
    : [];
  return json({ ok: true, cart: safeCart(validation), shippingOptions: options, ratesTtlSeconds: 60 }, { headers: ERROR_HEADERS });
}

async function createMerchCheckout(context) {
  const payload = await parseRequestJson(context.request);
  const storage = merchOrderStorage(context.env);
  if (!storage) {
    return json(
      {
        ok: false,
        error: "merch_order_storage_not_configured",
        message: "DC_MERCH_ORDERS_KV is required before merch checkout can create payment or fulfillment intents.",
        requiredBinding: "DC_MERCH_ORDERS_KV"
      },
      { status: 503, headers: ERROR_HEADERS }
    );
  }

  const availability = getStripeAvailability(context.env);
  if (!availability.available) return json({ ok: false, error: "stripe_not_configured", message: availability.message }, { status: 503, headers: ERROR_HEADERS });

  const validation = await serverCartSummary(context.env, payload?.items);
  if (!validation.ok) return json(validation, { status: 400, headers: ERROR_HEADERS });
  const recipient = normalizeRecipient(payload?.recipient, { requireComplete: true });
  if (!recipient.ok) return json(recipient, { status: 400, headers: ERROR_HEADERS });
  const shipping = await resolveValidatedShipping(context.env, validation, recipient.value, payload?.shippingOption);
  if (!shipping.ok) return json(shipping, { status: shipping.status || 400, headers: ERROR_HEADERS });

  const intentId = crypto.randomUUID();
  let order = createInitialMerchOrder({
    id: intentId,
    cart: safeCart(validation),
    recipient: recipient.value,
    shipping: shipping.value
  });
  order = await transitionMerchOrder(storage, order, "pending_validation", {
    historyNote: "Checkout intent persisted before Printful draft creation."
  });

  const draft = await createPrintfulDraftOrder(context.env, order);
  if (!draft.ok) {
    await transitionMerchOrder(storage, order, "manual_review_required", {
      printful: { ...order.printful, status: "draft_creation_failed" },
      actionNeeded: true,
      errorSummary: "Printful draft order creation failed before Stripe checkout.",
      historyNote: "Stripe checkout was not created."
    });
    return json({ ok: false, error: "printful_draft_unavailable", message: "Secure merch checkout could not be started because fulfillment setup is unavailable." }, { status: draft.status || 502, headers: ERROR_HEADERS });
  }

  const printfulOrder = draft.payload?.result || draft.payload?.data || draft.payload || {};
  const printfulDraftId = clean(printfulOrder.id || printfulOrder.order?.id || printfulOrder.order_id, 120);
  if (!printfulDraftId) {
    await transitionMerchOrder(storage, order, "manual_review_required", {
      printful: { ...order.printful, status: "draft_creation_unknown" },
      actionNeeded: true,
      errorSummary: "Printful draft order response did not include an order id.",
      historyNote: "Stripe checkout was not created."
    });
    return json({ ok: false, error: "printful_draft_unavailable", message: "Secure merch checkout could not be started because fulfillment setup is unavailable." }, { status: 502, headers: ERROR_HEADERS });
  }

  order = await transitionMerchOrder(storage, order, "draft_created", {
    printful: {
      ...order.printful,
      draftOrderId: printfulDraftId,
      status: "draft_created"
    },
    historyNote: "Printful draft order created with confirmation deferred until Stripe payment succeeds."
  });

  const checkout = await createStripeSession(context.request, context.env, validation, shipping.value, intentId, printfulDraftId);
  if (!checkout.ok) {
    await transitionMerchOrder(storage, order, "manual_review_required", {
      stripe: { ...order.stripe, paymentStatus: "checkout_failed" },
      actionNeeded: true,
      errorSummary: "Stripe checkout session creation failed after Printful draft creation.",
      historyNote: "Printful draft exists but was not confirmed."
    });
    return json({ ok: false, error: "stripe_checkout_failed", message: "Secure merch checkout could not be started." }, { status: checkout.status || 502, headers: ERROR_HEADERS });
  }

  await transitionMerchOrder(storage, order, "stripe_checkout_created", {
    stripe: {
      sessionId: checkout.sessionId,
      paymentStatus: "unpaid"
    },
    historyNote: "Stripe Checkout Session created."
  });

  return json({ ok: true, intentId, url: checkout.url, sessionId: checkout.sessionId }, { headers: ERROR_HEADERS });
}

async function getOrderStatus(context) {
  const storage = merchOrderStorage(context.env);
  if (!storage) {
    return json(
      {
        ok: false,
        error: "merch_order_storage_not_configured",
        message: "DC_MERCH_ORDERS_KV is required before merch order status can be read.",
        requiredBinding: "DC_MERCH_ORDERS_KV"
      },
      { status: 503, headers: ERROR_HEADERS }
    );
  }
  const url = new URL(context.request.url);
  const sessionId = clean(url.searchParams.get("session_id"), 160);
  const intentId = clean(url.searchParams.get("intent_id"), 160);
  const order = sessionId ? await readMerchOrderByStripeSession(storage, sessionId) : await readMerchOrder(storage, intentId);
  if (!order) return json({ ok: false, error: "order_not_found", message: "No merch order status was found for this checkout." }, { status: 404, headers: ERROR_HEADERS });
  return json({ ok: true, order: publicOrderStatus(order) }, { headers: ERROR_HEADERS });
}

async function cancelCheckout(context) {
  const payload = await parseRequestJson(context.request);
  const storage = merchOrderStorage(context.env);
  if (!storage) {
    return json({ ok: false, error: "merch_order_storage_not_configured", requiredBinding: "DC_MERCH_ORDERS_KV" }, { status: 503, headers: ERROR_HEADERS });
  }
  const intentId = clean(payload?.intentId || payload?.intent_id, 160);
  const current = await readMerchOrder(storage, intentId);
  if (!current) return json({ ok: false, error: "order_not_found" }, { status: 404, headers: ERROR_HEADERS });
  if (["paid", "printful_confirming", "printful_confirmed"].includes(current.status)) {
    return json({ ok: true, order: publicOrderStatus(current) }, { headers: ERROR_HEADERS });
  }
  const order = await transitionMerchOrder(storage, current, "canceled", {
    stripe: { ...current.stripe, paymentStatus: current.stripe?.paymentStatus || "canceled" },
    historyNote: "Customer returned through the cancel route before payment completion."
  });
  return json({ ok: true, order: publicOrderStatus(order) }, { headers: ERROR_HEADERS });
}

async function serverCartSummary(env, clientItems) {
  const products = await fetchPrintfulProductList(env);
  if (!products.ok) {
    return {
      ok: false,
      configured: Boolean(products.configured),
      error: products.error || "printful_products_unavailable",
      message: products.message || "Printful products are unavailable."
    };
  }
  const overrides = await loadPublishedOverrides(env);
  return validatePublicCartItems(products.products, clientItems, overrides);
}

async function createStripeSession(request, env, cart, shipping, intentId, printfulDraftId) {
  const origin = buildOrigin(request);
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/shop/cancel?intent_id=${encodeURIComponent(intentId)}`);
  params.set("billing_address_collection", "auto");
  params.set("shipping_address_collection[allowed_countries][0]", "US");
  params.set("shipping_address_collection[allowed_countries][1]", "AU");
  params.set("shipping_address_collection[allowed_countries][2]", "CA");
  params.set("shipping_address_collection[allowed_countries][3]", "GB");
  params.set("shipping_address_collection[allowed_countries][4]", "NZ");
  params.set("customer_creation", "if_required");
  cart.items.forEach((item, index) => {
    params.set(`line_items[${index}][quantity]`, String(item.quantity));
    params.set(`line_items[${index}][price_data][currency]`, cart.currency.toLowerCase());
    params.set(`line_items[${index}][price_data][unit_amount]`, String(item.unitAmount));
    params.set(`line_items[${index}][price_data][product_data][name]`, `${item.title} - ${item.variantName}`);
    if (item.image) params.set(`line_items[${index}][price_data][product_data][images][0]`, item.image);
  });
  const shippingIndex = cart.items.length;
  params.set(`line_items[${shippingIndex}][quantity]`, "1");
  params.set(`line_items[${shippingIndex}][price_data][currency]`, cart.currency.toLowerCase());
  params.set(`line_items[${shippingIndex}][price_data][unit_amount]`, String(shipping.amount));
  params.set(`line_items[${shippingIndex}][price_data][product_data][name]`, `Shipping - ${shipping.name}`);
  params.set("metadata[source]", "danielclancy-merch");
  params.set("metadata[merch_order_intent_id]", intentId);
  params.set("metadata[printful_draft_order_id]", printfulDraftId);
  params.set("payment_intent_data[metadata][source]", "danielclancy-merch");
  params.set("payment_intent_data[metadata][merch_order_intent_id]", intentId);

  const response = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${sanitizeEnv(env?.STRIPE_SECRET_KEY, 200)}`,
      "content-type": "application/x-www-form-urlencoded",
      "stripe-version": STRIPE_API_VERSION
    },
    body: params.toString()
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.url) return { ok: false, status: response.status, error: body?.error?.type || "stripe_error" };
  return { ok: true, url: body.url, sessionId: body.id || "" };
}

function safeCart(cart) {
  return {
    items: cart.items,
    subtotalAmount: cart.subtotalAmount,
    currency: cart.currency,
    itemCount: cart.itemCount,
    subtotalText: formatAmount(cart.subtotalAmount, cart.currency)
  };
}

function normalizeRecipient(raw = {}, options = {}) {
  const name = clean(raw.name, 160);
  const email = clean(raw.email, 180).toLowerCase();
  const country = clean(raw.country_code || raw.country || "").toUpperCase();
  const state = clean(raw.state_code || raw.state || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) return { ok: false, error: "country_required", message: "Country code is required for shipping estimates." };
  if (["US", "AU", "CA"].includes(country) && !/^[A-Z0-9-]{2,5}$/.test(state)) {
    return { ok: false, error: "state_code_required", message: "State/province code is required for US, AU, and CA shipping estimates." };
  }
  if (options.requireComplete) {
    if (!name) return { ok: false, error: "recipient_name_required", message: "Recipient name is required before checkout." };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "recipient_email_required", message: "Recipient email is required before checkout." };
    if (!clean(raw.address1, 180) || !clean(raw.city, 120) || !clean(raw.zip || raw.postal_code, 40)) {
      return { ok: false, error: "complete_shipping_address_required", message: "A complete shipping address is required before checkout." };
    }
  }
  return {
    ok: true,
    value: {
      name,
      email,
      country_code: country,
      state_code: state,
      city: clean(raw.city, 120),
      zip: clean(raw.zip || raw.postal_code, 40),
      address1: clean(raw.address1, 180),
      address2: clean(raw.address2, 180)
    }
  };
}

async function resolveValidatedShipping(env, cart, recipient, selectedShipping) {
  const selected = normalizeSelectedShipping(selectedShipping, cart.currency);
  if (!selected.ok) return selected;
  const result = await printfulFetch(env, "/shipping-rates", {
    version: "v2",
    method: "POST",
    body: {
      recipient,
      currency: cart.currency,
      order_items: cart.items.map((item) => ({
        source: "catalog",
        quantity: item.quantity,
        catalog_variant_id: Number(item.catalogVariantId) || item.catalogVariantId
      }))
    }
  });
  if (!result.ok) {
    return {
      ok: false,
      status: result.status || 502,
      error: result.error || "printful_shipping_unavailable",
      message: "Selected shipping could not be validated."
    };
  }
  const options = Array.isArray(result.payload?.data) ? result.payload.data.map(normalizeShippingOption).filter(Boolean) : [];
  const match = options.find((option) => option.id === selected.value.id && option.currency === cart.currency);
  if (!match) {
    return { ok: false, error: "shipping_option_not_available", message: "Selected shipping is no longer available." };
  }
  return { ok: true, value: match };
}

function normalizeShippingOption(raw = {}) {
  const amount = Math.round(Number.parseFloat(raw.rate || raw.amount || "0") * 100);
  const currency = clean(raw.currency || "AUD", 12).toUpperCase();
  const id = clean(raw.shipping || raw.id || raw.shipping_method_name, 120);
  if (!id || !Number.isFinite(amount) || amount < 0 || !currency) return null;
  return {
    id,
    name: clean(raw.shipping_method_name || raw.name || id, 220),
    amount,
    currency,
    amountText: formatAmount(amount, currency),
    minDeliveryDays: Number(raw.min_delivery_days) || null,
    maxDeliveryDays: Number(raw.max_delivery_days) || null
  };
}

function normalizeSelectedShipping(raw = {}, currency) {
  const amount = Math.round(Number(raw.amount || raw.amount_cents || 0));
  const optionCurrency = clean(raw.currency || currency, 12).toUpperCase();
  const id = clean(raw.id || raw.shipping, 120);
  if (!id || !Number.isFinite(amount) || amount < 0 || optionCurrency !== currency) {
    return { ok: false, error: "valid_shipping_option_required", message: "Choose a valid server-returned shipping option before checkout." };
  }
  return { ok: true, value: { id, name: clean(raw.name || id, 220), amount, currency: optionCurrency } };
}

function formatAmount(amount, currency) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount / 100);
}

function clean(value, maxLength = 500) {
  return String(value || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

async function loadPublishedOverrides(env) {
  const url = String(env?.DANIELCLANCY_ADMIN_PUBLIC_SITE_DATA_URL || env?.VITE_ADMIN_PUBLIC_SITE_DATA_URL || "").trim();
  if (!url || !/^https?:\/\//i.test(url)) return [];
  try {
    const response = await fetch(url, { headers: { accept: "application/json" } });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload?.collections?.products) ? payload.collections.products : [];
  } catch {
    return [];
  }
}

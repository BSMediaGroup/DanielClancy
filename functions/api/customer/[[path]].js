import {
  CUSTOMER_LOGIN_TTL_SECONDS,
  appendCustomerOrder,
  cleanId,
  cleanText,
  clearSessionCookie,
  createCustomerSession,
  customerConfigNeeded,
  customerLoginKey,
  customerOrdersKey,
  customerStorage,
  defaultAddress,
  findCustomerByEmail,
  isEmail,
  maskEmail,
  normalizeAddress,
  normalizeEmail,
  normalizePreferences,
  publicCustomer,
  putCustomerProfile,
  randomToken,
  readCustomerProfile,
  readCustomerSession,
  readJson,
  sha256,
  upsertCustomerByEmail,
  validateAddress
} from "../../_shared/customer-accounts.js";
import { merchOrderStorage, publicOrderStatus, readMerchOrder } from "../../_shared/merch-orders.js";
import { STRIPE_API_VERSION, buildOrigin, getStripeAvailability, parseRequestJson, sanitizeEnv } from "../payments/_shared.js";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const RESEND_API_URL = "https://api.resend.com/emails";
const STRIPE_API_BASE = "https://api.stripe.com/v1";

export async function onRequest(context) {
  const { request, params } = context;
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...JSON_HEADERS, allow: "GET,POST,PATCH,DELETE,OPTIONS" } });

  const path = Array.isArray(params.path) ? params.path.join("/") : String(params.path || "");
  try {
    if (path === "login/start") return requireMethod(request, "POST") || startLogin(context);
    if (path === "login/verify") return ["GET", "POST"].includes(request.method) ? verifyLogin(context) : methodNotAllowed();
    if (path === "logout") return requireMethod(request, "POST") || logout(context);
    if (path === "me" || path === "") return handleMe(context);
    if (path === "profile") return handleProfile(context);
    if (path === "preferences") return handlePreferences(context);
    if (path === "addresses") return handleAddresses(context);
    if (path.startsWith("addresses/")) return handleAddressById(context, path.slice("addresses/".length));
    if (path === "orders") return requireMethod(request, "GET") || handleOrders(context);
    if (path === "stripe/portal") return requireMethod(request, "POST") || createStripePortal(context);
    return json({ ok: false, error: "not_found" }, 404);
  } catch {
    return json({ ok: false, error: "customer_api_unavailable", message: "Customer account service is temporarily unavailable." }, 500);
  }
}

async function startLogin(context) {
  const storage = customerStorage(context.env);
  if (!storage) return json(customerConfigNeeded(), 503);

  const payload = await parseRequestJson(context.request);
  const email = normalizeEmail(payload?.email);
  if (!isEmail(email)) return json({ ok: false, error: "valid_email_required", message: "Enter a valid email address." }, 400);

  const rateLimited = await consumeLoginAttempt(storage, email);
  if (rateLimited) return json({ ok: false, error: "login_rate_limited", message: "Please wait before requesting another sign-in link." }, 429);

  if (!emailProviderConfigured(context.env)) {
    return json(
      {
        ok: false,
        configured: false,
        error: "customer_email_provider_not_configured",
        message: "Customer passwordless login needs RESEND_API_KEY and MAIL_FROM before sign-in links can be sent.",
        requiredEnv: ["RESEND_API_KEY", "MAIL_FROM"]
      },
      503
    );
  }

  const token = randomToken(32);
  const tokenHash = await sha256(token);
  const returnTo = safeReturnPath(payload?.returnTo || payload?.return_to || "/account");
  const now = new Date().toISOString();
  await storage.put(
    customerLoginKey(tokenHash),
    JSON.stringify({
      schemaVersion: 1,
      email,
      returnTo,
      createdAt: now,
      expiresAt: new Date(Date.now() + CUSTOMER_LOGIN_TTL_SECONDS * 1000).toISOString(),
      usedAt: ""
    }),
    { expirationTtl: CUSTOMER_LOGIN_TTL_SECONDS }
  );

  const origin = buildOrigin(context.request);
  const link = `${origin}/api/customer/login/verify?token=${encodeURIComponent(token)}&return_to=${encodeURIComponent(returnTo)}`;
  const sent = await sendMagicLink(context.env, email, link);
  if (!sent.ok) return json({ ok: false, error: sent.error, message: "Customer sign-in email could not be sent." }, sent.status || 502);
  return json({ ok: true, message: "If that email can receive account links, a sign-in link has been sent." });
}

async function verifyLogin(context) {
  const storage = customerStorage(context.env);
  if (!storage) return json(customerConfigNeeded(), 503);

  const url = new URL(context.request.url);
  const payload = context.request.method === "POST" ? await parseRequestJson(context.request) : {};
  const token = cleanText(payload?.token || url.searchParams.get("token"), 500);
  const tokenHash = await sha256(token);
  const challenge = await readJson(storage, customerLoginKey(tokenHash));
  if (!token || !challenge?.email || challenge.usedAt || Date.parse(challenge.expiresAt || "") <= Date.now()) {
    return json({ ok: false, error: "login_link_invalid", message: "This sign-in link is invalid or has expired." }, 400);
  }

  const now = new Date().toISOString();
  await storage.put(customerLoginKey(tokenHash), JSON.stringify({ ...challenge, usedAt: now }), { expirationTtl: 60 });
  const profile = await upsertCustomerByEmail(storage, challenge.email, { lastLoginAt: now });
  const session = await createCustomerSession(storage, context.request, context.env, profile);
  const headers = { "set-cookie": session.cookie };
  const returnTo = safeReturnPath(challenge.returnTo || url.searchParams.get("return_to") || "/account");
  if (context.request.method === "GET") {
    return new Response(null, {
      status: 302,
      headers: {
        location: `${buildOrigin(context.request)}${returnTo}`,
        ...headers
      }
    });
  }
  return json({ ok: true, customer: publicCustomer(profile) }, 200, headers);
}

async function logout(context) {
  const { storage, session } = await readCustomerSession(context.request, context.env);
  if (storage && session && typeof storage.delete === "function") {
    const cookie = context.request.headers.get("cookie") || "";
    const value = /(?:^|;\s*)dc_customer_session=([^;]+)/.exec(cookie)?.[1] || "";
    if (value) await storage.delete(`customer:session:${await sha256(decodeURIComponent(value))}`);
  }
  return json({ ok: true }, 200, { "set-cookie": clearSessionCookie(context.request, context.env) });
}

async function handleMe(context) {
  if (context.request.method !== "GET") return methodNotAllowed();
  const storage = customerStorage(context.env);
  if (!storage) return json(customerConfigNeeded(), 503);
  const { profile } = await readCustomerSession(context.request, context.env);
  if (!profile) return json({ ok: true, authenticated: false, customer: null });
  return json({ ok: true, authenticated: true, customer: publicCustomer(profile), defaultAddress: defaultAddress(profile) });
}

async function handleProfile(context) {
  const session = await requireCustomer(context);
  if (session.response) return session.response;
  if (context.request.method !== "PATCH") return methodNotAllowed();
  const payload = await parseRequestJson(context.request);
  const now = new Date().toISOString();
  const profile = await putCustomerProfile(session.storage, {
    ...session.profile,
    displayName: cleanText(payload?.displayName || payload?.display_name, 120),
    avatarUrl: /^https:\/\//i.test(cleanText(payload?.avatarUrl || payload?.avatar_url, 1000)) ? cleanText(payload?.avatarUrl || payload?.avatar_url, 1000) : "",
    phone: cleanText(payload?.phone, 60),
    updatedAt: now
  });
  return json({ ok: true, customer: publicCustomer(profile) });
}

async function handlePreferences(context) {
  const session = await requireCustomer(context);
  if (session.response) return session.response;
  if (context.request.method !== "PATCH") return methodNotAllowed();
  const payload = await parseRequestJson(context.request);
  const preferences = normalizePreferences(payload?.contactPreferences || payload?.preferences || payload);
  const profile = await putCustomerProfile(session.storage, {
    ...session.profile,
    marketingOptIn: Boolean(payload?.marketingOptIn || payload?.marketing_opt_in || preferences.marketing),
    contactPreferences: preferences,
    updatedAt: new Date().toISOString()
  });
  return json({ ok: true, customer: publicCustomer(profile) });
}

async function handleAddresses(context) {
  const session = await requireCustomer(context);
  if (session.response) return session.response;
  if (context.request.method === "GET") return json({ ok: true, addresses: publicCustomer(session.profile).addresses });
  if (context.request.method !== "POST") return methodNotAllowed();
  const payload = await parseRequestJson(context.request);
  const validation = validateAddress(payload?.address || payload);
  if (!validation.ok) return json(validation, 400);
  const existing = session.profile.addresses || [];
  const nextAddress = { ...validation.address, isDefault: validation.address.isDefault || existing.length === 0 };
  const addresses = normalizeAddressList([...existing.map((address) => ({ ...address, isDefault: nextAddress.isDefault ? false : address.isDefault })), nextAddress]);
  const profile = await putCustomerProfile(session.storage, { ...session.profile, addresses, updatedAt: new Date().toISOString() });
  return json({ ok: true, addresses: publicCustomer(profile).addresses });
}

async function handleAddressById(context, id) {
  const session = await requireCustomer(context);
  if (session.response) return session.response;
  const addressId = cleanId(id);
  if (context.request.method === "DELETE") {
    const remaining = normalizeAddressList(session.profile.addresses.filter((address) => address.id !== addressId));
    const profile = await putCustomerProfile(session.storage, { ...session.profile, addresses: remaining, updatedAt: new Date().toISOString() });
    return json({ ok: true, addresses: publicCustomer(profile).addresses });
  }
  if (context.request.method !== "PATCH") return methodNotAllowed();
  const payload = await parseRequestJson(context.request);
  const current = session.profile.addresses.find((address) => address.id === addressId);
  if (!current) return json({ ok: false, error: "address_not_found" }, 404);
  const validation = validateAddress({ ...current, ...(payload?.address || payload), id: addressId, updatedAt: new Date().toISOString() });
  if (!validation.ok) return json(validation, 400);
  const addresses = normalizeAddressList(
    session.profile.addresses.map((address) =>
      address.id === addressId
        ? validation.address
        : { ...address, isDefault: validation.address.isDefault ? false : address.isDefault }
    )
  );
  const profile = await putCustomerProfile(session.storage, { ...session.profile, addresses, updatedAt: new Date().toISOString() });
  return json({ ok: true, addresses: publicCustomer(profile).addresses });
}

async function handleOrders(context) {
  const session = await requireCustomer(context);
  if (session.response) return session.response;
  const orderStorage = merchOrderStorage(context.env);
  if (!orderStorage) {
    return json({
      ok: false,
      configured: false,
      error: "merch_order_storage_not_configured",
      message: "DC_MERCH_ORDERS_KV is required before customer order history can load.",
      requiredBinding: "DC_MERCH_ORDERS_KV",
      orders: []
    }, 503);
  }
  const index = await readJson(session.storage, customerOrdersKey(session.profile.id));
  const ids = Array.isArray(index?.orderIds) ? index.orderIds.map(cleanId).filter(Boolean).slice(0, 50) : [];
  const orders = [];
  for (const id of ids) {
    const order = await readMerchOrder(orderStorage, id);
    if (orderBelongsToCustomer(order, session.profile)) orders.push(publicOrderStatus(order));
  }
  return json({ ok: true, configured: true, orders });
}

async function createStripePortal(context) {
  const session = await requireCustomer(context);
  if (session.response) return session.response;
  const availability = getStripeAvailability(context.env);
  if (!availability.available) return json({ ok: false, error: "stripe_not_configured", message: availability.message }, 503);
  const stripeCustomerId = await ensureStripeCustomer(context.env, session.storage, session.profile);
  if (!stripeCustomerId.ok) return json(stripeCustomerId, stripeCustomerId.status || 502);

  const params = new URLSearchParams();
  params.set("customer", stripeCustomerId.id);
  params.set("return_url", `${buildOrigin(context.request)}/account/payments`);
  const response = await stripeFetch(context.env, "/billing_portal/sessions", params);
  if (!response.ok || !response.body?.url) {
    return json({
      ok: false,
      error: "stripe_customer_portal_not_configured",
      message: "Stripe Customer Portal is not configured for this Stripe account yet."
    }, response.status || 503);
  }
  return json({ ok: true, url: response.body.url });
}

export async function ensureStripeCustomer(env, storage, profile) {
  const current = cleanId(profile?.stripeCustomerId);
  if (current) return { ok: true, id: current };
  const params = new URLSearchParams();
  params.set("email", profile.email);
  params.set("name", profile.displayName || profile.email);
  params.set("metadata[danielclancy_customer_id]", profile.id);
  const response = await stripeFetch(env, "/customers", params);
  if (!response.ok || !response.body?.id) return { ok: false, status: response.status, error: "stripe_customer_create_failed", message: "Stripe customer mapping could not be created." };
  const updated = await putCustomerProfile(storage, { ...profile, stripeCustomerId: response.body.id, updatedAt: new Date().toISOString() });
  return { ok: true, id: updated.stripeCustomerId };
}

async function requireCustomer(context) {
  const storage = customerStorage(context.env);
  if (!storage) return { response: json(customerConfigNeeded(), 503) };
  const { profile } = await readCustomerSession(context.request, context.env);
  if (!profile) return { response: json({ ok: false, error: "customer_login_required", message: "Sign in before managing this customer account." }, 401) };
  return { storage, profile };
}

async function sendMagicLink(env, email, link) {
  const apiKey = sanitizeEnv(env?.RESEND_API_KEY, 200);
  const from = sanitizeEnv(env?.MAIL_FROM, 200);
  if (!apiKey || !from) return { ok: false, error: "customer_email_provider_not_configured", status: 503 };
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your DanielClancy.net account link",
      text: `Open this link to sign in to your DanielClancy.net customer account. It expires in 15 minutes.\n\n${link}`,
      html: `<p>Open this link to sign in to your DanielClancy.net customer account. It expires in 15 minutes.</p><p><a href="${htmlEscape(link)}">Sign in to DanielClancy.net</a></p>`
    })
  });
  return response.ok ? { ok: true } : { ok: false, error: "customer_email_send_failed", status: response.status };
}

function emailProviderConfigured(env) {
  return Boolean(sanitizeEnv(env?.RESEND_API_KEY, 200) && sanitizeEnv(env?.MAIL_FROM, 200));
}

async function consumeLoginAttempt(storage, email) {
  const key = `customer:rate:login:${normalizeEmail(email)}`;
  const current = Number(await storage.get(key)) || 0;
  if (current >= 5) return true;
  await storage.put(key, String(current + 1), { expirationTtl: 60 * 10 });
  return false;
}

function normalizeAddressList(addresses) {
  const normalized = addresses.map(normalizeAddress).filter((address) => address.name && address.address1).slice(0, 8);
  if (!normalized.length) return [];
  const defaultId = normalized.find((address) => address.isDefault)?.id || normalized[0].id;
  return normalized.map((address) => ({ ...address, isDefault: address.id === defaultId }));
}

function orderBelongsToCustomer(order, profile) {
  if (!order) return false;
  if (order.customer?.customerId && order.customer.customerId === profile.id) return true;
  return normalizeEmail(order.recipient?.email) === profile.email;
}

async function stripeFetch(env, path, params) {
  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${sanitizeEnv(env?.STRIPE_SECRET_KEY, 200)}`,
      "content-type": "application/x-www-form-urlencoded",
      "stripe-version": STRIPE_API_VERSION
    },
    body: params.toString()
  });
  return { ok: response.ok, status: response.status, body: await response.json().catch(() => null) };
}

function safeReturnPath(value) {
  const path = cleanText(value, 300);
  if (!path.startsWith("/") || path.startsWith("//")) return "/account";
  if (/^\/api\//i.test(path)) return "/account";
  return path;
}

function methodNotAllowed() {
  return json({ ok: false, error: "method_not_allowed" }, 405);
}

function requireMethod(request, method) {
  return request.method === method ? null : methodNotAllowed();
}

function json(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), { status, headers: { ...JSON_HEADERS, ...extraHeaders } });
}

function htmlEscape(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

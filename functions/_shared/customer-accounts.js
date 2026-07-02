export const CUSTOMER_PROFILE_PREFIX = "customer:profile:";
export const CUSTOMER_EMAIL_PREFIX = "customer:email:";
export const CUSTOMER_SESSION_PREFIX = "customer:session:";
export const CUSTOMER_LOGIN_PREFIX = "customer:login:";
export const CUSTOMER_ORDERS_PREFIX = "customer:orders:";
export const CUSTOMER_RECENT_PREFIX = "customer:index:recent:";
export const CUSTOMER_STRIPE_PREFIX = "customer:stripe:";

export const CUSTOMER_SESSION_COOKIE = "dc_customer_session";
export const CUSTOMER_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
export const CUSTOMER_LOGIN_TTL_SECONDS = 60 * 15;

export function customerStorage(env) {
  const binding = env?.DC_CUSTOMERS_KV;
  return binding && typeof binding.get === "function" && typeof binding.put === "function" ? binding : null;
}

export function customerConfigNeeded() {
  return {
    ok: false,
    configured: false,
    error: "customer_storage_not_configured",
    message: "DC_CUSTOMERS_KV is required before customer accounts can read or write account state.",
    requiredBinding: "DC_CUSTOMERS_KV"
  };
}

export function customerProfileKey(customerId) {
  return `${CUSTOMER_PROFILE_PREFIX}${cleanId(customerId)}`;
}

export function customerEmailKey(email) {
  return `${CUSTOMER_EMAIL_PREFIX}${normalizeEmail(email)}`;
}

export function customerSessionKey(sessionIdHash) {
  return `${CUSTOMER_SESSION_PREFIX}${cleanId(sessionIdHash)}`;
}

export function customerLoginKey(loginTokenHash) {
  return `${CUSTOMER_LOGIN_PREFIX}${cleanId(loginTokenHash)}`;
}

export function customerOrdersKey(customerId) {
  return `${CUSTOMER_ORDERS_PREFIX}${cleanId(customerId)}`;
}

export function customerRecentKey(profile) {
  const created = Date.parse(profile?.createdAt || "") || Date.now();
  return `${CUSTOMER_RECENT_PREFIX}${String(created).padStart(13, "0")}:${cleanId(profile?.id)}`;
}

export function customerStripeKey(stripeCustomerId) {
  return `${CUSTOMER_STRIPE_PREFIX}${cleanId(stripeCustomerId)}`;
}

export function normalizeEmail(value) {
  return cleanText(value, 180).toLowerCase();
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

export function cleanText(value, maxLength = 500) {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function cleanId(value) {
  return cleanText(value, 180).replace(/[^a-zA-Z0-9:_-]/g, "").slice(0, 180);
}

export function maskEmail(value) {
  const email = normalizeEmail(value);
  const [name, domain] = email.split("@");
  if (!name || !domain) return "";
  return `${name.length <= 2 ? `${name[0] || ""}*` : `${name.slice(0, 2)}***`}@${domain}`;
}

export function randomToken(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

export async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value || "")));
  return base64Url(new Uint8Array(digest));
}

export function parseCookies(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        if (index < 0) return [part, ""];
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

export function isHttps(request) {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0].trim() === "https";
  return new URL(request.url).protocol === "https:";
}

export function sessionCookie(request, env, sessionId, maxAge = CUSTOMER_SESSION_TTL_SECONDS) {
  const attributes = [
    `${CUSTOMER_SESSION_COOKIE}=${encodeURIComponent(sessionId || "")}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`
  ];
  const domain = sessionCookieDomain(request, env);
  if (domain) attributes.push(`Domain=${domain}`);
  if (isHttps(request)) attributes.push("Secure");
  return attributes.join("; ");
}

export function clearSessionCookie(request, env) {
  return sessionCookie(request, env, "", 0);
}

export function sessionCookieDomain(request, env) {
  const configured = cleanText(env?.DC_CUSTOMER_COOKIE_DOMAIN || env?.DC_AUTH_COOKIE_DOMAIN, 180);
  if (configured) return configured;
  const hostname = new URL(request.url).hostname.toLowerCase();
  return hostname === "danielclancy.net" || hostname === "admin.danielclancy.net" ? ".danielclancy.net" : "";
}

export async function readCustomerSession(request, env) {
  const storage = customerStorage(env);
  if (!storage) return { storage: null, session: null, profile: null };
  const sessionId = parseCookies(request)[CUSTOMER_SESSION_COOKIE];
  if (!sessionId) return { storage, session: null, profile: null };
  const sessionIdHash = await sha256(sessionId);
  const session = await readJson(storage, customerSessionKey(sessionIdHash));
  if (!session?.customerId || Date.parse(session.expiresAt || "") <= Date.now()) {
    return { storage, session: null, profile: null };
  }
  const profile = await readCustomerProfile(storage, session.customerId);
  if (!profile || profile.status === "disabled") return { storage, session: null, profile: null };
  return { storage, session, profile };
}

export async function createCustomerSession(storage, request, env, profile) {
  const sessionId = randomToken(32);
  const sessionIdHash = await sha256(sessionId);
  const now = new Date().toISOString();
  const session = {
    schemaVersion: 1,
    customerId: profile.id,
    createdAt: now,
    updatedAt: now,
    expiresAt: new Date(Date.now() + CUSTOMER_SESSION_TTL_SECONDS * 1000).toISOString(),
    lastSeenAt: now
  };
  await storage.put(customerSessionKey(sessionIdHash), JSON.stringify(session), { expirationTtl: CUSTOMER_SESSION_TTL_SECONDS });
  return { session, cookie: sessionCookie(request, env, sessionId) };
}

export async function readCustomerProfile(storage, customerId) {
  const profile = await readJson(storage, customerProfileKey(customerId));
  return profile ? normalizeProfile(profile) : null;
}

export async function findCustomerByEmail(storage, email) {
  const customerId = await storage.get(customerEmailKey(email));
  return customerId ? readCustomerProfile(storage, customerId) : null;
}

export async function upsertCustomerByEmail(storage, email, patch = {}) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await findCustomerByEmail(storage, normalizedEmail);
  const now = new Date().toISOString();
  const profile = normalizeProfile({
    ...(existing || {}),
    ...patch,
    id: existing?.id || `cust_${crypto.randomUUID()}`,
    email: normalizedEmail,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    lastLoginAt: patch.lastLoginAt || existing?.lastLoginAt || now
  });
  await putCustomerProfile(storage, profile);
  await storage.put(customerEmailKey(normalizedEmail), profile.id);
  return profile;
}

export async function putCustomerProfile(storage, profile) {
  const normalized = normalizeProfile(profile);
  await storage.put(customerProfileKey(normalized.id), JSON.stringify(normalized));
  await storage.put(customerEmailKey(normalized.email), normalized.id);
  await storage.put(customerRecentKey(normalized), normalized.id);
  if (normalized.stripeCustomerId) await storage.put(customerStripeKey(normalized.stripeCustomerId), normalized.id);
  return normalized;
}

export function normalizeProfile(raw = {}) {
  const now = new Date().toISOString();
  const roles = normalizeRoles(raw.roles);
  const adminAccess = Boolean(raw.adminAccess || raw.admin_access || roles.includes("admin"));
  const normalizedRoles = adminAccess && !roles.includes("admin") ? [...roles, "admin"] : roles;
  return {
    schemaVersion: Number(raw.schemaVersion) || 1,
    id: cleanId(raw.id) || `cust_${crypto.randomUUID()}`,
    email: normalizeEmail(raw.email),
    displayName: cleanText(raw.displayName || raw.display_name, 120),
    avatarUrl: cleanUrl(raw.avatarUrl || raw.avatar_url),
    phone: cleanText(raw.phone, 60),
    status: ["active", "disabled"].includes(cleanText(raw.status, 40)) ? cleanText(raw.status, 40) : "active",
    marketingOptIn: Boolean(raw.marketingOptIn || raw.marketing_opt_in),
    contactPreferences: normalizePreferences(raw.contactPreferences || raw.preferences || raw.contact_preferences),
    addresses: normalizeAddresses(raw.addresses),
    stripeCustomerId: cleanId(raw.stripeCustomerId || raw.stripe_customer_id),
    roles: normalizedRoles,
    adminAccess,
    adminAccessUpdatedAt: cleanText(raw.adminAccessUpdatedAt || raw.admin_access_updated_at, 80),
    adminAccessUpdatedBy: cleanText(raw.adminAccessUpdatedBy || raw.admin_access_updated_by, 180),
    adminAccessRevokedAt: cleanText(raw.adminAccessRevokedAt || raw.admin_access_revoked_at, 80),
    adminAccessRevokedBy: cleanText(raw.adminAccessRevokedBy || raw.admin_access_revoked_by, 180),
    adminNotes: cleanText(raw.adminNotes || raw.admin_notes, 1000),
    metadata: safeMetadata(raw.metadata),
    createdAt: cleanText(raw.createdAt || raw.created_at, 80) || now,
    updatedAt: cleanText(raw.updatedAt || raw.updated_at, 80) || now,
    lastLoginAt: cleanText(raw.lastLoginAt || raw.last_login_at, 80)
  };
}

export function normalizeRoles(raw) {
  const values = Array.isArray(raw) ? raw : [];
  return Array.from(new Set(values.map((role) => cleanText(role, 40).toLowerCase()).filter(Boolean))).slice(0, 12);
}

export function publicCustomer(profile) {
  if (!profile) return null;
  const normalized = normalizeProfile(profile);
  return {
    id: normalized.id,
    email: normalized.email,
    displayName: normalized.displayName,
    avatarUrl: normalized.avatarUrl,
    phone: normalized.phone,
    marketingOptIn: normalized.marketingOptIn,
    contactPreferences: normalized.contactPreferences,
    addresses: normalized.addresses,
    stripeCustomerMapped: Boolean(normalized.stripeCustomerId),
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
    lastLoginAt: normalized.lastLoginAt,
    status: normalized.status
  };
}

export function normalizePreferences(raw = {}) {
  return {
    marketing: Boolean(raw.marketing),
    productDrops: Boolean(raw.productDrops || raw.product_drops),
    orderUpdates: raw.orderUpdates === false || raw.order_updates === false ? false : true,
    newsletter: Boolean(raw.newsletter)
  };
}

export function normalizeAddress(raw = {}) {
  const id = cleanId(raw.id) || `addr_${crypto.randomUUID()}`;
  const countryCode = cleanText(raw.countryCode || raw.country_code || raw.country, 2).toUpperCase();
  const region = cleanText(raw.region || raw.state || raw.state_code, 80);
  return {
    id,
    label: cleanText(raw.label, 80),
    name: cleanText(raw.name, 140),
    address1: cleanText(raw.address1, 180),
    address2: cleanText(raw.address2, 180),
    city: cleanText(raw.city, 120),
    region,
    postalCode: cleanText(raw.postalCode || raw.postal_code || raw.zip, 40),
    countryCode,
    phone: cleanText(raw.phone, 60),
    isDefault: Boolean(raw.isDefault || raw.is_default),
    createdAt: cleanText(raw.createdAt || raw.created_at, 80) || new Date().toISOString(),
    updatedAt: cleanText(raw.updatedAt || raw.updated_at, 80) || new Date().toISOString()
  };
}

export function validateAddress(address) {
  const normalized = normalizeAddress(address);
  if (!normalized.name || !normalized.address1 || !normalized.city || !normalized.postalCode || !/^[A-Z]{2}$/.test(normalized.countryCode)) {
    return { ok: false, error: "address_required_fields_missing", message: "Name, address line 1, city, postal code, and a two-letter country code are required." };
  }
  if (["US", "AU", "CA"].includes(normalized.countryCode) && !normalized.region) {
    return { ok: false, error: "address_region_required", message: "Region/state is required for US, AU, and CA delivery addresses." };
  }
  return { ok: true, address: normalized };
}

export function normalizeAddresses(raw) {
  const addresses = Array.isArray(raw) ? raw.map(normalizeAddress).filter((address) => address.name && address.address1) : [];
  if (!addresses.length) return [];
  const defaultId = addresses.find((address) => address.isDefault)?.id || addresses[0].id;
  return addresses.slice(0, 8).map((address) => ({ ...address, isDefault: address.id === defaultId }));
}

export function defaultAddress(profile) {
  return normalizeProfile(profile).addresses.find((address) => address.isDefault) || null;
}

export async function appendCustomerOrder(storage, customerId, orderId) {
  if (!storage || !customerId || !orderId) return;
  const key = customerOrdersKey(customerId);
  const current = await readJson(storage, key);
  const orderIds = Array.from(new Set([cleanId(orderId), ...(Array.isArray(current?.orderIds) ? current.orderIds.map(cleanId) : [])])).filter(Boolean).slice(0, 100);
  await storage.put(key, JSON.stringify({ schemaVersion: 1, customerId: cleanId(customerId), orderIds, updatedAt: new Date().toISOString() }));
}

export async function readJson(storage, key) {
  if (!storage || !key) return null;
  const raw = await storage.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function base64Url(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function cleanUrl(value) {
  const url = cleanText(value, 1000);
  if (!url) return "";
  return /^https:\/\//i.test(url) ? url : "";
}

function safeMetadata(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return Object.fromEntries(
    Object.entries(raw)
      .map(([key, value]) => [cleanText(key, 80), cleanText(value, 240)])
      .filter(([key]) => Boolean(key))
      .slice(0, 20)
  );
}

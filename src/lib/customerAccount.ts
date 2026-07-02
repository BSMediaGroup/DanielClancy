export type CustomerAddress = {
  id: string;
  label?: string;
  name: string;
  address1: string;
  address2?: string;
  city: string;
  region?: string;
  postalCode: string;
  countryCode: string;
  phone?: string;
  isDefault?: boolean;
};

export type CustomerPreferences = {
  marketing: boolean;
  productDrops: boolean;
  orderUpdates: boolean;
  newsletter: boolean;
};

export type CustomerProfile = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  phone: string;
  marketingOptIn: boolean;
  contactPreferences: CustomerPreferences;
  addresses: CustomerAddress[];
  stripeCustomerMapped: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  status: string;
};

export type CustomerSessionResponse = {
  ok: boolean;
  authenticated: boolean;
  configured?: boolean;
  customer: CustomerProfile | null;
  defaultAddress?: CustomerAddress | null;
  error?: string;
  message?: string;
  requiredBinding?: string;
};

export type CustomerOrder = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  actionNeeded?: boolean;
  message: string;
  items: Array<{ title: string; variantName: string; quantity: number }>;
};

export type CustomerOAuthProvider = "github" | "google" | "twitter";

async function readJson(response: Response) {
  return response.json().catch(() => null);
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: { accept: "application/json", ...(init.body ? { "content-type": "application/json" } : {}), ...(init.headers || {}) },
    cache: "no-store",
    ...init,
  });
  const payload = await readJson(response);
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.message || payload?.error || "Customer account request failed.");
  }
  return payload as T;
}

function adminAuthOrigin() {
  return String(import.meta.env.VITE_ADMIN_AUTH_ORIGIN || "https://admin.danielclancy.net").replace(/\/+$/g, "");
}

function adminAuthUrl(path: string) {
  return `${adminAuthOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

function safeReturnPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/api/") ? value : "/account";
}

function absolutePublicReturnTo(returnTo: string) {
  const safePath = safeReturnPath(returnTo);
  if (typeof window === "undefined") return safePath;
  return new URL(safePath, window.location.origin).toString();
}

export async function fetchCustomerMe(signal?: AbortSignal): Promise<CustomerSessionResponse> {
  const response = await fetch("/api/customer/me", { credentials: "include", headers: { accept: "application/json" }, cache: "no-store", signal });
  const payload = await readJson(response);
  if (!response.ok) {
    return {
      ok: false,
      authenticated: false,
      customer: null,
      configured: Boolean(payload?.configured),
      error: payload?.error || "customer_unavailable",
      message: payload?.message || "Customer account service is unavailable.",
      requiredBinding: payload?.requiredBinding,
    };
  }
  return payload as CustomerSessionResponse;
}

export function customerOAuthStartUrl(provider: CustomerOAuthProvider, returnTo = "/account") {
  const url = new URL(adminAuthUrl(`/api/auth/oauth/${provider}/start`));
  url.searchParams.set("return_to", absolutePublicReturnTo(returnTo));
  return url.toString();
}

export function startCustomerOAuth(provider: CustomerOAuthProvider, returnTo = "/account") {
  window.location.assign(customerOAuthStartUrl(provider, returnTo));
}

export async function loginCustomerWithPassword(email: string, password: string) {
  return requestJson<{ ok: true; session?: unknown }>(adminAuthUrl("/api/auth/login"), {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function requestCustomerSignup(email: string, password: string) {
  return requestJson<{ ok: true; message?: string; session?: unknown }>(adminAuthUrl("/api/auth/signup"), {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function startCustomerLogin(email: string, returnTo = "/account") {
  return requestJson<{ ok: true; message: string }>("/api/customer/login/start", {
    method: "POST",
    body: JSON.stringify({ email, returnTo }),
  });
}

export async function logoutCustomer() {
  return requestJson<{ ok: true }>("/api/customer/logout", { method: "POST" });
}

export async function updateCustomerProfile(profile: { displayName: string; avatarUrl: string; phone: string }) {
  return requestJson<{ ok: true; customer: CustomerProfile }>("/api/customer/profile", {
    method: "PATCH",
    body: JSON.stringify(profile),
  });
}

export function notifyCustomerSessionUpdated(customer?: CustomerProfile | null) {
  window.dispatchEvent(new CustomEvent("danielclancy:customer-session-updated", { detail: { customer } }));
}

export async function updateCustomerPreferences(preferences: CustomerPreferences & { marketingOptIn: boolean }) {
  return requestJson<{ ok: true; customer: CustomerProfile }>("/api/customer/preferences", {
    method: "PATCH",
    body: JSON.stringify(preferences),
  });
}

export async function saveCustomerAddress(address: Partial<CustomerAddress>) {
  const isExisting = Boolean(address.id);
  return requestJson<{ ok: true; addresses: CustomerAddress[] }>(isExisting ? `/api/customer/addresses/${encodeURIComponent(address.id || "")}` : "/api/customer/addresses", {
    method: isExisting ? "PATCH" : "POST",
    body: JSON.stringify(address),
  });
}

export async function deleteCustomerAddress(id: string) {
  return requestJson<{ ok: true; addresses: CustomerAddress[] }>(`/api/customer/addresses/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function fetchCustomerOrders(signal?: AbortSignal) {
  return requestJson<{ ok: true; orders: CustomerOrder[] }>("/api/customer/orders", { signal });
}

export async function openStripeCustomerPortal() {
  return requestJson<{ ok: true; url: string }>("/api/customer/stripe/portal", { method: "POST" });
}

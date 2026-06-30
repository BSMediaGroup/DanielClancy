import type { MerchProduct, MerchVariant } from "./merch";

export type MerchCartItem = {
  productId: string;
  slug: string;
  variantId: string;
  quantity: number;
};

export type ServerCartItem = MerchCartItem & {
  title: string;
  variantName: string;
  sku?: string;
  unitAmount: number;
  lineAmount: number;
  currency: string;
  image?: string;
};

export type ServerCartSummary = {
  items: ServerCartItem[];
  subtotalAmount: number;
  subtotalText: string;
  currency: string;
  itemCount: number;
};

export type ShippingRecipient = {
  country_code: string;
  state_code: string;
  city: string;
  zip: string;
  address1: string;
  address2: string;
};

export type ShippingOption = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  amountText: string;
  minDeliveryDays?: number | null;
  maxDeliveryDays?: number | null;
};

const CART_STORAGE_KEY = "danielclancy.shop.cart.v1";
const MAX_QUANTITY = 10;

export function loadCart(): MerchCartItem[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.map(normalizeCartItem).filter(isMerchCartItem) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: MerchCartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.map(normalizeCartItem).filter(isMerchCartItem)));
  window.dispatchEvent(new CustomEvent("danielclancy:cart-updated"));
}

export function clearCart() {
  saveCart([]);
}

export function cartCount(items: MerchCartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function addCartItem(items: MerchCartItem[], product: MerchProduct, variant: MerchVariant, quantity: number) {
  const productId = product.printfulProductId || product.id;
  const variantId = variant.id || variant.variantId || "";
  const nextQuantity = clampQuantity(quantity);
  const key = cartKey(productId, variantId);
  const existing = items.find((item) => cartKey(item.productId, item.variantId) === key);
  if (existing) {
    return items.map((item) =>
      cartKey(item.productId, item.variantId) === key
        ? { ...item, quantity: clampQuantity(item.quantity + nextQuantity) }
        : item,
    );
  }
  return [
    ...items,
    {
      productId,
      slug: product.slug,
      variantId,
      quantity: nextQuantity,
    },
  ];
}

export function updateCartQuantity(items: MerchCartItem[], productId: string, variantId: string, quantity: number) {
  const normalizedQuantity = clampQuantity(quantity);
  return items.map((item) => (cartKey(item.productId, item.variantId) === cartKey(productId, variantId) ? { ...item, quantity: normalizedQuantity } : item));
}

export function removeCartItem(items: MerchCartItem[], productId: string, variantId: string) {
  return items.filter((item) => cartKey(item.productId, item.variantId) !== cartKey(productId, variantId));
}

export async function validateCart(items: MerchCartItem[], signal?: AbortSignal) {
  const response = await fetch("/api/merch/cart/validate", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ items }),
    signal,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.message || payload?.error || "Cart validation failed.");
  }
  return payload.cart as ServerCartSummary;
}

export async function estimateShipping(items: MerchCartItem[], recipient: ShippingRecipient) {
  const response = await fetch("/api/merch/cart/shipping", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ items, recipient }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.message || payload?.error || "Shipping estimate failed.");
  }
  return payload.shippingOptions as ShippingOption[];
}

export async function startStripeMerchCheckout(items: MerchCartItem[], shippingOption: ShippingOption) {
  const response = await fetch("/api/merch/cart/checkout", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ items, shippingOption }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok || !payload.url) {
    throw new Error(payload?.message || payload?.error || "Checkout could not be started.");
  }
  return payload as { url: string; sessionId?: string; intentId?: string };
}

function normalizeCartItem(raw: Partial<MerchCartItem>) {
  const productId = String(raw.productId || "").trim();
  const slug = String(raw.slug || "").trim();
  const variantId = String(raw.variantId || "").trim();
  if (!productId || !variantId) return null;
  return {
    productId,
    slug,
    variantId,
    quantity: clampQuantity(raw.quantity),
  };
}

function isMerchCartItem(item: MerchCartItem | null): item is MerchCartItem {
  return Boolean(item);
}

function clampQuantity(value: unknown) {
  const quantity = Number.parseInt(String(value || "1"), 10);
  return Math.max(1, Math.min(MAX_QUANTITY, Number.isFinite(quantity) ? quantity : 1));
}

function cartKey(productId: string, variantId: string) {
  return `${productId}:${variantId}`;
}

export type MerchVariant = {
  id: string;
  variantId?: string;
  name?: string;
  sku?: string;
  retailPrice?: string;
  currency?: string;
  status?: string;
  files?: Array<{ id?: string; type?: string; url?: string; filename?: string }>;
};

export type MerchProduct = {
  id: string;
  printfulProductId: string;
  externalId?: string;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string;
  images: string[];
  status?: string;
  availability?: string;
  featured?: boolean;
  visibility?: string;
  priceRange?: { min: number; max: number; currency?: string; text: string } | null;
  variantCount: number;
  imageCount: number;
  variants: MerchVariant[];
  updatedAt?: string;
  overrideUpdatedAt?: string;
  source?: string;
  altText?: string;
};

export type MerchFeed = {
  ok: boolean;
  configured: boolean;
  error?: string;
  message?: string;
  source?: string;
  count?: number;
  products: MerchProduct[];
};

export type MerchDetail = {
  ok: boolean;
  configured: boolean;
  error?: string;
  message?: string;
  product?: MerchProduct;
};

export async function fetchMerchProducts(signal?: AbortSignal): Promise<MerchFeed> {
  const response = await fetch("/api/merch/products", {
    headers: { accept: "application/json" },
    cache: "no-store",
    signal,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    return {
      ok: false,
      configured: Boolean(payload?.configured),
      error: payload?.error || "merch_products_unavailable",
      message: payload?.message || "Merch products are unavailable.",
      products: [],
    };
  }
  return {
    ok: true,
    configured: true,
    source: payload.source,
    count: payload.count,
    products: Array.isArray(payload.products) ? payload.products : [],
  };
}

export async function fetchMerchProduct(lookup: string, signal?: AbortSignal): Promise<MerchDetail> {
  const response = await fetch(`/api/merch/products/${encodeURIComponent(lookup)}`, {
    headers: { accept: "application/json" },
    cache: "no-store",
    signal,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    return {
      ok: false,
      configured: Boolean(payload?.configured),
      error: payload?.error || "product_not_found",
      message: payload?.message || "No public product matches this route.",
    };
  }
  return {
    ok: true,
    configured: true,
    product: payload.product,
  };
}

export function productPath(product: MerchProduct) {
  const category = slugify(product.category || "product");
  return `/products/${category}/${product.slug || product.id}`;
}

export function slugify(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

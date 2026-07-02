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
  categorySlug?: string;
  primaryCategory?: string;
  primaryCategorySlug?: string;
  categories?: MerchCategory[];
  thumbnailUrl?: string;
  images: string[];
  status?: string;
  availability?: string;
  featured?: boolean;
  visibility?: string;
  priceRange?: { min: number; max: number; currency?: string; text: string } | null;
  banners?: MerchBanner[];
  variantCount: number;
  imageCount: number;
  variants: MerchVariant[];
  updatedAt?: string;
  overrideUpdatedAt?: string;
  source?: string;
  altText?: string;
};

export type MerchBanner = {
  label: string;
  slug: string;
  enabled?: boolean;
  sortOrder?: number;
  theme?: string;
};

export type MerchCategory = {
  label: string;
  slug: string;
  source?: string;
  enabled?: boolean;
  locked?: boolean;
  sortOrder?: number;
  description?: string;
};

export type ShopHeroSlide = {
  id: string;
  label?: string;
  src?: string;
  enabled?: boolean;
  sortOrder?: number;
  source?: string;
  set?: string;
};

export type MerchSettings = {
  baseCurrency?: "AUD";
  convertedCurrencyDefault?: string;
  categories?: MerchCategory[];
  banners?: MerchBanner[];
  hero?: {
    activeSet?: string;
    crossfadeIntervalSeconds?: number;
    crossfadeDurationSeconds?: number;
  };
  heroSlides?: ShopHeroSlide[];
};

export type MerchFeed = {
  ok: boolean;
  configured: boolean;
  error?: string;
  message?: string;
  source?: string;
  overrideSource?: "live" | "admin" | "fallback" | "none" | string;
  overrideRevision?: string;
  overrideUpdatedAt?: string;
  overridePublishedAt?: string;
  productOverrideCount?: number;
  bannerCount?: number;
  overrideWarning?: string;
  count?: number;
  settings?: MerchSettings;
  products: MerchProduct[];
};

export type MerchDetail = {
  ok: boolean;
  configured: boolean;
  error?: string;
  message?: string;
  product?: MerchProduct;
  overrideSource?: "live" | "admin" | "fallback" | "none" | string;
  overrideRevision?: string;
  overrideUpdatedAt?: string;
  overridePublishedAt?: string;
  productOverrideCount?: number;
  bannerCount?: number;
  overrideWarning?: string;
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
    overrideSource: payload.overrideSource,
    overrideRevision: payload.overrideRevision,
    overrideUpdatedAt: payload.overrideUpdatedAt,
    overridePublishedAt: payload.overridePublishedAt,
    productOverrideCount: payload.productOverrideCount,
    bannerCount: payload.bannerCount,
    overrideWarning: payload.overrideWarning,
    count: payload.count,
    settings: payload.settings || {},
    products: Array.isArray(payload.products) ? payload.products : [],
  };
}

export async function fetchMerchProduct(lookup: string, signal?: AbortSignal): Promise<MerchDetail> {
  const path = lookup
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const response = await fetch(`/api/merch/products/${path}`, {
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
    overrideSource: payload.overrideSource,
    overrideRevision: payload.overrideRevision,
    overrideUpdatedAt: payload.overrideUpdatedAt,
    overridePublishedAt: payload.overridePublishedAt,
    productOverrideCount: payload.productOverrideCount,
    bannerCount: payload.bannerCount,
    overrideWarning: payload.overrideWarning,
  };
}

export function productPath(product: MerchProduct) {
  const category = product.primaryCategorySlug || product.categorySlug || firstCategorySlug(product) || "all";
  return `/products/${category}/${product.slug || product.id}`;
}

export function productCategoryLabel(product: MerchProduct) {
  return product.primaryCategory || product.category || product.categories?.find((category) => category.slug !== "all")?.label || "All Products";
}

export function productCategorySlug(product: MerchProduct) {
  return product.primaryCategorySlug || product.categorySlug || firstCategorySlug(product) || "all";
}

export function productMatchesCategory(product: MerchProduct, categorySlug: string) {
  const normalized = slugify(categorySlug || "all") || "all";
  if (normalized === "all") return true;
  return (product.categories || []).some((category) => slugify(category.slug || category.label) === normalized);
}

export function productCategories(products: MerchProduct[]) {
  const map = new Map<string, { label: string; slug: string; count: number; source?: string; sortOrder?: number }>();
  map.set("all", { label: "All Products", slug: "all", count: products.length, source: "system", sortOrder: 0 });
  products.forEach((product) => {
    (product.categories || []).forEach((category) => {
      const slug = slugify(category.slug || category.label);
      if (!slug) return;
      const current = map.get(slug) || { label: category.label || slug, slug, count: 0, source: category.source, sortOrder: category.sortOrder || 1000 };
      current.count += 1;
      current.label = current.label || category.label || slug;
      current.source = current.source || category.source;
      current.sortOrder = Math.min(current.sortOrder || 1000, category.sortOrder || 1000);
      map.set(slug, current);
    });
  });
  return Array.from(map.values()).sort((left, right) => (left.sortOrder || 1000) - (right.sortOrder || 1000) || left.label.localeCompare(right.label));
}

function firstCategorySlug(product: MerchProduct) {
  return product.categories?.find((category) => category.slug !== "all")?.slug || product.categories?.[0]?.slug || "";
}

export function slugify(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

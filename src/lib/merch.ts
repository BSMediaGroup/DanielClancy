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
  categories?: Array<{ label: string; slug: string; source?: string; enabled?: boolean; sortOrder?: number }>;
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
  };
}

export function productPath(product: MerchProduct) {
  const category = product.primaryCategorySlug || product.categorySlug || firstCategorySlug(product) || "all";
  return `/products/${category}/${product.slug || product.id}`;
}

export function productCategoryLabel(product: MerchProduct) {
  return product.primaryCategory || product.category || product.categories?.find((category) => category.slug !== "all")?.label || "All";
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
  map.set("all", { label: "All", slug: "all", count: products.length, source: "system", sortOrder: 0 });
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

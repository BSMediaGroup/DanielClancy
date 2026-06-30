import {
  fetchPrintfulProductDetail,
  fetchPrintfulProductList,
  json,
  mergeProductOverrides,
  normalizeLookupKey,
  productLookupKeys,
  publicProducts,
  sanitizePublicProduct
} from "../../../_shared/printful-products.js";

const CACHE_HEADERS = {
  "cache-control": "public, max-age=120, stale-while-revalidate=300"
};
const ERROR_HEADERS = {
  "cache-control": "no-store"
};

export async function onRequest(context) {
  const { request, env, params } = context;
  if (request.method !== "GET") {
    return json({ ok: false, error: "method_not_allowed" }, { status: 405, headers: ERROR_HEADERS });
  }

  const lookup = lookupParam(params);
  const overrides = await loadPublishedOverrides(env);
  try {
    if (!lookup) {
      const result = await fetchPrintfulProductList(env);
      if (!result.ok) {
        return json(
          {
            ok: false,
            configured: Boolean(result.configured),
            error: result.error || "printful_products_unavailable",
            message: result.message || "Printful products are unavailable.",
            products: []
          },
          { status: result.status || 503, headers: ERROR_HEADERS }
        );
      }
      return json(
        {
          ok: true,
          configured: true,
          source: "printful_legacy_sync_products",
          store: safeStore(result.store),
          count: result.products.length,
          products: publicProducts(result.products, overrides),
          overridesConfigured: overrides.length > 0
        },
        { headers: CACHE_HEADERS }
      );
    }

    const result = await fetchPrintfulProductDetail(env, lookup);
    if (!result.ok) {
      return json(
        {
          ok: false,
          configured: Boolean(result.configured),
          error: result.error || "product_not_found",
          message: result.message || "No public Printful product matches this route."
        },
        { status: result.status || 404, headers: ERROR_HEADERS }
      );
    }
    const merged = mergeProductOverrides(result.product, overrides);
    if (!productLookupKeys(merged).includes(normalizeLookupKey(lookup))) {
      return json({ ok: false, configured: true, error: "product_not_found" }, { status: 404, headers: ERROR_HEADERS });
    }
    return json(
      {
        ok: true,
        configured: true,
        source: "printful_legacy_sync_product",
        store: safeStore(result.store),
        product: sanitizePublicProduct(merged),
        overridesConfigured: overrides.length > 0
      },
      { headers: CACHE_HEADERS }
    );
  } catch {
    return json(
      {
        ok: false,
        configured: true,
        error: "printful_products_unavailable",
        message: "Printful products are temporarily unavailable."
      },
      { status: 502, headers: ERROR_HEADERS }
    );
  }
}

function lookupParam(params) {
  const raw = Array.isArray(params.lookup) ? params.lookup.join("/") : String(params.lookup || "");
  return raw.replace(/^\/+|\/+$/g, "");
}

function safeStore(store) {
  return store
    ? {
        id: store.id ?? null,
        name: String(store.name || "").trim(),
        type: String(store.type || "").trim()
      }
    : null;
}

async function loadPublishedOverrides(env) {
  const url = String(
    env?.DANIELCLANCY_ADMIN_PUBLIC_SITE_DATA_URL ||
      env?.VITE_ADMIN_PUBLIC_SITE_DATA_URL ||
      ""
  ).trim();
  if (!url || !/^https?:\/\//i.test(url)) return [];
  try {
    const response = await fetch(url, { headers: { accept: "application/json" } });
    if (!response.ok) return [];
    const payload = await response.json();
    const products = payload?.collections?.products;
    return Array.isArray(products) ? products : [];
  } catch {
    return [];
  }
}

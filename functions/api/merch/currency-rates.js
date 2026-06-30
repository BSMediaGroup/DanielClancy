import { json } from "../../_shared/printful-products.js";

const BASE_CURRENCY = "AUD";
const SUPPORTED = ["AUD", "USD", "CAD", "NZD", "GBP", "EUR", "JPY", "CHF", "SGD", "HKD", "KRW"];
const CACHE_TTL_SECONDS = 60 * 60;
const DEFAULT_RATES_URL = "https://open.er-api.com/v6/latest/AUD";

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "GET") {
    return json({ ok: false, error: "method_not_allowed" }, { status: 405, headers: { "cache-control": "no-store" } });
  }

  const url = cleanUrl(env?.CURRENCY_RATES_API_URL) || DEFAULT_RATES_URL;
  const fetched = await fetchRates(url);
  if (!fetched.ok) {
    return json(
      {
        ok: false,
        configured: Boolean(url),
        error: fetched.error || "currency_rates_unavailable",
        message: "Currency conversion is temporarily unavailable.",
        base: BASE_CURRENCY,
        supported: SUPPORTED
      },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }

  return json(
    {
      ok: true,
      base: BASE_CURRENCY,
      supported: SUPPORTED,
      rates: normalizeRates(fetched.payload),
      source: fetched.source,
      fetchedAt: new Date().toISOString(),
      disclaimer: "Converted prices are estimates for display only. Checkout uses server-validated store currency."
    },
    { headers: { "cache-control": `public, max-age=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS}` } }
  );
}

async function fetchRates(url) {
  try {
    const response = await fetch(url, { headers: { accept: "application/json" } });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload) return { ok: false, error: "currency_rates_fetch_failed" };
    return { ok: true, payload, source: originOnly(url) };
  } catch {
    return { ok: false, error: "currency_rates_fetch_failed" };
  }
}

function normalizeRates(payload = {}) {
  const rawRates = payload.rates || payload.conversion_rates || payload.data?.rates || {};
  const rates = { AUD: 1 };
  SUPPORTED.forEach((code) => {
    const value = Number(rawRates[code]);
    if (Number.isFinite(value) && value > 0) rates[code] = value;
  });
  return rates;
}

function cleanUrl(value) {
  const text = String(value || "").trim();
  return /^https:\/\//i.test(text) ? text : "";
}

function originOnly(value) {
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

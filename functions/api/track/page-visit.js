import { postDanielClancyAlert } from "../../_shared/alert-sender.js";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

function json(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), { status, headers: { ...JSON_HEADERS, ...headers } });
}

function cleanText(value, maxLength = 500) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function safePath(value) {
  const path = cleanText(value || "/", 500);
  if (!path.startsWith("/")) return "/";
  return path.split("#")[0].split("?")[0] || "/";
}

function referrerHost(value) {
  const text = cleanText(value, 500);
  if (!text) return "";
  try {
    return new URL(text).hostname.replace(/^www\./, "");
  } catch {
    return text.replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "");
  }
}

function detectBrowser(userAgent) {
  const ua = String(userAgent || "");
  if (/Edg\//i.test(ua)) return "Edge";
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return "Chrome";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return "Safari";
  if (!ua) return "";
  return "Other";
}

function detectDevice(userAgent) {
  const ua = String(userAgent || "");
  if (/Mobi|Android|iPhone/i.test(ua)) return "Mobile";
  if (/iPad|Tablet/i.test(ua)) return "Tablet";
  if (!ua) return "";
  return "Desktop";
}

function detectPlatform(userAgent) {
  const ua = String(userAgent || "");
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac OS X|Macintosh/i.test(ua)) return "macOS";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad/i.test(ua)) return "iOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "";
}

async function forwardAdminAnalyticsVisit(context, event) {
  const url = cleanText(context.env.DANIELCLANCY_ADMIN_ANALYTICS_INGEST_URL, 500);
  const secret = String(context.env.DANIELCLANCY_ANALYTICS_INGEST_SECRET || "").trim();
  if (!url || !secret) {
    return { ok: false, configured: false, error: "analytics_forward_not_configured" };
  }
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-DanielClancy-Analytics-Secret": secret
      },
      body: JSON.stringify(event)
    });
    const payload = await response.json().catch(() => ({}));
    return { ok: response.ok && payload?.ok !== false, configured: true, status: response.status, stored: Boolean(payload?.stored) };
  } catch (error) {
    return { ok: false, configured: true, error: error.message || "analytics_forward_failed" };
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}

function methodNotAllowed() {
  return json({ ok: false, error: "method_not_allowed" }, 405, { Allow: "POST, OPTIONS" });
}

export const onRequestGet = methodNotAllowed;
export const onRequestPut = methodNotAllowed;
export const onRequestPatch = methodNotAllowed;
export const onRequestDelete = methodNotAllowed;

export async function onRequestPost(context) {
  let payload = {};
  try {
    payload = await context.request.json();
  } catch {
    payload = {};
  }

  const pagePath = safePath(payload.path || payload.pagePath || payload.route);
  const title = cleanText(payload.title, 160);
  const referrer = cleanText(payload.referrer, 500);
  const userAgent = context.request.headers.get("User-Agent") || "";
  const analyticsEvent = {
    surface: "danielclancy_public",
    page_path: pagePath,
    page_url: cleanText(payload.pageUrl || payload.url, 500),
    page_title: title,
    referrer,
    referrer_host: referrerHost(payload.referrerHost || referrer),
    timezone: cleanText(payload.timezone, 120),
    browser: cleanText(payload.browser || detectBrowser(userAgent), 80),
    device: cleanText(payload.device || detectDevice(userAgent), 80),
    platform: cleanText(payload.platform || detectPlatform(userAgent), 80)
  };
  const analytics = await forwardAdminAnalyticsVisit(context, analyticsEvent);
  const result = await postDanielClancyAlert(context, {
    triggerType: "page_visit",
    surface: "danielclancy.net",
    domain: "danielclancy.net",
    severity: "info",
    title: "DanielClancy.net page visit",
    message: `Page visit: ${pagePath}`,
    tags: ["page_visit", "danielclancy"],
    pagePath,
    linkUrl: `https://danielclancy.net${pagePath}`,
    payload: {
      pagePath,
      title,
      referrer,
    },
  });

  if (!result.ok && result.configured) {
    console.error(JSON.stringify({ event: "page_visit_alert_delivery_failed", status: result.status || 0, error: result.error }));
  }
  if (!analytics.ok && analytics.configured) {
    console.error(JSON.stringify({ event: "page_visit_analytics_forward_failed", status: analytics.status || 0, error: analytics.error || "forward_failed" }));
  }

  return json({
    ok: true,
    delivered: Boolean(result.ok),
    configured: Boolean(result.configured),
    analyticsForwarded: Boolean(analytics.ok),
    analyticsConfigured: Boolean(analytics.configured)
  });
}

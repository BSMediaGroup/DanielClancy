import assert from "node:assert/strict";
import test from "node:test";

import { onRequestPost } from "../functions/api/track/page-visit.js";

test("public page-visit forwarder sends geo-rich server-side admin analytics payload without exposing secret", async () => {
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    return new Response(JSON.stringify({ ok: true, stored: true }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  };

  try {
    const request = new Request("https://danielclancy.net/api/track/page-visit", {
      method: "POST",
      headers: { "content-type": "application/json", "User-Agent": "Mozilla/5.0 Chrome/125", Referer: "https://example.com/from" },
      body: JSON.stringify({
        eventId: "visit-ca-1",
        recordedAt: "2026-06-19T00:00:00.000Z",
        path: "/portfolio",
        pageUrl: "https://danielclancy.net/portfolio",
        title: "Portfolio"
      })
    });
    Object.defineProperty(request, "cf", {
      value: { city: "Toronto", region: "Ontario", regionCode: "ON", country: "CA" }
    });

    const response = await onRequestPost({
      request,
      env: {
        DANIELCLANCY_ADMIN_ANALYTICS_INGEST_URL: "https://admin.danielclancy.net/api/analytics/ingest/page-visit",
        DANIELCLANCY_ANALYTICS_INGEST_SECRET: "server-secret"
      }
    });
    const body = await response.json();
    const serializedResponse = JSON.stringify(body);

    assert.equal(response.status, 200);
    assert.equal(body.analyticsForwarded, true);
    assert.equal(serializedResponse.includes("server-secret"), false);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://admin.danielclancy.net/api/analytics/ingest/page-visit");
    assert.equal(calls[0].init.headers["X-DanielClancy-Analytics-Secret"], "server-secret");
    assert.equal(calls[0].body.eventId, "visit-ca-1");
    assert.equal(calls[0].body.source, "page_visit_kv");
    assert.equal(calls[0].body.live, true);
    assert.equal(calls[0].body.recordedAt, "2026-06-19T00:00:00.000Z");
    assert.equal(calls[0].body.city, "Toronto");
    assert.equal(calls[0].body.region, "Ontario");
    assert.equal(calls[0].body.region_code, "ON");
    assert.equal(calls[0].body.country, "CA");
    assert.equal(calls[0].body.country_code, "CA");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

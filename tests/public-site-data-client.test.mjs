import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repoRoot = new URL("../", import.meta.url);

test("public data client uses configured live endpoint with no-store and diagnostics", async () => {
  const source = await readFile(new URL("../src/lib/publicSiteData.tsx", import.meta.url), "utf8");
  assert.match(source, /VITE_ADMIN_PUBLIC_SITE_DATA_URL/);
  assert.match(source, /cache:\s*"no-store"/);
  assert.match(source, /console\.info\("\[DanielClancy\] public site-data loaded"/);
  assert.match(source, /public site-data fetch failed; using committed fallback/);
});

test("public data client preserves revision metadata and normalization helpers", async () => {
  const source = await readFile(new URL("../src/lib/publicSiteData.tsx", import.meta.url), "utf8");
  assert.match(source, /revision:\s*asString\(payload\.revision\)/);
  assert.match(source, /publishedAt:\s*asString\(payload\.publishedAt\)/);
  assert.match(source, /getProjectThumbnailUrl/);
  assert.match(source, /resolveCompanyByIdNameSlug/);
  assert.match(source, /resolvePlatformByIdNameSlug/);
});

test("generated public fallback has public collections and no admin-only keys", async () => {
  const payload = JSON.parse(await readFile(new URL("../src/data/public-site-fallback.generated.json", import.meta.url), "utf8"));
  assert.equal(payload.schemaVersion, "danielclancy-public-site-data.v1");
  assert.ok(payload.collections.projects.length > 0);
  assert.ok(payload.collections.companies.length > 0);
  assert.ok(payload.collections.platforms.length > 0);
  assert.ok(payload.collections.positions.length > 0);
  assert.ok(payload.assets.portfolioThumbs.length > 0);
  assert.ok(payload.revision);
  const keys = collectKeys(payload);
  const forbidden = keys.filter((key) => /overlay|excludedRows|account|auth|session|secret|token|password|kv|updatedBy/i.test(key));
  assert.deepEqual(forbidden, [], `generated fallback leaked forbidden keys: ${forbidden.join(", ")}`);
});

function collectKeys(value, keys = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectKeys(item, keys));
    return keys;
  }
  if (!value || typeof value !== "object") return keys;
  for (const [key, entry] of Object.entries(value)) {
    keys.push(key);
    collectKeys(entry, keys);
  }
  return keys;
}

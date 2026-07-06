import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repoRoot = new URL("../", import.meta.url);

test("public data client uses configured live endpoint with no-store and diagnostics", async () => {
  const source = await readFile(new URL("../src/lib/publicSiteData.tsx", import.meta.url), "utf8");
  assert.match(source, /VITE_ADMIN_PUBLIC_SITE_DATA_URL/);
  assert.match(source, /cache:\s*"no-store"/);
  assert.match(source, /cacheBustedPublicSiteDataUrl\(ADMIN_PUBLIC_SITE_DATA_URL\)/);
  assert.match(source, /hasLoggedPublicDataDiagnostics/);
  assert.match(source, /console\.info\("\[DanielClancy\] public site-data status"/);
  assert.match(source, /VITE_ADMIN_PUBLIC_SITE_DATA_URL is not configured; using committed public-site fallback data/);
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

test("public data provider initializes from fallback synchronously and exposes route-safe status", async () => {
  const source = await readFile(new URL("../src/lib/publicSiteData.tsx", import.meta.url), "utf8");
  assert.match(source, /createContext<PublicSiteDataContextValue>\(\{\s*data:\s*publicSiteFallback/s);
  assert.match(source, /useState<PublicSiteDataModel>\(publicSiteFallback\)/);
  assert.match(source, /loading:\s*false/);
  assert.match(source, /source:\s*data\.source/);
  assert.match(source, /publishedAt:\s*data\.publishedAt/);
  assert.match(source, /usingFallback:\s*Boolean/);
  assert.match(source, /error:\s*data\.error/);
});

test("missing env, fetch failure, and invalid admin response keep committed fallback", async () => {
  const source = await readFile(new URL("../src/lib/publicSiteData.tsx", import.meta.url), "utf8");
  assert.match(source, /if \(!ADMIN_PUBLIC_SITE_DATA_URL\)/);
  assert.match(source, /setData\(fallback\)/);
  assert.match(source, /setLoading\(false\)/);
  assert.match(source, /invalid_public_site_data_response/);
  assert.match(source, /return \{\s*\.\.\.fallback,\s*usingFallback:\s*true/s);
});

test("live admin response merges without emptying fallback-only collections", async () => {
  const source = await readFile(new URL("../src/lib/publicSiteData.tsx", import.meta.url), "utf8");
  assert.match(source, /projects:\s*projects\.length \? mergeProjects\(fallbackProjects, projects\) : fallbackProjects/);
  assert.match(source, /companies:\s*companies\.length \? companies : fallbackCompanies/);
  assert.match(source, /platforms:\s*platforms\.length \? platforms : fallbackPlatforms/);
  assert.match(source, /positions:\s*positions\.length \? mergeById\(fallbackPositions, positions\) : fallbackPositions/);
  assert.match(source, /watchMedia,\s*$/m);
  assert.match(source, /getPublicProjectLookupKeys\(row\)\.some/);
});

test("public data client filters scaffold watch media instead of falling back to stale watch rows", async () => {
  const source = await readFile(new URL("../src/lib/publicSiteData.tsx", import.meta.url), "utf8");
  const fallbackSource = await readFile(new URL("../src/data/public-site-fallback.ts", import.meta.url), "utf8");
  assert.match(source, /isScaffoldWatchMediaEntry/);
  assert.match(source, /if \(isScaffoldWatchMediaEntry\(raw\)\) return null/);
  assert.doesNotMatch(source, /watchMedia:\s*watchMedia\.length \? watchMedia : fallbackWatchMedia/);
  assert.match(fallbackSource, /isScaffoldFallbackWatchMedia/);
});

test("project detail route resolves fallback projects by slug, id, code, and legacy path aliases", async () => {
  const source = await readFile(new URL("../src/lib/publicSiteData.tsx", import.meta.url), "utf8");
  const detailSource = await readFile(new URL("../src/pages/PortfolioDetailPage.tsx", import.meta.url), "utf8");
  const portfolioSource = await readFile(new URL("../src/lib/portfolio.ts", import.meta.url), "utf8");
  assert.match(source, /getPublicProjectLookupKeys/);
  assert.match(source, /project\.slug/);
  assert.match(source, /project\.id/);
  assert.match(source, /project\.code/);
  assert.match(source, /lastPathSegment\(asString\(project\.livePage\)\)/);
  assert.match(portfolioSource, /getPortfolioLookupKeys/);
  assert.match(portfolioSource, /String\(project\.code \|\| ""\)/);
  assert.match(detailSource, /loading \? \(/);
  assert.doesNotMatch(detailSource, /Navigate replace to="\/portfolio"/);
});

test("asset URL helper keeps media and docs root-relative while preserving absolute URLs", async () => {
  const source = await readFile(new URL("../src/lib/publicSiteData.tsx", import.meta.url), "utf8");
  assert.match(source, /export function normalizePublicAssetPath/);
  assert.match(source, /stripped\.startsWith\("media\/portfolio\/"\)/);
  assert.match(source, /stripped\.startsWith\("docs\/"\)/);
  assert.match(source, /return `\/\$\{stripped\}`/);
  assert.match(source, /\^https\?:\\\/\\\//);
  assert.match(source, /text\.startsWith\("\.\.\/"\)/);
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
  assert.ok(payload.collections.projects.some((project) => project.slug && project.id && project.code));
  assert.ok(payload.collections.positions.some((position) => position.companyName && position.title));
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

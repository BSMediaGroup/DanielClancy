import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const adminRoot = path.resolve(process.env.DANIELCLANCY_ADMIN_ROOT || path.join(repoRoot, "..", "DanielClancy-Admin"));
const outputFile = path.join(repoRoot, "src", "data", "public-site-fallback.generated.json");
const checkMode = process.argv.includes("--check") || process.argv.includes("--dry-run");
const liveUrl = process.env.VITE_ADMIN_PUBLIC_SITE_DATA_URL || "";

async function main() {
  const result = liveUrl ? await fromLiveUrl(liveUrl).catch(() => fromLocalAdmin()) : await fromLocalAdmin();
  const payload = sanitizePublicPayload(result.payload, result.source);
  await preserveGeneratedAtIfOnlyTimestampChanged(payload);
  const next = `${JSON.stringify(payload, null, 2)}\n`;
  const current = existsSync(outputFile) ? await readFile(outputFile, "utf8") : "";
  const changed = current !== next;
  if (changed && !checkMode) await writeFile(outputFile, next);

  const counts = countsFor(payload);
  console.log(JSON.stringify({
    ok: true,
    mode: checkMode ? "check" : "write",
    sourceUsed: result.source,
    revision: payload.revision || "",
    counts,
    warnings: payload.warnings || [],
    fileWritten: changed ? path.relative(repoRoot, outputFile) : ""
  }, null, 2));

  if (checkMode && changed) process.exitCode = 1;
}

async function fromLiveUrl(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`live_public_site_data_http_${response.status}`);
  const payload = await response.json();
  return { source: url, payload };
}

async function fromLocalAdmin() {
  const helperPath = path.join(adminRoot, "functions", "_shared", "public-site-data.js");
  if (!existsSync(helperPath)) throw new Error(`Admin public-site-data helper not found: ${helperPath}`);
  const { buildPublicSiteData } = await import(pathToFileURL(helperPath));
  const request = new Request("https://admin.danielclancy.net/api/public/site-data");
  const payload = await buildPublicSiteData({
    request,
    env: {
      ASSETS: {
        async fetch(url) {
          const parsed = new URL(String(url));
          const file = path.join(adminRoot, parsed.pathname.replace(/^\/+/, ""));
          if (!existsSync(file)) return new Response("not found", { status: 404 });
          return new Response(await readFile(file, "utf8"), {
            status: 200,
            headers: { "content-type": "application/json" }
          });
        }
      }
    }
  });
  return { source: `local:${path.relative(repoRoot, adminRoot)}`, payload };
}

function sanitizePublicPayload(payload, sourceUsed) {
  if (!payload?.ok || payload.schemaVersion !== "danielclancy-public-site-data.v1") {
    throw new Error("invalid_public_site_data_payload");
  }
  return {
    schemaVersion: "danielclancy-public-site-data.v1",
    generatedAt: new Date().toISOString(),
    source: "static_fallback",
    revision: payload.revision || "",
    publishedAt: payload.publishedAt || null,
    collections: {
      projects: Array.isArray(payload.collections?.projects) ? payload.collections.projects : [],
      companies: Array.isArray(payload.collections?.companies) ? payload.collections.companies : [],
      platforms: Array.isArray(payload.collections?.platforms) ? payload.collections.platforms : [],
      positions: Array.isArray(payload.collections?.positions) ? payload.collections.positions : []
    },
    assets: {
      portfolioThumbs: Array.isArray(payload.assets?.portfolioThumbs) ? payload.assets.portfolioThumbs : [],
      portfolioImages: Array.isArray(payload.assets?.portfolioImages) ? payload.assets.portfolioImages : [],
      docs: Array.isArray(payload.assets?.docs) ? payload.assets.docs : []
    },
    warnings: Array.from(new Set([...(payload.warnings || []), `fallback_rebuilt_from:${sourceUsed}`]))
  };
}

function countsFor(payload) {
  return {
    projects: payload.collections.projects.length,
    companies: payload.collections.companies.length,
    platforms: payload.collections.platforms.length,
    positions: payload.collections.positions.length,
    assets: payload.assets.portfolioThumbs.length + payload.assets.portfolioImages.length + payload.assets.docs.length
  };
}

async function preserveGeneratedAtIfOnlyTimestampChanged(next) {
  if (!existsSync(outputFile)) return;
  try {
    const current = JSON.parse(await readFile(outputFile, "utf8"));
    const currentGeneratedAt = current.generatedAt;
    if (!currentGeneratedAt) return;
    const comparableCurrent = { ...current, generatedAt: currentGeneratedAt };
    const comparableNext = { ...next, generatedAt: currentGeneratedAt };
    if (JSON.stringify(comparableCurrent) === JSON.stringify(comparableNext)) {
      next.generatedAt = currentGeneratedAt;
    }
  } catch {
    // Let the normal write/check path report the stale or invalid file.
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("watch page merges Admin manual watch media with YouTube feed and sorts by date", async () => {
  const source = await readFile(new URL("../src/pages/WatchPage.tsx", import.meta.url), "utf8");
  assert.match(source, /usePublicSiteData/);
  assert.match(source, /resolveVideos\(feed, watchMedia\)/);
  assert.match(source, /normalizeYouTubeFeedItem/);
  assert.match(source, /normalizeManualWatchMediaItem/);
  assert.match(source, /\.sort\(\(left, right\) => sortTime\(right\) - sortTime\(left\)\)/);
  assert.match(source, /item\?\.sortDate \|\| item\?\.publishedAt \|\| item\?\.enteredAt \|\| item\?\.createdAt/);
  assert.match(source, /watchMediaDedupeKey/);
});

test("watch hero excludes gallery-only Rumble shorts while keeping gallery rendering", async () => {
  const source = await readFile(new URL("../src/pages/WatchPage.tsx", import.meta.url), "utf8");
  assert.match(source, /function isHeroCandidate/);
  assert.match(source, /if \(item\.galleryOnly\) return false/);
  assert.match(source, /sourcePlatform === "rumble" && entryType === "short"/);
  assert.match(source, /watch-selector__item--link/);
  assert.match(source, /watch-card--portrait/);
});

test("watch page keeps YouTube shorts embeddable and renders platform badges", async () => {
  const source = await readFile(new URL("../src/pages/WatchPage.tsx", import.meta.url), "utf8");
  assert.match(source, /isLikelyYouTubeShort/);
  assert.match(source, /return type === "short" \|\| isLikelyYouTubeShort\(video\) \? "YouTube Short" : "YouTube"/);
  assert.match(source, /return type === "short" \? "Rumble Short" : "Rumble"/);
  assert.match(source, /heroEmbeddable:\s*true/);
});

test("watch feed requests at least twelve YouTube uploads and exposes safe metadata", async () => {
  const source = await readFile(new URL("../functions/api/watch-feed.js", import.meta.url), "utf8");
  assert.match(source, /const WATCH_FEED_TARGET_COUNT = 12/);
  assert.match(source, /maxResults:\s*String\(WATCH_FEED_TARGET_COUNT\)/);
  assert.match(source, /youtubeCount:\s*items\.length/);
  assert.match(source, /targetCount:\s*WATCH_FEED_TARGET_COUNT/);
});

test("watch page exposes safe merged-feed diagnostics", async () => {
  const source = await readFile(new URL("../src/pages/WatchPage.tsx", import.meta.url), "utf8");
  assert.match(source, /youtubeCount:\s*feed\?\.metadata\?\.youtubeCount/);
  assert.match(source, /manualMediaCount:\s*watchMedia\.filter/);
  assert.match(source, /mergedCount:\s*videos\.length/);
  assert.match(source, /heroId:\s*activeVideo\?\.id/);
  assert.match(source, /watch-feed-diagnostics/);
});

test("login modal logo is scoped white rounded-square styling", async () => {
  const source = await readFile(new URL("../src/styles/global.css", import.meta.url), "utf8");
  assert.match(source, /\.login-modal__brand-mark\s*\{[\s\S]*width:\s*4\.25rem;[\s\S]*height:\s*4\.25rem;[\s\S]*border-radius:\s*16px;/);
  assert.match(source, /\.login-modal__brand-mark img\s*\{[\s\S]*width:\s*2\.7rem;[\s\S]*filter:\s*brightness\(0\) invert\(1\);/);
});

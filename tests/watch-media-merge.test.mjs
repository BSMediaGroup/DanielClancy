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

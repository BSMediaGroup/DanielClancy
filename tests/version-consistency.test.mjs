import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repoRoot = new URL("../", import.meta.url);

async function readRepoFile(path) {
  return readFile(new URL(path, repoRoot), "utf8");
}

test("public release metadata is aligned to v1.0", async () => {
  const packageJson = JSON.parse(await readRepoFile("package.json"));
  const packageLock = JSON.parse(await readRepoFile("package-lock.json"));
  const bumpNotes = await readRepoFile("BUMP_NOTES.md");
  const releaseNotes = await readRepoFile("RELEASE_NOTES_v1.0.md");
  const readme = await readRepoFile("README.md");

  assert.equal(packageJson.version, "1.0.0");
  assert.equal(packageLock.version, "1.0.0");
  assert.equal(packageLock.packages[""].version, "1.0.0");
  assert.match(bumpNotes, /^CURRENT VER= v1\.0 \/ PENDING VER= v1\.0\.1/m);
  assert.match(readme, /Current release: `v1\.0`/);
  assert.match(releaseNotes, /^# DanielClancy v1\.0/m);
});

test("public visible shell sources do not expose stale pre-release version labels", async () => {
  const shellSources = [
    await readRepoFile("index.html"),
    await readRepoFile("src/components/ProfessionalShell.tsx"),
    await readRepoFile("src/components/PersonalShell.tsx")
  ].join("\n");

  assert.doesNotMatch(shellSources, /v0\.1\.2-beta|0\.1\.2-beta|pre-release/i);
  assert.doesNotMatch(shellSources, /\b(alpha|beta)\b/i);
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const releases = JSON.parse(await readFile(new URL("data/releases.json", root), "utf8"));
const index = await readFile(new URL("index.html", root), "utf8");

const compareVersions = (left, right) => {
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const delta = (b[index] ?? 0) - (a[index] ?? 0);
    if (delta) return delta;
  }
  return 0;
};

test("there is exactly one current release", () => {
  assert.equal(releases.filter((release) => release.current).length, 1);
  assert.equal(releases.find((release) => release.current).version, "3.0");
});

test("releases use descending semantic-version order", () => {
  assert.deepEqual(releases.map((release) => release.version), [...releases].sort((a, b) => compareVersions(a.version, b.version)).map((release) => release.version));
});

test("known product history remains represented", () => {
  for (const version of ["3.0", "2.3", "2.2.1", "2.2", "2.1.1", "2.1", "2.0", "1.2", "1.1.1", "1.1", "1.0.1", "1.0"]) {
    assert.ok(releases.some((release) => release.version === version), `missing ${version}`);
  }
});

test("homepage keeps zoom and reduced-motion accessibility available", () => {
  assert.doesNotMatch(index, /user-scalable\s*=\s*no|maximum-scale\s*=\s*1/i);
  assert.match(index, /class="skip-link"/);
  assert.match(index, /prefers-reduced-motion/);
});

test("homepage has one H1 and promotes 3.0 instead of 2.0", () => {
  assert.equal((index.match(/<h1\b/g) ?? []).length, 1);
  assert.match(index, /BUSGo! 3\.0 ya está aquí/);
  assert.doesNotMatch(index, /Descubre BUSGo! 2\.0/);
});

test("public product routes are represented in the sitemap", async () => {
  const sitemap = await readFile(new URL("sitemap.xml", root), "utf8");
  for (const route of ["/bg/", "/bg/changelog/", "/bg/changelog/3.0/", "/bg/soporte/", "/bg/privacidad/"]) {
    assert.match(sitemap, new RegExp(route.replaceAll("/", "\\/")));
  }
});

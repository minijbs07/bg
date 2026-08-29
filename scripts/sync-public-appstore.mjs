import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const siteURL = new URL("data/site.json", root);
const releasesURL = new URL("data/releases.json", root);
const site = JSON.parse(await readFile(siteURL, "utf8"));
const releases = JSON.parse(await readFile(releasesURL, "utf8"));

const response = await fetch(`https://itunes.apple.com/lookup?id=${site.appId}&country=es`);
if (!response.ok) throw new Error(`Apple Lookup failed with ${response.status}`);
const payload = await response.json();
const app = payload.results?.[0];
if (!app?.version) throw new Error("Apple Lookup returned no app version");

site.currentVersion = app.version;
site.rating = app.averageUserRating ?? site.rating;
site.ratingCount = app.userRatingCount ?? site.ratingCount;
site.minimumOS = app.minimumOsVersion ? `iOS ${app.minimumOsVersion}` : site.minimumOS;
site.lastSyncedAt = new Date().toISOString();

for (const release of releases) release.current = release.version === app.version;
let current = releases.find((release) => release.version === app.version);
if (!current) {
  current = { version: app.version, current: true, type: "feature", title: `BUSGo! ${app.version}`, officialNotes: [] };
  releases.push(current);
}
current.date = app.currentVersionReleaseDate?.slice(0, 10) ?? current.date ?? null;
current.source = "apple-public-lookup";
if (app.releaseNotes) {
  current.officialNotes = app.releaseNotes
    .split(/\n+/)
    .map((line) => line.replace(/^\s*[•*-]\s*/, "").trim())
    .filter((line) => line && !/^¡?BusGo! .*ya está aquí/i.test(line) && !/^Actualiza y descubre/i.test(line));
}

const semver = (value) => value.split(".").map(Number);
releases.sort((a, b) => {
  const left = semver(a.version);
  const right = semver(b.version);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const delta = (right[index] ?? 0) - (left[index] ?? 0);
    if (delta) return delta;
  }
  return 0;
});

await writeFile(siteURL, `${JSON.stringify(site, null, 2)}\n`);
await writeFile(releasesURL, `${JSON.stringify(releases, null, 2)}\n`);
console.log(`BUSGo! ${app.version}: metadata pública sincronizada.`);

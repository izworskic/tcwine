import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

const [venuesRaw, kitPage, kit, map, embedPage, geojson, csv, config, analytics, sitemap] = await Promise.all([
  read("../data/venues.json"),
  read("../app/for-publishers/page.js"),
  read("../components/PublisherKit.js"),
  read("../components/PublisherMap.js"),
  read("../app/embed/traverse-city-winery-map/page.js"),
  read("../app/api/publisher/wineries.geojson/route.js"),
  read("../app/api/publisher/wineries.csv/route.js"),
  read("../next.config.js"),
  read("../lib/wine-analytics.js"),
  read("../app/sitemap.js"),
]);

const venues = JSON.parse(venuesRaw);
const wineries = venues.filter((v) => v.category === "winery");
assert.equal(wineries.length, 43);
assert.equal(wineries.filter((v) => v.area === "old-mission").length, 11);
assert.equal(wineries.filter((v) => v.area === "leelanau").length, 30);
assert.equal(wineries.filter((v) => v.area === "traverse-city").length, 2);

assert.match(kitPage, /robots: \{ index: false, follow: true \}/);
assert.match(embedPage, /robots: \{ index: false, follow: true \}/);
assert.match(kitPage, /not association membership counts/i);
assert.match(kitPage, /Chris Izworski/);
assert.match(kit, /Chris Izworski's Traverse City Winery Map/);
assert.match(kit, /utm_source=publisher_embed/);
assert.match(kit, /rel="nofollow"/);
assert.match(map, /rel="noopener nofollow"/);
assert.match(kit, /Copy embed code/);
assert.match(kit, /wineries\.geojson/);
assert.match(kit, /wineries\.csv/);
assert.match(map, /Open the full winery planner/);
assert.match(map, /wine_embed_loaded/);
assert.match(map, /wine_embed_planner_opened/);

assert.match(geojson, /FeatureCollection/);
assert.match(geojson, /Traverse City Winery Map by Chris Izworski/);
assert.match(geojson, /X-Robots-Tag/);
assert.match(csv, /dataset_updated/);
assert.match(csv, /X-Robots-Tag/);

assert.match(config, /frame-ancestors \*/);
assert.match(config, /noindex, follow/);
assert.doesNotMatch(sitemap, /for-publishers/);
assert.doesNotMatch(sitemap, /embed\/traverse-city-winery-map/);

for (const event of [
  "wine_embed_loaded",
  "wine_embed_planner_opened",
  "wine_publisher_embed_copied",
  "wine_publisher_data_opened",
]) {
  assert.ok(analytics.includes(event), `Missing analytics event ${event}`);
}

console.log("Publisher authority flywheel checks passed.");

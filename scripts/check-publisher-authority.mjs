import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

const [venuesRaw, kitPage, kit, map, mount, embedPage, partnerPage, wineryEmbedPage, partnersRaw, drivingLib, drivingComponent, drivingApi, comparePage, geojson, csv, config, analytics, sitemap] = await Promise.all([
  read("../data/venues.json"),
  read("../app/for-publishers/page.js"),
  read("../components/PublisherKit.js"),
  read("../components/PublisherMap.js"),
  read("../components/PublisherMapMount.js"),
  read("../app/embed/traverse-city-winery-map/page.js"),
  read("../app/embed/partner/[slug]/page.js"),
  read("../app/embed/winery/[id]/page.js"),
  read("../data/publisher-partners.json"),
  read("../lib/driving-reality.js"),
  read("../components/DrivingReality.js"),
  read("../app/api/publisher/driving-reality.json/route.js"),
  read("../app/old-mission-vs-leelanau-wineries/page.js"),
  read("../app/api/publisher/wineries.geojson/route.js"),
  read("../app/api/publisher/wineries.csv/route.js"),
  read("../next.config.js"),
  read("../lib/wine-analytics.js"),
  read("../app/sitemap.js"),
]);

const venues = JSON.parse(venuesRaw);
const partners = JSON.parse(partnersRaw);
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
assert.match(map, /tile\.openstreetmap\.org/);
assert.doesNotMatch(map, /cartocdn/i);
assert.match(kit, /Copy embed code/);
assert.match(kit, /wineries\.geojson/);
assert.match(kit, /wineries\.csv/);
assert.match(map, /Open the full winery planner/);
assert.match(map, /wine_embed_loaded/);
assert.match(map, /wine_embed_planner_opened/);
assert.match(map, /focusId/);
assert.match(map, /preferredAreas/);
assert.match(map, /v\.area === focusWinery\.area/);
assert.match(map, /maxZoom: anchor \? 11 : 9/);
assert.match(map, /wine_embed_planner_opened", \{ surface, context \}/);
assert.match(map, /partner/);
assert.match(mount, /PublisherMap \{\.\.\.props\}/);
assert.equal(partners.length, 3);
assert.deepEqual(partners.find((p) => p.slug === "grand-traverse-resort").preferredAreas, ["old-mission", "traverse-city"]);
assert.deepEqual(partners.find((p) => p.slug === "cherry-tree-inn").preferredAreas, ["old-mission", "traverse-city"]);
assert.deepEqual(partners.map((p) => p.slug), ["grand-traverse-resort", "cherry-tree-inn", "traverse-city-tourism"]);
assert.match(partnerPage, /dynamicParams = false/);
assert.match(partnerPage, /Plan wine country from/);
assert.match(wineryEmbedPage, /dynamicParams = false/);
assert.match(wineryEmbedPage, /nearby wineries/);
assert.match(kitPage, /Partner-specific map examples/);

assert.match(geojson, /FeatureCollection/);
assert.match(geojson, /Traverse City Winery Map by Chris Izworski/);
assert.match(geojson, /X-Robots-Tag/);
assert.match(csv, /dataset_updated/);
assert.match(csv, /X-Robots-Tag/);
assert.match(drivingLib, /medianPairMiles/);
assert.match(drivingLib, /wineTruth\.updated/);
assert.match(drivingLib, /medianNearestMiles/);
assert.match(drivingComponent, /The surprising part/);
assert.match(drivingComponent, /straight-line separation/);
assert.match(drivingApi, /canonicalAnalysis/);
assert.match(drivingApi, /X-Robots-Tag/);
assert.match(comparePage, /<DrivingReality \/>/);

assert.match(config, /frame-ancestors \*/);
assert.match(config, /noindex, follow/);
assert.doesNotMatch(sitemap, /for-publishers/);
assert.doesNotMatch(sitemap, /embed\/traverse-city-winery-map/);
assert.doesNotMatch(sitemap, /embed\/partner/);
assert.doesNotMatch(sitemap, /embed\/winery/);
assert.doesNotMatch(sitemap, /driving-reality\.json/);

for (const event of [
  "wine_embed_loaded",
  "wine_embed_planner_opened",
  "wine_publisher_embed_copied",
  "wine_publisher_data_opened",
]) {
  assert.ok(analytics.includes(event), `Missing analytics event ${event}`);
}

console.log("Publisher authority flywheel checks passed.");

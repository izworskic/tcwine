import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

const [
  home,
  layout,
  planner,
  oldMission,
  leelanau,
  food,
  views,
  compare,
  fall,
  sitemap,
  photo,
  venues,
  image,
  analytics,
  analyticsComponent,
  styles,
] = await Promise.all([
  read("../app/page.js"),
  read("../app/layout.js"),
  read("../components/Planner.js"),
  read("../app/old-mission-peninsula-wineries/page.js"),
  read("../app/leelanau-peninsula-wine-trail/page.js"),
  read("../app/traverse-city-wineries-with-food/page.js"),
  read("../app/best-traverse-city-wineries-with-views/page.js"),
  read("../app/old-mission-vs-leelanau-wineries/page.js"),
  read("../app/fall-color-wine-tour/page.js"),
  read("../app/sitemap.js"),
  read("../components/RegionalPhoto.js"),
  read("../app/venues/page.js"),
  read("../app/opengraph-image.js"),
  read("../lib/wine-analytics.js"),
  read("../components/WineAnalytics.js"),
  read("../app/globals.css"),
]);

assert.match(home, /Traverse City Winery Map: 40 Wineries/);
assert.match(home, /"https:\/\/chrisizworski\.com\/#person"/);
assert.match(home, /url: "https:\/\/chrisizworski\.com\/chris-izworski\/"/);
assert.match(home, /applicationCategory: "TravelApplication"/);
assert.match(home, /featureList:/);
assert.match(home, /card: "summary_large_image"/);

assert.match(layout, /Traverse City Winery Map & Wine Tour Planner/);
assert.match(layout, /max-image-preview/);
assert.match(layout, /authors: \[\{ name: "Chris Izworski"/);
assert.match(layout, /rel="author" href="https:\/\/chrisizworski\.com\/chris-izworski\/"/);
assert.match(layout, /\/_vercel\/insights\/script\.js/);
assert.match(layout, /window\.va=window\.va\|\|function/);

assert.match(planner, /new Set\(Array\.isArray\(preset\.beverages\) \? preset\.beverages : \["wine"\]\)/);
assert.match(planner, /state\.area === "old-mission"/);
assert.match(planner, /state\.area === "leelanau"/);
assert.match(planner, /trackWineEvent\("wine_map_loaded"/);
assert.match(planner, /trackWineEvent\("wine_route_built"/);
assert.match(planner, /trackWineEvent\("wine_stop_toggled"/);
assert.doesNotMatch(planner, /trackWineEvent\([^\n]+name:/);

assert.match(oldMission, /category === "winery"/);
assert.match(oldMission, /Old Mission Peninsula Winery Map/);
assert.match(oldMission, /preset=\{\{ area: "old-mission", beverages: \["wine"\]/);

assert.match(leelanau, /category === "winery"/);
assert.match(leelanau, /Leelanau Peninsula Winery Map/);
assert.match(leelanau, /preset=\{\{ area: "leelanau", beverages: \["wine"\]/);

assert.match(food, /alternates: \{ canonical: "\/traverse-city-wineries-with-food" \}/);
assert.match(food, /category === "winery" && v\.food/);
assert.match(views, /alternates: \{ canonical: "\/best-traverse-city-wineries-with-views" \}/);
assert.match(views, /bay\|view\|overlook\|sunset/);
assert.match(compare, /alternates: \{ canonical: "\/old-mission-vs-leelanau-wineries" \}/);
assert.match(compare, /Do not try to cover both peninsulas/);
assert.match(fall, /Traverse City Fall Color Winery Map/);
assert.match(fall, /poiKinds: \["scenic"\]/);

for (const route of [
  "old-mission-peninsula-wineries",
  "leelanau-peninsula-wine-trail",
  "old-mission-vs-leelanau-wineries",
  "traverse-city-wineries-with-food",
  "best-traverse-city-wineries-with-views",
  "fall-color-wine-tour",
]) {
  assert.ok(sitemap.includes(route), `sitemap missing ${route}`);
}

assert.match(photo, /Old Mission Peninsula vineyard and Grand Traverse Bay/);
assert.match(photo, /CC BY-SA 2\.5/);
assert.match(photo, /Public domain/);
assert.match(photo, /Attribution license/);

assert.match(analytics, /WINE_LANDING_KEYS/);
assert.match(analyticsComponent, /wine_landing_viewed/);
assert.doesNotMatch(analytics, /latitude|longitude|selectedVenue|freeText/i);
assert.match(analyticsComponent, /usePathname/);
assert.match(analyticsComponent, /WINE_LANDING_KEYS\[pathname\]/);
assert.match(styles, /orientation: landscape/);
assert.match(styles, /min-width: 861px/);
assert.match(styles, /max-width: 1366px/);
assert.match(styles, /height:112vh/);
assert.match(styles, /planner-shell:not\(\.planner-shell-embedded\)/);

assert.match(venues, /alternates: \{ canonical: "\/venues" \}/);
assert.match(venues, /url: `\$\{BASE\}\/venues`/);
assert.match(venues, /openGraph:/);
assert.match(venues, /twitter:/);
assert.match(venues, /card: "summary_large_image"/);
assert.match(venues, /images: \[\{ url: SOCIAL_IMAGE, width: 1200, height: 630/);
assert.match(venues, /images: \[SOCIAL_IMAGE\]/);
assert.match(image, /width: 1200/);
assert.match(image, /height: 630/);
assert.match(image, /ImageResponse/);

const titles = [
  "Traverse City Winery Map & Wine Tour Planner | 40 Wineries",
  "Old Mission Peninsula Winery Map: 11 Wineries & Route Planner",
  "Leelanau Peninsula Winery Map: 27 Wineries by Town",
  "Traverse City Wineries With Food: Map, Meals & Tasting Stops",
];
for (const title of titles) {
  assert.ok(title.length <= 65, `Title is too long: ${title.length} ${title}`);
}

console.log("TC Wine map-first SEO checks passed.");

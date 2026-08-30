import fs from "node:fs";

function read(path) {
  return fs.readFileSync(new URL("../" + path, import.meta.url), "utf8");
}

const venues = JSON.parse(read("data/venues.json"));
const page = read("app/wine-country-data/page.js");
const lib = read("lib/wine-data-desk.js");
const explorer = read("components/WineDataDeskExplorer.js");
const actions = read("components/WineDataDeskActions.js");
const csv = read("app/api/data-desk/wineries.csv/route.js");
const geojson = read("app/api/data-desk/wineries.geojson/route.js");
const snapshot = read("app/api/data-desk/snapshot.json/route.js");
const sitemap = read("app/sitemap.js");
const home = read("app/page.js");
const publishers = read("app/for-publishers/page.js");
const compare = read("app/old-mission-vs-leelanau-wineries/page.js");
const analytics = read("lib/wine-analytics.js");
const css = read("app/globals.css");
const pkg = JSON.parse(read("package.json"));\nconst productionSmoke = read(".github/workflows/production-smoke.yml");

const errors = [];
const wineries = venues.filter((v) => v.category === "winery");
const verified = wineries.filter(
  (v) => Array.isArray(v.varietals) && v.varietals.length && v.varietalsSourceUrl && v.varietalsVerifiedAt
);

function must(text, needle, label) {
  if (!text.includes(needle)) errors.push(label + ": missing " + needle);
}

if (wineries.length < 43) errors.push("winery inventory regressed below 43");
if (verified.length < 18) errors.push("source-backed varietal coverage regressed below 18");

must(page, '@type": "Dataset"', "Data Desk schema");
must(page, '@type": "DataDownload"', "Data Desk distribution schema");
must(page, 'canonical: "/wine-country-data"', "Data Desk canonical");
must(page, "Five findings worth citing", "Data Desk findings");
must(page, "What these numbers mean", "Data Desk methodology");
must(page, "<WineDataDeskExplorer", "Data Desk explorer");
must(page, "<WineDataDeskActions", "Data Desk reuse actions");
must(page, "data.summary.wineries", "derived winery count");
must(page, "data.summary.varietalVerifiedWineries", "derived verified-varietal count");
must(page, "data.geography", "derived geography");
must(page, "source-backed", "source discipline");

must(lib, "varietalsSourceUrl", "Data Desk varietal provenance");
must(lib, "varietalsSourceLabel", "Data Desk varietal provenance");
must(lib, "varietalsVerifiedAt", "Data Desk varietal provenance");
must(lib, "getDrivingReality", "Data Desk geography");
must(lib, "Geographic directory inclusion is not the same", "directory definition");
must(lib, "They do not infer a grape", "varietal definition");

must(explorer, "wine_data_filter_changed", "Data Desk filter analytics");
must(actions, "wine_data_citation_copied", "Data Desk citation analytics");
must(actions, "wine_data_download_opened", "Data Desk download analytics");

for (const [text, label] of [[csv, "CSV"], [geojson, "GeoJSON"], [snapshot, "snapshot JSON"]]) {
  must(text, '"X-Robots-Tag": "noindex, follow"', label + " noindex");
  must(text, "getWineDataDesk", label + " derived data");
}
must(csv, "verified_varietals", "research CSV");
must(csv, "varietals_source_url", "research CSV provenance");
must(geojson, "verifiedVarietals", "research GeoJSON");
must(snapshot, "verifiedGrapes", "research JSON snapshot");

must(sitemap, '"wine-country-data"', "sitemap");
must(home, 'href="/wine-country-data"', "homepage discovery");
must(publishers, 'href="/wine-country-data"', "publisher distribution");
must(compare, 'href="/wine-country-data"', "geography distribution");
must(analytics, '"/wine-country-data": "wine_country_data"', "landing analytics");
must(analytics, '"wine_data_filter_changed"', "event registry");
must(analytics, '"wine_data_download_opened"', "event registry");
must(analytics, '"wine_data_citation_copied"', "event registry");
must(css, "Wine Country Data Desk", "Data Desk styles");\nmust(productionSmoke, "Wine Country Data Desk and research exports are live.", "production smoke");\nmust(productionSmoke, "/api/data-desk/snapshot.json", "production smoke JSON");\nmust(productionSmoke, "/api/data-desk/wineries.csv", "production smoke CSV");

if (pkg.scripts["test:data-desk"] !== "node scripts/check-data-desk.mjs") {
  errors.push("package.json missing test:data-desk script");
}
if (!pkg.scripts.test.includes("test:data-desk")) {
  errors.push("npm test does not run the Data Desk gate");
}

if (errors.length) {
  console.error("Wine Country Data Desk validation failed:\n- " + errors.join("\n- "));
  process.exit(1);
}

const grapeCounts = {};
verified.forEach((v) => v.varietals.forEach((g) => { grapeCounts[g] = (grapeCounts[g] || 0) + 1; }));

console.log(JSON.stringify({
  wineries: wineries.length,
  sourceBackedVarietalWineries: verified.length,
  topVerifiedGrapes: Object.entries(grapeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8),
  distributionSurfaces: ["homepage", "publisher kit", "Old Mission vs. Leelanau comparison"],
  downloads: ["CSV", "GeoJSON", "JSON snapshot"],
}, null, 2));

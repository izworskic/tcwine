import fs from "node:fs";

const pois = JSON.parse(fs.readFileSync(new URL("../data/pois.json", import.meta.url), "utf8"));
const ALLOWED_KINDS = new Set(["beach","hike","scenic","lighthouse","town","paddle","market","food","history"]);
const ALLOWED_AREAS = new Set(["leelanau","old-mission","traverse-city"]);
const ALLOWED_STATUS = new Set(["open","temporarily-closed","closed"]);
const errors = [];
const ids = new Set();
const counts = {};
let sourced = 0;

function fail(message){ errors.push(message); }

for (const p of pois) {
  if (!p.id || ids.has(p.id)) fail(`duplicate or missing id: ${p.id || "(missing)"}`);
  ids.add(p.id);
  if (!p.name) fail(`${p.id}: missing name`);
  if (!ALLOWED_KINDS.has(p.kind)) fail(`${p.id}: unknown kind ${p.kind}`);
  if (!ALLOWED_AREAS.has(p.area)) fail(`${p.id}: unknown area ${p.area}`);
  if (!Number.isFinite(p.lat) || p.lat < 44.65 || p.lat > 45.25) fail(`${p.id}: latitude outside regional bounds`);
  if (!Number.isFinite(p.lng) || p.lng < -86.20 || p.lng > -85.40) fail(`${p.id}: longitude outside regional bounds`);
  if (!Number.isFinite(p.dwellMinutes) || p.dwellMinutes < 10 || p.dwellMinutes > 240) fail(`${p.id}: unreasonable dwellMinutes`);
  if (!p.hours || typeof p.hours !== "object") fail(`${p.id}: missing structured hours`);
  if (!Array.isArray(p.openDays)) fail(`${p.id}: missing openDays`);
  if (!Array.isArray(p.tags)) fail(`${p.id}: missing tags`);
  if (!p.mapsUrl || !p.directionsUrl) fail(`${p.id}: missing map links`);
  if (p.status && !ALLOWED_STATUS.has(p.status)) fail(`${p.id}: unknown status ${p.status}`);

  if (p.sourceUrl) sourced += 1;
  if (p.dataTier === "deep-v1") {
    if (!p.sourceUrl) fail(`${p.id}: deep-v1 record missing sourceUrl`);
    if (!p.sourceLabel) fail(`${p.id}: deep-v1 record missing sourceLabel`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.verifiedAt || "")) fail(`${p.id}: deep-v1 record missing verifiedAt`);
  }

  if (p.season) {
    if (!Number.isInteger(p.season.year)) fail(`${p.id}: season year must be an integer`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.season.start || "")) fail(`${p.id}: invalid season start`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.season.end || "")) fail(`${p.id}: invalid season end`);
    if (p.season.start > p.season.end) fail(`${p.id}: season starts after it ends`);
  }

  counts[p.kind] = (counts[p.kind] || 0) + 1;
}

if (pois.length < 60) fail(`special-place depth regressed: expected >=60, got ${pois.length}`);
if (ALLOWED_KINDS.size < 9) fail("taxonomy must keep nine place types");
if ((counts.hike || 0) < 25) fail("expected at least 25 hikes");
if ((counts.beach || 0) < 10) fail("expected at least 10 beaches");
if ((counts.market || 0) < 8) fail("expected at least 8 farms/markets");
if ((counts.paddle || 0) < 4) fail("expected at least 4 paddle/water places");
if ((counts.food || 0) < 4) fail("expected at least 4 local-food places");
if (sourced < 45) fail(`source coverage regressed: expected >=45, got ${sourced}`);

const whaleback = pois.find((p) => p.id === "whaleback");
if (!whaleback || whaleback.status !== "temporarily-closed") fail("Whaleback closure guard is missing");

if (errors.length) {
  console.error("POI data validation failed:\n- " + errors.join("\n- "));
  process.exit(1);
}

console.log(JSON.stringify({
  specialPlaces: pois.length,
  kinds: counts,
  sourced,
  closureAware: true,
  seasonalRecords: pois.filter((p)=>p.season).length
}, null, 2));

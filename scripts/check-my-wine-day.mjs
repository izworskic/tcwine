import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildWinePlanHash,
  decodeWinePlan,
  encodeWinePlan,
  MAX_SAVED_WINE_DAYS,
  normalizeWinePlan,
  readLastWinePlan,
  readLocalWinePlans,
  readWinePlanFromHash,
  removeSavedWinePlan,
  upsertSavedWinePlan,
  winePlanLabel,
  wineStopCountBucket,
  writeLastWinePlan,
  writeLocalWinePlans,
} from "../lib/my-wine-day.js";

const options = {
  validOrigins: ["Traverse City", "Suttons Bay", "Lake Leelanau"],
  validIds: [
    "peninsula-cellars",
    "chateau-chantal",
    "brys-estate",
    "2-lads",
    "good-harbor",
    "boathouse-vineyards",
    "verterra-leland",
    "vans-beach",
    "mawby",
    "blustone",
    "mari-vineyards",
    "bonobo",
    "hawthorne-vineyards",
  ],
  defaultOrigin: "Traverse City",
  defaultDate: "2026-08-29",
};

const raw = {
  origin: "Suttons Bay",
  date: "2026-10-10",
  start: "11:30",
  doneBy: "",
  pace: "leisurely",
  dd: true,
  area: "leelanau",
  beverages: ["wine", "wine", "bogus"],
  styles: ["sparkling", "dry", "dry"],
  poiKinds: ["beach", "bogus"],
  selected: ["mawby", "blustone", "vans-beach", "not-real"],
};

const normalized = normalizeWinePlan(raw, options);
assert.deepEqual(normalized, {
  version: 1,
  origin: "Suttons Bay",
  date: "2026-10-10",
  start: "11:30",
  doneBy: "",
  pace: "leisurely",
  dd: true,
  area: "leelanau",
  beverages: ["wine"],
  styles: ["sparkling", "dry"],
  poiKinds: ["beach"],
  selected: ["mawby", "blustone", "vans-beach"],
});

const encoded = encodeWinePlan(raw, options);
assert.ok(encoded.length > 20);
assert.ok(!encoded.includes("+"));
assert.ok(!encoded.includes("/"));
assert.deepEqual(decodeWinePlan(encoded, options), normalized);

const hash = buildWinePlanHash(raw, options);
assert.ok(hash.startsWith("#plan="));
assert.deepEqual(readWinePlanFromHash(hash, options), normalized);
assert.equal(readWinePlanFromHash("#other=abc", options), null);
assert.equal(decodeWinePlan("not-valid-base64url", options), null);

const invalid = normalizeWinePlan({
  origin: "Nowhere",
  selected: ["bad-id"],
}, options);
assert.equal(invalid, null);

let saved = [];
saved = upsertSavedWinePlan(saved, raw, { ...options, now: "2026-08-29T10:00:00.000Z" });
assert.equal(saved.length, 1);
saved = upsertSavedWinePlan(saved, raw, { ...options, now: "2026-08-29T11:00:00.000Z" });
assert.equal(saved.length, 1);
assert.equal(saved[0].savedAt, "2026-08-29T11:00:00.000Z");

for (let i = 0; i < 8; i += 1) {
  saved = upsertSavedWinePlan(saved, {
    ...raw,
    date: `2026-10-${String(11 + i).padStart(2, "0")}`,
    selected: i % 2 === 0
      ? ["peninsula-cellars", "chateau-chantal"]
      : ["good-harbor", "boathouse-vineyards"],
  }, { ...options, now: `2026-08-29T1${i}:00:00.000Z` });
}
assert.equal(saved.length, MAX_SAVED_WINE_DAYS);
const removedId = saved[0].id;
assert.equal(removeSavedWinePlan(saved, removedId).length, MAX_SAVED_WINE_DAYS - 1);

assert.equal(wineStopCountBucket(0), "0");
assert.equal(wineStopCountBucket(2), "1-2");
assert.equal(wineStopCountBucket(4), "3-4");
assert.equal(wineStopCountBucket(6), "5-6");
assert.equal(wineStopCountBucket(8), "7+");
assert.match(winePlanLabel(normalized, options), /Leelanau · 3 stops/);

class MemoryStorage {
  constructor(){ this.map = new Map(); }
  getItem(key){ return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value){ this.map.set(key, String(value)); }
}

const storage = new MemoryStorage();
assert.equal(writeLastWinePlan(storage, raw, options), true);
assert.deepEqual(readLastWinePlan(storage, options), normalized);
assert.equal(writeLocalWinePlans(storage, saved), true);
assert.equal(readLocalWinePlans(storage, options).length, MAX_SAVED_WINE_DAYS);

const [planner, analytics, css] = await Promise.all([
  readFile(new URL("../components/Planner.js", import.meta.url), "utf8"),
  readFile(new URL("../lib/wine-analytics.js", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

for (const token of [
  "Share exact plan",
  "Save to My Wine Day",
  "Resume last wine day",
  "readWinePlanFromHash",
  "writeLastWinePlan",
  'wine_plan_saved',
  'wine_plan_resumed',
  'wine_plan_shared',
]) {
  assert.ok(planner.includes(token), `Planner missing ${token}`);
}

for (const event of [
  "wine_plan_saved",
  "wine_plan_removed",
  "wine_plan_resumed",
  "wine_plan_shared",
  "wine_summary_copied",
]) {
  assert.ok(analytics.includes(event), `Analytics contract missing ${event}`);
}

assert.match(css, /\.my-wine-day-shell/);
assert.match(css, /\.my-wine-saved-list/);
assert.doesNotMatch(planner, /trackWineEvent\([^\n]*(venueName|selectedIds|selectedVenue|freeText|latitude|longitude)/i);

console.log("My Wine Day continuity checks passed.");

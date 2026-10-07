import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const venues = JSON.parse(await readFile(new URL("../data/venues.json", import.meta.url), "utf8"));
const truth = JSON.parse(await readFile(new URL("../data/wine-truth.json", import.meta.url), "utf8"));
const contract = await readFile(new URL("../lib/region-contract.js", import.meta.url), "utf8");
const route = await readFile(new URL("../app/api/region-contract/route.js", import.meta.url), "utf8");

const wineries = venues.filter((venue) => venue.category === "winery");
for (const area of ["old-mission", "leelanau"]) {
  const areaWineries = wineries.filter((venue) => venue.area === area);
  assert.ok(areaWineries.length >= 10, area + " must have production winery coverage");
  assert.ok(areaWineries.some((venue) => venue.officialTrail), area + " must retain official membership evidence");
}
assert.equal(truth.records.length, wineries.length, "truth records must reconcile with winery inventory");
assert.match(contract, /unknownHoursMeaning: "call-ahead \/ not verified, never treated as closed"/);
assert.match(contract, /buildWineDays\(\{ area, intent: normalizedIntent, date, addPlace: false \}\)/);
assert.match(contract, /wineryCount: list\.length/);
assert.match(contract, /knownHoursCount: knownHours\.length/);
assert.match(route, /X-Robots-Tag/);
assert.match(route, /buildRegionContract/);
console.log("region contract checks passed");

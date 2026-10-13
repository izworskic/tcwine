import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { decide, REGIONS } from "../lib/wine-region-choice.mjs";

const expectChoice = (base, priority, time, winner, alternate) => {
  const choice = decide(base, priority, time);
  assert.equal(choice.winner, winner, [base,priority,time].join(" / "));
  assert.equal(choice.alternate, alternate);
  assert.ok(choice.why.length > 40);
  assert.ok(choice.caution.length > 30);
  assert.ok(REGIONS[choice.winner].url.startsWith("https://"));
};
expectChoice("traverse-city","wine","short","old-mission","leelanau");
expectChoice("traverse-city","harbors","full","leelanau","old-mission");
expectChoice("traverse-city","sparkling","full","leelanau","old-mission");
expectChoice("leelanau","wine","full","leelanau","old-mission");
expectChoice("petoskey","wine","short","petoskey","leelanau");
expectChoice("petoskey","harbors","full","petoskey","leelanau");

const read = (p) => readFile(new URL("../" + p, import.meta.url), "utf8");
const [layout, home, component, footer] = await Promise.all([
  read("app/layout.js"),
  read("app/page.js"),
  read("components/WineRegionDecision.js"),
  read("components/WineNetworkFooter.js"),
]);
assert.match(layout, /WineNetworkFooter/);
assert.match(layout, /wine-v5.css/);
assert.match(home, /<WineRegionDecision/);
assert.match(component, /not live winery availability/);
assert.match(component, /unknown hours mean call ahead/i);
assert.match(footer, /We enjoy exploring Michigan wine country and visit often/);
assert.match(footer, /https:\/\/chrisizworski\.com\/chris-izworski\//);
console.log("Michigan wine V5 decision, origin gate, transparency and author checks passed.");

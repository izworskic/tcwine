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

const {evaluateWineWindow}=await import("../lib/wine-itinerary-gates.mjs");
const fixture=(id,hours,needsHours=false)=>({id,name:id,lat:44.88,lng:-85.5,dwellMinutes:45,hours,needsHours});
const open={Tuesday:{open:"10:00",close:"17:00"}};
const a=fixture("a",open),b=fixture("b",open),c=fixture("c",open);
const good=evaluateWineWindow({stops:[a,b,c],date:"2026-10-13",firstArrival:"11:00",hoursAvailable:4});
assert.equal(good.feasible,true);
assert.equal(good.state,"POSTED_HOURS_FIT");
assert.equal(good.schedule.length,3);
const unknown=evaluateWineWindow({stops:[a,fixture("unknown",{},true),c],date:"2026-10-13",hoursAvailable:5});
assert.equal(unknown.state,"CALL_AHEAD");
assert.equal(unknown.unknownHours,1);
const closed=evaluateWineWindow({stops:[a,fixture("closed",{Tuesday:{closed:true}}),c],date:"2026-10-13"});
assert.equal(closed.state,"CLOSED");
const late=evaluateWineWindow({stops:[a,b,c],date:"2026-10-13",firstArrival:"15:00"});
assert.equal(late.state,"HOURS_CONFLICT");
const short=evaluateWineWindow({stops:[a,b,c],date:"2026-10-13",hoursAvailable:1});
assert.equal(short.state,"TIME_CONFLICT");
console.log("V5 posted-hours, date, unknown-hours and duration tests passed.");

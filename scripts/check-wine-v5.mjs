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

const [story,sitemap,featureHome,leelanauPage,dayLoops,sparklingPage,footer2,storyStyles] = await Promise.all([
  read("app/leelanau-wine-weekend/page.js"), read("app/sitemap.js"), read("app/page.js"),
  read("app/leelanau-peninsula-wine-trail/page.js"), read("app/one-day-itineraries/page.js"),
  read("app/wine/[intent]/page.js"), read("components/WineNetworkFooter.js"), read("app/wine-v5.css"),
]);
assert.match(story,/MAWBY/);
assert.doesNotMatch(story,/\bMoby\b/i);
assert.match(story,/Good Harbor Beach/);
assert.match(story,/Bonobo Winery/);
assert.match(story,/Laurentide/);
assert.match(story,/Amoritas/);
assert.match(story,/Fiddleheads/);
assert.match(story,/Dick.*Pour House/);
assert.match(story,/Bone Dry/);
assert.match(story,/not four additional trips I claim to have taken/);
assert.match(story,/prohibits glass containers/);
assert.match(story,/https:\/\/chrisizworski\.com\/#person/);
assert.match(story,/\/winery\/mawby/);
assert.match(sitemap,/leelanau-wine-weekend/);
for(const [name,src] of [["home",featureHome],["region",leelanauPage],["itinerary",dayLoops],["wine style",sparklingPage],["footer",footer2]])assert.match(src,/leelanau-wine-weekend/,name);
assert.match(storyStyles,/wine-trip-variation-grid/);
assert.match(storyStyles,/max-width:700px/);
console.log("Firsthand Leelanau story, MAWBY spelling, park advice, shared person identity and six discovery surfaces passed.");

const [fieldNotes,stopLinks] = await Promise.all([
  read("app/winery/[id]/page.js"),read("app/leelanau-wine-weekend/page.js")
]);
for (const id of ["bonobo","mawby","laurentide-winery","amoritas-vineyards"]) {
  assert.ok(fieldNotes.includes(id), "Firsthand field note missing: "+id);
}
assert.match(fieldNotes,/leelanau-wine-weekend#/);
assert.match(stopLinks,/https:\/\/www\.dickspourhouse\.com\/menu/);
assert.match(stopLinks,/tel:\+12312569912/);
assert.match(stopLinks,/https:\/\/order\.toasttab\.com\/online\/fiddleheads/);
assert.match(stopLinks,/https:\/\/mawby\.wine\/visit\//);
assert.match(stopLinks,/https:\/\/www\.nps\.gov\/places\/000\/good-harbor-beach-651\.htm/);
assert.match(stopLinks,/exact identities were not established/);
assert.match(stopLinks,/https:\/\/www\.amoritasvineyards\.com\//);
console.log("Firsthand winery backlinks and verified business/park visit actions passed.");

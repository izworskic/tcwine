import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {planFoodDay,evaluateRouteLegs,itinerarySchedule,wineryHoursFit} from "../lib/food-day-planner.mjs";
const read=async name=>JSON.parse(await readFile(new URL("../"+name,import.meta.url),"utf8"));
const data=await read("data/food-offerings.json"),venues=await read("data/venues.json");
const origins=await read("data/origins.json");
const origin={...origins["Traverse City"],address:"Traverse City, MI"};
const args={data,venues,origin,region:"old-mission",partySize:2,windowMinutes:210,
  date:"2026-10-20",startTime:"12:00",asOf:"2026-10-13"};
const plan=planFoodDay(args);
assert.ok(plan.best,"3.5-hour couple outing should yield a sourced conditional lunch");
assert.equal(plan.bookingAvailability,"NOT_CHECKED");
assert.equal(plan.state,"CALL_TO_CONFIRM","No real kitchen and reservation availability confirmed");
assert.equal(plan.best.kind,"winery","Tuesday noon plan should favor winery with lunch over conflicting restaurant");
assert.equal(plan.best.locationId,"brys-estate");
assert.equal(plan.best.mealType,"SUBSTANTIAL");
assert.ok(plan.best.points.every(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lng)));
assert.equal(plan.best.points[0].lat,origin.lat);
assert.equal(plan.best.points.at(-1).lat,origin.lat);
assert.match(plan.best.drivingUrl,/google.com\/maps\/dir/);
assert.match(plan.best.reason,/confirm|unknown|timing/i);
assert.ok(plan.candidates.every(c=>["FULL_MEAL","SUBSTANTIAL"].includes(c.mealType)),
  "snacks cannot become lunch");
assert.ok(plan.candidates.every(c=>c.kind==="winery"||c.winery),
  "a restaurant-only trip cannot be marketed as a wine tour");
assert.ok(plan.candidates.every(c=>c.schedule.fits));
assert.ok(plan.candidates.every(c=>c.schedule.mealLeave!==null));
assert.ok(plan.candidates.every(c=>c.routeType==="PLANNING_ESTIMATE"));
assert.ok(plan.candidates.every(c=>c.fit!=="CANDIDATE"),
  "no source-backed full meal is automatically bookable");
const strictly=planFoodDay({...args,strictWinery:true});
assert.ok(strictly.candidates.every(c=>c.kind==="winery"));
assert.ok(!strictly.candidates.some(c=>c.locationId==="peninsula-grill"));
assert.equal(planFoodDay({...args,date:""}).state,"NEEDS_DATE_TIME");
assert.equal(planFoodDay({...args,startTime:""}).state,"NEEDS_DATE_TIME");
assert.equal(planFoodDay({...args,date:"2026-02-30"}).state,"NEEDS_DATE_TIME");
assert.equal(planFoodDay({...args,partySize:0}).state,"NEEDS_DATE_TIME");
assert.equal(planFoodDay({...args,windowMinutes:75}).state,"NEEDS_DATE_TIME");
assert.ok(planFoodDay({...args,windowMinutes:180}).candidates.length<=plan.candidates.length);
assert.ok(planFoodDay({...args,windowMinutes:240}).candidates.length>=plan.candidates.length);
assert.ok(!plan.candidates.some(x=>x.locationId==="bonobo"),
  "Bonobo small plates do not qualify for full lunch");
assert.ok(!plan.candidates.some(x=>x.locationId==="chateau-chantal"),
  "charcuterie not a full lunch");
assert.ok(!plan.candidates.some(x=>x.locationId==="jolly-pumpkin"&&x.fit==="CANDIDATE"));
const enormous=evaluateRouteLegs(plan.best,
  plan.best.points.slice(1).map(()=>({durationMin:100})),args);
assert.equal(enormous.state,"TIME_CONFLICT");
const zero=evaluateRouteLegs(plan.best,
  plan.best.points.slice(1).map(()=>({durationMin:3})),args);
assert.equal(zero.bookingAvailability,"NOT_CHECKED");
assert.ok(["CALL_TO_CONFIRM","PUBLISHED_SERVICE_FITS"].includes(zero.state));
assert.equal(evaluateRouteLegs(plan.best,[],args).state,"ROUTE_UNAVAILABLE");
assert.equal(itinerarySchedule([{lat:1,lng:2},{lat:2,lng:3},{lat:1,lng:2}],[15,15],720,210,null).mealArrive,"12:15");
assert.ok(!wineryHoursFit(venues.find(v=>v.id==="tabone"),"2026-10-20",800,45),
  "do not send visitors to Tuesday-closed tasting room");
assert.equal(plan.best.sourceVerifiedAt,"2026-10-13");
const files=await Promise.all([
  readFile(new URL("../app/traverse-city-wineries-with-food/page.js",import.meta.url),"utf8"),
  readFile(new URL("../components/FoodDayDecision.js",import.meta.url),"utf8"),
  readFile(new URL("../components/FoodDayMap.js",import.meta.url),"utf8"),
  readFile(new URL("../app/wine-v5.css",import.meta.url),"utf8")
]);
assert.match(files[0],/<FoodDayDecision/);
assert.doesNotMatch(files[0],/<PlannerMount/);
assert.match(files[1],/type="date"/);
assert.match(files[1],/type="time"/);
assert.match(files[1],/Check real-road drive/);
assert.match(files[1],/booking|reservation/i);
assert.match(files[2],/scrollWheelZoom:false/);
assert.match(files[2],/dashArray/);
assert.match(files[3],/\.wine-food-route-map/);
console.log("Food V7 day planner: source, hard-gate, route, 3–4h, tablet-map and progressive UI tests passed.");

// V8 coupling: winery-map handoff carries both the meal winery and any extra tasting.
assert.ok(plan.best.wineryIds.includes("brys-estate"));
assert.ok(plan.best.wineryIds.length<=2);
assert.ok(plan.candidates.every(x=>x.wineryIds.length<=2));
assert.equal(planFoodDay({...args,startTime:"23:45"}).state,"NO_VERIFIED_FULL_MEAL");
// A known conflicting source cannot outrank a less glamorous unconflicted lunch.
const trust=planFoodDay({...args,startTime:"12:00",asOf:"2026-10-21"});
assert.ok(!trust.best||trust.best.status!=="SOURCE_CONFLICT"||
  trust.candidates.every(c=>["SOURCE_STALE","SOURCE_CONFLICT"].includes(c.status)));
assert.ok(["RESEARCH_ONLY","CALL_TO_CONFIRM"].includes(trust.state));
const decision=await readFile(new URL("../components/FoodDayDecision.js",import.meta.url),"utf8");
assert.match(decision,/void checkRoad\(chosen\)/);
assert.match(decision,/AbortController/);
assert.match(decision,/routeRequestId|requestId/);
assert.match(decision,/buildWinePlanHash/);
assert.match(decision,/your meal, booking and its kitchen-hour verification are not transferred/);
assert.match(decision,/Copy plan & verification notes/);
console.log("V8 automatic road verification, honest handoff and late-hour safety checks passed.");

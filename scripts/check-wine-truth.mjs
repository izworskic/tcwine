import fs from "node:fs";

const venues=JSON.parse(fs.readFileSync(new URL("../data/venues.json",import.meta.url),"utf8"));
const truth=JSON.parse(fs.readFileSync(new URL("../data/wine-truth.json",import.meta.url),"utf8"));
const sitemap=fs.readFileSync(new URL("../app/sitemap.js",import.meta.url),"utf8");
const page=fs.readFileSync(new URL("../app/wine/[intent]/page.js",import.meta.url),"utf8");

const wineries=venues.filter(v=>v.category==="winery");
const records=truth.records||[];
const byId=new Map(records.map(r=>[r.id,r]));
const errors=[];

if(records.length!==wineries.length) errors.push(`truth records ${records.length} != winery count ${wineries.length}`);
for(const v of wineries){
  const r=byId.get(v.id);
  if(!r){errors.push(`missing truth record: ${v.id}`);continue;}
  if(!r.signature || r.signature.length<40) errors.push(`${v.id}: weak signature`);
  if(!Array.isArray(r.bestFor)||!r.bestFor.length) errors.push(`${v.id}: missing bestFor`);
  if(!Array.isArray(r.styleStrengths)) errors.push(`${v.id}: missing styleStrengths`);
  if(!(r.wineSignal>=2.5&&r.wineSignal<=5)) errors.push(`${v.id}: invalid wineSignal`);
  if(!r.verifiedAt) errors.push(`${v.id}: missing verifiedAt`);
}
const intents=["riesling","sparkling","reds","whites","serious-wine","first-trip"];
for(const i of intents){
  if(!sitemap.includes(`wine/${i}`)) errors.push(`sitemap missing wine/${i}`);
  if(!page.includes(`${i}`)) errors.push(`wine landing config missing ${i}`);
}
const coverage={
  riesling:records.filter(r=>r.bestFor.includes("riesling")).length,
  sparkling:records.filter(r=>r.bestFor.includes("sparkling")).length,
  reds:records.filter(r=>r.bestFor.includes("reds")).length,
  whites:records.filter(r=>r.bestFor.includes("whites")).length,
  food:records.filter(r=>r.bestFor.includes("food")).length,
  quiet:records.filter(r=>r.bestFor.includes("quiet")).length,
};
if(coverage.riesling<6) errors.push("Riesling coverage too shallow");
if(coverage.reds<8) errors.push("red-wine coverage too shallow");
if(coverage.whites<10) errors.push("white-wine coverage too shallow");
if(coverage.sparkling<5) errors.push("sparkling coverage too shallow");

if(errors.length){
  console.error("Wine truth validation failed:\n- "+errors.join("\n- "));
  process.exit(1);
}
console.log(JSON.stringify({wineries:wineries.length,truthRecords:records.length,coverage},null,2));

import fs from "node:fs";

const events=JSON.parse(fs.readFileSync(new URL("../data/wine-events.json",import.meta.url),"utf8"));
const sitemap=fs.readFileSync(new URL("../app/sitemap.js",import.meta.url),"utf8");
const home=fs.readFileSync(new URL("../app/page.js",import.meta.url),"utf8");
const eventPage=fs.readFileSync(new URL("../app/events/[id]/page.js",import.meta.url),"utf8");
const journalPage=fs.readFileSync(new URL("../app/my-wine-journal/page.js",import.meta.url),"utf8");
const journalLib=fs.readFileSync(new URL("../lib/wine-journal.js",import.meta.url),"utf8");
const journalCard=fs.readFileSync(new URL("../components/WineryJournalCard.js",import.meta.url),"utf8");
const analytics=fs.readFileSync(new URL("../lib/wine-analytics.js",import.meta.url),"utf8");

const errors=[];
const ids=new Set();

function validDate(value){
  return typeof value==="string" && !Number.isNaN(new Date(value).getTime());
}

for(const e of events.events||[]){
  if(!e.id || ids.has(e.id)) errors.push(`duplicate or missing event id: ${e.id||"(missing)"}`);
  ids.add(e.id);
  if(!e.title) errors.push(`${e.id}: missing title`);
  if(!e.summary || e.summary.length<50) errors.push(`${e.id}: shallow summary`);
  if(!e.planningTruth || e.planningTruth.length<60) errors.push(`${e.id}: missing planning truth`);
  if(!/^https:\/\//.test(e.sourceUrl||"")) errors.push(`${e.id}: missing https source`);
  if(!e.sourceLabel) errors.push(`${e.id}: missing source label`);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(e.verifiedAt||"")) errors.push(`${e.id}: invalid verifiedAt`);
  if(Array.isArray(e.dates)){
    if(!e.dates.length) errors.push(`${e.id}: empty recurring dates`);
    for(const d of e.dates) if(!validDate(d)) errors.push(`${e.id}: invalid recurring date ${d}`);
  } else {
    if(!validDate(e.start)) errors.push(`${e.id}: invalid start`);
    if(!validDate(e.end)) errors.push(`${e.id}: invalid end`);
    if(validDate(e.start)&&validDate(e.end)&&new Date(e.start)>new Date(e.end)) errors.push(`${e.id}: start after end`);
  }
}

if((events.events||[]).length<8) errors.push("wine-scene event coverage regressed below 8");
const harvest=(events.events||[]).find(e=>e.id==="lp-harvest-club-2026");
if(!harvest?.excludedWeekdays?.includes("Saturday")) errors.push("Harvest Club Saturday exclusion guard missing");
for(const required of ["hunt-reds-october-2026","toast-season-weekend-1-2026","toast-season-weekend-2-2026"]){
  if(!ids.has(required)) errors.push(`missing official fall trail event: ${required}`);
}
if(!(events.watches||[]).some(w=>w.id==="old-mission-mac-cheese-2026"&&w.status==="details-pending")) errors.push("Old Mission pending-details watch missing");

if(!sitemap.includes("wine-country-now")) errors.push("sitemap missing Wine Country Now");
if(!sitemap.includes("my-wine-journal")) errors.push("sitemap missing My Wine Journal");
if(!sitemap.includes("wineEventData.events.map")) errors.push("sitemap is not generating event pages");
if(!eventPage.includes("generateStaticParams")) errors.push("event detail pages are not statically generated");
if(!eventPage.includes("WineDayComposer")) errors.push("event page lost planner handoff");
if(!home.includes("WineCountryNow compact")) errors.push("home lost current wine-scene strip");
if(!journalPage.includes("WineJournalDashboard")) errors.push("journal dashboard page missing");
if(!journalLib.includes('tcwine:wine-journal:v1')) errors.push("journal storage key missing");
if(!journalCard.includes("Tasting notes are not sent with analytics")) errors.push("journal privacy statement missing");
if(!analytics.includes("wine_journal_saved")) errors.push("journal analytics registration missing");
if(/note\s*[:=]/i.test(analytics)) errors.push("analytics library must not capture tasting-note content");

if(errors.length){
  console.error("Wine scene validation failed:\n- "+errors.join("\n- "));
  process.exit(1);
}

console.log(JSON.stringify({
  verifiedAt:events.updated,
  events:events.events.length,
  watches:events.watches.length,
  journalOnDevice:true,
  eventPlannerHandoff:true
},null,2));

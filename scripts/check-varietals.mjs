import fs from "node:fs";

const venues=JSON.parse(fs.readFileSync(new URL("../data/venues.json",import.meta.url),"utf8"));
const sitemap=fs.readFileSync(new URL("../app/sitemap.js",import.meta.url),"utf8");
const page=fs.readFileSync(new URL("../app/wine/[intent]/page.js",import.meta.url),"utf8");
const engine=fs.readFileSync(new URL("../lib/wine-day-engine.js",import.meta.url),"utf8");
const wineryPage=fs.readFileSync(new URL("../app/winery/[id]/page.js",import.meta.url),"utf8");
const compare=fs.readFileSync(new URL("../components/WineryCompare.js",import.meta.url),"utf8");
const home=fs.readFileSync(new URL("../app/page.js",import.meta.url),"utf8");
const analytics=fs.readFileSync(new URL("../lib/wine-analytics.js",import.meta.url),"utf8");

const wineries=venues.filter(v=>v.category==="winery");
const verified=wineries.filter(v=>Array.isArray(v.varietals)&&v.varietals.length);
const errors=[];

const grapeRoutes={
  "cabernet-franc":{name:"Cabernet Franc",min:14},
  "pinot-noir":{name:"Pinot Noir",min:17},
  "chardonnay":{name:"Chardonnay",min:18},
  "sauvignon-blanc":{name:"Sauvignon Blanc",min:9},
  "gewurztraminer":{name:"Gewürztraminer",min:14},
  "merlot":{name:"Merlot",min:15},
  "pinot-gris":{name:"Pinot Gris",min:16},
};

if(verified.length<18) errors.push(`verified varietal winery coverage regressed: ${verified.length}`);

for(const v of verified){
  if(!/^https:\/\//.test(v.varietalsSourceUrl||"")) errors.push(`${v.id}: missing varietal source URL`);
  if(!v.varietalsSourceLabel) errors.push(`${v.id}: missing varietal source label`);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(v.varietalsVerifiedAt||"")) errors.push(`${v.id}: invalid varietal verification date`);
  if(!Array.isArray(v.varietals)||v.varietals.length<4) errors.push(`${v.id}: varietal list unexpectedly shallow`);
}

for(const [slug,cfg] of Object.entries(grapeRoutes)){
  const count=verified.filter(v=>v.varietals.includes(cfg.name)).length;
  if(count<cfg.min) errors.push(`${cfg.name} verified coverage regressed: ${count} < ${cfg.min}`);
  if(!sitemap.includes(`wine/${slug}`)) errors.push(`sitemap missing wine/${slug}`);
  if(!page.includes(`"${slug}"`)) errors.push(`wine landing missing ${slug}`);
  if(!engine.includes(`"${slug}": {`)) errors.push(`engine missing ${slug} intent`);
  if(!home.includes(`/wine/${slug}`)) errors.push(`home missing ${slug} discovery link`);
  if(!analytics.includes(`/wine/${slug}`)) errors.push(`analytics missing ${slug} landing key`);
}

if(!wineryPage.includes("Verified varietals")) errors.push("winery guide lost verified varietal presentation");
if(!wineryPage.includes("varietalsSourceUrl")) errors.push("winery guide lost varietal source citation");
if(!compare.includes("Verified varietals / styles")) errors.push("comparator lost verified varietal comparison");
if(!page.includes("winery-level")) errors.push("grape pages lost producer-level evidence explanation");

if(errors.length){
  console.error("Varietal truth validation failed:\n- "+errors.join("\n- "));
  process.exit(1);
}

const counts=Object.fromEntries(Object.entries(grapeRoutes).map(([slug,cfg])=>[
  slug,
  verified.filter(v=>v.varietals.includes(cfg.name)).length
]));
counts.riesling=verified.filter(v=>v.varietals.includes("Riesling")).length;

console.log(JSON.stringify({
  wineries:wineries.length,
  verifiedVarietalWineries:verified.length,
  counts,
  sourceLabels:[...new Set(verified.map(v=>v.varietalsSourceLabel))]
},null,2));

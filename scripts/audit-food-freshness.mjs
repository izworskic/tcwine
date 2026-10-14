import {readFile} from "node:fs/promises";
// Weekly source-review watchdog; does not fetch or claim live reservation truth.
// No Vercel build, Redis, external API or change to evidence verification dates.
const data=JSON.parse(await readFile(new URL("../data/food-offerings.json",import.meta.url),"utf8"));
const override=process.argv.find(x=>x.startsWith("--as-of="))?.slice(8);
const asOf=override||new Date().toISOString().slice(0,10);
const valid=d=>typeof d==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&
  new Date(d+"T12:00:00Z").toISOString().slice(0,10)===d;
if(!valid(asOf)){console.error("Invalid audit date");process.exit(2)}
const expired=[],conflicts=[],forthcoming=[];
for(const location of data.locations){
  for(const service of location.services){
    const line={venue:location.name,service:service.serviceId,
      reviewed:service.verifiedAt,due:service.reviewDue,source:service.sourceUrl};
    if(asOf>service.reviewDue)expired.push(line);
    else if(service.reviewDue<=new Date(Date.parse(asOf+"T12:00:00Z")+7*86400000).toISOString().slice(0,10))
      forthcoming.push(line);
    if(service.conflicts?.length)conflicts.push({...line,details:service.conflicts.map(x=>x.reason).join(" ")});
  }
}
console.log(JSON.stringify({asOf,reviewedLocations:data.locations.length,
  separateServices:data.locations.reduce((n,l)=>n+l.services.length,0),
  expired,forthcoming,unresolvedConflicts:conflicts},null,2));
if(expired.length) {
 console.error("Food truth review deadlines expired. Human/operator verification required; do NOT refresh dates automatically.");
 process.exitCode=1;
}
